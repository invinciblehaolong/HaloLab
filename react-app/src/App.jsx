import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Home from './pages/Home-todo';
import NewPage from './pages/NewPage';
import FrameStats from './pages/FrameStats';
import MarkdownViewerPage from './pages/MarkdownViewerPage';
import GachaAnalysis from './pages/GachaAnalysis';
import Login from './pages/Login';
import useAuthStatus from './hooks/useAuthStatus'; // 导入自定义 Hook
import MLAlgorithmPage from './pages/MLAlgorithmPage';
import GenshinDamageCalculator from './pages/GenshinDamageCalculator';

import './assets/styles/apple-styles.css';
import './assets/styles/genshinF.css';
import './assets/styles/frame.css';
import './assets/styles/markdown.css';
import './assets/styles/login.css';
import './assets/styles/ml-styles.css';

// login 新增路由保护组件
// 修复路由保护组件
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useAuthStatus(); // 使用自定义 Hook
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};
  

const App = () => {
  const {isLoggedIn} = useAuthStatus();
  
  return (
    <Router>
      {/* 只有登录后才显示导航栏 */}
      {isLoggedIn && <Navbar />}
      <main className="app-content">
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          {/* 路由添加保护 */}
          <Route path="/" element={
            <ProtectedRoute>

              <Home />
            </ProtectedRoute>} />
          <Route path="/new-page" element={
            <ProtectedRoute>

              <NewPage />
            </ProtectedRoute>} />
          <Route path="/frame-stats" element={
            <ProtectedRoute>

              <FrameStats />
            </ProtectedRoute>} />
          <Route path="/markdown-viewer" element={
            <ProtectedRoute>

              <MarkdownViewerPage />
            </ProtectedRoute>} />
          <Route path="/markdown-viewer/fullscreen" element={
            <ProtectedRoute>

              <MarkdownViewerPage />
            </ProtectedRoute>} />
          <Route path="/genshin/gacha" element={
            <ProtectedRoute>

              <GachaAnalysis />
            </ProtectedRoute>} />
          <Route path="/genshin/damage" element={
            <ProtectedRoute>

              <GenshinDamageCalculator />
            </ProtectedRoute>} />
          <Route path="/ml-algorithms" element={
            <ProtectedRoute>
              
              <MLAlgorithmPage  />
            </ProtectedRoute>} />
            
          {/* 未匹配路由重定向到登录页 */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;