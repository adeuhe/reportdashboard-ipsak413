import type { RiskLevel } from "@/data/strategicDashboard";

type Tile = {
  sector: string;
  subsector: string;
  eclRatio: number;
  eclAmount: string;
  accounts: number;
  stage: string;
  risk: RiskLevel;
};

function riskPill(risk: RiskLevel) {
  if (risk === "Critical") return "bg-red-100 text-red-700";
  if (risk === "High") return "bg-orange-100 text-orange-700";
  if (risk === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function tileBg(risk: RiskLevel) {
  if (risk === "Critical") return "bg-red-200/60";
  if (risk === "High") return "bg-orange-200/60";
  if (risk === "Medium") return "bg-yellow-200/70";
  return "bg-green-200/60";
}

export default function SectorHeatmap({
  title,
  subtitle,
  tiles,
}: {
  title: string;
  subtitle: string;
  tiles: Tile[];
}) {
  return (
    <div className="px-6 pt-4 pb-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        {/* tiles */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={`${t.sector}-${t.subsector}`} className={`rounded-xl p-4 ${tileBg(t.risk)}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.sector}</div>
                  <div className="text-[11px] text-slate-600">{t.subsector}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${riskPill(t.risk)}`}>
                  {t.risk}
                </span>
              </div>

              <div className="mt-3 text-xl font-extrabold text-slate-900">{t.eclRatio.toFixed(1)}%</div>

              <div className="mt-2 space-y-1 text-[11px] text-slate-700">
                <div>ECL: <span className="font-semibold">{t.eclAmount}</span></div>
                <div>{t.accounts} accounts • <span className="font-semibold">{t.stage}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
