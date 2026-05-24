'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Star, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import axios from 'axios';

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  foodQuality?: number;
  deliveryQuality?: number;
  helpful: number;
  unhelpful: number;
  createdAt: string;
}

interface ReviewComponentProps {
  restaurantId: string;
  onReviewAdded?: () => void;
}

export default function ReviewComponent({ restaurantId, onReviewAdded }: ReviewComponentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [foodQuality, setFoodQuality] = useState(5);
  const [deliveryQuality, setDeliveryQuality] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/reviews/restaurant/${restaurantId}`);
      setReviews(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !title.trim()) {
      toast.error('Please provide rating and title');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        '/api/reviews',
        {
          restaurantId,
          rating,
          title,
          comment,
          foodQuality,
          deliveryQuality,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('✅ Review submitted successfully!');
      setTitle('');
      setComment('');
      setRating(5);
      setFoodQuality(5);
      setDeliveryQuality(5);
      setShowForm(false);
      fetchReviews();
      onReviewAdded?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      await axios.post(
        `/api/reviews/${reviewId}/helpful`,
        { helpful: isHelpful },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchReviews();
      toast.success(isHelpful ? '👍 Marked helpful' : '👎 Marked unhelpful');
    } catch (error: any) {
      toast.error('Failed to update helpful count');
    }
  };

  const renderStars = (rating: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`transition-colors ${star <= rating ? 'text-[#d9472b]' : 'text-[#efd9bd]'}`}
            disabled={!onChange}
          >
            <Star size={24} fill={star <= rating ? '#d9472b' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-[#efd9bd] p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#251611]">⭐ Reviews ({reviews.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#d9472b] text-white px-4 py-2 rounded-lg hover:bg-[#c23a1f] transition"
        >
          {showForm ? '✕ Close' : '✍️ Write Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-[#fffdf8] border border-[#efd9bd] rounded-lg p-6 mb-6">
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-[#251611] font-semibold mb-2">Rating</label>
              {renderStars(rating, setRating)}
            </div>

            {/* Title */}
            <div>
              <label className="block text-[#251611] font-semibold mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Best biryani in town!"
                className="w-full border border-[#efd9bd] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9472b]"
                required
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-[#251611] font-semibold mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full border border-[#efd9bd] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9472b]"
              />
            </div>

            {/* Sub-ratings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#251611] font-semibold mb-2">🌱 Food Quality</label>
                {renderStars(foodQuality, setFoodQuality)}
              </div>
              <div>
                <label className="block text-[#251611] font-semibold mb-2">🚚 Delivery Quality</label>
                {renderStars(deliveryQuality, setDeliveryQuality)}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#d9472b] text-white px-4 py-2 rounded-lg hover:bg-[#c23a1f] transition disabled:opacity-50"
              >
                {submitting ? '⏳ Submitting...' : '✅ Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-[#efd9bd] text-[#251611] px-4 py-2 rounded-lg hover:bg-[#d9cbb3] transition"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-[#765f55]">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border border-[#efd9bd] rounded-lg p-4 bg-[#fffdf8]">
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#251611]">{review.customerId?.name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-[#d9472b] text-[#d9472b]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#765f55]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Title & Comment */}
              <h4 className="font-semibold text-[#251611] mb-1">{review.title}</h4>
              {review.comment && (
                <p className="text-[#765f55] mb-3">{review.comment}</p>
              )}

              {/* Sub-ratings */}
              {(review.foodQuality || review.deliveryQuality) && (
                <div className="flex gap-4 text-sm mb-3 text-[#765f55]">
                  {review.foodQuality && (
                    <span>🌱 Food: {review.foodQuality}/5</span>
                  )}
                  {review.deliveryQuality && (
                    <span>🚚 Delivery: {review.deliveryQuality}/5</span>
                  )}
                </div>
              )}

              {/* Helpful buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleHelpful(review._id, true)}
                  className="flex items-center gap-1 text-sm text-[#765f55] hover:text-[#d9472b] transition"
                >
                  <ThumbsUp size={16} /> Helpful ({review.helpful})
                </button>
                <button
                  onClick={() => handleHelpful(review._id, false)}
                  className="flex items-center gap-1 text-sm text-[#765f55] hover:text-[#d9472b] transition"
                >
                  <ThumbsDown size={16} /> Not helpful ({review.unhelpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
