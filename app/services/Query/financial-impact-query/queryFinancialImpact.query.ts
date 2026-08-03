import { getPool } from "@/lib/db";
// import sql from "mssql";
export async function getDataECLTrend() {
    const pool = await getPool();
    const result = await pool.request().query(`
WITH all_data AS (
    -- MENGAMBIL DATA LANGSUNG DARI TABEL DASHBOARD_CKPN_FINAL
    SELECT 
        EOMONTH(Tanggal_Laporan) AS Periode,
        ISNULL(ECL_Final, 0) AS ECL
    FROM Dashboard_CKPN_Final
),
agg_monthly AS (
    SELECT 
        Periode,
        SUM(ECL) AS impact,
        5000000 AS target 
    FROM all_data
    GROUP BY Periode
),
ranked_data AS (
    SELECT *,
        LAG(impact) OVER (ORDER BY Periode ASC) AS prev_impact,
        ROW_NUMBER() OVER (ORDER BY Periode DESC) AS rn
    FROM agg_monthly
),
final_trend AS (
    SELECT 
        FORMAT(Periode, 'MMM') AS month,
        impact,
        target,
        Periode,
        -- Hitung MoM %
        CASE 
            WHEN prev_impact IS NULL OR prev_impact = 0 THEN 0 
            ELSE ((impact - prev_impact) / prev_impact) * 100 
        END AS mom_percent
    FROM ranked_data
    WHERE rn <= 6
),
-- Mencari data bulan dengan performa paling signifikan (Critical atau Terbaru)
top_issue AS (
    SELECT TOP 1 *
    FROM final_trend
    ORDER BY 
        CASE WHEN mom_percent >= (select threshold_val from Master_Risk_Threshold where nama_rule = 'ECL_SPIKE') THEN 1 ELSE 0 END DESC, -- Prioritas Critical
        ABS(mom_percent) DESC, -- Prioritas perubahan terbesar
        Periode DESC -- Prioritas bulan terbaru
),
-- Mengambil Rule dari Master Table berdasarkan nilai mom_percent
matched_rule AS (
    SELECT 
        t.*,
        m.nama_rule,
        m.pesan_template,
        m.threshold_val
    FROM top_issue t
    CROSS JOIN Master_Risk_Threshold m
    WHERE m.kategori = 'FINANCIAL_IMPACT' AND (
        (t.mom_percent >= m.threshold_val AND m.operator = '>=') -- Cocokkan Rule Spike
        OR
        (t.mom_percent < m.threshold_val AND m.operator = '<') -- Cocokkan Rule Recovery
        OR 
        (m.operator = 'ELSE' AND t.mom_percent BETWEEN 0 AND (select threshold_val from Master_Risk_Threshold where nama_rule = 'ECL_SPIKE')) -- Cocokkan Rule Stable
    )
),
insight_logic AS (
    SELECT 
        CASE WHEN mom_percent >= (select threshold_val from Master_Risk_Threshold where nama_rule = 'ECL_SPIKE') THEN 1 ELSE 0 END AS isCritical,
        
        CASE 
            WHEN nama_rule = 'ECL_SPIKE' THEN 'Peringatan: Lonjakan Risiko Terdeteksi'
            WHEN nama_rule = 'ECL_RECOVERY' THEN 'Kinerja Positif: Penurunan Risiko'
            ELSE 'Kondisi Stabil'
        END AS title,

        -- LOGIKA REPLACE TEMPLATE DINAMIS
        -- PERBAIKAN: Menambahkan CAST(pesan_template AS VARCHAR(MAX))
        REPLACE(
            REPLACE(
                REPLACE(CAST(pesan_template AS VARCHAR(MAX)), 
                    '{percent}', CAST(ROUND(ABS(mom_percent), 2) AS DECIMAL(10,2))
                ), 
                '{month}', FORMAT(Periode, 'MMMM')
            ),
            '{threshold}', CAST(threshold_val AS VARCHAR)
        ) AS message
    FROM matched_rule
)

-- OUTPUT FINAL
SELECT 
    t.month,
    t.impact,
    t.target,
    CASE WHEN t.mom_percent >= (select threshold_val from Master_Risk_Threshold where nama_rule = 'ECL_SPIKE') THEN 1 ELSE 0 END AS monthly_isCritical, 
    i.isCritical, 
    i.title, 
    i.message
FROM final_trend t
CROSS JOIN insight_logic i
ORDER BY t.Periode ASC;
    `);

    return result.recordset; // <-- ganti [0] jadi seluruh array
}
export async function getDataImpactDIstribution() {
    const pool = await getPool();
    const result = await pool.request().query(`
DECLARE @car float;
declare @npf float;
declare @total float;
declare @posisiLaporan date;
set @posisiLaporan = (select EOMONTH(DATEADD(M,-1,DateNow)) as tanggal_laporan from Ref_CurrentDate)
set @npf = (select SUM(Saldo_Harga_Pokok)Saldo_Harga_Pokok from Dashboard_CKPN_Final where Tanggal_Laporan = @posisiLaporan and Stage = '2' )
set @total = (select SUM(Saldo_Harga_Pokok)Saldo_Harga_Pokok from Dashboard_CKPN_Final where Tanggal_Laporan = @posisiLaporan)
SELECT TOP 1 
    @car = car_ratio
FROM capital_adequacy
ORDER BY report_period DESC;
WITH all_data AS (
    -- 1. Mengambil data ECL dari kedua tabel utama
    SELECT 
        EOMONTH(Tanggal_Laporan) AS Periode,
        ISNULL(ECL_Final, 0) AS ECL,
        Segment
    FROM Dashboard_CKPN_Final
),

latest_periode AS (
    -- 2. Mencari periode laporan terakhir
    SELECT MAX(Periode) AS MaxPeriode FROM all_data
),

segment_mapping AS (
    -- 3. Mengambil penamaan segmen dinamis dengan STRING_AGG
    SELECT 
        a.Segment AS Kode_Segment,
        STRING_AGG(p.Parameter_1, ', ') AS Full_Segment_Name
    FROM (SELECT DISTINCT Segment FROM Dashboard_CKPN_Final) a
    JOIN (SELECT DISTINCT Kode_Segment, Parameter_1 FROM Mapping_Segment_LGD) p
        ON a.Segment = p.Kode_Segment
    GROUP BY a.Segment
),

distribution_data AS (
    -- 4. Agregasi ECL berdasarkan Segment untuk tabel distribusi
    SELECT 
        ISNULL(m.Full_Segment_Name, d.Segment + ' - Others') AS Segment_Name,
        SUM(d.ECL) AS total_ecl
    FROM all_data d
    LEFT JOIN segment_mapping m ON d.Segment = m.Kode_Segment
    WHERE d.Periode = (SELECT MaxPeriode FROM latest_periode)
    GROUP BY d.Segment, m.Full_Segment_Name
),

ECL_Summary_Total AS (
    -- 5. Total biaya ECL harian untuk perhitungan rasio
    SELECT SUM(ECL) AS Total_ECL_Charge FROM all_data
    WHERE Periode = (SELECT MaxPeriode FROM latest_periode)
),

Financial_Base AS (
    SELECT TOP 1
        Modal,
        Laba,
        Aset,
        ATMR AS RWA_Multiplier
    FROM Ref_Data_Eksternal
    WHERE Periode_Data = @posisiLaporan
),

Calculated_Ratios AS (
    -- 7. Menghitung Rasio Riil (CAR dan NPL Alert Level)
    SELECT 
        -- Logic CAR diperbarui: ((Modal - ECL) / (Aset * RWA * Bobot) * 100)
        -- Bobot menggunakan (2.5 / 100000.0) agar terbaca sebagai desimal dan tidak nol
        --((f.Modal - e.Total_ECL_Charge) / (f.Aset * f.RWA_Multiplier * (2.5 / 100000.0)) * 100) AS car_value,
        @car AS car_value,
        --(e.Total_ECL_Charge * 100.0 / NULLIF(f.Laba, 0)) AS npl_value
		(@npf/@total)*100 AS npl_value
    FROM Financial_Base f
    CROSS JOIN ECL_Summary_Total e
)

-- Output Final untuk konsumsi Frontend Dashboard
SELECT 
    d.Segment_Name AS name,
    d.total_ecl AS value,
    CAST(r.car_value AS DECIMAL(18,2)) AS car_value,
    CAST(r.npl_value AS DECIMAL(18,2)) AS npl_value
FROM distribution_data d
CROSS JOIN Calculated_Ratios r
ORDER BY d.total_ecl DESC;
    `);

    return result.recordset; // <-- ganti [0] jadi seluruh array
}

