import React from 'react';

// 清除已完成任务
const handleClearCompleted = async (onTaskUpdated) => {
  try {
    if (!window.confirm('确定删除所有已完成任务？')) return;
    onTaskUpdated(); // 通知更新列表，由父组件处理实际删除逻辑
  } catch (err) {
    alert('清除失败', err);
  }
};

const TodoFooter = ({ activeCount, hasCompleted, onTaskUpdated }) => {
  return (
    <div className="todo-footer">
      <span className="todo-count">
        {`${activeCount} 项剩余`}
      </span>
      {hasCompleted && (
        <button 
          className="btn-secondary" 
          onClick={() => handleClearCompleted(onTaskUpdated)}
        >
          清除已完成
        </button>
      )}
    </div>
  );
};

export default TodoFooter;