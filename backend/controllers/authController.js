const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Register user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, coordinates, bio } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'First name, last name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

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

      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'super_secret_borrow_instead_of_buy_jwt_key_2026',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          trustScore: user.trustScore,
          location: user.location,
          bio: user.bio
        }
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
        password, // In real app hashed, demo array handles direct auth or matching
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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      users.push(newUser);

      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET || 'super_secret_borrow_instead_of_buy_jwt_key_2026',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: newUser
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

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'super_secret_borrow_instead_of_buy_jwt_key_2026',
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          trustScore: user.trustScore,
          location: user.location,
          bio: user.bio
        }
      });
    } else {
      await mockDb.initMockData();
      const users = mockDb.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'super_secret_borrow_instead_of_buy_jwt_key_2026',
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    } else {
      await mockDb.initMockData();
      const users = mockDb.getUsers();
      const user = users.find(u => u._id.toString() === req.userId.toString());
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};
