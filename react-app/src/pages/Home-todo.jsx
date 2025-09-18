import React, { useState, useEffect } from 'react';
import TodoHeader from '../components/TODO/TodoHeader';
import TodoInput from '../components/TODO/TodoInput';
import TodoList from '../components/TODO/TodoList';
import TodoFooter from '../components/TODO/TodoFooter';
import TodoFilters from '../components/TODO/TodoFilters';
import todoApi from '../services/todoApi';

const Home = () => {
  const [currentFilter, setCurrentFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  // 触发刷新的函数
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 统一获取任务数据
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (error) {
      console.error('获取任务失败', error);
      alert('获取任务列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和需要刷新时获取数据
  useEffect(() => {
    fetchTodos();
  }, [refreshTrigger]);

  // 计算统计数据
  const activeCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  return (
    <div className="todo-container">
      <TodoHeader />
      <TodoInput onTaskAdded={triggerRefresh} />
      <TodoFilters
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />
      <div id="todoList" className="todo-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <TodoList 
            filter={currentFilter} 
            todos={todos} 
            refreshTrigger={refreshTrigger} 
            onTaskUpdated={triggerRefresh}
          />
        )}
      </div>
      <TodoFooter 
        activeCount={activeCount} 
        hasCompleted={hasCompleted} 
        onTaskUpdated={triggerRefresh} 
      />
    </div>
  );
};

export default Home;