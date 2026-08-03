import { getDataECLNPFTrend } from "@/app/services/Query/riskDashboard.service";

export async function getDashboardDataECLNPFTrend() {
  const trend = await getDataECLNPFTrend();

  const safe = (v: number | null | undefined) => v ?? 0;

  // pastikan trend selalu array
  const mapped = (Array.isArray(trend) ? trend : [trend]).map((row: any) => {
    const eclValue = safe(row?.Total_ECL);
    const npfValue = safe(row?.NPF_Amount);

    return {
      month: row?.month ?? "",
      ecl: eclValue, // tetap number
      npf: npfValue, // tetap number
    };
  });

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "Risk Monitoring Dashboard",
      periodLabel: "Last 6 Months",
      dataCutoff: new Date().toISOString(),
    },

    eclNpfTrend: mapped, // siap dikirim ke chart

    stagingMigration: { title: "", stages: [], notes: "" },
    sectorRisk: [],
    status: {},
    bucketDpd: { title: "", stages: [] },
    slik: { value: 0, note: "", actions: [] },
    table: { titleLeft: "", titleCenter: "", rows: [], footer: "" },
  };
}
