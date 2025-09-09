import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Home from './pages/Home-todo';
import NewPage from './pages/NewPage';
import FrameStats from './pages/FrameStats';
import MarkdownViewerPage from './pages/MarkdownViewerPage';
import GachaRecordPage from './pages/GachaRecordPage';
import GachaAnalysis from './pages/GachaAnalysis';

import './assets/styles/apple-styles.css';
import './assets/styles/genshinF.css';
import './assets/styles/genshin.css';
import './assets/styles/frame.css';
import './assets/styles/markdown.css';


const App = () => {
  return (
    <Router>
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-page" element={<NewPage />} />
          <Route path="/frame-stats" element={<FrameStats />} />
          <Route path="/markdown-viewer" element={<MarkdownViewerPage />} />
          <Route path="/markdown-viewer/fullscreen" element={<MarkdownViewerPage />} />
          <Route path="/genshin-gacha" element={<GachaRecordPage/>} />
          <Route path="/genshinT-gacha" element={<GachaAnalysis />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;