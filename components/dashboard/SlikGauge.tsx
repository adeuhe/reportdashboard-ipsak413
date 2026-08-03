"use client";

import { useMemo, useState } from "react";

type Category = {
  category: string;
  contracts: number;
  eclCurrent: number;
  eclPrev: number;
  change: number;
  changeValue: number;
};

type Props = {
  value: number;
  note: string;
  actions: string[];
  periode: string; // ← tambahin ini
  categories?: Category[];
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function gaugeColor(v: number) {
  if (v < 40) return "text-green-600";
  if (v < 70) return "text-yellow-500";
  return "text-red-600";
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatRupiah2(value: number) {
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

export default function SlikGauge({
  value,
  note,
  actions,
  periode, // ← ini yang dipakai di export
  categories = [],
}: Props) {
  const [selected, setSelected] = useState<string>("ALL");

  /** ==============================
   * SELECTED CATEGORY
   * ============================== */
  const selectedData = useMemo(() => {
    if (selected === "ALL") return null;
    return categories.find((c) => c.category === selected) ?? null;
  }, [selected, categories]);

  const [openDetail, setOpenDetail] = useState(false);

  /** ==============================
   * GAUGE VALUE
   * ============================== */
  const gaugeValue = useMemo(() => {
    if (selectedData) {
      const scaled = Math.abs(selectedData.changeValue) / 1_000_000_000;
      return clamp(scaled);
    }
    return clamp(value);
  }, [selectedData, value]);

  const radius = 80;
  const arcLength = Math.PI * radius;
  const progress = (gaugeValue / 100) * arcLength;
  const angle = -180 + (gaugeValue / 100) * 180;
  const color = gaugeColor(gaugeValue);

  /** ==============================
   * BREAKDOWN
   * ============================== */
  const breakdown = useMemo(() => {
    if (selected === "ALL") return categories;
    return selectedData ? [selectedData] : [];
  }, [selected, categories, selectedData]);

  function changeColor(val: number) {
    if (val > 0) return "text-red-600";
    if (val < 0) return "text-green-600";
    return "text-slate-500";
  }

  const filteredCategories =
    selected === "ALL"
      ? categories
      : categories.filter((c) => c.category === selected);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm flex-1 min-w-0">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-700">
          Pergerakan CKPN (SLIK)
        </div>

        <div className="flex items-center gap-2">
          {/* DROPDOWN */}
          {categories.length > 0 && (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          )}

          {/* ACTION BUTTON */}
          {actions.slice(0, 2).map((a) => {
            const handleClick = () => {
              if (a === "Export")
                window.open(
                  `/api/export/ckpn?kategori=${selected}&periode=${periode}`,
                  "_blank",
                );

              if (a === "Detail") {
                setOpenDetail(true);
              }
            };

            return (
              <button
                key={a}
                onClick={handleClick}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 bg-white shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* GAUGE */}
      <div className="mt-4 flex justify-center">
        {/* container wajib punya size pasti → mencegah width -1 */}
        <div className="relative w-[260px] h-[140px] flex-shrink-0">
          <svg
            viewBox="0 0 200 120"
            className="w-full h-full block"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* background arc */}
            <path
              d="M20,100 A80,80 0 0 1 180,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-200"
            />

            {/* progress arc */}
            <path
              d="M20,100 A80,80 0 0 1 180,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className={`${color} transition-all duration-700`}
              strokeDasharray={arcLength}
              strokeDashoffset={arcLength - progress}
              strokeLinecap="round"
            />

            {/* needle */}
            <g
              transform={`translate(100,100) rotate(${angle})`}
              className="transition-transform duration-700 ease-out"
            >
              <line
                x1="0"
                y1="0"
                x2="70"
                y2="0"
                stroke="currentColor"
                strokeWidth="3"
                className={color}
              />
              <circle
                cx="0"
                cy="0"
                r="5"
                fill="currentColor"
                className={color}
              />
            </g>
          </svg>

          {/* value text */}
          <div className="absolute inset-x-0 bottom-1 text-center">
            <div className={`text-2xl font-extrabold ${color}`}>
              {Math.round(gaugeValue)}%
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {selected === "ALL" ? note : `Kategori: ${selected}`}
            </div>
          </div>
        </div>
      </div>

      {openDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[700px] max-h-[80vh] overflow-auto rounded-2xl bg-white shadow-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Detail CKPN {selected !== "ALL" && `- ${selected}`}
                </div>

                <div className="text-xs text-slate-500">Periode: {periode}</div>
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
                    <th className="px-3 py-2 text-left">Kategori</th>
                    <th className="px-3 py-2 text-right">Kontrak</th>
                    <th className="px-3 py-2 text-right">ECL Current</th>
                    <th className="px-3 py-2 text-right">ECL Previous</th>
                    <th className="px-3 py-2 text-right">Perubahan</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      {/* KATEGORI */}
                      <td className="px-3 py-2 font-medium text-slate-700">
                        {row.category}
                      </td>

                      {/* KONTRAK */}
                      <td className="px-3 py-2 text-right font-semibold text-blue-700">
                        {row.contracts.toLocaleString("id-ID")}
                      </td>

                      <td className="px-3 py-2 text-right font-bold text-slate-900">
                        {formatRupiah(row.eclCurrent)}
                      </td>

                      <td className="px-3 py-2 text-right text-slate-500">
                        {formatRupiah(row.eclPrev)}
                      </td>

                      <td
                        className={`px-3 py-2 text-right font-semibold ${
                          row.changeValue > 0
                            ? "text-red-600"
                            : row.changeValue < 0
                              ? "text-green-600"
                              : "text-slate-600"
                        }`}
                      >
                        {formatRupiah(row.change)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BREAKDOWN */}
      {breakdown.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="mb-2 text-xs font-semibold text-slate-500">
            Breakdown Pergerakan CKPN
          </div>

          <div className="space-y-2">
            {breakdown.map((c) => (
              <div
                key={c.category}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="text-xs font-semibold text-slate-700">
                  {c.category}
                </div>
                <div
                  className={`text-xs font-bold ${changeColor(c.changeValue)}`}
                >
                  {formatRupiah2(c.change)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
