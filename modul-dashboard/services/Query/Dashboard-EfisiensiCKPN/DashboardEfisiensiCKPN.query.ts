import { getPool } from "@/lib/db";
import sql from "mssql";

export interface EfisiensiCKPNSegmentRow {
  Tanggal_Laporan: string;
  Segment?: number | string;
  LGD_avg: number;
  Baki_Debet: number;
  ECL_Final: number;
  Cure_Rate_avg: number; // Nilai cure rate dari DB (misal 0.2306 atau 23.06%)
  grafik_kuning: number;
  grafik_merah: number;
  grafik_hijau: number;
}

export interface SegmentOption {
  Segment: number | string;
}

/**
 * 1. Helper: Ambil Tanggal Laporan terbaru
 */
export async function getLatestTanggalLaporan(): Promise<string | null> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<{ Tanggal_Laporan: string }>(`
      SELECT TOP 1 CONVERT(VARCHAR(10), Tanggal_Laporan, 120) AS Tanggal_Laporan
      FROM iPSAK71..CKPN_Final 
      ORDER BY Tanggal_Laporan DESC
    `);
    return result.recordset[0]?.Tanggal_Laporan || null;
  } catch (error) {
    console.error("Error getLatestTanggalLaporan:", error);
    return null;
  }
}

/**
 * 2. Ambil Opsi Segment Unik
 */
