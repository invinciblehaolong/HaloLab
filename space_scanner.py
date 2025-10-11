"""Optimized FOFA & Quake scanning utility.

This module refactors the original single-threaded implementation to
speed up target processing, reduce duplicated logic, and provide richer
results for analysts.  Key improvements include:

* Thread-pooled querying with per-API rate limiting to keep requests fast
  while respecting upstream throttling limits.
* Connection pooling through ``requests.Session`` for both FOFA and Quake
  APIs.
* Centralised retry and failure tracking logic shared by both APIs.
* Normalised result handling that captures consistent metadata for easier
  analysis and Excel export.
* Additional summary information (per-source, per-target type, top ports,
  and busiest hosts) saved alongside raw results for a more helpful output
  file.
* Simplified Excel export that avoids generating dozens of sheets, greatly
  reducing time spent writing to disk.
"""

from __future__ import annotations

import base64
import ipaddress
import json
import logging
import os
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Sequence, Tuple
from urllib.parse import urlparse

import pandas as pd
import requests

# ----------------------------------------------------------------------------
# Logging configuration
# ----------------------------------------------------------------------------
LOG_LEVEL = os.getenv("SCANNER_LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("api_query.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------------
# Data models & helpers
# ----------------------------------------------------------------------------
@dataclass(frozen=True)
class Target:
    """Represents an entity to scan."""

    value: str
    target_type: str  # "ip", "domain", "subdomain", "c_segment"


@dataclass
class ScannerConfig:
    """Configuration for the scanner."""

    fofa_email: str
    fofa_key: str
    quake_api_key: str
    input_file: str = "dist5.xlsx"
    output_file: str = "output.xlsx"
    max_workers: int = max(os.cpu_count() or 4, 4)
    api_delay: float = 1.0
    max_retries: int = 3
    retry_delay: float = 5.0
    max_api_failures: int = 5


class RateLimiter:
    """Thread-safe rate limiter for API calls."""

    def __init__(self, min_interval: float) -> None:
        self._interval = max(min_interval, 0.0)
        self._lock = threading.Lock()
        self._next_time = 0.0

    def wait(self) -> None:
        if self._interval <= 0:
            return
        with self._lock:
            now = time.perf_counter()
            wait_time = self._next_time - now
            if wait_time > 0:
                time.sleep(wait_time)
            self._next_time = time.perf_counter() + self._interval


# ----------------------------------------------------------------------------
# Parsing helpers
# ----------------------------------------------------------------------------
CIDR_PATTERN = re.compile(r"^\d+\.\d+\.\d+\.\d+/\d+$")
IP_RANGE_PATTERN = re.compile(r"^\d+\.\d+\.\d+\.\d+-\d+\.\d+\.\d+\.\d+$")
IP_SUFFIX_RANGE_PATTERN = re.compile(r"^\d+\.\d+\.\d+\.\d+-\d+$")
SUBDOMAIN_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
DOMAIN_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}(?:\.[a-zA-Z0-9-]{1,63})+\.[a-zA-Z]{2,}$")
C_SEGMENT_PATTERN = re.compile(r"^\d+\.\d+\.\d+\.0(?:/24)?$")


def is_valid_ip(value: str) -> bool:
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        if value.isdigit():
            try:
                ipaddress.ip_address(int(value))
                return True
            except ValueError:
                return False
        return False


def normalise_ip(value: str) -> Optional[str]:
    if value.isdigit():
        try:
            return str(ipaddress.IPv4Address(int(value)))
        except ValueError:
            return None
    if is_valid_ip(value):
        return str(ipaddress.ip_address(value))
    return None


def is_valid_domain(value: str) -> bool:
    return bool(DOMAIN_PATTERN.match(value))


def is_valid_subdomain(value: str) -> bool:
    return bool(SUBDOMAIN_PATTERN.match(value))


def is_valid_c_segment(value: str) -> bool:
    if "/" in value:
        try:
            network = ipaddress.IPv4Network(value, strict=False)
            return network.prefixlen == 24
        except ValueError:
            return False
    return bool(C_SEGMENT_PATTERN.match(value))


