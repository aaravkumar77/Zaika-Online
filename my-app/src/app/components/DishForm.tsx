"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import CloudinaryImageUpload from "./CloudinaryImageUpload";
import { LoadingButton, ListSkeleton } from "./Loaders/SkeletonLoader";

interface Dish {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  imageUrl?: string;
}

interface Props {
  restaurantId: string;
}

export default function DishForm({ restaurantId }: Props) {
  const [form, setForm] = useState<Dish>({
    name: "",
    description: "",
    price: 0,
    category: "",
    isVeg: true,
    imageUrl: "",
  });

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const fetchDishes = async () => {
    if (!restaurantId) return;
    try {
      setFetching(true);
      const res = await api.get(`/dishes/restaurants/${restaurantId}/dishes`);
      setDishes(res.data || []);
    } catch (err) {
      console.error("Error fetching dishes:", err);
      toast.error("Failed to load dishes");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [restaurantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setForm({ ...form, imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Restaurant ID missing");
      return;
    }

    if (!form.name || !form.price || !form.imageUrl) {
      toast.error("Please fill in name, price, and upload an image");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(editingDish ? "Updating dish..." : "Adding dish...");

    try {
      if (editingDish) {
        await api.put(`/dishes/${editingDish._id}`, { ...form, restaurantId });
        toast.dismiss(toastId);
        toast.success("Dish updated successfully! ✏️");
      } else {
        await api.post(`/dishes`, { ...form, restaurantId });
        toast.dismiss(toastId);
        toast.success("Dish added successfully! 🍽️");
      }

      await fetchDishes();

      setForm({
        name: "",
        description: "",
        price: 0,
        category: "",
        isVeg: true,
        imageUrl: "",
      });
      setEditingDish(null);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error || "Failed to save dish");
      console.error("Error saving dish:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      isVeg: dish.isVeg,
      imageUrl: dish.imageUrl || "",
      _id: dish._id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this dish?")) return;

    const toastId = toast.loading("Deleting dish...");
    try {
      await api.delete(`/dishes/${id}`);
      await fetchDishes();
      toast.dismiss(toastId);
      toast.success("Dish deleted successfully! 🗑️");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to delete dish");
      console.error("Error deleting dish:", err);
    }
  };

  return (
    <div className="zaika-card mt-6 rounded-2xl p-6 animate-in fade-in duration-300">
      <h2 className="mb-4 text-2xl font-black text-[#251611]">
        {editingDish ? "✏️ Edit Dish" : "➕ Add New Dish"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <CloudinaryImageUpload
          label="Dish Image"
          placeholder="Upload dish image"
          onImageUpload={handleImageUpload}
          initialImage={form.imageUrl}
          aspectRatio={16 / 9}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Dish Name"
            value={form.name}
            onChange={handleChange}
            className="zaika-input"
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={form.price}
            onChange={handleChange}
            className="zaika-input"
            required
            min="0"
            step="0.01"
          />

          <input
            type="text"
            name="category"
            placeholder="Category (e.g., Starter, Main)"
            value={form.category}
            onChange={handleChange}
            className="zaika-input"
          />

          <label className="flex items-center space-x-2 text-sm font-semibold text-[#765f55] p-3 rounded-lg border border-[#efd9bd] hover:bg-[#fffdf8]">
            <input
              type="checkbox"
              name="isVeg"
              checked={form.isVeg}
              onChange={handleChange}
            />
            <span>🌱 Vegetarian</span>
          </label>
        </div>

        <textarea
          name="description"
          placeholder="Dish description..."
          value={form.description}
          onChange={handleChange}
          className="zaika-input"
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="zaika-button w-full py-3 disabled:opacity-70 disabled:cursor-not-allowed transition"
        >
          <LoadingButton isLoading={loading}>
            {loading ? "Saving..." : editingDish ? "Update Dish" : "Add Dish"}
          </LoadingButton>
        </button>

        {editingDish && (
          <button
            type="button"
            onClick={() => {
              setEditingDish(null);
              setForm({
                name: "",
                description: "",
                price: 0,
                category: "",
                isVeg: true,
                imageUrl: "",
              });
            }}
            className="w-full rounded-lg border border-[#efd9bd] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-[#765f55] transition hover:bg-[#fff1d5]"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h3 className="mt-7 mb-3 text-lg font-black text-[#251611]">
        📋 Your Dishes ({dishes.length})
      </h3>

      {fetching ? (
        <ListSkeleton count={3} />
      ) : dishes.length === 0 ? (
        <div className="rounded-lg border border-[#efd9bd] bg-[#fffdf8] p-8 text-center">
          <p className="text-[#765f55]">No dishes added yet. Start by adding your first dish! 🍴</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {dishes.map((d) => (
            <li
              key={d._id}
              className="flex items-center justify-between rounded-xl border border-[#efd9bd] bg-[#fffdf8] p-4 hover:shadow-md hover:border-[#d9472b] transition-all group"
            >
              <div className="flex gap-4 items-start flex-1">
                {d.imageUrl && (
                  <img
                    src={d.imageUrl}
                    alt={d.name}
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0 group-hover:shadow-lg transition"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#251611]">{d.name}</h4>
                    {d.isVeg ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">Veg</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">Non-Veg</span>
                    )}
                  </div>
                  <p className="text-sm text-[#765f55] mt-1">{d.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm font-bold text-[#d9472b]">₹{d.price}</p>
                    <p className="text-xs text-[#765f55]">{d.category}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(d)}
                  className="rounded-full p-2 text-[#765f55] hover:bg-[#fff1d5] hover:text-[#d9472b] transition"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(d._id)}
                  className="rounded-full p-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
