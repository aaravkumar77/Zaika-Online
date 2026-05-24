'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment?: string;
  foodQuality?: number;
  deliveryQuality?: number;
  helpful: number;
  unhelpful: number;
  customerId?: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
}

interface ReviewComponentProps {
  restaurantId: string;
  onReviewAdded?: () => void;
}

export default function ReviewComponent({ restaurantId, onReviewAdded }: ReviewComponentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [foodQuality, setFoodQuality] = useState(5);
  const [deliveryQuality, setDeliveryQuality] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reviews/restaurant/${restaurantId}`);
      setReviews(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error('Please add a review headline');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        restaurantId,
        rating,
        title,
        comment,
        foodQuality,
        deliveryQuality,
      });

      setTitle('');
      setComment('');
      setRating(5);
      setFoodQuality(5);
      setDeliveryQuality(5);
      toast.success('Review submitted successfully');
      fetchReviews();
      onReviewAdded?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`, { helpful });
      fetchReviews();
      toast.success(helpful ? 'Marked helpful' : 'Marked unhelpful');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not update review');
    }
  };

  const renderStars = (score: number, onChange?: (value: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`transition ${star <= score ? 'text-[#d9472b]' : 'text-[#ddd]'}`}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
        >
          <Star size={20} fill={star <= score ? '#d9472b' : 'none'} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="rounded-3xl border border-[#efd9bd] bg-[#fffdf8] p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d9472b]">
            Guest Reviews
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#251611]">Share your experience</h2>
        </div>
      </div>

      <form onSubmit={handleSubmitReview} className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#251611]">Overall rating</label>
          {renderStars(rating, setRating)}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#251611]">Review title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="zaika-input w-full"
            placeholder="Example: Best meal in town"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#251611]">Tell us more</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="zaika-input w-full min-h-[120px] resize-none"
            placeholder="How was the food and delivery?"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#251611]">Food quality</label>
            {renderStars(foodQuality, setFoodQuality)}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#251611]">Delivery experience</label>
            {renderStars(deliveryQuality, setDeliveryQuality)}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-[#d9472b] px-5 py-3 text-white transition hover:bg-[#c23a1f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Post review'}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-[#765f55]">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="rounded-3xl bg-[#fff1d5] p-6 text-sm text-[#765f55]">
            No reviews yet. Be the first to leave feedback!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-3xl border border-[#efd9bd] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#251611]">
                    <span>{review.customerId?.name || 'Guest'}</span>
                    <span className="rounded-full bg-[#fff1d5] px-2 py-1 text-xs text-[#d9472b]">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#765f55]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#765f55]">
                  <button
                    type="button"
                    onClick={() => handleHelpful(review._id, true)}
                    className="flex items-center gap-1 rounded-full border border-[#efd9bd] px-3 py-2 text-xs hover:border-[#d9472b] hover:text-[#d9472b]"
                  >
                    <ThumbsUp size={14} /> {review.helpful}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHelpful(review._id, false)}
                    className="flex items-center gap-1 rounded-full border border-[#efd9bd] px-3 py-2 text-xs hover:border-[#d9472b] hover:text-[#d9472b]"
                  >
                    <ThumbsDown size={14} /> {review.unhelpful}
                  </button>
                </div>
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#251611]">{review.title}</h3>
              {review.comment && (
                <p className="mt-2 text-sm leading-6 text-[#765f55]">{review.comment}</p>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-[#765f55]">
                <span>Food quality: {review.foodQuality ?? review.rating}/5</span>
                <span>Delivery quality: {review.deliveryQuality ?? review.rating}/5</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
