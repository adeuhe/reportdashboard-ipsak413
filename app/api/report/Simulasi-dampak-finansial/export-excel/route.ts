import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { fetchSimulasiDampakFinansialService } from "@/report/services/Simulasi-dampak-finansial/SimulasiDampakFinansial.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || undefined;
    const segment = searchParams.get("segment") || undefined;

    const { data, summary } = await fetchSimulasiDampakFinansialService(date, segment);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Simulasi Dampak Finansial");

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 2,
      }).format(val);
    };

    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "PT BANK MUAMALAT INDONESIA TBK";
    titleCell.font = { size: 14, bold: true, color: { argb: "FF1E3A8A" } };
    titleCell.alignment = { horizontal: "center" };

    worksheet.mergeCells("A2:H2");
    const subTitleCell = worksheet.getCell("A2");
    subTitleCell.value =
      "FIXED REPORT: SIMULASI DAMPAK FINANSIAL (UNDER-PROVISIONING) AKIBAT KETIDAKLENGKAPAN VARIABEL SICR";
    subTitleCell.font = { size: 10, bold: true };
    subTitleCell.alignment = { horizontal: "center" };

    worksheet.mergeCells("A3:H3");
    const infoCell = worksheet.getCell("A3");
    infoCell.value = `Tanggal Simulasi: ${date || "All"} | Segmen: ${segment || "Hidden Risk (Stage 1 to Stage 2 Migration)"}`;
    infoCell.font = { size: 9, italic: true, color: { argb: "FF555555" } };
    infoCell.alignment = { horizontal: "center" };

    worksheet.addRow([]);

    worksheet.addRow(["TOTAL FASILITAS TERDAMPAK", ":", `${summary.totalFasilitas} Rekening`]);
    worksheet.addRow([
      "TOTAL UNDER-PROVISIONING (Rp)",
      ":",
      formatCurrency(summary.totalUnderProvisioning),
      "<-- POTENSI KEKURANGAN PENCADANGAN!",
    ]);

    worksheet.addRow([]);

    const headers = [
      "No. Fasilitas",
      "Akad",
      "EAD (Exposure)",
      "Stage As-Is",
      "Stage To-Be",
      "ECL As-Is (DPD Only)",
      "ECL To-Be (PSAK413)",
      "Selisih ECL (Under-Provisioning)",
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E3A8A" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    data.forEach((item) => {
      const row = worksheet.addRow([
        item.Nomor_rekening,
        item.Jenis_Akad,
        item.Baki_Debet,
        `STAGE_${item.StageOri}`,
        `STAGE_${item.Stage}`,
        item.ECL_Berdasarkan_DPD,
        item.ECL_Berdasarkan_SICR,
        item.Selisih_ECL,
      ]);

      row.getCell(3).numFmt = '"Rp "#,##0.00';
      row.getCell(6).numFmt = '"Rp "#,##0.00';
      row.getCell(7).numFmt = '"Rp "#,##0.00';
      row.getCell(8).numFmt = '"Rp "#,##0.00';
    });

    worksheet.columns.forEach((col) => {
      col.width = 24;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Simulasi_Dampak_Finansial_${date || "All"}.xlsx`,
      },
    });
  } catch (error: any) {
    console.error("Export Excel Error:", error);
    return NextResponse.json(
      { message: "Gagal membuat laporan Excel", error: error.message },
      { status: 500 }
    );
  }
}