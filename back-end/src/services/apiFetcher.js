const axios = require('axios');

// 配置项
const CONFIG = {
  timeout: 15000 // 超时时间15秒
};

// 初始化 axios 实例
const axiosInstance = axios.create({
  timeout: CONFIG.timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    'Accept': 'application/json'
  },
  responseType: 'json'
});

/**
 * 统一错误处理函数
 */
function handleError(err, type) {
  if (err.code === 'ECONNABORTED') {
    throw new Error(`${type} - 请求超时（超过 ${CONFIG.timeout/1000} 秒）`);
  } else if (err.response) {
    throw new Error(`${type} - API 响应错误（状态码：${err.response.status}）`);
  } else if (err.code === 'ENOTFOUND') {
    throw new Error(`${type} - 域名解析失败，请检查网络`);
  } else if (err.message.includes('TLS')) {
    throw new Error(`${type} - TLS 连接失败，请检查代理配置`);
  } else {
    throw new Error(`${type} - 错误：${err.message}`);
  }
}

/**
 * 获取 GitHub 仓库 Stars 数量
 * @param {string} repo - GitHub 仓库路径（格式：owner/repo）
 * @returns {Promise<number>} Star 数量（原始数字，用于数据库存储）
 */
async function fetchGithubStar(repo) {
  try {
    if (!repo) {
      throw new Error('GitHub 仓库路径不能为空');
    }
    const githubApi = `https://api.github.com/repos/${repo}`;
    const response = await axiosInstance.get(githubApi);
    return Number(response.data.stargazers_count) || 0;
  } catch (err) {
    handleError(err, 'GitHub Stars');
  }
}

/**
 * 获取 NPM 包近7天下载量
 * @param {string} pkg - NPM 包名
 * @returns {Promise<number>} 下载量（原始数字，用于数据库存储）
 */
async function fetchNpmDownloads(pkg) {
  try {
    if (!pkg) {
      throw new Error('NPM 包名不能为空');
    }
    const npmApi = `https://api.npmjs.org/downloads/point/last-week/${pkg}`;
    const response = await axiosInstance.get(npmApi);
    return Number(response.data.downloads) || 0;
  } catch (err) {
    handleError(err, 'NPM 下载量');
  }
}

module.exports = {
  fetchGithubStar,
  fetchNpmDownloads
};