import React from "react";
import { getDashboardDataLGDParameterSummary } from "@/report/services/lgd-kolektif-report/dashboardLGDParameterSummary.service";
import { getDashboardDataLGDDetailFacility } from "@/report/services/lgd-kolektif-report/dashboardLGDDetailFacility.service";
import LGDKolektifClient from "@/report/component/lgd-kolektif-dashboard/LGDKolektifClient";

export const dynamic = "force-dynamic";

export default async function LGDKolektifPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    metode?: string;
    segment?: string;
  }>;
}) {
  const params = await searchParams;

  const part1Data = await getDashboardDataLGDParameterSummary(
    params?.tanggal_mulai,
    params?.tanggal_selesai,
    params?.metode
  );

  const part2Data = await getDashboardDataLGDDetailFacility(
    params?.segment,
    1,
    10,
    part1Data.tanggalMulai || params?.tanggal_mulai,
    part1Data.tanggalSelesai || params?.tanggal_selesai,
    part1Data.metodeLgd || params?.metode
  );

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <LGDKolektifClient
        initialDataPart1={part1Data}
        initialDataPart2={part2Data}
      />
    </main>
  );
}
