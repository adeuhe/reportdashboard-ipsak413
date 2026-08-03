"use client";

import { useState } from "react";
import Pyramid from "./Pyramid";

type Stage = {
  name: string;
  value: number;
};

type Row = {
  bucket: number;
  stage: string;
  outstanding: number;
  tanggal: string;
};

type Props = {
  title: string;
  stages: Stage[];
  rows: Row[]; // ⬅️ detail data
};

// function formatRupiah(value: number) {
//   if (value >= 1_000_000_000) {
//     return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", {
//       maximumFractionDigits: 2,
//     })} M`;
//   }
//   if (value >= 1_000_000) {
//     return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
//       maximumFractionDigits: 2,
//     })} Jt`;
//   }
//   return `Rp ${value.toLocaleString("id-ID")}`;
// }
function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function BucketDpd({ title, stages, rows }: Props) {
  const [openDetail, setOpenDetail] = useState(false);

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
      <Pyramid title="" levels={stages} />

      {/* MODAL DETAIL */}
      {openDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[650px] max-h-[80vh] overflow-auto rounded-2xl bg-white shadow-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Detail {title}
                </div>
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
                    <th className="px-3 py-2 text-left">Bucket</th>
                    <th className="px-3 py-2 text-left">Stage</th>
                    <th className="px-3 py-2 text-right">Outstanding</th>
                    <th className="px-3 py-2 text-right">Tanggal Laporan</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600">{r.bucket}</td>
                      <td className="px-3 py-2 text-slate-600">{r.stage}</td>

                      <td className="px-3 py-2 text-right font-semibold text-blue-700">
                        {formatRupiah(r.outstanding)}
                      </td>

                      <td className="px-3 py-2 text-right text-slate-600">
                        {r.tanggal}
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
