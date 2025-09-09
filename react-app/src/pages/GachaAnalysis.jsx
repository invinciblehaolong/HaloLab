import React, { useState, useEffect, useCallback } from 'react';
import { 
  getGachaRecords, 
  getIntervalRecords, 
  calculateIntervals 
} from '../services/genshinFService';
import UrlInput from '../components/GenshinF/UrlInput';
import FilterPanel from '../components/GenshinF/FilterPanel';
import RecordTable from '../components/GenshinF/RecordTable';
import IntervalAnalysis from '../components/GenshinF/IntervalAnalysis';
import '../assets/styles/genshinF.css'

const GachaAnalysis = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('records'); // 'records' 或 'intervals'
  const [records, setRecords] = useState([]);
  const [intervals, setIntervals] = useState(null);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [intervalsTotal, setIntervalsTotal] = useState(0);
  const [loading, setLoading] = useState({
    records: false,
    intervals: false,
    calculate: false
  });
  const [error, setError] = useState('');
  
  // 筛选条件状态
  const [recordFilters, setRecordFilters] = useState({
    uid: '',
    gacha_type: '',
    rank_type: '',
    page: 1,
    limit: 100
  });
  
  const [intervalFilters, setIntervalFilters] = useState({
    uid: '',
    gacha_type: '',
    page: 1,
    limit: 50
  });

  // 获取抽卡记录
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, records: true }));
      setError('');
      
      const response = await getGachaRecords(recordFilters);
      
      if (response.success) {
        setRecords(response.data.records || []);
        setRecordsTotal(response.data.pagination.total || 0);
      } else {
        setError(response.message || '获取抽卡记录失败');
      }
    } catch (err) {
      setError(err.message || '获取抽卡记录时发生错误');
    } finally {
      setLoading(prev => ({ ...prev, records: false }));
    }
  }, [recordFilters]);

  // 获取间隔记录
  const fetchIntervals = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, intervals: true }));
      setError('');
      
      const response = await getIntervalRecords(intervalFilters);
      
      if (response.success) {
        setIntervals(response.data.intervals || []);
        setIntervalsTotal(response.data.pagination.total || 0);
      } else {
        setError(response.message || '获取间隔记录失败');
      }
    } catch (err) {
      setError(err.message || '获取间隔记录时发生错误');
    } finally {
      setLoading(prev => ({ ...prev, intervals: false }));
    }
  }, [intervalFilters]);

  // 计算五星间隔
  const handleCalculateIntervals = async () => {
    try {
      setLoading(prev => ({ ...prev, calculate: true }));
      setError('');
      
      const response = await calculateIntervals();
      
      if (response.success) {
        // 计算成功后重新获取间隔数据
        fetchIntervals();
      } else {
        setError(response.message || '计算间隔失败');
      }
    } catch (err) {
      setError(err.message || '计算间隔时发生错误');
    } finally {
      setLoading(prev => ({ ...prev, calculate: false }));
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchRecords();
    fetchIntervals();
  }, [fetchRecords, fetchIntervals]);

  // 当记录更新时重新加载
  const handleRecordsUpdated = () => {
    fetchRecords();
    // 也重新加载间隔，因为新记录可能影响间隔计算
    fetchIntervals();
  };

  // 处理记录筛选变化
  const handleRecordFilterChange = (newFilters) => {
    setRecordFilters(newFilters);
  };

  // 处理间隔筛选变化
  const handleIntervalFilterChange = (newFilters) => {
    setIntervalFilters(newFilters);
  };

  return (
    <div className="genshint-container">
      <header className="genshint-header">
        <h1>Genshin抽卡记录分析</h1>
        <p>导入抽卡记录，分析你的抽卡数据</p>
      </header>
      
      {/* 错误提示 */}
      {error && (
        <div className="genshint-error-message">
          {error}
          <button 
            className="genshint-close-btn"
            onClick={() => setError('')}
          >
            &times;
          </button>
        </div>
      )}
      
      {/* 抽卡链接输入区域 */}
      <div className="genshint-url-section">
        <UrlInput onRecordsUpdated={handleRecordsUpdated} />
      </div>
      
      {/* 内容标签页 */}
      <div className="genshint-tabs">
        <div 
          className={`genshint-tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          抽卡记录
        </div>
        <div 
          className={`genshint-tab ${activeTab === 'intervals' ? 'active' : ''}`}
          onClick={() => setActiveTab('intervals')}
        >
          五星间隔分析
        </div>
      </div>
      
      {/* 抽卡记录内容 */}
      {activeTab === 'records' && (
        <div className="genshint-tab-content">
          <FilterPanel
            filters={recordFilters}
            onFilterChange={handleRecordFilterChange}
            loading={loading.records}
            total={recordsTotal}
          />
          <RecordTable
            records={records}
            loading={loading.records}
            total={recordsTotal}
          />
        </div>
      )}
      
      {/* 五星间隔分析内容 */}
      {activeTab === 'intervals' && (
        <div className="genshint-tab-content">
          <FilterPanel
            filters={intervalFilters}
            onFilterChange={handleIntervalFilterChange}
            isIntervalMode={true}
            loading={loading.intervals || loading.calculate}
            total={intervalsTotal}
          />
          <IntervalAnalysis
            intervals={intervals}
            loading={loading.intervals || loading.calculate}
            total={intervalsTotal}
            onCalculate={handleCalculateIntervals}
          />
        </div>
      )}
      
      <footer className="genshint-footer">
        <p>Genshin抽卡分析工具 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default GachaAnalysis;
