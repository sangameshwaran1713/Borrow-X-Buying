const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
  location: {
    address: { type: String, default: 'City Center, Main St' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [79.8711, 12.1697] } // [longitude, latitude]
    }
  },
  trustScore: {
    overall: { type: Number, default: 85 },
    trust: { type: Number, default: 88 },
    availability: { type: Number, default: 90 },
    condition: { type: Number, default: 82 },
    response: { type: Number, default: 85 }
  },
  bio: { type: String, default: 'Passionate about sharing resources with neighbors and building community trust!' },
  totalBorrowings: { type: Number, default: 0 },
  totalLendings: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: true },
  verificationTier: { type: Number, default: 1 }, // Tier 0, 1, 2, 3
  isIdVerified: { type: Boolean, default: false },
  badges: [{ type: String }], // e.g. ['Verified Neighbor', 'Top Lender', 'Punctual Borrower']
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  recoveryCodes: [{ type: String }],
  refreshToken: { type: String, default: null },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

