"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  show: boolean;
  title?: string;
  subtitle?: string;
}

export default function LoadingOverlay({
  show,
  title = "Memproses Filter Validasi ECL...",
  subtitle = "Mohon tunggu, sistem sedang mengeksekusi query kalkulasi formula ECL dan memuat data dari database.",
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-150"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Top indeterminate progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-blue-200/40">
        <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 via-amber-400 to-blue-500 animate-pulse" />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 px-8 py-6 flex flex-col items-center gap-3 max-w-sm text-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100" />
          <Loader2 className="w-14 h-14 text-blue-600 animate-spin absolute inset-0" />
        </div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}
