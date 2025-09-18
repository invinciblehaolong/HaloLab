// src/components/AdminRoute.jsx
// ⚠️已在react-app\src\hooks\useAuthStatus.js添加路由保护
// 即使导航栏隐藏，普通用户仍可能通过直接输入 URL 访问 /new-page，因此需要路由级别的权限控制
import { Navigate } from 'react-router-dom';
import useAuthStatus from '../hooks/useAuthStatus';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, userRole } = useAuthStatus();

  // 未登录：重定向到登录页
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  // 已登录但不是管理员：重定向到首页（或其他提示页）
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 管理员：显示页面
  return children;
};

export default AdminRoute;