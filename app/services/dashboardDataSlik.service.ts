import { getDataSlik, getDataCurrenDate } from "./Query/riskDashboard.service";

export async function getDashboardDataSlik() {
  const [raw, currentDate] = await Promise.all([
    getDataSlik(),
    getDataCurrenDate(),
  ]);

  const safe = (v: number | null | undefined) => v ?? 0;

  const itemsRaw = Array.isArray(raw) ? raw : [raw];

  const rows = itemsRaw.map((row: any) => ({
    category: row?.kategori ?? "-",
    contracts: safe(row?.jumlah_kontrak),
    eclCurrent: safe(row?.total_ecl_current),
    eclPrev: safe(row?.total_ecl_prev),
    change: safe(row?.perubahan_ecl),
    changeValue: safe(row?.perubahan_ecl),
  }));


  /** =============================
   * PERIODE DARI DB
   * ============================= */
  const periode = '2024-12-31'
  // currentDate?.CurrentDate ||
  // currentDate?.curr_date ||
  // new Date().toISOString().slice(0, 10);

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "CKPN Movement Analysis",
      periodLabel: "Current vs Previous Month",
      dataCutoff: periode,
    },

    /** ⬅️ INI YANG DIPAKAI FE */
    periode,

    rows,
  };
}
