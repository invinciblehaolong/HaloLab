const authService = require('../services/authService');

/**
 * 处理登录请求
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证请求参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名和密码'
      });
    }

    // 调用服务层验证
    const result = await authService.verifyUser(username, password);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: '登录成功',
        data: {
          username: result.username,
          role: result.role // 区分管理员和普通用户
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { login };