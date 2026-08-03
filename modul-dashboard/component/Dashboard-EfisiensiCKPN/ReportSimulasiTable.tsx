"use client";

import React from "react";

export interface ReportSimulasiRow {
  periodeData: string;
  segmenAkad: string;
  eadNetto: number; // (A) Miliar
  cureRatePD: number; // (B) Desimal
  collateralRec: number; // (C) Desimal Fixed
  statusPerubahan: "Baseline" | "Efisiensi" | "Optimal";
}

interface Props {
  data: ReportSimulasiRow[];
  currentCureRateSlider: number; // Injeksi dari slider UI dashboard (%)
}

export default function ReportSimulasiTable({
  data,
  currentCureRateSlider,
}: Props) {
  return (
    // Outer Container: Flex column & Height 100% mengisi parent card
    <div className="flex flex-col justify-between h-full w-full">
      {/* SECTION ATAS: Judul & Tabel Data */}
      <div>
        {/* Header disesuaikan (text-base & proporsional) */}
        <div className="border-l-4 border-[#5A125A] pl-3 py-0.5 mb-6">
          <h3 className="text-base font-bold text-gray-900 leading-tight uppercase tracking-wide">
            MATRIKS RECOVERY & LGD RATE
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Rincian perhitungan tingkat pemulihan dan LGD rate per segmen
          </p>
        </div>

        {/* Wrapper Tabel dengan max-height agar tidak melimpah jika data banyak */}
        <div className="overflow-x-auto overflow-y-auto max-h-[320px] rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-gray-600 font-semibold sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="p-2.5">Periode Data</th>
                <th className="p-2.5">Segmen</th>
                <th className="p-2.5">EAD Netto (Rp) (A)</th>
                <th className="p-2.5 text-blue-600">
                  PD Source: Cure Rate (B)
                </th>
                <th className="p-2.5">LGD Source: Collateral Rec (C)</th>
                <th className="p-2.5 text-emerald-600">
                  Total Recovery (Rp) (D) = A * (B+C)
                </th>
                <th className="p-2.5">LGD Rate (%) (E) = 1 - (D/A)</th>
                <th className="p-2.5 text-center">Status Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium bg-white">
              {data && data.length > 0 ? (
                data.map((row, idx) => {
                  // Dynamic Injeksi Cure Rate dari Slider (%)
                  const cureRatePct = currentCureRateSlider;
                  const cureRateRatio = cureRatePct / 100;

                  // Fixed Collateral Recovery (C) misal 0.20 (20%)
                  const collateralRatio = row.collateralRec || 0.2;

                  // Total Recovery Ratio = B + C
                  const totalRecoveryRatio = cureRateRatio + collateralRatio;

                  // Total Recovery (Rp) (D) = A * (B + C)
                  const totalRecoveryRp = row.eadNetto * totalRecoveryRatio;

                  // LGD Rate (%) (E) = (1 - Total Recovery Ratio) * 100
                  const lgdRatePct = Math.max(
                    0,
                    (1 - totalRecoveryRatio) * 100,
                  );

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-2.5 whitespace-nowrap">
                        {row.periodeData}
                      </td>
                      <td className="p-2.5 font-bold whitespace-nowrap">
                        {row.segmenAkad}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        Rp {row.eadNetto.toLocaleString("id-ID")} M
                      </td>
                      <td className="p-2.5 text-blue-600 font-bold whitespace-nowrap">
                        {cureRatePct.toFixed(2)}%
                      </td>
                      <td className="p-2.5 text-gray-500 whitespace-nowrap">
                        {(collateralRatio * 100).toFixed(0)}% (Fixed)
                      </td>
                      <td className="p-2.5 text-emerald-600 font-bold whitespace-nowrap">
                        Rp{" "}
                        {totalRecoveryRp.toLocaleString("id-ID", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        M
                      </td>
                      <td className="p-2.5 font-extrabold whitespace-nowrap text-gray-900">
                        {lgdRatePct.toFixed(2)}%
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-block ${
                            row.statusPerubahan === "Optimal"
                              ? "bg-emerald-100 text-emerald-700"
                              : row.statusPerubahan === "Efisiensi"
                                ? "bg-blue-100 text-[#5A125A]"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {row.statusPerubahan || "Efisiensi"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-gray-400 italic"
                  >
                    Data simulasi tidak tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION BAWAH: Catatan Audit Sistem */}
      <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-gray-200/60 text-[11px] text-gray-600 space-y-1">
        <p className="font-bold text-gray-800 uppercase tracking-tight">
          CATATAN AUDIT SISTEM:
        </p>
        <p>
          1. <span className="font-semibold">FORMULA RECOVERY:</span> Total
          Recovery dihitung dari akumulasi Recovery Injeksi Cure Rate (B) +
          Jaminan Collateral (C). Status kalkulasi:{" "}
          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[9px]">
            UNLOCKED & VALID
          </span>
        </p>
        <p>
          2. <span className="font-semibold">METODOLOGI LGD RATE:</span> Nilai
          LGD Rate berbanding terbalik terhadap peningkatan Injeksi Cure Rate.
        </p>
      </div>
    </div>
  );
}