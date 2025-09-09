import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../assets/styles/frame.css'

const FrameChart = ({ data }) => {
  // 新增排序状态管理
  const [starSort, setStarSort] = useState('desc'); // 默认为降序
  const [npmSort, setNpmSort] = useState('desc');   // 默认为降序

  // 处理排序逻辑（新增核心函数）
  const getSortedData = (type, sortType) => {
    const key = type === 'star' ? 'star' : 'npmdownload';
    let sorted = [...data.frameworks];
    
    // 根据排序类型处理
    switch(sortType) {
      case 'desc': // 降序
        sorted.sort((a, b) => Number(b[key]) - Number(a[key]));
        break;
      case 'asc':  // 升序
        sorted.sort((a, b) => Number(a[key]) - Number(b[key]));
        break;
      default:     // 默认顺序（原数据顺序）
        sorted = [...data.frameworks];
    }
    
    return sorted.map(item => ({ 
      name: item.name, 
      value: Number(item[key]) 
    }));
  };

  // 切换排序类型（新增核心函数）
  const toggleSort = (type) => {
    if (type === 'star') {
      setStarSort(prev => prev === 'desc' ? 'asc' : prev === 'asc' ? 'default' : 'desc');
    } else {
      setNpmSort(prev => prev === 'desc' ? 'asc' : prev === 'asc' ? 'default' : 'desc');
    }
  };

  const COLORS = {
    star: '#0071e3',
    npmDownload: '#34c759',
    grid: 'rgba(220, 220, 220, 0.2)',
    axis: 'rgba(150, 150, 150, 0.6)',
    background: 'rgba(255, 255, 255, 0.7)'
  };

  // 通用图表组件（修改表头为可点击按钮）
  const Chart = ({ title, type }) => {
    const sortType = type === 'star' ? starSort : npmSort;
    const sortedData = getSortedData(type, sortType);
    const label = type === 'star' ? 'GitHub Star' : 'npm 周下载量';
    const color = type === 'star' ? COLORS.star : COLORS.npmDownload;

    return (
      <div className="chart-container">
        {/* 表头改为可点击排序按钮 */}
        <h2 >
          <button 
            onClick={() => toggleSort(type)}>
            {title}
            <span style={{ fontSize: '0.8em' }}>
              {sortType === 'desc' ? '↓降序' : sortType === 'asc' ? '↑升序' : '默认'}
            </span>
          </button>
        </h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: COLORS.axis, fontSize: 14 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: COLORS.axis, fontSize: 14 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px'
              }}
              formatter={(value) => [value.toLocaleString(), label]}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={color} 
              name={label} 
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div>
      {/* GitHub Star 图表 */}
      <Chart 
        title="前端框架 GitHub Star 数量" 
        type="star" 
      />
      
      {/* npm 下载量图表 */}
      <Chart 
        title="前端框架 npm 周下载量" 
        type="npm" 
      />
    </div>
  );
};

export default FrameChart;