import axios from 'axios';
import { createObjectCsvWriter } from 'csv-writer';
import moment from 'moment';

// 创建axios实例（统一配置基础URL和拦截器）
const api = axios.create({
  baseURL: '/api/genshin', // 与原API_BASE_URL保持一致
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器（可添加认证信息等）
api.interceptors.request.use(
  (config) => {
    // 示例：添加token（如有需要）
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（统一处理错误和数据提取）
api.interceptors.response.use(
  (response) => {
    // 假设后端返回格式为 { data: ..., success: boolean, message: string }
    // 与genshinFService.js保持一致的响应处理逻辑
    return response.data;
  },
  (error) => {
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
 * 1. 获取用户信息（对应后端/profile接口）
 * @param {string} roleId - 用户角色ID
 * @param {string} server - 服务器区域
 * @returns {Promise<{server: string, username: string}>}
 */
export const getUserProfile = async (roleId, server) => {
  const response = await api.get('/profile', {
    params: { role_id: roleId, server }
  });
  // 原逻辑使用res.data.data，需根据后端实际返回调整
  return response.success ? response.data : {};
};

/**
 * 2. 获取抽卡池配置（对应后端/config接口）
 * @param {string} region - 服务器区域
 * @returns {Promise<Array>} 抽卡池配置列表
 */
export const getGachaConfig = async (region) => {
  const response = await api.get('/config', { 
    params: { region } 
  });
  return response.success ? response.data : [];
};

/**
 * 3. 保存抽卡池配置（对应后端POST /config接口）
 * @param {Array} configList - 抽卡池配置列表
 * @param {string} region - 服务器区域
 */
export const saveGachaConfig = async (configList, region) => {
  const response = await api.post('/config', {
    configList,
    region
  });
  return response;
};

/**
 * 4. 获取抽卡记录（对应后端GET /logs接口）
 * @param {Object} params - 查询参数（统一参数格式，与genshinFService对齐）
 * @param {string} params.poolId - 池子ID
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.pageSize - 每页条数（默认20）
 * @param {Object} params.filters - 筛选条件
 * @returns {Promise<{records: Array, pagination: Object}>}
 */
export const getGachaRecords = async (params) => {
  // 合并默认参数与传入参数（参考genshinFService的参数处理方式）
  const queryParams = {
    page: 1,
    pageSize: 20,
    ...params
  };
  const response = await api.get('/logs', { params: queryParams });
  return response.success ? response.data : { records: [], pagination: {} };
};

/**
 * 5. 保存抽卡记录（对应后端POST /logs接口）
 * @param {Array} logs - 抽卡记录数组
 * @param {Object} params - 抽卡参数
 */
export const saveGachaRecords = async (logs, params) => {
  const response = await api.post('/logs', {
    logs,
    params
  });
  return response;
};

/**
 * 6. 获取抽卡类型统计数据（对应后端GET /stats/types接口）
 * @param {string} region - 服务器区域（可选）
 * @returns {Promise<Object>} 统计数据
 */
export const getGachaTypeStats = async (region) => {
  const response = await api.get('/stats/types', {
    params: { region }
  });
  return response.success ? response.data : {};
};

/**
 * 7. 前端导出抽卡记录为CSV（保持原有功能）
 * @param {Array} records - 抽卡记录列表
 * @param {string} poolName - 池子名称（用于文件名）
 */
export const exportGachaRecords = (records, poolName) => {
  if (!records || records.length === 0) {
    console.warn('无抽卡记录可导出');
    alert('无抽卡记录可导出，请先获取记录后重试');
    return;
  }

  const formattedData = records.map((record, index) => ({
    '服务器时间': moment(record.time).format('YYYY-MM-DD HH:mm'),
    '本地时间': moment(record.time).local().format('YYYY-MM-DD HH:mm'),
    '物品名称': `${record.item_name}${record.is_up ? '【UP】' : ''}`,
    '星级': `★${record.rank_type}`,
    '物品类型': record.item_type === 'Character' ? '角色' : '武器',
    '池子类型': record.gacha_type_name,
    '序号': index + 1
  }));

  const csvWriter = createObjectCsvWriter({
    path: `${poolName || '未知池子'}-抽卡记录-${moment().format('YYYYMMDD')}.csv`,
    header: [
      { id: '序号', title: '序号' },
      { id: '服务器时间', title: '服务器时间' },
      { id: '本地时间', title: '本地时间' },
      { id: '物品名称', title: '物品名称' },
      { id: '星级', title: '星级' },
      { id: '物品类型', title: '物品类型' },
      { id: '池子类型', title: '池子类型' }
    ],
    encoding: 'utf8'
  });

  csvWriter.writeRecords(formattedData)
    .then(() => {
      console.log(`CSV导出成功：${poolName}-抽卡记录-${moment().format('YYYYMMDD')}.csv`);
      alert(`抽卡记录导出成功！文件已保存至默认下载目录`);
    })
    .catch((err) => {
      console.error('CSV导出失败：', err);
      alert(`导出失败：${err.message}，请检查记录格式后重试`);
    });
};

/**
 * 8. 时间转换工具
 * @param {string} serverTime - 服务器时间（ISO格式）
 * @param {string} serverTimezone - 服务器时区（如UTC+8）
 * @returns {string} 本地时间（YYYY-MM-DD HH:mm）
 */
export const convertServerToLocalTime = (serverTime, serverTimezone = 'UTC+8') => {
  const timezoneOffset = parseInt(serverTimezone.replace('UTC', '')) * 60;
  return moment(serverTime)
    .utcOffset(timezoneOffset)
    .format('YYYY-MM-DD HH:mm');
};

/**
 * 9. 错误码映射
 * @param {number} errorCode - API返回错误码
 * @returns {Object} 错误信息与解决方案
 */
export const getErrorInfo = (errorCode) => {
  const errorMap = {
    101: {
      msg: '查询已过期，请重新获取抽卡链接后重试',
      solution: '重新获取抽卡链接：游戏内「设置→账户→抽卡记录导出」'
    },
    102: {
      msg: '无法获取数据，请检查网络后重试',
      solution: '1. 检查网络连接；2. 刷新页面重试'
    },
    110: {
      msg: '查询频率过高，请10分钟后重试',
      solution: '10分钟后刷新页面，避免短时间内多次请求'
    },
    default: {
      msg: '未知错误，请稍后重试',
      solution: '1. 刷新页面；2. 若问题持续，联系客服'
    }
  };
  return errorMap[errorCode] || errorMap.default;
};

/**
 * 获取抽卡池列表
 * @param {string} filterType - 筛选类型：current（当前开放）/history（历史）
 * @returns {Promise<Array>} 池子列表
 */
export const getPoolList = async (filterType = 'current') => {
  const response = await api.get('/pool-list', { 
    params: { filterType } 
  });
  return response.success ? response.data : [];
};

/**
 * 获取当前池子规则
 * @param {string} poolId - 池子ID
 * @returns {Promise<Object>} 规则数据
 */
export const getPoolRule = async (poolId) => {
  const response = await api.get('/pool-rule', { 
    params: { poolId } 
  });
  return response.success ? response.data : {};
};

/**
 * 获取用户服务器信息（需确认后端接口是否存在）
 * @returns {Promise<Object>} 用户服务器信息
 */
export const getUserServerInfo = async () => {
  try {
    const response = await api.get('/user-server-info'); // 假设后端接口为/user-server-info
    return response.success ? response.data : null;
  } catch (error) {
    console.error('获取用户服务器信息失败:', error);
    return null; // 保持原逻辑的默认返回
  }
};

export default api;