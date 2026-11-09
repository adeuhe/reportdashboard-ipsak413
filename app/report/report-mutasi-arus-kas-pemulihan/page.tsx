import React from "react";
import { fetchMutasiArusKasData } from "@/lib/report-mutasi-arus-kas-pemulihan/services";
import ReportMutasiArusKasView from "@/lib/report-mutasi-arus-kas-pemulihan/component/ReportMutasiArusKasView";

export const dynamic = "force-dynamic";

export default async function ReportMutasiArusKasPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined;
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined;

  const data = await fetchMutasiArusKasData(page, limit, startDate, endDate);

  return <ReportMutasiArusKasView data={data} currentPage={page} limit={limit} />;
}
