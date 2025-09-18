const todoModel = require('../models/todoModel');

/**
 * 获取所有TODO
 */
const getAllTodos = async (req, res, next) => {
  try {
    const todos = await todoModel.getAll();
    res.json(todos);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个TODO
 */
const getTodoById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const todo = await todoModel.getById(id);
    
    if (todo) {
      res.json(todo);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 创建TODO
 */
const createTodo = async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const todo = await todoModel.create(req.body.title, req.body.completed);
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新TODO
 */
const updateTodo = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.title && req.body.completed === undefined) {
      return res.status(400).json({ message: '需要提供title或completed字段' });
    }
    
    const todo = await todoModel.update(id, req.body);
    if (todo) {
      res.json(todo);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 删除TODO
 */
const deleteTodo = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const todo = await todoModel.delete(id);
    
    if (todo) {
      res.json({ message: 'Todo deleted successfully' });
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};