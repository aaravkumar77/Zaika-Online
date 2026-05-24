const express = require('express');
const router = express.Router();
const { protect, isVendor } = require('../middlewares/authMiddleware');
const Order = require('../models/order');
const Dish = require('../models/dish');
const Review = require('../models/review');
const Restaurant = require('../models/restaurant');

// Get vendor analytics
router.get('/dashboard', protect, isVendor, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get orders for this restaurant
    const orders = await Order.find({ restaurantId: restaurant._id });

    // Calculate stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const averageOrderValue = totalRevenue / totalOrders || 0;

    // Get top dishes
    const dishes = await Dish.find({ restaurantId: restaurant._id });
    const topDishes = orders
      .flatMap((o) => o.items)
      .reduce((acc, item) => {
        const existing = acc.find((d) => d.dishId === item.dishId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          acc.push({
            dishId: item.dishId,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Populate dish details
    const topDishesWithDetails = await Promise.all(
      topDishes.map(async (dish) => {
        const details = await Dish.findById(dish.dishId);
        return {
          ...dish,
          name: details?.name,
          price: details?.price,
        };
      })
    );

    // Get reviews
    const reviews = await Review.find({ restaurantId: restaurant._id });
    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    // Get monthly revenue
    const monthlyRevenue = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      const existing = acc.find((m) => m.month === month);
      if (existing) {
        existing.revenue += order.totalPrice;
      } else {
        acc.push({ month, revenue: order.totalPrice });
      }
      return acc;
    }, []);

    // Order status distribution
    const statusDistribution = {
      placed: orders.filter((o) => o.status === 'placed').length,
      accepted: orders.filter((o) => o.status === 'accepted').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    res.json({
      restaurant: {
        name: restaurant.name,
        rating: averageRating,
        logoUrl: restaurant.logoUrl,
      },
      stats: {
        totalOrders,
        completedOrders,
        totalRevenue: Math.round(totalRevenue),
        averageOrderValue: Math.round(averageOrderValue),
        totalDishes: dishes.length,
        reviewCount: reviews.length,
      },
      topDishes: topDishesWithDetails,
      monthlyRevenue,
      statusDistribution,
      recentOrders: orders.slice(-10).reverse(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor performance metrics
router.get('/metrics', protect, isVendor, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const orders = await Order.find({ restaurantId: restaurant._id });
    const reviews = await Review.find({ restaurantId: restaurant._id });

    // Calculate metrics
    const completionRate =
      orders.length > 0
        ? (
            (orders.filter((o) => o.status === 'delivered').length / orders.length) *
            100
          ).toFixed(1)
        : 0;

    const cancellationRate =
      orders.length > 0
        ? (
            (orders.filter((o) => o.status === 'cancelled').length / orders.length) *
            100
          ).toFixed(1)
        : 0;

    const averageDeliveryTime = orders.length > 0 ? Math.round(30) : 0; // Example, calculate from actual times

    const foodQualityRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.foodQuality || r.rating), 0) / reviews.length).toFixed(
            1
          )
        : 0;

    const deliveryQualityRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.deliveryQuality || r.rating), 0) / reviews.length).toFixed(
            1
          )
        : 0;

    res.json({
      completionRate: parseFloat(completionRate),
      cancellationRate: parseFloat(cancellationRate),
      averageDeliveryTime,
      foodQualityRating: parseFloat(foodQualityRating),
      deliveryQualityRating: parseFloat(deliveryQualityRating),
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
