const sql = require('mssql');

async function inspectTables() {
  const pool = await sql.connect({
    user: 'sa',
    password: 'saadmin1!',
    server: '10.8.0.101',
    database: 'iPSAK71',
    options: { encrypt: false, trustServerCertificate: true },
    connectionTimeout: 4000,
    requestTimeout: 6000
  });

  const tables = [
    'staging_raw_macro_indicators',
    'fact_transformed_macro',
    'fact_forecast_macro_scenarios',
    'audit_macro_execution_log'
  ];

  for (const tbl of tables) {
    console.log(`\n=== Table: ${tbl} ===`);
    const cols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = '${tbl}'
    `);
    console.log('Columns:', cols.recordset);

    const rows = await pool.request().query(`
      SELECT TOP 5 * FROM ${tbl}
    `);
    console.log('Sample rows:', rows.recordset);

    const count = await pool.request().query(`SELECT COUNT(*) as cnt FROM ${tbl}`);
    console.log('Total count:', count.recordset[0].cnt);
  }

  // Also check if there are other tables with adf or stationarity
  const otherTbls = await pool.request().query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%adf%' OR TABLE_NAME LIKE '%audit%'
  `);
  console.log('\nOther ADF/Audit tables in iPSAK71:', otherTbls.recordset);

  await pool.close();
}

inspectTables().catch(console.error);
