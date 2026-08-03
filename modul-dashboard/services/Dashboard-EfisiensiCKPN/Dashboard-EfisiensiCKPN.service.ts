import { 
  getLatestTanggalLaporan, 
  getNamaBank, // <-- Import fungsi query nama bank
  getSegmentOptions, 
  getEfisiensiCKPNData, 
  getCureRatePD, 
  getReportSimulasiData, 
  getCureRatePerformanceData,
  ReportSimulasiRow,
  CureRatePerformanceRow 
} from "../Query/Dashboard-EfisiensiCKPN/DashboardEfisiensiCKPN.query";

export interface DashboardEfisiensiResponse {
  namaBank?: string; // <-- Tambahkan field ini
  tanggalLaporan: string;
  selectedSegment: string;
  segmentOptions: any[];
  data: {
    lgdMidHub: number;
    ckpnSavings: number;
    efisiensi: number;
    bakiDebet: number;
    grafikKuning: number;
    grafikMerah: number;
    grafikHijau: number;
    cureRatePD: number;
  } | null;
  reportSimulasiData?: ReportSimulasiRow[];
  cureRatePerformanceData?: CureRatePerformanceRow[];
}

export async function fetchDashboardEfisiensiService(
  tanggalLaporan?: string,
  segment: string = "ALL"
): Promise<DashboardEfisiensiResponse> {
  try {
    const targetDate = tanggalLaporan || (await getLatestTanggalLaporan());

    if (!targetDate) {
      return {
        namaBank: "",
        tanggalLaporan: "",
        selectedSegment: segment,
        segmentOptions: [],
        data: null,
        reportSimulasiData: [],
        cureRatePerformanceData: [],
      };
    }

    // Call query data secara paralel dengan passing targetDate dan segment
    const [
      namaBank, // <-- Ambil hasil query nama bank
      segmentOptions, 
      rows, 
      cureRatePD, 
      reportSimulasiData, 
      cureRatePerformanceData
    ] = await Promise.all([
      getNamaBank(), // <-- Jalankan query Ref_NamaBank
      getSegmentOptions(),
      getEfisiensiCKPNData(targetDate, segment),
      getCureRatePD(segment),
      getReportSimulasiData(targetDate, segment),
      getCureRatePerformanceData(targetDate, segment),
    ]);

    if (!rows || rows.length === 0) {
      return {
        namaBank,
        tanggalLaporan: targetDate,
        selectedSegment: segment,
        segmentOptions,
        data: null,
        reportSimulasiData: reportSimulasiData || [],
        cureRatePerformanceData: cureRatePerformanceData || [],
      };
    }

    const row = rows[0];
    const totalEclFinal = row.ECL_Final || 0;
    const totalGrafikHijau = row.grafik_hijau || 0;
    const efisiensiPercentage = totalEclFinal > 0 ? (totalGrafikHijau / totalEclFinal) * 100 : 0;
    const finalCureRate = row.Cure_Rate_avg > 0 ? row.Cure_Rate_avg : cureRatePD;

    return {
      namaBank, // <-- Masukkan ke return response
      tanggalLaporan: targetDate,
      selectedSegment: segment,
      segmentOptions,
      data: {
        lgdMidHub: (row.LGD_avg ?? 0) * 100,
        ckpnSavings: row.ECL_Final ?? 0,
        efisiensi: efisiensiPercentage,
        bakiDebet: row.Baki_Debet ?? 0,
        grafikKuning: row.grafik_kuning ?? 0,
        grafikMerah: row.grafik_merah ?? 0,
        grafikHijau: row.grafik_hijau ?? 0,
        cureRatePD: finalCureRate,
      },
      reportSimulasiData: reportSimulasiData || [],
      cureRatePerformanceData: cureRatePerformanceData || [],
    };
  } catch (error) {
    console.error("Error in fetchDashboardEfisiensiService:", error);
    return {
      namaBank: "",
      tanggalLaporan: "",
      selectedSegment: segment,
      segmentOptions: [],
      data: null,
      reportSimulasiData: [],
      cureRatePerformanceData: [],
    };
  }
}