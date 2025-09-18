// src/services/frameApi.js
// 这个文件专门用来和后端接口打交道，获取框架相关的数据
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 真实获取框架数据（调用后端接口）
 * @param {boolean} forceUpdate - 是否强制更新后端数据（true=重新从GitHub拉取，false=用数据库缓存）
 * @returns {Promise<Object>} - 返回框架数据（格式和模拟数据一样）
 */
export const fetchFrameData = async (forceUpdate = false) => {
  try {
    // 创建URL查询参数对象，用来拼接在接口地址后面
    const params = new URLSearchParams();
    
    // 如果需要强制更新，就给接口传一个forceUpdate=true的参数
    // 后端看到这个参数就知道要重新去GitHub爬最新数据了
    if (forceUpdate) {
      params.append('forceUpdate', 'true');
    }
    
    // 调用后端接口：
    // 地址是 http://localhost:3001/api/frameworks
    // 如果需要强制更新，地址会变成 http://localhost:3001/api/frameworks?forceUpdate=true
    const response = await fetch(`${API_BASE_URL}/frameworks?${params.toString()}`);
    
    // 检查接口是否成功响应（状态码200-299才是成功）
    if (!response.ok) {
      // 失败的话抛出错误，告诉调用者后端返回了错误状态码
      throw new Error(`后端接口响应错误: ${response.status}`);
    }
    
    // 把后端返回的JSON数据转换成JavaScript对象
    const data = await response.json();
    
    // 返回数据，格式是 { frameworks: [框架1数据, 框架2数据, ...] }
    // 和之前的模拟数据格式完全一样，这样前端组件不用改就能用
    return data;
  } catch (error) {
    // 如果整个过程出错了（比如网络断了、后端挂了）
    // 在这里打印错误信息，方便调试
    console.error('获取框架数据失败:', error.message);
    // 把错误抛出去，让调用这个函数的组件去处理（比如显示错误提示给用户）
    throw error;
  }
};