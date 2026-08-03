type Item = { name: string; valueText?: string; value?: number; tone: "red" | "blue" | "navy" };

// Super soft tone untuk banking dashboard
function toneClass(t: Item["tone"]) {
  if (t === "red") return "bg-red-200/40";    // super soft merah
  if (t === "navy") return "bg-slate-300/30"; // super soft navy
  return "bg-sky-300/30";                     // super soft biru
}

export default function SectorRiskHeatmap({ items }: { items: Item[] }) {
  const maxValue = Math.max(...items.map((i) => i.value || 0));

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm flex-1 min-w-0 flex flex-col">
      {/* Header */}
      <div className="mb-3 text-sm font-semibold text-slate-700">
        Sectoral Risk Heatmap
      </div>

      {/* Vertikal list, full width, compact */}
      <div className="flex flex-col flex-1 gap-1 w-full">
        {items.map((item, idx) => {
          const barWidth = maxValue ? ((item.value || 0) / maxValue) * 100 : 0;

          return (
            <div
              key={idx}
              className={`rounded-md ${toneClass(item.tone)} flex flex-col justify-center px-2 py-1`}
            >
              <div className="flex justify-between items-center text-[10px] font-semibold text-black">
                <span>{item.name}</span>
                {item.valueText && <span className="opacity-90">{item.valueText}</span>}
              </div>

              {/* Mini bar horizontal super soft */}
              <div className="mt-1 h-0.5 rounded bg-black/10 w-full relative">
                <div
                  className="h-0.5 rounded"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor:
                      item.tone === "red"
                        ? "#fca5a5" // soft merah
                        : item.tone === "navy"
                        ? "#cbd5e1" // soft navy
                        : "#7dd3fc", // soft biru
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
