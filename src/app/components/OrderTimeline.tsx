'use client';

import React from 'react';
import { Check, Clock, Truck, MapPin, Home } from 'lucide-react';

interface OrderTimelineProps {
  status: 'placed' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
}

export default function OrderTimeline({ status, createdAt, estimatedDelivery }: OrderTimelineProps) {
  const statusSteps = [
    { id: 'placed', label: 'Order Placed', icon: Clock, color: '#d9472b' },
    { id: 'accepted', label: 'Accepted', icon: Check, color: '#d9472b' },
    { id: 'preparing', label: 'Preparing', icon: Clock, color: '#d9472b' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: '#d9472b' },
    { id: 'delivered', label: 'Delivered', icon: Home, color: '#15803d' },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.id === status);
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-lg p-6 text-center">
        <p className="text-[#991b1b] font-bold text-lg">❌ Order Cancelled</p>
        <p className="text-[#7f1d1d] text-sm mt-2">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#efd9bd] rounded-lg p-6">
      <h3 className="text-lg font-bold text-[#251611] mb-6">📍 Order Status</h3>

      {/* Timeline */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-[#efd9bd]" />

        {/* Steps */}
        <div className="space-y-6 relative z-10">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Icon circle */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                    isCompleted
                      ? 'bg-[#d9472b] shadow-lg'
                      : 'bg-[#efd9bd] text-[#765f55]'
                  }`}
                >
                  <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <p className={`font-bold text-lg transition-colors ${
                    isCompleted ? 'text-[#d9472b]' : 'text-[#765f55]'
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-[#15803d] font-semibold mt-1">
                      ⏳ In Progress
                    </p>
                  )}
                  {isCompleted && !isCurrent && (
                    <p className="text-sm text-[#15803d] font-semibold mt-1">
                      ✅ Completed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-gradient-to-r from-[#fffdf8] to-[#fff1d5] border border-[#efd9bd] rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#765f55] text-xs uppercase font-semibold">Order Placed</p>
            <p className="text-[#251611] font-bold">
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>
          {estimatedDelivery && (
            <div>
              <p className="text-[#765f55] text-xs uppercase font-semibold">
                {isDelivered ? '✅ Delivered' : '📍 Estimated Delivery'}
              </p>
              <p className="text-[#251611] font-bold">
                {new Date(estimatedDelivery).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {isDelivered && (
        <div className="mt-4 p-4 bg-[#dcfce7] border border-[#86efac] rounded-lg text-center">
          <p className="text-[#166534] font-bold">🎉 Thank you for your order!</p>
          <p className="text-[#166534] text-sm mt-1">
            We hope you enjoyed your meal. Would you like to leave a review?
          </p>
        </div>
      )}
    </div>
  );
}
