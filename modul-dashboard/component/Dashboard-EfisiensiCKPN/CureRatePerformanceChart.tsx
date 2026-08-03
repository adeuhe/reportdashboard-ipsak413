"use client";

import React, { useState } from "react";

interface Props {
  data?: any[];
}

export default function CureRatePerformanceChart({ data = [] }: Props) {
  const [filterType, setFilterType] = useState<"cureRate" | "totalEad">("cureRate");

  // Extractor penolong agar fleksibel terhadap nama kolom dari DB (PascalCase / snake_case)
  const getCureRate = (item: any) =>
    item?.Cure_Rate_avg ?? item?.cure_rate_avg ?? item?.CureRateAvg ?? 0;

  const getBakiDebet = (item: any) =>
    item?.Baki_Debet ?? item?.baki_debet ?? item?.BakiDebet ?? 0;

  const getJenisAkad = (item: any) =>
    item?.Jenis_Akad ?? item?.jenis_akad ?? item?.JenisAkad ?? "N/A";

  const getTanggal = (item: any) =>
    item?.Tanggal_Laporan ?? item?.tanggal_laporan ?? "Terbaru";

  // Perhitungan Summary
  const totalEadMacet = data.reduce((acc, curr) => acc + getBakiDebet(curr), 0);
  const avgCureRate = data.length
    ? (data.reduce((acc, curr) => acc + getCureRate(curr), 0) / data.length) * 100
    : 0;

  const sortedByRate = [...data].sort((a, b) => getCureRate(b) - getCureRate(a));
  const topPerformer = sortedByRate.length > 0 ? getJenisAkad(sortedByRate[0]) : "-";

  // Sorting Chart
  const sortedData = [...data].sort((a, b) => {
    if (filterType === "cureRate") {
      return getCureRate(b) - getCureRate(a);
    } else {
      return getBakiDebet(b) - getBakiDebet(a);
    }
  });

  const maxVal = Math.max(
    ...sortedData.map((d) =>
      filterType === "cureRate"
        ? getCureRate(d) * 100
        : getBakiDebet(d) / 1_000_000_000
    ),
    1
  );

return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm w-full h-full flex flex-col justify-between">
      <div>
        {/* TOP HEADER & SUMMARY METRICS */}
        <div className="flex justify-between items-center mb-6">
          {/* Judul dengan Garis Aksen Ungu di Kiri */}
          <div className="border-l-4 border-[#5A125A] pl-3 py-0.5">
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Executive Dashboard: Cure Rate Performance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Dashboard dimuat: Data posisi{" "}
              <span className="font-semibold text-gray-700">
                {data.length > 0 ? getTanggal(data[0]) : "Terbaru"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="block text-[10px] text-gray-400 font-medium uppercase">
                Rata-Rata Cure Rate
              </span>
              <span className="text-sm font-bold text-gray-900">
                {avgCureRate.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-medium uppercase">
                Total EAD Macet
              </span>
              <span className="text-sm font-bold text-gray-900">
                Rp{" "}
                {(totalEadMacet / 1_000_000_000).toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}{" "}
                Miliar
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-medium uppercase">
                Top Performer
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {topPerformer}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN BAR CHART CONTAINER */}
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-gray-800">
              Peringkat Kinerja Kesembuhan Penagihan Berdasarkan Akad (
              {filterType === "cureRate" ? "Cure Rate" : "Total EAD"})
            </h3>
            <p className="text-[11px] text-gray-500">
              {filterType === "cureRate"
                ? "Persentase keberhasilan transisi Stage 2 ke Stage 1"
                : "Total besaran eksposur macet (EAD Netto) per Akad"}
            </p>
          </div>

          <div className="space-y-3.5 mt-2">
            {sortedData.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                Tidak ada data performa Cure Rate
              </div>
            ) : (
              sortedData.map((item, index) => {
                const cureRateVal = getCureRate(item) * 100;
                const eadVal = getBakiDebet(item) / 1_000_000_000;

                const valNum =
                  filterType === "cureRate" ? cureRateVal : eadVal;
                const valLabel =
                  filterType === "cureRate"
                    ? `${valNum.toFixed(1)}%`
                    : `Rp ${valNum.toFixed(0)} M`;

                const barWidthPercent = Math.min((valNum / maxVal) * 100, 100);
                const isTop = index === 0;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-xs font-semibold"
                  >
                    <span className="w-32 text-gray-700 truncate">
                      {getJenisAkad(item)}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative flex items-center">
                      <div
                        className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${
                          isTop ? "bg-[#5A125A]" : "bg-[#7A1D7A]"
                        }`}
                        style={{ width: `${Math.max(barWidthPercent, 2)}%` }}
                      >
                        {barWidthPercent > 20 && (
                          <span className="text-white text-[11px] font-bold">
                            {valLabel}
                          </span>
                        )}
                      </div>
                      {barWidthPercent <= 20 && (
                        <span className="ml-2 text-xs font-bold text-gray-800">
                          {valLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="flex justify-between items-center mt-6 pt-2">
        <span className="text-xs text-gray-500 font-medium">
          Urutkan Berdasarkan
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType("cureRate")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === "cureRate"
                ? "bg-purple-50 text-[#5A125A] border border-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Cure Rate
          </button>
          <button
            onClick={() => setFilterType("totalEad")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterType === "totalEad"
                ? "bg-purple-50 text-[#5A125A] border border-purple-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Total EAD
          </button>
        </div>
      </div>
    </div>
  );
}