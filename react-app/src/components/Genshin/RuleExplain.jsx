import React, { useState } from 'react';
import { Card, Button, Typography, Modal, Space } from 'antd';

const { Text, Title } = Typography;

/**
 * 抽卡规则与概率说明区
 * @props {Object} ruleData - 规则数据（probability/guarantee/duplicate/commonRules）
 */
const RuleExplain = ({ ruleData = {} }) => {
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const { probability, guarantee, duplicate, commonRules } = ruleData;

  return (
    <Card title="当前池子规则与概率" style={{ margin: 20 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 概率信息 */}
        <div>
          <Title level={5}>概率说明</Title>
          <Text>★5 基础概率：{probability?.fiveStarBase || '0.6%'}</Text>
          <br />
          <Text>★5 综合概率（含保底）：{probability?.fiveStarTotal || '1.6%'}</Text>
          <br />
          <Text>★4 基础概率：{probability?.fourStarBase || '5.1%'}</Text>
          <br />
          <Text>★4 综合概率（含保底）：{probability?.fourStarTotal || '13%'}</Text>
          <br />
          <Text type="danger">★5 UP 概率：{probability?.fiveStarUp || '50%'}（未出UP时下次必出）</Text>
        </div>

        {/* 保底规则 */}
        <div>
          <Title level={5}>保底规则</Title>
          <Text>{guarantee || '10抽必出★4及以上物品；90抽必出★5物品；未出UP时下次必出（大保底）'}</Text>
        </div>

        {/* 重复处理 */}
        <div>
          <Title level={5}>重复物品处理</Title>
          <Text>{duplicate || '★5重复2-7次：1个Stella Fortuna+10星辉；8次及以上：25星辉'}</Text>
        </div>

        {/* 查看完整规则按钮 */}
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => setRuleModalVisible(true)}>查看完整规则</Button>
        </div>
      </Space>

      {/* 完整规则弹窗 */}
      <Modal
        title="抽卡记录完整规则"
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Text style={{ lineHeight: 1.8 }}>
          {commonRules || `1. 抽卡记录保存期限：1年（部分服务器为半年）；
2. 服务器时区说明：天空岛→UTC+8，其他服务器以游戏内显示为准；
3. 保底规则通用：所有角色活动池90抽必出★5，武器活动池80抽必出★5；
4. 新手池规则：仅可抽20次，前10抽必出★4角色；
5. 记录更新延迟：API数据更新延迟约1小时，请勿频繁刷新。`}
        </Text>
      </Modal>
    </Card>
  );
};

export default RuleExplain;