export async function getDataProfitDanLostImpact() {
    const pool = await getPool();
    const result = await pool.request().query(`
WITH RawData AS (
    -- Menggabungkan data dari kedua tabel utama
    SELECT 
        Tanggal_Laporan,
        ISNULL(ECL_Final, 0) AS ECL_Final,
        Segment
    FROM Dashboard_CKPN_Final
),
SegmentMapping AS (
    -- Mengambil penamaan segmen yang dinamis dari query yang Anda berikan
    SELECT 
        a.Segment AS Kode_Segment,
        a.Segment + ' - ' + STRING_AGG(p.Parameter_1, ', ') AS Full_Segment_Name
    FROM (SELECT DISTINCT Segment FROM Dashboard_CKPN_Final) a
    JOIN (SELECT DISTINCT Kode_Segment, Parameter_1 FROM Mapping_Segment_LGD) p
        ON a.Segment = p.Kode_Segment
    GROUP BY a.Segment
),
LatestData AS (
    -- Ambil total ECL harian terbaru untuk Box 1
    SELECT TOP 1 
        SUM(ECL_Final) AS Current_ECL_Charge,
        Tanggal_Laporan
    FROM RawData
    WHERE Tanggal_Laporan = (SELECT MAX(Tanggal_Laporan) FROM RawData)
    GROUP BY Tanggal_Laporan
),
Trend6Months AS (
    -- Data untuk Box 3: Profit Trend (6 Bulan Terakhir)
    --SELECT 
    --    FORMAT(EOMONTH(Tanggal_Laporan), 'MMM') AS month,
    --    SUM(ECL_Final) AS impact
    --FROM RawData
    --WHERE Tanggal_Laporan >= DATEADD(MONTH, -6, (SELECT MAX(Tanggal_Laporan) FROM RawData))
    --GROUP BY EOMONTH(Tanggal_Laporan) ---old
	    SELECT
        FORMAT(EOMONTH(Periode_Data), 'MMM') AS month,
        ISNULL(Laba,0) AS impact
    FROM Ref_Data_Eksternal
    WHERE Periode_Data >= DATEADD(
        MONTH,
        -6,
        (SELECT MAX(Periode_Data) FROM Ref_Data_Eksternal)
    )
),
BusinessDist AS (
    -- Data untuk Box 4: Business Unit Distribution menggunakan JOIN Mapping
    SELECT 
        ISNULL(m.Full_Segment_Name, 'Unknown - ' + r.Segment) AS name,
        SUM(r.ECL_Final) AS value
    FROM RawData r
    LEFT JOIN SegmentMapping m ON r.Segment = m.Kode_Segment
    WHERE r.Tanggal_Laporan = (SELECT MAX(Tanggal_Laporan) FROM RawData)
    GROUP BY r.Segment, m.Full_Segment_Name
)

-- Output utama untuk dikonsumsi Frontend
SELECT 
    (SELECT Current_ECL_Charge FROM LatestData) AS ECL_Charge_Month,
    (SELECT FORMAT((SELECT MAX(Tanggal_Laporan) FROM RawData), 'D', 'en-US')) AS Report_Date,
    (SELECT JSON_QUERY((SELECT month, impact FROM Trend6Months ORDER BY month FOR JSON PATH))) AS trendData,
    (SELECT JSON_QUERY((SELECT name, value FROM BusinessDist FOR JSON PATH))) AS distributionData
    `);

    return result.recordset[0];
}
export async function getDataPersentaseLaba() {
    const pool = await getPool();
    const result = await pool.request().query(`
;WITH Nilai_CKPN AS
(
    SELECT
        SUM(ECL_Final) AS ECL_Final,
        Tanggal_Laporan
    FROM
    (
        SELECT
            SUM(ECL_Final) AS ECL_Final,
            Tanggal_Laporan
        FROM Dashboard_CKPN_Final
        WHERE Tanggal_Laporan =
            (SELECT MAX(Tanggal_Laporan)
             FROM Dashboard_CKPN_Final)
        GROUP BY Tanggal_Laporan

        UNION ALL

        SELECT
            SUM(EAD_Unused) AS ECL_Final,
            Tanggal_Laporan
        FROM EAD_For_Unused_Loan
        WHERE Tanggal_Laporan =
            (SELECT MAX(Tanggal_Laporan)
             FROM EAD_For_Unused_Loan)
        GROUP BY Tanggal_Laporan
    ) a
    GROUP BY Tanggal_Laporan
)

SELECT
    a.ECL_Final,
    b.Laba,
    (a.ECL_Final * 100.0 / b.Laba) AS Persentase_ECL_terhadap_Laba
FROM Nilai_CKPN a
INNER JOIN Ref_Data_Eksternal b
    ON b.Periode_Data = a.Tanggal_Laporan;
    `);

    return result.recordset[0];
}
// export async function getDataCAR() {
//     const pool = await getPool();
//     const result = await pool.request().query(`
// -- 1. Ambil Parameter Modal dan Aset (ATMR)
// DECLARE @modal float, @aset float, @atmr_mult float,@bobot float ;
// SELECT @modal = Modal, @aset = Aset, @atmr_mult = ATMR,@bobot=2.5/100000 FROM Ref_Data_Eksternal;

