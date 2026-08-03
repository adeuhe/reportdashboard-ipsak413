import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

type Kpi = { key: string; label: string; value: string; delta: string; tone: "up" | "down" };

function toneClass(t: "up" | "down") {
  return t === "up" ? "text-green-700" : "text-red-600";
}

export default function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="px-6 pt-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.key} className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
            
            {/* Label KPI */}
            <div className="text-xs font-semibold text-slate-500">{k.label}</div>
            
            {/* Nilai KPI */}
            <div className={`mt-2 text-lg font-extrabold ${toneClass(k.tone)}`}>
              {k.value}
            </div>
            
            {/* Delta / perubahan */}
            <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${toneClass(k.tone)}`}>
              {k.tone === "up" ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              <span>{k.delta} dibanding tahun sebelumnya</span>
            </div>
            
            {/* Keterangan tambahan (opsional) */}
            <div className="mt-1 text-[10px] text-slate-400">
              {k.key.startsWith("pd") ? "Weighted Avg PD per kategori" : 
               k.key === "ecl" ? "Total ECL seluruh portofolio" :
               k.key === "npf" ? "NPF Ratio keseluruhan" : ""}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
