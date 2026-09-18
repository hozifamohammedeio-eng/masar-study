const navItems = [
  "اليوم",
  "خطتي",
  "المواد",
  "المؤقت",
  "الدرجات",
  "التحليلات",
  "الإعدادات",
];

export default function Sidebar() {
  return (
    <aside
      dir="rtl"
      className="hidden min-h-screen w-64 border-l border-[#E5E5EA] bg-white p-5 md:block"
    >
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-[#1D1D1F]">مسار</h1>

        <p className="mt-1 text-sm text-[#6E6E73]">
          مذاكرتك، في مسار واضح.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <button
            key={item}
            className={`w-full rounded-xl px-4 py-3 text-right text-sm transition ${
              index === 0
                ? "bg-[#F5F5F7] font-medium text-[#1D1D1F]"
                : "text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}