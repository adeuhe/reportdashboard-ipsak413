import React from "react";
import { getReportAgregasiLGDStage2Data } from "@/lib/report-agregasi-lgd-stage2/services";
import ReportAgregasiLGDStage2View from "@/lib/report-agregasi-lgd-stage2/component/ReportAgregasiLGDStage2View";

export const dynamic = "force-dynamic";

export default async function ReportAgregasiLGDStage2Page() {
  const data = await getReportAgregasiLGDStage2Data();

  return <ReportAgregasiLGDStage2View initialData={data} />;
}
