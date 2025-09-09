import { useEffect, useState } from 'react';
import todoApi from '../../services/todoApi';

const TodoFooter = ({ onTaskUpdated }) => {
  const [activeCount, setActiveCount] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // 获取任务统计数据
  const fetchStats = async () => {
    try {
      const todos = await todoApi.getAll();
      setActiveCount(todos.filter((t) => !t.completed).length);
      setHasCompleted(todos.some((t) => t.completed));
    } catch (err) {
      console.error('获取统计失败', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [onTaskUpdated]); // 当任务更新时重新获取统计

  // 清除已完成任务
  const handleClearCompleted = async () => {
    try {
      const todos = await todoApi.getAll();
      const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
      
      if (completedIds.length === 0) return;
      if (!window.confirm(`确定删除${completedIds.length}个已完成任务？`)) return;

      // 批量删除
      await Promise.all(completedIds.map((id) => todoApi.delete(id)));
      onTaskUpdated(); // 通知更新列表
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('清除失败');
    }
  };

  return (
    <div className="todo-footer">
      <span className="todo-count">
        { `${activeCount} 项剩余`}
      </span>
      {hasCompleted && (
        <button className="btn-secondary" onClick={handleClearCompleted}>
          清除已完成
        </button>
      )}
    </div>
  );
};

export default TodoFooter;