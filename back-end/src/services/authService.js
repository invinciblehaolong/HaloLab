/**
 * 验证用户身份
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns 验证结果
 */
const verifyUser = async (username, password) => {
  // 定义允许的用户（固定账号）
  const validUsers = [
    { username: 'admin', password: '123456', role: 'admin' },
    { username: 'user_halo', password: '123456', role: 'user' }
  ];

  // 查找用户
  const user = validUsers.find(u => u.username === username);
  
  if (!user) {
    return { success: false, message: '用户不存在' };
  }
  
  // 验证密码
  if (user.password !== password) {
    return { success: false, message: '密码错误' };
  }
  
  return { 
    success: true, 
    username: user.username, 
    role: user.role 
  };
};

module.exports = { verifyUser };