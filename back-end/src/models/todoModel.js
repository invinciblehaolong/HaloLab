const db = require('../config/database');

/**
 * 初始化TODO表
 */
const initTodoTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);
    
    // 检查初始数据
    const result = await db.query('SELECT COUNT(*) FROM todos');
    if (parseInt(result.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO todos (title, completed) VALUES 
        ('学习Express', false),
        ('实现TODO API', false)
      `);
    }
    console.log('TODO表初始化完成');
  } catch (err) {
    console.error('TODO表初始化失败:', err);
  }
};

/**
 * TODO数据操作方法
 */
const todoModel = {
  // 获取所有TODO
  getAll: async () => {
    const { rows } = await db.query('SELECT * FROM todos ORDER BY id');
    return rows;
  },
  
  // 获取单个TODO
  getById: async (id) => {
    const { rows } = await db.query('SELECT * FROM todos WHERE id = $1', [id]);
    return rows[0];
  },
  
  // 创建TODO
  create: async (title, completed = false) => {
    const { rows } = await db.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title, completed]
    );
    return rows[0];
  },
  
  // 更新TODO
  update: async (id, { title, completed }) => {
    const { rows } = await db.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    return rows[0];
  },
  
  // 删除TODO
  delete: async (id) => {
    const { rows } = await db.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0];
  }
};

// 初始化表
initTodoTable();

module.exports = todoModel;