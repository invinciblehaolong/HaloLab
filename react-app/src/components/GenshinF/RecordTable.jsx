import React from 'react';
import { 
  formatGachaTime, 
  getGachaTypeName, 
  getRankColorClass 
} from '../../services/genshinFService';

const RecordTable = ({ records, loading, total }) => {
  if (loading) {
    return (
      <div className="genshint-loading">
        <div className="genshint-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="genshint-empty-state">
        <p>暂无抽卡记录，请先提交抽卡链接获取数据</p>
      </div>
    );
  }

  return (
    <div className="genshint-record-table-container">
      <div className="genshint-table-info">
        <p>共 {total} 条记录</p>
      </div>
      <table className="genshint-record-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>卡池类型</th>
            <th>物品名称</th>
            <th>稀有度</th>
            <th>玩家ID</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={index} className="genshint-record-row">
              <td>{formatGachaTime(record.time)}</td>
              <td>{getGachaTypeName(record.gacha_type)}</td>
              <td>{record.name}</td>
              <td>
                <span className={`genshint-rank-badge ${getRankColorClass(record.rank_type)}`}>
                  {record.rank_type}星
                </span>
              </td>
              <td>{record.uid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordTable;
