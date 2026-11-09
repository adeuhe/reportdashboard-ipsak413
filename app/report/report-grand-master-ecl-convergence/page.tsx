import React from "react";
import { fetchGrandMasterEclConvergenceData } from "@/lib/report-grand-master-ecl-convergence/services";
import ReportGrandMasterEclConvergenceView from "@/lib/report-grand-master-ecl-convergence/component/ReportGrandMasterEclConvergenceView";

export const dynamic = "force-dynamic";

export default async function ReportGrandMasterEclConvergencePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const kodeCabang = typeof searchParams.kodeCabang === "string" ? searchParams.kodeCabang : undefined;
  const sumberModul = typeof searchParams.sumberModul === "string" ? searchParams.sumberModul : undefined;

  const data = await fetchGrandMasterEclConvergenceData(kodeCabang, sumberModul);

  return <ReportGrandMasterEclConvergenceView initialData={data} />;
}
