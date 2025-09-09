import React, { useState } from 'react';
import { processGachaUrl } from '../../services/genshinFService';

const UrlInput = ({ onRecordsUpdated }) => {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(99);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 简单验证
    if (!url.trim()) {
      setMessage('请输入抽卡链接');
      setMessageType('error');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('');
      const response = await processGachaUrl(url, maxPages);
      
      if (response.success) {
        setMessage('抽卡记录处理完成');
        setMessageType('success');
        // 清空输入
        setUrl('');
        // 通知父组件记录已更新
        if (onRecordsUpdated) {
          onRecordsUpdated();
        }
      } else {
        setMessage(response.message || '处理失败');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || '处理失败，请稍后重试');
      setMessageType('error');
    } finally {
      setLoading(false);
      // 5秒后清除消息
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="genshint-url-input-container">
      <form onSubmit={handleSubmit} className="genshint-url-form">
        <div className="genshint-form-group">
          <label htmlFor="gachaUrl" className="genshint-label">抽卡链接：</label>
          <input
            type="text"
            id="gachaUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="请输入Genshin抽卡记录链接"
            className="genshint-input"
            disabled={loading}
          />
        </div>
        
        <div className="genshint-form-group">
          <label htmlFor="maxPages" className="genshint-label">最大获取页数：</label>
          <input
            type="number"
            id="maxPages"
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            min="1"
            max="999"
            className="genshint-input small"
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="genshint-btn primary"
          disabled={loading}
        >
          {loading ? '处理中...' : '提交并获取记录'}
        </button>
      </form>
      
      {message && (
        <div className={`genshint-message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UrlInput;
