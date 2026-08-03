import { getPool } from "@/lib/db";
import sql from "mssql";

// Query Utama Data Audit Trail
export async function getDefinisiAuditTrailFasilitasAsalUsulAnomaliData(segment?: string) {
  const pool = await getPool();
  const request = pool.request();

  let whereClause = "WHERE Akar_Penyebab = 'OVER-COLLATERALIZED'";

  // Jika segment diisi dan bukan 'ALL'
  if (segment && segment !== "ALL") {
    request.input("segmentParam", sql.VarChar, `%${segment}%`);
    request.input("segmentExact", sql.VarChar, segment);

    // Filter fleksibel: mengecek d.id (ID Segmen) ATAU d.name (Nama Segmen)
    whereClause += ` AND (
      CAST(segment_id AS VARCHAR) = @segmentExact 
      OR segment_name LIKE @segmentParam
    )`;
  }

  const queryStr = `
    WITH DefinisiAuditTrailFasilitasAsalUsulAnomali AS (
      SELECT 
        a.Tanggal_Laporan AS Tanggal_Laporan,
        a.Segment AS segment_id,
        d.name AS segment,
        d.name AS segment_name,
        a.Nomor_rekening AS Nomor_rekening,
        c.KETERANGAN AS Jenis_Akad,
        b.Keterangan AS Tipe_Agunan,
        (a.Nilai_Agunan - a.Nominal_Haircut) AS Nilai_Pasar,
        a.Haircut AS Total_Haircut,
        (a.Nilai_Agunan - a.Nominal_Haircut) * (1 - (ISNULL(a.Haircut, 0))) AS NRV,
        a.Baki_Debet AS EAD_Netto,
        ((a.Nilai_Agunan - a.Nominal_Haircut) * (1 - (ISNULL(a.Haircut, 0)))) - a.Baki_Debet AS Surplus,
        CASE 
          WHEN (agn.Nilai_AppraisalCollateral * (1 - (ISNULL(a.Haircut, 0)))) - a.Baki_Debet > 0 THEN 'OVER-COLLATERALIZED' 
          ELSE '' 
        END AS Akar_Penyebab
      FROM Source_LGD_Collateral_Recovery A
      LEFT JOIN Ref_Agunan B ON a.Jenis_Agunan = b.tipeAgunan
      LEFT JOIN Ref_JenisAkad C ON a.Jenis_Akad = c.SANDI
      LEFT JOIN Agunan agn ON a.Nomor_rekening = agn.Nomor_rekening
      LEFT JOIN segment d ON A.Segment = d.id and d.KodeForm = 'LGD'
    )
    SELECT * 
    FROM DefinisiAuditTrailFasilitasAsalUsulAnomali
    ${whereClause};
  `;

  const result = await request.query(queryStr);
  return result.recordset;
}

// Query Option Segment
export async function getSegmentOptions() {
  const pool = await getPool();
  const queryStr = `
    SELECT DISTINCT CAST(segment AS VARCHAR) AS segment 
    FROM Source_LGD_Collateral_Recovery 
    WHERE segment IS NOT NULL
    ORDER BY segment ASC;
  `;
  const result = await pool.request().query(queryStr);
  return result.recordset?.map((row: any) => String(row.segment)) || [];
}

// Query Nama Bank
export async function getNamaBank() {
  const pool = await getPool();
  const queryStr = `
    SELECT sandi, keterangan 
    FROM ref_NamaBank WITH (NOLOCK)
    ORDER BY keterangan ASC;
  `;

  const result = await pool.request().query(queryStr);
  return result.recordset?.[0]?.keterangan || "PT BANK MUAMALAT INDONESIA TBK";
}