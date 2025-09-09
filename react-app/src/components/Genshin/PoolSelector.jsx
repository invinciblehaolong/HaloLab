import React from 'react';
import { Card, Radio, Space, Typography, Badge } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * 抽卡池类型选择区
 * @props {Array} poolList - 池子列表（id/name/typeTag/status/totalLimit）
 * @props {string} activePoolId - 当前选中的池子ID
 * @props {string} filterType - 筛选类型（current/history）
 * @props {Function} onPoolChange - 池子切换回调（参数：poolId）
 * @props {Function} onFilterChange - 筛选类型切换回调（参数：filterType）
 * @props {number} newbieDrawnCount - 新手池已抽次数（仅新手池需传）
 */
const PoolSelector = ({ 
  poolList = [], 
  activePoolId, 
  filterType = 'current', 
  onPoolChange, 
  onFilterChange,
  newbieDrawnCount = 0
}) => {
  // 筛选类型切换
  const handleFilterChange = (e) => {
    onFilterChange(e.target.value);
  };

  // 渲染池子卡片
  const renderPoolCard = (pool) => {
    // 新手池计算剩余次数
    const isNewbiePool = pool.name.includes('新手池');
    const remainingDraws = isNewbiePool ? pool.totalLimit - newbieDrawnCount : 0;

    return (
      <Card
        key={pool.id}
        title={pool.name}
        bordered
        style={{ 
          width: 280, 
          margin: 10, 
          cursor: 'pointer',
          borderColor: activePoolId === pool.id ? '#ffd700' : '#d9d9d9', // 选中态：金色边框
          boxShadow: activePoolId === pool.id ? '0 0 8px rgba(255,215,0,0.5)' : 'none'
        }}
        onClick={() => onPoolChange(pool.id)}
      >
        <Space direction="vertical" size="small">
          {/* 池子类型标识（如★5 UP：芙宁娜） */}
          <Text strong style={{ color: '#ff4500' }}>{pool.typeTag}</Text>
          
          {/* 开放状态 */}
          <Badge status={pool.status === '已开放' ? 'success' : 'default'} text={pool.status} />
          
          {/* 新手池剩余次数 */}
          {isNewbiePool && (
            <Text type="secondary">
              剩余 {remainingDraws} 抽（共 {pool.totalLimit} 抽上限）
            </Text>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ padding: 20, background: '#fafafa' }}>
      {/* 筛选器 */}
      <Space size="middle" style={{ marginBottom: 16 }}>
        <FilterOutlined />
        <Radio.Group value={filterType} onChange={handleFilterChange}>
          <Radio.Button value="current">当前开放池子</Radio.Button>
          <Radio.Button value="history">历史池子</Radio.Button>
        </Radio.Group>
      </Space>

      {/* 池子卡片列表（流式布局） */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {Array.isArray(poolList) ? (
          poolList.length > 0 
            ? poolList.map(renderPoolCard) 
            : <Text type="warning">暂无池子数据</Text>
        ) : (
          <Text type="error">数据格式错误，无法加载池子列表</Text>
        )}
      </div>
    </div>
  );
};

export default PoolSelector;