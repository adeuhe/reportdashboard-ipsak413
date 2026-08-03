export default function StrategicHeader({
  title,
  subtitle, // tambahkan
  actions,
}: {
  title: string;
  subtitle?: string; // optional
  actions: string[];
}) {
  return (
    <div className="px-6 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <div className="text-xl font-extrabold text-slate-900">{title}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
          )}
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
          {actions.slice(0, 2).map((a) => (
            <button
              key={a}
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
