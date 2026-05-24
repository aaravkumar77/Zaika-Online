"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fffdf8",
          color: "#251611",
          borderRadius: "0.75rem",
          border: "1px solid #efd9bd",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          fontSize: "14px",
          fontWeight: "500",
        },
        success: {
          duration: 3000,
          icon: "✅",
          style: {
            borderColor: "#22c55e",
          },
        },
        error: {
          duration: 4000,
          icon: "❌",
          style: {
            borderColor: "#d9472b",
          },
        },
        loading: {
          icon: "⏳",
        },
      }}
    />
  );
}
