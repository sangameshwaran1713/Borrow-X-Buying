const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  setup2FA,
  verify2FA,
  authenticate2FA,
  getMe,
  updateLocation,
  updateProfile
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

// User Profile & Location endpoints
router.get('/me', verifyToken, getMe);
router.put('/location', verifyToken, updateLocation);
router.put('/profile', verifyToken, updateProfile);
router.put('/me', verifyToken, updateProfile);
router.put('/update-profile', verifyToken, updateProfile);

module.exports = router;
