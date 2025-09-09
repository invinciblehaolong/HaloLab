import React from 'react';
import { Alert, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * 错误提示与异常处理区
 * @props {Object} errorInfo - 错误信息（errorCode: 错误码, msg: 错误描述, solution: 解决方案）
 * @props {Function} onClose - 关闭错误提示回调
 */
const ErrorHandler = ({ errorInfo, onClose }) => {
  if (!errorInfo) return null;

  // 根据错误码选择Alert类型
  const getAlertType = (code) => {
    switch (code) {
      case 101: return 'warning';
      case 102, 103: return 'error';
      case 110: return 'info';
      default: return 'error';
    }
  };

  return (
    <div style={{ margin: 20, position: 'relative' }}>
      <Alert
        message={`错误提示（代码：${errorInfo.errorCode}）`}
        description={
          <div style={{ lineHeight: 1.8 }}>
            <Text>{errorInfo.msg}</Text>
            <br />
            <Text type="secondary">解决方案：{errorInfo.solution}</Text>
          </div>
        }
        type={getAlertType(errorInfo.errorCode)}
        showIcon
        style={{ paddingRight: 40 }}
      />
      {/* 关闭按钮 */}
      <Button
        icon={<CloseOutlined />}
        size="small"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'transparent',
          border: 'none'
        }}
      />
    </div>
  );
};

export default ErrorHandler;