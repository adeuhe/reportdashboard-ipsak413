import { getPoolMID } from "@/lib/db";
import sql from "mssql";

export interface SegmentOption {
  name: string;
  id: number;           // makroekonomi_regresi.id
  id_klaster_pd: number;
}


export interface MacroScenarioCard {
  Scenario: string;
  Weight: number;
  GDP: number;
  BI_Rate: number;
}

/**
 * 1. Mengambil daftar Segmen & Regresi ID untuk Filter Dropdown
 */
export async function getSegmentOptions(): Promise<SegmentOption[]> {
  const pool = await getPoolMID();

  const result = await pool.request().query<SegmentOption>(`
    SELECT 
      b.name,
      a.id,
      a.id_klaster_pd 
    FROM makroekonomi_regresi a
    LEFT JOIN iPSAK71..segment b ON a.id_klaster_pd = b.id
    WHERE a.flagged = '1'
    GROUP BY b.name, a.id, a.id_klaster_pd
    ORDER BY a.id_klaster_pd ASC
  `);

  return result.recordset;
}

/**
 * 2. Mengambil Detail Dynamic Pivoted Regression Data berdasarkan Regresi ID / Segmen
 */
export interface PITPDDetailRow {
  nama_segment: string;
  jenis_periode: string;
  periode: string;
  z_regresi: number;
  TTC_PD_Base: number;
  PIT_PD_Baseline: number;
  PIT_PD_Optimistic: number;
  PIT_PD_Pessimistic: number;
  Final_Weight_PIT_PD: number;
  cycleEnd?: string;
  [key: string]: any;
}

