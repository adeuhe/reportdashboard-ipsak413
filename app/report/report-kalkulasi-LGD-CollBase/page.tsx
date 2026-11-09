import React from "react";
import { fetchKalkulasiLGDData } from "@/lib/report-kalkulasi-LGD-CollBase/services";
import ReportKalkulasi from "@/lib/report-kalkulasi-LGD-CollBase/component/ReportKalkulasi";
import Header from "@/lib/report-kalkulasi-LGD-CollBase/component/Header";
import FilterDate from "@/lib/report-kalkulasi-LGD-CollBase/component/FilterDate";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportKalkulasiLGDPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const dateFilter = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  
  const data = await fetchKalkulasiLGDData(dateFilter);
  
  let currentDate = dateFilter || "";
  if (!currentDate && data.availableDates && data.availableDates.length > 0) {
      currentDate = data.availableDates[0];
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="w-full mx-auto space-y-6">
        
        {/* Header Section */}
        <Header namaBank={data.namaBank} dataPosition={data.dataPosition} />

        {/* Filters / Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <FilterDate currentDate={currentDate} availableDates={data.availableDates} />
          
          <form action="/api/report/report-kalkulasi-LGD-CollBase/export-excel" method="GET">
            {currentDate && <input type="hidden" name="date" value={currentDate} />}
            <button 
              type="submit"
              style={{ backgroundColor: data?.themeColorBtnDownload || "#059669" }}
              className="text-white text-xs font-bold py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center gap-2 tracking-wide cursor-pointer opacity-90 hover:opacity-100"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </button>
          </form>
        </div>

        {/* Main Content */}
        <ReportKalkulasi data={data} />
        
      </div>
    </div>
  );
}
