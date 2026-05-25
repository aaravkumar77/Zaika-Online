export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#efd9bd] bg-[#fffdf8]/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[#765f55] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-[#251611]">Zaika Online</p>
        <p>© {new Date().getFullYear()} Fresh food, local kitchens.</p>
      </div>
    </footer>
  );
}
