// Pyramid.tsx
type Level = { name: string; value: number };

// hitung width proporsional sesuai urutan
function widthFor(i: number, n: number) {
  const min = 40; // level atas
  const max = 100; // level bawah
  const t = n <= 1 ? 1 : i / (n - 1);
  return Math.round(min + (max - min) * t);
}

// helper format rupiah ringkas
function formatRupiahShort(value: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `Rp ${sign}${(abs / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })} M`;
  }

  if (abs >= 1_000_000) {
    return `Rp ${sign}${(abs / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })} Jt`;
  }

  return `Rp ${sign}${abs.toLocaleString("id-ID")}`;
}

export default function Pyramid({
  title,
  levels,
  footerLeft,
  footerRight,
}: {
  title?: string;
  levels: Level[];
  footerLeft?: string;
  footerRight?: string;
}) {
  return (
    <>
      {title && <div className="mb-3 text-sm font-semibold text-slate-700">{title}</div>}

      <div className="flex flex-col items-center gap-2 py-2 w-full max-w-full">
        {levels.map((lv, idx) => {
          const w = widthFor(idx, levels.length);
          return (
            <div key={lv.name} className="w-full">
              <div className="mx-auto text-center text-[11px] font-semibold text-slate-600">
                {lv.name}
              </div>
              <div
                className="mx-auto h-8 rounded-md bg-slate-900/10 relative"
                style={{ width: `${w}%`, maxWidth: "100%" }}
                title={`${lv.value}`}
              >
                <div className="flex h-8 items-center justify-center text-xs font-bold text-slate-800">
                  {formatRupiahShort(lv.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(footerLeft || footerRight) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <div>{footerLeft}</div>
          <div>{footerRight}</div>
        </div>
      )}
    </>
  );
}
