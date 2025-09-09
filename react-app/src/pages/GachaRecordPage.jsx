import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Spin } from 'antd';
import moment from 'moment';
import TopNav from '../components/Genshin/TopNav';
import PoolSelector from '../components/Genshin/PoolSelector';
import RecordList from '../components/Genshin/RecordList';
import RuleExplain from '../components/Genshin/RuleExplain';
import DataStat from '../components/Genshin/DataStat';
import ErrorHandler from '../components/Genshin/ErrorHandler';
import {
  getUserServerInfo,
  getPoolList,
  getGachaRecords,
  getPoolRule,
  exportGachaRecords,
  getErrorInfo
} from '../services/gachaService';

const { Content, Footer } = Layout;

const GachaRecordPage = () => {
  // 1. 基础状态
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null); // 用户/服务器信息
  const [serverTime, setServerTime] = useState(''); // 服务器时间
  const [localTime, setLocalTime] = useState(''); // 本地时间

  // 2. 池子相关状态
  const [poolList, setPoolList] = useState([]); // 池子列表
  const [activePoolId, setActivePoolId] = useState(''); // 当前选中池子ID
  const [filterType, setFilterType] = useState('current'); // 池子筛选类型
  const [newbieDrawnCount, setNewbieDrawnCount] = useState(0); // 新手池已抽次数

  // 3. 记录相关状态
  const [records, setRecords] = useState([]); // 抽卡记录
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 }); // 分页
  const [renderMode, setRenderMode] = useState('table'); // 渲染模式（table/card）
  const [filters, setFilters] = useState({}); // 筛选条件（rankType/itemType/timeRange）
  const [searchValue, setSearchValue] = useState(''); // 搜索关键词

  // 4. 规则与统计状态
  const [ruleData, setRuleData] = useState({}); // 规则数据
  const [statData, setStatData] = useState({}); // 统计数据
  const [starDistribution, setStarDistribution] = useState({ 3: 0, 4: 0, 5: 0 }); // 星级分布
  const [dailyDrawData, setDailyDrawData] = useState([]); // 每日抽卡数据

  // 5. 错误状态
  const [errorInfo, setErrorInfo] = useState(null); // 错误信息

  // --- 时间更新函数（每秒更新一次）---
  useEffect(() => {
    const updateTime = () => {
      // 服务器时间（假设服务器时区为UTC+8，可从userInfo.server提取）
      const serverTz = userInfo?.server ? (userInfo.server.includes('UTC+8') ? 'UTC+8' : 'UTC') : 'UTC';
      const currentServerTime = moment().utcOffset(serverTz).format('YYYY-MM-DD HH:mm:ss');
      // 本地时间
      const currentLocalTime = moment().format('YYYY-MM-DD HH:mm:ss');
      
      setServerTime(currentServerTime);
      setLocalTime(currentLocalTime);
    };

    updateTime(); // 初始执行
    const timer = setInterval(updateTime, 1000); // 每秒更新
    return () => clearInterval(timer); // 清除定时器
  }, [userInfo]);

  // --- 初始化：获取用户/服务器/池子列表 ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // 1. 获取用户与服务器信息
        const userServerData = await getUserServerInfo();
        setUserInfo(userServerData);

        // 2. 获取当前开放池子列表
        const poolData = await getPoolList(filterType);
        setPoolList(poolData);

        // 3. 默认选中第一个池子
        if (poolData.length > 0) {
          setActivePoolId(poolData[0].id);
        } else {
          setActivePoolId(''); // 可选：为空时清空选中状态
        }

        setErrorInfo(null);
      } catch (err) {
        const code = err.response?.data?.errorCode || 'default';
        setErrorInfo({ ...getErrorInfo(code), errorCode: code });
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [filterType]);
  
  // --- 计算统计数据（累计抽数、保底进度、星级分布等）---
  const calculateStatData = useCallback((records, totalDraws) => {
    if (!records.length) {
      setStatData({ totalDraws: 0, guarantee: { fiveStarRemain: 90, fourStarRemain: 10 }, starStat: {} });
      setStarDistribution({ 3: 0, 4: 0, 5: 0 });
      setDailyDrawData([]);
      return;
    }

    // 1. 星级分布统计
    const distribution = records.reduce((acc, record) => {
      acc[record.rankType] = (acc[record.rankType] || 0) + 1;
      return acc;
    }, { 3: 0, 4: 0, 5: 0 });
    setStarDistribution(distribution);

    // 2. 出金统计（★5/★4数量+最近★5时间）
    const fiveStarRecords = records.filter(r => r.rankType === '5');
    const fourStarRecords = records.filter(r => r.rankType === '4');
    const starStat = {
      fiveStarCount: fiveStarRecords.length,
      fiveStarLastTime: fiveStarRecords.length > 0 ? moment(fiveStarRecords[0].serverTime).format('YYYY-MM-DD HH:mm') : '',
      fourStarCount: fourStarRecords.length
    };

    // 3. 保底进度计算（★5：90抽保底，★4：10抽保底）
    // 找到最后一次出★5的索引
    const lastFiveStarIndex = records.findIndex(r => r.rankType === '5');
    const fiveStarDrawn = lastFiveStarIndex === -1 ? totalDraws : totalDraws - lastFiveStarIndex;
    const fiveStarRemain = Math.max(0, 90 - fiveStarDrawn);

    // 找到最后一次出★4的索引
    const lastFourStarIndex = records.findIndex(r => r.rankType === '4');
    const fourStarDrawn = lastFourStarIndex === -1 ? totalDraws : totalDraws - lastFourStarIndex;
    const fourStarRemain = Math.max(0, 10 - fourStarDrawn);

    // 4. 每日抽卡统计（近30天）
    const dailyData = {};
    // 生成近30天日期（初始化count为0）
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      dailyData[date] = 0;
    }
    // 统计每日抽卡次数
    records.forEach(record => {
      const date = moment(record.serverTime).format('YYYY-MM-DD');
      if (dailyData[date] !== undefined) {
        dailyData[date] += 1;
      }
    });
    // 转换为数组格式
    const dailyDrawArr = Object.entries(dailyData).map(([date, count]) => ({ date, count }));
    setDailyDrawData(dailyDrawArr);

    // 5. 更新统计数据
    setStatData({
      totalDraws,
      guarantee: { fiveStarRemain, fourStarRemain },
      starStat
    });

    // 6. 计算新手池已抽次数（仅新手池）
    const isNewbiePool = poolList.find(p => p.id === activePoolId)?.name.includes('新手池');
    if (isNewbiePool) {
      setNewbieDrawnCount(totalDraws);
    }
  }, [poolList, activePoolId]);

  // --- 选中池子变更：获取对应记录+规则+统计 ---
  // 修正：提取为顶层函数
  const fetchPoolData = useCallback(async () => {
    if (!activePoolId) return;
    try {
      setLoading(true);
      const ruleData = await getPoolRule(activePoolId);
      setRuleData(ruleData);
      const { records, total } = await getGachaRecords(activePoolId, pagination.current, pagination.pageSize, filters);
      setRecords(records);
      setPagination(prev => ({ ...prev, total }));
      calculateStatData(records, total);
      setErrorInfo(null);
    } catch (err) {
      const code = err.response?.data?.errorCode || 'default';
      setErrorInfo({ ...getErrorInfo(code), errorCode: code });
      setRecords([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [activePoolId, pagination, filters, calculateStatData]);


  

  // --- 子组件回调函数 ---
  // 1. 刷新记录
  const handleRefresh = () => {
    fetchPoolData();
  };

  // 2. 导出记录
  const handleExport = () => {
    if (!records.length) return;
    const activePool = poolList.find(p => p.id === activePoolId)?.name || '抽卡池';
    exportGachaRecords(records, 'xlsx', activePool); // 导出Excel（默认）
  };

  // 3. 池子切换
  const handlePoolChange = (poolId) => {
    setActivePoolId(poolId);
    setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
  };

  // 4. 分页切换
  const handlePageChange = (current) => {
    setPagination(prev => ({ ...prev, current }));
  };

  // 5. 模式切换（表格/卡片）
  const handleModeChange = (mode) => {
    setRenderMode(mode);
  };

  // 6. 筛选条件变更
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 })); // 筛选后重置到第一页
  };

  // 7. 搜索变更
  const handleSearchChange = (value) => {
    setSearchValue(value);
    // 搜索逻辑：前端过滤（或后端过滤，此处为前端示例）
    const filteredRecords = records.filter(record => 
      record.name.toLowerCase().includes(value.toLowerCase())
    );
    setRecords(filteredRecords);
  };

  // 8. 关闭错误提示
  const handleErrorClose = () => {
    setErrorInfo(null);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <TopNav
        userInfo={userInfo}
        serverTime={serverTime}
        localTime={localTime}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* 内容区 */}
      <Content style={{ padding: '0 50px' }}>
        <Spin spinning={loading} tip="加载中...">
          {/* 错误提示区 */}
          <ErrorHandler errorInfo={errorInfo} onClose={handleErrorClose} />

          {/* 池子选择区 */}
          <PoolSelector
            poolList={poolList}
            activePoolId={activePoolId}
            filterType={filterType}
            onPoolChange={handlePoolChange}
            onFilterChange={setFilterType}
            newbieDrawnCount={newbieDrawnCount}
          />

          {/* 记录展示区 */}
          <RecordList
            records={records}
            renderMode={renderMode}
            pagination={pagination}
            filters={filters}
            searchValue={searchValue}
            onModeChange={handleModeChange}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          {/* 规则说明区 */}
          <RuleExplain ruleData={ruleData} />

          {/* 数据统计区 */}
          <DataStat
            statData={statData}
            starDistribution={starDistribution}
            dailyDrawData={dailyDrawData}
          />
        </Spin>
      </Content>

      {/* 页脚 */}
      <Footer style={{ textAlign: 'center' }}>
        抽卡记录展示系统 ©{moment().year()} Genshin同人工具（数据来源：游戏内API）
      </Footer>
    </Layout>
  );
};

export default GachaRecordPage;