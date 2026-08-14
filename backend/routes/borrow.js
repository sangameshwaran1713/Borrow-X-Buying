const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  createBorrowRequest,
  acceptBorrowRequest,
  rejectBorrowRequest,
  confirmHandover,
  confirmReturn,
  getBorrowerRequests,
  getOwnerRequests
} = require('../controllers/borrowController');

const router = express.Router();

router.post('/', verifyToken, createBorrowRequest);
router.put('/:requestId/accept', verifyToken, acceptBorrowRequest);
router.put('/:requestId/reject', verifyToken, rejectBorrowRequest);
router.put('/:requestId/handover', verifyToken, confirmHandover);
router.put('/:requestId/return', verifyToken, confirmReturn);
router.get('/my-requests', verifyToken, getBorrowerRequests);
router.get('/owner-requests', verifyToken, getOwnerRequests);

module.exports = router;
