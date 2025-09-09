import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../assets/styles/markdown.css';
import { useNavigate, useLocation } from 'react-router-dom';
// 新增：导入noteApi
import noteApi from '../services/noteApi';

const MarkdownFileList = () => {
  // 存储上传的文件列表
  const [fileList, setFileList] = useState([]);
  // 当前正在查看的文件索引
  const [activeIndex, setActiveIndex] = useState(-1);
  // 当前文件内容
  const [markdownContent, setMarkdownContent] = useState('');
  // 当前选中的文件名（用于全屏显示标题）
  const [activeFileName, setActiveFileName] = useState('');
  // 新增：文件来源（区分本地和远程文件）
  const [fileSources, setFileSources] = useState([]); // 'local' 或 'remote'
  // 新增：加载状态
  const [loading, setLoading] = useState(false);

  // 路由相关
  const navigate = useNavigate();
  const location = useLocation();
  const isFullscreen = location.pathname === '/markdown-viewer/fullscreen';


  // 处理文件上传
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 筛选出.md文件
    const mdFiles = files.filter(file => file.name.endsWith('.md'));
    if (mdFiles.length === 0) {
      alert('请选择.md格式的文件');
      return;
    }

    // 添加到文件列表（去重）
    const newFiles = mdFiles.filter(newFile => 
      !fileList.some(existing => {
        const existingName = existing.name || existing.filename;
        return existingName === newFile.name;
      })
    );
    
    setFileList(prev => [...prev, ...newFiles]);
    // 记录文件来源为本地
    setFileSources(prev => [...prev, ...newFiles.map(() => 'local')]);
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  };

  // 新增：从后端获取文件列表
  const fetchRemoteNotes = async () => {
    try {
      setLoading(true);
      const response = await noteApi.getAllNotes();
      
      // 过滤掉已存在的同名文件
      const newRemoteFiles = response.data.filter(remoteFile => 
        !fileList.some(existingFile => {
          const existingName = existingFile.name || existingFile.filename;
          return existingName === remoteFile.filename;
        })
      );
      
      // 添加到文件列表
      setFileList(prev => [...prev, ...newRemoteFiles]);
      // 记录文件来源为远程
      setFileSources(prev => [...prev, ...newRemoteFiles.map(() => 'remote')]);
      
      alert(`成功加载 ${newRemoteFiles.length} 个远程文件`);
    } catch (error) {
      console.error('获取远程文件失败:', error);
      alert('获取远程文件失败，请检查后端服务是否运行');
    } finally {
      setLoading(false);
    }
  };

  // 修改：查看选中的MD文件（支持本地和远程文件）
  const viewFile = async (index, file) => {
    try {
      setLoading(true);
      let content;
      
      // 根据文件来源选择不同的读取方式
      if (fileSources[index] === 'local') {
        // 本地文件读取
        const reader = new FileReader();
        content = await new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsText(file);
        });
      } else {
        // 远程文件读取（调用后端接口）
        const response = await noteApi.getNoteContent(file.path);
        content = response.content;
      }
      
      setMarkdownContent(content);
      setActiveIndex(index);
      setActiveFileName(fileSources[index] === 'local' ? file.name : file.filename);
    } catch (error) {
      console.error('读取文件失败:', error);
      alert('无法读取文件内容');
    } finally {
      setLoading(false);
    }
  };

  // 进入全屏模式
  const enterFullscreen = () => {
    if (activeIndex === -1) return; // 没有选中文件时不执行
    navigate('/markdown-viewer/fullscreen');
  };

  // 退出全屏模式
  const exitFullscreen = () => {
    navigate('/markdown-viewer');
  };

  // 修改：删除文件
  const removeFile = (index) => {
    const newList = [...fileList];
    const newSources = [...fileSources];
    newList.splice(index, 1);
    newSources.splice(index, 1);
    
    setFileList(newList);
    setFileSources(newSources);
    
    // 如果删除的是当前查看的文件，重置视图
    if (index === activeIndex) {
      setActiveIndex(-1);
      setMarkdownContent('');
      setActiveFileName('');
    }
  };
  
  // 全屏模式下的渲染
  if (isFullscreen) {
    return (
      <div className="fullscreen-container">
        <div className="fullscreen-header">
          <h3>{activeFileName}</h3>
          <button className="exit-fullscreen-btn" onClick={exitFullscreen}>
            返回
          </button>
        </div>
        <div className="fullscreen-content">
          {loading ? (
            <div className="empty-view">加载中...</div>
          ) : (
            // 修改：使用ReactMarkdown组件编译显示Markdown内容
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownContent}
            </ReactMarkdown></div>
          )}
        </div>
      </div>
    );
  }

  
  return (
    <div className="markdown-viewer-container">
      <div className="file-upload-area">
        <label className="upload-label">
          <input 
            type="file" 
            multiple 
            accept=".md" 
            onChange={handleFileUpload}
            className="file-input"
          />
          <span>选择本地MD文件</span>
        </label>
        
        {/* 新增：从后端获取文件按钮 */}
        <button 
          className="fetch-files-btn" 
          style={{ marginLeft: '1rem' }}
          onClick={fetchRemoteNotes}
          disabled={loading}
        >
          {loading ? '加载中...' : '从后端获取文件'}
        </button>
        
        <p className="hint-text">支持选择多个.md文件，将在左侧列表显示</p>
      </div>

      <div className="viewer-content">
        {/* 文件列表区域 */}
        <div className="file-list">
          <h3>文件列表 ({fileList.length})</h3>
          {fileList.length === 0 ? (
            <p className="empty-hint">暂无文件，请上传或从后端获取.md文件</p>
          ) : (
            <ul>
              {fileList.map((file, index) => (
                <li 
                  key={index}
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => viewFile(index, file)}
                >
                  <span className="file-name">
                    {fileSources[index] === 'local' ? file.name : file.filename}
                    {/* 显示文件来源标识 */}
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: fileSources[index] === 'local' ? '#34c759' : '#0071e3',
                      color: 'white'
                    }}>
                      {fileSources[index] === 'local' ? '本地' : '远程'}
                    </span>
                  </span>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* MD内容展示区域 */}
        <div className="markdown-content">
            {loading ? (
              <div className="empty-view">加载中...</div>
            ) : activeIndex === -1 ? (
                <div className="empty-view">
                <p>请从左侧选择一个文件查看</p>
                </div>
            ) : (
              <div className="markdown-body-wrapper">
                <button 
                  className="fullscreen-btn" 
                  onClick={enterFullscreen}
                >
                  全屏查看
                </button>
                
                <div className="markdown-body">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                >
                    {markdownContent}
                </ReactMarkdown>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownFileList;