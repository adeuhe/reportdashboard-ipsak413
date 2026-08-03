import CapitalAdequacyRatioImpact from "@/components/financial-impact-dasboard/CapitalAdequacyRatioImpact";
import FinancialImpactClient from "@/components/financial-impact-dasboard/ECLFinancialImpact";
import ProfitDanLostImpact from "@/components/financial-impact-dasboard/ProfitDanLostImpact";
import { getFinancialImpactData } from "../services/financial-impact-service/financialImpact.service";
import { getImpactDistributionData } from "../services/financial-impact-service/impactDistribution.service";
import { getProfitLossImpactData } from "../services/financial-impact-service/profitDanLostImpact.service";
import { getCARImpactServiceData } from "../services/financial-impact-service/carSimulation.service";
import DashboardHeader from "@/components/DashboardHeader";
import { dashboardDummy } from "@/data/dashboard";

export default async function StrategicDashboardPage() {
  const { meta } = dashboardDummy;
  const [responseTrend, responseDist, responsePL, responseCAR] =
    await Promise.all([
      getFinancialImpactData(),
      getImpactDistributionData(),
      getProfitLossImpactData(),
      getCARImpactServiceData(), // Data simulasi CAR
    ]);
  // Validasi data sederhana
  if (!responseTrend || !responsePL) {
    return <div>Loading data or Error fetching...</div>;
  }
  // Validasi: Jika responseCAR null, jangan render komponennya
  if (!responseCAR) {
    return (
      <div className="p-4 text-red-500">Gagal memuat data simulasi CAR.</div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <DashboardHeader
        bankName={meta.bankName}
        reportTitle={meta.reportTitle}
        periodLabel={meta.periodLabel}
        dataCutoff={meta.dataCutoff}
      />
      <div className="min-h-screen w-full px-6 space-y-6">
        <FinancialImpactClient
          data={{
            ...responseTrend.data,
            // Gabungkan data distribusi & ratio dari service kedua
            distributionData: responseDist?.distributionData || [],
            ratios: responseDist?.ratios || { car: 0, npl: 0 },
          }}
        />
        {/* Pastikan mengirim data yang sudah diolah dari service */}
        <ProfitDanLostImpact
          data={responsePL.data}
          reportDate={responsePL.reportDate}
        />
        <CapitalAdequacyRatioImpact data={responseCAR} />
      </div>
    </main>
  );
}
