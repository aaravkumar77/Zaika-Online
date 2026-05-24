'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Ticket, Check, Sparkles } from 'lucide-react';

interface CouponSelectorProps {
  orderAmount: number;
  restaurantId: string;
  onCouponApplied?: (coupon: { code: string; discount: number } | null) => void;
}

interface CouponValidation {
  valid: boolean;
  coupon?: {
    code: string;
    discount: number;
    description?: string;
  };
  message?: string;
}

export default function CouponSelector({ orderAmount, restaurantId, onCouponApplied }: CouponSelectorProps) {
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<CouponValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        orderAmount,
        restaurantId,
      });

      setValidatedCoupon(response.data);
      if (response.data.valid) {
        toast.success(`Coupon valid: save ₹${response.data.coupon.discount}`);
      } else {
        toast.error(response.data.message || 'Coupon is not valid');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Coupon validation failed');
      setValidatedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!validatedCoupon?.valid || !validatedCoupon?.coupon) {
      toast.error('Validate a coupon before applying it');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/coupons/${validatedCoupon.coupon.code}/apply`);
      setApplied(true);
      onCouponApplied?.(validatedCoupon.coupon);
      toast.success('Coupon applied successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setValidatedCoupon(null);
    setApplied(false);
    onCouponApplied?.(null);
    toast.success('Coupon removed');
  };

  return (
    <div className="rounded-[1.75rem] border border-[#efd9bd] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d9472b] text-white">
          <Ticket size={19} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9472b]">Coupon code</p>
          <p className="text-xs text-[#765f55]">Apply the best discount for your order.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          className="zaika-input"
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
          placeholder="EXAMPLE10"
          disabled={loading || applied}
        />
        <button
          type="button"
          onClick={handleValidateCoupon}
          disabled={loading || !couponCode.trim() || applied}
          className="rounded-2xl bg-[#d9472b] px-4 py-3 text-white transition hover:bg-[#c23a1f] disabled:opacity-50"
        >
          {loading ? 'Checking...' : applied ? 'Applied' : 'Validate'}
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-[#f3e3d0] bg-[#fffbf6] p-4 text-sm text-[#765f55]">
        <div className="flex items-center gap-2 text-[#251611] font-semibold">
          <Sparkles size={16} /> Save more
        </div>
        <p className="mt-2">Validate any code before applying. Valid coupons deliver instant savings on your basket.</p>
      </div>

      {validatedCoupon && !applied && (
        <div
          className={`mt-4 rounded-3xl p-4 text-sm ${
            validatedCoupon.valid
              ? 'bg-[#ecfdf5] text-[#166534] border border-[#86efac]'
              : 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">
              {validatedCoupon.valid ? 'Coupon valid!' : 'Invalid code'}
            </p>
            {validatedCoupon.valid && <Check size={16} className="text-[#15803d]" />}
          </div>
          {validatedCoupon.coupon?.description && (
            <p className="mt-2">{validatedCoupon.coupon.description}</p>
          )}
          {validatedCoupon.coupon?.discount !== undefined && (
            <p className="mt-2 font-semibold">Save ₹{validatedCoupon.coupon.discount}</p>
          )}
          {validatedCoupon.message && <p className="mt-2">{validatedCoupon.message}</p>}
          {validatedCoupon.valid && (
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={loading}
              className="mt-4 rounded-2xl bg-[#15803d] px-4 py-2 text-white transition hover:bg-[#166534] disabled:opacity-50"
            >
              Apply coupon
            </button>
          )}
        </div>
      )}

      {applied && validatedCoupon?.coupon && (
        <div className="mt-4 rounded-3xl border border-[#d1fae5] bg-[#ecfdf5] p-4 text-sm text-[#155e75]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{validatedCoupon.coupon.code} applied</p>
              <p>You saved ₹{validatedCoupon.coupon.discount}</p>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="rounded-full bg-[#fde68a] px-3 py-1 text-xs font-semibold text-[#92400e]"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
