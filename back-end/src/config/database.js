const { Pool } = require('pg');
const config = require('./index');

// 创建连接池（单例模式）
const pool = new Pool(config.database);

// 测试数据库连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('数据库连接失败:', err.stack);
  } else {
    console.log('数据库连接成功，当前时间:', res.rows[0].now);
  }
});

// 封装查询方法
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query
};