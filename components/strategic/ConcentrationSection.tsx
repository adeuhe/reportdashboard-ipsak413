// ConcentrationSection.tsx
import SectorHeatmap from "@/components/strategic/SectorHeatmap";
import SectorTable from "@/components/strategic/SectorTable";

type ConcentrationSectionProps = {
  heatmap: {
    title: string;
    subtitle: string;
    tiles: any[];
  };
  tableRows: any[];
};

export default function ConcentrationSection({ heatmap, tableRows }: ConcentrationSectionProps) {
  return (
    <div className="px-6 pt-4 pb-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-slate-900">{heatmap.title}</div>
        <div className="mt-1 text-xs text-slate-500">{heatmap.subtitle}</div>

        <div className="mt-4">
          <SectorHeatmap title={heatmap.title} subtitle={heatmap.subtitle} tiles={heatmap.tiles} />
        </div>

        <div className="-mt-6">
          <SectorTable rows={tableRows} />
        </div>
      </div>
    </div>
  );
}
