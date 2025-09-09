import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation(); // 高亮当前

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          任务清单
        </Link>
        <Link 
          to="/new-page" 
          className={`nav-link ${location.pathname === '/new-page' ? 'active' : ''}`}
        >
          新页面
        </Link>
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
          to="/genshin-gacha" 
          className={`nav-link ${location.pathname === '/genshin-gacha' ? 'active' : ''}`}
        >
          Genshin抽卡分析
        </Link>
        <Link 
          to="/genshinT-gacha" 
          className={`nav-link ${location.pathname === '/genshinT-gacha' ? 'active' : ''}`}
        >
          GenshinT抽卡分析
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;