const sql = require('mssql');

async function checkDetails() {
  const pool71 = await sql.connect({
    user: 'sa', password: 'saadmin1!', server: '10.8.0.101', database: 'iPSAK71',
    options: { encrypt: false, trustServerCertificate: true }
  });

  console.log('--- iPSAK71 audit_macro_execution_log latest ---');
  const execLogs = await pool71.request().query(`
    SELECT TOP 5 * FROM audit_macro_execution_log ORDER BY executed_at DESC
  `);
  console.log(execLogs.recordset);

  console.log('--- iPSAK71 fact_transformed_macro distinct var_name & transformations ---');
  const transSummary = await pool71.request().query(`
    SELECT execution_id, var_name, is_stationary, adf_pvalue, transformation_applied, period_cutoff, COUNT(*) as count_data
    FROM fact_transformed_macro
    GROUP BY execution_id, var_name, is_stationary, adf_pvalue, transformation_applied, period_cutoff
    ORDER BY execution_id DESC
  `);
  console.log(transSummary.recordset);

  await pool71.close();

  const poolMid = await sql.connect({
    user: 'sa', password: 'saadmin1!', server: '10.8.0.101', database: 'ipsak413_mid',
    options: { encrypt: false, trustServerCertificate: true }
  });

  console.log('--- ipsak413_mid makroekonomi_stationer cols & sample ---');
  const colsStationer = await poolMid.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'makroekonomi_stationer'
  `);
  console.log(colsStationer.recordset);
  const rowsStationer = await poolMid.request().query(`
    SELECT TOP 5 * FROM makroekonomi_stationer
  `);
  console.log(rowsStationer.recordset);

  await poolMid.close();
}

checkDetails().catch(console.error);
