const API_BASE_URL = 'http://localhost:8989';

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

    // 处理DELETE请求204无返回体情况
    if (method === 'DELETE' && response.status === 204) {
      return true;
    }

    return await response.json();
  } catch (error) {
    console.error(`API错误 [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// 任务相关API
export const todoApi = {
  getAll: () => apiRequest('/todos'),
  getById: (id) => apiRequest(`/todos/${id}`),
  create: (todo) => apiRequest('/todos', 'POST', todo),
  update: (id, todo) => apiRequest(`/todos/${id}`, 'PUT', todo),
  delete: (id) => apiRequest(`/todos/${id}`, 'DELETE'),
};

export default todoApi;

// Todo相关API
// export const todoApi = {
//   /**
//    * 获取所有任务
//    * @returns {Promise<Array>} - 任务列表
//    */
//   getAll: () => apiRequest('/todos'),

//   /**
//    * 获取单个任务
//    * @param {number} id - 任务ID
//    * @returns {Promise<object>} - 任务详情
//    */
//   getById: (id) => apiRequest(`/todos/${id}`),

//   /**
//    * 创建新任务
//    * @param {object} todo - 新任务数据
//    * @returns {Promise<object>} - 创建的任务
//    */
//   create: (todo) => apiRequest('/todos', 'POST', todo),

//   /**
//    * 更新任务
//    * @param {number} id - 任务ID
//    * @param {object} todo - 更新的任务数据
//    * @returns {Promise<object>} - 更新后的任务
//    */
//   update: (id, todo) => apiRequest(`/todos/${id}`, 'PUT', todo),

//   /**
//    * 删除任务
//    * @param {number} id - 任务ID
//    * @returns {Promise<boolean>} - 是否删除成功
//    */
//   delete: (id) => apiRequest(`/todos/${id}`, 'DELETE'),
// };

// export default todoApi;