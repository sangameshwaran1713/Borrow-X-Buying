const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'super_secret_borrow_instead_of_buy_jwt_key_2026';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_jwt_key_2026';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to generate tokens
const generateTokens = (user) => {
  const userId = user._id || user.id;
  const accessToken = jwt.sign(
    { userId, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

// Set refresh token cookie helper
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Format user response object
const formatUserResponse = (user) => ({
  id: user._id || user.id,
  _id: user._id || user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || '',
  profileImage: user.profileImage,
  trustScore: user.trustScore,
  location: user.location,
  bio: user.bio,
  verificationTier: user.verificationTier || 1,
  isIdVerified: user.isIdVerified || false,
  badges: user.badges || ['Verified Neighbor'],
  twoFactorEnabled: user.twoFactorEnabled || false
});

// Register user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, coordinates, bio } = req.body;

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        bio: bio || '',
        verificationTier: 1,
        badges: ['Verified Neighbor'],
        location: {
          address: address || 'Local City',
          coordinates: {
            type: 'Point',
            coordinates: [
              coordinates?.longitude ? parseFloat(coordinates.longitude) : 79.8711,
              coordinates?.latitude ? parseFloat(coordinates.latitude) : 12.1697
            ]
          }
        }
      });

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      await user.save();

      setRefreshTokenCookie(res, refreshToken);

      return res.status(201).json({
        message: 'Registration successful',
        accessToken,
        user: formatUserResponse(user)
      });
    } else {
      await mockDb.initMockData();
      const users = mockDb.getUsers();
      
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const newUser = {
        _id: '65b' + Date.now().toString().slice(-21),
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        location: {
          address: address || 'Neighborhood Center',
          coordinates: {
            type: 'Point',
            coordinates: [
              coordinates?.longitude ? parseFloat(coordinates.longitude) : 79.8711,
              coordinates?.latitude ? parseFloat(coordinates.latitude) : 12.1697
            ]
          }
        },
        trustScore: { overall: 85, trust: 85, availability: 85, condition: 85, response: 85 },
        bio: bio || 'Excited to lend and borrow locally!',
        totalBorrowings: 0,
        totalLendings: 0,
        isVerified: true,
        verificationTier: 1,
        badges: ['Verified Neighbor'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      users.push(newUser);
      const { accessToken, refreshToken } = generateTokens(newUser);
      newUser.refreshToken = refreshToken;

      setRefreshTokenCookie(res, refreshToken);

      return res.status(201).json({
        message: 'Registration successful',
        accessToken,
        user: formatUserResponse(newUser)
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // If 2FA enabled, prompt for 2FA step
      if (user.twoFactorEnabled) {
        return res.json({
          message: '2FA verification required',
          require2FA: true,
          userId: user._id
        });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      user.lastActive = new Date();
      await user.save();

      setRefreshTokenCookie(res, refreshToken);

      return res.json({
        message: 'Login successful',
        accessToken,
        user: formatUserResponse(user)
      });
    } else {
      await mockDb.initMockData();
      const users = mockDb.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      setRefreshTokenCookie(res, refreshToken);

      return res.json({
        message: 'Login successful',
        accessToken,
        user: formatUserResponse(user)
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Refresh token rotation handler
exports.refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    if (isMongoConnected()) {
      const user = await User.findById(decoded.userId);
      
      // Token Reuse Detection Strategy: If incoming token doesn't match DB token, revoke session
      if (!user || user.refreshToken !== incomingRefreshToken) {
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
        res.clearCookie('refreshToken');
        return res.status(403).json({ message: 'Security Alert: Invalid refresh token detected. All sessions revoked.' });
      }

      // Rotate tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      user.refreshToken = newRefreshToken;
      await user.save();

      setRefreshTokenCookie(res, newRefreshToken);

      return res.json({
        accessToken,
        user: formatUserResponse(user)
      });
    } else {
      const { accessToken, refreshToken: newRefreshToken } = generateTokens({ _id: decoded.userId, email: decoded.email });
      setRefreshTokenCookie(res, newRefreshToken);
      return res.json({ accessToken });
    }
  } catch (error) {
    res.status(500).json({ message: 'Refresh token process failed', error: error.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (incomingRefreshToken && isMongoConnected()) {
      try {
        const decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } catch (e) {
        // Ignore token decode errors on logout
      }
    }
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// 2FA Setup - Generate Secret and QR Code
exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Borrow-X-Buying (${req.userEmail || 'User'})`
    });

    if (isMongoConnected()) {
      await User.findByIdAndUpdate(req.userId, { twoFactorSecret: secret.base32 });
    }

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      message: '2FA secret generated',
      secret: secret.base32,
      qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup 2FA', error: error.message });
  }
};

// 2FA Verify & Enable
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'TOTP token is required' });

    if (isMongoConnected()) {
      const user = await User.findById(req.userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA setup not initiated' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid 2FA token' });
      }

      // Generate 10 recovery codes
      const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
      user.twoFactorEnabled = true;
      user.recoveryCodes = recoveryCodes;
      await user.save();

      return res.json({
        message: '2FA successfully enabled',
        recoveryCodes
      });
    } else {
      return res.json({ message: '2FA enabled (demo mode)' });
    }
  } catch (error) {
    res.status(500).json({ message: '2FA verification failed', error: error.message });
  }
};

// 2FA Login Authenticate Step
exports.authenticate2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and 2FA token required' });
    }

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA is not enabled for this user' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid 2FA token' });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      user.lastActive = new Date();
      await user.save();

      setRefreshTokenCookie(res, refreshToken);

      return res.json({
        message: '2FA Authentication successful',
        accessToken,
        user: formatUserResponse(user)
      });
    } else {
      return res.status(400).json({ message: '2FA authentication requires MongoDB' });
    }
  } catch (error) {
    res.status(500).json({ message: '2FA Authentication failed', error: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.userId).select('-password -twoFactorSecret -refreshToken -recoveryCodes');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(formatUserResponse(user));
    } else {
      await mockDb.initMockData();
      const users = mockDb.getUsers();
      const user = users.find(u => u._id.toString() === req.userId.toString());
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      return res.json(formatUserResponse(user));
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};