const express = require('express');
const router = express.Router();
const { getFrameData } = require('../services/frameService');

/**
 * 接口：获取框架数据
 * GET /api/frameworks
 * Query 参数：forceUpdate（可选，布尔值，true 强制更新数据）
 */
router.get('/frameworks', async (req, res) => {
  try {
    const forceUpdate = req.query.forceUpdate === 'true';
    const frameData = await getFrameData(forceUpdate);
    
    // 返回与模拟数据格式一致的响应（便于前端无缝替换）
    res.status(200).json({ frameworks: frameData });
  } catch (error) {
    res.status(500).json({ message: '获取框架数据失败', error: error.message });
  }
});

module.exports = router;