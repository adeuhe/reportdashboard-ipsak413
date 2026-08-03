"use server";

import { getPITPDRegressionData, getSegmentOptions, MacroScenarioCard, PITPDDetailRow, SegmentOption } from "../Query/Dashboard-PenentuanPIT-PD-Forward-Looking/PenentuanPITPDForwardLooking.query";



export interface PITPDDashboardResponse {
  success: boolean;
  data?: {
    segmentOptions: SegmentOption[];
    selectedRegresiId: number;
    scenarios: MacroScenarioCard[];
    regressionData: PITPDDetailRow[];
    cycleEnd: string; // <-- Tambahkan properti ini
    period: string;
    lastUpdated: string;
  };
  message?: string;
}

export async function fetchPenentuanPITPDDashboardData(
  regresiId?: number
): Promise<PITPDDashboardResponse> {
  try {
    const segmentOptions = await getSegmentOptions();
    const activeRegresiId = regresiId ?? segmentOptions[0]?.id ?? 0;

    // Pemanggilan query SQL yang mengembalikan { cycleEnd, data }
    const { cycleEnd, data: regressionData } = await getPITPDRegressionData(activeRegresiId);

    const scenarios: MacroScenarioCard[] = [
      { Scenario: "Base", Weight: 0.6, GDP: 5.18, BI_Rate: 6.00 },
      { Scenario: "Optimistic", Weight: 0.2, GDP: 5.50, BI_Rate: 5.50 },
      { Scenario: "Pessimistic", Weight: 0.2, GDP: 4.20, BI_Rate: 6.75 },
    ];

    return {
      success: true,
      data: {
        segmentOptions,
        selectedRegresiId: activeRegresiId,
        scenarios,
        regressionData,
        cycleEnd, // <-- Masukkan cycleEnd di sini
        period: "JULY 2026",
        lastUpdated: "August 1, 2026",
      },
    };
  } catch (error: any) {
    console.error("Error in fetchPenentuanPITPDDashboardData:", error);
    return {
      success: false,
      message: error.message || "Gagal mengambil data dari database",
    };
  }
}