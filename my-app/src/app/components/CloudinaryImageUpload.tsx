"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface CloudinaryImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  initialImage?: string;
  label?: string;
  placeholder?: string;
  aspectRatio?: number; // e.g., 16/9, 1/1
}

export default function CloudinaryImageUpload({
  onImageUpload,
  initialImage,
  label = "Upload Image",
  placeholder = "Click or drag image here",
  aspectRatio,
}: CloudinaryImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudinaryCloudName || !uploadPreset) {
    console.error("Cloudinary credentials not configured in .env.local");
    return (
      <div className="p-4 border border-[#d9472b] rounded-lg bg-[#fff1d5] text-[#d9472b]">
        ⚠️ Cloudinary not configured. Please add credentials to .env.local
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImage(files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Optional: Add transformation parameters
      const transformations = new URLSearchParams();
      transformations.append("fetch_format", "auto");
      transformations.append("quality", "auto");
      if (aspectRatio) {
        transformations.append("aspect_ratio", aspectRatio.toString());
        transformations.append("crop", "fill");
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      setPreview(imageUrl);
      onImageUpload(imageUrl);
      toast.dismiss(loadingToast);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-[#251611]">{label}</label>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-[#d9472b] text-white rounded-lg font-semibold hover:bg-[#c13621] transition"
            >
              <Upload className="h-4 w-4" />
              Change
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#d9472b] bg-[#fff1d5]"
              : "border-[#efd9bd] hover:border-[#d9472b] hover:bg-[#fffdf8]"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center gap-2">
            {isLoading ? (
              <>
                <div className="h-8 w-8 rounded-full border-3 border-[#efd9bd] border-t-[#d9472b] animate-spin"></div>
                <p className="text-sm text-[#765f55] font-semibold">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[#d9472b]" />
                <p className="text-sm font-semibold text-[#251611]">
                  {placeholder}
                </p>
                <p className="text-xs text-[#765f55]">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isLoading}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
