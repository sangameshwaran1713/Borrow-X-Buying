const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const BorrowRequest = require('../models/BorrowRequest');
const mongoose = require('mongoose');

const isMongoConnected = () => mongoose.connection.readyState === 1;

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
};

// Create BullMQ Queues
let depositAutoReleaseQueue = null;
let emailNotificationQueue = null;

try {
  depositAutoReleaseQueue = new Queue('depositAutoRelease', { connection });
  emailNotificationQueue = new Queue('emailNotifications', { connection });
  console.log('✅ BullMQ Queues initialized');
} catch (e) {
  console.log('⚠️ BullMQ Queue init offline mode (Redis disconnected).');
}

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'demo@ethereal.email',
    pass: process.env.SMTP_PASS || 'demopass'
  }
});

// Worker: Process Auto Release of Security Deposit 24h after return
if (depositAutoReleaseQueue) {
  new Worker('depositAutoRelease', async (job) => {
    const { requestId } = job.data;
    console.log(`⏳ Processing Deposit Auto Release Worker for Request: ${requestId}`);

    if (isMongoConnected()) {
      const borrowReq = await BorrowRequest.findById(requestId);
      if (borrowReq && borrowReq.depositStatus === 'HOLD_CREATED' && borrowReq.status !== 'DISPUTED') {
        borrowReq.depositStatus = 'RELEASED';
        await borrowReq.save();
        console.log(`✅ Auto-released deposit hold for request ${requestId}`);
      }
    }
  }, { connection });
}

// Worker: Process Email Notifications
if (emailNotificationQueue) {
  new Worker('emailNotifications', async (job) => {
    const { to, subject, html } = job.data;
    console.log(`✉️ Sending Background Email Notification to: ${to}`);
    try {
      await transporter.sendMail({
        from: '"Borrow-X-Buying" <noreply@borrowxbuying.com>',
        to,
        subject,
        html
      });
    } catch (err) {
      console.error('Failed to send email in worker:', err.message);
    }
  }, { connection });
}

// Helper: Schedule Auto-Release Deposit Hold (Delayed Job 24 hours)
const scheduleDepositAutoRelease = async (requestId, delayMs = 24 * 60 * 60 * 1000) => {
  if (depositAutoReleaseQueue) {
    await depositAutoReleaseQueue.add(
      'releaseHold',
      { requestId },
      { delay: delayMs, jobId: `deposit_release_${requestId}` }
    );
  }
};

// Helper: Queue Email Notification
const queueEmailNotification = async (to, subject, html) => {
  if (emailNotificationQueue) {
    await emailNotificationQueue.add('sendEmail', { to, subject, html });
  }
};

module.exports = {
  depositAutoReleaseQueue,
  emailNotificationQueue,
  scheduleDepositAutoRelease,
  queueEmailNotification
};
