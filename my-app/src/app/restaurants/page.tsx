"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import RestaurantCard from "../components/RestaurantCard";
import { Filter, LocateFixed, Search } from "lucide-react";
import { GridSkeleton } from "../components/Loaders/SkeletonLoader";
import toast from "react-hot-toast";

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
}

interface Restaurant {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  address?: Address;
  logoUrl?: string;
  cuisine: string[];
  openingHours?: string;
  isVeg: boolean;
  rating: number;
  distanceKm?: number;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [nearbyCity, setNearbyCity] = useState("");
  const [nearbyMessage, setNearbyMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get("/restaurants");
        setRestaurants(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        setError("Could not load restaurants. Please try again later.");
        toast.error("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const fetchNearbyByCity = async () => {
    const city = nearbyCity.trim();
    if (!city) {
      toast.error("Enter a city to find nearby restaurants");
      return;
    }

    setLoading(true);
    setError(null);
    setNearbyMessage(null);

    try {
      const res = await api.get("/restaurants/nearby/search", {
        params: { city },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setRestaurants(data);
      setNearbyMessage(`🎯 Showing restaurants near ${city}.`);
      toast.success(`Found ${data.length} restaurants in ${city}! 🍽️`);
    } catch (err) {
      console.error("Failed to fetch nearby restaurants:", err);
      setError("Could not load nearby restaurants. Please try again later.");
      toast.error("Failed to load nearby restaurants");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyByLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not available in this browser");
      return;
    }

    setLoading(true);
    setError(null);
    setNearbyMessage(null);
    const toastId = toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await api.get("/restaurants/nearby/search", {
            params: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radiusKm: 12,
            },
          });
          const data = Array.isArray(res.data) ? res.data : [];
          setRestaurants(data);
          setSortBy("distance");
          setNearbyMessage("📍 Showing restaurants within 12 km of your location.");
          toast.dismiss(toastId);
          toast.success(`Found ${data.length} nearby restaurants! 🗺️`);
        } catch (err) {
          console.error("Failed to fetch nearby restaurants:", err);
          setError("Could not load restaurants near your location.");
          toast.dismiss(toastId);
          toast.error("Failed to find nearby restaurants");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        toast.dismiss(toastId);
        toast.error("Location permission denied. Try city search instead.");
        setNearbyMessage("Location permission was not granted. Try city search.");
      }
    );
  };

  const filteredRestaurants = restaurants
    .filter((r) => {
      const queryLower = query.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(queryLower);
      const cuisineMatch = r.cuisine.some((c) =>
        c.toLowerCase().includes(queryLower)
      );

      return (nameMatch || cuisineMatch) && (!vegOnly || r.isVeg);
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "distance") {
        return (
          (a.distanceKm ?? Number.MAX_SAFE_INTEGER) -
          (b.distanceKm ?? Number.MAX_SAFE_INTEGER)
        );
      }

      return (b.rating || 0) - (a.rating || 0);
    });

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="zaika-card rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-[#d9472b]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 zaika-button px-6 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d9472b]">
            Restaurant directory
          </p>
          <h1 className="mt-2 text-4xl font-black text-[#251611]">
            All Restaurants
          </h1>
          <p className="mt-2 max-w-2xl text-[#765f55]">
            Search by kitchen name or cuisine and jump straight into the menu.
          </p>
        </div>
        <div className="rounded-full border border-[#efd9bd] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#765f55]">
          {filteredRestaurants.length} places
        </div>
      </div>

      {nearbyMessage && (
        <div className="mb-6 rounded-lg border-l-4 border-[#d9472b] bg-[#fff1d5] p-4 text-sm font-semibold text-[#251611]">
          {nearbyMessage}
        </div>
      )}

      <div className="mb-8 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9472b]" />
          <input
            placeholder="Search by name or cuisine"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="zaika-input pl-10"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-[#efd9bd] bg-[#fffdf8] px-4 py-3 text-sm font-bold text-[#765f55] cursor-pointer hover:bg-[#fff1d5] transition">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#d9472b]" />
            🌱 Veg only
          </span>
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="h-4 w-4 accent-green-600"
          />
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="zaika-input text-[#765f55]"
        >
          <option value="rating">⭐ Rating</option>
          <option value="name">📝 Name</option>
          <option value="distance">📍 Distance</option>
        </select>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={fetchNearbyByCity}
          className="flex-1 rounded-lg border border-[#efd9bd] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-[#765f55] transition hover:bg-[#fff1d5] flex items-center justify-center gap-2"
        >
          🏙️ Find by City
        </button>
        <button
          onClick={fetchNearbyByLocation}
          className="flex-1 rounded-lg bg-[#d9472b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c13621] flex items-center justify-center gap-2"
        >
          <LocateFixed className="h-4 w-4" />
          📍 Use My Location
        </button>
      </div>

      <input
        type="text"
        placeholder="Enter city name..."
        value={nearbyCity}
        onChange={(e) => setNearbyCity(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchNearbyByCity()}
        className="zaika-input mb-6 w-full"
      />

      {loading ? (
        <GridSkeleton count={6} />
      ) : filteredRestaurants.length === 0 ? (
        <div className="zaika-card rounded-2xl p-12 text-center">
          <p className="text-xl font-bold text-[#251611]">No restaurants found</p>
          <p className="mt-2 text-[#765f55]">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}

function MapCityIcon() {
  return null;
}