def parse_ip_range(value: str) -> List[str]:
    if value.isdigit():
        normalised = normalise_ip(value)
        return [normalised] if normalised else []

    if is_valid_ip(value):
        return [normalise_ip(value)]

    if value.count("-") == 1 and IP_RANGE_PATTERN.match(value):
        start_str, end_str = value.split("-")
        start, end = ipaddress.IPv4Address(start_str), ipaddress.IPv4Address(end_str)
        if int(end) < int(start):
            return []
        return [str(ipaddress.IPv4Address(idx)) for idx in range(int(start), int(end) + 1)]

    if value.count("-") == 1 and IP_SUFFIX_RANGE_PATTERN.match(value):
        base, suffix_end = value.split("-")
        octets = base.split(".")
        prefix = ".".join(octets[:3])
        start_octet = int(octets[3])
        end_octet = int(suffix_end)
        if end_octet < start_octet:
            return []
        return [f"{prefix}.{idx}" for idx in range(start_octet, end_octet + 1)]

    if CIDR_PATTERN.match(value):
        try:
            network = ipaddress.IPv4Network(value, strict=False)
            return [str(ip) for ip in network.hosts()]
        except ValueError:
            return []

    if is_valid_c_segment(value):
        cidr = value if "/" in value else f"{value}/24"
        network = ipaddress.IPv4Network(cidr, strict=False)
        return [str(ip) for ip in network.hosts()]

    return []


def extract_domain_from_url(value: str) -> Optional[str]:
    parsed = urlparse(value)
    return parsed.netloc or None


