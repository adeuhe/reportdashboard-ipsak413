import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { 
  getDataMatriksKonnversi, 
  getNamaBank 
} from "@/report/services/Query/Laporan-Matriks-Konversi-TTC-ke-PIT-PD/LaporanMatriksKonversiTTCkePITPD.query";

interface MatriksKonversiRow {
  segment_id: string;
  TTC_PD_Base: number;
  BaseLine_Scalar: number;
  PIT_PD_Baseline: number;
  optimistic_Scalar: number;
  PIT_PD_Optimistic: number;
  pessimistic_Scalar: number;
  PIT_PD_Pessimistic: number;
  Bobot_Normal: number;
  Bobot_Best: number;
  Bobot_Worst: number;
  Final_Weight_PIT_PD: number;
}

interface GroupedData {
  key: string;
  bobotNormal: number;
  bobotBest: number;
  bobotWorst: number;
  rows: MatriksKonversiRow[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get("date") || "2026-12-31";

    // 1. Ambil Data dan Nama Bank
    const [rawData, bankName] = await Promise.all([
      getDataMatriksKonnversi(periode),
      getNamaBank(),
    ]);

    const safeNum = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));

    // Map Raw Data
    const formattedData: MatriksKonversiRow[] = (Array.isArray(rawData) ? rawData : []).map((row: any) => ({
      segment_id: row.segment_id ?? "-",
      TTC_PD_Base: safeNum(row.TTC_PD_Base),
      BaseLine_Scalar: safeNum(row.BaseLine_Scalar),
      PIT_PD_Baseline: safeNum(row.PIT_PD_Baseline),
      optimistic_Scalar: safeNum(row.optimistic_Scalar),
      PIT_PD_Optimistic: safeNum(row.PIT_PD_Optimistic),
      pessimistic_Scalar: safeNum(row.pessimistic_Scalar),
      PIT_PD_Pessimistic: safeNum(row.PIT_PD_Pessimistic),
      Bobot_Normal: safeNum(row.Bobot_Normal),
      Bobot_Best: safeNum(row.Bobot_Best),
      Bobot_Worst: safeNum(row.Bobot_Worst),
      Final_Weight_PIT_PD: safeNum(row.Final_Weight_PIT_PD),
    }));

    // Grouping Data Berdasarkan Kombinasi Pembobotan
    const groupsMap: { [key: string]: GroupedData } = {};
    formattedData.forEach((row) => {
      const key = `${row.Bobot_Normal}-${row.Bobot_Best}-${row.Bobot_Worst}`;
      if (!groupsMap[key]) {
        groupsMap[key] = {
          key,
          bobotNormal: row.Bobot_Normal,
          bobotBest: row.Bobot_Best,
          bobotWorst: row.Bobot_Worst,
          rows: [],
        };
      }
      groupsMap[key].rows.push(row);
    });
    const groupedData = Object.values(groupsMap);

    // 2. Inisialisasi Excel Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistem Regulator Dashboard";
    workbook.created = new Date();

    const ws = workbook.addWorksheet("Matriks_Konversi");
    ws.views = [{ showGridLines: true }];

    // Style Constants
    const fontTitle = { name: "Calibri", size: 14, bold: true, color: { argb: "1E293B" } };
    const fontSubTitle = { name: "Calibri", size: 11, bold: true, color: { argb: "334155" } };
    const fontHeaderGroup = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFF" } };
    const fontGroupLabel = { name: "Calibri", size: 11, bold: true, color: { argb: "0F172A" } };
    
    const borderThin = {
      top: { style: "thin", color: { argb: "CBD5E1" } },
      left: { style: "thin", color: { argb: "CBD5E1" } },
      bottom: { style: "thin", color: { argb: "CBD5E1" } },
      right: { style: "thin", color: { argb: "CBD5E1" } },
    } as const;

    // Title Section
    ws.mergeCells("A1:I1");
    ws.getCell("A1").value = (bankName || "PT BANK MUAMALAT INDONESIA TBK").toUpperCase();
    ws.getCell("A1").font = fontTitle;
    ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("A2:I2");
    ws.getCell("A2").value = "LAPORAN MATRIKS KONVERSI TTC KE PIT PD";
    ws.getCell("A2").font = fontSubTitle;
    ws.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };

    ws.addRow([]);
    const rowPeriode = ws.addRow(["Periode Pelaporan :", periode]);
    rowPeriode.getCell(1).font = { bold: true };
    ws.addRow([]);

    let currentRow = 6;

    // 3. Render Tabel & Audit Note Per Kelompok Pembobotan
    groupedData.forEach((group, groupIdx) => {
      // Label Kelompok
      ws.mergeCells(`A${currentRow}:I${currentRow}`);
      const cellLabel = ws.getCell(`A${currentRow}`);
      cellLabel.value = `Kelompok Skenario ${groupIdx + 1}: Skenario (Baseline ${group.bobotNormal}% | Best ${group.bobotBest}% | Worst ${group.bobotWorst}%)`;
      cellLabel.font = fontGroupLabel;
      cellLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
      cellLabel.alignment = { vertical: "middle" };
      currentRow++;

      // Row Header Bertingkat
      const headRow1 = currentRow;
      const headRow2 = currentRow + 1;

      ws.mergeCells(`A${headRow1}:A${headRow2}`);
      ws.getCell(`A${headRow1}`).value = "SEGMENT ID";

      ws.mergeCells(`B${headRow1}:B${headRow2}`);
      ws.getCell(`B${headRow1}`).value = "TTC PD BASE (%)";

      ws.mergeCells(`C${headRow1}:D${headRow1}`);
      ws.getCell(`C${headRow1}`).value = `NORMAL (Bobot: ${group.bobotNormal}%)`;

      ws.mergeCells(`E${headRow1}:F${headRow1}`);
      ws.getCell(`E${headRow1}`).value = `OPTIMISTIC (Bobot: ${group.bobotBest}%)`;

      ws.mergeCells(`G${headRow1}:H${headRow1}`);
      ws.getCell(`G${headRow1}`).value = `PESSIMISTIC (Bobot: ${group.bobotWorst}%)`;

      ws.mergeCells(`I${headRow1}:I${headRow2}`);
      ws.getCell(`I${headRow1}`).value = "FINAL WEIGHT PIT PD (%)";

      // Sub Headers
      ws.getCell(`C${headRow2}`).value = "SCALAR";
      ws.getCell(`D${headRow2}`).value = "PIT PD (%)";
      ws.getCell(`E${headRow2}`).value = "SCALAR";
      ws.getCell(`F${headRow2}`).value = "PIT PD (%)";
      ws.getCell(`G${headRow2}`).value = "SCALAR";
      ws.getCell(`H${headRow2}`).value = "PIT PD (%)";

      // Apply Style Header
      [headRow1, headRow2].forEach((rNum) => {
        const row = ws.getRow(rNum);
        row.font = fontHeaderGroup;
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E293B" } };
          cell.border = borderThin;
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      });

      currentRow += 2;

      // Populate Data Rows
      group.rows.forEach((row) => {
        const addedRow = ws.addRow([
          row.segment_id,
          row.TTC_PD_Base / 100,
          row.BaseLine_Scalar,
          row.PIT_PD_Baseline / 100,
          row.optimistic_Scalar,
          row.PIT_PD_Optimistic / 100,
          row.pessimistic_Scalar,
          row.PIT_PD_Pessimistic / 100,
          row.Final_Weight_PIT_PD / 100,
        ]);

        addedRow.eachCell((cell, colIdx) => {
          cell.border = borderThin;
          if (colIdx === 1) {
            cell.alignment = { horizontal: "left", vertical: "middle" };
          } else if ([3, 5, 7].includes(colIdx)) {
            cell.numFmt = "#,##0.0000";
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else {
            cell.numFmt = "0.0000%";
            cell.alignment = { horizontal: "right", vertical: "middle" };
          }
        });

        currentRow++;
      });

      // Hitung Evaluasi Total Bobot & Validity
      const totalBobot = Number((group.bobotNormal + group.bobotBest + group.bobotWorst).toFixed(2));
      const isValid = totalBobot === 100;
      const deviasi = Number((totalBobot - 100).toFixed(2));
      const deviasiText = deviasi >= 0 ? `+${deviasi}` : `${deviasi}`;

      // Catatan Audit Sistem
      ws.addRow([]);
      currentRow++;

      ws.getCell(`A${currentRow}`).value = "CATATAN AUDIT SISTEM:";
      ws.getCell(`A${currentRow}`).font = { name: "Calibri", size: 9, bold: true };
      currentRow++;

      ws.mergeCells(`A${currentRow}:I${currentRow}`);
      const note1Cell = ws.getCell(`A${currentRow}`);
      note1Cell.value = `1. WEIGHTING CHECK (100% RULE): Sistem telah mengevaluasi agregasi bobot probabilitas skenario (Baseline ${group.bobotNormal}% + Optimistic ${group.bobotBest}% + Pessimistic ${group.bobotWorst}%) = ${totalBobot}%. Status kalkulasi: ${
        isValid ? "UNLOCKED & VALID" : `LOCKED & INVALID (DEVIASI ${deviasiText}%)`
      }.`;
      note1Cell.font = { 
        name: "Calibri", 
        size: 9, 
        bold: true, 
        color: { argb: isValid ? "166534" : "991B1B" } 
      };
      currentRow++;

      ws.mergeCells(`A${currentRow}:I${currentRow}`);
      const note2Cell = ws.getCell(`A${currentRow}`);
      note2Cell.value = isValid
        ? `2. METODOLOGI: Final Weighted PIT PD = (PIT PD Baseline * ${group.bobotNormal}%) + (PIT PD Optimistic * ${group.bobotBest}%) + (PIT PD Pessimistic * ${group.bobotWorst}%).`
        : `2. METODOLOGI: Kalkulasi Final Weighted PIT PD ditahan oleh sistem karena total pembobotan skenario tidak memenuhi kaidah konsistensi 100% Rule. Harap perbarui parameter bobot(paramECLBobot).`;
      note2Cell.font = { 
        name: "Calibri", 
        size: 9, 
        italic: true, 
        color: { argb: isValid ? "334155" : "991B1B" } 
      };

      currentRow += 3; // Spasi sebelum kelompok berikutnya
    });

    // Custom Lebar Kolom
    ws.columns = [
      { width: 22 }, // Segment ID
      { width: 18 }, // TTC PD Base
      { width: 16 }, // Baseline Scalar
      { width: 18 }, // PIT Baseline
      { width: 16 }, // Optimistic Scalar
      { width: 18 }, // PIT Optimistic
      { width: 16 }, // Pessimistic Scalar
      { width: 18 }, // PIT Pessimistic
      { width: 24 }, // Final Weight
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Laporan_Matriks_Konversi_TTC_ke_PIT_PD_${periode}.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("❌ Error generating Matriks Konversi Excel:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}