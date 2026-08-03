"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonDefinisiAuditTrailFasilitasAsalUsulAnomali from "./ButtonDefinisiAuditTrailFasilitasAsalUsulAnomali";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";

interface Props {
  initialData: {
    data: Array<{
      tanggalLaporan: string;
      segment: string;
      nomorRekening: string;
      jenisAkad: string;
      tipeAgunan: string;
      nilaiPasar: number;
      totalHaircut: number;
      nrv: number;
      eadNetto: number;
      surplus: number;
      akarPenyebab: string;
    }>;
    segmentOptions: string[];
    meta: {
      bankName: string;
      reportTitle: string;
      currency: string;
      tujuanLaporan: string;
      periode: string;
      selectedSegment: string;
    };
  };
}

export default function DefinisiAuditTrailFasilitasAsalUsulAnomali({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State Filter & Search
  const [searchFasilitas, setSearchFasilitas] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(
    searchParams.get("segment") || initialData?.meta?.selectedSegment || "ALL"
  );

  useEffect(() => {
    const segFromUrl = searchParams.get("segment") || "ALL";
    setSelectedSegment(segFromUrl);
  }, [searchParams]);

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSegment(val);

    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "ALL") {
      params.set("segment", val);
    } else {
      params.delete("segment");
    }

    setCurrentPage(1);
    router.push(`?${params.toString()}`);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return (val * 100).toFixed(2) + "%";
  };

  const dataList = initialData?.data || [];

  // FILTERING LOGIC (Client-Side Fallback & Flexible Matching)
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      // 1. Match Filter Segmen
      let matchSegment = true;
      if (selectedSegment && selectedSegment !== "ALL") {
        const itemSeg = (item.segment || "").toLowerCase();
        const targetSeg = selectedSegment.toLowerCase();
        
        // Memeriksa apakah string segmen cocok penuh ATAU mengandung nilai segmen (misal "1" dalam "Segment 1 - Mikro")
        matchSegment =
          itemSeg === targetSeg ||
          itemSeg.includes(targetSeg) ||
          targetSeg.includes(itemSeg);
      }

      // 2. Match Filter No. Fasilitas
      let matchFasilitas = true;
      if (searchFasilitas.trim()) {
        matchFasilitas = (item.nomorRekening || "")
          .toLowerCase()
          .includes(searchFasilitas.trim().toLowerCase());
      }

      return matchSegment && matchFasilitas;
    });
  }, [dataList, selectedSegment, searchFasilitas]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  // Helper untuk format tampilan segmen di header atas
  const getSegmentDisplayText = (seg: string) => {
    if (!seg || seg === "ALL") return "Semua Segmen";
    return seg.toLowerCase().startsWith("segment") ? seg : `Segmen ${seg}`;
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-100/70 min-h-screen font-sans">
      
      {/* CARD UTAMA */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-6 max-w-[100vw] overflow-x-auto">
        
        {/* 1. HEADER JUDUL LAPORAN */}
        <div className="text-center pt-2 pb-4 border-b border-gray-100 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E36] tracking-wide uppercase">
            {initialData?.meta?.bankName || "PT BANK MUAMALAT INDONESIA TBK"}
          </h1>
          
          <h2 className="text-xs sm:text-sm font-extrabold text-gray-700 tracking-wider uppercase">
            {initialData?.meta?.reportTitle}
          </h2>

          <p className="text-xs font-normal text-gray-500 tracking-tight font-mono pt-1">
            Mata Uang: {initialData?.meta?.currency || "IDR"} &nbsp;|&nbsp; Segmen: {getSegmentDisplayText(selectedSegment)}
          </p>
        </div>

        {/* 2. CONTROL BAR */}
        <div className="bg-white p-3 rounded-lg border border-gray-200/90 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-700">
            
            {/* Info Periode */}
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider uppercase text-gray-600">PERIODE:</span>
              <div className="px-3 py-1 bg-gray-100/80 border border-gray-300 rounded font-mono font-semibold text-gray-800">
                {initialData?.meta?.periode || "-"}
              </div>
            </div>

            {/* Info Mata Uang */}
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider uppercase text-gray-600">MATA UANG:</span>
              <div className="px-3 py-1 bg-gray-100/80 border border-gray-300 rounded font-mono font-semibold text-gray-800">
                {initialData?.meta?.currency || "IDR"}
              </div>
            </div>

            {/* Filter Segment Dropdown */}
            <div className="flex items-center gap-2">
              <label className="font-bold tracking-wider uppercase text-gray-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                SEGMEN:
              </label>
              <select
                value={selectedSegment}
                onChange={handleSegmentChange}
                className="border border-emerald-600 bg-white text-gray-800 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold"
              >
                <option value="ALL">Semua Segmen</option>
                {initialData?.segmentOptions?.map((seg) => {
                  // Ekstrak label & value secara aman
                  const label = seg.toLowerCase().startsWith("segment") ? seg : `Segmen ${seg}`;
                  return (
                    <option key={seg} value={seg}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Input Search No. Fasilitas */}
            <div className="flex items-center gap-2">
              <label className="font-bold tracking-wider uppercase text-gray-600 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                NO. FASILITAS:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari No. Fasilitas..."
                  value={searchFasilitas}
                  onChange={(e) => {
                    setSearchFasilitas(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 focus:border-blue-500 bg-white text-gray-800 rounded px-3 py-1 text-xs w-48 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchFasilitas && (
                  <button
                    onClick={() => {
                      setSearchFasilitas("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Tombol Export Excel */}
          <ButtonDefinisiAuditTrailFasilitasAsalUsulAnomali selectedSegment={selectedSegment} />
        </div>

        {/* 3. TUJUAN LAPORAN */}
        <div className="border-l-4 border-amber-500 bg-amber-50/50 p-3 rounded-r text-xs text-amber-900">
          <span className="font-bold">Tujuan Laporan:</span> {initialData?.meta?.tujuanLaporan}
        </div>

        {/* 4. TABEL DATA UTAMA */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="text-[11px] uppercase bg-gray-50/80 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Segmen</th>
                  <th className="px-4 py-3 text-center">No. Fasilitas</th>
                  <th className="px-4 py-3">Akad</th>
                  <th className="px-4 py-3">Tipe Agunan</th>
                  <th className="px-4 py-3 text-right">Nilai Pasar (A)</th>
                  <th className="px-4 py-3 text-center">Total Haircut</th>
                  <th className="px-4 py-3 text-right">NRV (B)</th>
                  <th className="px-4 py-3 text-right">EAD Netto (C)</th>
                  <th className="px-4 py-3 text-right">Surplus (B-C)</th>
                  <th className="px-4 py-3 text-center">Akar Penyebab (Root Cause)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-2.5 text-left font-bold font-sans text-gray-800">
                        {item.segment}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-gray-900 text-center">
                        {item.nomorRekening}
                      </td>
                      <td className="px-4 py-2.5">{item.jenisAkad}</td>
                      <td className="px-4 py-2.5">{item.tipeAgunan}</td>
                      <td className="px-4 py-2.5 text-right font-mono">Rp {formatNumber(item.nilaiPasar)}</td>
                      <td className="px-4 py-2.5 text-center font-mono">{formatPercent(item.totalHaircut)}</td>
                      <td className="px-4 py-2.5 text-right font-mono">Rp {formatNumber(item.nrv)}</td>
                      <td className="px-4 py-2.5 text-right font-mono">Rp {formatNumber(item.eadNetto)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-bold">
                        Rp {formatNumber(item.surplus)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300 rounded">
                          {item.akarPenyebab}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">
                      Data tidak ditemukan untuk kriteria filter yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-100 gap-3">
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <span>Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>dari {totalItems} total data</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. CATATAN AUDIT SISTEM */}
        <div className="border-l-[5px] border-[#0F2942] bg-[#F8FAFC] p-4 rounded-r-lg shadow-sm space-y-2">
          <h3 className="text-xs font-extrabold text-[#0F2942] tracking-wider uppercase">
            CATATAN AUDIT ROOT CAUSE ANALYSIS:
          </h3>
          <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1.5 leading-relaxed font-sans">
            <li>
              <span className="font-bold text-gray-900">STATUS OVER-COLLATERALIZED:</span> Kondisi empiris di mana Nilai Pemulihan Bersih (NRV) aset jaminan setelah didiskon haircut masih lebih besar daripada sisa eksposur utang bersih (EAD Netto).
            </li>
            <li>
              <span className="font-bold text-gray-900">PEMBUKTIAN ANOMALI:</span> Surplus Agunan (Kolom B - C) yang bernilai positif adalah akar penyebab matematis yang memicu aktifnya sistem pencegahan LGD Negatif (LGD Floor 0%) pada engine perhitungan PSAK 413.
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}