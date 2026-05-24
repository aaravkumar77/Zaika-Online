"use client";

import { useEffect, useState } from "react";
import { GridSkeleton, ListSkeleton, RestaurantCardSkeleton, SpinnerLoader } from "./SkeletonLoader";

interface PageLoaderProps {
  isLoading: boolean;
  type?: "grid" | "list" | "spinner" | "page";
  count?: number;
  children?: React.ReactNode;
}

export function AnimatedPageLoader({
  isLoading,
  type = "grid",
  count = 4,
  children,
}: PageLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!show) return <>{children}</>;

  return (
    <div className={`animate-in fade-in duration-300 ${isLoading ? "opacity-100" : "opacity-0"}`}>
      {type === "grid" && <GridSkeleton count={count} />}
      {type === "list" && <ListSkeleton count={count} />}
      {type === "spinner" && <SpinnerLoader />}
      {type === "page" && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="relative h-16 w-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#efd9bd] border-t-[#d9472b] animate-spin"></div>
            </div>
            <p className="text-[#765f55] font-semibold">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConditionalLoader({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <SpinnerLoader />;
  }
  return <>{children}</>;
}
