const express = require('express');	
const app = express();
const port = 8989;

const cors = require('cors');
app.use(cors());  // 允许所有来源跨域(开发环境)
app.use(express.json());
const { Pool } = require('pg'); // 新增：导入PostgreSQL客户端

// 新增：配置PostgreSQL连接
const pool = new Pool({
  user: 'postgres',       // 数据库用户名 (默认postgres)
  host: 'localhost',      // 数据库地址 若远程服务器则填其IP
  database: 'todo_db',    // 数据库名称
  password: '123456',
  port: 5432,             // PostgreSQL默认端口
});

// 新增：初始化数据库表结构
async function initDB() {
  try {
    // 创建todos表(如果不存在)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);
    
    // 检查是否有初始数据
    const result = await pool.query('SELECT COUNT(*) FROM todos');
    if (parseInt(result.rows[0].count) === 0) {
      // 插入初始数据
      await pool.query(`
        INSERT INTO todos (title, completed) VALUES 
        ('学习Express', false),
        ('实现TODO API', false)
      `);
    }
    console.log('数据库初始化完成');
  } catch (err) {
    console.error('数据库初始化失败:', err);
    process.exit(1); // 初始化失败则退出程序
  }
}

// 修改：生成下一个可用的ID(从数据库获取最大ID)
async function getNextId() {
  const result = await pool.query('SELECT MAX(id) FROM todos');
  const maxId = result.rows[0].max;
  return maxId ? maxId + 1 : 1;
}

// 定义根路由的处理函数
app.get('/', (req, res) => {
    res.send('Hello World! \n 欢迎使用TODO List API!');	// 修正拼写错误
});

// 读：获取所有todos(从数据库查询)
app.get('/todos', async (req, res) => {  // 新增async关键字
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('获取todos失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 查：获取单个todo(从数据库查询)
app.get('/todos/:id', async (req, res) => {  // 新增async关键字
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1',  // 使用参数化查询防止SQL注入
      [id]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (err) {
    console.error('获取单个todo失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 写（增）：创建新todo(插入数据库)
app.post('/todos', async (req, res) => {  // 新增async关键字
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // 从数据库获取ID，替代之前的本地计算
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [req.body.title, req.body.completed || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('创建todo失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删：删除todo(从数据库删除)
app.delete('/todos/:id', async (req, res) => {  // 新增async关键字
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length > 0) {
      res.json({ message: 'Todo deleted successfully' });
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (err) {
    console.error('删除todo失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 新增：添加更新功能(PUT请求)
app.put('/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.title && req.body.completed === undefined) {
      return res.status(400).json({ message: '需要提供title或completed字段' });
    }
    
    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [req.body.title, req.body.completed, id]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (err) {
    console.error('更新todo失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 修改：启动服务器前先初始化数据库
initDB().then(() => {
  app.listen(port, () => {
    console.log(`服务器已启动，正在监听 http://localhost:${port}`);
    console.log('可用API:');
    console.log('GET    /todos         - 获取所有TODO');
    console.log('GET    /todos/:id     - 获取单个TODO');
    console.log('POST   /todos         - 创建新TODO (need title)');
    console.log('PUT    /todos/:id     - 更新TODO');
    console.log('DELETE /todos/:id     - 删除TODO');
  });
});