import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getDataCKPNExportExcel } from "@/app/services/Query/riskDashboard.service";

export async function GET(req: Request) {
  // ambil query param dari URL
  const { searchParams } = new URL(req.url);

  const kategori = searchParams.get("kategori") ?? "ALL";
  const periode = searchParams.get("periode") ?? "2024-12-31";

  // filter untuk service
  const filter = {
    kategori,
    periode,
  };

  // ambil data dari DB
  const data = await getDataCKPNExportExcel(filter);

  // buat workbook excel
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("CKPN");

  ws.columns = [
    { header: "Kategori", key: "kategori", width: 20 },
    { header: "Jumlah Kontrak", key: "jumlah_kontrak", width: 18 },
    { header: "ECL Current", key: "total_ecl_current", width: 20 },
    { header: "ECL Prev", key: "total_ecl_prev", width: 20 },
    { header: "Perubahan", key: "perubahan_ecl", width: 20 },
  ];

  data.forEach((row: any) => ws.addRow(row));

  // generate buffer excel
  const buffer = await wb.xlsx.writeBuffer();

  // rapikan nama file (hapus spasi)
  const safeKategori = kategori.replace(/\s+/g, "-");
  const fileName = `ckpn_${safeKategori}_${periode}.xlsx`;

  // return response download
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
