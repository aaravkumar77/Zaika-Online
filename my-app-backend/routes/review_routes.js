const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Review = require('../models/review');
const Restaurant = require('../models/restaurant');

// Create review
router.post('/', protect, async (req, res) => {
  try {
    const { restaurantId, rating, title, comment, images, foodQuality, deliveryQuality } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      restaurantId,
      customerId: req.user._id,
    });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this restaurant' });
    }

    const review = await Review.create({
      restaurantId,
      customerId: req.user._id,
      rating,
      title,
      comment,
      images: images || [],
      foodQuality,
      deliveryQuality,
    });

    // Update restaurant rating
    const allReviews = await Review.find({ restaurantId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate('customerId', 'name avatar email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's reviews
router.get('/user/reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate('restaurantId', 'name logoUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark helpful/unhelpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const { helpful } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.unhelpful += 1;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
