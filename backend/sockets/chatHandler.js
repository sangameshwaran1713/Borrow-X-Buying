const ChatMessage = require('../models/ChatMessage');
const BorrowRequest = require('../models/BorrowRequest');
const mongoose = require('mongoose');

const isMongoConnected = () => mongoose.connection.readyState === 1;

module.exports = (io, socket) => {
  // Join chat room tied to specific BorrowRequest ID
  socket.on('join_chat_room', async ({ requestId, userId }) => {
    try {
      if (!requestId || !userId) return;

      if (isMongoConnected()) {
        const borrowReq = await BorrowRequest.findById(requestId);
        if (!borrowReq) return socket.emit('error', { message: 'Borrow request not found' });

        const isBorrower = borrowReq.borrowerId.toString() === userId.toString();
        const isOwner = borrowReq.ownerId.toString() === userId.toString();

        if (!isBorrower && !isOwner) {
          return socket.emit('error', { message: 'Unauthorized chat room access' });
        }
      }

      socket.join(`chat_${requestId}`);
      console.log(`⚡ Socket ${socket.id} joined chat_${requestId}`);
      socket.emit('joined_room', { requestId });
    } catch (err) {
      console.error('Socket Join Room Error:', err);
    }
  });

  // Handle incoming real-time socket message
  socket.on('send_message', async (data) => {
    try {
      const { requestId, senderId, message, attachments } = data;
      if (!requestId || !senderId || !message) return;

      let chatMsg;
      if (isMongoConnected()) {
        const newMsg = await ChatMessage.create({
          requestId,
          sender: senderId,
          message,
          attachments: attachments || []
        });
        chatMsg = await newMsg.populate('sender', 'firstName lastName profileImage');
      } else {
        chatMsg = {
          _id: 'socket_msg_' + Date.now(),
          requestId,
          sender: { _id: senderId, firstName: 'User' },
          message,
          attachments: attachments || [],
          createdAt: new Date()
        };
      }

      io.to(`chat_${requestId}`).emit('receive_message', chatMsg);
    } catch (err) {
      console.error('Socket Send Message Error:', err);
    }
  });

  // Handle typing indicator event
  socket.on('typing', ({ requestId, userId, isTyping }) => {
    socket.to(`chat_${requestId}`).emit('user_typing', { userId, isTyping });
  });
};
