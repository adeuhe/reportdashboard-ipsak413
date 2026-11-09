import React from "react";
import { fetchLifetimeRiskHorizonData } from "@/lib/report-portfolio-lifetime-risk-horizon/services";
import WaveBackground from "@/lib/report-portfolio-lifetime-risk-horizon/component/WaveBackground";
import Filters from "@/lib/report-portfolio-lifetime-risk-horizon/component/Filters";
import ReportTable from "@/lib/report-portfolio-lifetime-risk-horizon/component/ReportTable";

export const dynamic = "force-dynamic";

export default async function ReportPortfolioLifetimeRiskHorizonPage() {
  const data = await fetchLifetimeRiskHorizonData();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      <WaveBackground color={data.themeColorBgHeader} />

      <div className="relative z-10 w-full px-2 md:px-8 py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-wider mb-2 drop-shadow-sm">
            {data.namaBank}
          </h1>
          <h2 className="text-xl font-extrabold text-slate-800 uppercase drop-shadow-sm">
            LAPORAN UTAMA: PORTFOLIO LIFETIME RISK HORIZON (MARGINAL PD PROJECTION)
          </h2>
        </div>

        <Filters themeColorBtnDownload={data.themeColorBtnDownload} />

        <ReportTable data={data.data} totalData={data.totalData} />
      </div>
    </div>
  );
}
