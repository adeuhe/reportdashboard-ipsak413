import { getPool } from "@/lib/db";
import sql from "mssql";

export interface SimulasiDampakFinansialData {
  Tanggal_Laporan: Date | string;
  Nomor_rekening: string;
  Kode_Segment: string;
  Jenis_Akad: string;
  StageOri: number;
  BucketOri: number;
  PD_Berdasarkan_DPD: number;
  Stage: number;
  Bucket: number;
  DPD: number;
  PD_Parameter_SICR: number;
  LGD: number;
  Baki_Debet: number;
  ECL_Berdasarkan_DPD: number;
  ECL_Berdasarkan_SICR: number;
  Selisih_ECL: number;
}

// Fungsi untuk mengambil tanggal terbaru di database
export async function getLatestTanggalLaporan(): Promise<string> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT CONVERT(VARCHAR(10), MAX(Tanggal_Laporan), 120) AS LatestDate 
    FROM Kredit 
    WHERE Bucket <> BucketOri
  `);
  
  return result.recordset[0]?.LatestDate || "2025-12-31";
}

export async function getSimulasiDampakFinansialData(
  tanggalLaporan?: string,
  kodeSegment?: string
): Promise<SimulasiDampakFinansialData[]> {
  const pool = await getPool();
  const request = pool.request();

  // Jika tanggalLaporan tidak dikirim, ambil MAX(Tanggal_Laporan) dari DB
  let targetDate = tanggalLaporan;
  if (!targetDate) {
    targetDate = await getLatestTanggalLaporan();
  }

  let whereClause = "WHERE k.Bucket <> k.BucketOri";
  request.input("tanggalLaporan", sql.Date, targetDate);
  whereClause += " AND CAST(k.Tanggal_Laporan AS DATE) = @tanggalLaporan";

  if (kodeSegment && kodeSegment !== "ALL") {
    request.input("kodeSegment", sql.VarChar, kodeSegment);
    whereClause += " AND k.Kode_Segment = @kodeSegment";
  }

  const queryStr = `
    DECLARE @tanggal_pd DATE = (SELECT MIN(periode) AS tanggal_pd FROM PD_Yearly_MPDBobot_to_ECL);

    SELECT 
      k.Tanggal_Laporan,
      k.Nomor_rekening,
      k.Kode_Segment,
      b.KETERANGAN Jenis_Akad,
      k.StageOri,
      k.BucketOri as Bucket_DPD,
      CASE WHEN k.StageOri = 2 THEN 1.0 ELSE pdOri.value END AS PD_Berdasarkan_DPD,
      k.Stage,
      k.Bucket as Bucket_SICR,
      k.DPD,
      CASE WHEN k.Stage = 2 THEN 1.0 ELSE pd.value END AS PD_Parameter_SICR,
      lgd.LGD,
      k.Baki_Debet,
      (CASE WHEN k.StageOri = 2 THEN 1.0 ELSE pdOri.value END * lgd.LGD * k.Baki_Debet) AS ECL_Berdasarkan_DPD,
      (CASE WHEN k.Stage = 2 THEN 1.0 ELSE pd.value END * lgd.LGD * k.Baki_Debet) AS ECL_Berdasarkan_SICR,
      ((CASE WHEN k.Stage = 2 THEN 1.0 ELSE pd.value END * lgd.LGD * k.Baki_Debet) - 
       (CASE WHEN k.StageOri = 2 THEN 1.0 ELSE pdOri.value END * lgd.LGD * k.Baki_Debet)) AS Selisih_ECL
    FROM Kredit k 
    LEFT JOIN PD_Yearly_MPDBobot_to_ECL pd 
      ON pd.periode = DATEFROMPARTS(YEAR(@tanggal_pd), 12, 31) 
      AND pd.segment_id = k.Kode_Segment 
      AND pd.start_bucket_group = k.Bucket 
      AND pd.Notes = 'NORMAL' 
      AND pd.end_bucket_group = 5
    LEFT JOIN PD_Yearly_MPDBobot_to_ECL pdOri 
      ON pdOri.periode = DATEFROMPARTS(YEAR(@tanggal_pd), 12, 31) 
      AND pdOri.segment_id = k.Kode_Segment 
      AND pdOri.start_bucket_group = k.BucketOri 
      AND pdOri.Notes = 'NORMAL' 
      AND pdOri.end_bucket_group = 5
    LEFT JOIN LGD_Calculation_to_ECL lgd 
      ON lgd.segmen = k.Kode_Segment
      left join Ref_JenisAkad b on k.Jenis_Akad = b.SANDI
    ${whereClause}
    ORDER BY k.Nomor_rekening ASC
  `;

  const result = await request.query(queryStr);
  return result.recordset;
}