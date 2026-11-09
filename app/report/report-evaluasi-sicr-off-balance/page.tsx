import React from "react";
import { fetchEvaluasiSicrOffBalanceData } from "@/lib/report-evaluasi-sicr-off-balance/services";
import ReportEvaluasiSicrOffBalanceView from "@/lib/report-evaluasi-sicr-off-balance/component/ReportEvaluasiSicrOffBalanceView";

export const dynamic = "force-dynamic";

export default async function ReportEvaluasiSicrOffBalancePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined;
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined;
  const searchRekening = typeof searchParams.searchRekening === "string" ? searchParams.searchRekening : undefined;

  const data = await fetchEvaluasiSicrOffBalanceData(page, limit, startDate, endDate, searchRekening);

  return <ReportEvaluasiSicrOffBalanceView data={data} currentPage={page} limit={limit} />;
}
