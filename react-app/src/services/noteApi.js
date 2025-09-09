// src/services/noteApi.js
// 用于与后端Markdown文件接口交互

const API_BASE_URL = 'http://localhost:3001'; // 后端服务地址

/**
 * 通用API请求函数
 * @param {string} endpoint - 请求地址
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @returns {Promise} 请求结果
 */
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API错误 [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// Markdown文件相关API
export const noteApi = {
  /**
   * 获取所有Markdown文件列表
   * @returns {Promise<Array>} - 文件列表
   */
  getAllNotes: () => apiRequest('/api/notes'),
  
  /**
   * 获取单个Markdown文件内容
   * @param {string} filePath - 文件路径
   * @returns {Promise<object>} - 文件内容
   */
  getNoteContent: (filePath) => apiRequest(`/api/notes/content?filePath=${encodeURIComponent(filePath)}`)
};

export default noteApi;