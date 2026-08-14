const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const mockDb = require('../utils/mockDb');

const isMongoConnected = () => mongoose.connection.readyState === 1;

exports.getUserNotifications = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json(notifications);
    } else {
      await mockDb.initMockData();
      const notifications = mockDb.getNotifications().filter(n => n.userId.toString() === req.userId.toString());
      return res.json(notifications);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return res.json({ message: 'Notification marked as read' });
    } else {
      await mockDb.initMockData();
      const n = mockDb.getNotifications().find(notif => notif._id.toString() === id.toString());
      if (n) n.isRead = true;
      return res.json({ message: 'Notification marked as read' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
};
