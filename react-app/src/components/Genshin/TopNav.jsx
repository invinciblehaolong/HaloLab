import React, { useState } from 'react';
import { Layout, Button, Typography, Space, Modal } from 'antd';
import { SyncOutlined, QuestionCircleOutlined, DownloadOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

/**
 * 顶部导航与基础信息区
 * @props {Object} userInfo - 用户信息（server: 服务器, username: 用户名）
 * @props {string} serverTime - 服务器时间（YYYY-MM-DD HH:mm）
 * @props {string} localTime - 本地时间（YYYY-MM-DD HH:mm）
 * @props {Function} onRefresh - 刷新记录回调
 * @props {Function} onExport - 导出记录回调
 */
const TopNav = ({ userInfo, serverTime, localTime, onRefresh, onExport }) => {
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // 帮助弹窗内容（规则说明）
  const helpContent = (
    <div style={{ lineHeight: 1.8 }}>
      <p>1. 记录更新延迟约1小时，请耐心等待</p>
      <p>2. 支持查询近1年抽卡记录（部分服务器为半年）</p>
      <p>3. 导出功能仅包含当前页面展示的记录</p>
      <p>4. 服务器时间基于当前服务器时区（如天空岛→UTC+8）</p>
    </div>
  );

  return (
    <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* 左侧：用户与服务器信息 */}
      <Space size="middle">
        <Text strong>服务器：{userInfo?.server || '加载中...'}</Text>
        <Text>用户名：{userInfo?.username || '未登录'}</Text>
        <Text type="secondary">服务器时间：{serverTime}</Text>
        <Text type="secondary">本地时间：{localTime}</Text>
      </Space>

      {/* 右侧：功能按钮 */}
      <Space size="small">
        <Button 
          icon={<SyncOutlined />} 
          onClick={onRefresh} 
          type="primary" 
          size="middle"
        >
          刷新记录
        </Button>
        <Button 
          icon={<QuestionCircleOutlined />} 
          onClick={() => setHelpModalVisible(true)} 
          size="middle"
        >
          帮助
        </Button>
        <Button 
          icon={<DownloadOutlined />} 
          onClick={onExport} 
          size="middle"
        >
          导出记录
        </Button>
      </Space>

      {/* 帮助弹窗 */}
      <Modal
        title="抽卡记录规则说明"
        open={helpModalVisible}
        onCancel={() => setHelpModalVisible(false)}
        footer={null}
        width={500}
      >
        {helpContent}
      </Modal>
    </Header>
  );
};

export default TopNav;