export async function getSegmentOptions(): Promise<SegmentOption[]> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<SegmentOption>(`
      SELECT DISTINCT Segment 
      FROM iPSAK71..CKPN_Final
      WHERE Segment IS NOT NULL
      ORDER BY Segment ASC
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error getSegmentOptions:", error);
    return [];
  }
}

/**
 * 3. Ambil Nilai Default Cure Rate PD (%) dari PD_TTC_Anomali_to_ECL
 */
export async function getCureRatePD(segment?: string | number): Promise<number> {
  try {
    const pool = await getPool();
    const request = pool.request();

    if (segment && segment !== "ALL") {
      request.input("segmentId", sql.VarChar, String(segment));
      const query = `
        SELECT ISNULL(persentase, 0) AS cureRate
        FROM iPSAK71..PD_TTC_Anomali_to_ECL
        WHERE start_bucket_group = 5 
          AND end_bucket_group = 1 
          AND segment_id = @segmentId
      `;
      const result = await request.query<{ cureRate: number }>(query);
      return result.recordset[0]?.cureRate ?? 0;
    } else {
      const query = `
        SELECT AVG(persentase) AS cureRate
        FROM iPSAK71..PD_TTC_Anomali_to_ECL
        WHERE start_bucket_group = 5 
          AND end_bucket_group = 1 
          AND segment_id <> '99'
      `;
      const result = await request.query<{ cureRate: number }>(query);
      return result.recordset[0]?.cureRate ?? 0;
    }
  } catch (error) {
    console.error("Error getCureRatePD:", error);
    return 0;
  }
}

/**
 * 4. Query Agregat Data Efisiensi CKPN (JOIN ke PD_TTC_Anomali_to_ECL)
 */
 
export async function getEfisiensiCKPNData(
  tanggalLaporan: string,
  segment?: string | number
): Promise<EfisiensiCKPNSegmentRow[]> {
  const pool = await getPool();
  const request = pool.request();

  request.input("tanggalLaporan", sql.VarChar, tanggalLaporan);

  let whereSegment = "";
  if (segment && segment !== "ALL") {
    request.input("segment", sql.VarChar, String(segment));
    whereSegment = "AND k.Segment = @segment";
  }

  const query = `
    SELECT 
      CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) AS Tanggal_Laporan,
      ${segment && segment !== "ALL" ? "k.Segment," : ""}
      ISNULL(AVG(CAST(lgd.LGD AS FLOAT)), 0) AS LGD_avg,
      ISNULL(SUM(CAST(k.Outstanding AS FLOAT)), 0) AS Baki_Debet,
      ISNULL(SUM(CAST(k.ECL_Final AS FLOAT)), 0) AS ECL_Final,
      ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) AS Cure_Rate_avg,
      
      -- Calculation Safe Check
      CASE 
        WHEN SUM(CAST(k.Outstanding AS FLOAT)) > 0 
        THEN SUM(CAST(k.ECL_Final AS FLOAT)) / SUM(CAST(k.Outstanding AS FLOAT))
        ELSE 0 
      END AS grafik_kuning,

      SUM(CAST(k.ECL_Final AS FLOAT)) - (
        SUM(CAST(k.ECL_Final AS FLOAT)) * ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) 
        / NULLIF(AVG(CAST(lgd.LGD AS FLOAT)), 0)
      ) AS grafik_merah,

      SUM(CAST(k.ECL_Final AS FLOAT)) - (
        SUM(CAST(k.ECL_Final AS FLOAT)) - (
          SUM(CAST(k.ECL_Final AS FLOAT)) * ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) 
          / NULLIF(AVG(CAST(lgd.LGD AS FLOAT)), 0)
        )
      ) AS grafik_hijau

    FROM iPSAK71..CKPN_Final k 
    LEFT JOIN iPSAK71..LGD_Calculation_to_ECL lgd 
      ON CAST(lgd.segmen AS VARCHAR) = CAST(k.Segment AS VARCHAR)
    LEFT JOIN iPSAK71..PD_TTC_Anomali_to_ECL pd 
      ON CAST(pd.segment_id AS VARCHAR) = CAST(k.Segment AS VARCHAR)
     AND pd.start_bucket_group = 5 
     AND pd.end_bucket_group = 1
    
    WHERE CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) = @tanggalLaporan
    ${whereSegment}
    
    GROUP BY CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120)
    ${segment && segment !== "ALL" ? ", k.Segment" : ""}
  `;

  const result = await request.query<EfisiensiCKPNSegmentRow>(query);
  return result.recordset;
}

export interface ReportSimulasiRow {
  periodeData: string;
  segmenAkad: string;
  eadNetto: number;       // (A) Dalam Miliar
  cureRatePD: number;     // (B) Dalam Desimal (misal 0.10 untuk 10%)
  collateralRec: number;  // (C) Fixed (misal 0.20 untuk 20%)
  statusPerubahan: "Baseline" | "Efisiensi" | "Optimal";
}

export interface ReportSimulasiRow {
  periodeData: string;
  segmenAkad: string;
  eadNetto: number;       // (A) Dalam Miliar
  cureRatePD: number;     // (B) Dalam Desimal (misal 0.1456)
  collateralRec: number;  // (C) Fixed (0.20 / 20%)
  statusPerubahan: "Baseline" | "Efisiensi" | "Optimal";
}

/**
 * Fetch Data Report Simulasi LGD Rate (Dinamis berdasarkan Filter Tanggal Laporan & Segment)
 */
export interface ReportSimulasiRow {
  periodeData: string;
  segmenAkad: string;
  eadNetto: number;       // (A) Dalam Miliar
  cureRatePD: number;     // (B) Dalam Desimal
  collateralRec: number;  // (C) Fixed (0.20 / 20%)
  statusPerubahan: "Baseline" | "Efisiensi" | "Optimal";
}

/**
 * Fetch Data Report Simulasi LGD Rate dengan Join Table Segment
 */
export async function getReportSimulasiData(
  tanggalLaporan: string,
  segment?: string | number
): Promise<ReportSimulasiRow[]> {
  try {
    const pool = await getPool();
    const request = pool.request();

    request.input("tanggalLaporan", sql.VarChar, tanggalLaporan);

    let whereSegment = "";
    if (segment && segment !== "ALL") {
      request.input("segment", sql.VarChar, String(segment));
      whereSegment = "AND k.Segment = @segment";
    }

    const query = `
      SELECT 
        CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) AS periodeData,
        ISNULL(CAST(b.name AS VARCHAR), 'Lainnya') AS segmenAkad,
        ISNULL(SUM(CAST(k.Outstanding AS FLOAT)), 0) / 1000000000 AS eadNetto,
        ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) AS cureRatePD
      FROM iPSAK71..CKPN_Final k
      LEFT JOIN segment b 
        ON k.Segment = b.id
      LEFT JOIN iPSAK71..PD_TTC_Anomali_to_ECL pd 
        ON CAST(pd.segment_id AS VARCHAR) = CAST(k.Segment AS VARCHAR)
       AND pd.start_bucket_group = 5 
       AND pd.end_bucket_group = 1
      WHERE CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) = @tanggalLaporan
      ${whereSegment}
      GROUP BY CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120), b.name
      ORDER BY b.name ASC
    `;

    const result = await request.query(query);

    return result.recordset.map((row) => ({
      periodeData: row.periodeData,
      // langsung pakai string asli b.name tanpa menambahkan kata 'SEGMENT'
      segmenAkad: row.segmenAkad || "-", 
      eadNetto: row.eadNetto || 0,
      cureRatePD: row.cureRatePD || 0,
      collateralRec: 0.20, // Fixed 20%
      statusPerubahan:
        row.cureRatePD >= 0.30
          ? "Optimal"
          : row.cureRatePD > 0.10
          ? "Efisiensi"
          : "Baseline",
    }));
  } catch (error) {
    console.error("Error getReportSimulasiData:", error);
    return [];
  }
}
export interface CureRatePerformanceRow {
  Tanggal_Laporan: string;
  Jenis_Akad: string;
  LGD_avg: number;
  Baki_Debet: number;
  ECL_Final: number;
  Cure_Rate_avg: number;
  grafik_kuning: number;
  grafik_merah: number;
  grafik_hijau: number;
}

export async function getCureRatePerformanceData(
  tanggalLaporan: string,
  segment?: string | number
): Promise<CureRatePerformanceRow[]> {
  try {
    const pool = await getPool();
    const request = pool.request();

    request.input("tanggalLaporan", sql.VarChar, tanggalLaporan);

    let whereSegment = "";
    if (segment && segment !== "ALL") {
      request.input("segment", sql.VarChar, String(segment));
      whereSegment = "AND k.Segment = @segment";
    }

    const query = `
      SELECT 
        CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) AS Tanggal_Laporan,
        ISNULL(b.KETERANGAN, 'Lainnya') AS Jenis_Akad,
        ISNULL(AVG(CAST(lgd.LGD AS FLOAT)), 0) AS LGD_avg,
        ISNULL(SUM(CAST(k.Outstanding AS FLOAT)), 0) AS Baki_Debet,
        ISNULL(SUM(CAST(k.ECL_Final AS FLOAT)), 0) AS ECL_Final,
        
        /* Weighted Average Cure Rate berdasarkan Outstanding agar akurat */
        CASE 
          WHEN SUM(CAST(k.Outstanding AS FLOAT)) > 0 
          THEN SUM(CAST(k.Outstanding AS FLOAT) * ISNULL(CAST(pd.persentase AS FLOAT), 0)) / SUM(CAST(k.Outstanding AS FLOAT))
          ELSE ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0)
        END AS Cure_Rate_avg,
        
        CASE 
          WHEN SUM(CAST(k.Outstanding AS FLOAT)) > 0 
          THEN SUM(CAST(k.ECL_Final AS FLOAT)) / SUM(CAST(k.Outstanding AS FLOAT))
          ELSE 0 
        END AS grafik_kuning,

        SUM(CAST(k.ECL_Final AS FLOAT)) - (
          SUM(CAST(k.ECL_Final AS FLOAT)) * ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) 
          / NULLIF(AVG(CAST(lgd.LGD AS FLOAT)), 0)
        ) AS grafik_merah,

        SUM(CAST(k.ECL_Final AS FLOAT)) - (
          SUM(CAST(k.ECL_Final AS FLOAT)) - (
            SUM(CAST(k.ECL_Final AS FLOAT)) * ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) 
            / NULLIF(AVG(CAST(lgd.LGD AS FLOAT)), 0)
          )
        ) AS grafik_hijau

      FROM iPSAK71..CKPN_Final k 
      LEFT JOIN Ref_JenisAkad b 
        ON k.Jenis_Akad = b.SANDI
      LEFT JOIN iPSAK71..LGD_Calculation_to_ECL lgd 
        ON CAST(lgd.segmen AS VARCHAR) = CAST(k.Segment AS VARCHAR)
      LEFT JOIN iPSAK71..PD_TTC_Anomali_to_ECL pd 
        ON CAST(pd.segment_id AS VARCHAR) = CAST(k.Segment AS VARCHAR)
       AND pd.start_bucket_group = 5 
       AND pd.end_bucket_group = 1
      
      WHERE CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) = @tanggalLaporan
      ${whereSegment}

      GROUP BY CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120), b.KETERANGAN
      ORDER BY Cure_Rate_avg DESC
    `;

    const result = await request.query<CureRatePerformanceRow>(query);
    return result.recordset;
  } catch (error) {
    console.error("Error getCureRatePerformanceData:", error);
    return [];
  }
}

export const GET_CURE_RATE_PERFORMANCE_QUERY = `
  SELECT 
    CONVERT(VARCHAR(10), k.Tanggal_Laporan, 120) AS Tanggal_Laporan,
    b.KETERANGAN as Jenis_Akad,
    ISNULL(AVG(CAST(lgd.LGD AS FLOAT)), 0) AS LGD_avg,
    ISNULL(SUM(CAST(k.Outstanding AS FLOAT)), 0) AS Baki_Debet,
    ISNULL(SUM(CAST(k.ECL_Final AS FLOAT)), 0) AS ECL_Final,
    ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) AS Cure_Rate_avg,
    
    CASE 
      WHEN SUM(CAST(k.Outstanding AS FLOAT)) > 0 
      THEN SUM(CAST(k.ECL_Final AS FLOAT)) / SUM(CAST(k.Outstanding AS FLOAT))
      ELSE 0 
    END AS grafik_kuning,

    SUM(CAST(k.ECL_Final AS FLOAT)) - (
      SUM(CAST(k.ECL_Final AS FLOAT)) * ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) 
      / NULLIF(AVG(CAST(lgd.LGD AS FLOAT)), 0)
    ) AS grafik_merah,

    SUM(CAST(k.ECL_Final AS FLOAT)) - (
      SUM(CAST(k.ECL_Final AS FLOAT)) - (
        SUM(CAST(k.ECL_Final AS FLOAT)) * ISNULL(AVG(CAST(pd.persentase AS FLOAT)), 0) 
        / NULLIF(AVG(CAST(lgd.LGD AS FLOAT)), 0)
      )
    ) AS grafik_hijau

  FROM iPSAK71..CKPN_Final k 
  LEFT JOIN Ref_JenisAkad b ON k.Jenis_Akad = b.SANDI
  LEFT JOIN iPSAK71..LGD_Calculation_to_ECL lgd 
    ON CAST(lgd.segmen AS VARCHAR) = CAST(k.Segment AS VARCHAR)
  LEFT JOIN iPSAK71..PD_TTC_Anomali_to_ECL pd 
    ON CAST(pd.segment_id AS VARCHAR) = CAST(k.Segment AS VARCHAR)
   AND pd.start_bucket_group = 5 
   AND pd.end_bucket_group = 1
  GROUP BY k.Tanggal_Laporan, b.KETERANGAN
`;

// ==========================================
// INTERFACE & FUNCTION CURE RATE PERFORMANCE
// ==========================================

export interface CureRatePerformanceRow {
  Tanggal_Laporan: string;
  Jenis_Akad: string;
  LGD_avg: number;
  Baki_Debet: number;
  ECL_Final: number;
  Cure_Rate_avg: number;
  grafik_kuning: number;
  grafik_merah: number;
  grafik_hijau: number;
}

// Tambahkan fungsi ini di dalam file DashboardEfisiensiCKPN.query.ts

export async function getNamaBank(): Promise<string> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<{ KETERANGAN: string }>(`
      SELECT TOP 1 KETERANGAN 
      FROM Ref_NamaBank
    `);

    return result.recordset[0]?.KETERANGAN || "PT BANK MUAMALAT INDONESIA TBK";
  } catch (error) {
    console.error("Error executing getNamaBank query:", error);
    return "PT BANK MUAMALAT INDONESIA TBK";
  }
}