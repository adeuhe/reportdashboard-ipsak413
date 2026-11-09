import React from "react";
import { fetchCheckAndBalanceData } from "@/lib/report-check-and-ballance-history-data/services";
import WaveBackground from "@/lib/report-check-and-ballance-history-data/component/WaveBackground";
import SummaryCards from "@/lib/report-check-and-ballance-history-data/component/SummaryCards";
import DetailTableSection from "@/lib/report-check-and-ballance-history-data/component/DetailTableSection";
import FiltersWrapper from "@/lib/report-check-and-ballance-history-data/component/FiltersWrapper";
import { parseAggs, parseStagingParams } from "@/lib/report-check-and-ballance-history-data/utils/mainFilter";

export const dynamic = "force-dynamic";

export default async function ReportCheckAndBalancePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const searchParams = await props.searchParams;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  // Filter Data Portofolio Utama (Level 1: tabel, Level 2: tanggal primer, Level 3: agregasi berantai)
  const mainTable = typeof searchParams.mainTable === "string" ? searchParams.mainTable : undefined;
  const mainDate = typeof searchParams.mainDate === "string" ? searchParams.mainDate : undefined;
  const mainAggs = parseAggs(typeof searchParams.aggs === "string" ? searchParams.aggs : undefined);
  // Filter Data Pembanding Staging (Dinamis)
  const stagingParamsRaw = typeof searchParams.stagingParams === "string" ? searchParams.stagingParams : typeof searchParams.stgParams === "string" ? searchParams.stgParams : undefined;
  const stagingParams = parseStagingParams(stagingParamsRaw);
  const stgAggs = parseAggs(typeof searchParams.stgAggs === "string" ? searchParams.stgAggs : typeof searchParams.stagingAggs === "string" ? searchParams.stagingAggs : undefined);

  // Kompatibilitas URL lama
  const periodeData = typeof searchParams.periodeData === "string" ? searchParams.periodeData : undefined;
  const idKlasterPd = typeof searchParams.idKlasterPd === "string" ? searchParams.idKlasterPd : undefined;
  const paramTable = typeof searchParams.paramTable === "string" ? searchParams.paramTable : undefined;
  const paramCol1 = typeof searchParams.paramCol1 === "string" ? searchParams.paramCol1 : undefined;
  const paramVal1 = typeof searchParams.paramVal1 === "string" ? searchParams.paramVal1 : undefined;
  const paramCol2 = typeof searchParams.paramCol2 === "string" ? searchParams.paramCol2 : undefined;
  const paramVal2 = typeof searchParams.paramVal2 === "string" ? searchParams.paramVal2 : undefined;

  const summaryColsStr = typeof searchParams.summaryCols === "string" ? searchParams.summaryCols : undefined;
  const summaryCols = summaryColsStr ? summaryColsStr.split(",").filter(Boolean) : undefined;
  const aggFunc = typeof searchParams.aggFunc === "string" ? searchParams.aggFunc : undefined;
  const sumCol = typeof searchParams.sumCol === "string" ? searchParams.sumCol : undefined;
  const distinctCol = typeof searchParams.distinctCol === "string" ? searchParams.distinctCol : undefined;

  const data = await fetchCheckAndBalanceData({
    page,
    limit,
    mainTable,
    mainDate,
    mainAggs,
    periodeData,
    idKlasterPd,
    paramTable,
    paramCol1,
    paramVal1,
    paramCol2,
    paramVal2,
    stagingParams: stagingParams.length > 0 ? stagingParams : undefined,
    stagingAggs: stgAggs.length > 0 ? stgAggs : undefined,
    summaryCols,
    aggFunc,
    sumCol,
    distinctCol,
  });

  return (
    <div className="min-h-screen bg-white relative font-sans w-full max-w-full overflow-x-hidden">
      {/* 3D Wave Background Shimmer */}
      <WaveBackground color={data.themeColorBgHeader} />

      <div className="relative z-10 w-full max-w-full px-4 md:px-8 py-6 space-y-6 min-w-0 overflow-x-hidden">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-wider mb-2 drop-shadow-sm">
            {data.namaBank}
          </h1>
          <h2 className="text-xl font-extrabold text-slate-800 uppercase drop-shadow-sm">
            LAPORAN CHECK AND BALLANCE HISTORY DATA
          </h2>
        </div>

        {/* Filters Section */}
        <FiltersWrapper
          mainTableOptions={data.mainTableOptions}
          mainTableInfo={data.mainTableInfo}
          selectedMainTable={data.selectedMainTable}
          selectedMainDate={data.selectedMainDate}
          selectedMainAggs={data.selectedMainAggs}
          selectedParamTable={data.selectedParamTable}
          selectedParamCol1={data.selectedParamCol1}
          selectedParamVal1={data.selectedParamVal1}
          selectedParamCol2={data.selectedParamCol2}
          selectedParamVal2={data.selectedParamVal2}
          selectedStagingParams={data.selectedStagingParams}
          selectedStagingAggs={data.selectedStagingAggs}
          themeColorBtnDownload={data.themeColorBtnDownload}
          themeColorBtnFilterReport={data.themeColorBtnFilterReport}
          isParamApplied={data.isParamApplied}
        />

        {/* Summary Comparison & Column List Section */}
        <SummaryCards
          mainTable={data.selectedMainTable}
          mainDate={data.selectedMainDate}
          mainDateCol={data.mainTableInfo.dateCol}
          mainGroupCol={data.mainTableInfo.groupCol}
          mainGroupColumns={data.mainGroupColumns}
          mainSummaryColumns={data.mainSummaryColumns}
          mainSummaryRows={data.mainSummaryRows}
          mainSummaryError={data.mainSummaryError}
          summaryParam={data.summaryParam}
          isParamApplied={data.isParamApplied}
          tableError={data.tableError}
          columnMappings={data.columnMappings}
          selectedParamTable={data.selectedParamTable}
          selectedParamCol1={data.selectedParamCol1}
          selectedParamVal1={data.selectedParamVal1}
          selectedParamCol2={data.selectedParamCol2}
          selectedParamVal2={data.selectedParamVal2}
          activeSummaryCols={data.activeSummaryCols}
          selectedAggFunc={data.selectedAggFunc}
          selectedSumCol={data.selectedSumCol}
          selectedDistinctCol={data.selectedDistinctCol}
          availableColumnsParam={data.availableColumnsParam}
          stagingSummaryColumns={data.stagingSummaryColumns}
          selectedStagingAggs={data.selectedStagingAggs}
          reconciliationData={data.reconciliationData}
        />

        {/* Detail Data Tables (Tabel Utama terpilih & Tabel Pembanding Dinamis dengan Toggle Button) */}
        <DetailTableSection
          detailRows={data.detailRows}
          fixedRows={data.fixedRows}
          paramRows={data.paramRows}
          totalData={data.totalData}
          totalDataFixed={data.totalDataFixed}
          totalDataParam={data.totalDataParam}
          currentPage={page}
          limit={limit}
          availableColumnsFixed={data.availableColumnsFixed}
          availableColumnsParam={data.availableColumnsParam}
          activeColumns={data.activeColumns}
          columnMappings={data.columnMappings}
          isParamApplied={data.isParamApplied}
          mainTable={data.selectedMainTable}
          mainDate={data.selectedMainDate}
          mainDateCol={data.mainTableInfo.dateCol}
          selectedParamTable={data.selectedParamTable}
        />
      </div>
    </div>
  );
}
