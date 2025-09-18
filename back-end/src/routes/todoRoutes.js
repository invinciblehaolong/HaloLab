const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// 所有TODO相关路由
router.get('/', todoController.getAllTodos);
router.get('/:id', todoController.getTodoById);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;