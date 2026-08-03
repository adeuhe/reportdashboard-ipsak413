type Props = {
  labelTop: string;
  labelMain: string;
  note: string;
};

export default function StatusCard({ labelTop, labelMain, note }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex-1 min-w-0">
      <div className="mb-3 text-sm font-semibold text-slate-700">Status</div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full border-[10px] border-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-full h-full text-green-700 p-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div className="mt-3 text-xs text-slate-500">{note}</div>
      </div>
    </div>
  );
}
