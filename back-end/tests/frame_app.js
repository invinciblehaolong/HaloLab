const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 导入路由
const frameRoutes = require('../src/routes/frameRoutes');
const noteRoutes = require('../src/routes/noteRoutes');  // 重命名避免变量名与路由路径冲突
const gachaRoutes = require('../src/routes/gachaRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件：允许跨域（前端通常在不同端口，如 3000）
app.use(cors());
app.use(express.json());    // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }));

// 调整路由挂载顺序，更具体的路由放在前面
app.use('/api/gacha', gachaRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api', frameRoutes);               // 通用路由最后挂载

// 根路由
app.get('/', (req, res) => {
  res.send('frame_app.API服务正在运行');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

async function startServer() {
  // 启动服务
  app.listen(PORT, () => {
    console.log(`Express 服务已启动，端口：${PORT}`);
    console.log(`API基础地址：http://localhost:${PORT}/api`);
    console.log(`可用接口：`);
    console.log(`- http://localhost:${PORT}/api/frameworks`);
    console.log(`- http://localhost:${PORT}/api/notes`);
    console.log(`- http://localhost:${PORT}/api/notes/content`);
    console.log(`- http://localhost:${PORT}/api/gacha/records (GET)`);
    console.log(`- http://localhost:${PORT}/api/gacha/process-url (POST)`);
    console.log(`- http://localhost:${PORT}/api/gacha/intervals (GET)`);
    console.log(`- http://localhost:${PORT}/api/gacha/calculate-intervals (POST)`);
  });
}

// 启动服务器
startServer();