"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import useAuthContext from "../hooks/useAuth";
import CouponSelector from "./CouponSelector";
import DummyPaymentPanel from "./DummyPaymentPanel";

interface Dish {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  category?: string;
  isVeg: boolean;
}

interface CartItem {
  dish: Dish;
  quantity: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

const emptyAddress: DeliveryAddress = {
  street: "",
  city: "",
  state: "",
  zip: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MenuOrderPanel({
  restaurantId,
  dishes,
}: {
  restaurantId: string;
  dishes: Dish[];
}) {
  const { user } = useAuthContext();
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [address, setAddress] = useState<DeliveryAddress>(emptyAddress);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );
  const deliveryFee = itemCount > 0 ? 29 : 0;
  const total = subtotal + deliveryFee;
  const discountedTotal = Math.max(0, total - couponDiscount);

  useEffect(() => {
    if (!user || !["customer", "admin"].includes(user.role)) return;

    api
      .get("/favourites")
      .then((res) => {
        const ids = Array.isArray(res.data)
          ? res.data.map((dish: Dish) => dish._id)
          : [];
        setFavouriteIds(new Set(ids));
      })
      .catch(() => {
        setFavouriteIds(new Set());
      });
  }, [user]);

  const updateQuantity = (dish: Dish, delta: number) => {
    setMessage(null);
    setError(null);
    setCart((current) => {
      const existing = current[dish._id]?.quantity || 0;
      const nextQuantity = existing + delta;
      const nextCart = { ...current };

      if (nextQuantity <= 0) {
        delete nextCart[dish._id];
      } else {
        nextCart[dish._id] = { dish, quantity: nextQuantity };
      }

      return nextCart;
    });
  };

  const toggleFavourite = async (dish: Dish) => {
    setMessage(null);
    setError(null);

    if (!user || !["customer", "admin"].includes(user.role)) {
      setError("Please login as a customer to save favourite items.");
      return;
    }

    const isFavourite = favouriteIds.has(dish._id);
    const nextIds = new Set(favouriteIds);

    if (isFavourite) {
      nextIds.delete(dish._id);
    } else {
      nextIds.add(dish._id);
    }

    setFavouriteIds(nextIds);

    try {
      const res = isFavourite
        ? await api.delete(`/favourites/${dish._id}`)
        : await api.post(`/favourites/${dish._id}`);
      const ids = Array.isArray(res.data)
        ? res.data.map((item: Dish) => item._id)
        : Array.from(nextIds);
      setFavouriteIds(new Set(ids));
    } catch (err: any) {
      setFavouriteIds(favouriteIds);
      setError(err?.response?.data?.message || "Could not update favourites.");
    }
  };

  const submitOrder = async () => {
    setMessage(null);
    setError(null);

    try {
      setPlacingOrder(true);
      await api.post("/orders", {
        restaurantId,
        items: cartItems.map((item) => ({
          dishId: item.dish._id,
          quantity: item.quantity,
        })),
        deliveryAddress: address,
        couponCode: appliedCouponCode,
        discountAmount: couponDiscount,
        paymentDetails: {
          paymentId: `DUMMY-${Date.now()}`,
          status: "paid",
        },
      });

      setCart({});
      setAddress(emptyAddress);
      setCouponDiscount(0);
      setAppliedCouponCode(null);
      setPaymentStatus('idle');
      setMessage("✅ Payment successful and order placed! You can track it from My Orders.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not place order right now.");
      setPaymentStatus('idle');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCouponApplied = (coupon: { code: string; discount: number } | null) => {
    if (coupon) {
      setCouponDiscount(coupon.discount);
      setAppliedCouponCode(coupon.code);
    } else {
      setCouponDiscount(0);
      setAppliedCouponCode(null);
    }
  };

  const handleDummyPayment = async () => {
    setMessage(null);
    setError(null);

    if (!user) {
      setError("Please login as a customer before placing an order.");
      return;
    }

    if (!["customer", "admin"].includes(user.role)) {
      setError("Vendor accounts can manage menus, but cannot place customer orders.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Add at least one dish to your cart.");
      return;
    }

    const hasAddress = Object.values(address).every((value) => value.trim());
    if (!hasAddress) {
      setError("Please complete your delivery address.");
      return;
    }

    setPaymentStatus('processing');
    setTimeout(async () => {
      setPaymentStatus('success');
      await submitOrder();
    }, 1200);
  };

  if (dishes.length === 0) {
    return (
      <div className="zaika-card rounded-2xl p-8 text-[#765f55]">
        No dishes available for this restaurant.
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-[#efe1cf] bg-[#fffdf8] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">Menu</p>
              <h2 className="mt-2 text-3xl font-black text-[#251611]">Choose your favourites</h2>
            </div>
            <div className="rounded-full bg-[#fff1d5] px-4 py-2 text-sm font-semibold text-[#d9472b]">
              {itemCount} item{itemCount === 1 ? '' : 's'} selected
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765f55]">
            Browse the menu and add dishes to your cart. Use coupons to save instantly and place a seamless demo order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {dishes.map((dish) => {
            const quantity = cart[dish._id]?.quantity || 0;
            const isFavourite = favouriteIds.has(dish._id);

            return (
              <div
                key={dish._id}
                className="group overflow-hidden rounded-[1.75rem] border border-[#efe1cf] bg-[#fffdf8] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {dish.imageUrl && (
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                  </div>
                )}

                <div className="flex flex-grow flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-[#251611]">{dish.name}</h3>
                      <p className="mt-2 min-h-[2.5rem] text-sm leading-6 text-[#765f55]">
                        {dish.description || 'Delicious dish prepared with fresh ingredients.'}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff1d5] px-3 py-1 text-sm font-black text-[#d9472b]">
                      {formatCurrency(dish.price)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span
                      className={`rounded-full px-3 py-1 ${
                        dish.isVeg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {dish.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                    {dish.category && (
                      <span className="rounded-full bg-[#f7ead6] px-3 py-1 text-[#765f55]">
                        {dish.category}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    {quantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQuantity(dish, 1)}
                        className="zaika-button flex w-full items-center justify-center gap-2 px-4 py-3"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center justify-between rounded-2xl border border-[#efd9bd] bg-[#fff8ed] p-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(dish, -1)}
                          className="rounded-lg p-2 text-[#d9472b] transition hover:bg-[#fff1d5]"
                          aria-label={`Remove one ${dish.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-black text-[#251611]">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(dish, 1)}
                          className="rounded-lg p-2 text-[#15803d] transition hover:bg-green-50"
                          aria-label={`Add one ${dish.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFavourite(dish)}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm transition ${
                        isFavourite
                          ? 'border-[#d9472b] bg-red-50 text-[#d9472b]'
                          : 'border-[#efd9bd] text-[#765f55] hover:bg-[#fff1d5] hover:text-[#d9472b]'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="sticky top-24 space-y-6">
        <div className="rounded-[1.75rem] border border-[#efd9bd] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">Your order</p>
              <h3 className="mt-2 text-2xl font-black text-[#251611]">Checkout details</h3>
            </div>
            <span className="rounded-full bg-[#fff1d5] px-4 py-2 text-sm font-semibold text-[#d9472b]">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-[#efd9bd] bg-[#fff8ed] p-5 text-sm text-[#765f55]">
              Add dishes from the menu to start building your meal.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.dish._id}
                  className="flex items-center justify-between gap-3 rounded-3xl bg-[#fff8ed] p-4"
                >
                  <div>
                    <p className="font-semibold text-[#251611]">{item.dish.name}</p>
                    <p className="text-sm text-[#765f55]">{item.quantity} × {formatCurrency(item.dish.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.dish, -item.quantity)}
                    className="rounded-full border border-[#efd9bd] p-2 text-[#d9472b] transition hover:bg-[#fff1d5]"
                    aria-label={`Remove ${item.dish.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-[1.5rem] border border-[#f0e2cd] bg-[#fff8ed] p-4 text-sm text-[#765f55]">
            <p className="font-semibold text-[#251611]">Estimated delivery</p>
            <p className="mt-2">30–40 minutes from confirmation, based on kitchen load and delivery traffic.</p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[1.75rem] border border-[#efd9bd] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">Delivery address</p>
            <div className="mt-4 grid gap-3">
              <input
                className="zaika-input"
                placeholder="Street"
                value={address.street}
                onChange={(event) =>
                  setAddress((current) => ({ ...current, street: event.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="zaika-input"
                  placeholder="City"
                  value={address.city}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, city: event.target.value }))
                  }
                />
                <input
                  className="zaika-input"
                  placeholder="State"
                  value={address.state}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, state: event.target.value }))
                  }
                />
              </div>
              <input
                className="zaika-input"
                placeholder="PIN code"
                value={address.zip}
                onChange={(event) =>
                  setAddress((current) => ({ ...current, zip: event.target.value }))
                }
              />
            </div>
          </div>

          <CouponSelector
            orderAmount={total}
            restaurantId={restaurantId}
            onCouponApplied={handleCouponApplied}
          />

          <div className="rounded-[1.75rem] border border-[#efd9bd] bg-[#fffdf8] p-5 shadow-sm">
            <div className="flex justify-between text-sm text-[#765f55]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm text-[#765f55]">
              <span>Delivery</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="mt-3 flex justify-between text-sm text-[#15803d]">
                <span>Coupon discount{appliedCouponCode ? ` (${appliedCouponCode})` : ''}</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="mt-6 flex items-center justify-between border-t border-[#efd9bd] pt-4 text-lg font-black text-[#251611]">
              <span>Total</span>
              <span>{formatCurrency(discountedTotal)}</span>
            </div>
          </div>

          <DummyPaymentPanel
            amount={discountedTotal}
            status={paymentStatus}
            onPay={handleDummyPayment}
            disabled={placingOrder || paymentStatus === 'processing'}
          />

          {error && (
            <p className="rounded-3xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-3xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              {message}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