// -- 2. Ambil Tanggal Terakhir
// DECLARE @tahunBulan date = (SELECT MAX(Tanggal_Laporan) FROM Dashboard_CKPN_Final);

// -- 3. CTE: Hitung Total ECL per Skenario
// WITH ECL_Scenarios AS (
//     SELECT 
//         SUM(ECL_Best) as Optimis, 
//         SUM(ECL_Normal) as Baseline, 
//         SUM(ECL_Worst) as Pesimis
//     FROM (
//         SELECT ECL_Best, ECL_Normal, ECL_Worst FROM Dashboard_CKPN_Final WHERE Tanggal_Laporan = @tahunBulan
//     ) x
// ),

// -- 4. CTE: Data Trend 6 Bulan
// Trend_Data AS (
//     SELECT 
//         FORMAT(Tanggal_Laporan, 'MMM') as month,
//         ((@modal - SUM(ECL_Normal)) / (@aset * @atmr_mult*@bobot) 
// 		* 100) as value
//     FROM Dashboard_CKPN_Final
//     WHERE Tanggal_Laporan > DATEADD(MONTH, -6, @tahunBulan)
//     GROUP BY Tanggal_Laporan
// ),

// -- 5. CTE: Hitung CAR Baseline & Generate Pesan Dinamis
// Message_Logic AS (
//     SELECT 
//         -- Hitung CAR saat ini (Baseline)
//         ((@modal - e.Baseline) / (@aset * @atmr_mult *@bobot) 
// 		* 100) AS calculated_car,
//         e.Baseline,
//         e.Optimis,
//         e.Pesimis
//     FROM ECL_Scenarios e
// )

