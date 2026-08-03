import { getPool } from "@/lib/db";

export async function getDataStrategicKPICard() {
    const pool = await getPool();
    const result = await pool.request().query(`
    WITH all_data AS (
    -- DATA CURRENT
    SELECT
        EOMONTH(Tanggal_Laporan) AS Periode,
        ISNULL(ECL_Final,0) AS ECL,
        ISNULL(Outstanding,0) AS Outstanding,
        bucket,
        Stage
    FROM CKPN_Final

    UNION ALL

    -- DATA HISTORY
    SELECT
        EOMONTH(Tanggal_Laporan) AS Periode,
        ISNULL(ECL_Final,0),
        ISNULL(Outstanding,0),
        bucket,
        Stage
    FROM iPSAK71_DMM..CKPN_Final
),

agg AS (
    SELECT
        Periode,

        -- TOTAL ECL
        SUM(ECL) AS Total_ECL,

        -- NPF RATIO
        SUM(CASE WHEN bucket IN (3,4,5) OR Stage='2'
                 THEN Outstanding END)
        / NULLIF(SUM(Outstanding),0) AS NPF_Ratio,

        -- COVERAGE
        SUM(ECL)
        / NULLIF(
            SUM(CASE WHEN bucket IN (3,4,5) OR Stage='2'
                     THEN Outstanding END),
            0
        ) AS Coverage

    FROM all_data
    GROUP BY Periode
),

ranked AS (
    SELECT *,
           ROW_NUMBER() OVER (ORDER BY Periode DESC) AS rn
    FROM agg
)

SELECT
    -- ECL
    MAX(CASE WHEN rn = 1 THEN Total_ECL END) AS Current_ECL,
    MAX(CASE WHEN rn = 2 THEN Total_ECL END) AS Prev_ECL,

    -- NPF
    MAX(CASE WHEN rn = 1 THEN NPF_Ratio END) AS Current_NPF,
    MAX(CASE WHEN rn = 2 THEN NPF_Ratio END) AS Prev_NPF,

    -- COVERAGE
    MAX(CASE WHEN rn = 1 THEN Coverage END) AS Current_Cov,
    MAX(CASE WHEN rn = 2 THEN Coverage END) AS Prev_Cov
FROM ranked;
  `);
    return result.recordset[0];
}

export async function getDataStrategicPD() {
  const pool = await getPool();
  const result = await pool.request().query(`
WITH filtered_pd AS (
    SELECT 
        UPPER(TRIM(Notes)) AS category,
        YEAR(periode) AS year,
        value
    FROM PD_Yearly_MPDBobot
    WHERE YEAR(periode) IN (YEAR(GETDATE())-1, YEAR(GETDATE()))
),
yearly_avg AS (
    SELECT
        category,
        year,
        ROUND(AVG(value) * 100, 4) AS weighted_avg_pd_percent
    FROM filtered_pd
    GROUP BY category, year
)
SELECT
    category,
    MAX(CASE WHEN year = YEAR(GETDATE())-1 THEN weighted_avg_pd_percent END) AS prev_year,
    MAX(CASE WHEN year = YEAR(GETDATE()) THEN weighted_avg_pd_percent END) AS current_year
FROM yearly_avg
GROUP BY category;
  `);
  return result.recordset;
}

export async function getDataECLVSNPFGrowthComparison() {
    const pool = await getPool();
    const result = await pool.request().query(`
WITH all_data AS (
    SELECT
        EOMONTH(Tanggal_Laporan) AS Periode,
        ISNULL(ECL_Final,0) AS ECL,
        ISNULL(Outstanding,0) AS Outstanding,
        bucket,
        Stage
    FROM CKPN_Final

    UNION ALL

    SELECT
        EOMONTH(Tanggal_Laporan) AS Periode,
        ISNULL(ECL_Final,0),
        ISNULL(Outstanding,0),
        bucket,
        Stage
    FROM iPSAK71_DMM..CKPN_Final
),

agg AS (
    SELECT
        Periode,
        SUM(ECL) AS Total_ECL,
        SUM(CASE WHEN bucket IN (3,4,5) OR Stage='2' THEN Outstanding END) 
            / NULLIF(SUM(Outstanding),0) AS NPF_Ratio
    FROM all_data
    GROUP BY Periode
),

-- Ambil hanya 6 bulan terakhir
last6 AS (
    SELECT *
    FROM agg
    WHERE Periode >= '2024-07-30'--DATEADD(MONTH, -5, EOMONTH(GETDATE()))  -- 5 bulan ke belakang + bulan sekarang
),

-- Hitung growth dibanding bulan sebelumnya
series AS (
    SELECT 
        Periode,
        Total_ECL,
        NPF_Ratio,
        LAG(Total_ECL) OVER (ORDER BY Periode) AS Prev_ECL,
        LAG(NPF_Ratio) OVER (ORDER BY Periode) AS Prev_NPF
    FROM last6
)

SELECT
    FORMAT(Periode,'yyyy-MM') AS period,
    Total_ECL AS eclAmount,
    NPF_Ratio * 100 AS npfAmount,  -- convert ke persen
    CASE 
        WHEN Prev_ECL IS NULL THEN 0
        ELSE ROUND((Total_ECL - Prev_ECL) * 100.0 / Prev_ECL,2)
    END AS eclGrowth,
    CASE
        WHEN Prev_NPF IS NULL THEN 0
        ELSE ROUND((NPF_Ratio - Prev_NPF) * 100.0 / Prev_NPF,2)
    END AS npfGrowth
FROM series
ORDER BY Periode;
`);
    return result.recordset;
}

export async function getDataSectorialRiskHeatMap() {
    const pool = await getPool();
    const result = await pool.request().query(`
select Segment,
sum(ISNULL(Outstanding,0)) as Outstanding,
SUM(ISNULL(ECL_Final,0)) as ECL_Amount,
SUM(ISNULL(ECL_Final,0))/nullif(sum(ISNULL(Outstanding,0)),0) as ECL_Ratio,
COUNT(Nomor_Kontrak) as Accounts,
case when (SUM(ISNULL(ECL_Final,0))/nullif(sum(ISNULL(Outstanding,0)),0) > 0.05) then 'Critical'
when (SUM(ISNULL(ECL_Final,0))/nullif(sum(ISNULL(Outstanding,0)),0) <= 0.04) then 'Medium'
when (SUM(ISNULL(ECL_Final,0))/nullif(sum(ISNULL(Outstanding,0)),0) <= 0.05) then 'High'
else 'Low' end as Risk_Level --- logic risk level 
from CKPN_Final a
group by Segment;
`);
    return result.recordset;
}