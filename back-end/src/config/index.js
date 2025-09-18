const path = require('path');
const dotenv = require('dotenv');

// 根据环境加载对应的.env文件
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../../.env.${env}`) });

// 导出统一配置
module.exports = {
  env,
  app: {
    port: process.env.PORT || 3001,
    noteDir: process.env.NOTE_DIR || path.join(process.env.HOME || process.env.USERPROFILE, 'Documents', 'Notes'),
    allowedDirs: [
      process.env.NOTE_DIR || path.join(process.env.HOME || process.env.USERPROFILE, 'Documents', 'Notes'),
      path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop')
    ]
  },
  database: {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || '5432',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '123456',
    database: process.env.PG_DATABASE || 'todo_db',
    max: 10,
    idleTimeoutMillis: 30000
  },
  api: {
    githubToken: process.env.GITHUB_TOKEN,
    npmDownloadPeriod: process.env.NPM_DOWNLOAD_PERIOD || 'last-week'
  },
  proxy: {
    httpProxy: process.env.HTTP_PROXY,
    httpsProxy: process.env.HTTPS_PROXY
  }
};