import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { fetchValidasiKomputasiData } from "@/lib/report-validasi-komputasi-grand-formula-ecl/services";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const segment = searchParams.get("segment") || undefined;
    const akad = searchParams.get("akad") || undefined;

    const data = await fetchValidasiKomputasiData(undefined, undefined, startDate, endDate, segment, akad);
    const { data: rows, namaBank, endDate: reportEndDate } = data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Regulator Dashboard";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Validasi Komputasi");

    // Enable grid lines explicitly in Excel
    sheet.views = [{ showGridLines: true }];

    // Configure Columns width
    sheet.columns = [
      { header: "", key: "no_rekening", width: 22 },
      { header: "", key: "segment_name", width: 24 },
      { header: "", key: "nama_akad", width: 20 },
      { header: "", key: "stage_psak", width: 10 },
      { header: "", key: "ead_secured", width: 22 },
      { header: "", key: "ead_unsecured", width: 22 },
      { header: "", key: "final_pd_rate", width: 16 },
      { header: "", key: "lgd_secured", width: 16 },
      { header: "", key: "lgd_unsecured", width: 16 },
      { header: "", key: "nominal_ecl_secured", width: 22 },
      { header: "", key: "nominal_ecl_unsecured", width: 22 },
      { header: "", key: "total_ecl_statistik", width: 24 },
    ];

    // Font and Style definitions
    const fontTitle: Partial<ExcelJS.Font> = { name: "Arial", size: 14, bold: true, color: { argb: "0F172A" } };
    const fontSubtitle: Partial<ExcelJS.Font> = { name: "Arial", size: 11, bold: true, color: { argb: "334155" } };
    const fontHeader: Partial<ExcelJS.Font> = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
    const fontData: Partial<ExcelJS.Font> = { name: "Arial", size: 10, color: { argb: "1E293B" } };
    const fontDataBold: Partial<ExcelJS.Font> = { name: "Arial", size: 10, bold: true, color: { argb: "0F172A" } };

    const fillHeader: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E293B" }, // Dark slate
    };

    const borderCell: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "CBD5E1" } },
      left: { style: "thin", color: { argb: "CBD5E1" } },
      bottom: { style: "thin", color: { argb: "CBD5E1" } },
      right: { style: "thin", color: { argb: "CBD5E1" } },
    };

    const borderHeader: Partial<ExcelJS.Borders> = {
      top: { style: "medium", color: { argb: "0F172A" } },
      left: { style: "thin", color: { argb: "475569" } },
      bottom: { style: "medium", color: { argb: "0F172A" } },
      right: { style: "thin", color: { argb: "475569" } },
    };

    const borderTotal: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "0F172A" } },
      bottom: { style: "double", color: { argb: "0F172A" } },
      left: { style: "thin", color: { argb: "CBD5E1" } },
      right: { style: "thin", color: { argb: "CBD5E1" } },
    };

    // 1. Bank Title & Subtitle Header
    const titleRow1 = sheet.addRow([namaBank]);
    titleRow1.getCell(1).font = fontTitle;
    titleRow1.getCell(1).alignment = { horizontal: "center" };
    sheet.mergeCells("A1:L1");

    const titleRow2 = sheet.addRow(["LAPORAN RINCIAN: VALIDASI KOMPUTASI GRAND FORMULA ECL"]);
    titleRow2.getCell(1).font = fontSubtitle;
    titleRow2.getCell(1).alignment = { horizontal: "center" };
    sheet.mergeCells("A2:L2");

    sheet.addRow([]); // Blank spacer

    // 2. Report Information
    const infoRow1 = sheet.addRow(["Periode Pelaporan", `: ${reportEndDate}`]);
    infoRow1.getCell(1).font = { name: "Arial", size: 10, bold: true };
    infoRow1.getCell(2).font = { name: "Arial", size: 10 };

    const selectedSegmentName = data.segmentList?.find(s => String(s.id) === segment)?.name || (segment && segment !== "ALL" ? segment : "Semua Segment");
    const selectedAkadName = data.akadList?.find(a => a.sandi === akad)?.keterangan || (akad && akad !== "ALL" ? akad : "Semua Akad");

    const infoRow2 = sheet.addRow(["Filter Segment", `: ${selectedSegmentName}`]);
    infoRow2.getCell(1).font = { name: "Arial", size: 10, bold: true };
    infoRow2.getCell(2).font = { name: "Arial", size: 10 };

    const infoRow3 = sheet.addRow(["Filter Jenis Akad", `: ${selectedAkadName}`]);
    infoRow3.getCell(1).font = { name: "Arial", size: 10, bold: true };
    infoRow3.getCell(2).font = { name: "Arial", size: 10 };

    const infoRow4 = sheet.addRow(["Target Operasi", ": Pembuktian Kalkulasi Porsi Ganda (Secured vs Unsecured)"]);
    infoRow4.getCell(1).font = { name: "Arial", size: 10, bold: true };
    infoRow4.getCell(2).font = { name: "Arial", size: 10 };

    sheet.addRow([]); // Blank spacer

    // 3. Table Headers
    const headerRow = sheet.addRow([
      "NO REKENING",
      "SEGMENT",
      "JENIS AKAD",
      "STAGE",
      "EAD SECURED",
      "EAD UNSECURED",
      "FINAL PD",
      "LGD SECURED",
      "LGD UNSECURED",
      "ECL SECURED",
      "ECL UNSECURED",
      "TOTAL ECL STATISTIK",
    ]);
    headerRow.height = 26;

    headerRow.eachCell((cell, colNumber) => {
      cell.font = fontHeader;
      cell.fill = fillHeader;
      cell.border = borderHeader;
      if (colNumber === 1) cell.alignment = { horizontal: "left", vertical: "middle" };
      else if (colNumber === 2) cell.alignment = { horizontal: "left", vertical: "middle" };
      else if (colNumber === 3 || colNumber === 4) cell.alignment = { horizontal: "center", vertical: "middle" };
      else cell.alignment = { horizontal: "right", vertical: "middle" };
    });

    // 4. Data Rows
    let totalEadSecured = 0;
    let totalEadUnsecured = 0;
    let totalSecured = 0;
    let totalUnsecured = 0;
    let totalStatistik = 0;

    rows.forEach((row) => {
      const eadSec = Number(row.ead_secured || 0);
      const eadUnsec = Number(row.ead_unsecured || 0);
      const eclSec = Number(row.nominal_ecl_secured || 0);
      const eclUnsec = Number(row.nominal_ecl_unsecured || 0);
      const eclTot = Number(row.total_ecl_statistik || (eclSec + eclUnsec));

      totalEadSecured += eadSec;
      totalEadUnsecured += eadUnsec;
      totalSecured += eclSec;
      totalUnsecured += eclUnsec;
      totalStatistik += eclTot;

      const dataRow = sheet.addRow([
        row.no_rekening || "-",
        row.segment_name || "-",
        row.nama_akad || "-",
        parseInt(String(row.stage_psak || 1), 10),
        eadSec,
        eadUnsec,
        Number(row.final_pd_rate || 0),
        Number(row.lgd_secured || 0),
        Number(row.lgd_unsecured || 0),
        eclSec,
        eclUnsec,
        eclTot,
      ]);

      dataRow.height = 20;

      dataRow.eachCell((cell, colNumber) => {
        cell.font = fontData;
        cell.border = borderCell;

        if (colNumber === 1 || colNumber === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (colNumber === 3) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colNumber === 4) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.numFmt = "0";
        } else if (colNumber === 5 || colNumber === 6) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = "#,##0.00";
        } else if (colNumber === 7) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = "0.000000";
        } else if (colNumber === 8 || colNumber === 9) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = "0.00";
        } else {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = "#,##0.00";
        }
      });
    });

    // 5. Total Summary Row
    const totalRow = sheet.addRow([
      "TOTAL",
      "",
      "",
      "",
      totalEadSecured,
      totalEadUnsecured,
      "",
      "",
      "",
      totalSecured,
      totalUnsecured,
      totalStatistik,
    ]);
    totalRow.height = 24;

    totalRow.eachCell((cell, colNumber) => {
      cell.font = fontDataBold;
      cell.border = borderTotal;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F1F5F9" },
      };

      if (colNumber === 1) {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else if (colNumber === 5 || colNumber === 6 || colNumber >= 10) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.numFmt = "#,##0.00";
      }
    });

    sheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);

    sheet.addRow([]); // Blank spacer

    // 6. Catatan Sistem Section
    const notesHeading = sheet.addRow(["Catatan Sistem:"]);
    notesHeading.getCell(1).font = { name: "Arial", size: 10, bold: true, color: { argb: "334155" } };

    const notes = [
      "- Total ECL Statistik = ECL Secured + ECL Unsecured.",
      "- Rekening murni menghasilkan ECL Secured jika Overcollateralized.",
      "- Rekening murni menghasilkan ECL Unsecured jika Clean Loan (Unsecured Floor 50% aktif).",
    ];

    notes.forEach((note) => {
      const nr = sheet.addRow([note]);
      nr.getCell(1).font = { name: "Arial", size: 9, italic: true, color: { argb: "64748B" } };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Laporan_Validasi_Komputasi_ECL_${new Date().getTime()}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    return response;
  } catch (error: any) {
    console.error("Failed to export excel:", error);
    return new NextResponse(`Failed to generate report: ${error.message}\n${error.stack}`, { status: 500 });
  }
}
