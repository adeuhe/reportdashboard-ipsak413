type Props = {
  label: string;
  valueText: string;
  mom: number;
};

export default function KpiCard({ label, valueText, mom }: Props) {
  // normalisasi label biar tidak tergantung huruf besar/kecil
  const normalized = label.toLowerCase();

  // KPI yang membaik jika NILAINYA TURUN
  const goodWhenDown = ["total ecl", "npf ratio"];

  const isDown = mom < 0;
  const isUp = mom > 0;

  const improving = goodWhenDown.includes(normalized)
    ? isDown      // turun = baik
    : isUp;       // naik = baik (coverage)

  const deteriorating = goodWhenDown.includes(normalized)
    ? isUp        // naik = buruk
    : isDown;     // turun = buruk

  const momClass = improving
    ? "text-emerald-600"
    : deteriorating
    ? "text-red-600"
    : "text-slate-500";

  const arrow = isDown ? "↓" : isUp ? "↑" : "•";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex-1 min-w-0">
      {/* Label */}
      <div className="text-sm font-bold uppercase tracking-wide text-slate-900">
        {label}
      </div>

      {/* Value */}
      <div className="mt-2 text-2xl font-bold text-slate-900">
        {valueText}
      </div>

      {/* MoM */}
      <div className={`mt-2 flex items-center gap-1 text-sm font-semibold ${momClass}`}>
        <span>{arrow}</span>
        <span>{mom.toFixed(2)}%</span>
        <span className="font-normal text-slate-400">
          dibanding bulan lalu
        </span>
      </div>
    </div>
  );
}
