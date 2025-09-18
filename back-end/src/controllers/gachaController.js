const gachaService = require('../services/gachaService');

/**
 * 处理抽卡链接并存储记录
 */
const handleGachaUrl = async (req, res) => {
  try {
    const { url, maxPages = 99 } = req.body;
    console.log(url, maxPages);
  
    if (!url) {
      return res.status(400).json({
        success: false,
        message: '请提供抽卡链接'
      });
    }
    
    const result = await gachaService.processAndStoreGachaRecords(url, parseInt(maxPages));
    
    return res.status(200).json({
      success: true,
      message: '抽卡记录处理完成',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * 获取数据库中的抽卡记录
 */
const getGachaRecords = async (req, res) => {
  try {
    const { uid, gacha_type, rank_type, page = 1, limit = 100 } = req.query;
    
    const params = {
      ...(uid && { uid }),
      ...(gacha_type && { gacha_type: parseInt(gacha_type) }),
      ...(rank_type && { rank_type: parseInt(rank_type) }),
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const result = await gachaService.getGachaRecords(params);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 新增统计摘要处理方法
const getSummaryStats = async (req, res) => {
  try {
    const { uid, gacha_type } = req.query;
    
    const params = {
      ...(uid && { uid }),
      ...(gacha_type && { gacha_type: parseInt(gacha_type) })
    };
    
    const result = await gachaService.getSummaryStats(params);
    
    return res.status(200).json({
      success: true,
      data: result,
      message: ''
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message
    });
  }
};

module.exports = {
  handleGachaUrl,
  getGachaRecords,
  getSummaryStats
};