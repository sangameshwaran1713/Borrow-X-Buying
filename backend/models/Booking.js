const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  borrowRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actualStartDate: { type: Date },
  actualEndDate: { type: Date },
  itemConditionBefore: {
    photos: [{ type: String }],
    notes: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  },
  itemConditionAfter: {
    photos: [{ type: String }],
    notes: { type: String, default: '' },
    damageReports: [{
      type: { type: String },
      severity: { type: String },
      description: { type: String }
    }],
    timestamp: { type: Date }
  },
  returnConfirmedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
