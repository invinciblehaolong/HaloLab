// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin'); // 默认admin
  const [password, setPassword] = useState('123456'); // 默认密码
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 账号选项
  const userOptions = [
    { value: 'admin', label: '管理员 (admin)' },
    { value: 'user_halo', label: '普通用户 (user_halo)' }
  ];
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      if (response.data.success) {
        // 登录成功，保存用户信息// Login.jsx 登录成功部分修改
        if (response.data.success) {
          // 保存用户信息
          localStorage.setItem('userInfo', JSON.stringify(response.data.data));
          // 主动触发storage事件，通知App组件更新
          window.dispatchEvent(new Event('storage'));
          // 跳转到首页
          navigate('/');
        }
      } else {
        setError(response.data.message || '登录失败');
      }
    } catch (err) {
      setError(err.response?.data?.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">系统登录</h2>
        
        {error && (
          <div className="login-error">{error}</div>
        )}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">账号</label>
            <select
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              disabled={loading}
            >
              {userOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;