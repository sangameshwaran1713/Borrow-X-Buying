const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  reason: {
    type: String,
    enum: ['DAMAGED_ITEM', 'LATE_RETURN', 'SAFETY_CONCERN', 'DECEPTIVE_LISTING', 'OTHER'],
    required: true
  },
  description: { type: String, required: true },
  evidence: [{ type: String }],
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING'
  },
  resolution: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
