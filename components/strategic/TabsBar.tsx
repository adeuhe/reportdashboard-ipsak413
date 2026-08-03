"use client";

export default function TabsBar({
  tabs,
  activeIndex,
  onChange,
}: {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="px-6 pt-4">
      <div className="flex w-full rounded-2xl border bg-white p-2 shadow-sm">
        {tabs.map((t, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={t}
              className={
                `flex-1 text-center rounded-xl px-4 py-2 text-xs font-semibold transition-colors duration-200 ` +
                (active
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200")
              }
              onClick={() => onChange(i)}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
