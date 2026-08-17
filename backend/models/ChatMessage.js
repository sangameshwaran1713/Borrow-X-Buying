const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  readAt: { type: Date, default: null }
}, { timestamps: true });

chatMessageSchema.index({ requestId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
