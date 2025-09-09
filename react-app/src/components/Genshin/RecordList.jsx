import React from 'react';
import { Table, Card, Space, Typography, Pagination, Select, Input, DatePicker, Row, Col, Empty } from 'antd';
import { SearchOutlined, SwapOutlined  } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 抽卡记录展示区
 * @props {Array} records - 抽卡记录列表
 * @props {string} renderMode - 渲染模式（table/card）
 * @props {Object} pagination - 分页信息（current: 当前页, pageSize: 每页条数, total: 总条数）
 * @props {Object} filters - 筛选条件（rankType: 星级, itemType: 物品类型, timeRange: 时间范围）
 * @props {string} searchValue - 搜索关键词（物品名称）
 * @props {Function} onModeChange - 模式切换回调（参数：mode）
 * @props {Function} onPageChange - 分页切换回调（参数：current, pageSize）
 * @props {Function} onFilterChange - 筛选条件变更回调（参数：filters）
 * @props {Function} onSearchChange - 搜索回调（参数：value）
 */
const RecordList = ({
  records = [],
  renderMode = 'table',
  pagination = { current: 1, pageSize: 20, total: 0 },
  filters = {},
  searchValue = '',
  onModeChange,
  onPageChange,
  onFilterChange,
  onSearchChange
}) => {
  // 星级颜色映射
  const rankColorMap = {
    '3': '#4169e1', // 蓝色（★3）
    '4': '#9370db', // 紫色（★4）
    '5': '#ffd700'  // 金色（★5）
  };

  // 表格列配置
  const tableColumns = [
    {
      title: '抽卡时间',
      dataIndex: 'serverTime',
      key: 'time',
      render: (serverTime, record) => (
        <div>
          <Text>服务器：{moment(serverTime).format('YYYY-MM-DD HH:mm')}</Text>
          <br />
          <Text type="secondary">本地：{moment(record.localTime).format('YYYY-MM-DD HH:mm')}</Text>
        </div>
      )
    },
    {
      title: '物品名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Text style={{ color: rankColorMap[record.rankType], fontWeight: 'bold' }}>
          ★{record.rankType} {name} {record.isUp ? <Text type="danger">【UP】</Text> : ''}
        </Text>
      )
    },
    {
      title: '物品类型',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (itemType) => (
        <Text>{itemType === 'Character' ? '角色' : '武器'}</Text>
      ),
      filters: [
        { text: '角色', value: 'Character' },
        { text: '武器', value: 'Weapon' }
      ],
      filteredValue: filters.itemType ? [filters.itemType] : null,
      onFilter: (value) => onFilterChange({ ...filters, itemType: value })
    },
    {
      title: '池子类型',
      dataIndex: 'poolType',
      key: 'poolType'
    }
  ];

  // 渲染卡片模式
  const renderCardMode = () => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {records.map(record => (
          <Card
            key={record.id}
            style={{ width: 220, margin: 10, borderLeftColor: rankColorMap[record.rankType], borderLeftWidth: 4 }}
            title={
              <Text style={{ color: rankColorMap[record.rankType], fontWeight: 'bold' }}>
                ★{record.rankType} {record.name}
              </Text>
            }
            extra={record.isUp ? <Text type="danger">【UP】</Text> : null}
          >
            <Space direction="vertical" size="small">
              <Text type="secondary">类型：{record.itemType === 'Character' ? '角色' : '武器'}</Text>
              <Text type="secondary">池子：{record.poolType}</Text>
              <Text type="secondary">服务器时间：{moment(record.serverTime).format('YYYY-MM-DD HH:mm')}</Text>
            </Space>
          </Card>
        ))}
      </div>
    );
  };

  // 时间范围筛选处理
  const handleTimeRangeChange = (dates, dateStrings) => {
    if (dateStrings.length === 2) {
      onFilterChange({ ...filters, timeRange: { start: dateStrings[0], end: dateStrings[1] } });
    }
  };

  // 星级筛选处理
  const handleRankFilterChange = (value) => {
    onFilterChange({ ...filters, rankType: value });
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 顶部：模式切换+筛选+搜索 */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        {/* 模式切换 */}
        <Col span={4}>
          <Space size="middle">
            <SwapOutlined  />
            <Select value={renderMode} onChange={onModeChange}>
              <Option value="table">表格模式</Option>
              <Option value="card">卡片模式</Option>
            </Select>
          </Space>
        </Col>

        {/* 星级筛选 */}
        <Col span={4}>
          <Select
            placeholder="筛选星级"
            value={filters.rankType || undefined}
            onChange={handleRankFilterChange}
            allowClear
          >
            <Option value="3">★3</Option>
            <Option value="4">★4</Option>
            <Option value="5">★5</Option>
          </Select>
        </Col>

        {/* 时间范围筛选 */}
        <Col span={8}>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            format="YYYY-MM-DD"
            value={filters.timeRange ? [moment(filters.timeRange.start), moment(filters.timeRange.end)] : null}
            onChange={handleTimeRangeChange}
            allowClear
          />
        </Col>

        {/* 搜索 */}
        <Col span={8}>
          <Input
            placeholder="搜索物品名称（如：芙宁娜）"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
      </Row>

      {/* 记录展示区 */}
      {records.length > 0 ? (
        renderMode === 'table' ? (
          <Table
            columns={tableColumns}
            dataSource={records}
            rowKey="id"
            pagination={false} // 关闭表格内置分页，用外部分页
            bordered
          />
        ) : (
          renderCardMode()
        )
      ) : (
        <Empty
          description={
            <Text>暂无抽卡记录（记录更新延迟约1小时，或已超过查询有效期）</Text>
          }
        />
      )}

      {/* 底部：分页控件 */}
      {pagination.total > 0 && (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={onPageChange}
            showSizeChanger={false} // 固定每页20条（API限制）
            showQuickJumper
            showTotal={(total) => `共 ${total} 条记录`}
          />
        </div>
      )}
    </div>
  );
};

export default RecordList;