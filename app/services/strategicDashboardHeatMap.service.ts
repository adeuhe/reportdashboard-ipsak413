import { getDataSectorialRiskHeatMap } from "./Query/riskStrategicDashboard.service";

export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type HeatmapTile = {
  sector: string;
  eclRatio: number;   // decimal, misal 0.03
  eclAmount: string;  // formatted Rupiah
  accounts: number;
  risk: RiskLevel;
};

export type HeatmapTableRow = {
  sector: string;
  exposure: string;   // formatted Rupiah
  eclAmount: string;  // formatted Rupiah
  eclRatio: string;   // formatted %
  accounts: number;
  risk: RiskLevel;
};

// Formatter Rupiah singkat
function formatRupiahShort(val: number) {
  if (val >= 1e12) return (val / 1e12).toFixed(2) + "T";
  if (val >= 1e9) return (val / 1e9).toFixed(2) + "M";
  if (val >= 1e6) return (val / 1e6).toFixed(2) + "Jt";
  return val.toLocaleString("id-ID");
}

// Formatter persen
function formatPercent(val: number) {
  return (val * 100).toFixed(2) + "%";
}

// Layer kedua: proses data untuk UI
export async function getStrategicDashboardSectorialRisk() {
  const rawData = await getDataSectorialRiskHeatMap();
  console.log(rawData);


  if (!Array.isArray(rawData)) return { tiles: [], table: [] };

  const tiles: HeatmapTile[] = rawData.map((r: any) => ({
    sector: r.Segment,
    eclRatio: Number(r.ECL_Ratio ?? 0) * 100, // ✅ kalikan 100
    eclAmount: formatRupiahShort(r.ECL_Amount ?? 0),
    accounts: r.Accounts ?? 0,
    risk: r.Risk_Level,
  }));


  const table: HeatmapTableRow[] = rawData.map((r: any) => ({
    sector: r.Segment,
    exposure: formatRupiahShort(r.Outstanding ?? 0),
    eclAmount: formatRupiahShort(r.ECL_Amount ?? 0),
    eclRatio: formatPercent(Number(r.ECL_Ratio ?? 0)),
    accounts: r.Accounts ?? 0,
    risk: r.Risk_Level,
  }));
  console.log(rawData);
  
  return {
    title: "Sectoral Risk Heatmap",             // ✅ title
    subtitle: "Industry concentration and risk hotspots", // ✅ subtitle
    tiles,
    table,
  };
}
