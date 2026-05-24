const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    comment: String,
    images: [String], // Image URLs from Cloudinary
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    foodQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    deliveryQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate reviews from same user
reviewSchema.index({ restaurantId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
