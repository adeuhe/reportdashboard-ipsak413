import { getDataECLVSNPFGrowthComparison } from "./Query/riskStrategicDashboard.service";

// Tipe data untuk chart
export type TrendPoint = {
  period: string;    // "yyyy-MM"
  eclAmount: number; // ECL dalam Rp (M)
  npfRatio: number; // NPF dalam %
  eclGrowth: number; // pertumbuhan ECL %
  npfGrowth: number; // pertumbuhan NPF %
};

// Tipe kartu KPI
export type Card = { label: string; value: string; note: string; tone: "blue" | "red" };

export async function getStrategicDashboardECLVSNPFTrend() {
  const rawData = await getDataECLVSNPFGrowthComparison();

  if (!Array.isArray(rawData)) return { series: [], cards: [] };

  // Pastikan data diurutkan ascending
  const data = [...rawData].sort(
    (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()
  );

  const series: TrendPoint[] = data.map((d, i) => {
    const prev = i > 0 ? data[i - 1] : null;

    const eclGrowth = prev ? ((d.eclAmount - prev.eclAmount) / prev.eclAmount) * 100 : 0;
    const npfGrowth = prev ? ((d.npfAmount - prev.npfAmount) / prev.npfAmount) * 100 : 0;

    return {
      period: d.period,
      eclAmount: d.eclAmount,
      npfRatio: d.npfAmount,
      eclGrowth: Number(eclGrowth.toFixed(2)),
      npfGrowth: Number(npfGrowth.toFixed(2)),
    };
  });

  // Ambil growth bulan terakhir untuk card
  const last = series[series.length - 1];
  const eclTone: "blue" | "red" = last.eclGrowth >= 0 ? "blue" : "red";
  const npfTone: "blue" | "red" = last.npfGrowth >= 0 ? "red" : "blue"; // turun NPF bagus → biru

  const cards: Card[] = [
    {
      label: "ECL Growth Trend",
      value: `${last.eclGrowth.toFixed(2)}%`,
      note: last.eclGrowth >= 0 ? "Increasing" : "Decreasing",
      tone: eclTone,
    },
    {
      label: "NPF Growth Trend",
      value: `${last.npfGrowth.toFixed(2)}%`,
      note: last.npfGrowth >= 0 ? "Increasing" : "Decreasing",
      tone: npfTone,
    },
  ];

  return { series, cards };
}
