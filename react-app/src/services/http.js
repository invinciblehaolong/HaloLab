// src/services/http.js
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
  timeout: 20000,
});

// 统一请求拦截（可加入全局 token 注入）
http.interceptors.request.use((config) => {
  // 例：若你改为 Token 模式，可在此注入 Authorization
  // const token = localStorage.getItem("accessToken");
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 统一响应拦截与错误格式
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const resp = err.response;
    const message =
      resp?.data?.message ||
      resp?.statusText ||
      err.message ||
      "Network Error";
    return Promise.reject({ message, status: resp?.status || 0, raw: err });
  }
);

export default http;
