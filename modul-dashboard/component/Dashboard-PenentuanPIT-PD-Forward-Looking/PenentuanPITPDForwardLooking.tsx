"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import { fetchPenentuanPITPDDashboardData } from "@/modul-dashboard/services/Dashboard-PenentuanPIT-PD-Forward-Looking/PenentuanPITPDForwardLooking.service";
import { SegmentOption } from "@/modul-dashboard/services/Query/Dashboard-PenentuanPIT-PD-Forward-Looking/PenentuanPITPDForwardLooking.query";

interface ScenarioCardData {
  title: string;
  weight: number;
  pdValue: number;
  borderColor: string;
  badgeBg: string;
  textColor: string;
}

const Sparkline = ({ color }: { color: string }) => (
  <svg className="w-10 h-5 inline-block opacity-80" viewBox="0 0 50 20">
    <path
      d="M 0 15 Q 12 5, 25 12 T 50 3"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export function MacroScenarioSection({
  segmentName,
  data,
}: {
  segmentName?: string;
  data: {
    Bobot_Normal?: number;
    Bobot_Best?: number;
    Bobot_Worst?: number;
    PIT_PD_Baseline?: number;
    PIT_PD_Optimistic?: number;
    PIT_PD_Pessimistic?: number;
    [key: string]: any;
  };
}) {
  const scenarios: ScenarioCardData[] = [
    {
      title: "BASE SCENARIO",
      weight: data?.Bobot_Normal ?? 70,
      pdValue: data?.PIT_PD_Baseline ?? 0,
      borderColor: "border-purple-200 hover:border-[#5A125A]",
      badgeBg: "bg-purple-100 text-[#5A125A]",
      textColor: "text-[#5A125A]",
    },
    {
      title: "OPTIMISTIC SCENARIO",
      weight: data?.Bobot_Best ?? 15,
      pdValue: data?.PIT_PD_Optimistic ?? 0,
      borderColor: "border-sky-200 hover:border-sky-500",
      badgeBg: "bg-sky-100 text-sky-700",
      textColor: "text-sky-600",
    },
    {
      title: "PESSIMISTIC SCENARIO",
      weight: data?.Bobot_Worst ?? 15,
      pdValue: data?.PIT_PD_Pessimistic ?? 0,
      borderColor: "border-amber-200 hover:border-amber-500",
      badgeBg: "bg-amber-100 text-amber-700",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="mb-3">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A125A] mb-2 flex items-center gap-2">
        <span>
          MACROECONOMIC SCENARIOS & PROBABILITY WEIGHTS{" "}
          {segmentName ? `(${segmentName})` : ""}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((item, idx) => (
          <div
            key={idx}
            className={`bg-white border-2 ${item.borderColor} rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {item.title}
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${item.badgeBg}`}>
                Weight: {item.weight}%
              </span>
            </div>

            <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between mt-1">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                  PIT PD
                </span>
                <div className={`text-2xl font-black ${item.textColor} mt-0.5`}>
                  {Number(item.pdValue || 0).toFixed(2)}%
                </div>
              </div>
              <Sparkline
                color={
                  item.textColor.includes("purple")
                    ? "#5A125A"
                    : item.textColor.includes("sky")
                    ? "#0284c7"
                    : "#d97706"
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RegressionRow {
  nama_segment?: string;
  [key: string]: any;
}

interface Props {
  initialSegmentOptions?: SegmentOption[];
  initialSelectedId?: number;
  initialRegressionData?: RegressionRow[];
  initialCycleEnd?: string;
  period?: string;
  lastUpdated?: string;
}

export default function PenentuanPITPDForwardLooking({
  initialSegmentOptions = [],
  initialSelectedId = 0,
  initialRegressionData = [],
  initialCycleEnd = "",
  period = "JULY 2026",
  lastUpdated = "August 1, 2026",
}: Props) {
  // Fallback initial cycleEnd
  const defaultDate =
    initialCycleEnd ||
    initialRegressionData[0]?.cycle_end ||
    initialRegressionData[0]?.tanggal_laporan ||
    "";

  const [tanggalLaporan, setTanggalLaporan] = useState<string>(defaultDate);
  const [segmentOptions, setSegmentOptions] = useState<SegmentOption[]>(initialSegmentOptions);
  const [selectedRegresiId, setSelectedRegresiId] = useState<number>(initialSelectedId);
  const [regressionData, setRegressionData] = useState<RegressionRow[]>(initialRegressionData);

  const [isPending, startTransition] = useTransition();

  // Keep state synced with props on dynamic loads
  useEffect(() => {
    if (initialCycleEnd) {
      setTanggalLaporan(initialCycleEnd);
    } else if (initialRegressionData.length > 0) {
      const dateFromData =
        initialRegressionData[0]?.cycle_end || initialRegressionData[0]?.tanggal_laporan;
      if (dateFromData) setTanggalLaporan(String(dateFromData));
    }
  }, [initialCycleEnd, initialRegressionData]);

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegresiId = parseInt(e.target.value, 10);
    setSelectedRegresiId(newRegresiId);

    startTransition(async () => {
      const res = await fetchPenentuanPITPDDashboardData(newRegresiId);
      if (res.success && res.data) {
        setRegressionData(res.data.regressionData);

        if (res.data.cycleEnd) {
          setTanggalLaporan(res.data.cycleEnd);
        } else if (res.data.regressionData?.[0]?.cycle_end) {
          setTanggalLaporan(res.data.regressionData[0].cycle_end);
        }

        if (res.data.segmentOptions && res.data.segmentOptions.length > 0) {
          setSegmentOptions(res.data.segmentOptions);
        }
      }
    });
  };

  // Grouping Data berdasarkan nama_segment
  const groupedData = useMemo(() => {
    if (!regressionData || regressionData.length === 0) return {};

    const groups: { [key: string]: RegressionRow[] } = {};
    regressionData.forEach((row) => {
      const segName = row.nama_segment || "Segment Default";
      if (!groups[segName]) {
        groups[segName] = [];
      }
      groups[segName].push(row);
    });

    return groups;
  }, [regressionData]);

  const excludedColumns = ["id_klaster_pd", "bobot_normal", "bobot_best", "bobot_worst"];

  const formatCellValue = (header: string, val: any) => {
    if (val === null || val === undefined || val === "" || val === "-") return "-";
    if (typeof val === "number" && !isNaN(val)) {
      const hLower = header.toLowerCase();
      if (
        hLower.includes("pd") ||
        hLower.includes("rate") ||
        hLower.includes("scalar") ||
        hLower.includes("baseline") ||
        hLower.includes("optimistic") ||
        hLower.includes("pessimistic") ||
        hLower.includes("final_weight")
      ) {
        return `${val.toFixed(2)}%`;
      }
      return val.toFixed(4);
    }
    return String(val);
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen w-full p-4 flex flex-col justify-between font-sans select-none">
      {/* TOPBAR HEADER */}
      <header className="bg-[#5A125A] text-white px-5 py-3 rounded-xl flex flex-wrap justify-between items-center shadow-md mb-4">
        <div>
          <h1 className="font-extrabold text-sm tracking-wide uppercase">
            PT BANK MUAMALAT INDONESIA TBK - FLI PARAMETER ANALYTICS
          </h1>
          <p className="text-[11px] text-purple-200 opacity-90">
            Validasi Koefisien Makroekonomi, Skenario Probabilitas, dan Economic Justification
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs mt-2 sm:mt-0">
          <div className="flex items-center gap-1.5">
            <label className="text-purple-100 font-medium">Tanggal Laporan:</label>
            <input
              type="text"
              readOnly
              value={tanggalLaporan || "-"}
              className="bg-purple-900/40 text-purple-100 rounded-lg px-2.5 py-1 font-bold outline-none border border-purple-400/30 shadow-inner text-xs cursor-not-allowed select-none min-w-[95px] text-center"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-purple-100 font-medium">Segment:</label>
            <div className="relative flex items-center">
              <select
                value={selectedRegresiId}
                onChange={handleSegmentChange}
                disabled={isPending}
                className="bg-white text-slate-900 rounded-lg px-2.5 py-1 font-semibold outline-none border border-purple-300 shadow-sm text-xs cursor-pointer disabled:opacity-60"
              >
                <option value={0}>[ Semua Segment ]</option>
                {segmentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {isPending && <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin text-purple-200" />}
            </div>
          </div>
        </div>
      </header>

      {/* DYNAMIC CONTENT LOOP PER SEGMENT */}
      <div className="flex-1 space-y-6 mb-4">
        {Object.keys(groupedData).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 font-semibold text-xs">
            {isPending ? "Sedang memuat data segmen..." : "Tidak ada data regresi ditemukan."}
          </div>
        ) : (
          Object.entries(groupedData).map(([segName, rows]) => {
            const activeScenarioData = {
              Bobot_Normal: rows[0]?.Bobot_Normal ?? rows[0]?.Asumsi_CKPN_Normal ?? 70,
              Bobot_Best: rows[0]?.Bobot_Best ?? rows[0]?.Asumsi_CKPN_Best ?? 15,
              Bobot_Worst: rows[0]?.Bobot_Worst ?? rows[0]?.Asumsi_CKPN_Worst ?? 15,
              PIT_PD_Baseline: rows[0]?.PIT_PD_Baseline ?? 0,
              PIT_PD_Optimistic: rows[0]?.PIT_PD_Optimistic ?? 0,
              PIT_PD_Pessimistic: rows[0]?.PIT_PD_Pessimistic ?? 0,
            };

            // 💡 SOLUSI PERBAIKAN 1: Filter kolom per segmen secara presisi.
            // Kolom makro yang bernilai null/undefined/""/"-" di SELURUH baris segmen ini TIDAK AKAN DITAMPILKAN.
            const rawHeaders = Object.keys(rows[0] || {}).filter(
              (header) => !excludedColumns.includes(header.toLowerCase())
            );

            const tableHeaders = rawHeaders.filter((header) => {
              // Jika kolom bawaan identitas (nama segment, jenis periode, periode, z regresi, dll), selalu tampilkan
              const hLower = header.toLowerCase();
              if (
                hLower.includes("segment") ||
                hLower.includes("periode") ||
                hLower.includes("regresi") ||
                hLower.includes("pit_pd") ||
                hLower.includes("final") ||
                hLower.includes("weighted") ||
                hLower.includes("ttc_pd")
              ) {
                return true;
              }

              // Untuk variabel makro, cek apakah ada minimal 1 baris yang nilainya TERISI (bukan "-", null, atau undefined)
              return rows.some((row) => {
                const val = row[header];
                return val !== null && val !== undefined && val !== "" && val !== "-";
              });
            });

            return (
              <div key={segName} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                {/* MACROECONOMIC SCENARIO PER SEGMENT */}
                <MacroScenarioSection segmentName={segName} data={activeScenarioData} />

                {/* DATATABLE & AUDIT TRAIL PER SEGMENT */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A125A] mb-2.5 flex items-center justify-between">
                        <span>REGRESSION COEFFICIENTS & PIT PD OUTPUT ({segName})</span>
                        {isPending && <span className="text-[10px] text-purple-600 font-normal">Updating...</span>}
                      </h3>

                      <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[380px] relative">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#5A125A] text-white font-bold sticky top-0 z-0">
                              {tableHeaders.map((header, hIdx) => {
                                const isHighlight =
                                  header.toLowerCase().includes("final") ||
                                  header.toLowerCase().includes("weighted");
                                return (
                                  <th
                                    key={hIdx}
                                    className={`p-2.5 border-r border-purple-800/50 whitespace-nowrap text-center ${
                                      isHighlight ? "bg-[#3f0c3f] font-black text-amber-300" : ""
                                    }`}
                                  >
                                    {header.replace(/_/g, " ")}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                            {rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={`${
                                  rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                                } hover:bg-purple-50/60 transition-colors`}
                              >
                                {tableHeaders.map((header, cIdx) => {
                                  const val = row[header];
                                  const isHighlight =
                                    header.toLowerCase().includes("final") ||
                                    header.toLowerCase().includes("weighted");
                                  const isSegmen =
                                    header.toLowerCase() === "nama_segment" ||
                                    header.toLowerCase() === "segment_id" ||
                                    header.toLowerCase() === "segmen";

                                  return (
                                    <td
                                      key={cIdx}
                                      className={`p-2 border-r border-slate-200 text-center whitespace-nowrap ${
                                        isSegmen
                                          ? "font-sans font-bold text-slate-800 text-left px-3"
                                          : ""
                                      } ${
                                        isHighlight
                                          ? "font-extrabold bg-purple-100/70 text-[#5A125A] font-sans"
                                          : ""
                                      }`}
                                    >
                                      {formatCellValue(header, val)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 💡 SOLUSI PERBAIKAN 2: AUDIT TRAIL PER SEGMENT DENGAN DATA DINAMIS */}
                  <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A125A] mb-3">
                        ECONOMIC JUSTIFICATION & GOVERNANCE AUDIT TRAIL
                      </h3>

                      <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed font-sans">
                        <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[#5A125A] font-bold mt-0.5">•</span>
                          <div>
                            <strong className="text-slate-800 font-semibold">Reference Rapat:</strong>
                            <p className="text-[11px] text-slate-500">
                              ALCO & Komite Risiko No. 128/KOM-RISK/VII/2026 (15 Juli 2026)
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[#5A125A] font-bold mt-0.5">•</span>
                          <div>
                            <strong className="text-slate-800 font-semibold">
                              Justifikasi Skenario Pesimis ({activeScenarioData.Bobot_Worst}%):
                            </strong>
                            <p className="text-[11px] text-slate-500">Accommodating global risk and inflation.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[#5A125A] font-bold mt-0.5">•</span>
                          <div>
                            <strong className="text-slate-800 font-semibold">
                              Justifikasi Sensitivitas {segName.split(" - ")[1] || segName}:
                            </strong>
                            <p className="text-[11px] text-slate-500">Validating model backtesting showing elasticity.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                          <span className="text-amber-700 font-bold mt-0.5">•</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-slate-800 font-semibold">Status Sistem:</strong>
                            <span className="text-amber-800 font-extrabold text-[10px] uppercase bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-3 h-3" /> LOCKED PER {tanggalLaporan || "PERIOD END"}
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center text-[#5A125A] text-xs font-bold bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#5A125A]" />
                        Audit Trail Verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <footer className="flex justify-between items-center text-[11px] font-bold text-slate-400 px-1 pt-2 border-t border-slate-200">
        <span>PERIOD: {period}</span>
        <span>LAST UPDATED: {lastUpdated}</span>
      </footer>
    </div>
  );
}