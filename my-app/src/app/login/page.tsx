import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";

export default function LoginPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  console.log("API Base URL:", apiBase); // Debugging line to check the API base URL
  const customerLoginUrl = `${apiBase}/auth/google?role=customer`;
  const vendorLoginUrl = `${apiBase}/auth/google?role=vendor`;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center px-4 py-10">
      <div className="w-full">
        <p className="text-center text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">
          Choose your mode
        </p>
        <h1 className="mt-2 text-center text-4xl font-black text-[#251611]">
          How do you want to use Zaika today?
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[#765f55]">
          Customer mode can place orders. Vendor mode can manage restaurant services.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href={customerLoginUrl}
            className="zaika-card rounded-2xl p-7 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1d5] text-[#d9472b]">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-black text-[#251611]">
              Login as Customer
            </h2>
            <p className="mt-2 text-[#765f55]">
              Browse restaurants, add dishes to cart, place orders, and view order history.
            </p>
          </Link>

          <Link
            href={vendorLoginUrl}
            className="zaika-card rounded-2xl p-7 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1d5] text-[#d9472b]">
              <Store className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-black text-[#251611]">
              Login as Vendor
            </h2>
            <p className="mt-2 text-[#765f55]">
              Register your restaurant, manage dishes, review incoming orders, and update status.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
