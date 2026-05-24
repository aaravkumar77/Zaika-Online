"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ReceiptText, ShoppingBag } from "lucide-react";
import { api } from "../lib/api";
import useAuthContext from "../hooks/useAuth";
import OrderTimeline from "../components/OrderTimeline";

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  restaurantId?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

const statusSteps = ["placed", "accepted", "preparing", "out_for_delivery", "delivered"];

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    api
      .get("/orders/my")
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError("Could not load your orders. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-[#765f55]">
        Loading orders...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="zaika-card rounded-2xl p-8">
          <ReceiptText className="mx-auto h-10 w-10 text-[#d9472b]" />
          <h1 className="mt-4 text-3xl font-black text-[#251611]">
            Login to view orders
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#765f55]">
            Your order history is available after you sign in as a customer.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-[#d9472b]">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">
            Order history
          </p>
          <h1 className="mt-2 text-4xl font-black text-[#251611]">
            My Orders
          </h1>
          <p className="mt-2 max-w-2xl text-[#765f55]">
            Track current meals and revisit what you ordered before.
          </p>
        </div>
        <div className="rounded-full border border-[#efd9bd] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#765f55]">
          {orders.length} orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="zaika-card rounded-2xl p-8 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#d9472b]" />
          <h2 className="mt-4 text-2xl font-black text-[#251611]">
            No orders yet
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[#765f55]">
            Explore restaurants and place your first Zaika order.
          </p>
          <Link href="/restaurants" className="zaika-button mt-5 inline-block px-6 py-3">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order._id}
              className="zaika-card rounded-2xl p-5 md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-[#251611]">
                      {order.restaurantId?.name || "Restaurant"}
                    </h2>
                    <span className="rounded-full bg-[#fff1d5] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#d9472b]">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#765f55]">
                    <Clock className="h-4 w-4 text-[#d9472b]" />
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <p className="text-2xl font-black text-[#251611]">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 rounded-xl bg-[#fff8ed] p-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-[#251611]">{item.name}</p>
                      <p className="text-[#765f55]">Qty {item.quantity}</p>
                    </div>
                    <p className="font-black text-[#d9472b]">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <OrderTimeline status={order.status} createdAt={order.createdAt} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
