import React from "react";
import { getDashboardDataAmortisasi } from "@/report/services/laporan-proyeksiamortasi-service/laporan-proyeksimortasi.service";
import { SummaryAmortisasiTable } from "@/report/component/laporan-proyeksiamortasi/SummaryAmortisasiTable";
import { DetailAmortisasiTable } from "@/report/component/laporan-proyeksiamortasi/DetailAmortisasiTable";
import NorekFilterForm from "@/report/component/laporan-proyeksiamortasi/NorekFilterForm";
import AmortisasiExportButton from "@/report/component/laporan-proyeksiamortasi/AmortisasiExportButton";
// 🔥 TAMBAHAN: Import komponen filter periode yang baru
import PeriodeFilterForm from "@/report/component/laporan-proyeksiamortasi/PeriodeFilterForm";

export const dynamic = "force-dynamic";

interface PageProps {
  // 🔥 PERBAIKAN: Tambahkan tglMulai dan tglSampai ke interface URL params
  searchParams: Promise<{
    norek?: string;
    tglMulai?: string;
    tglSampai?: string;
  }>;
}

export default async function LaporanAmortisasiPage({
  searchParams,
}: PageProps) {
  const resolvedParams = await searchParams;
  const noRekening = resolvedParams?.norek || "";
  const tglMulai = resolvedParams?.tglMulai || undefined;
  const tglSampai = resolvedParams?.tglSampai || undefined;

  let data: any = null;
  let errorMsg = null;

  try {
    // 🔥 PERBAIKAN: Kirim object berisi norek, tglMulai, dan tglSampai ke service
    data = await getDashboardDataAmortisasi({
      noRekening,
      tglMulai,
      tglSampai,
    });
  } catch (err: any) {
    errorMsg = err.message || "Gagal memuat data laporan Proyeksi Amortisasi.";
  }

  const safeSummary = data
    ? JSON.parse(JSON.stringify(data.summary || []))
    : [];
  const safeDetails = data
    ? JSON.parse(JSON.stringify(data.details || []))
    : [];

  return (
    <main className="min-h-screen bg-slate-100 py-6 px-2 sm:px-4 font-sans w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="w-full max-w-full min-w-0 space-y-6">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-300 p-4 rounded-none text-rose-800 font-bold shadow-sm">
            {errorMsg}
          </div>
        )}

        {data && (
          <div className="bg-white border border-slate-300 rounded-none shadow-md p-6 sm:p-10 lg:p-12 space-y-8 text-slate-800 w-full max-w-full min-w-0">
            {/* KOP LAPORAN & FILTER */}
            <div className="border-b border-slate-200 pb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                {data.refBanks && data.refBanks.length > 0
                  ? data.refBanks[0].keterangan
                  : "PT BANK SYARIAH XYZ"}
              </h1>
              <h2 className="text-sm sm:text-base font-bold text-slate-700 uppercase mt-1">
                {data.meta.reportTitle}
              </h2>

              <div className="mt-6 bg-slate-50 border border-slate-300 p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* 🔥 PERBAIKAN: Ganti Input Read-Only dengan Komponen Filter Periode */}
                <div className="flex flex-col text-left w-full sm:w-auto">
                  <PeriodeFilterForm
                    defaultTglMulai={data.meta.tglMulai}
                    defaultTglSampai={data.meta.tglSampai}
                    theme={data.meta.theme}
                  />
                </div>

                {/* Tombol Export didorong ke kanan agar rapi */}
                <div className="w-full sm:w-auto flex justify-end">
                  <AmortisasiExportButton theme={data.meta.theme} />
                </div>
              </div>
            </div>

            {/* SECTION 1: RINGKASAN AGREGAT PROYEKSI EAD */}
            <section className="space-y-3 w-full max-w-full min-w-0">
              <div className="bg-slate-100 border-l-4 border-blue-600 px-4 py-2.5 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Ringkasan Proyeksi EAD (Baki Debet Pokok) Per Segmen & Stage
                </h3>
              </div>
              <SummaryAmortisasiTable data={safeSummary} />
            </section>

            {/* SECTION 2: DETAIL CONTOH JADWAL AMORTISASI */}
            <section className="space-y-3 w-full max-w-full min-w-0 pt-4">
              <div className="bg-slate-100 border-l-4 border-blue-600 px-4 py-2.5 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Detail Proyeksi Penurunan Pokok Per Fasilitas{" "}
                  {noRekening ? `(No Rek: ${noRekening})` : ""}
                </h3>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Audit Trail Schedule Sample
                </span>
              </div>

              {/* Form Filter No Rekening */}
              <div className="mt-6 bg-slate-50 border border-slate-300 p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto text-left">
                  {/* Komponen NorekFilterForm asli (tanpa perlu diedit) */}
                  <NorekFilterForm />
                </div>
              </div>

              <DetailAmortisasiTable data={safeDetails} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
