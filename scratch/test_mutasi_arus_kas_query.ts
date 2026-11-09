import { getPool } from "../lib/db";

async function testQuery() {
  const pool = await getPool();

  console.log("--- Testing Ref_CurrentDate & Ref_NamaBank ---");
  const dateRes = await pool.request().query("SELECT TOP 1 DateNow FROM Ref_CurrentDate WITH (NOLOCK)");
  console.log("Ref_CurrentDate:", dateRes.recordset);

  const bankRes = await pool.request().query("SELECT TOP 1 KETERANGAN FROM Ref_NamaBank WITH (NOLOCK)");
  console.log("Ref_NamaBank:", bankRes.recordset);

  const themeRes = await pool.request().query("SELECT TOP 1 * FROM Ref_Dashboard_Theme WITH (NOLOCK) WHERE is_active = 1");
  console.log("Ref_Dashboard_Theme:", themeRes.recordset);

  let dateNowStr = dateRes.recordset[0]?.DateNow;
  if (dateNowStr instanceof Date) {
    dateNowStr = dateNowStr.toISOString().split("T")[0];
  } else {
    dateNowStr = String(dateNowStr || "2026-08-31").split("T")[0];
  }

  const parts = dateNowStr.split("-");
  const startDate = `${parts[0]}-${parts[1]}-01`;
  const endDate = dateNowStr;

  console.log(`Testing query with date range: ${startDate} to ${endDate}`);

  const query = `
    SELECT TOP 10
        c.no_rekening AS [No Rekening],
        c.tgl_masuk_stage2 AS [Tgl Default],
        r.tgl_recovery AS [Tgl Recovery],
        r.jenis_sumber AS [Sumber Kas],
        r.gross_amount AS [Nominal Kotor Masuk],
        r.haircut_pct * 100 AS [Haircut (%)],
        r.direct_cost AS [Biaya Langsung],
        r.time_to_recovery AS [TTR (Tahun)],
        c.epr_rate * 100 AS [EPR Aktual (%)],
        r.npv_recovery AS [NPV Bersih (Syariah)]
    FROM fact_lgd_recovery_cashflow r WITH (NOLOCK)
    INNER JOIN fact_stage2_default_cohort c WITH (NOLOCK) ON r.id_default = c.id_default
    WHERE c.tgl_masuk_stage2 BETWEEN @tanggal_mulai AND @tanggal_selesai
    ORDER BY c.no_rekening, r.tgl_recovery;
  `;

  const req = pool.request();
  req.input("tanggal_mulai", startDate);
  req.input("tanggal_selesai", endDate);

  const dataRes = await req.query(query);
  console.log("Query Results Count:", dataRes.recordset.length);
  if (dataRes.recordset.length > 0) {
    console.table(dataRes.recordset);
  } else {
    console.log("No data for current month range. Trying without date filter...");
    const reqNoFilter = pool.request().query(`
      SELECT TOP 5
          c.no_rekening AS [No Rekening],
          c.tgl_masuk_stage2 AS [Tgl Default],
          r.tgl_recovery AS [Tgl Recovery],
          r.jenis_sumber AS [Sumber Kas],
          r.gross_amount AS [Nominal Kotor Masuk],
          r.haircut_pct * 100 AS [Haircut (%)],
          r.direct_cost AS [Biaya Langsung],
          r.time_to_recovery AS [TTR (Tahun)],
          c.epr_rate * 100 AS [EPR Aktual (%)],
          r.npv_recovery AS [NPV Bersih (Syariah)]
      FROM fact_lgd_recovery_cashflow r WITH (NOLOCK)
      INNER JOIN fact_stage2_default_cohort c WITH (NOLOCK) ON r.id_default = c.id_default
      ORDER BY c.no_rekening, r.tgl_recovery;
    `);
    const fallbackRes = await reqNoFilter;
    console.log("Sample Data across all dates:", fallbackRes.recordset.length);
    console.table(fallbackRes.recordset);
  }
}

testQuery().catch(console.error);
