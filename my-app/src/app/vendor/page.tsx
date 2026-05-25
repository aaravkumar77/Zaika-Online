"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { useAuthContext } from "../lib/auth";
import CloudinaryImageUpload from "../components/CloudinaryImageUpload";

interface RestaurantFormData {
  name: string;
  description: string;
  logoUrl: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  cuisine: string;
  openingHours: string;
}

export default function RegisterRestaurantPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: "",
    description: "",
    logoUrl: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    cuisine: "",
    openingHours: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle top-level input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle nested address object changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.logoUrl) {
      setError("Restaurant logo is required.");
      return;
    }

    if (user?.role !== "vendor" && user?.role !== "admin") {
      setError("You must be logged in as a vendor to register a restaurant.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("zaika_token");

      if (!token) {
        setError("You must be logged in first.");
        setLoading(false);
        return;
      }

      const cuisineArray = formData.cuisine
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);

      const submissionData = {
        ...formData,
        cuisine: cuisineArray,
      };

      await api.post("/restaurants", submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Restaurant registered successfully!");
      router.push(`/vendor/dashboard`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          (err.code === "ECONNABORTED"
            ? "The registration service is unavailable right now. Please try again shortly."
            : null) ||
          "Failed to register restaurant."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-4 py-10">
      <div className="zaika-card w-full max-w-3xl rounded-2xl p-8 sm:p-10">
        <p className="text-center text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">
          Vendor onboarding
        </p>

        <h1 className="mt-2 text-center text-4xl font-black text-[#251611]">
          Register Your Restaurant
        </h1>

        <p className="mb-8 mt-3 text-center text-[#765f55]">
          Fill out the details below to get your restaurant listed on{" "}
          <span className="font-semibold">Zaika Online</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC DETAILS */}
          <div className="space-y-5">
            <h2 className="border-b border-[#efd9bd] pb-2 text-2xl font-black text-[#251611]">
              Basic Details
            </h2>

            <CloudinaryImageUpload
              label="Restaurant Logo"
              placeholder="Upload restaurant logo"
              onImageUpload={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  logoUrl: url,
                }))
              }
              initialImage={formData.logoUrl}
              aspectRatio={1}
            />

            <div>
              <label className="mb-1 block text-sm font-bold text-[#765f55]">
                Restaurant Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="zaika-input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#765f55]">
                Description <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                className="zaika-input resize-none"
              />
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div className="space-y-5">
            <h2 className="border-b border-[#efd9bd] pb-2 text-2xl font-black text-[#251611]">
              Address
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {["street", "city", "state", "zip"].map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="mb-1 block text-sm font-bold capitalize text-[#765f55]"
                  >
                    {field}
                  </label>

                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={(formData.address as any)[field]}
                    onChange={handleAddressChange}
                    className="zaika-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* OTHER DETAILS */}
          <div className="space-y-5">
            <h2 className="border-b border-[#efd9bd] pb-2 text-2xl font-black text-[#251611]">
              Other Details
            </h2>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#765f55]">
                Cuisine Types
              </label>

              <p className="mb-2 text-xs text-[#765f55]">
                Separate multiple cuisines with commas (e.g., North Indian,
                Chinese, Italian)
              </p>

              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                className="zaika-input"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#765f55]">
                Opening Hours
              </label>

              <input
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                placeholder="e.g., 9:00 AM - 10:00 PM"
                className="zaika-input"
              />
            </div>
          </div>

          {/* FEEDBACK / SUBMIT */}
          <div className="pt-4">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="zaika-button w-full py-3"
            >
              {loading ? "Registering..." : "Register Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}