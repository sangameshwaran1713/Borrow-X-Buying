const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/:id/read', verifyToken, markAsRead);

module.exports = router;
