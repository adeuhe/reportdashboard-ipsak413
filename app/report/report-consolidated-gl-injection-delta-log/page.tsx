import React from "react";
import { fetchConsolidatedGlInjectionData } from "@/lib/report-consolidated-gl-injection-delta-log/services";
import ReportConsolidatedGlInjectionDeltaLogView from "@/lib/report-consolidated-gl-injection-delta-log/component/ReportConsolidatedGlInjectionDeltaLogView";

export const dynamic = "force-dynamic";

export default async function ReportConsolidatedGlInjectionDeltaLogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const segmenGl = typeof searchParams.segmenGl === "string" ? searchParams.segmenGl : undefined;

  const data = await fetchConsolidatedGlInjectionData(segmenGl);

  return <ReportConsolidatedGlInjectionDeltaLogView initialData={data} />;
}
