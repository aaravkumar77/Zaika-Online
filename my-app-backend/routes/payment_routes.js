const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Payment = require('../models/payment');
const Order = require('../models/order');
const crypto = require('crypto');

// Attempt to load Razorpay; fall back to a dummy implementation when
// the package or keys are not available so the server can run in dev/test.
let razorpay;
try {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.warn('⚠️ Razorpay module not available or failed to initialize — using dummy payment implementation.');
  razorpay = {
    orders: {
      create: async ({ amount, currency, receipt, notes }) => ({ id: `dummy_order_${Date.now()}`, amount, currency, receipt, notes }),
    },
    payments: {
      refund: async (paymentId, opts) => ({ id: `dummy_refund_${Date.now()}`, paymentId, opts }),
    },
  };
}

// Create Razorpay order
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
      },
    });

    // Create payment record
    const payment = await Payment.create({
      orderId,
      userId: req.user._id,
      amount,
      currency: 'INR',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Razorpay payment
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment status
    const payment = await Payment.findById(paymentId);
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();

    // Update order status
    const order = await Order.findById(payment.orderId);
    order.paymentStatus = 'paid';
    order.status = 'accepted';
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment details
router.get('/:paymentId', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('orderId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refund payment
router.post('/:paymentId/refund', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100,
    });

    // Update payment
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
