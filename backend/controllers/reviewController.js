const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Recalculate Trust Score algorithm
const updateTrustScore = async (userId) => {
  try {
    if (isMongoConnected()) {
      const reviews = await Review.find({ revieweeId: userId });
      if (!reviews || reviews.length === 0) return;

      const avgComm = reviews.reduce((s, r) => s + (r.ratings?.communication || 5), 0) / reviews.length;
      const avgAcc = reviews.reduce((s, r) => s + (r.ratings?.itemAccuracy || 5), 0) / reviews.length;
      const avgRel = reviews.reduce((s, r) => s + (r.ratings?.reliability || 5), 0) / reviews.length;
      const avgTime = reviews.reduce((s, r) => s + (r.ratings?.timelinessOrCondition || 5), 0) / reviews.length;

      const overall = Math.round(((avgComm + avgAcc + avgRel + avgTime) / 4) * 20);

      await User.findByIdAndUpdate(userId, {
        'trustScore.overall': Math.min(100, overall),
        'trustScore.trust': Math.round(avgRel * 20),
        'trustScore.availability': Math.round(avgTime * 20),
        'trustScore.condition': Math.round(avgAcc * 20),
        'trustScore.response': Math.round(avgComm * 20)
      });
    } else {
      const reviews = mockDb.getReviews().filter(r => r.revieweeId.toString() === userId.toString());
      if (reviews.length === 0) return;

      const avgComm = reviews.reduce((s, r) => s + (r.ratings?.communication || 5), 0) / reviews.length;
      const avgAcc = reviews.reduce((s, r) => s + (r.ratings?.itemAccuracy || 5), 0) / reviews.length;
      const avgRel = reviews.reduce((s, r) => s + (r.ratings?.reliability || 5), 0) / reviews.length;
      const avgTime = reviews.reduce((s, r) => s + (r.ratings?.timelinessOrCondition || 5), 0) / reviews.length;

      const overall = Math.round(((avgComm + avgAcc + avgRel + avgTime) / 4) * 20);

      const user = mockDb.getUsers().find(u => u._id.toString() === userId.toString());
      if (user) {
        user.trustScore = {
          overall: Math.min(100, overall),
          trust: Math.round(avgRel * 20),
          availability: Math.round(avgTime * 20),
          condition: Math.round(avgAcc * 20),
          response: Math.round(avgComm * 20)
        };
      }
    }
  } catch (error) {
    console.error('Error calculating trust score:', error);
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { revieweeId, borrowRequestId, itemId, ratings, comment, reviewType } = req.body;
    const reviewerId = req.userId;

    if (!revieweeId || !ratings) {
      return res.status(400).json({ message: 'Reviewee ID and ratings object are required.' });
    }

    if (isMongoConnected()) {
      const existing = await Review.findOne({ reviewerId, revieweeId, borrowRequestId });
      if (existing) {
        return res.status(400).json({ message: 'You have already reviewed this transaction' });
      }

      const review = new Review({
        reviewerId,
        revieweeId,
        borrowRequestId,
        itemId,
        reviewType: reviewType || 'BORROWER_TO_OWNER',
        ratings: {
          communication: ratings.communication || 5,
          itemAccuracy: ratings.itemAccuracy || 5,
          reliability: ratings.reliability || 5,
          timelinessOrCondition: ratings.timelinessOrCondition || 5
        },
        comment: comment || ''
      });

      await review.save();
      await updateTrustScore(revieweeId);

      return res.status(201).json({ message: 'Review submitted successfully', review });
    } else {
      await mockDb.initMockData();
      const reviews = mockDb.getReviews();
      const existing = reviews.find(r => r.reviewerId.toString() === reviewerId.toString() && r.borrowRequestId?.toString() === borrowRequestId?.toString());

      if (existing) {
        return res.status(400).json({ message: 'You have already reviewed this transaction' });
      }

      const newReview = {
        _id: '65b5' + Date.now().toString().slice(-20),
        reviewerId,
        revieweeId,
        borrowRequestId,
        itemId,
        reviewType: reviewType || 'BORROWER_TO_OWNER',
        ratings: {
          communication: ratings.communication || 5,
          itemAccuracy: ratings.itemAccuracy || 5,
          reliability: ratings.reliability || 5,
          timelinessOrCondition: ratings.timelinessOrCondition || 5
        },
        comment: comment || '',
        createdAt: new Date()
      };

      reviews.unshift(newReview);
      await updateTrustScore(revieweeId);

      return res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

// Get user reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (isMongoConnected()) {
      const reviews = await Review.find({ revieweeId: userId })
        .populate('reviewerId', 'firstName lastName profileImage')
        .sort({ createdAt: -1 });
      return res.json(reviews);
    } else {
      await mockDb.initMockData();
      const reviews = mockDb.getReviews().filter(r => r.revieweeId.toString() === userId.toString());
      return res.json(reviews);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};