// SELECT 
//     -- Output Data JSON ECL
//     (SELECT Optimis, Baseline, Pesimis FROM ECL_Scenarios FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) as eclValues,
    
//     -- Output Data Awal
//     @modal as modalAwal,
//     (@aset * @atmr_mult*@bobot) as rwaAwal,
    
//     -- Output Trend JSON
//     (SELECT * FROM Trend_Data ORDER BY month FOR JSON PATH) as trendData,

//     -- Output Pesan Insight Dinamis (Mengambil dari Master_Risk_Threshold)
//     (
//         SELECT TOP 1 
//             REPLACE(
//                 REPLACE(
//                     REPLACE(CAST(m.pesan_template AS VARCHAR(MAX)), 
//                         '{car_percent}', CAST(ROUND(l.calculated_car, 2) AS VARCHAR)
//                     ),
//                     '{threshold}', CAST(m.threshold_val AS VARCHAR)
//                 ),
//                 '{scenario}', 'Baseline' -- Default awal adalah Baseline
//             )
//         FROM Master_Risk_Threshold m
//         CROSS JOIN Message_Logic l
//         WHERE m.kategori = 'CAR_IMPACT' 
//           AND (
//               (l.calculated_car < m.threshold_val AND m.operator = '<') -- Jika Kritis
//               OR 
//               (l.calculated_car >= m.threshold_val AND m.operator = '>=') -- Jika Aman
//           )
//     ) as insightMessage

