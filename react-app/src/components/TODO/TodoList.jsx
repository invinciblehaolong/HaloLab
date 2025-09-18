import React from 'react';
import TodoItem from './TodoItem';

// 空状态提示文本
const getEmptyMessage = (filter) => {
  switch (filter) {
    case 'active':
      return '没有未完成的任务，太棒了！';
    case 'completed':
      return '没有已完成的任务';
    default:
      return '还没有任务，添加一个吧！';
  }
};

const TodoList = ({ 
  filter, 
  todos, 
  loading, 
  error, 
  onTaskUpdated 
}) => {
  // 根据筛选筛选任务
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (loading) {
    return (
      <li className="loading">
        <i className="fas fa-spinner fa-spin"></i> 加载任务中...
      </li>
    );
  }

  if (error) {
    return (
      <li className="empty-state">
        <i className="fas fa-exclamation-circle"></i>
        <p>加载失败，请刷新页面重试</p>
      </li>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <li className="empty-state">
        <i className="fas fa-list"></i>
        <p>{getEmptyMessage(filter)}</p>
      </li>
    );
  }

  return (
    <>
      {filteredTodos.map((todo) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onTaskUpdated={onTaskUpdated} 
        />
      ))}
    </>
  );
};

export default TodoList;