"use client";

import { DashboardEfisiensiResponse } from "@/modul-dashboard/services/Dashboard-EfisiensiCKPN/Dashboard-EfisiensiCKPN.service";
import React from "react";

interface Props {
  data?: DashboardEfisiensiResponse;
  currentCureRateSlider: number; // Nilai cure rate (%) dari slider (contoh: 12.43)
  currentEksposurSlider: number; // Nilai eksposur (Miliar) dari slider
}

export default function FinancialImpactReportTable({
  data,
  currentCureRateSlider,
  currentEksposurSlider,
}: Props) {
  // 1. EAD Netto dalam Rupiah Utuh (Miliar -> Rupiah)
  const eadNetto = (currentEksposurSlider || 0) * 1_000_000_000;

  // 2. Skenario A: Regulatory Baseline (LGD Statis Fixed 75%)
  const lgdStatisRate = 0.75;
  const pdStage3 = 1.0; // 100%
  const ckpnSkenarioA = eadNetto * pdStage3 * lgdStatisRate;

  // 3. Skenario B: Dynamic LGD (Sesuai Formula Matriks: LGD = 1 - (Cure Rate + Collateral 20%))
  const collateralFixed = 0.20; // 20% Fixed Collateral
  const cureRateRatio = Math.min(Math.max(currentCureRateSlider || 0, 0), 100) / 100;

  // Total Recovery Ratio = Cure Rate + Collateral Rec
  const totalRecoveryRatio = cureRateRatio + collateralFixed;

  // LGD Dynamic Rate = 1 - Total Recovery (Batas minimal 0%)
  const lgdDynamicRate = Math.max(0, 1 - totalRecoveryRatio);
  const ckpnSkenarioB = eadNetto * pdStage3 * lgdDynamicRate;

  // 4. Selisih Finansial & Savings
  const selisihLgdRate = (lgdDynamicRate - lgdStatisRate) * 100; // nilai minus = efisien
  const selisihCkpn = ckpnSkenarioB - ckpnSkenarioA; // minus = CKPN berkurang (membaik)
  const ckpnSavings = Math.max(0, ckpnSkenarioA - ckpnSkenarioB);

  // Helper Format Rupiah Tanpa Desimal
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    // Samakan outer wrapper dengan komponen kiri (tanpa bg-white/border/shadow berulang)
    <div className="flex flex-col justify-between h-full w-full">
      <div>
        {/* Header disesuaikan sejajar dengan sebelah kiri */}
        <div className="border-l-4 border-[#5A125A] pl-3 py-0.5 mb-6">
          <h3 className="text-base font-bold text-gray-900 leading-tight uppercase tracking-wide">
            Komparasi Dampak Finansial (LGD Statis vs Dynamic)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Analisis efisiensi pencadangan berdasarkan perbandingan skenario LGD
          </p>
        </div>

        {/* Tabel Financial Impact Report */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs text-left text-gray-700 border-collapse">
            <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 border-r border-slate-200 w-1/4">
                  Metrik Financial (Agregat)
                </th>
                <th className="p-3 border-r border-slate-200">
                  Skenario A: LGD Statis <br />
                  <span className="text-[10px] font-normal text-gray-500">
                    (Regulatory Baseline)
                  </span>
                </th>
                <th className="p-3 border-r border-slate-200">
                  Skenario B: Dynamic LGD <br />
                  <span className="text-[10px] font-normal text-gray-500">
                    (Sharia Compliance)
                  </span>
                </th>
                <th className="p-3 border-r border-slate-200">
                  Selisih Finansial <br />
                  <span className="text-[10px] font-normal text-gray-500">
                    (Efficiency)
                  </span>
                </th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-slate-800">
              {/* Row 1: EAD Netto */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                  Eksposur Macet Stage 2 (EAD Netto)
                </td>
                <td className="p-3 border-r border-slate-200">{formatRupiah(eadNetto)}</td>
                <td className="p-3 border-r border-slate-200">{formatRupiah(eadNetto)}</td>
                <td className="p-3 border-r border-slate-200 text-gray-500">Rp 0</td>
                <td className="p-3 text-center font-medium text-gray-600">Tetap</td>
              </tr>

              {/* Row 2: PD Stage 3 */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                  PD (Stage 2)
                </td>
                <td className="p-3 border-r border-slate-200">100%</td>
                <td className="p-3 border-r border-slate-200">100%</td>
                <td className="p-3 border-r border-slate-200 text-gray-500">0%</td>
                <td className="p-3 text-center font-medium text-gray-600">Tetap</td>
              </tr>

              {/* Row 3: LGD Rate Applied */}
              <tr className="hover:bg-slate-50/60 transition font-semibold">
                <td className="p-3 text-slate-900 border-r border-slate-200">
                  LGD Rate Applied
                </td>
                <td className="p-3 border-r border-slate-200">
                  75.00% <span className="font-normal text-gray-400">(Fixed)</span>
                </td>
                <td className="p-3 border-r border-slate-200 text-slate-900">
                  {(lgdDynamicRate * 100).toFixed(2)}%{" "}
                  <span className="text-emerald-600 text-[10px] font-normal">
                    ▼ (Suplai Data Cure Rate)
                  </span>
                </td>
                <td className="p-3 border-r border-slate-200 text-emerald-600 font-bold">
                  {selisihLgdRate.toFixed(2)}% ▼▼
                </td>
                <td className="p-3 text-center font-bold text-emerald-600 bg-emerald-50/50">
                  Efisien
                </td>
              </tr>

              {/* Row 4: Total CKPN Dibentuk */}
              <tr className="hover:bg-slate-50/60 transition font-semibold">
                <td className="p-3 text-slate-900 border-r border-slate-200">
                  Total CKPN Dibentuk (ECL)
                </td>
                <td className="p-3 border-r border-slate-200">{formatRupiah(ckpnSkenarioA)}</td>
                <td className="p-3 border-r border-slate-200 text-emerald-700 font-bold">
                  {formatRupiah(ckpnSkenarioB)} ▼
                </td>
                <td className="p-3 border-r border-slate-200 text-emerald-600 font-bold">
                  {formatRupiah(selisihCkpn)}
                </td>
                <td className="p-3 text-center font-bold text-blue-600 bg-blue-50/50">
                  Membaik
                </td>
              </tr>

              {/* Row 5: Total CKPN Savings */}
              <tr className="hover:bg-slate-50/60 transition font-bold bg-emerald-50/20">
                <td className="p-3 text-slate-900 border-r border-slate-200">
                  Total CKPN Savings <br />
                  <span className="font-normal text-[10px] text-gray-500">
                    (Laba Operasional Selamat)
                  </span>
                </td>
                <td className="p-3 border-r border-slate-200 text-gray-400">Rp 0</td>
                <td className="p-3 border-r border-slate-200 text-emerald-700 font-extrabold text-sm">
                  {formatRupiah(ckpnSavings)} ▲
                </td>
                <td className="p-3 border-r border-slate-200 text-emerald-600">
                  + {formatRupiah(ckpnSavings)} ▲▲
                </td>
                <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-100/70">
                  Optimal
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}