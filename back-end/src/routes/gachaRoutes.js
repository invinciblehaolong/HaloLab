const express = require('express');
const router = express.Router();
const gachaController = require('../controllers/gachaController');
const fiveStarController = require('../controllers/fiveStarController');


// 处理抽卡链接并存储记录
router.post('/process-url', gachaController.handleGachaUrl);

// 获取抽卡记录
router.get('/records', gachaController.getGachaRecords);


// 手动触发五星间隔计算
router.post('/calculate-intervals', fiveStarController.calculateFiveStarIntervals);

// 获取五星间隔记录
router.get('/intervals', fiveStarController.getFiveStarIntervals);

module.exports = router;