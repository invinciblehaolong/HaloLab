import { useState } from 'react';
import todoApi from '../../services/todoApi';

const TodoInput = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');

  const handleAddTodo = async () => {
    if (!title.trim()) return;

    try {
      // 调用API创建任务
      await todoApi.create({ title: title.trim(), completed: false });
      setTitle(''); // 清空输入框
      onTaskAdded(); // 通知父组件刷新列表
    } catch (error) {
      alert('添加任务失败，请重试', error);
    }
  };

  return (
    <div className="add-todo">
      <input
        type="text"
        className="todo-input"
        placeholder="添加新任务..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
      />
      <button className="btn-primary" onClick={handleAddTodo}>
        <i className="fas fa-plus"></i> 添加
      </button>
    </div>
  );
};

export default TodoInput;