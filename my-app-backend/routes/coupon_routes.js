const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const Coupon = require('../models/coupon');

// Create coupon (Admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      maxUses,
      validFrom,
      validTo,
      applicableRestaurants,
    } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      maxUses,
      validFrom,
      validTo,
      applicableRestaurants,
      createdBy: req.user._id,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active coupons
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    }).select('code description discountType discountValue minOrderValue');

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount, restaurantId } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found or invalid' });
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validTo < now) {
      return res.status(400).json({ error: 'Coupon expired' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    if (orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.minOrderValue} required`,
      });
    }

    if (coupon.applicableRestaurants.length > 0) {
      const isApplicable = coupon.applicableRestaurants.some(
        (id) => id.toString() === restaurantId
      );
      if (!isApplicable) {
        return res.status(400).json({ error: 'Coupon not applicable to this restaurant' });
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount: Math.round(discount),
        description: coupon.description,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply coupon to order
router.post('/:code/apply', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Add user to usedBy if not already
    if (!coupon.usedBy.includes(req.user._id)) {
      coupon.usedBy.push(req.user._id);
      coupon.usedCount += 1;
      await coupon.save();
    }

    res.json({ message: 'Coupon applied' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
