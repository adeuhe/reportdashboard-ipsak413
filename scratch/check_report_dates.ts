import { getPool } from "../lib/db";

async function checkDates() {
  const pool = await getPool();
  const res1 = await pool.request().query("SELECT DISTINCT Tanggal_Laporan FROM Kredit_Revolving");
  console.log("Kredit_Revolving Tanggal_Laporan:", res1.recordset);

  const res2 = await pool.request().query("SELECT DISTINCT Tanggal_Laporan FROM TR_EAD_Netting_Akad");
  console.log("TR_EAD_Netting_Akad Tanggal_Laporan:", res2.recordset);

  const res3 = await pool.request().query("SELECT TOP 1 DateNow FROM Ref_CurrentDate");
  console.log("Ref_CurrentDate DateNow:", res3.recordset);
}

checkDates();
