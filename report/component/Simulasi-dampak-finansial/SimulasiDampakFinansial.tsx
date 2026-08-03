"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function SimulasiDampakFinansial() {
  const [selectedDate, setSelectedDate] = useState<string>("2025-12-31");
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalFasilitas: 0, totalUnderProvisioning: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData("2025-12-31");
  }, []);

  const fetchData = async (dateParam?: string) => {
    setLoading(true);
    try {
      const query = dateParam ? `?date=${dateParam}` : "";
      const res = await fetch(`/api/report/Simulasi-dampak-finansial${query}`);
      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        setSummary(json.summary || { totalFasilitas: 0, totalUnderProvisioning: 0 });
        if (json.latestDate && (!selectedDate || !dateParam)) {
          setSelectedDate(json.latestDate);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data laporan", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return "Rp 0,00";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // ==================== KALKULASI DIAGRAM DINAMIS BERDASARKAN DATA ====================
  const diagramStats = useMemo(() => {
    let dpdOver30 = 0;
    let dpdUnder30 = 0;
    
    // Object untuk mengelompokkan secara dinamis per Jenis_Akad yang ada di DPD <= 30
    const akadGroups: {
      [key: string]: {
        total: number;
        sicr: number;
        stage1: number;
        keteranganEvaluasi: string;
      };
    } = {};

    data.forEach((item) => {
      const dpd = Number(item.DPD || 0);
      const jenisAkad = String(item.Jenis_Akad || "LAINNYA").trim();
      const isSicr =
        item.Stage === 2 ||
        item.Stage === "2" ||
        item.Bucket_SICR === "SICR" ||
        (item.Selisih_ECL && item.Selisih_ECL > 0);

      if (dpd > 30) {
        dpdOver30++;
      } else {
        dpdUnder30++;

        if (!akadGroups[jenisAkad]) {
          // Menentukan teks kriteria evaluasi berdasarkan jenis akad
          let ket = "Evaluasi Indikator SICR Standar";
          const akadUpper = jenisAkad.toUpperCase();
          if (akadUpper.includes("MUDHARABAH")) {
            ket = "Cek Realisasi Nisbah vs Proyeksi. Turun >20%?";
          } else if (akadUpper.includes("ISTISHNA")) {
            ket = "Cek Deviasi Proyek. Mangkrak >3 Bulan?";
          } else if (akadUpper.includes("MUSYARAKAH")) {
            ket = "Cek Penurunan Kinerja Mitra / Stream Cashflow";
          }

          akadGroups[jenisAkad] = {
            total: 0,
            sicr: 0,
            stage1: 0,
            keteranganEvaluasi: ket,
          };
        }

        akadGroups[jenisAkad].total++;
        if (isSicr) {
          akadGroups[jenisAkad].sicr++;
        } else {
          akadGroups[jenisAkad].stage1++;
        }
      }
    });

    return {
      dpdOver30,
      dpdUnder30,
      akadList: Object.entries(akadGroups).map(([namaAkad, stat]) => ({
        namaAkad,
        ...stat,
      })),
    };
  }, [data]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6 flex items-center justify-center">
        <span className="text-slate-400 font-medium text-sm">Memuat halaman...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 text-slate-800 font-sans w-full">
      <div className="w-full space-y-4">

        {/* ==================== CARD 1: HEADER & PERIODE FILTER ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-6 w-full">
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-wide text-[#0F172A] uppercase">
              PT BANK MUAMALAT INDONESIA TBK
            </h1>
            <h2 className="text-xs font-bold tracking-wider text-slate-700 mt-1 uppercase">
              FIXED REPORT: SIMULASI DAMPAK FINANSIAL (UNDER-PROVISIONING) AKIBAT KETIDAKLENGKAPAN VARIABEL SICR
            </h2>
            <p className="text-xs italic text-slate-500 mt-1">
              Tanggal Simulasi: {selectedDate || "2025-12-31"} | Segmen: Hidden Risk (Stage 1 to SICR Migration)
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                PERIODE:
              </span>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  fetchData(e.target.value);
                }}
                className="bg-white border border-slate-300 text-slate-900 font-semibold text-xs rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025-12-31">2025-12-31</option>
              </select>
            </div>

            <a
              href={`/api/report/Simulasi-dampak-finansial/export-excel?date=${selectedDate}`}
              className="inline-flex items-center space-x-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
              </svg>
              <span>Unduh Laporan (Excel)</span>
            </a>
          </div>
        </div>

        {/* ==================== CARD 2: TOTAL SUMMARY METRICS ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 space-y-3 w-full">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>TOTAL FASILITAS TERDAMPAK</span>
            <span className="text-sm font-black text-slate-900">{summary.totalFasilitas} REKENING</span>
          </div>
          <hr className="border-slate-100" />
          <div className="flex flex-wrap justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>TOTAL UNDER-PROVISIONING (RP)</span>
            <div className="flex items-center space-x-3">
              <span className="text-base font-black text-red-600">
                {formatCurrency(summary.totalUnderProvisioning)}
              </span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded tracking-normal">
                &lt;-- POTENSI KEKURANGAN PENCADANGAN!
              </span>
            </div>
          </div>
        </div>

        {/* ==================== CARD 3: DIAGRAM LOGIKA EVALUASI (100% DINAMIS) ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 space-y-4 w-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                DIAGRAM LOGIKA EVALUASI KETIDAKLENGKAPAN VARIABEL SICR BERDASARKAN JENIS AKAD
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Total Evaluasi: <strong className="text-slate-800">{data.length} Rekening</strong>
            </span>
          </div>

          {/* Decision Tree Container */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-5 font-mono text-xs text-slate-800 space-y-4 overflow-x-auto">
            
            {/* Root Node */}
            <div className="flex items-center space-x-2 font-bold text-slate-900 bg-white px-3 py-1.5 rounded border border-slate-200 w-fit shadow-sm">
              <span>[ EVALUASI FASILITAS ]</span>
              <span className="text-slate-400">──►</span>
              <span className="text-blue-700">Apakah DPD &gt; 30?</span>
            </div>

            <div className="pl-6 space-y-4 border-l-2 border-slate-300 ml-4">
              
              {/* Branch DPD > 30 */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">├──</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded">[YA]</span>
                <span className="text-slate-400">──►</span>
                <span className="bg-red-100 text-red-700 border border-red-300 font-bold px-2.5 py-0.5 rounded">
                  SICR
                </span>
                <span className="text-[11px] text-slate-600 font-sans font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded">
                  ({diagramStats.dpdOver30} Fasilitas)
                </span>
              </div>

              {/* Branch DPD <= 30 / Pengecekan Tipe Akad */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">└──</span>
                  <span className="bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold px-2 py-0.5 rounded">[TIDAK]</span>
                  <span className="text-slate-400">──►</span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-sm">
                    Pengecekan Tipe Akad
                  </span>
                  <span className="text-[11px] text-slate-600 font-sans font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded">
                    ({diagramStats.dpdUnder30} Fasilitas)
                  </span>
                </div>

                {/* Sub-branches DILOOPING SECARA DINAMIS BERDASARKAN Jenis_Akad YANG ADA */}
                <div className="pl-12 space-y-4 border-l-2 border-slate-300 ml-4">
                  {diagramStats.akadList.length === 0 ? (
                    <div className="text-slate-400 text-xs italic font-sans py-1">
                      Tidak ada data jenis akad untuk DPD ≤ 30.
                    </div>
                  ) : (
                    diagramStats.akadList.map((item, index) => {
                      const isLast = index === diagramStats.akadList.length - 1;
                      return (
                        <div key={item.namaAkad} className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">{isLast ? "└──" : "├──"}</span>
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded uppercase">
                              [{item.namaAkad}]
                            </span>
                            <span className="text-[11px] text-slate-500 font-sans font-medium">
                              ({item.total} Rekening)
                            </span>
                            <span className="text-slate-400">──►</span>
                            <span className="text-slate-600 font-sans text-[11px]">
                              {item.keteranganEvaluasi}
                            </span>
                          </div>

                          <div className="pl-8 flex items-center space-x-4 text-[11px] pt-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400">├── [YA] ──►</span>
                              <span className="bg-red-50 text-red-600 border border-red-200 font-bold px-2 py-0.5 rounded">
                                SICR
                              </span>
                              <span className="font-sans font-bold text-slate-700">({item.sicr})</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-400">└── [TDK] ──►</span>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded">
                                STAGE 1
                              </span>
                              <span className="font-sans font-bold text-slate-700">({item.stage1})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ==================== CARD 4: TABEL DATA DETAIL ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden w-full">
          
          <div className="px-5 py-4 flex flex-wrap justify-between items-center border-b border-slate-200 bg-white">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                RINCIAN SIMULASI UNDER-PROVISIONING
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-300 rounded px-2 py-1 text-xs font-medium focus:outline-none bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>data</span>
              <span className="text-slate-400">|</span>
              <span>Total: {summary.totalFasilitas} Fasilitas</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse border-b border-slate-200">
              <thead>
                <tr className="bg-[#E2E8F0]/60 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px] tracking-wider divide-x divide-slate-200">
                  <th className="py-3.5 px-4">NO. FASILITAS</th>
                  <th className="py-3.5 px-4 text-left">AKAD</th>
                  <th className="py-3.5 px-3 text-center">DPD</th>
                  <th className="py-3.5 px-3 text-center">BUCKET DPD</th>
                  <th className="py-3.5 px-3 text-center">BUCKET SICR</th>
                  <th className="py-3.5 px-4 text-right">EAD (EXPOSURE)</th>
                  <th className="py-3.5 px-3 text-center">STAGE AS-IS</th>
                  <th className="py-3.5 px-3 text-center">STAGE TO-BE</th>
                  <th className="py-3.5 px-4 text-right">ECL AS-IS (DPD ONLY)</th>
                  <th className="py-3.5 px-4 text-right">ECL TO-BE (PSAK413)</th>
                  <th className="py-3.5 px-4 text-right">SELISIH ECL (UNDER-PROVISIONING)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-slate-400 font-medium">
                      Memuat data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-slate-400 font-medium">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  data.slice(0, pageSize).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-200">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.Nomor_rekening}</td>
                      <td className="py-3 px-4 text-left">{row.Jenis_Akad}</td>
                      <td className="py-3 px-3 text-center font-medium text-slate-800">
                        {row.DPD ?? 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {row.Bucket_DPD || "Bucket 1"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          {row.Bucket_SICR || "SICR_FLAG"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(row.Baki_Debet)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          STAGE_{row.StageOri}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          STAGE_{row.Stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(row.ECL_Berdasarkan_DPD)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(row.ECL_Berdasarkan_SICR)}</td>
                      <td className={`py-3 px-4 text-right font-black ${row.Selisih_ECL > 0 ? "text-red-600" : "text-slate-900"}`}>
                        {formatCurrency(row.Selisih_ECL)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CATATAN AUDIT SISTEM */}
          <div className="p-5 bg-white border-t border-slate-200 w-full">
            <div className="border-l-4 border-slate-700 bg-slate-100/80 p-4 rounded-r-lg space-y-2">
              <h4 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                CATATAN AUDIT SISTEM:
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                1. <span className="font-bold uppercase">VALUASI UNDER-PROVISIONING:</span> Sistem eksisting mengkalkulasi ECL berdasarkan probabilitas default 12-bulan (Stage 1) untuk fasilitas-fasilitas di atas. Namun, indikator kualitatif syariah (kinerja Mudharabah/progres Istishna) menunjukkan pemburukan signifikan (SICR).
              </p>
              <p className="text-[11px] text-slate-700 leading-relaxed flex items-center flex-wrap gap-1">
                2. <span className="font-bold uppercase">METODOLOGI & IMPLIKASI RISIKO:</span> Selisih ini mewakili risiko <span className="font-bold text-red-600">'ECL Shock'</span> yang harus segera dibukukan oleh bank jika temuan ini dieskalasi oleh KAP. Status evaluasi:{" "}
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300">
                  REQUIRES PROVISION ADJUSTMENT
                </span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}