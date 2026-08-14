const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  requestMessage: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'HANDOVER_PENDING', 'BORROWED', 'RETURN_PENDING', 'RETURNED', 'COMPLETED'],
    default: 'PENDING'
  },
  pricing: {
    rentalCost: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  depositStatus: {
    type: String,
    enum: ['PENDING', 'HELD', 'RELEASED'],
    default: 'PENDING'
  },
  qrCode: { type: String, sparse: true }
}, { timestamps: true });

borrowRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
