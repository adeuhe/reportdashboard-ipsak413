"use client";

import { useState } from "react";
import Pyramid from "./Pyramid";

interface Stage {
  stage: string;
  eclCurrent: number;
  eclPrevious: number;
  eclDiff: number;
  eclDiffPercent: number;
}

interface Props {
  title: string;
  stages: Stage[];
  notes?: string[];
}

function formatRupiah(value: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `Rp ${sign}${(abs / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })} M`;
  }

  if (abs >= 1_000_000) {
    return `Rp ${sign}${(abs / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })} Jt`;
  }

  return `Rp ${sign}${abs.toLocaleString("id-ID")}`;
}

function formatRupiah2(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function StagingMigration({ title, stages, notes }: Props) {
  const [openDetail, setOpenDetail] = useState(false);

  // Stage tertinggi dan terendah
  const stageTerendah = stages.reduce(
    (min, s) => (s.eclCurrent < min.eclCurrent ? s : min),
    stages[0],
  );
  const stageTertinggi = stages.reduce(
    (max, s) => (s.eclCurrent > max.eclCurrent ? s : max),
    stages[0],
  );

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex-1 min-w-0">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">{title}</div>
        <button
          onClick={() => setOpenDetail(true)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 bg-white shadow-sm hover:bg-slate-50"
        >
          Detail
        </button>
      </div>

      {/* PYRAMID */}
      <Pyramid
        levels={stages.map((s) => ({
          name: `Stage ${s.stage}`,
          value: s.eclDiff, // tetap number biar proporsional
          label: formatRupiah(s.eclDiff), // ini akan tampil di label/tooltip
        }))}
      />

      {/* Notes / Summary utama */}
      <div className="mt-3 grid grid-cols-1 gap-y-1 text-xs text-slate-500">
        {/* Summary Stage Terendah / Tertinggi */}
        <div className="flex items-start gap-1">
          <span className="text-slate-400">•</span>
          <span>
            Stage Terendah: {stageTerendah.stage} -{" "}
            {formatRupiah(stageTerendah.eclCurrent)}
          </span>
        </div>
        <div className="flex items-start gap-1">
          <span className="text-slate-400">•</span>
          <span>
            Stage Tertinggi: {stageTertinggi.stage} -{" "}
            {formatRupiah(stageTertinggi.eclCurrent)}
          </span>
        </div>

        {/* Detail setiap stage */}
        {stages.map((s) => (
          <div key={s.stage}>
            Stage {s.stage}: {formatRupiah(s.eclCurrent)} (Sebelumnya:{" "}
            {formatRupiah(s.eclPrevious)}, Selisih: {formatRupiah(s.eclDiff)} /{" "}
            {s.eclDiffPercent.toFixed(2)}%)
          </div>
        ))}
      </div>

      {/* Modal Detail */}
      {openDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[700px] max-h-[80vh] overflow-auto rounded-2xl bg-white shadow-xl">
            {/* HEADER MODAL */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-slate-800">
                Detail {title}
              </div>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* TABLE */}
            <div className="p-4">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Stage</th>
                    <th className="px-3 py-2 text-right">ECL Current</th>
                    <th className="px-3 py-2 text-right">ECL Previous</th>
                    <th className="px-3 py-2 text-right">Selisih</th>
                    <th className="px-3 py-2 text-right">Selisih %</th>
                  </tr>
                </thead>

                <tbody>
                  {stages.map((s, i) => (
                    <tr key={i} className="border-t hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600">
                        Stage {s.stage}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-700">
                        {formatRupiah2(s.eclCurrent)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {formatRupiah2(s.eclPrevious)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {formatRupiah2(s.eclDiff)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {s.eclDiffPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