# ----------------------------------------------------------------------------
# Scanner implementation
# ----------------------------------------------------------------------------
class SpaceScanner:
    def __init__(self, config: ScannerConfig) -> None:
        self.config = config
        self.fofa_session = requests.Session()
        self.quake_session = requests.Session()
        self.fofa_rate_limiter = RateLimiter(config.api_delay)
        self.quake_rate_limiter = RateLimiter(config.api_delay)
        self.failures: Dict[str, int] = {"fofa": 0, "quake": 0}
        self.results: List[Dict[str, object]] = []
        self._result_lock = threading.Lock()
        self._query_cache: Dict[Tuple[str, str], List[object]] = {}

    # ------------------------------------------------------------------
    # Input processing
    # ------------------------------------------------------------------
    def read_targets(self) -> Tuple[List[Target], pd.DataFrame]:
        logger.info("Reading input file: %s", self.config.input_file)
        try:
            df = pd.read_excel(self.config.input_file)
        except FileNotFoundError:
            logger.error("Input file %s not found", self.config.input_file)
            raise

        raw_values = (
            df.iloc[:, 0]
            .dropna()
            .astype(str)
            .map(str.strip)
            .replace(r"\(\d+\)$", "", regex=True)
            .tolist()
        )

        targets: List[Target] = []
        records: List[Dict[str, object]] = []

        for original in raw_values:
            normalised_value = original
            classification = "unrecognised"
            parsed_ips: List[str] = []

            if normalised_value.startswith(("http://", "https://")):
                domain = extract_domain_from_url(normalised_value)
                if domain and is_valid_domain(domain):
                    normalised_value = domain
                else:
                    records.append(
                        {
                            "original": original,
                            "processed": normalised_value,
                            "classification": classification,
                        }
                    )
                    continue

            ip_candidate = normalise_ip(normalised_value)
            if ip_candidate:
                targets.append(Target(ip_candidate, "ip"))
                classification = "ip"
            elif "-" in normalised_value or "/" in normalised_value:
                parsed_ips = parse_ip_range(normalised_value)
                if parsed_ips:
                    targets.extend(Target(ip, "ip") for ip in parsed_ips)
                    classification = "ip_range"
                elif is_valid_c_segment(normalised_value):
                    cidr = normalised_value if "/" in normalised_value else f"{normalised_value}/24"
                    targets.append(Target(cidr, "c_segment"))
                    classification = "c_segment"
            elif is_valid_c_segment(normalised_value):
                cidr = (
                    normalised_value
                    if "/" in normalised_value
                    else f"{normalised_value}/24"
                )
                targets.append(Target(cidr, "c_segment"))
                classification = "c_segment"
            elif is_valid_subdomain(normalised_value):
                targets.append(Target(normalised_value, "subdomain"))
                classification = "subdomain"
            elif is_valid_domain(normalised_value):
                targets.append(Target(normalised_value, "domain"))
                classification = "domain"

            records.append(
                {
                    "original": original,
                    "processed": normalised_value,
                    "classification": classification,
                    "expanded_count": len(parsed_ips) if parsed_ips else 1,
                }
            )

        classification_df = pd.DataFrame(records)
        return targets, classification_df

    # ------------------------------------------------------------------
    # Query orchestration
    # ------------------------------------------------------------------
    def run(self) -> None:
        targets, classification_df = self.read_targets()
        if classification_df.empty:
            logger.warning("No valid targets discovered. Nothing to do.")
            return

        unique_targets = list(dict.fromkeys(targets))
        logger.info("Identified %d unique targets", len(unique_targets))

        if not unique_targets:
            logger.warning("No targets after de-duplication.")
            return

        self._persist_classification(classification_df)

        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            futures = {executor.submit(self._query_target, target): target for target in unique_targets}
            for idx, future in enumerate(as_completed(futures), 1):
                target = futures[future]
                try:
                    future.result()
                except Exception as exc:  # pragma: no cover - defensive logging
                    logger.exception("Error while querying %s: %s", target, exc)
                if idx % 10 == 0 or idx == len(futures):
                    logger.info("Processed %d/%d targets", idx, len(futures))

        if not self.results:
            logger.warning("No data returned from APIs")
            return

        deduplicated = self._deduplicate_results()
        logger.info("%d unique services discovered", len(deduplicated))
        self._save_results(deduplicated)

    # ------------------------------------------------------------------
    # Classification persistence
    # ------------------------------------------------------------------
    @staticmethod
    def _persist_classification(classification_df: pd.DataFrame) -> None:
        output_path = "input_classification.xlsx"
        try:
            classification_df.to_excel(output_path, index=False)
            logger.info("Saved classification breakdown to %s", output_path)
        except Exception:
            logger.exception("Failed to persist classification results")

    # ------------------------------------------------------------------
    # API querying
    # ------------------------------------------------------------------
    def _query_target(self, target: Target) -> None:
        logger.debug("Querying target %s (%s)", target.value, target.target_type)
        fofa_query = self._build_query("fofa", target)
        quake_query = self._build_query("quake", target)

        fofa_results = self._query_api("fofa", fofa_query, self._perform_fofa_request)
        quake_results = self._query_api("quake", quake_query, self._perform_quake_request)

        normalised = self._normalise_results(target, fofa_results + quake_results)
        if not normalised:
            logger.debug("No results for target %s", target)
            return

        with self._result_lock:
            self.results.extend(normalised)

    def _query_api(
        self,
        api_name: str,
        query: Optional[str],
        requester,
    ) -> List[object]:
        if not query:
            return []

        cache_key = (api_name, query)
        if cache_key in self._query_cache:
            return self._query_cache[cache_key]

        if self.failures[api_name] >= self.config.max_api_failures:
            logger.warning("%s API disabled due to repeated failures", api_name.upper())
            return []

        results: List[object] = []
        for attempt in range(1, self.config.max_retries + 2):
            try:
                if api_name == "fofa":
                    self.fofa_rate_limiter.wait()
                else:
                    self.quake_rate_limiter.wait()
                results = requester(query)
                self.failures[api_name] = 0
                break
            except requests.RequestException as exc:
                self.failures[api_name] += 1
                logger.warning(
                    "%s API request failed (attempt %d/%d): %s",
                    api_name.upper(),
                    attempt,
                    self.config.max_retries + 1,
                    exc,
                )
                if attempt > self.config.max_retries:
                    break
                time.sleep(self.config.retry_delay)
        else:
            logger.error("Exceeded retry budget for %s", api_name.upper())

        self._query_cache[cache_key] = results
        return results

    # ------------------------------------------------------------------
    # Query builders
    # ------------------------------------------------------------------
    @staticmethod
    def _build_query(api_name: str, target: Target) -> Optional[str]:
        if target.target_type == "ip":
            return f"status_code=200 && ip{'=' if api_name == 'fofa' else ':'}\"{target.value}\""
        if target.target_type == "domain":
            return f"status_code=200 && domain{'=' if api_name == 'fofa' else ':'}\"{target.value}\""
        if target.target_type == "subdomain":
            if api_name == "fofa":
                return (
                    "status_code=200 && (domain=\"{0}\" || domain=\"*{0}\")".format(
                        target.value
                    )
                )
            return (
                "status_code=200 && (domain:\"{0}\" || domain:\"*.{0}\")".format(
                    target.value
                )
            )
        if target.target_type == "c_segment":
            return f"status_code=200 && ip{'=' if api_name == 'fofa' else ':'}\"{target.value}\""
        logger.error("Unknown target type: %s", target.target_type)
        return None

    # ------------------------------------------------------------------
    # Raw API calls
    # ------------------------------------------------------------------
    def _perform_fofa_request(self, query: str) -> List[object]:
        encoded_query = base64.b64encode(query.encode("utf-8")).decode("utf-8")
        params = {
            "email": self.config.fofa_email,
            "key": self.config.fofa_key,
            "qbase64": encoded_query,
            "page": 1,
            "size": 100,
            "fields": "host,ip,domain,port,protocol,title,server,banner,cert,header,body",
        }
        response = self.fofa_session.get(
            "https://fofa.info/api/v1/search/all", params=params, timeout=30
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("error"):
            message = payload.get("errmsg", "Unknown FOFA error")
            raise requests.RequestException(message)
        return payload.get("results", [])

    def _perform_quake_request(self, query: str) -> List[object]:
        headers = {
            "X-QuakeToken": self.config.quake_api_key,
            "Content-Type": "application/json",
        }
        body = {
            "query": query,
            "start": 0,
            "size": 100,
            "ignore_cache": False,
            "latest": True,
            "fields": "service.http.title,service.http.host,service.http.server,service.name,"
            "service.http.status_code,service.cert,service.version,service.http.body,ip,port,domain,"
            "transport,service.http.favicon.hash,service.http.favicon.data,service.http.response",
        }
        response = self.quake_session.post(
            "https://quake.360.net/api/v3/search/quake_service", json=body, headers=headers, timeout=30
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("code") != 0:
            message = payload.get("message", "Unknown Quake error")
            raise requests.RequestException(message)
        return payload.get("data", [])

    # ------------------------------------------------------------------
    # Result normalisation
    # ------------------------------------------------------------------
    def _normalise_results(
        self, target: Target, raw_results: Sequence[object]
    ) -> List[Dict[str, object]]:
        normalised: List[Dict[str, object]] = []
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        for item in raw_results:
            if isinstance(item, dict):
                source = item.get("source") or "quake"
            else:
                source = "fofa"

            if source == "fofa":
                normalised_item = self._normalise_fofa_result(target, item, timestamp)
            else:
                normalised_item = self._normalise_quake_result(target, item, timestamp)

            if normalised_item:
                normalised.append(normalised_item)

        return normalised

    @staticmethod
    def _root_domain(domain: Optional[str]) -> Optional[str]:
        if not domain:
            return None
        parts = domain.split(".")
        if len(parts) < 2:
            return None
        return ".".join(parts[-2:])

    @staticmethod
    def _split_domain(domain: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        root = SpaceScanner._root_domain(domain)
        if not domain or not root or domain == root:
            return root, None
        return root, domain[: -len(root) - 1]

    def _normalise_fofa_result(
        self, target: Target, item: Sequence[object], timestamp: str
    ) -> Optional[Dict[str, object]]:
        if not isinstance(item, (list, tuple)) or len(item) < 6:
            return None

        (
            host,
            ip,
            domain,
            port,
            protocol,
            title,
            server,
            banner,
            cert_raw,
            headers,
            body,
            *_rest,
        ) = list(item) + [None] * (11 - len(item))

        if not host or not protocol:
            return None

        url = f"{protocol}://{host}"
        if port and port not in (80, 443):
            url = f"{url}:{port}"

        cert_subject = ""
        root_domain, subdomain = self._split_domain(domain)
        if cert_raw:
            try:
                cert_data = json.loads(cert_raw) if isinstance(cert_raw, str) else cert_raw
                cert_subject = json.dumps(cert_data.get("subject", {}), ensure_ascii=False)
            except (json.JSONDecodeError, TypeError):
                cert_subject = ""

        return {
            "source": "fofa",
            "original_target": target.value,
            "target_type": target.target_type,
            "ip": ip,
            "domain": domain,
            "root_domain": root_domain,
            "subdomain": subdomain,
            "port": port,
            "protocol": protocol,
            "url": url,
            "title": title,
            "server": server,
            "status_code": 200,
            "banner": banner,
            "headers": headers,
            "body_length": len(body) if body else 0,
            "cert_subject": cert_subject,
            "query_time": timestamp,
            "has_https": protocol == "https",
        }

    def _normalise_quake_result(
        self, target: Target, item: Dict[str, object], timestamp: str
    ) -> Optional[Dict[str, object]]:
        ip = item.get("ip")
        port = item.get("port")
        domain = item.get("domain")
        transport = item.get("transport", "tcp")
        service = item.get("service", {}) or {}
        protocol = (service.get("name") or "http").lower()
        http_info = service.get("http", {}) or {}
        status_code = http_info.get("status_code")

        if status_code and status_code != 200:
            return None

        host = domain or http_info.get("host") or ip
        if not host:
            return None

        if transport == "tcp" and protocol not in {"http", "https"}:
            protocol = "https" if port == 443 else "http"

        url = f"{protocol}://{host}"
        if port and port not in (80, 443):
            url = f"{url}:{port}"

        cert_subject = ""
        root_domain, subdomain = self._split_domain(domain)
        cert_info = service.get("cert") or {}
        if cert_info:
            cert_subject = json.dumps(cert_info.get("subject", {}), ensure_ascii=False)

        body = http_info.get("body") or http_info.get("response")
        body_length = len(body) if body else 0

        return {
            "source": "quake",
            "original_target": target.value,
            "target_type": target.target_type,
            "ip": ip,
            "domain": domain,
            "root_domain": root_domain,
            "subdomain": subdomain,
            "port": port,
            "protocol": protocol,
            "url": url,
            "title": http_info.get("title"),
            "server": http_info.get("server"),
            "status_code": status_code or 200,
            "banner": service.get("name"),
            "headers": http_info.get("response"),
            "body_length": body_length,
            "cert_subject": cert_subject,
            "query_time": timestamp,
            "has_https": protocol == "https",
        }

    # ------------------------------------------------------------------
    # Post-processing & export
    # ------------------------------------------------------------------
    def _deduplicate_results(self) -> List[Dict[str, object]]:
        seen: set = set()
        deduped: List[Dict[str, object]] = []
        for item in self.results:
            key = (item.get("url"), item.get("ip"))
            if key in seen:
                continue
            seen.add(key)
            deduped.append(item)
        self.results = deduped
        return deduped

    def _save_results(self, deduplicated: List[Dict[str, object]]) -> None:
        df = pd.DataFrame(deduplicated)
        summary_frames = self._build_summary_frames(df)

        try:
            with pd.ExcelWriter(self.config.output_file) as writer:
                df.sort_values(["source", "target_type", "ip", "port"], na_position="last").to_excel(
                    writer, sheet_name="results", index=False
                )
                start_row = 0
                for _, frame in summary_frames.items():
                    frame.to_excel(writer, sheet_name="summary", startrow=start_row, index=False)
                    start_row += len(frame) + 2
            logger.info("Results written to %s", self.config.output_file)
        except Exception:
            logger.exception("Failed to write Excel output")

    @staticmethod
    def _build_summary_frames(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
        frames: Dict[str, pd.DataFrame] = {}
        frames["Overview"] = pd.DataFrame(
            {
                "metric": ["total_results", "unique_ips", "unique_domains"],
                "value": [
                    len(df),
                    df["ip"].nunique(dropna=True),
                    df["domain"].nunique(dropna=True),
                ],
            }
        )

        frames["By Source"] = (
            df.groupby("source")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
        )

        frames["By Target Type"] = (
            df.groupby("target_type")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
        )

        frames["Top Ports"] = (
            df["port"].dropna()
            .value_counts()
            .reset_index()
            .rename(columns={"index": "port", "port": "count"})
            .head(20)
        )

        frames["Top Hosts"] = (
            df.groupby("original_target")
            .size()
            .reset_index(name="result_count")
            .sort_values("result_count", ascending=False)
            .head(20)
        )

        for label, frame in frames.items():
            frame.insert(0, "section", label)

        return frames


# ----------------------------------------------------------------------------
# Entrypoint
# ----------------------------------------------------------------------------
def main() -> None:
    config = ScannerConfig(
        fofa_email=os.getenv("FOFA_EMAIL", "1455705873@qq.com"),
        fofa_key=os.getenv("FOFA_KEY", "2463ba34580b7509dccf5dc19c73a7e2"),
        quake_api_key=os.getenv("QUAKE_API_KEY", "c08bc3ef-f75b-40d9-86e8-2d13109c7980"),
    )

    logger.info("Starting space scanner with %d workers", config.max_workers)
    scanner = SpaceScanner(config)
    scanner.run()


if __name__ == "__main__":
    main()