// FROM Message_Logic l;
//     `);

//     return result.recordset[0];
// }
export async function getDataCAR() {
    const pool = await getPool();
    const result = await pool.request().query(`
-- 1. Ambil Parameter Modal dan Aset (ATMR)
DECLARE @modal float, @aset float, @atmr_mult float,@bobot float ;
SELECT @modal = Modal, @aset = Aset, @atmr_mult = ATMR,@bobot=2.5/100000 FROM Ref_Data_Eksternal
WHERE Periode_Data=(SELECT MAX(Periode_Data)
                    FROM Ref_Data_Eksternal);


-- 2. Ambil Tanggal Terakhir
DECLARE @tahunBulan date = (SELECT MAX(Tanggal_Laporan) FROM Dashboard_CKPN_Final);

-- 3. CTE: Hitung Total ECL per Skenario
WITH ECL_Scenarios AS (
    SELECT 
        SUM(ECL_Best) as Optimis, 
        SUM(ECL_Normal) as Baseline, 
        SUM(ECL_Worst) as Pesimis
    FROM (
        SELECT ECL_Best, ECL_Normal, ECL_Worst FROM Dashboard_CKPN_Final WHERE Tanggal_Laporan = (SELECT MAX(Tanggal_Laporan) FROM Dashboard_CKPN_Final)
    ) x
),

-- 4. CTE: Data Trend 6 Bulan
Trend_Data AS (
    SELECT 
        FORMAT(report_period, 'MMM') as month,
        car_ratio as value,
		report_period
    FROM capital_adequacy
    WHERE report_period > DATEADD(MONTH, -6, @tahunBulan)
),

-- 5. CTE: Hitung CAR Baseline & Generate Pesan Dinamis
Message_Logic AS (
    SELECT 
        -- Hitung CAR saat ini (Baseline)
        ((@modal - e.Baseline) / (@aset * @atmr_mult *@bobot) 
		* 100) AS calculated_car,
        e.Baseline,
        e.Optimis,
        e.Pesimis
    FROM ECL_Scenarios e
)

SELECT 
    -- Output Data JSON ECL
    (SELECT Optimis, Baseline, Pesimis FROM ECL_Scenarios FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) as eclValues,
    
    -- Output Data Awal
    @modal as modalAwal,
    (@aset * @atmr_mult*@bobot) as rwaAwal,
    
    -- Output Trend JSON
    (SELECT * FROM Trend_Data ORDER BY report_period FOR JSON PATH) as trendData,

    -- Output Pesan Insight Dinamis (Mengambil dari Master_Risk_Threshold)
    (
        SELECT TOP 1 
            REPLACE(
                REPLACE(
                    REPLACE(CAST(m.pesan_template AS VARCHAR(MAX)), 
                        '{car_percent}', CAST(ROUND(l.calculated_car, 2) AS VARCHAR)
                    ),
                    '{threshold}', CAST(m.threshold_val AS VARCHAR)
                ),
                '{scenario}', 'Baseline' -- Default awal adalah Baseline
            )
        FROM Master_Risk_Threshold m
        CROSS JOIN Message_Logic l
        WHERE m.kategori = 'CAR_IMPACT' 
          AND (
              (l.calculated_car < m.threshold_val AND m.operator = '<') -- Jika Kritis
              OR 
              (l.calculated_car >= m.threshold_val AND m.operator = '>=') -- Jika Aman
          )
    ) as insightMessage

FROM Message_Logic l;
    `);

    return result.recordset[0];
}