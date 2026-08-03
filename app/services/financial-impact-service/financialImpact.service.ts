import { getDataECLTrend } from "@/app/services/Query/financial-impact-query/queryFinancialImpact.query";

export async function getFinancialImpactData() {
  const rawData = await getDataECLTrend();

  // Helper untuk memastikan angka aman
  const safe = (v: any) => (typeof v === 'number' ? v : 0);

  // 1. Mapped Trend Data (dummyTrend style)
  const trendData = (Array.isArray(rawData) ? rawData : []).map((row: any) => ({
    month: row.month,
    impact: safe(row.impact),
    target: safe(row.target),
  }));

  // 2. Get Insight Data (Ambil dari row pertama karena CROSS JOIN)
  const firstRow = rawData[0] || {};
  const insight = {
    isCritical: firstRow.isCritical === 1, // Convert 1/0 ke boolean
    title: firstRow.title || "Status Normal",
    message: firstRow.message || "Data dampak finansial berada dalam batas aman.",
  };

  // 3. Dummy Ratios & Distribution (Jika belum ada di DB)
  const dummyDistribution = [
    { name: "Operational Risk", value: 4500000 },
    { name: "Market Volatility", value: 3000000 },
    { name: "Credit Default", value: 2500000 },
    { name: "Others", value: 1000000 },
  ];

  const dummyRatios = {
    car: 18.5,
    npl: 4.2,
  };

  return {
    meta: {
      bankName: "BANK CONTOH",
      reportTitle: "Financial Impact Analysis",
      periodLabel: "Last 6 Months",
      dataCutoff: new Date().toISOString(),
    },
    // Objek ini yang akan dipassing ke <FinancialImpactClient data={...} />
    data: {
      trendData: trendData,
      distributionData: dummyDistribution,
      ratios: dummyRatios,
      insight: insight,
    }
  };
}