import { getDataBucketDPD } from "@/app/services/Query/riskDashboard.service";

export async function getDashboardDataBucketDPD() {
  const raw = await getDataBucketDPD();
  const safe = (v: number | null | undefined) => v ?? 0;

  const dataArray = Array.isArray(raw) ? raw : [raw];

  /** ===============================
   * AMBIL TANGGAL TERBARU
   * =============================== */
  const latestDate = dataArray.reduce((max, row) => {
    const tgl = new Date(row.Tanggal_Laporan);
    return tgl > max ? tgl : max;
  }, new Date(0));

  /** ===============================
   * FILTER DATA TERBARU
   * =============================== */
  const latestData = dataArray.filter(
    (row) => new Date(row.Tanggal_Laporan).getTime() === latestDate.getTime()
  );

  /** ===============================
   * STAGE PYRAMID
   * =============================== */
  const stageRef = [
    { name: "1-30 (Bucket 2)", min: 1, max: 30 },
    { name: "31-60 (Bucket 3)", min: 31, max: 60 },
    { name: "61-90 (Bucket 4)", min: 61, max: 90 },
    { name: "Bucket 5", min: 91, max: 999999999 },
  ];

  const stages = stageRef.map((ref) => {
    const matching = latestData.filter(
      (row) => safe(row.Bucket) >= ref.min && safe(row.Bucket) <= ref.max
    );

    const total = matching.reduce((sum, row) => sum + safe(row.Outstanding), 0);

    return {
      name: ref.name,
      value: total,
    };
  });

  /** ===============================
   * DETAIL TABLE (RAW DATA TERBARU)
   * =============================== */
  const rows = latestData.map((row: any) => ({
    bucket: safe(row.Bucket),
    stage: row.Stage ?? "-",
    outstanding: safe(row.Outstanding),
    tanggal: new Date(row.Tanggal_Laporan).toLocaleDateString("id-ID"),
  }));

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "Bucket DPD",
      periodLabel: latestDate.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
      }),
      dataCutoff: new Date().toISOString(),
    },

    bucketDpd: {
      title: "Bucket DPD",
      stages,
      rows, // ⬅️ penting untuk modal detail
    },
  };
}
