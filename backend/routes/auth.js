const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  setup2FA,
  verify2FA,
  authenticate2FA,
  getMe
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRequest, registerSchema, loginSchema, verify2FASchema } = require('../middleware/validator');

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// 2FA endpoints
router.post('/2fa/setup', verifyToken, setup2FA);
router.post('/2fa/verify', verifyToken, validateRequest(verify2FASchema), verify2FA);
router.post('/2fa/authenticate', authLimiter, validateRequest(verify2FASchema), authenticate2FA);

// User Profile endpoint
router.get('/me', verifyToken, getMe);

module.exports = router;
