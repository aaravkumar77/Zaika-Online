"use client";

export function RestaurantCardSkeleton() {
  return (
    <div className="zaika-card overflow-hidden rounded-2xl animate-pulse">
      <div className="h-48 w-full bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd]" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-3/4" />
        <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-full" />
        <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg flex-1" />
          <div className="h-8 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

export function DishCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#efd9bd] bg-[#fffdf8] p-3 animate-pulse">
      <div className="flex gap-3 items-center flex-1">
        <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-2/3" />
          <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-10 w-16 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg flex-shrink-0" />
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="zaika-card rounded-xl p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="h-24 w-24 rounded-lg bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-2/3" />
          <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-full" />
          <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function OrderItemSkeleton() {
  return (
    <div className="zaika-card rounded-2xl p-5 md:p-6 animate-pulse space-y-4">
      <div className="h-6 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-2/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-full" />
        <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-2/3" />
      </div>
    </div>
  );
}

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-1/4" />
      <div className="h-10 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] rounded-lg w-full" />
    </div>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DishCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Animated spinner loader
export function SpinnerLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-[#efd9bd] border-t-[#d9472b] animate-spin"></div>
      </div>
    </div>
  );
}

// Page loading state
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative h-16 w-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#efd9bd] border-t-[#d9472b] animate-spin"></div>
        </div>
        <p className="text-[#765f55] font-semibold">Loading...</p>
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2">
      {isLoading && (
        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
      )}
      {children}
    </div>
  );
}
