// src/hooks/useAuthStatus.js
import { useState, useEffect } from 'react';

const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // 新增：用户角色解析

  useEffect(() => {
    // 从localStorage获取用户信息
    const getUserInfo = () => {
      const info = localStorage.getItem('userInfo');
      if (info) {
        const user = JSON.parse(info);
        setIsLoggedIn(true);
        setUserRole(user.role || ''); // 解析角色
      } else {
        setIsLoggedIn(false);
        setUserRole('');
      }
    };

    getUserInfo(); // 初始加载

    // 监听localStorage变化（如登录/退出时）
    const handleStorageChange = () => {
      getUserInfo();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isLoggedIn, userRole }; // 返回登录状态和角色
};

export default useAuthStatus;