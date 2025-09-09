const fiveStarIntervalModel = require('../models/fiveStarIntervalModel');

/**
 * 触发五星间隔计算
 * 可在新抽卡数据存入后调用，或通过定时任务执行
 */
const calculateIntervals = async () => {
  try {
    return await fiveStarIntervalModel.calculateAndStoreIntervals();
  } catch (error) {
    console.error('服务层：计算五星间隔失败:', error);
    throw error;
  }
};

/**
 * 获取五星间隔记录（支持筛选）
 */
const getIntervals = async (params) => {
  try {
    return await fiveStarIntervalModel.getFiveStarIntervals(params);
  } catch (error) {
    console.error('服务层：获取五星间隔记录失败:', error);
    throw error;
  }
};

module.exports = {
  calculateIntervals,
  getIntervals
};