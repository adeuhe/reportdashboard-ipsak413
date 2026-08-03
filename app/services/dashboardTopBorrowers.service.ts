import { getDataTopBorrowers } from "./Query/riskDashboard.service";


export async function getDashboardDataTopBorrowers() {
  const raw = await getDataTopBorrowers();

  console.log("RAW TOP BORROWERS:", raw); // debug

  const safe = (v: number | null | undefined) => v ?? 0;

  function formatRupiah(value: number) {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
    } else if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Juta`;
    } else {
      return `Rp ${value.toLocaleString("id-ID")}`;
    }
  }

  const itemsRaw = Array.isArray(raw) ? raw : [raw];

  const rows = itemsRaw.map((row: any) => ({
    name: row?.Debitur ?? "Unknown",
    sector: row?.Segment ?? "Unknown",
    headroom: "-",                    // kosong karena tidak ada data
    dpd: safe(row?.DPD),
    unwind: safe(row?.Outstanding),
    ecl: formatRupiah(safe(row?.ECL_Amount)),
    rodo: 0,                          // placeholder
    stage: safe(row?.Stage),
    lastReview: 0,                     // placeholder
    bucket: row?.Bucket ?? "-", 
  }));

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "Top 10 Borrowers",
      periodLabel: "Latest Month",
      dataCutoff: new Date().toISOString(),
    },
    rows,
  };
}
