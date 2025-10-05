import { useState } from 'react';
import todoApi from '../../services/todoApi';

const TodoItem = ({ todo, onTaskUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  // 切换任务完成状态
  const handleToggleComplete = async () => {
    try {
      await todoApi.update(todo.id, {
        ...todo,
        completed: !todo.completed,
      });
      onTaskUpdated();
    } catch (error) {
      alert('更新任务失败', error);
    }
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    try {
      await todoApi.update(todo.id, {
        ...todo,
        title: editTitle.trim(),
      });
      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      alert('保存失败', error);
      
    }
  };

  // 删除任务
  const handleDelete = async () => {
    if (window.confirm('确定删除此任务？')) {
      try {
        await todoApi.delete(todo.id);
        onTaskUpdated();
      } catch (error) {
        alert('删除失败', error);
      }
    }
  };

  // 新增HTML转义功能，从原TodoAPP.jsx迁移
  const escapeHTML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 编辑模式
  if (isEditing) {
    return (
      <li className="todo-item">
        <input
          type="text"
          className="todo-edit-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
          onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
          autoFocus
        />
        <div className="todo-actions">
          <button className="todo-btn save-btn" onClick={handleSaveEdit}>
            <i className="fas fa-check"></i>
          </button>
          <button className="todo-btn cancel-btn" onClick={() => setIsEditing(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </li>
    );
  }

  // 普通展示模式
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div
        className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
        onClick={handleToggleComplete}
      >
        <i className="fas fa-check"></i>
      </div>
      <span className="todo-text">{escapeHTML(todo.title)}</span>
      <div className="todo-actions">
        <button className="todo-btn edit-btn" onClick={() => setIsEditing(true)}>
          <i className="fas fa-edit"></i>
        </button>
        <button className="todo-btn delete-btn" onClick={handleDelete}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </li>
  );
};

export default TodoItem;