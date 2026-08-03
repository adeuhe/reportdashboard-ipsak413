import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import EclNpfTrendChart from "@/components/dashboard/EclNpfTrendChart";
import StagingMigration from "@/components/dashboard/StagingMigration";
import SectorRiskHeatmap from "@/components/dashboard/SectorRiskHeatmap";
import StatusCard from "@/components/dashboard/StatusCard";
import BucketDpd from "@/components/dashboard/BucketDpd";
import SlikGauge from "@/components/dashboard/SlikGauge";
import RiskTable from "@/components/dashboard/RiskTable";

import { getDashboardDataKPI } from "@/app/services/dashboardKPI.service";
import { getDashboardDataECLNPFTrend } from "./services/dashboardECLNCFTrend.service";
import { getDashboardDataStagingMigration } from "./services/dashboardStagingMigration.services";
import { getDashboardDataSectorialHeatMap } from "./services/dashboardSectorialHeatmap.service";
import { getDashboardDataBucketDPD } from "./services/dashboardBucketDPD.service";
import { getDashboardDataTopBorrowers } from "./services/dashboardTopBorrowers.service";
import { getDashboardDataSlik } from "./services/dashboardDataSlik.service";

async function getDashboard() {
  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export default async function Page() {
  const data = await getDashboard();
  const data2 = await getDashboardDataKPI();
  const dataECLNCFTrend = await getDashboardDataECLNPFTrend();
  const dataStagingMigration = await getDashboardDataStagingMigration();
  const dataDataSectorialHeatMap = await getDashboardDataSectorialHeatMap();
  const dataDashboardDataBucketDPD = await getDashboardDataBucketDPD();
  const dataDataTopBorrowers = await getDashboardDataTopBorrowers();
  const slikData = await getDashboardDataSlik();

  // hitung total perubahan CKPN
  const totalChange = slikData.rows.reduce(
    (a: number, b: any) => a + (b.changeValue ?? 0),
    0,
  );

  // konversi ke skala 0–100
  const gaugeValue = Math.min(
    Math.max(50 + totalChange / 1_000_000_000, 0),
    100,
  );
  console.log("GaugeValue", gaugeValue);
  console.log("SLIK DATA:", slikData.rows);

  return (
    <main className="min-h-screen bg-slate-100">
      <DashboardHeader
        bankName={data.meta.bankName}
        reportTitle={data.meta.reportTitle}
        periodLabel={data.meta.periodLabel}
        dataCutoff={data.meta.dataCutoff}
      />

      <div className="w-full px-6 py-6">
        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data2.kpis.map((k: any) => (
            <KpiCard
              key={k.key}
              label={k.label}
              valueText={k.valueText}
              mom={k.mom}
            />
          ))}
        </div>

        {/* Row 1 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <EclNpfTrendChart data={dataECLNCFTrend.eclNpfTrend} />
          <StagingMigration
            title={dataStagingMigration.stagingMigration.title}
            stages={dataStagingMigration.stagingMigration.stages}
            notes={dataStagingMigration.stagingMigration.notes}
          />
          <SectorRiskHeatmap items={dataDataSectorialHeatMap.sectorRisk} />
        </div>

        {/* Row 2 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* <StatusCard {...data.status} /> */}
          <BucketDpd
            title={dataDashboardDataBucketDPD.bucketDpd.title}
            stages={dataDashboardDataBucketDPD.bucketDpd.stages}
            rows={dataDashboardDataBucketDPD.bucketDpd.rows}
          />

          <SlikGauge
            value={gaugeValue}
            note="Pergerakan CKPN bulan berjalan"
            actions={["Detail", "Export"]}
            periode={slikData.periode} // ← TAMBAHKAN INI
            categories={slikData.rows}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <RiskTable
            titleLeft={
              dataDataTopBorrowers.meta.reportTitle || "Top 10 Borrowers"
            }
            titleCenter={
              dataDataTopBorrowers.meta.periodLabel || "Latest Month"
            }
            rows={dataDataTopBorrowers.rows}
            footer="Data diperbarui setiap bulan"
          />
        </div>
      </div>
    </main>
  );
}
