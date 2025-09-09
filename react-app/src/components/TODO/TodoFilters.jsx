const TodoFilter = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="todo-filters">
      <button
        className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
        data-filter="all"
        onClick={() => onFilterChange('all')}
      >
        全部
      </button>
      <button
        className={`filter-btn ${currentFilter === 'active' ? 'active' : ''}`}
        data-filter="active"
        onClick={() => onFilterChange('active')}
      >
        未完成
      </button>
      <button
        className={`filter-btn ${currentFilter === 'completed' ? 'active' : ''}`}
        data-filter="completed"
        onClick={() => onFilterChange('completed')}
      >
        已完成
      </button>
    </div>
  );
};

export default TodoFilter;