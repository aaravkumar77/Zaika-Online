'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Loader } from 'lucide-react';
import axios from 'axios';

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  email: string;
  phone: string;
  customerName: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function RazorpayCheckout({
  orderId,
  amount,
  email,
  phone,
  customerName,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      toast.error('❌ Failed to load payment gateway');
      setRazorpayLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const createOrderResponse = await axios.post(
        '/api/payments/razorpay/create-order',
        {
          orderId,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { razorpayOrderId, paymentId, key } = createOrderResponse.data;

      // Razorpay options
      const options = {
        key, // Razorpay Key ID
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Zaika Online',
        description: `Order #${orderId}`,
        image: '/logo.png', // Your logo
        order_id: razorpayOrderId,
        prefill: {
          name: customerName,
          email,
          contact: phone,
        },
        theme: {
          color: '#d9472b', // Zaika red
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              '/api/payments/razorpay/verify',
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            toast.success('✅ Payment successful! Your order is confirmed.');
            onSuccess?.(paymentId);
          } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Payment verification failed';
            toast.error(`❌ ${errorMsg}`);
            onError?.(errorMsg);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('❌ Payment cancelled');
            setLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to initiate payment';
      toast.error(`❌ ${errorMsg}`);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#efd9bd] rounded-lg p-6">
      {/* Order Summary */}
      <div className="mb-6 pb-6 border-b border-[#efd9bd]">
        <h3 className="text-lg font-semibold text-[#251611] mb-4">💳 Payment Summary</h3>
        <div className="space-y-2 text-[#765f55]">
          <div className="flex justify-between">
            <span>Order Amount:</span>
            <span className="font-semibold">₹{amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6 pb-6 border-b border-[#efd9bd]">
        <h3 className="text-lg font-semibold text-[#251611] mb-4">👤 Customer Details</h3>
        <div className="space-y-2 text-sm text-[#765f55]">
          <p>
            <span className="font-semibold">Name:</span> {customerName}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {email}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {phone}
          </p>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-6 pb-6 border-b border-[#efd9bd]">
        <h3 className="text-lg font-semibold text-[#251611] mb-4">🔒 Secure Payment</h3>
        <div className="flex items-center gap-2 text-sm text-[#765f55]">
          <div className="bg-[#dcfce7] text-[#166534] rounded-full p-2">
            <CreditCard size={16} />
          </div>
          <p>
            Your payment is processed securely by <span className="font-semibold">Razorpay</span>.
            We never store your card details.
          </p>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded}
        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
          loading || !razorpayLoaded
            ? 'bg-[#d9472b] opacity-50 cursor-not-allowed'
            : 'bg-[#d9472b] hover:bg-[#c23a1f]'
        }`}
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pay ₹{amount.toFixed(2)} with Razorpay
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-[#765f55] text-center mt-4">
        By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
