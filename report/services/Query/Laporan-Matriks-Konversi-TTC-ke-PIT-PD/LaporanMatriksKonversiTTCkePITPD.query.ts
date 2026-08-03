import { getPool } from "@/lib/db";
import sql from "mssql";

// export async function getDataMatriksKonnversi(periode: string = "2026-12-31") {
//   const pool = await getPool();
// console.log(periode);

//   const result = await pool
//     .request()
//     .input("periodeParam", sql.VarChar(255), periode) // Bind parameter periode secara aman
//     .query(`
//       WITH TableForTTC2 AS (
//           SELECT 
//               AVG(Persentase_Anomali) AS TTC_BASE,
//               segment_id
//           FROM iPSAK71..PD_TTC_Anomali_to_ECL
//           WHERE start_bucket_group <> 5
//             AND end_bucket_group = 5
//             AND segment_id <> '99'
//           GROUP BY segment_id
//       )
//       SELECT
//           d.name AS segment_id,

//           AVG(b.TTC_BASE) * 100 AS TTC_PD_Base,

//           (AVG(CASE WHEN Notes = 'NORMAL' THEN value END) / AVG(b.TTC_BASE)) AS BaseLine_Scalar,
//           AVG(CASE WHEN Notes = 'NORMAL' THEN value END) * 100 AS PIT_PD_Baseline,

//           (AVG(CASE WHEN Notes = 'BEST' THEN value END) / AVG(b.TTC_BASE)) AS optimistic_Scalar,
//           AVG(CASE WHEN Notes = 'BEST' THEN value END) * 100 AS PIT_PD_Optimistic,

//           (AVG(CASE WHEN Notes = 'WORST' THEN value END) / AVG(b.TTC_BASE)) AS pessimistic_Scalar,
//           AVG(CASE WHEN Notes = 'WORST' THEN value END) * 100 AS PIT_PD_Pessimistic,

//           (
//               (
//                   AVG(CASE WHEN Notes = 'NORMAL' THEN value END) * MAX(c.Asumsi_CKPN_Normal) / 100
//               ) +
//               (
//                   AVG(CASE WHEN Notes = 'WORST' THEN value END) * MAX(c.Asumsi_CKPN_Worst) / 100
//               ) +
//               (
//                   AVG(CASE WHEN Notes = 'BEST' THEN value END) * MAX(c.Asumsi_CKPN_Best) / 100
//               )
//           ) * 100 AS Final_Weight_PIT_PD

//       FROM iPSAK71..PD_Yearly_MPDBobot_to_ECL a
//       INNER JOIN TableForTTC2 b
//           ON a.segment_id = b.segment_id
//       INNER JOIN paramECLBobot c
//           ON a.segment_id = c.Segment
//       LEFT JOIN segment d 
//           ON a.segment_id = d.id AND d.KodeForm = 'PD'
//       WHERE a.periode = @periodeParam
//         AND a.start_bucket_group <> 5
//       GROUP BY d.name;
//     `);

//   return result.recordset; // Mengembalikan array of rows
// }
export async function getDataMatriksKonnversi(periode: string = "2026-12-31") {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("periodeParam", sql.VarChar(255), periode)
    .query(`
      WITH TableForTTC2 AS (
          SELECT 
              AVG(Persentase_Anomali) AS TTC_BASE,
              segment_id
          FROM iPSAK71..PD_TTC_Anomali_to_ECL
          WHERE start_bucket_group <> 5
            AND end_bucket_group = 5
            AND segment_id <> '99'
          GROUP BY segment_id
      )
      SELECT
          d.name AS segment_id,
          AVG(b.TTC_BASE) * 100 AS TTC_PD_Base,

          (AVG(CASE WHEN Notes = 'NORMAL' THEN value END) / AVG(b.TTC_BASE)) AS BaseLine_Scalar,
          AVG(CASE WHEN Notes = 'NORMAL' THEN value END) * 100 AS PIT_PD_Baseline,

          (AVG(CASE WHEN Notes = 'BEST' THEN value END) / AVG(b.TTC_BASE)) AS optimistic_Scalar,
          AVG(CASE WHEN Notes = 'BEST' THEN value END) * 100 AS PIT_PD_Optimistic,

          (AVG(CASE WHEN Notes = 'WORST' THEN value END) / AVG(b.TTC_BASE)) AS pessimistic_Scalar,
          AVG(CASE WHEN Notes = 'WORST' THEN value END) * 100 AS PIT_PD_Pessimistic,

          -- Ambil Bobot Skenario
          MAX(c.Asumsi_CKPN_Normal) AS Bobot_Normal,
          MAX(c.Asumsi_CKPN_Best) AS Bobot_Best,
          MAX(c.Asumsi_CKPN_Worst) AS Bobot_Worst,

          (
              (
                  AVG(CASE WHEN Notes = 'NORMAL' THEN value END) * MAX(c.Asumsi_CKPN_Normal) / 100
              ) +
              (
                  AVG(CASE WHEN Notes = 'WORST' THEN value END) * MAX(c.Asumsi_CKPN_Worst) / 100
              ) +
              (
                  AVG(CASE WHEN Notes = 'BEST' THEN value END) * MAX(c.Asumsi_CKPN_Best) / 100
              )
          ) * 100 AS Final_Weight_PIT_PD

      FROM iPSAK71..PD_Yearly_MPDBobot_to_ECL a
      INNER JOIN TableForTTC2 b ON a.segment_id = b.segment_id
      INNER JOIN paramECLBobot c ON a.segment_id = c.Segment
      LEFT JOIN segment d ON a.segment_id = d.id AND d.KodeForm = 'PD'
      WHERE a.periode = @periodeParam
        AND a.start_bucket_group <> 5
      GROUP BY d.name;
    `);

  return result.recordset;
}

export async function getNamaBank() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT TOP 1 sandi, keterangan 
    FROM ref_NamaBank WITH (NOLOCK)
    ORDER BY keterangan ASC;
  `);

  return result.recordset[0]?.keterangan || "PT BANK MUAMALAT INDONESIA TBK";
}
// Query untuk mengambil daftar periode unik untuk Dropdown
export async function getListPeriodeMatriksKonversi(): Promise<string[]> {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT DISTINCT CONVERT(VARCHAR(10), periode, 120) AS periode 
    FROM iPSAK71..PD_Yearly_MPDBobot_to_ECL 
    WHERE periode IS NOT NULL
    ORDER BY periode ASC;
  `);

  // result.recordset[i].periode sudah dalam bentuk string "2026-12-31"
  return (result.recordset || []).map((row: any) => String(row.periode));
}