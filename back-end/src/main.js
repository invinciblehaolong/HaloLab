const express = require('express');
const cors = require('cors');
const config = require('./config');

// 导入路由
const frameRoutes = require('./routes/frameRoutes');
const noteRoutes = require('./routes/noteRoutes');
const gachaRoutes = require('./routes/gachaRoutes');
const todoRoutes = require('./routes/todoRoutes'); // 新增TODO路由
const authRoutes = require('./routes/authRoutes');

// 导入中间件（后续会实现，先预留）
// const errorHandler = require('./middleware/errorHandler');
// const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = config.app.port;

// 全局中间件
// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:5174', // 本地前端
    'https://7f7e62a91780.ngrok-free.app',// 前端ngrok域名
    'https://0ef47f343a11.ngrok-free.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  // 关键配置：允许携带凭证（Cookie等）
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 后续可添加：app.use(rateLimiter.apiLimiter);

// 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);       // 新增TODO路由
app.use('/api/gacha', gachaRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api', frameRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('API服务正在运行halo');
});

// 错误处理中间件（简化版，后续会增强）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: config.env === 'development' ? err.message : '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0',  () => {
  console.log(`Express 服务已启动（${config.env}环境），端口：${PORT}`);
  console.log(`API基础地址：http://localhost:${PORT}/api`);
  console.log('可用接口：');
  console.log(`- GET    http://localhost:${PORT}/api/frameworks`);
  console.log(`- GET    http://localhost:${PORT}/api/notes`);
  console.log(`- GET    http://localhost:${PORT}/api/notes/content`);
  console.log(`- GET    http://localhost:${PORT}/api/gacha/records`);
  console.log(`- POST   http://localhost:${PORT}/api/gacha/process-url`);
  console.log(`- GET    http://localhost:${PORT}/api/gacha/intervals`);
  console.log(`- POST   http://localhost:${PORT}/api/gacha/calculate-intervals`);
  console.log(`- GET    http://localhost:${PORT}/api/todos`);
  console.log(`- GET    http://localhost:${PORT}/api/todos/:id`);
  console.log(`- POST   http://localhost:${PORT}/api/todos`);
  console.log(`- PUT    http://localhost:${PORT}/api/todos/:id`);
  console.log(`- DELETE http://localhost:${PORT}/api/todos/:id`);
});