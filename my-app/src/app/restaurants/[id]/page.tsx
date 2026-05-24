import { Clock, MapPin, Star } from "lucide-react";
import MenuOrderPanel from "../../components/MenuOrderPanel";
import ReviewComponent from "../../components/ReviewComponent";

async function fetchData(id: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE;

  if (!base) {
    console.error("NEXT_PUBLIC_API_BASE is not configured.");
    return { restaurant: null, dishes: [] };
  }

  try {
    const [restaurantRes, dishesRes] = await Promise.all([
      fetch(`${base}/restaurants/${id}`, { cache: "no-store" }),
      fetch(`${base}/dishes/restaurants/${id}/dishes`, { cache: "no-store" }),
    ]);

    if (!restaurantRes.ok) {
      throw new Error("Failed to fetch restaurant data");
    }
    if (!dishesRes.ok) {
      throw new Error("Failed to fetch dishes data");
    }

    const [restaurant, dishes] = await Promise.all([
      restaurantRes.json(),
      dishesRes.json(),
    ]);

    return { restaurant, dishes };
  } catch (err) {
    console.error("Error fetching restaurant data:", err);
    return { restaurant: null, dishes: [] };
  }
}

export default async function RestaurantPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { restaurant, dishes } = await fetchData(id);

  if (!restaurant)
    return (
      <div className="mx-auto flex h-[50vh] max-w-7xl items-center justify-center px-4">
        <p className="zaika-card rounded-2xl px-8 py-6 text-lg font-semibold text-[#765f55]">
          Restaurant not found.
        </p>
      </div>
    );

  const ratingValue = restaurant.rating ? Number(restaurant.rating).toFixed(1) : null;
  const reviewCount = restaurant.reviewCount ? restaurant.reviewCount : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="zaika-card mb-10 overflow-hidden rounded-[1.75rem] shadow-[0_28px_60px_rgba(71,37,20,0.08)]">
        <div className="relative h-[28rem] overflow-hidden bg-[#251611]">
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f4a51c]">
              Zaika kitchen
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              {restaurant.name}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
              {restaurant.description}
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-[#efd9bd] bg-[#fffdf8] p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#fff1d5] px-4 py-2 text-sm font-semibold text-[#d9472b]">
                {ratingValue ? `${ratingValue} / 5` : 'Not rated yet'}
              </span>
              {reviewCount && (
                <span className="rounded-full bg-[#f7ead6] px-4 py-2 text-sm font-semibold text-[#765f55]">
                  {reviewCount} reviews
                </span>
              )}
              {restaurant.openingHours && (
                <span className="rounded-full bg-[#ecf3f7] px-4 py-2 text-sm font-semibold text-[#155e75]">
                  <Clock className="inline h-4 w-4 text-[#155e75]" /> {restaurant.openingHours}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {restaurant.cuisine?.length > 0 && (
                <div className="rounded-3xl border border-[#efd9bd] bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d9472b]">Cuisine</p>
                  <p className="mt-3 text-sm leading-6 text-[#4a4037]">
                    {restaurant.cuisine.join(', ')}
                  </p>
                </div>
              )}
              {restaurant.address && (
                <div className="rounded-3xl border border-[#efd9bd] bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d9472b]">Location</p>
                  <p className="mt-3 text-sm leading-6 text-[#4a4037]">
                    {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} - {restaurant.address.zip}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#efd9bd] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-[#d9472b]">What to expect</p>
            <h2 className="mt-4 text-2xl font-black text-[#251611]">Fresh flavours, fast delivery</h2>
            <p className="mt-4 text-sm leading-6 text-[#765f55]">
              Enjoy handpicked dishes crafted for modern guests. Add items from the menu and use a coupon to save instantly.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-[#fff8ed] p-4 text-sm text-[#765f55]">
                <p className="font-semibold text-[#251611]">Comfort food</p>
                <p className="mt-2">Quick kitchen favourites delivered warm.</p>
              </div>
              <div className="rounded-3xl bg-[#ecfdf5] p-4 text-sm text-[#155e75]">
                <p className="font-semibold text-[#0f766e]">Trusted quality</p>
                <p className="mt-2">Premium recipes, prepared with care.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">
          Menu
        </p>
        <h2 className="mt-1 text-3xl font-black text-[#251611]">
          Choose your plate
        </h2>
      </div>

      <MenuOrderPanel restaurantId={id} dishes={dishes} />

      <section className="mt-14">
        <ReviewComponent restaurantId={id} />
      </section>
    </div>
  );
}
