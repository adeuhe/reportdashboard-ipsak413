import React from "react";
// import { getGaugeDataAction } from "@/app/services/summary-dashboard/gaugeData.service";
// Import service dari Staging Dashboard yang udah lu bikin sebelumnya
import SummaryDashboardClient from "@/report/component/summary-dashboard/SummaryDashboardClient";
// import { getStagingDashboardData } from "../services/staging-dashboard-sevice/stagingDashboard.service";

export default async function SummaryDashboardPage() {
  // Fetch dua data secara paralel
  //   const [gaugeData, stagingData] = await Promise.all([
  //     getGaugeDataAction(),
  //     getStagingDashboardData(), // Ngambil data matrix & metrics
  //   ]);

  // Lempar dua-duanya ke Client Component
  return <SummaryDashboardClient />;
}
