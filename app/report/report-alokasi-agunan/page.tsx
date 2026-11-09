import React from "react";
import { fetchAlokasiAgunanData } from "@/lib/report-alokasi-agunan/services";
import ReportAlokasi from "@/lib/report-alokasi-agunan/component/ReportAlokasi";
import Header from "@/lib/report-alokasi-agunan/component/Header";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportAlokasiPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const data = await fetchAlokasiAgunanData();
  const printDate = typeof searchParams.printDate === 'string' ? searchParams.printDate : undefined;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="w-full px-4 space-y-6">

        {/* Header Section */}
        <Header namaBank={data?.namaBank} dataPosition={data?.dataPosition} />

        {/* Filters / Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-black uppercase">PERIODE DATA:</span>
            <select className="border border-slate-300 text-slate-900 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
              <option>{data?.dataPosition}</option>
            </select>
          </div>
          <form action="/api/report/report-alokasi-agunan/export-excel" method="GET">
            {printDate && <input type="hidden" name="printDate" value={printDate} />}
            <button
              type="submit"
              style={{ backgroundColor: data?.themeColorBtnDownload || "#059669" }}
              className="text-white text-xs font-bold py-2 px-6 rounded-md shadow-sm transition-colors flex items-center gap-2 tracking-wide opacity-90 hover:opacity-100"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </button>
          </form>
        </div>

        {/* Main Content */}
        <ReportAlokasi data={data} />
      </div>
    </div>
  );
}
