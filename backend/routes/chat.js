const express = require('express');
const { getChatHistory, sendMessage, markRead } = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:requestId', verifyToken, getChatHistory);
router.post('/:requestId', verifyToken, sendMessage);
router.post('/:requestId/read', verifyToken, markRead);

module.exports = router;
