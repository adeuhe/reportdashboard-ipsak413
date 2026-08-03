import StrategicHeader from "@/components/strategic/StrategicHeader";
import KpiRow from "@/components/strategic/KpiRow";
import StrategicDashboardClient from "@/components/strategic/StrategicDashboardClient";
import { getStrategicDashboardDataKPI } from "../services/strategicDashboardKPI.service";
import { getStrategicDashboardECLVSNPFTrend } from "../services/strategicDashboardECLVSNPFGrowthComparison.service";
import { getStrategicDashboardSectorialRisk } from "../services/strategicDashboardHeatMap.service";

async function getStrategicDashboard() {
  const res = await fetch("http://localhost:3000/api/strategic-dashboard", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load strategic dashboard data");
  return res.json();
}

export default async function StrategicDashboardPage() {
  // Ambil semua data dari server
  const data = await getStrategicDashboard();
  const dataKPI = await getStrategicDashboardDataKPI();
  const trendData = await getStrategicDashboardECLVSNPFTrend();
  const heatMapData = await getStrategicDashboardSectorialRisk();
  

  return (
    <div className="min-h-screen w-full px-6 space-y-6">
      {/* Header */}
      <StrategicHeader
        title={data.meta.title}
        subtitle={data.meta.subtitle}
        actions={data.meta.actions}
      />

      {/* KPI */}
      <KpiRow kpis={dataKPI.kpis} />

      {/* Dashboard Client (tabs & chart) */}
      <StrategicDashboardClient
        data={{
          meta: data.meta,
          trendData, // data ECL vs NPF
          table: data.table, // kalau ada tabel untuk tab 2
          heatMapData,
        }}
      />
    </div>
  );
}
