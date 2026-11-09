import { getPool } from "../lib/db";

async function testQuery() {
  const pool = await getPool();

  console.log("--- Testing Ref_CurrentDate, Ref_NamaBank, Ref_Dashboard_Theme ---");
  const bankRes = await pool.request().query("SELECT TOP 1 KETERANGAN FROM Ref_NamaBank WITH (NOLOCK)");
  console.log("Ref_NamaBank:", bankRes.recordset);

  const dateRes = await pool.request().query("SELECT TOP 1 DateNow FROM Ref_CurrentDate WITH (NOLOCK)");
  console.log("Ref_CurrentDate:", dateRes.recordset);

  const themeRes = await pool.request().query("SELECT TOP 1 * FROM Ref_Dashboard_Theme WITH (NOLOCK) WHERE is_active = 1");
  console.log("Ref_Dashboard_Theme:", themeRes.recordset);

  console.log("\n--- Testing Target Query ---");
  const query = `
    DECLARE @TargetDate DATE = (SELECT TOP 1 Tanggal_Laporan FROM TR_EAD_Netting_Akad WITH (NOLOCK));

    WITH CIF_Risk_Profile AS (
        SELECT 
            CIF,
            MAX(ISNULL(CAST(Flag_Pailit AS INT), 0)) AS Flag_Pailit,
            MAX(ISNULL(CAST(Flag_Taadi AS INT), 0)) AS Flag_Taadi
        FROM Kredit WITH (NOLOCK) WHERE Tanggal_Laporan = @TargetDate GROUP BY CIF
    ),
    Evaluasi_Off_Balance AS (
        SELECT 
            l.Nomor_Rekening AS no_rekening,
            ISNULL(l.dpd, 0) AS dpd,
            CASE WHEN l.Sifat_Kredit = '1' THEN 1 ELSE 0 END AS is_restruk,
            ISNULL(rp.Flag_Pailit, 0) AS flag_pailit,
            ISNULL(rp.Flag_Taadi, 0) AS flag_taadi,
            CASE 
                WHEN (ISNULL(l.Limit_amount, 0) - ISNULL(l.Balance_ThisYear, 0)) < 0 THEN 0 
                ELSE (ISNULL(l.Limit_amount, 0) - ISNULL(l.Balance_ThisYear, 0)) 
            END AS sisa_limit,
            ISNULL(m.ccf_rate, 1.0000) AS ccf_rate
        FROM Kredit_Revolving l WITH (NOLOCK)
        LEFT JOIN CIF_Risk_Profile rp ON l.CIF = rp.CIF
        LEFT JOIN ref_syariah_ccf_matrix m WITH (NOLOCK) ON l.jenis_instrumen = m.jenis_instrumen AND l.Jenis_Akad = m.akad_syariah
        WHERE l.Tanggal_Laporan = @TargetDate
    )
    SELECT TOP 10
        no_rekening AS [No Rekening],
        sisa_limit AS [Sisa Plafon (Rp)],
        ccf_rate AS [CCF Rate],
        CASE 
            WHEN flag_taadi = 1 THEN 'TAADDI'
            WHEN flag_pailit = 1 THEN 'PAILIT'
            WHEN is_restruk = 1 THEN 'RESTRUKTURISASI'
            WHEN dpd > 30 THEN 'DPD > 30 HARI'
            ELSE 'NORMAL/LANCAR'
        END AS [Indikator SICR],
        (sisa_limit * ccf_rate) AS [Off-Bal EAD (Rp)]
    FROM Evaluasi_Off_Balance
    WHERE sisa_limit > 0;
  `;

  try {
    const res = await pool.request().query(query);
    console.log("Query Results Count:", res.recordset.length);
    console.table(res.recordset);
  } catch (err: any) {
    console.error("Query Error:", err?.message || err);
  }
}

testQuery().catch(console.error);
