import { getDataSectorialHeatMap } from "@/app/services/Query/riskDashboard.service";

export async function getDashboardDataSectorialHeatMap() {
  const raw = await getDataSectorialHeatMap();

  console.log("RAW SECTORIAL HEATMAP:", raw); // debug

  const safe = (v: number | null | undefined) => v ?? 0;

  // helper format number
  function formatRupiah(value: number) {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
    } else if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Juta`;
    } else {
      return `Rp ${value.toLocaleString("id-ID")}`;
    }
  }

  // pastikan array
  const itemsRaw = Array.isArray(raw) ? raw : [raw];

  // ambil max value untuk tone
  const maxValue = Math.max(...itemsRaw.map((r) => safe(r.ECL_Final)));

  const items = itemsRaw.map((row: any) => {
    const value = safe(row.ECL_Final);

    // tone berdasarkan persentase terhadap max
    let tone: "red" | "blue" | "navy" = "navy";
    const pct = maxValue ? value / maxValue : 0;

    if (pct >= 0.9) tone = "red";       // dekat nilai tertinggi → merah
    else if (pct >= 0.5) tone = "blue"; // menengah → biru
    else tone = "navy";                 // kecil → navy

    return {
      name: row?.Segment ?? "Unknown",
      value,
      valueText: formatRupiah(value),
      tone,
    };
  });

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "Sectorial HeatMap",
      periodLabel: "Latest Month",
      dataCutoff: new Date().toISOString(),
    },

    sectorRisk: items, // siap dikirim ke SectorRiskHeatmap component
  };
}
