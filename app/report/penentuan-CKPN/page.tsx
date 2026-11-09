"use client";

import React from "react";
import { usePenentuanCKPN } from "@/lib/penentuan-CKPN/hook/usePenentuanCKPN";
import { HeaderReport } from "@/lib/penentuan-CKPN/component/HeaderReport";
import { ControlFilter } from "@/lib/penentuan-CKPN/component/ControlFilter";
import { TableReport } from "@/lib/penentuan-CKPN/component/TableReport";
import { AccountingJournal } from "@/lib/penentuan-CKPN/component/AccountingJournal";
import { MacroShocksCard } from "@/lib/penentuan-CKPN/component/MakroShocksCard";

export default function ReportPenentuanCKPNPage() {
  const {
    inputPdStr,
    setInputPdStr,
    inputLgdSecuredStr,
    setInputLgdSecuredStr,
    inputLgdUnsecuredStr,
    setInputLgdUnsecuredStr,
    selectedSegment,
    setSelectedSegment,
    tanggalKeputusan,
    setTanggalKeputusan,
    segmentOptions,
    loading,
    reportData,
    executeSimulation,
  } = usePenentuanCKPN();

  return (
    <div className="min-h-screen bg-slate-100/70 p-6 space-y-6">
      <HeaderReport
        data={reportData}
        tanggalKeputusan={tanggalKeputusan}
        setTanggalKeputusan={setTanggalKeputusan}
      />

      <ControlFilter
        inputPdStr={inputPdStr}
        setInputPdStr={setInputPdStr}
        inputLgdSecuredStr={inputLgdSecuredStr}
        setInputLgdSecuredStr={setInputLgdSecuredStr}
        inputLgdUnsecuredStr={inputLgdUnsecuredStr}
        setInputLgdUnsecuredStr={setInputLgdUnsecuredStr}
        selectedSegment={selectedSegment}
        setSelectedSegment={setSelectedSegment}
        tanggalKeputusan={tanggalKeputusan}
        setTanggalKeputusan={setTanggalKeputusan}
        segmentOptions={segmentOptions}
        onRun={() => executeSimulation()}
        loading={loading}
        themeColorBtnDownload={reportData?.themeColorBtnDownload}
        themeColorBtnFilter={reportData?.themeColorBtnFilter}
      />

      {reportData && <MacroShocksCard data={reportData} />}

      <TableReport data={reportData} loading={loading} />

      {reportData && <AccountingJournal data={reportData} />}
    </div>
  );
}