// services/financial-impact-service/profitDanLostImpact.service.ts
import { getDataProfitDanLostImpact, getDataPersentaseLaba } from "../Query/financial-impact-query/queryFinancialImpact.query";

export async function getProfitLossImpactData() {
  const [row, labaRow] = await Promise.all([
    getDataProfitDanLostImpact(),
    getDataPersentaseLaba()
  ]);

  // Jika data utama tidak ada, kembalikan null
  if (!row) return null;

  // 1. Parsing Data JSON dari SQL
  // Pastikan fallback ke array kosong jika data null/kosong
  const rawTrend = JSON.parse(row.trendData || "[]");
  const rawDistribution = JSON.parse(row.distributionData || "[]");

  // 2. Definisikan urutan bulan untuk sortir (Chronological Order)
  const monthOrder: { [key: string]: number } = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
  };

  // 3. Mapping & Sorting Trend Data
  // Input SQL acak (Aug, Dec, Jul...), kita urutkan berdasarkan monthOrder
  const trendData = rawTrend
    .map((t: any) => ({
      month: t.month, // Contoh: "Aug"
      impact: Number(t.impact), // Pastikan jadi number: 561957331236
      target: 0 // Default target jika tidak ada di DB
    }))
    .sort((a: any, b: any) => monthOrder[a.month] - monthOrder[b.month]);

  // 4. Mapping & Sorting Distribution Data
  // Urutkan dari value terbesar ke terkecil
  const distributionData = rawDistribution
    .map((d: any) => ({
      name: d.name, // Contoh: "4 - Konsumer"
      value: Number(d.value) // Pastikan jadi number
    }))
    .sort((a: any, b: any) => b.value - a.value);

  // 5. Logika Insight: Mencari Lonjakan (MoM) Tertinggi
  let peakGrowth = { month: "-", impact: 0, growth: -Infinity };

  // Kita mulai loop dari index 1 karena butuh data bulan sebelumnya untuk bandingkan
  if (trendData.length > 1) {
    for (let i = 1; i < trendData.length; i++) {
      const current = trendData[i];
      const previous = trendData[i - 1];

      // Rumus Growth: ((Sekarang - Kemarin) / Kemarin) * 100
      const growth = previous.impact !== 0
        ? ((current.impact - previous.impact) / previous.impact) * 100
        : 0;

      if (growth > peakGrowth.growth) {
        peakGrowth = {
          month: current.month,
          impact: current.impact,
          growth: growth
        };
      }
    }
  } else if (trendData.length === 1) {
    // Jika data cuma 1 bulan, jadikan itu peak
    peakGrowth = {
      month: trendData[0].month,
      impact: trendData[0].impact,
      growth: 0
    };
  }

  // Fallback jika tidak ada calculation yang valid, ambil data terakhir
  const finalPeak = peakGrowth.month !== "-" ? peakGrowth : trendData[trendData.length - 1];

  // Helper Formatter untuk Insight Message
  const formatMiliar = (val: number) => {
    return (val / 1_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " miliar";
  };

  const monthNames: { [key: string]: string } = {
    Jan: "Januari", Feb: "Februari", Mar: "Maret", Apr: "April",
    May: "Mei", Jun: "Juni", Jul: "Juli", Aug: "Agustus",
    Sep: "September", Oct: "Oktober", Nov: "November", Dec: "Desember"
  };

  const fullMonthName = monthNames[finalPeak?.month] || finalPeak?.month || "-";

  // 6. Ambil Persentase Laba
  const netProfitMargin = labaRow.Persentase_ECL_terhadap_Laba;

  // 7. Return Object sesuai struktur props komponen FE
  return {
    reportDate: row.Report_Date,        // Tuesday, December 31, 2024
    eclCharge: Number(row.ECL_Charge_Month), // 741063288713
    netProfitMargin: netProfitMargin,
    data: {
      trendData: trendData,             // Array terurut Jun -> Dec
      distributionData: distributionData, // Array terurut Value Besar -> Kecil
      ratios: { car: 18.5, npl: 4.2 },  // Hardcoded atau ambil dari query lain jika ada
      insight: {
        isCritical: (finalPeak?.growth || 0) > 10,
        title: "Wawasan & Peringatan CFO",
        message: `Puncak biaya ECL terjadi pada ${fullMonthName} sebesar Rp ${formatMiliar(finalPeak?.impact || 0)}, yang menekan laba periode tersebut.`
      },
      netProfitMargin
    }
  };
}