export async function getPITPDRegressionData(regresiId?: number): Promise<{
  cycleEnd: string;
  data: PITPDDetailRow[];
}> {
  const pool = await getPoolMID();

  // Query cycle_end
  const cycleResult = await pool.request().query<{ cycleEndStr: string }>(`
    SELECT TOP 1 CONVERT(VARCHAR(10), cycle_end, 120) AS cycleEndStr 
    FROM pd_ttc_matrix 
    WHERE cycle_end IS NOT NULL 
    ORDER BY cycle_end DESC;
  `);

  // Pastikan selalu fallback ke string kosong "" alih-alih undefined
  const cycleEnd = cycleResult.recordset[0]?.cycleEndStr ?? "";

  const query = `
    DECLARE @tanggalMulai DATE = (SELECT TOP 1 cycle_end FROM pd_ttc_matrix);
    DECLARE @tanggalSelesai DATE = (SELECT TOP 1 DATEADD(year, 1, cycle_end) FROM pd_ttc_matrix);

    DECLARE @cols AS NVARCHAR(MAX), @query AS NVARCHAR(MAX);

    SELECT @cols = STUFF((
        SELECT DISTINCT ',' + QUOTENAME(v.variabel_label)
        FROM makroekonomi_regresi_variabel v
        JOIN makroekonomi_regresi r ON r.id = v.id_regresi
        WHERE (@regresiId IS NULL OR @regresiId = 0 OR v.id_regresi = @regresiId)
          AND v.is_intercept = 0
          AND r.flagged = 1
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

    IF @cols IS NULL OR @cols = ''
        SET @cols = '[NoVariable]';

    SET @query = N'
    WITH model AS (
        SELECT r.id,
               r.id_klaster_pd,
               r.periode_mulai,
               r.periode_selesai,
               r.odr_diff_level,
               r.standard_error,
               (
                   SELECT TOP (1) v.koefisien
                   FROM makroekonomi_regresi_variabel v
                   WHERE v.id_regresi = r.id
                     AND v.is_intercept = 1
                   ORDER BY v.id
               ) AS intercept
        FROM makroekonomi_regresi r
        WHERE (@regresiId IS NULL OR @regresiId = 0 OR r.id = @regresiId)
          AND r.flagged = 1
    ),
    variables AS (
        SELECT v.id,
               v.id_regresi,
               v.id_makroekonomi,
               v.variabel_label,
               v.koefisien,
               v.jenis_transform,
               v.differential_lag,
               v.lag_periods
        FROM makroekonomi_regresi_variabel v
        JOIN model m ON m.id = v.id_regresi
        WHERE v.is_intercept = 0
    ),
    periods AS (
        SELECT m.id AS id_regresi,
               CAST(''HISTORIS'' AS varchar(10)) AS jenis_periode,
               o.periode,
               o.nilai_zscore AS z_actual,
               o.nilai_odr AS odr_persen_actual,
               b.odr_zscore_projected AS z_projected_tersimpan,
               CAST(NULL AS decimal(24, 12)) AS odr_persen_normal,
               CAST(NULL AS decimal(24, 12)) AS odr_persen_optimis,
               CAST(NULL AS decimal(24, 12)) AS odr_persen_pesimis
        FROM model m
        JOIN odr_transform o
          ON o.id_klaster_pd = m.id_klaster_pd
          AND o.diff_level = m.odr_diff_level
          AND o.periode BETWEEN m.periode_mulai AND m.periode_selesai
        LEFT JOIN pd_odr_backtest b
          ON b.id_regresi = m.id
         AND b.periode = o.periode

        UNION ALL

        SELECT m.id AS id_regresi,
               CAST(''FORECAST'' AS varchar(10)) AS jenis_periode,
               p.periode,
               CAST(NULL AS decimal(24, 12)) AS z_actual,
               CAST(NULL AS decimal(24, 12)) AS odr_persen_actual,
               p.odr_zscore_normal AS z_projected_tersimpan,
               p.odr_persen_normal,
               p.odr_persen_optimis,
               p.odr_persen_pesimis
        FROM model m
        JOIN pd_odr_projection p ON p.id_regresi = m.id
    ),
    periods_filtered AS (
        SELECT *
        FROM periods
        WHERE (@tanggalMulai IS NULL OR periode >= @tanggalMulai)
          AND (@tanggalSelesai IS NULL OR periode <= @tanggalSelesai)
    ),
    detail AS (
        SELECT m.id AS id_regresi,
               m.id_klaster_pd,
               p.jenis_periode,
               p.periode,
               p.z_actual,
               p.odr_persen_actual,
               p.z_projected_tersimpan,
               p.odr_persen_normal,
               p.odr_persen_optimis,
               p.odr_persen_pesimis,
               m.odr_diff_level,
               m.standard_error,
               m.intercept,
               v.id AS urutan_variabel,
               v.id_makroekonomi,
               v.variabel_label,
               v.jenis_transform,
               v.differential_lag,
               v.lag_periods,
               DATEADD(month, -v.lag_periods, p.periode) AS tanggal_target,
               x.observed_date AS tanggal_sumber,
               x.nilai AS nilai_x,
               v.koefisien,
               v.koefisien * x.nilai AS kontribusi
        FROM periods_filtered p
        JOIN model m ON m.id = p.id_regresi
        JOIN variables v ON v.id_regresi = m.id
        OUTER APPLY (
            SELECT TOP (1) candidate.observed_date, candidate.nilai
            FROM (
                SELECT ms.observed_date, ms.nilai, 0 AS source_priority
                FROM makroekonomi_series ms
                WHERE v.jenis_transform = ''NONE''
                  AND ms.id_makroekonomi = v.id_makroekonomi

                UNION ALL

                SELECT mt.observed_date, mt.nilai_transform AS nilai, 0 AS source_priority
                FROM makroekonomi_transform mt
                WHERE v.jenis_transform <> ''NONE''
                  AND mt.id_makroekonomi = v.id_makroekonomi
                  AND mt.jenis_transform = v.jenis_transform
                  AND mt.differential_lag = v.differential_lag

                UNION ALL

                SELECT mf.observed_date, mf.nilai, 1 AS source_priority
                FROM makroekonomi_forecast mf
                WHERE p.jenis_periode = ''FORECAST''
                  AND mf.id_makroekonomi = v.id_makroekonomi
                  AND mf.jenis_transform = v.jenis_transform
                  AND mf.differential_lag = CASE
                      WHEN v.jenis_transform = ''NONE'' THEN 1
                      ELSE v.differential_lag
                  END
                  AND mf.skenario = ''NORMAL''
            ) candidate
            WHERE DATEADD(month, -v.lag_periods, p.periode) BETWEEN candidate.observed_date AND candidate.observed_date
               OR ABS(DATEDIFF(day, DATEADD(month, -v.lag_periods, p.periode), candidate.observed_date))
                     <= CASE WHEN p.jenis_periode = ''HISTORIS'' THEN 90 ELSE 45 END
            ORDER BY ABS(DATEDIFF(day, DATEADD(month, -v.lag_periods, p.periode), candidate.observed_date)),
                     candidate.source_priority DESC,
                     candidate.observed_date ASC
        ) x
    ),
    calculation AS (
        SELECT id_regresi,
               jenis_periode,
               periode,
               CASE WHEN COUNT(nilai_x) = COUNT(*)
                    THEN MAX(intercept) + SUM(kontribusi)
               END AS z_regresi
        FROM detail
        GROUP BY id_regresi, jenis_periode, periode
    ),
    TableForTTC2 AS (
        SELECT 
            AVG(Persentase_Anomali) AS TTC_BASE,
            segment_id
        FROM iPSAK71..PD_TTC_Anomali_to_ECL
        WHERE start_bucket_group <> 5
          AND end_bucket_group = 5
          AND segment_id <> ''99''
        GROUP BY segment_id
    ),
    pd_metrics AS (
        SELECT
            a.segment_id,
            AVG(b.TTC_BASE) * 100 AS TTC_PD_Base,
            AVG(CASE WHEN Notes = ''NORMAL'' THEN value END) * 100 AS PIT_PD_Baseline,
            AVG(CASE WHEN Notes = ''BEST'' THEN value END) * 100 AS PIT_PD_Optimistic,
            AVG(CASE WHEN Notes = ''WORST'' THEN value END) * 100 AS PIT_PD_Pessimistic,
            MAX(c.Asumsi_CKPN_Normal) AS Bobot_Normal,
            MAX(c.Asumsi_CKPN_Best) AS Bobot_Best,
            MAX(c.Asumsi_CKPN_Worst) AS Bobot_Worst,
            (
                (AVG(CASE WHEN Notes = ''NORMAL'' THEN value END) * MAX(c.Asumsi_CKPN_Normal) / 100) +
                (AVG(CASE WHEN Notes = ''WORST'' THEN value END) * MAX(c.Asumsi_CKPN_Worst) / 100) +
                (AVG(CASE WHEN Notes = ''BEST'' THEN value END) * MAX(c.Asumsi_CKPN_Best) / 100)
            ) * 100 AS Final_Weight_PIT_PD
        FROM iPSAK71..PD_Yearly_MPDBobot_to_ECL a
        INNER JOIN TableForTTC2 b ON a.segment_id = b.segment_id
        INNER JOIN iPSAK71..paramECLBobot c ON a.segment_id = c.Segment
        WHERE a.periode = ''2026-12-31''
          AND a.start_bucket_group <> 5
        GROUP BY a.segment_id
    )
    SELECT 
        s.name AS nama_segment,
        piv.jenis_periode,
        CONVERT(VARCHAR(10), piv.periode, 120) AS periode,
        c.z_regresi,
        ' + @cols + ',
        pm.TTC_PD_Base,
        pm.PIT_PD_Baseline,
        pm.PIT_PD_Optimistic,
        pm.PIT_PD_Pessimistic,
        pm.Final_Weight_PIT_PD
    FROM (
        SELECT id_regresi, id_klaster_pd, jenis_periode, periode, variabel_label, nilai_x
        FROM detail
    ) AS SourceTable
    PIVOT (
        MAX(nilai_x)
        FOR variabel_label IN (' + @cols + ')
    ) AS piv
    JOIN calculation c 
      ON c.id_regresi = piv.id_regresi
     AND c.jenis_periode = piv.jenis_periode 
     AND c.periode = piv.periode
    LEFT JOIN iPSAK71..segment s 
      ON s.id = piv.id_klaster_pd
    LEFT JOIN pd_metrics pm
      ON pm.segment_id = CAST(piv.id_klaster_pd AS VARCHAR(10))
    ORDER BY piv.id_klaster_pd ASC, piv.periode ASC, piv.jenis_periode ASC;
    ';

    EXEC sp_executesql @query, N'@regresiId INT, @tanggalMulai DATE, @tanggalSelesai DATE', @regresiId, @tanggalMulai, @tanggalSelesai;
  `;

  const request = pool.request();
  request.input("regresiId", sql.Int, regresiId ?? 0);
  const result = await request.query<PITPDDetailRow>(query);

  return {
    cycleEnd,
    data: result.recordset || [],
  };
}