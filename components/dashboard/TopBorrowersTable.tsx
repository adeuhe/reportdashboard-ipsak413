// type Row = {
//   name: string;
//   sector: string;
//   headroom: number;
//   dpd: number;
//   eclAmount: number;
//   stage: number;
//   lastReview: number;
// };

// type Props = { rows: Row[] };

// export default function TopBorrowersTable({ rows }: Props) {
//   return (
//     <div className="rounded-xl border bg-white p-4 shadow-sm flex-1 min-w-0">
//       <div className="mb-3 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-center sm:text-left">
//         <div className="text-sm font-semibold text-slate-700">Top 10 High-Risk Borrowers</div>
//         <div className="flex gap-2 mt-2 sm:mt-0">
//           <button className="rounded-lg border px-3 py-1 text-xs font-semibold">Flagging</button>
//           <button className="rounded-lg border px-3 py-1 text-xs font-semibold">Fraud</button>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-left text-sm">
//           <thead className="border-b bg-slate-50 text-xs font-semibold text-slate-600">
//             <tr>
//               <th className="p-2">Name</th>
//               <th className="p-2">Sector</th>
//               <th className="p-2">Headroom</th>
//               <th className="p-2">DPD</th>
//               <th className="p-2">ECL Amount</th>
//               <th className="p-2">Stage</th>
//               <th className="p-2">Last Review</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r) => (
//               <tr key={r.name} className="border-b">
//                 <td className="p-2 font-semibold text-slate-800">{r.name}</td>
//                 <td className="p-2 text-slate-600">{r.sector}</td>
//                 <td className="p-2">{r.headroom} M</td>
//                 <td className="p-2">{r.dpd}</td>
//                 <td className="p-2">{r.eclAmount} M</td>
//                 <td className="p-2">{r.stage}</td>
//                 <td className="p-2">{r.lastReview} d</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-2 text-xs text-slate-500">Session PSAK 71 / PSAK 413</div>
//     </div>
//   );
// }
