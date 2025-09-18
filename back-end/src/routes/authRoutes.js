const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录接口
router.post('/login', authController.login);

module.exports = router;