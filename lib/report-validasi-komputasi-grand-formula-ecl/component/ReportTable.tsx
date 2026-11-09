"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ValidasiKomputasiRow } from "../types";

interface ReportTableProps {
  data: ValidasiKomputasiRow[];
  totalData: number;
  currentPage: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  selectedSegment?: string;
  selectedAkad?: string;
}

export default function ReportTable({
  data,
  totalData,
  currentPage,
  limit,
  startDate,
  endDate,
  selectedSegment,
  selectedAkad,
}: ReportTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalData / limit);

  const formatDateStr = (str?: string) => {
    if (!str) return "-";
    const parts = str.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return str;
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1"); // Reset to page 1
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDecimal = (val: number, decimals: number = 6) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val || 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden z-10 relative mt-4">
      {/* Table Header Section */}
      <div className="bg-[#0f172a] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-white">
        <h2 className="text-sm font-black uppercase tracking-wider">
          TABEL RINCIAN KALKULASI PORSI GANDA (SECURED VS UNSECURED)
        </h2>
        <span className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wide">
          POSISI DATA: <span className="text-amber-400 font-black">{formatDateStr(startDate)} s/d {formatDateStr(endDate)}</span>
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-slate-800 bg-slate-100 uppercase border-b-2 border-slate-300">
            <tr>
              <th className="px-4 py-4 font-extrabold text-center border-r border-slate-300">No Rekening</th>
              <th className="px-4 py-4 font-extrabold text-left border-r border-slate-300">Segment</th>
              <th className="px-4 py-4 font-extrabold text-center border-r border-slate-300">Jenis Akad</th>
              <th className="px-4 py-4 font-extrabold text-center border-r border-slate-300">Stage</th>
              <th className="px-4 py-4 font-extrabold text-right border-r border-slate-300 text-blue-900 bg-blue-100">EAD Secured</th>
              <th className="px-4 py-4 font-extrabold text-right border-r border-slate-300 text-orange-900 bg-orange-100">EAD Unsecured</th>
              <th className="px-4 py-4 font-extrabold text-center border-r border-slate-300">Final PD</th>
              <th className="px-4 py-4 font-extrabold text-center border-r border-slate-300 text-blue-900 bg-blue-100">LGD Sec</th>
              <th className="px-4 py-4 font-extrabold text-center border-r border-slate-300 text-orange-900 bg-orange-100">LGD Unsec</th>
              <th className="px-4 py-4 font-extrabold text-right border-r border-slate-300 text-blue-900 bg-blue-100">ECL Secured</th>
              <th className="px-4 py-4 font-extrabold text-right border-r border-slate-300 text-orange-900 bg-orange-100">ECL Unsecured</th>
              <th className="px-4 py-4 font-extrabold text-right bg-slate-200">Total ECL Statistik</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-extrabold text-slate-800">{row.no_rekening}</td>
                  <td className="px-4 py-3 text-left border-r border-slate-200 font-bold text-slate-800">{row.segment_name || "-"}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-bold text-slate-800">{row.nama_akad || "-"}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-bold text-slate-800">{row.stage_psak}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-extrabold text-slate-900 bg-blue-50/50">{formatRupiah(row.ead_secured)}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-extrabold text-slate-900 bg-orange-50/50">{formatRupiah(row.ead_unsecured)}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-bold text-slate-800">{formatDecimal(row.final_pd_rate, 6)}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-extrabold text-blue-800 bg-blue-50/50">{formatDecimal(row.lgd_secured, 2)}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-extrabold text-orange-800 bg-orange-50/50">{formatDecimal(row.lgd_unsecured, 2)}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-extrabold text-slate-900 bg-blue-50/50">{formatRupiah(row.nominal_ecl_secured)}</td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-extrabold text-slate-900 bg-orange-50/50">{formatRupiah(row.nominal_ecl_unsecured)}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-950 bg-slate-50">{formatRupiah(row.total_ecl_statistik)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                  Data tidak tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Notes */}
      <div className="bg-slate-50 p-4 border-t-2 border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs md:text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap">
          <span className="uppercase tracking-wide">Tampilkan:</span>
          <select
            className="border-2 border-slate-400 rounded px-2.5 py-1 bg-white font-black text-slate-900 shadow-sm outline-none focus:border-slate-800"
            value={limit}
            onChange={handleLimitChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="uppercase tracking-wide">baris</span>
          <span className="ml-2 md:ml-4 border-l-2 border-slate-400 pl-2 md:pl-4 font-black text-slate-900">
            Menampilkan Halaman <span className="text-blue-700">{currentPage}</span> dari <span className="text-blue-700">{totalPages || 1}</span> (Total <span className="text-slate-950 font-black">{totalData}</span> Data)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-4 py-1.5 text-xs md:text-sm font-black bg-white border-2 border-slate-400 rounded text-slate-900 shadow-sm disabled:opacity-40 hover:bg-slate-100 uppercase tracking-wide"
          >
            PREV
          </button>
          <span className="px-4 py-1.5 text-xs md:text-sm font-black bg-blue-700 text-white rounded shadow-sm">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-4 py-1.5 text-xs md:text-sm font-black bg-white border-2 border-slate-400 rounded text-slate-900 shadow-sm disabled:opacity-40 hover:bg-slate-100 uppercase tracking-wide"
          >
            NEXT
          </button>
        </div>
      </div>

      {/* Footer Catatan Sistem */}
      <div className="bg-slate-50 p-4 text-xs md:text-sm border-t border-slate-200 flex items-stretch gap-3.5">
        <div className="w-1.5 bg-[#0f172a] rounded-full self-stretch flex-shrink-0" />
        <div className="flex-1">
          <div className="font-black text-[#0f172a] text-xs md:text-sm uppercase tracking-wider mb-2">* CATATAN SISTEM:</div>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-800 font-extrabold tracking-wide">
            <li>Total ECL Statistik = ECL Secured + ECL Unsecured.</li>
            <li>LGD Secured digunakan untuk perhitungan nominal ECL yang ter-cover oleh agunan.</li>
            <li>LGD Unsecured digunakan untuk perhitungan nominal ECL porsi Clean Loan.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
