import React from "react";
import { fetchAmortisasiBiayaUjrahData } from "@/lib/report-amortisasi-biaya-ujrah-epr/services";
import ReportAmortisasiBiayaUjrahView from "@/lib/report-amortisasi-biaya-ujrah-epr/component/ReportAmortisasiBiayaUjrahView";

export const dynamic = "force-dynamic";

export default async function ReportAmortisasiBiayaUjrahPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  const searchRekening = typeof searchParams.searchRekening === "string" ? searchParams.searchRekening : undefined;
  const statusFilter = typeof searchParams.statusFilter === "string" ? searchParams.statusFilter : undefined;

  const data = await fetchAmortisasiBiayaUjrahData(searchRekening, statusFilter, page, limit);

  return <ReportAmortisasiBiayaUjrahView initialData={data} />;
}
