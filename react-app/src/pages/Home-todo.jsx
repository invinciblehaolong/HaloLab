import { useState } from 'react';
import TodoHeader from '../components/TODO/TodoHeader';
import TodoInput from '../components/TODO/TodoInput';
import TodoFilters from '../components/TODO/TodoFilters';
import TodoList from '../components/TODO/TodoList';
import TodoFooter from '../components/TODO/TodoFooter';

// 将App改为Home
const Home = () => {
  const [currentFilter, setCurrentFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 触发列表刷新
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="todo-container">
      <TodoHeader />
      <TodoInput onTaskAdded={triggerRefresh} />
      <TodoFilters
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />
      <ul id="todoList" className="todo-list">
        <TodoList filter={currentFilter} key={refreshTrigger} />
      </ul>
      <TodoFooter onTaskUpdated={triggerRefresh} />
    </div>
  );
};

export default Home;
