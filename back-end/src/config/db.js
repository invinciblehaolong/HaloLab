const { Pool } = require('pg');
require('dotenv').config();

// 创建连接池（推荐用连接池，而非单连接）
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || '5432',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '123456',
  database: process.env.PG_DATABASE || 'todo_db',
  max: 10,  // 最大连接数
  idleTimeoutMillis: 30000  // 空闲连接超时时间
});

// 测试数据库连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('数据库连接失败:', err.stack);
  } else {
    console.log('数据库连接成功，当前时间:', res.rows[0].now);
  }
});

// 封装查询方法（简化 SQL 调用）
const query = (text, params) => pool.query(text, params);

module.exports = { query };