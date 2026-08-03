import type { RiskLevel } from "@/data/strategicDashboard";

type Row = {
  sector: string;
  subsector: string;
  exposure: string;
  eclAmount: string;
  eclRatio: string;
  accounts: number;
  risk: RiskLevel;
};

function riskPill(risk: RiskLevel) {
  if (risk === "Critical") return "bg-red-100 text-red-700";
  if (risk === "High") return "bg-orange-100 text-orange-700";
  if (risk === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function SectorTable({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs font-semibold text-slate-500">
          <tr>
            <th className="py-2">Sector</th>
            <th className="py-2">Exposure</th>
            <th className="py-2">ECL Amount</th>
            <th className="py-2">ECL Ratio</th>
            <th className="py-2">Accounts</th>
            <th className="py-2">Risk Level</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={`${r.sector}-${r.subsector}`}>
              <td className="py-2 font-semibold text-slate-800">{r.sector}</td>
              <td className="py-2 text-slate-900">{r.exposure}</td>
              <td className="py-2 text-slate-900">{r.eclAmount}</td>
              <td className="py-2 font-semibold text-slate-900">{r.eclRatio}</td>
              <td className="py-2 text-slate-900">{r.accounts}</td>
              <td className="py-2">
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${riskPill(r.risk)}`}>
                  {r.risk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
