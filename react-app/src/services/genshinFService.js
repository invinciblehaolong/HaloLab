import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// 创建axios实例，配置基础URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/gacha`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 可以在这里添加认证信息等
api.interceptors.request.use(
  (config) => {
    // 可以添加token等认证信息
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    // 只返回响应数据中的data部分
    return response.data;
  },
  (error) => {
    // 统一处理错误信息
    let errorMessage = '请求失败，请稍后重试';
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('API请求错误:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * 处理抽卡链接并存储记录
 * @param {string} url - 抽卡链接
 * @param {number} [maxPages=99] - 最大获取页数
 * @returns {Promise} - 处理结果
 */
export const processGachaUrl = (url, maxPages = 99) => {
  return api.post('/process-url', { url, maxPages });
};

/**
 * 获取抽卡记录
 * @param {Object} params - 查询参数
 * @param {string} [params.uid] - 玩家ID
 * @param {number} [params.gacha_type] - 卡池类型
 * @param {number} [params.rank_type] - 物品稀有度
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=100] - 每页条数
 * @returns {Promise} - 抽卡记录列表及分页信息
 */
export const getGachaRecords = (params = {}) => {
  return api.get('/records', { 
    params: {
      page: 1,
      limit: 100,
      ...params
    } 
  });
};

/**
 * 手动触发五星间隔计算
 * @returns {Promise} - 计算结果
 */
export const calculateIntervals = () => {
  return api.post('/calculate-intervals');
};

/**
 * 获取五星间隔记录
 * @param {Object} params - 查询参数
 * @param {string} [params.uid] - 玩家ID
 * @param {number} [params.gacha_type] - 卡池类型
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=50] - 每页条数
 * @returns {Promise} - 五星间隔记录列表及分页信息
 */
export const getIntervalRecords = (params = {}) => {
  return api.get('/intervals', {
    params: {
      page: 1,
      limit: 50,
      ...params
    }
  });
};

/**
 * 工具函数：格式化抽卡记录的时间
 * @param {string} timestamp - 时间戳字符串
 * @returns {string} - 格式化后的时间
 */
export const formatGachaTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

/**
 * 工具函数：根据卡池类型ID获取卡池名称
 * @param {number} type - 卡池类型ID
 * @returns {string} - 卡池名称
 */
export const getGachaTypeName = (type) => {
  const typeMap = {
    100: '新手祈愿',
    200: '常驻祈愿',
    301: '角色活动祈愿',
    302: '武器活动祈愿',
    400: '角色活动祈愿-2'
  };
  return typeMap[type] || `未知类型(${type})`;
};

/**
 * 工具函数：根据稀有度获取对应的颜色样式
 * @param {number} rank - 稀有度等级
 * @returns {string} - 颜色类名
 */
export const getRankColorClass = (rank) => {
  const colorMap = {
    3: 'genshint-rank-3',
    4: 'genshint-rank-4',
    5: 'genshint-rank-5'
  };
  return colorMap[rank] || 'genshint-rank-default';
};

export default api;
