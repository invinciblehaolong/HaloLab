const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    // 关键配置：携带Cookie等凭证信息
    credentials: 'include', 
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    
    console.log('请求地址:', `${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // if (!response.ok) {
    //   throw new Error(`请求失败: ${response.status}`);
    // }

    // 处理DELETE请求204无返回体情况
    if (method === 'DELETE' && response.status === 204) {
      return true;
    }

    const responseText = await response.text();

    // 检测是否是ngrok验证页面
    if (responseText.includes('ngrok-free.app') && responseText.includes('DOCTYPE html')) {
      console.error('检测到ngrok验证页面，请手动访问以下链接完成验证：', `${API_BASE_URL}${endpoint}`);
      // 打开具体的API地址进行验证（而非根路径）
      window.open(`${API_BASE_URL}${endpoint}`, '_blank');
      throw new Error('需要手动验证ngrok链接，请完成后重试');
    }

    // 正常解析JSON
    return JSON.parse(responseText);
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