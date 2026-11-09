import React from "react";
import { fetchKepatuhanSyariahData } from "@/lib/report-pengujian-kepatuhan-syariah/services";
import ReportKepatuhan from "@/lib/report-pengujian-kepatuhan-syariah/component/ReportKepatuhan";
import Header from "@/lib/report-pengujian-kepatuhan-syariah/component/Header";
import FilterDate from "@/lib/report-pengujian-kepatuhan-syariah/component/FilterDate";

export const dynamic = "force-dynamic";

export default async function ReportPengujianKepatuhanSyariahPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const dateFilter = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  const printDate = typeof searchParams.printDate === 'string' ? searchParams.printDate : undefined;
  
  const data = await fetchKepatuhanSyariahData(dateFilter);
  
  // Default format date for the dropdown if not provided
  let currentDate = dateFilter || "";
  if (!currentDate && data.sampelAudit.length > 0 && data.sampelAudit[0].Tanggal_Laporan) {
      currentDate = new Date(data.sampelAudit[0].Tanggal_Laporan).toISOString().split("T")[0];
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="w-full px-4 space-y-6">
        
        {/* Header Section */}
        <Header namaBank={data?.namaBank} dataPosition={data?.dataPosition} />

        {/* Filters / Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <FilterDate currentDate={currentDate} />
          
          <form action="/api/report/report-pengujian-kepatuhan-syariah/export-excel" method="GET">
            {dateFilter && <input type="hidden" name="date" value={dateFilter} />}
            {printDate && <input type="hidden" name="printDate" value={printDate} />}
            <button 
              type="submit"
              style={{ backgroundColor: data?.themeDownloadColor || "#1D4ED8" }}
              className="hover:brightness-110 text-white text-xs font-bold py-2 px-6 rounded-md shadow-sm transition-all flex items-center gap-2 tracking-wide cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Excel
            </button>
          </form>
        </div>

        {/* Main Content */}
        <ReportKepatuhan data={data} />
        
      </div>
    </div>
  );
}
