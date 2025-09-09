// src/pages/FrameStats.jsx
import React, { useState, useEffect } from 'react';
import { fetchFrameData } from '../services/frontendFrameAPI';
import FrameChart from '../components/FrameChart';

// 框架数据统计页面
const FrameStats = () => {
  const [frameData, setFrameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 初始加载时不强制更新（使用数据库数据）
  useEffect(() => {
    fetchData(false);
  }, []);

  // 封装数据获取逻辑
  const fetchData = async (forceUpdate) => {
    // 第一次加载使用loading状态，后续刷新使用isRefreshing状态
    if (forceUpdate) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchFrameData(forceUpdate);
      setFrameData(data);
    } catch (error) {
      console.error('获取数据失败：', error);
    } finally {
      if (forceUpdate) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // 强制更新数据（调用GitHub API）
  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!frameData) {
    return <div>数据获取失败</div>;
  }

  return (
    <div>
      {/* 添加更新按钮 */}
      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0071e3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isRefreshing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> 更新中...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i> 从GitHub更新数据
            </>
          )}
        </button>
      </div>
      
      <FrameChart data={frameData} />
    </div>
  );
};

export default FrameStats;