const fiveStarService = require('../services/fiveStarService');

/**
 * 触发五星间隔计算（手动调用接口）
 */
const calculateFiveStarIntervals = async (req, res) => {
  try {
    const result = await fiveStarService.calculateIntervals();
    return res.status(200).json({
      success: true,
      message: '五星间隔计算完成',
      data: {
        updatedCount: result.count
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 获取五星间隔记录
 */
const getFiveStarIntervals = async (req, res) => {
  try {
    const { uid, gacha_type, page = 1, limit = 50 } = req.query;
    
    const params = {
      ...(uid && { uid }),
      ...(gacha_type && { gacha_type: parseInt(gacha_type) }),
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const result = await fiveStarService.getIntervals(params);
    
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

module.exports = {
  calculateFiveStarIntervals,
  getFiveStarIntervals
};