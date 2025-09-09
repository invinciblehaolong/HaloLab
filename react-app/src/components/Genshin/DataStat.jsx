import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const { Text, Title } = Typography;

/**
 * 抽卡数据统计区
 * @props {Object} statData - 统计数据（totalDraws: 累计抽数, guarantee: 保底进度, starStat: 出金统计）
 * @props {Object} starDistribution - 星级分布（3: 数量, 4: 数量, 5: 数量）
 * @props {Array} dailyDrawData - 近30天每日抽卡数据（{date: 日期, count: 次数}）
 */
const DataStat = ({
  statData = {},
  starDistribution = { 3: 0, 4: 0, 5: 0 },
  dailyDrawData = []
}) => {
  const { totalDraws = 0, guarantee = {}, starStat = {} } = statData;
  const { fiveStarRemain = 0, fourStarRemain = 0 } = guarantee;
  const { fiveStarCount = 0, fiveStarLastTime = '', fourStarCount = 0 } = starStat;

  // 星级分布图表配置
  const pieData = [
    { name: '★3', value: starDistribution[3], color: '#4169e1' },
    { name: '★4', value: starDistribution[4], color: '#9370db' },
    { name: '★5', value: starDistribution[5], color: '#ffd700' }
  ].filter(item => item.value > 0);

  return (
    <Row gutter={[20, 20]} style={{ margin: 20 }}>
      {/* 左侧：统计信息卡片 */}
      <Col span={8}>
        <Card title="抽卡统计概览">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Text strong>累计抽数：{totalDraws} 次</Text>
            
            <div>
              <Text>距下次★5保底：{fiveStarRemain} 抽（已抽 {90 - fiveStarRemain} 次）</Text>
              <br />
              <Text>距下次★4保底：{fourStarRemain} 抽（已抽 {10 - fourStarRemain} 次）</Text>
            </div>
            
            <div>
              <Text type="danger">★5物品：{fiveStarCount} 个</Text>
              {fiveStarLastTime && <Text type="secondary">（最近1次：{fiveStarLastTime}）</Text>}
              <br />
              <Text type="purple">★4物品：{fourStarCount} 个</Text>
            </div>
          </Space>
        </Card>
      </Col>

      {/* 中间：星级分布饼图 */}
      <Col span={8}>
        <Card title="星级分布">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Text type="warning" style={{ display: 'block', textAlign: 'center', padding: 40 }}>
              暂无数据可展示
            </Text>
          )}
        </Card>
      </Col>

      {/* 右侧：每日抽卡折线图 */}
      <Col span={8}>
        <Card title="近30天每日抽卡次数">
          {dailyDrawData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyDrawData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} 次`, '抽卡次数']} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ff4500"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Text type="warning" style={{ display: 'block', textAlign: 'center', padding: 40 }}>
              暂无数据可展示
            </Text>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default DataStat;