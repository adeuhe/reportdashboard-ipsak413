import { getPool } from "@/lib/db";
import sql from "mssql";

export async function getDataKPICard() {
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

export async function getDataECLNPFTrend() {
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
                EOMONTH(Tanggal_Laporan),
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
                SUM(CASE WHEN bucket IN (3,4,5) OR Stage='2'
                        THEN Outstanding END)
                 AS NPF_Amount
            FROM all_data
            GROUP BY Periode
        ),

        ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (ORDER BY Periode DESC) AS rn
            FROM agg
        )

        SELECT
            FORMAT(Periode,'yyyy-MM') AS month,
            Total_ECL,
            NPF_Amount
        FROM ranked
        WHERE rn <= 6
        ORDER BY month;
    `);

    return result.recordset; // <-- ganti [0] jadi seluruh array
}

export async function getDataStagingMigration() {
    const pool = await getPool();
    const result = await pool.request().query(`
        WITH stages AS (
    -- list semua Stage yang ingin dibandingkan
    SELECT '1' AS Stage
    UNION ALL
    SELECT '2' AS Stage
),

current_data AS (
    SELECT
        EOMONTH(Tanggal_Laporan) AS Periode,
        Stage,
        SUM(ISNULL(ECL_Final,0)) AS Total_ECL,
        SUM(ISNULL(Outstanding,0)) AS Total_Outstanding
    FROM CKPN_Final
    WHERE Stage IN ('1','2')
    GROUP BY EOMONTH(Tanggal_Laporan), Stage
),

history_data AS (
    SELECT
        EOMONTH(Tanggal_Laporan) AS Periode,
        Stage,
        SUM(ISNULL(ECL_Final,0)) AS Total_ECL,
        SUM(ISNULL(Outstanding,0)) AS Total_Outstanding
    FROM iPSAK71_DMM..CKPN_Final
    WHERE Stage IN ('1','2')
    GROUP BY EOMONTH(Tanggal_Laporan), Stage
),

latest_current AS (
    -- ambil bulan terakhir current
    SELECT *
    FROM current_data
    WHERE Periode = (SELECT MAX(Periode) FROM current_data)
),

latest_history AS (
    -- ambil bulan terakhir history per Stage
    SELECT h.*
    FROM history_data h
    INNER JOIN (
        SELECT Stage, MAX(Periode) AS Periode
        FROM history_data
        GROUP BY Stage
    ) mh ON h.Stage = mh.Stage AND h.Periode = mh.Periode
)

-- gabungkan stages agar selalu tampil Stage 1 & 2
SELECT
    s.Stage,
    ISNULL(c.Total_ECL,0) AS ECL_Current,
    ISNULL(h.Total_ECL,0) AS ECL_Previous,
    ISNULL(c.Total_ECL,0) - ISNULL(h.Total_ECL,0) AS ECL_Diff,
    CASE 
        WHEN ISNULL(h.Total_ECL,0) = 0 THEN NULL
        ELSE ROUND((ISNULL(c.Total_ECL,0) - h.Total_ECL) * 100.0 / h.Total_ECL, 2)
    END AS ECL_Diff_Percent
FROM stages s
LEFT JOIN latest_current c ON s.Stage = c.Stage
LEFT JOIN latest_history h ON s.Stage = h.Stage
ORDER BY s.Stage;

    `);

    return result.recordset; // <-- ganti [0] jadi seluruh array
}

export async function getDataSectorialHeatMap() {
    const pool = await getPool();
    const result = await pool.request().query(`select sum(isnull(ECL_Final,0)) ECL_Final,Segment from CKPN_Final a
group by Segment`);

    return result.recordset; // <-- ganti [0] jadi seluruh array
}

export async function getDataBucketDPD() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT 
            Bucket,
            SUM(ISNULL(Outstanding,0)) AS Total_Outstanding,
            SUM(ISNULL(ECL_Final,0)) AS Total_ECL
        FROM CKPN_Final
        GROUP BY Bucket
        ORDER BY Bucket
    `);

    console.log("Bucket DPD:", result.recordset);
    return result.recordset; // kembalikan seluruh array
}


export async function getDataTopBorrowers() {
    const pool = await getPool();
    const result = await pool.request().query(`select top 10
    isnull(b.CIF,c.CIF) as Debitur,
    a.Segment,
    sum(isnull(Outstanding,0)) as Outstanding,
    max(a.DPD) as DPD,
    sum(isnull(ECL_Final,0)) as ECL_Amount,
    max(a.Bucket) as Bucket, 
    max(a.Stage) as Stage
    from CKPN_Final a
    left join Kredit b on a.Nomor_Kontrak = b.Nomor_rekening
    left join LC c on a.Nomor_Kontrak = c.Nomor_rekening
    group by isnull(b.CIF,c.CIF),Segment
    order by ECL_Amount desc, Outstanding desc`);

    console.log("Heat Map:", result.recordset);
    return result.recordset; // <-- ganti [0] jadi seluruh array
}

