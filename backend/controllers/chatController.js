const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');
const BorrowRequest = require('../models/BorrowRequest');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Get paginated chat history for a specific borrow request
exports.getChatHistory = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { limit = 50, before } = req.query;

    if (!requestId) return res.status(400).json({ message: 'requestId parameter is required' });

    if (isMongoConnected()) {
      const borrowReq = await BorrowRequest.findById(requestId);
      if (!borrowReq) return res.status(404).json({ message: 'Borrow request not found' });

      // Check authorization (must be borrower or lender)
      const isBorrower = borrowReq.borrowerId.toString() === req.userId.toString();
      const isOwner = borrowReq.ownerId.toString() === req.userId.toString();

      if (!isBorrower && !isOwner) {
        return res.status(403).json({ message: 'Unauthorized to view this conversation' });
      }

      const query = { requestId };
      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await ChatMessage.find(query)
        .sort({ createdAt: 1 })
        .limit(parseInt(limit))
        .populate('sender', 'firstName lastName profileImage');

      return res.json({
        requestId,
        messages,
        total: messages.length
      });
    } else {
      return res.json({
        requestId,
        messages: [
          {
            _id: 'msg_1',
            requestId,
            sender: { _id: req.userId, firstName: 'Neighbor', profileImage: '' },
            message: 'Hi! Is this item available for pickup today?',
            createdAt: new Date()
          }
        ]
      });
    }
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
  }
};

// Send message via REST endpoint (also supported via Socket.IO)
exports.sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message, attachments } = req.body;

    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message text or attachments required' });
    }

    if (isMongoConnected()) {
      const borrowReq = await BorrowRequest.findById(requestId);
      if (!borrowReq) return res.status(404).json({ message: 'Borrow request not found' });

      const isBorrower = borrowReq.borrowerId.toString() === req.userId.toString();
      const isOwner = borrowReq.ownerId.toString() === req.userId.toString();

      if (!isBorrower && !isOwner) {
        return res.status(403).json({ message: 'Unauthorized chat sender' });
      }

      const chatMsg = await ChatMessage.create({
        requestId,
        sender: req.userId,
        message: message || '',
        attachments: attachments || []
      });

      const populatedMsg = await chatMsg.populate('sender', 'firstName lastName profileImage');

      // Emit real-time message via Socket.IO if instance available
      const io = req.app.get('socketio');
      if (io) {
        io.to(`chat_${requestId}`).emit('receive_message', populatedMsg);
      }

      return res.status(201).json(populatedMsg);
    } else {
      return res.status(201).json({
        _id: 'msg_' + Date.now(),
        requestId,
        sender: req.userId,
        message,
        attachments: attachments || [],
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Mark conversation messages as read
exports.markRead = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (isMongoConnected()) {
      await ChatMessage.updateMany(
        { requestId, sender: { $ne: req.userId }, readAt: null },
        { readAt: new Date() }
      );
      return res.json({ message: 'Messages marked as read' });
    } else {
      return res.json({ message: 'Messages marked as read (mock mode)' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark messages read', error: error.message });
  }
};
