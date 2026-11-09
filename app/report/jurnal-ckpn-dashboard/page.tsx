import React from "react";
import { getDashboardDataJurnalCKPN } from "@/report/services/jurnal-ckpn-report/dashboardJurnalCKPN.service";
import { getDashboardDataJurnalCKPNDetail } from "@/report/services/jurnal-ckpn-report/dashboardJurnalCKPNDetail.service";
import JurnalCKPNClient from "@/report/component/jurnal-ckpn-dashboard/JurnalCKPNClient";

export default async function JurnalCKPNPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    valuta?: string;
    segment?: string;
  }>;
}) {
  const params = await searchParams;
  const [data, part2Data] = await Promise.all([
    getDashboardDataJurnalCKPN(params?.tanggal_mulai, params?.tanggal_selesai, params?.valuta),
    getDashboardDataJurnalCKPNDetail(params?.segment),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <JurnalCKPNClient initialData={data} initialDataPart2={part2Data} />
    </main>
  );
}
