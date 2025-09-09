const db = require('../config/db');

// 创建抽卡记录表格
const createGachaTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS gacha_records (
      id TEXT PRIMARY KEY,
      time TIMESTAMP NOT NULL,
      name TEXT NOT NULL,
      item_type TEXT NOT NULL,
      rank_type INTEGER NOT NULL,
      gacha_type INTEGER NOT NULL,
      uid TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await db.query(query);
    console.log('gacha_records表创建成功或已存在');
  } catch (error) {
    console.error('创建gacha_records表失败:', error);
  }
};

// 插入抽卡记录
const insertGachaRecord = async (record) => {
  const { id, time, name, item_type, rank_type, gacha_type, uid } = record;
  
  const query = `
    INSERT INTO gacha_records (id, time, name, item_type, rank_type, gacha_type, uid)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO NOTHING  -- 避免重复插入
  `;
  
  const values = [id, time, name, item_type, rank_type, gacha_type, uid];
  
  try {
    await db.query(query, values);
    return true;
  } catch (error) {
    console.error('插入抽卡记录失败:', error);
    return false;
  }
};

// 批量插入抽卡记录
const bulkInsertGachaRecords = async (records) => {
  if (records.length === 0) return true;
  
  // 构建批量插入的SQL
  const placeholders = records.map((_, i) => 
    `($${i*7+1}, $${i*7+2}, $${i*7+3}, $${i*7+4}, $${i*7+5}, $${i*7+6}, $${i*7+7})`
  ).join(',');
  
  const query = `
    INSERT INTO gacha_records (id, time, name, item_type, rank_type, gacha_type, uid)
    VALUES ${placeholders}
    ON CONFLICT (id) DO NOTHING
  `;
  
  // 提取所有值
  const values = records.flatMap(record => [
    record.id, 
    record.time, 
    record.name, 
    record.item_type, 
    record.rank_type, 
    record.gacha_type, 
    record.uid
  ]);
  
  try {
    await db.query(query, values);
    return true;
  } catch (error) {
    console.error('批量插入抽卡记录失败:', error);
    return false;
  }
};

// 获取抽卡记录
const getGachaRecords = async (params = {}) => {
  const { uid, gacha_type, rank_type, page = 1, limit = 100 } = params;
  
  // 1. 校验并修正分页参数
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const validPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  const validLimit = isNaN(limitNum) || limitNum < 1 ? 100 : Math.min(limitNum, 1000); // 限制最大1000条
  const offset = (validPage - 1) * validLimit;
  
  // 2. 构建查询条件（分离条件参数和分页参数）
  let conditions = [];
  const conditionValues = []; // 仅存储查询条件参数
  let paramIndex = 1;
  
  if (uid) {
    conditions.push(`uid = $${paramIndex++}`);
    conditionValues.push(uid);
  }
  
  if (gacha_type) {
    conditions.push(`gacha_type = $${paramIndex++}`);
    conditionValues.push(gacha_type);
  }
  
  if (rank_type) {
    conditions.push(`rank_type = $${paramIndex++}`);
    conditionValues.push(rank_type);
  }
  
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';
  
  // 3. 构建完整查询参数（条件参数 + 分页参数）
  const paginationValues = [validLimit, offset];
  const queryValues = [...conditionValues, ...paginationValues];
  
  // 4. 构建查询语句
  const query = `
    SELECT * FROM gacha_records
    ${whereClause}
    ORDER BY time DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  
  // 5. 构建总记录数查询
  const countQuery = `
    SELECT COUNT(*) FROM gacha_records
    ${whereClause}
  `;
  
  try {
    const { rows } = await db.query(query, queryValues);
    const countResult = await db.query(countQuery, conditionValues);
    const total = parseInt(countResult.rows[0].count, 10);
    
    return {
      records: rows,
      pagination: {
        total,
        page: validPage,
        limit: validLimit,
        pages: Math.ceil(total / validLimit)
      }
    };
  } catch (error) {
    console.error('获取抽卡记录失败:', error);
    // 细化错误信息
    const errorMsg = error.code === 'ECONNREFUSED' 
      ? '数据库连接失败' 
      : `查询错误: ${error.message}`;
    return { 
      records: [], 
      pagination: { total: 0, page: validPage, limit: validLimit, pages: 0 },
      error: errorMsg
    };
  }
};

// 初始化表
createGachaTable();

module.exports = {
  insertGachaRecord,
  bulkInsertGachaRecords,
  getGachaRecords
};