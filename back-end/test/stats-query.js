// 引入 axios 库
const axios = require('axios');

/**
 * 配置项：仅包含需要查询的框架信息
 * 不手动配置代理，完全依赖系统环境变量
 */
const CONFIG = {
  frameworks: [
    { name: "React", githubRepo: "facebook/react", npmPackage: "react" },
    { name: "Vue", githubRepo: "vuejs/vue", npmPackage: "vue" },
    { name: "Svelte", githubRepo: "sveltejs/svelte", npmPackage: "svelte" },
    { name: "SolidJS", githubRepo: "solidjs/solid", npmPackage: "solid-js" }
  ],
  timeout: 15000 // 超时时间15秒
};

/**
 * 初始化 axios 实例：不手动配置代理
 * 完全依赖系统环境变量 http_proxy 和 https_proxy
 */
const axiosInstance = axios.create({
  timeout: CONFIG.timeout,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    'Accept': 'application/json'
  },
  responseType: 'json'
});

/**
 * 获取 GitHub 仓库 Stars 数量
 */
async function getGithubStars(repo) {
  try {
    const githubApi = `https://api.github.com/repos/${repo}`;
    const response = await axiosInstance.get(githubApi);
    return response.data.stargazers_count;
  } catch (err) {
    handleError(err, 'GitHub Stars');
  }
}

/**
 * 获取 NPM 包近7天下载量
 */
async function getNpmDownloads(pkg) {
  try {
    const npmApi = `https://api.npmjs.org/downloads/point/last-week/${pkg}`;
    const response = await axiosInstance.get(npmApi);
    return response.data.downloads;
  } catch (err) {
    handleError(err, 'NPM 下载量');
  }
}

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
 * 获取单个框架的统计数据
 */
async function getFrameworkStats(framework) {
  try {
    const [stars, downloads] = await Promise.all([
      getGithubStars(framework.githubRepo),
      getNpmDownloads(framework.npmPackage)
    ]);
    return {
      name: framework.name,
      stars: stars.toLocaleString(),
      downloads: downloads.toLocaleString()
    };
  } catch (err) {
    console.error(`❌ ${framework.name} 失败：${err.message}`);
    return {
      name: framework.name,
      stars: '获取失败',
      downloads: '获取失败'
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 前端框架统计查询 ===');
  console.log('使用系统代理环境变量配置');
  console.log(`当前 http_proxy: ${process.env.http_proxy || '未设置'}`);
  console.log(`当前 https_proxy: ${process.env.https_proxy || '未设置'}`);
  console.log('查询目标：React、Vue、Svelte、SolidJS\n');

  const allStats = await Promise.all(
    CONFIG.frameworks.map(framework => getFrameworkStats(framework))
  );

  console.log('查询结果：');
  console.log('-' + '-'.repeat(50));
  console.log(`${'框架名'.padEnd(10)} | ${'GitHub Stars'.padEnd(15)} | 近7天NPM下载量`);
  console.log('-' + '-'.repeat(50));
  allStats.forEach(stat => {
    console.log(
      `${stat.name.padEnd(10)} | ${stat.stars.padEnd(15)} | ${stat.downloads}`
    );
  });
  console.log('-' + '-'.repeat(50) + '\n');
  console.log('=== 查询结束 ===');
}

// 启动脚本
main();
