const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const mongoose = require('mongoose');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Create Stripe PaymentIntent with manual capture for security deposit hold
exports.createDepositHold = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId is required' });

    if (isMongoConnected()) {
      const borrowReq = await BorrowRequest.findById(requestId).populate('itemId');
      if (!borrowReq) return res.status(404).json({ message: 'Borrow request not found' });

      // Verify user is borrower
      if (borrowReq.borrowerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Only borrower can initiate security deposit hold' });
      }

      const depositAmount = borrowReq.itemId?.deposit || borrowReq.pricing?.deposit || 50;

      if (!stripe) {
        // Fallback for development without live Stripe key
        borrowReq.depositStatus = 'HOLD_CREATED';
        borrowReq.depositPaymentIntentId = 'mock_pi_' + Date.now();
        await borrowReq.save();
        return res.json({
          message: 'Mock security deposit hold created successfully',
          clientSecret: 'mock_client_secret_' + Date.now(),
          paymentIntentId: borrowReq.depositPaymentIntentId,
          depositStatus: borrowReq.depositStatus
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(depositAmount * 100), // convert to cents
        currency: borrowReq.pricing?.currency || 'usd',
        capture_method: 'manual',
        metadata: {
          requestId: borrowReq._id.toString(),
          borrowerId: req.userId.toString(),
          itemId: borrowReq.itemId._id.toString()
        }
      }, {
        idempotencyKey: `hold_${borrowReq._id.toString()}`
      });

      borrowReq.depositPaymentIntentId = paymentIntent.id;
      borrowReq.depositStatus = 'HOLD_CREATED';
      await borrowReq.save();

      return res.json({
        message: 'Security deposit hold created',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        depositStatus: borrowReq.depositStatus
      });
    } else {
      return res.json({
        message: 'Mock security deposit hold created (in-memory mode)',
        depositStatus: 'HOLD_CREATED',
        paymentIntentId: 'mock_pi_' + Date.now()
      });
    }
  } catch (error) {
    console.error('Deposit Hold Error:', error);
    res.status(500).json({ message: 'Failed to create deposit hold', error: error.message });
  }
};

// Capture security deposit hold (e.g. on damage dispute)
exports.captureDeposit = async (req, res) => {
  try {
    const { requestId, amount, reason } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId is required' });

    if (isMongoConnected()) {
      const borrowReq = await BorrowRequest.findById(requestId);
      if (!borrowReq) return res.status(404).json({ message: 'Borrow request not found' });

      // Verify user is owner/lender
      if (borrowReq.ownerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Only lender can capture deposit hold' });
      }

      if (borrowReq.depositPaymentIntentId && stripe) {
        const captureParams = amount ? { amount_to_capture: Math.round(amount * 100) } : {};
        await stripe.paymentIntents.capture(borrowReq.depositPaymentIntentId, captureParams);
      }

      borrowReq.depositStatus = 'CAPTURED';
      borrowReq.disputeReason = reason || 'Item damaged or not returned';
      borrowReq.status = 'DISPUTED';
      await borrowReq.save();

      return res.json({
        message: 'Security deposit captured successfully',
        depositStatus: borrowReq.depositStatus
      });
    } else {
      return res.json({ message: 'Deposit captured (mock mode)' });
    }
  } catch (error) {
    console.error('Capture Deposit Error:', error);
    res.status(500).json({ message: 'Failed to capture deposit', error: error.message });
  }
};

// Release security deposit hold (e.g. on verified QR return)
exports.releaseDeposit = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId is required' });

    if (isMongoConnected()) {
      const borrowReq = await BorrowRequest.findById(requestId);
      if (!borrowReq) return res.status(404).json({ message: 'Borrow request not found' });

      if (borrowReq.depositPaymentIntentId && stripe) {
        await stripe.paymentIntents.cancel(borrowReq.depositPaymentIntentId);
      }

      borrowReq.depositStatus = 'RELEASED';
      await borrowReq.save();

      return res.json({
        message: 'Security deposit hold released successfully',
        depositStatus: borrowReq.depositStatus
      });
    } else {
      return res.json({ message: 'Deposit released (mock mode)' });
    }
  } catch (error) {
    console.error('Release Deposit Error:', error);
    res.status(500).json({ message: 'Failed to release deposit', error: error.message });
  }
};

// Stripe Webhook Listener
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body;
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Stripe Event
  switch (event.type) {
    case 'payment_intent.amount_capturable_updated': {
      const paymentIntent = event.data.object;
      const requestId = paymentIntent.metadata?.requestId;
      if (requestId && isMongoConnected()) {
        await BorrowRequest.findByIdAndUpdate(requestId, { depositStatus: 'HOLD_CREATED' });
      }
      break;
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const requestId = paymentIntent.metadata?.requestId;
      if (requestId && isMongoConnected()) {
        await BorrowRequest.findByIdAndUpdate(requestId, { depositStatus: 'CAPTURED' });
      }
      break;
    }
    case 'payment_intent.canceled': {
      const paymentIntent = event.data.object;
      const requestId = paymentIntent.metadata?.requestId;
      if (requestId && isMongoConnected()) {
        await BorrowRequest.findByIdAndUpdate(requestId, { depositStatus: 'RELEASED' });
      }
      break;
    }
  }

  res.json({ received: true });
};