export async function getDataSlik() {
    const pool = await getPool();
    const result = await pool.request().query(`DECLARE @curr_date DATE = '2024-12-31';
DECLARE @prev_date DATE = EOMONTH(DATEADD(MONTH, -1, @curr_date));

WITH curr AS (
    SELECT 
        No_Rekening_LBUT AS kontrak,
        ECL_Final
    FROM CKPN_Final
    WHERE Tanggal_Laporan = @curr_date
),
prev AS (
    SELECT 
        No_Rekening_LBUT AS kontrak,
        ECL_Final
    FROM iPSAK71_DMM..CKPN_Final
    WHERE Tanggal_Laporan = @prev_date
),

gabung AS (
    SELECT
        COALESCE(c.kontrak, p.kontrak) AS kontrak,
        p.ECL_Final AS ecl_prev,
        c.ECL_Final AS ecl_curr
    FROM curr c
    FULL JOIN prev p 
        ON c.kontrak = p.kontrak
)

SELECT
    kategori,
    COUNT(*) AS jumlah_kontrak,
    SUM(ISNULL(ecl_curr,0)) AS total_ecl_current,
    SUM(ISNULL(ecl_prev,0)) AS total_ecl_prev,
    SUM(ISNULL(ecl_curr,0) - ISNULL(ecl_prev,0)) AS perubahan_ecl
FROM (
    SELECT *,
        CASE
            WHEN ecl_prev IS NOT NULL AND ecl_curr IS NULL THEN 'Debitur Lunas'
            WHEN ecl_prev IS NULL AND ecl_curr IS NOT NULL THEN 'Debitur Baru'
            WHEN ecl_curr > ecl_prev THEN 'Pembentukan'
            WHEN ecl_curr < ecl_prev THEN 'Pemulihan'
            ELSE 'Tetap'
        END AS kategori
    FROM gabung
) x
GROUP BY kategori
ORDER BY kategori;
`);
    return result.recordset; // <-- ganti [0] jadi seluruh array
}

export async function getDataCurrenDate() {
    const pool = await getPool();
    const result = await pool.request().query(`
select * from iPSAK71..Ref_CurrentDate
  `);
    return result.recordset[0];
}

type Filter = {
    periode?: string | null;
    kategori?: string | null;
};
export async function getDataCKPNExportExcel(filter: Filter) {
    const pool = await getPool();

    const currDate = filter.periode ?? "2024-12-31";

    const request = pool.request();

    request.input("curr_date", sql.Date, currDate);
    request.input("kategori", sql.VarChar, filter.kategori);

    const query = `
DECLARE @prev_date DATE = EOMONTH(DATEADD(MONTH, -1, @curr_date));

WITH curr AS (
    SELECT No_Rekening_LBUT AS kontrak, ECL_Final
    FROM CKPN_Final
    WHERE Tanggal_Laporan = @curr_date
),
prev AS (
    SELECT No_Rekening_LBUT AS kontrak, ECL_Final
    FROM iPSAK71_DMM..CKPN_Final
    WHERE Tanggal_Laporan = @prev_date
),
gabung AS (
    SELECT
        COALESCE(c.kontrak, p.kontrak) AS kontrak,
        p.ECL_Final AS ecl_prev,
        c.ECL_Final AS ecl_curr
    FROM curr c
    FULL JOIN prev p ON c.kontrak = p.kontrak
)
SELECT
    kategori,
    COUNT(*) AS jumlah_kontrak,
    SUM(ISNULL(ecl_curr,0)) AS total_ecl_current,
    SUM(ISNULL(ecl_prev,0)) AS total_ecl_prev,
    SUM(ISNULL(ecl_curr,0) - ISNULL(ecl_prev,0)) AS perubahan_ecl
FROM (
    SELECT *,
        CASE
            WHEN ecl_prev IS NOT NULL AND ecl_curr IS NULL THEN 'Debitur Lunas'
            WHEN ecl_prev IS NULL AND ecl_curr IS NOT NULL THEN 'Debitur Baru'
            WHEN ecl_curr > ecl_prev THEN 'Pembentukan'
            WHEN ecl_curr < ecl_prev THEN 'Pemulihan'
            ELSE 'Tetap'
        END AS kategori
    FROM gabung
) x
WHERE (@kategori = 'ALL' OR kategori = @kategori)
GROUP BY kategori
ORDER BY kategori;
`;
    const result = await request.query(query);
    console.log("CKPN RESULT:", result.recordset);
    console.log("PARAM:", filter.kategori);

    return result.recordset;
}