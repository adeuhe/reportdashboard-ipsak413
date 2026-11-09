import React from "react";
import { fetchKertasKerjaKonsolidasiUltimateEadData } from "@/lib/report-kertas-kerja-konsolidasi-ultimate-ead/services";
import ReportKertasKerjaKonsolidasiUltimateEadView from "@/lib/report-kertas-kerja-konsolidasi-ultimate-ead/component/ReportKertasKerjaKonsolidasiUltimateEadView";

export const dynamic = "force-dynamic";

export default async function ReportKertasKerjaKonsolidasiUltimateEadPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined;
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined;
  const searchRekening = typeof searchParams.searchRekening === "string" ? searchParams.searchRekening : undefined;

  const data = await fetchKertasKerjaKonsolidasiUltimateEadData(page, limit, startDate, endDate, searchRekening);

  return <ReportKertasKerjaKonsolidasiUltimateEadView data={data} currentPage={page} limit={limit} />;
}
