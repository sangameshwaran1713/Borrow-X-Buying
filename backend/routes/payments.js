const express = require('express');
const {
  createDepositHold,
  captureDeposit,
  releaseDeposit,
  handleStripeWebhook
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/create-hold', verifyToken, createDepositHold);
router.post('/capture', verifyToken, captureDeposit);
router.post('/release', verifyToken, releaseDeposit);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
