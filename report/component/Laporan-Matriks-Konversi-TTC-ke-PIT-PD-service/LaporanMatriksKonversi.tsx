"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonLaporanMatriksKonversi from "./ButtonLaporanMatriksKonversi";

export interface MatriksKonversiRow {
  segment_id: string;
  TTC_PD_Base: number;
  BaseLine_Scalar: number;
  PIT_PD_Baseline: number;
  optimistic_Scalar: number;
  PIT_PD_Optimistic: number;
  pessimistic_Scalar: number;
  PIT_PD_Pessimistic: number;
  Bobot_Normal: number;
  Bobot_Best: number;
  Bobot_Worst: number;
  Final_Weight_PIT_PD: number;
}

interface GroupedData {
  key: string;
  bobotNormal: number;
  bobotBest: number;
  bobotWorst: number;
  rows: MatriksKonversiRow[];
}

// Sub-Komponen khusus Table per Group agar Pagination State-nya terisolasi
function GroupDataTable({ group, groupIdx }: { group: GroupedData; groupIdx: number }) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const formatPercent = (val: number) =>
    `${(val || 0).toLocaleString("id-ID", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}%`;

  const formatNumber = (val: number) =>
    (val || 0).toLocaleString("id-ID", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  // Hitung Pagination
  const totalRows = group.rows.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalRows / pageSize);
  
  const paginatedRows = React.useMemo(() => {
    if (pageSize === -1) return group.rows;
    const startIndex = (currentPage - 1) * pageSize;
    return group.rows.slice(startIndex, startIndex + pageSize);
  }, [group.rows, currentPage, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset ke page 1 jika ukuran page berubah
  };

  // Logic Catatan Audit
  const totalBobot = Number((group.bobotNormal + group.bobotBest + group.bobotWorst).toFixed(2));
  const isValid = totalBobot === 100;

  return (
    <div className="border border-slate-200 rounded-md p-4 bg-white shadow-2xs">
      {/* Table Header / Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-200 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-700"></span>
          Kelompok Skenario {groupIdx + 1}: Skenario (Baseline {group.bobotNormal}% | Best {group.bobotBest}% | Worst {group.bobotWorst}%)
        </h3>
        
        {/* Row Limit Control per Table */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-2 py-0.5 rounded-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={-1}>Semua</option>
            </select>
            <span>data</span>
          </div>
          <span className="font-semibold text-slate-500 border-l border-slate-300 pl-3">
            Total: {totalRows} Segment
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full overflow-x-auto border border-slate-200 rounded-xs mb-3">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold text-[11px] uppercase tracking-wider">
              <th rowSpan={2} className="p-3 border border-slate-300 text-left pl-4">SEGMENT ID</th>
              <th rowSpan={2} className="p-3 border border-slate-300 text-right">TTC PD BASE (%)</th>
              
              <th colSpan={2} className="p-2 border border-slate-300 text-center">
                BASELINE (BOBOT: {group.bobotNormal}%)
              </th>
              <th colSpan={2} className="p-2 border border-slate-300 text-center">
                OPTIMISTIC (BOBOT: {group.bobotBest}%)
              </th>
              <th colSpan={2} className="p-2 border border-slate-300 text-center">
                PESSIMISTIC (BOBOT: {group.bobotWorst}%)
              </th>
              
              <th rowSpan={2} className="p-3 border border-slate-300 text-right">FINAL WEIGHT PIT PD (%)</th>
            </tr>
            <tr className="bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
              <th className="p-2 border border-slate-300 text-right">SCALAR</th>
              <th className="p-2 border border-slate-300 text-right">PIT PD (%)</th>
              <th className="p-2 border border-slate-300 text-right">SCALAR</th>
              <th className="p-2 border border-slate-300 text-right">PIT PD (%)</th>
              <th className="p-2 border border-slate-300 text-right">SCALAR</th>
              <th className="p-2 border border-slate-300 text-right">PIT PD (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 border border-slate-200 text-left pl-4 font-bold text-slate-900">{row.segment_id}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatPercent(row.TTC_PD_Base)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatNumber(row.BaseLine_Scalar)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatPercent(row.PIT_PD_Baseline)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatNumber(row.optimistic_Scalar)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatPercent(row.PIT_PD_Optimistic)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatNumber(row.pessimistic_Scalar)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono">{formatPercent(row.PIT_PD_Pessimistic)}</td>
                  <td className="p-3 border border-slate-200 text-right font-mono font-bold text-slate-900 bg-slate-50">{formatPercent(row.Final_Weight_PIT_PD)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-4 text-center text-slate-400">Tidak ada data untuk ditampilkan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      {pageSize !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 mb-4 text-xs">
          <span className="text-slate-500 font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-medium rounded-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &laquo; Sebelumnya
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`px-2.5 py-1 font-semibold rounded-xs border ${
                  pNum === currentPage
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-medium rounded-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya &raquo;
            </button>
          </div>
        </div>
      )}

      {/* Catatan Audit Sistem */}
      <div
        className={`border-l-4 p-3.5 rounded-r-md text-[11px] space-y-1 font-mono transition-colors ${
          isValid
            ? "bg-slate-50 border-slate-700 text-slate-700"
            : "bg-rose-50/70 border-rose-600 text-rose-900"
        }`}
      >
        <p className="font-bold uppercase tracking-wider font-sans text-slate-900">
          CATATAN AUDIT SISTEM:
        </p>
        <p>
          1. <strong>WEIGHTING CHECK (100% RULE):</strong> Sistem telah mengevaluasi agregasi bobot probabilitas skenario (Baseline {group.bobotNormal}% + Optimistic {group.bobotBest}% + Pessimistic {group.bobotWorst}%) = <strong className="font-bold">{totalBobot}%</strong>. Status kalkulasi:{" "}
          {isValid ? (
            <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded tracking-wide">
              UNLOCKED &amp; VALID
            </span>
          ) : (
            <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded tracking-wide">
              LOCKED &amp; INVALID (DEVIASI {Number((totalBobot - 100).toFixed(2)) >= 0 ? `+${(totalBobot - 100).toFixed(2)}` : (totalBobot - 100).toFixed(2)}%)
            </span>
          )}
        </p>
        <p>
          2. <strong>METODOLOGI:</strong>{" "}
          {isValid ? (
            <>
              Final Weighted PIT PD = (PIT PD Baseline × {group.bobotNormal}%) + (PIT PD Optimistic × {group.bobotBest}%) + (PIT PD Pessimistic × {group.bobotWorst}%).
            </>
          ) : (
            <span className="text-rose-700 font-semibold">
              Kalkulasi Final Weighted PIT PD ditahan oleh sistem karena total pembobotan skenario tidak memenuhi kaidah konsistensi 100% Rule. Harap perbarui parameter bobot pada database (paramECLBobot).
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// Main Component
export default function LaporanMatriksKonversi({ initialData }: { initialData: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate = searchParams.get("date") || initialData?.meta?.periodLabel || "2026-12-31";
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`?${params.toString()}`);
  };

  const allRows: MatriksKonversiRow[] = initialData?.data || [];

  // Grouping Data
  const groupedData: GroupedData[] = React.useMemo(() => {
    const groups: { [key: string]: GroupedData } = {};

    allRows.forEach((row) => {
      const key = `${row.Bobot_Normal}-${row.Bobot_Best}-${row.Bobot_Worst}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          bobotNormal: row.Bobot_Normal,
          bobotBest: row.Bobot_Best,
          bobotWorst: row.Bobot_Worst,
          rows: [],
        };
      }
      groups[key].rows.push(row);
    });

    return Object.values(groups);
  }, [allRows]);

  return (
    <div className="w-full bg-slate-100 min-h-screen p-4 text-slate-800">
      <div className="w-full bg-white border border-slate-200 rounded-lg shadow-xs p-6 md:p-8">
        
        {/* Header Title */}
        <div className="text-center mb-6 border-b border-slate-100 pb-6">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-slate-900">
            {initialData?.meta?.bankName || "PT BANK MUAMALAT INDONESIA TBK"}
          </h1>
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-600 mt-1.5">
            {initialData?.meta?.reportTitle || "LAPORAN AUDIT: MATRIKS KONVERSI TTC KE FORECAST PD"}
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Skenario Makroekonomi & Pembobotan (100% Rule Validated)
          </p>
        </div>

        {/* Action Box */}
        <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-md mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">PERIODE:</label>
            <select
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-white border border-slate-300 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-xs shadow-xs"
            >
              {initialData?.meta?.listPeriode?.map((item: string) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <ButtonLaporanMatriksKonversi />
        </div>

        {/* Render Table per Group */}
        <div className="space-y-8">
          {groupedData.map((group, groupIdx) => (
            <GroupDataTable key={group.key} group={group} groupIdx={groupIdx} />
          ))}
        </div>

      </div>
    </div>
  );
}