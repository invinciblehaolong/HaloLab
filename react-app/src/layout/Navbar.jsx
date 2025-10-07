import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStatus from '../hooks/useAuthStatus'; // 导入扩展后的Hook

const Navbar = () => {
  const location = useLocation(); // 高亮当前
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/auth/login');
    window.location.reload(); // 重新加载页面
  };
  const { userRole } = useAuthStatus(); // 获取用户角色

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          任务清单
        </Link>
        {/* 仅管理员显示新页面链接 */}
        {userRole === 'admin' && (
          <Link 
            to="/new-page" 
            className={`nav-link ${location.pathname === '/new-page' ? 'active' : ''}`}
          >
            admin
          </Link>
        )}
        <Link 
          to="/frame-stats" 
          className={`nav-link ${location.pathname === '/frame-stats' ? 'active' : ''}`}
        >
          前端框架数据统计
        </Link>
        <Link  // 新增导航链接
          to="/markdown-viewer" 
          className={`nav-link ${location.pathname === '/markdown-viewer' ? 'active' : ''}`}
        >
          Markdown查看器
        </Link>
        <Link 
          to="/genshin/gacha" 
          className={`nav-link ${location.pathname === '/genshin/gacha' ? 'active' : ''}`}
        >
          GenshinT抽卡分析
        </Link>
        <Link
          to="/genshin/damage"
          className={`nav-link ${location.pathname === '/genshin/damage' ? 'active' : ''}`}
        >
          GenshinDamageCalcu
        </Link>
        <Link 
          to="/ml-algorithms" 
          className={`nav-link ${location.pathname === '/ml-algorithms' ? 'active' : ''}`}
        >
          blockchain-algorithms
        </Link>
        {/* 显示当前用户和退出按钮 */}
        <div className="nav-user-section">
          <span className="nav-username">
            {userInfo.username || '未知用户'}
          </span>
          <button 
            className="nav-logout-btn"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;