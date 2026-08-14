const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Electronics', 'Tools', 'Sports', 'HomeGoods', 'Other'],
    default: 'Tools'
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Fair'],
    default: 'Good'
  },
  images: [{ type: String }],
  location: {
    address: { type: String, default: 'Neighborhood Block A' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [79.8711, 12.1697] } // [longitude, latitude]
    }
  },
  availability: {
    available: { type: Boolean, default: true },
    calendar: [{
      date: { type: Date },
      isAvailable: { type: Boolean, default: true }
    }]
  },
  rentalPrice: {
    amount: { type: Number, required: true, default: 0 },
    period: { type: String, enum: ['day', 'week', 'month'], default: 'day' }
  },
  deposit: { type: Number, default: 0 },
  allowFree: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['AVAILABLE', 'REQUESTED', 'BORROWED'],
    default: 'AVAILABLE'
  },
  rating: {
    average: { type: Number, default: 5.0 },
    count: { type: Number, default: 1 }
  },
  views: { type: Number, default: 12 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

itemSchema.index({ 'location.coordinates': '2dsphere' });
itemSchema.index({ ownerId: 1, createdAt: -1 });
itemSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Item', itemSchema);
