import React from 'react';
import { getGachaTypeName } from '../../services/genshinFService';

const IntervalAnalysis = ({ intervals, loading, total, onCalculate }) => {
  if (loading && intervals === null) {
    return (
      <div className="genshint-loading">
        <div className="genshint-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  // 计算统计数据
  const stats = intervals && intervals.length > 0 
    ? calculateStats(intervals)
    : null;

  // 确定进度条颜色（优化为更好看的色系）
  const getProgressColor = (value) => {
    if (value <= 40) return '#4ade80'; // 清新绿色（安全区）
    if (value <= 70) return '#facc15'; // 柔和黄色（警告区）
    return '#f87171'; // 淡红色（危险区）
  };

  return (
    <div className="genshint-interval-container">
      <div className="genshint-interval-header">
        <h3>五星间隔分析</h3>
        <button 
          className="genshint-btn secondary"
          onClick={onCalculate}
          disabled={loading}
        >
          {loading ? '计算中...' : '重新计算间隔'}
        </button>
      </div>
      
      {!loading && intervals && intervals.length === 0 ? (
        <div className="genshint-empty-state">
          <p>暂无五星间隔数据，请先获取抽卡记录并点击"重新计算间隔"</p>
        </div>
      ) : (
        <>
          {stats && (
            <div className="genshint-interval-stats">
              <div className="genshint-stat-card">
                <h4>平均间隔</h4>
                <p className="genshint-stat-value">{stats.average.toFixed(1)}</p>
                <p className="genshint-stat-label">抽数</p>
              </div>
              <div className="genshint-stat-card">
                <h4>最大间隔</h4>
                <p className="genshint-stat-value">{stats.max}</p>
                <p className="genshint-stat-label">抽数</p>
              </div>
              <div className="genshint-stat-card">
                <h4>最小间隔</h4>
                <p className="genshint-stat-value">{stats.min}</p>
                <p className="genshint-stat-label">抽数</p>
              </div>
              <div className="genshint-stat-card">
                <h4>总记录数</h4>
                <p className="genshint-stat-value">{total}</p>
                <p className="genshint-stat-label">条</p>
              </div>
            </div>
          )}
          
          {intervals && intervals.length > 0 && (
            <div className="genshint-interval-table-container">
              <table className="genshint-interval-table">
                <thead>
                  <tr>
                    <th>卡池类型</th>
                    <th>五星物品</th>
                    <th>获取时间</th>
                    <th>间隔抽数</th>
                    <th>玩家ID</th>
                  </tr>
                </thead>
                <tbody>
                  {intervals.map((interval, index) => (
                    <tr key={index} className="genshint-interval-row">
                      <td>{getGachaTypeName(interval.gacha_type)}</td>
                      <td>
                        <div className="genshint-item-info">
                          <span className="genshint-item-name">{interval.five_star_name}</span>
                        </div>
                      </td>
                      <td>
                          <span className="genshint-item-time">
                            {new Date(interval.record_time).toLocaleString()}
                          </span>
                      </td>
                      <td className="genshint-interval-value-container">
                        <div className="interval-value-wrapper">
                          <span className={interval.pulls_between > 70 ? 'high' : ''}>
                            {interval.pulls_between}
                          </span>
                          
                          {/* 进度条组件 */}
                          <div className="interval-progress-container">
                            <div 
                              className="interval-progress-bar"
                              style={{
                                width: `${Math.min(interval.pulls_between, 90) / 90 * 100}%`,
                                backgroundColor: getProgressColor(interval.pulls_between)
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>{interval.uid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="genshint-table-info">
                <p>共 {total} 条间隔记录</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// 计算统计数据
const calculateStats = (intervals) => {
  const intervalsValues = intervals.map(item => item.pulls_between);
  return {
    average: intervalsValues.reduce((sum, val) => sum + val, 0) / intervalsValues.length,
    max: Math.max(...intervalsValues),
    min: Math.min(...intervalsValues)
  };
};

export default IntervalAnalysis;
