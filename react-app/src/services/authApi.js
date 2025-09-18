// src/services/authApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 登录请求
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 登录结果
 */
export const login = async (username, password) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include' // 保持与其他API一致的凭证设置
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `登录失败: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('登录API错误:', error);
    throw error;
  }
};

export default { login };