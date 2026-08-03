import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getDefinisiAuditTrailFasilitasAsalUsulAnomaliData } from "@/report/services/Query/DefinisiAuditTrailFasilitas-Asal-Usul-Anomali/DefinisiAuditTrailFasilitasAsalUsulAnomali.query";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get("segment") || "ALL";

    const data = await getDefinisiAuditTrailFasilitasAsalUsulAnomaliData(segment);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Audit Trail Anomali");

    // Aktifkan Gridlines agar tampilan sheet bersih & rapi
    worksheet.views = [{ showGridLines: true }];

    const periodeVal =
      data.length > 0 && data[0].Tanggal_Laporan
        ? new Date(data[0].Tanggal_Laporan).toISOString().split("T")[0]
        : "2026-12-31";

    const segmenDisplay = segment === "ALL" ? "Semua Segmen" : `Segmen ${segment}`;

    // --- 1. HEADER ATAS (CENTER MERGE ACROSS COLUMNS A-J) ---
    worksheet.mergeCells("A1:J1");
    worksheet.getCell("A1").value = "PT BANK MUAMALAT INDONESIA TBK";
    worksheet.getCell("A1").font = { name: "Arial", bold: true, size: 14, color: { argb: "FF0B1E36" } };
    worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:J2");
    worksheet.getCell("A2").value = "FIXED REPORT AUDIT ITEM 2.3.1: ANALISIS AKAR PENYEBAB ANOMALI (OVER-COLLATERALIZED)";
    worksheet.getCell("A2").font = { name: "Arial", bold: true, size: 11, color: { argb: "FF0B1E36" } };
    worksheet.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A3:J3");
    worksheet.getCell("A3").value = `Tanggal Cetak Sistem: ${periodeVal}  |  Mata Uang: IDR  |  Segmen: ${segmenDisplay}`;
    worksheet.getCell("A3").font = { name: "Arial", italic: true, size: 10, color: { argb: "FF555555" } };
    worksheet.getCell("A3").alignment = { horizontal: "center", vertical: "middle" };

    // Baris Kosong
    worksheet.addRow([]);

    // Tujuan Laporan
    worksheet.mergeCells("A5:J5");
    worksheet.getCell("A5").value = "Tujuan Laporan: Membuktikan secara historis matematis penyebab fasilitas mengalami LGD Mentah Negatif (sebelum intervensi Floor 0%).";
    worksheet.getCell("A5").font = { name: "Arial", bold: true, size: 9, color: { argb: "FF333333" } };

    // Baris Kosong
    worksheet.addRow([]);

    // --- 2. HEADER TABEL (ROW 7) ---
    const headerTitles = [
      "Segmen",
      "No. Fasilitas",
      "Akad",
      "Tipe Agunan",
      "Nilai Pasar (A)",
      "Total Haircut",
      "NRV (B)",
      "EAD Netto (C)",
      "Surplus (B-C)",
      "Akar Penyebab (Root Cause)",
    ];

    const headerRow = worksheet.addRow(headerTitles);
    headerRow.height = 26; // Tingginya disesuaikan agar proporsional

    headerRow.eachCell((cell) => {
      cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFFFF" } }; // Text Putih
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F2942" }, // Navy / Dark Blue (Persis Gambar Pertama)
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });

    // --- 3. ISI DATA TABEL ---
    data.forEach((row: any) => {
      const dataRow = worksheet.addRow([
        row.segment ?? "-",
        row.Nomor_rekening ?? "-",
        row.Jenis_Akad ?? "-",
        row.Tipe_Agunan ?? "-",
        Number(row.Nilai_Pasar) || 0,
        Number(row.Total_Haircut) || 0,
        Number(row.NRV) || 0,
        Number(row.EAD_Netto) || 0,
        Number(row.Surplus) || 0,
        row.Akar_Penyebab ?? "",
      ]);

      dataRow.height = 20;

      // Styling Per Cell pada Data Row
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: "Arial", size: 9.5 };

        // Alignments & Number Formats
        if (colNumber === 1) {
          // Segmen
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colNumber === 2) {
          // No Fasilitas
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colNumber === 3 || colNumber === 4 || colNumber === 10) {
          // Teks (Akad, Agunan, Root Cause)
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (colNumber === 6) {
          // Total Haircut (Persentase)
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = "0.00%";
        } else {
          // Nominal Angka Currency (Nilai Pasar, NRV, EAD, Surplus)
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = "#,##0.00";
        }

        // Garis/Border Tipis Rapi
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });
    });

    // --- 4. ATUR LEBAR KOLOM (COLUMN WIDTHS) ---
    worksheet.columns = [
      { width: 12 }, // Segmen
      { width: 22 }, // No. Fasilitas
      { width: 26 }, // Akad
      { width: 32 }, // Tipe Agunan
      { width: 20 }, // Nilai Pasar (A)
      { width: 16 }, // Total Haircut
      { width: 20 }, // NRV (B)
      { width: 20 }, // EAD Netto (C)
      { width: 20 }, // Surplus (B-C)
      { width: 28 }, // Akar Penyebab
    ];

    // --- 5. FOOTER CATATAN AUDIT ---
    worksheet.addRow([]);
    
    const noteHeaderRow = worksheet.addRow(["CATATAN AUDIT ROOT CAUSE ANALYSIS:"]);
    noteHeaderRow.getCell(1).font = { name: "Arial", bold: true, size: 9, color: { argb: "FF0F2942" } };

    const note1Row = worksheet.addRow([
      "1. STATUS OVER-COLLATERALIZED: Kondisi empiris di mana Nilai Pemulihan Bersih (NRV) aset jaminan setelah didiskon haircut masih lebih besar daripada sisa eksposur utang bersih (EAD Netto).",
    ]);
    note1Row.getCell(1).font = { name: "Arial", size: 8.5, italic: true, color: { argb: "FF2E7D32" } }; // Warna Hijau Audit Soft

    const note2Row = worksheet.addRow([
      "2. PEMBUKTIAN ANOMALI: Surplus Agunan (Kolom B - C) yang bernilai positif adalah akar penyebab matematis yang memicu aktifnya sistem pencegahan LGD Negatif (LGD Floor 0%) pada engine perhitungan PSAK 413.",
    ]);
    note2Row.getCell(1).font = { name: "Arial", size: 8.5, italic: true, color: { argb: "FF2E7D32" } };

    // Download Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Definisi_Audit_Trail_Fasilitas_Asal_Usul_Anomali.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Export failed", error: error.message },
      { status: 500 }
    );
  }
}