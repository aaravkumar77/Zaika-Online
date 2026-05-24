'use client';

import { CreditCard, Loader, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DummyPaymentPanelProps {
  amount: number;
  status: 'idle' | 'processing' | 'success';
  onPay: () => void;
  disabled?: boolean;
}

export default function DummyPaymentPanel({ amount, status, onPay, disabled }: DummyPaymentPanelProps) {
  return (
    <div className="rounded-[1.75rem] border border-[#efd9bd] bg-[#fffdf8] p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9472b] text-white">
          <CreditCard size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d9472b]">
            Demo payment
          </p>
          <p className="text-sm text-[#765f55]">No real card required — continue with a safe simulated checkout.</p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="rounded-3xl bg-[#dcfce7] p-4 text-[#166534]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15803d]/10 text-[#15803d]">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-semibold">Payment completed</p>
              <p className="text-sm">Your payment succeeded. Your order will be confirmed shortly.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-sm text-[#765f55]">Amount to pay</p>
            <p className="mt-2 text-2xl font-black text-[#251611]">₹{amount.toFixed(2)}</p>
          </div>

          <div className="rounded-3xl border border-[#f1e5d3] bg-[#fffaf1] p-4 text-sm text-[#765f55]">
            <div className="flex items-center gap-2 font-semibold text-[#251611]">
              <ShieldCheck size={16} /> Secure demo checkout
            </div>
            <p className="mt-2">Your payment flow is mocked here so you can place orders without actual card processing.</p>
          </div>

          <div className="grid gap-3">
            <input className="zaika-input" placeholder="Card number" defaultValue="4242 4242 4242 4242" disabled />
            <div className="grid grid-cols-2 gap-3">
              <input className="zaika-input" placeholder="MM/YY" defaultValue="12/34" disabled />
              <input className="zaika-input" placeholder="CVV" defaultValue="123" disabled />
            </div>
          </div>

          <button
            type="button"
            onClick={onPay}
            disabled={disabled}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d9472b] px-4 py-3 text-white transition hover:bg-[#c23a1f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'processing' ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Processing payment...
              </>
            ) : (
              'Simulate payment success'
            )}
          </button>

          <p className="text-xs text-[#765f55]">This is a demo checkout. No real payment will be processed.</p>
        </div>
      )}
    </div>
  );
}
