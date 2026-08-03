import { getDataStrategicKPICard, getDataStrategicPD } from "./Query/riskStrategicDashboard.service";

export type Kpi = { key: string; label: string; value: string; delta: string; tone: "up" | "down" };
export async function getStrategicDashboardDataKPI() {
  const kpi = await getDataStrategicKPICard();
  const pd = await getDataStrategicPD(); // <--- panggil Weighted Avg PD

  const safe = (v: number | null | undefined) => v ?? 0;
  const raw = Array.isArray(kpi) ? kpi[0] : kpi;

  // format helper
  function formatCurrency(val: number) {
    return "Rp " + Number(val || 0).toLocaleString("id-ID");
  }
  function formatPercent(val: number) {
    return Number(val || 0).toFixed(2) + "%";
  }

  function calcMoMTone(curr: number, prev: number, isGoodIfLower: boolean) {
    if (!prev) return { delta: "0%", tone: "up" as "up" | "down" };
    const deltaVal = ((curr - prev) / prev) * 100;
    const deltaText = `${deltaVal.toFixed(2)}%`;
    const tone: "up" | "down" = isGoodIfLower
      ? deltaVal <= 0 ? "up" : "down"
      : deltaVal >= 0 ? "up" : "down";
    return { delta: deltaText, tone };
  }

  // KPI default
  const kpis: Kpi[] = [
    {
      key: "ecl",
      label: "Total ECL",
      value: formatCurrency(safe(raw?.Current_ECL)),
      ...calcMoMTone(safe(raw?.Current_ECL), safe(raw?.Prev_ECL), true),
    },
    {
      key: "npf",
      label: "NPF Ratio",
      value: formatPercent(safe(raw?.Current_NPF)),
      ...calcMoMTone(safe(raw?.Current_NPF), safe(raw?.Prev_NPF), true),
    },
  ];

  // Tambahkan 3 kategori PD
  if (Array.isArray(pd)) {
    pd.forEach((row) => {
      kpis.push({
        key: `pd_${row.category.toLowerCase()}`,
        label: `PD ${row.category}`,
        value: formatPercent(row.current_year),
        ...calcMoMTone(row.current_year, row.prev_year, true), // lebih kecil lebih baik
      });
    });
  }

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "Risk Monitoring Dashboard",
      periodLabel: "Current Period",
      dataCutoff: new Date().toISOString(),
    },
    kpis,
    eclNpfTrend: [],
    stagingMigration: { title: "", stages: [], notes: "" },
    sectorRisk: [],
    status: {},
    bucketDpd: { title: "", stages: [] },
    slik: { value: 0, note: "", actions: [] },
    table: { titleLeft: "", titleCenter: "", rows: [], footer: "" },
  };
}
