import PenentuanPITPDForwardLooking from "@/modul-dashboard/component/Dashboard-PenentuanPIT-PD-Forward-Looking/PenentuanPITPDForwardLooking";
import { fetchPenentuanPITPDDashboardData } from "@/modul-dashboard/services/Dashboard-PenentuanPIT-PD-Forward-Looking/PenentuanPITPDForwardLooking.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Ambil data awal melalui Service Layer
  const result = await fetchPenentuanPITPDDashboardData();

  // 2. Handling jika data gagal diambil
  if (!result.success || !result.data) {
    return (
      <div className="p-6 text-purple-300 bg-[#0e0712] min-h-screen font-sans flex items-center justify-center">
        <div className="bg-[#180a21] border border-purple-800 rounded-lg p-4 text-center">
          <p className="font-bold">Gagal memuat data Dashboard PIT-PD Forward Looking.</p>
          <p className="text-xs text-purple-400 mt-1">
            {result.message || "Pastikan koneksi database MSSQL berjalan dengan baik."}
          </p>
        </div>
      </div>
    );
  }

  // 3. Render Komponen Dashboard dan oper initial props
  return (
    <PenentuanPITPDForwardLooking
      initialSegmentOptions={result.data.segmentOptions}
      initialSelectedId={result.data.selectedRegresiId}
      initialRegressionData={result.data.regressionData}
      initialCycleEnd={result.data.cycleEnd}
      period={result.data.period}
      lastUpdated={result.data.lastUpdated}
    />
  );
}