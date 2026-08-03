import Image from "next/image";

type Props = {
  bankName: string;
  reportTitle: string;
  periodLabel: string;
  dataCutoff: string;
};

export default function DashboardHeader({
  bankName,
  reportTitle,
  periodLabel,
  dataCutoff,
}: Props) {
  return (
    <div className="bg-white border-b">
      {/* FULL WIDTH */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <Image
              src="/LogoIntelsysDataBulat.jpeg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />

            <div>
              <div className="text-xs font-semibold text-slate-500">
                {bankName}
              </div>
              <div className="text-sm font-bold text-slate-800">
                {reportTitle}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">
              {periodLabel}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              DATA CUT-OFF: {dataCutoff}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
