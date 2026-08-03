"use client";

import { useState } from "react";
import TabsBar from "@/components/strategic/TabsBar";
import TrendSection from "@/components/strategic/TrendSection";
import ConcentrationSection from "@/components/strategic/ConcentrationSection";

export default function StrategicDashboardClient({ data }: { data: any }) {
  const [active, setActive] = useState<number>(data.meta.activeTabIndex ?? 0);

  return (
    <>
      <TabsBar
        tabs={data.meta.tabs}
        activeIndex={active}
        onChange={setActive}
      />

      {active === 0 && (
        <TrendSection
          title={data.meta.title}
          subtitle={data.meta.subtitle}
          series={data.trendData?.series ?? []}
          cards={data.trendData?.cards ?? []}
        />
      )}

      {active === 1 && (
        <ConcentrationSection
          heatmap={data.heatMapData ?? { title: "", subtitle: "", tiles: [] }}
          tableRows={data.heatMapData?.table ?? []}// pastikan array selalu ada
        />
      )}
    </>
  );
}
