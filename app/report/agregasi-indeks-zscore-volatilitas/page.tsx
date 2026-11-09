import React from "react";
import { fetchZscoreVolatilitasData } from "@/lib/zscore-volatilitas/services";
import ReportZscoreVolatilitasView from "@/lib/zscore-volatilitas/component/ReportZscoreVolatilitasView";

export const dynamic = "force-dynamic";

export default async function ReportAgregasiIndeksZscoreVolatilitasPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  const segmentId = typeof searchParams.segmentId === "string" ? searchParams.segmentId : undefined;
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined;
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined;

  const data = await fetchZscoreVolatilitasData(segmentId, startDate, endDate, page, limit);

  return <ReportZscoreVolatilitasView initialData={data} />;
}
