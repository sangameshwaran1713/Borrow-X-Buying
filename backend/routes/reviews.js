const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { createReview, getUserReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', verifyToken, createReview);
router.get('/:userId', getUserReviews);

module.exports = router;
