const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  borrowRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest' },
  reviewType: {
    type: String,
    enum: ['BORROWER_TO_OWNER', 'OWNER_TO_BORROWER'],
    default: 'BORROWER_TO_OWNER'
  },
  ratings: {
    communication: { type: Number, min: 1, max: 5, required: true },
    itemAccuracy: { type: Number, min: 1, max: 5, required: true },
    reliability: { type: Number, min: 1, max: 5, required: true },
    timelinessOrCondition: { type: Number, min: 1, max: 5, required: true }
  },
  comment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
