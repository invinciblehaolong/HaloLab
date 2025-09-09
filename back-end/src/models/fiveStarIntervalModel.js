const db = require('../config/db');

/**
 * 创建五星间隔记录表
 * 用于存储每个五星之间的抽数计算结果
 */
const createFiveStarIntervalTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS five_star_intervals (
      id SERIAL PRIMARY KEY,
      uid TEXT NOT NULL,
      gacha_type INTEGER NOT NULL,
      five_star_record_id TEXT NOT NULL UNIQUE, -- 确保每条五星记录只计算一次
      five_star_name TEXT NOT NULL,
      pulls_between INTEGER NOT NULL, -- 与上一个五星的间隔抽数
      is_first BOOLEAN NOT NULL DEFAULT false, -- 是否为第一个五星
      record_time TIMESTAMP NOT NULL, -- 抽取时间
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      -- 外键关联抽卡记录表（可选，增强数据完整性）
      CONSTRAINT fk_gacha_record
        FOREIGN KEY(five_star_record_id)
        REFERENCES gacha_records(id)
        ON DELETE CASCADE
    );

    -- 创建索引提升查询性能
    CREATE INDEX IF NOT EXISTS idx_five_star_uid ON five_star_intervals(uid);
    CREATE INDEX IF NOT EXISTS idx_five_star_gacha_type ON five_star_intervals(gacha_type);
    CREATE INDEX IF NOT EXISTS idx_five_star_time ON five_star_intervals(record_time);
  `;

  try {
    await db.query(query);
    console.log('five_star_intervals表创建成功或已存在');
  } catch (error) {
    console.error('创建five_star_intervals表失败:', error);
  }
};

/**
 * 计算并插入五星间隔数据
 * 核心逻辑：按用户+卡池分组，用窗口函数计算与上一个五星的间隔
 */
const calculateAndStoreIntervals = async () => {
  // 修复思路：
  // 1. 先为所有抽卡记录按用户和卡池分组并编号（包括非五星）
  // 2. 将301和400卡池视为同一组进行计算
  // 3. 筛选出五星记录并获取其在完整序列中的位置
  // 4. 计算两个五星之间的实际抽数差
  const query = `
    WITH all_records_ranked AS (
      -- 为所有记录按用户+卡池分组并按时间排序编号
      -- 特别处理：将301和400视为同一卡池
      SELECT 
        id,
        uid,
        gacha_type,
        -- 创建分组卡池类型，将301和400合并为同一组
        CASE 
          WHEN gacha_type IN (301, 400) THEN 301  -- 301和400视为同一卡池
          ELSE gacha_type 
        END as grouped_gacha_type,
        name,
        time,
        rank_type,
        -- 关键：为该用户该分组卡池的所有抽卡记录编号（包括非五星）
        ROW_NUMBER() OVER (
          PARTITION BY uid, 
            CASE 
              WHEN gacha_type IN (301, 400) THEN 301 
              ELSE gacha_type 
            END
          ORDER BY time ASC
        ) as pull_number  -- 表示这是该用户在该分组卡池的第n抽
      FROM gacha_records
    ),
    five_star_records AS (
      -- 筛选五星记录及其在完整序列中的位置
      SELECT 
        id,
        uid,
        gacha_type,  -- 保留原始卡池类型
        grouped_gacha_type,  -- 分组后的卡池类型
        name,
        time,
        pull_number  -- 这里的编号是基于分组卡池所有抽卡的
      FROM all_records_ranked
      WHERE rank_type = 5
    ),
    ranked_records AS (
      -- 获取上一条五星记录的抽卡位置（基于分组卡池）
      SELECT 
        *,
        LAG(pull_number) OVER (
          PARTITION BY uid, grouped_gacha_type 
          ORDER BY time ASC
        ) as prev_pull_number
      FROM five_star_records
    )
    -- 插入计算结果到间隔表
    INSERT INTO five_star_intervals (
      uid, 
      gacha_type,  -- 存储原始卡池类型
      five_star_record_id, 
      five_star_name, 
      pulls_between, 
      is_first, 
      record_time
    )
    SELECT 
      uid,
      gacha_type,  -- 使用原始卡池类型
      id,
      name,
      -- 计算实际间隔抽数（当前位置 - 上一个五星位置）
      CASE WHEN prev_pull_number IS NULL THEN pull_number ELSE pull_number - prev_pull_number END as pulls_between,
      prev_pull_number IS NULL as is_first,
      time as record_time
    FROM ranked_records
    ON CONFLICT (five_star_record_id) DO NOTHING;
  `;

  try {
    const result = await db.query(query);
    console.log(`成功计算并存储${result.rowCount}条五星间隔记录`);
    return {
      success: true,
      count: result.rowCount
    };
  } catch (error) {
    console.error('计算五星间隔失败:', error);
    throw new Error(`计算五星间隔失败: ${error.message}`);
  }
};


/**
 * 查询用户的五星间隔记录
 * @param {Object} params 查询参数（uid, gacha_type, page, limit）
 */
const getFiveStarIntervals = async (params = {}) => {
  const { uid, gacha_type, page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  // 构建查询条件
  let conditions = [];
  let values = [];
  let paramIndex = 1;

  if (uid) {
    conditions.push(`uid = $${paramIndex++}`);
    values.push(uid);
  }

  if (gacha_type) {
    conditions.push(`gacha_type = $${paramIndex++}`);
    values.push(gacha_type);
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  // 添加分页参数
  values.push(limit, offset);

  // 查询记录
  const query = `
    SELECT * FROM five_star_intervals
    ${whereClause}
    ORDER BY record_time DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  // 查询总数
  const countQuery = `
    SELECT COUNT(*) FROM five_star_intervals
    ${whereClause}
  `;

  try {
    const { rows } = await db.query(query, values);
    const countResult = await db.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    return {
      intervals: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('查询五星间隔记录失败:', error);
    return { intervals: [], pagination: { total: 0, page: 1, limit, pages: 0 } };
  }
};

// 初始化表
createFiveStarIntervalTable();

module.exports = {
  calculateAndStoreIntervals,
  getFiveStarIntervals
};