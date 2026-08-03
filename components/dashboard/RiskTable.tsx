type Row = {
  name: string;
  sector: string;
  bucket: string | number; // tambahkan
  dpd: number;
  unwind: number;
  ecl: string;
  stage: number;
};


export default function RiskTable({
  titleLeft,
  titleCenter,
  rows,
  footer,
}: {
  titleLeft: string;
  titleCenter: string;
  rows: Row[];
  footer: string;
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm flex-1 min-w-0">
      <div className="border-b p-4">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-center">
          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-1 sm:text-left">
            <div className="text-sm font-semibold text-slate-700">{titleLeft}</div>
            <div className="text-sm font-semibold text-slate-700">{titleCenter}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="p-2">Debitur</th>
              <th className="p-2">Segment</th>
              <th className="p-2">Outstanding</th>
              <th className="p-2">DPD</th>
              <th className="p-2">ECL Amount</th>
              <th className="p-2">Bucket</th>
              <th className="p-2">Stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b">
                <td className="p-2 font-semibold text-slate-900">{r.name}</td>
                <td className="p-2 text-slate-900">{r.sector}</td>
                <td className="p-2 text-slate-900">{r.unwind}</td>
                <td className="p-2 text-slate-900">{r.dpd}</td>
                <td className="p-2 text-slate-900">{r.ecl}</td>
                <td className="p-2 text-slate-900">{r.bucket}</td>
                <td className="p-2 text-slate-900">{r.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 text-xs text-slate-500">{footer}</div>
      </div>
    </div>
  );
}
