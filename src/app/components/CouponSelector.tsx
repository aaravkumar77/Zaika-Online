'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Ticket, Check } from 'lucide-react';
import axios from 'axios';

interface CouponSelectorProps {
  orderAmount: number;
  restaurantId?: string;
  onCouponApplied?: (coupon: { code: string; discount: number }) => void;
}

interface CouponValidation {
  valid: boolean;
  coupon?: {
    code: string;
    description?: string;
    discount: number;
  };
  message?: string;
}

export default function CouponSelector({
  orderAmount,
  restaurantId,
  onCouponApplied,
}: CouponSelectorProps) {
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<CouponValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode.toUpperCase(),
        orderAmount,
        restaurantId,
      });

      if (response.data.valid) {
        setValidatedCoupon(response.data);
        toast.success(`✅ Coupon applied! You save ₹${response.data.coupon.discount}`);
      } else {
        toast.error(response.data.message || 'Invalid coupon');
        setValidatedCoupon(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to validate coupon';
      toast.error(errorMsg);
      setValidatedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!validatedCoupon?.valid || !validatedCoupon?.coupon) {
      toast.error('Please validate a coupon first');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `/api/coupons/${validatedCoupon.coupon.code}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setAppliedCoupon(validatedCoupon.coupon.code);
      onCouponApplied?.(validatedCoupon.coupon);
      toast.success('🎉 Coupon successfully applied!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setValidatedCoupon(null);
    onCouponApplied?.(null as any);
    toast.success('Coupon removed');
  };

  return (
    <div className="bg-gradient-to-r from-[#fffdf8] to-[#fff1d5] border border-[#efd9bd] rounded-lg p-4 mb-4">
      {appliedCoupon ? (
        // Applied Coupon Display
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#d9472b] text-white rounded-full p-2">
              <Check size={20} />
            </div>
            <div>
              <p className="font-semibold text-[#251611]">🎉 Coupon Applied!</p>
              <p className="text-sm text-[#765f55]">
                Code: <span className="font-mono font-bold">{appliedCoupon}</span>
              </p>
              {validatedCoupon?.coupon && (
                <p className="text-sm text-[#15803d] font-semibold">
                  💰 You save ₹{validatedCoupon.coupon.discount}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-[#d9472b] hover:text-[#c23a1f] font-semibold transition"
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        // Coupon Input Form
        <div>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-3 text-[#d9472b]" size={20} />
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full border border-[#efd9bd] rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9472b]"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleValidateCoupon}
              disabled={loading || !couponCode.trim()}
              className="bg-[#d9472b] text-white px-6 py-2 rounded-lg hover:bg-[#c23a1f] transition disabled:opacity-50 font-semibold"
            >
              {loading ? '⏳' : '✓'} Apply
            </button>
          </div>

          {validatedCoupon && (
            <div
              className={`p-3 rounded-lg text-sm ${
                validatedCoupon.valid
                  ? 'bg-[#dcfce7] text-[#166534] border border-[#86efac]'
                  : 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {validatedCoupon.valid ? '✅ Valid Coupon!' : '❌ Invalid Coupon'}
                  </p>
                  {validatedCoupon.coupon?.description && (
                    <p className="text-xs mt-1">{validatedCoupon.coupon.description}</p>
                  )}
                  {validatedCoupon.valid && validatedCoupon.coupon && (
                    <p className="text-sm font-bold mt-2">
                      You save ₹{validatedCoupon.coupon.discount}
                    </p>
                  )}
                  {validatedCoupon.message && (
                    <p className="text-xs mt-1">{validatedCoupon.message}</p>
                  )}
                </div>
                {validatedCoupon.valid && (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loading}
                    className="bg-[#15803d] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#166534] transition disabled:opacity-50"
                  >
                    {loading ? '...' : 'Apply'}
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-[#765f55] mt-3">
            💡 Have a coupon code? Enter it above to get instant discounts!
          </p>
        </div>
      )}
    </div>
  );
}
