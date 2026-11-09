const sql = require('mssql');

async function checkIndicators() {
  const pool71 = await sql.connect({
    user: 'sa', password: 'saadmin1!', server: '10.8.0.101', database: 'iPSAK71',
    options: { encrypt: false, trustServerCertificate: true }
  });

  const res = await pool71.request().query(`
    SELECT id_indicator, nama_indicator, COUNT(*) as cnt, MIN(periode_waktu) as min_date, MAX(periode_waktu) as max_date
    FROM staging_raw_macro_indicators
    GROUP BY id_indicator, nama_indicator
    ORDER BY id_indicator
  `);
  console.log('Indicators in staging_raw_macro_indicators:', res.recordset);

  // Check if there are other tables like audit_log_adf_test or similar in iPSAK71
  const tables = await pool71.request().query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%adf%' OR TABLE_NAME LIKE '%macro%'
  `);
  console.log('Tables matching adf/macro in iPSAK71:', tables.recordset);

  await pool71.close();
}

checkIndicators().catch(console.error);
