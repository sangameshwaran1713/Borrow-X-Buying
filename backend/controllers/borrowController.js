const mongoose = require('mongoose');
const QRCode = require('qrcode');
const crypto = require('crypto');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mockDb = require('../utils/mockDb');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Create borrow request
exports.createBorrowRequest = async (req, res) => {
  try {
    const { itemId, startDate, endDate, message } = req.body;
    const borrowerId = req.userId;

    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Item ID, start date, and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (isMongoConnected()) {
      const item = await Item.findById(itemId);
      if (!item) return res.status(404).json({ message: 'Item not found' });

      if (item.ownerId.toString() === borrowerId.toString()) {
        return res.status(400).json({ message: 'You cannot borrow your own item' });
      }

      const rentalCost = (item.rentalPrice?.amount || 0) * days;
      const deposit = item.deposit || 0;
      const totalCost = rentalCost + deposit;

      const borrowRequest = new BorrowRequest({
        itemId,
        borrowerId,
        ownerId: item.ownerId,
        startDate: start,
        endDate: end,
        requestMessage: message || '',
        status: 'PENDING',
        pricing: { rentalCost, deposit, totalCost },
        depositStatus: 'PENDING'
      });

      await borrowRequest.save();

      // Create notification for owner
      const notification = new Notification({
        userId: item.ownerId,
        type: 'REQUEST_RECEIVED',
        title: 'New Borrow Request',
        message: `Someone requested to borrow your item: "${item.name}" for ${days} day(s).`,
        relatedId: borrowRequest._id
      });
      await notification.save();

      return res.status(201).json({
        message: 'Borrow request sent successfully!',
        borrowRequest
      });
    } else {
      await mockDb.initMockData();
      const items = mockDb.getItems();
      const requests = mockDb.getRequests();
      const notifications = mockDb.getNotifications();
      const users = mockDb.getUsers();

      const item = items.find(i => i._id.toString() === itemId.toString());
      if (!item) return res.status(404).json({ message: 'Item not found' });

      const itemOwnerId = typeof item.ownerId === 'object' ? item.ownerId._id : item.ownerId;
      if (itemOwnerId.toString() === borrowerId.toString()) {
        return res.status(400).json({ message: 'You cannot borrow your own item' });
      }

      const rentalCost = (item.rentalPrice?.amount || 0) * days;
      const deposit = item.deposit || 0;
      const totalCost = rentalCost + deposit;

      const borrower = users.find(u => u._id.toString() === borrowerId.toString()) || users[1];

      const newRequest = {
        _id: '65b3' + Date.now().toString().slice(-20),
        itemId: item,
        borrowerId: borrower,
        ownerId: itemOwnerId,
        startDate: start,
        endDate: end,
        requestMessage: message || '',
        status: 'PENDING',
        pricing: { rentalCost, deposit, totalCost },
        depositStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      requests.unshift(newRequest);

      notifications.unshift({
        _id: '65b4' + Date.now().toString().slice(-20),
        userId: itemOwnerId,
        type: 'REQUEST_RECEIVED',
        title: 'New Borrow Request',
        message: `${borrower.firstName} requested to borrow "${item.name}" for ${days} day(s).`,
        relatedId: newRequest._id,
        isRead: false,
        createdAt: new Date()
      });

      return res.status(201).json({
        message: 'Borrow request sent successfully!',
        borrowRequest: newRequest
      });
    }
  } catch (error) {
    console.error('Error creating borrow request:', error);
    res.status(500).json({ message: 'Failed to submit borrow request', error: error.message });
  }
};

// Accept request & generate QR code
exports.acceptBorrowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const qrData = `BORROW-QR-${requestId}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    if (isMongoConnected()) {
      const borrowRequest = await BorrowRequest.findById(requestId);
      if (!borrowRequest) return res.status(404).json({ message: 'Request not found' });

      if (borrowRequest.ownerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }

      borrowRequest.status = 'ACCEPTED';
      borrowRequest.qrCode = qrData;
      borrowRequest.depositStatus = 'HELD';
      await borrowRequest.save();

      // Update item status
      await Item.findByIdAndUpdate(borrowRequest.itemId, { status: 'REQUESTED' });

      // Send notification to borrower
      const notification = new Notification({
        userId: borrowRequest.borrowerId,
        type: 'REQUEST_ACCEPTED',
        title: 'Borrow Request Accepted! 🎉',
        message: 'Your request has been approved by the owner. Present your QR code upon pickup.',
        relatedId: requestId
      });
      await notification.save();

      return res.json({
        message: 'Borrow request accepted',
        borrowRequest,
        qrCodeImage: qrCodeDataUrl
      });
    } else {
      await mockDb.initMockData();
      const requests = mockDb.getRequests();
      const notifications = mockDb.getNotifications();

      const request = requests.find(r => r._id.toString() === requestId.toString());
      if (!request) return res.status(404).json({ message: 'Request not found' });

      request.status = 'ACCEPTED';
      request.qrCode = qrData;
      request.depositStatus = 'HELD';
      request.updatedAt = new Date();

      const borrowerId = typeof request.borrowerId === 'object' ? request.borrowerId._id : request.borrowerId;

      notifications.unshift({
        _id: '65b4' + Date.now().toString().slice(-20),
        userId: borrowerId,
        type: 'REQUEST_ACCEPTED',
        title: 'Borrow Request Accepted! 🎉',
        message: 'Your request has been approved! Use the QR code for handover.',
        relatedId: requestId,
        isRead: false,
        createdAt: new Date()
      });

      return res.json({
        message: 'Borrow request accepted',
        borrowRequest: request,
        qrCodeImage: qrCodeDataUrl
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept request', error: error.message });
  }
};

// Reject request
exports.rejectBorrowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (isMongoConnected()) {
      const borrowRequest = await BorrowRequest.findById(requestId);
      if (!borrowRequest) return res.status(404).json({ message: 'Request not found' });

      if (borrowRequest.ownerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      borrowRequest.status = 'REJECTED';
      await borrowRequest.save();

      const notification = new Notification({
        userId: borrowRequest.borrowerId,
        type: 'REQUEST_REJECTED',
        title: 'Request Declined',
        message: 'Unfortunately, your borrow request was declined by the owner.',
        relatedId: requestId
      });
      await notification.save();

      return res.json({ message: 'Request rejected', borrowRequest });
    } else {
      await mockDb.initMockData();
      const requests = mockDb.getRequests();
      const request = requests.find(r => r._id.toString() === requestId.toString());
      if (!request) return res.status(404).json({ message: 'Request not found' });

      request.status = 'REJECTED';
      request.updatedAt = new Date();
      return res.json({ message: 'Request rejected', borrowRequest: request });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request' });
  }
};

// Confirm Handover via QR scan
exports.confirmHandover = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (isMongoConnected()) {
      const borrowRequest = await BorrowRequest.findById(requestId);
      if (!borrowRequest) return res.status(404).json({ message: 'Request not found' });

      borrowRequest.status = 'BORROWED';
      await borrowRequest.save();

      await Item.findByIdAndUpdate(borrowRequest.itemId, { status: 'BORROWED' });

      return res.json({ message: 'Handover confirmed! Item marked as BORROWED.', borrowRequest });
    } else {
      await mockDb.initMockData();
      const requests = mockDb.getRequests();
      const request = requests.find(r => r._id.toString() === requestId.toString());
      if (!request) return res.status(404).json({ message: 'Request not found' });

      request.status = 'BORROWED';
      request.updatedAt = new Date();
      return res.json({ message: 'Handover confirmed! Item marked as BORROWED.', borrowRequest: request });
    }
  } catch (error) {
    res.status(500).json({ message: 'Handover confirmation failed' });
  }
};

// Confirm Return
exports.confirmReturn = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (isMongoConnected()) {
      const borrowRequest = await BorrowRequest.findById(requestId);
      if (!borrowRequest) return res.status(404).json({ message: 'Request not found' });

      borrowRequest.status = 'COMPLETED';
      borrowRequest.depositStatus = 'RELEASED';
      await borrowRequest.save();

      await Item.findByIdAndUpdate(borrowRequest.itemId, { status: 'AVAILABLE' });

      return res.json({ message: 'Item return confirmed! Deposit released & transaction COMPLETED.', borrowRequest });
    } else {
      await mockDb.initMockData();
      const requests = mockDb.getRequests();
      const request = requests.find(r => r._id.toString() === requestId.toString());
      if (!request) return res.status(404).json({ message: 'Request not found' });

      request.status = 'COMPLETED';
      request.depositStatus = 'RELEASED';
      request.updatedAt = new Date();
      return res.json({ message: 'Item return confirmed! Deposit released & transaction COMPLETED.', borrowRequest: request });
    }
  } catch (error) {
    res.status(500).json({ message: 'Return confirmation failed' });
  }
};

// Get borrower requests
exports.getBorrowerRequests = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const requests = await BorrowRequest.find({ borrowerId: req.userId })
        .populate('itemId')
        .populate('ownerId', 'firstName lastName profileImage trustScore phone')
        .sort({ createdAt: -1 });
      return res.json(requests);
    } else {
      await mockDb.initMockData();
      const requests = mockDb.getRequests().filter(r => {
        const borrowerId = typeof r.borrowerId === 'object' ? r.borrowerId._id : r.borrowerId;
        return borrowerId.toString() === req.userId.toString();
      });
      return res.json(requests);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch borrower requests' });
  }
};

// Get owner requests
exports.getOwnerRequests = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const requests = await BorrowRequest.find({ ownerId: req.userId })
        .populate('itemId')
        .populate('borrowerId', 'firstName lastName profileImage trustScore phone')
        .sort({ createdAt: -1 });
      return res.json(requests);
    } else {
      await mockDb.initMockData();
      const requests = mockDb.getRequests().filter(r => {
        const ownerId = typeof r.ownerId === 'object' ? r.ownerId._id : r.ownerId;
        return ownerId.toString() === req.userId.toString();
      });
      return res.json(requests);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owner requests' });
  }
};
