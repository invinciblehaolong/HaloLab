import React from 'react';
import { getGachaTypeName } from '../../services/genshinFService';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  isIntervalMode = false,
  loading,
  total
}) => {
  
  // 计算是否为最后一页
  const isLastPage = Math.ceil(total / filters.limit) <= filters.page;
  // 卡池类型选项
  const gachaTypeOptions = [
    { value: '', label: '全部卡池' },
    { value: 100, label: getGachaTypeName(100) },
    { value: 200, label: getGachaTypeName(200) },
    { value: 301, label: getGachaTypeName(301) },
    { value: 302, label: getGachaTypeName(302) },
    { value: 400, label: getGachaTypeName(400) }
  ];
  
  // 稀有度选项（仅在非间隔模式下显示）
  const rankOptions = [
    { value: '', label: '全部稀有度' },
    { value: 3, label: '3星' },
    { value: 4, label: '4星' },
    { value: 5, label: '5星' }
  ];

  const handleChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    // 只有当修改的不是page时，才重置page为1
    if (name !== 'page') {
      newFilters.page = 1;
    }
    onFilterChange(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    handleChange('page', newPage);
  };

  return (
    <div className="genshint-filter-panel">
      <div className="genshint-filter-group">
        <div className="genshint-filter-item">
          <label className="genshint-filter-label">玩家ID：</label>
          <input
            type="text"
            value={filters.uid || ''}
            onChange={(e) => handleChange('uid', e.target.value)}
            placeholder="输入玩家ID筛选"
            className="genshint-filter-input"
            disabled={loading}
          />
        </div>
        
        <div className="genshint-filter-item">
          <label className="genshint-filter-label">卡池类型：</label>
          <select
            value={filters.gacha_type || ''}
            onChange={(e) => handleChange('gacha_type', e.target.value ? Number(e.target.value) : '')}
            className="genshint-filter-select"
            disabled={loading}
          >
            {gachaTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {!isIntervalMode && (
          <div className="genshint-filter-item">
            <label className="genshint-filter-label">稀有度：</label>
            <select
              value={filters.rank_type || ''}
              onChange={(e) => handleChange('rank_type', e.target.value ? Number(e.target.value) : '')}
              className="genshint-filter-select"
              disabled={loading}
            >
              {rankOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="genshint-filter-item">
          <label className="genshint-filter-label">每页条数：</label>
          <select
            value={filters.limit || ''}
            onChange={(e) => handleChange('limit', Number(e.target.value))}
            className="genshint-filter-select"
            disabled={loading}
          >
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
            <option value={100}>100条/页</option>
            <option value={200}>200条/页</option>
          </select>
        </div>
      </div>
      
      {/* 分页控件 */}
      <div className="genshint-pagination">
        <button
          className="genshint-btn"
          onClick={() => handlePageChange(filters.page - 1)}
          disabled={loading || filters.page <= 1}
        >
          上一页
        </button>
        <span className="genshint-page-info">
          第 {filters.page} 页
        </span>
        <button
          className="genshint-btn"
          onClick={() => handlePageChange(filters.page + 1)}
          disabled={loading || isLastPage}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
