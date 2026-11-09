import React from "react";
import { getDashboardDataEADRevolving } from "@/report/services/ead-revolving-report/dashboardEADRevolving.service";
import { getDashboardDataEADRevolvingDetail } from "@/report/services/ead-revolving-report/dashboardEADRevolvingDetail.service";
import EADRevolvingClient from "@/report/component/ead-revolving-dashboard/EADRevolvingClient";

export default async function EADRevolvingPage({
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
  const part1Data = await getDashboardDataEADRevolving(
    params?.tanggal_mulai,
    params?.tanggal_selesai,
    params?.metode
  );
  const part2Data = await getDashboardDataEADRevolvingDetail(
    params?.segment,
    1,
    10,
    part1Data.tanggalMulai || params?.tanggal_mulai,
    part1Data.tanggalSelesai || params?.tanggal_selesai,
    part1Data.metodeEad || params?.metode
  );

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <EADRevolvingClient
        initialDataPart1={part1Data}
        initialDataPart2={part2Data}
      />
    </main>
  );
}
