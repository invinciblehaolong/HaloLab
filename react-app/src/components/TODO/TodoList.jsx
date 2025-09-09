import { useEffect, useState } from 'react';
import TodoItem from './TodoItem';
import todoApi from '../../services/todoApi';

const TodoList = ({ filter }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 获取任务列表
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll();
      setTodos(data);
      setError(false);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选变化时重新获取
  useEffect(() => {
    fetchTodos();
  }, []);

  // 筛选任务
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // 空状态提示文本
  const getEmptyMessage = () => {
    switch (filter) {
      case 'active':
        return '没有未完成的任务，太棒了！';
      case 'completed':
        return '没有已完成的任务';
      default:
        return '还没有任务，添加一个吧！';
    }
  };

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
        <p>{getEmptyMessage()}</p>
      </li>
    );
  }

  return (
    <>
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onTaskUpdated={fetchTodos} />
      ))}
    </>
  );
};

export default TodoList;