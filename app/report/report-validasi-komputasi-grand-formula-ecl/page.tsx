import React from "react";
import { fetchValidasiKomputasiData } from "@/lib/report-validasi-komputasi-grand-formula-ecl/services";
import WaveBackground from "@/lib/report-validasi-komputasi-grand-formula-ecl/component/WaveBackground";
import Filters from "@/lib/report-validasi-komputasi-grand-formula-ecl/component/Filters";
import ReportTable from "@/lib/report-validasi-komputasi-grand-formula-ecl/component/ReportTable";

export const dynamic = "force-dynamic";

export default async function ReportValidasiKomputasiPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit, 10) : 10;
  const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined;
  const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined;
  
  const segment = typeof searchParams.segment === 'string' ? searchParams.segment : undefined;
  const akad = typeof searchParams.akad === 'string' ? searchParams.akad : undefined;
  
  const data = await fetchValidasiKomputasiData(page, limit, startDate, endDate, segment, akad);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* 3D Wave Background */}
      <WaveBackground color={data.themeColorBgHeader} />

      <div className="relative z-10 w-full px-2 md:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-wider mb-2 drop-shadow-sm">
            {data.namaBank}
          </h1>
          <h2 className="text-xl font-extrabold text-slate-800 uppercase drop-shadow-sm">
            LAPORAN RINCIAN: VALIDASI KOMPUTASI GRAND FORMULA ECL
          </h2>
        </div>

        {/* Filters / Actions Section */}
        <Filters 
          startDate={data.startDate} 
          endDate={data.endDate}
          selectedSegment={data.selectedSegment}
          selectedAkad={data.selectedAkad}
          segmentList={data.segmentList}
          akadList={data.akadList}
          themeColorBtnDownload={data.themeColorBtnDownload}
          themeColorBtnFilterReport={data.themeColorBtnFilterReport}
        />

        {/* Main Content Table */}
        <ReportTable 
          data={data.data} 
          totalData={data.totalData}
          currentPage={page}
          limit={limit}
          startDate={data.startDate}
          endDate={data.endDate}
          selectedSegment={data.selectedSegment}
          selectedAkad={data.selectedAkad}
        />
      </div>
    </div>
  );
}
