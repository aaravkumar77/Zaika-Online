'use client';

import { CheckCircle2, Clock, Package, Truck, Home, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

const steps = [
  { id: 'placed', label: 'Placed', icon: Clock },
  { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'preparing', label: 'Preparing', icon: Package },
  { id: 'out_for_delivery', label: 'On the way', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const activeIndex = steps.findIndex((step) => step.id === status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="rounded-3xl border border-[#efd9bd] bg-[#fffdf8] p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9472b]">
            Order timeline
          </p>
          <p className="mt-1 text-sm text-[#765f55]">
            Placed on {new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </p>
        </div>
        <div className="rounded-full bg-[#fff1d5] px-4 py-2 text-sm font-semibold text-[#251611]">
          {isCancelled ? 'Cancelled' : status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isCancelled ? (
          <div className="rounded-3xl bg-[#fee2e2] p-4 text-[#991b1b]">
            <div className="flex items-center gap-3">
              <XCircle size={24} />
              <p className="font-semibold">This order has been cancelled.</p>
            </div>
          </div>
        ) : (
          steps.map((step, index) => {
            const Icon = step.icon;
            const completed = index <= activeIndex;

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full border text-white ${
                    completed ? 'bg-[#d9472b] border-[#d9472b]' : 'bg-[#fffdf8] border-[#efd9bd] text-[#765f55]'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${completed ? 'text-[#251611]' : 'text-[#765f55]'}`}>
                    {step.label}
                  </p>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#f5f5f5]">
                    <div
                      className={`h-full rounded-full ${
                        completed ? 'bg-[#d9472b]' : 'bg-[#efd9bd]'
                      }`} 
                      style={{ width: completed ? '100%' : '10%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
