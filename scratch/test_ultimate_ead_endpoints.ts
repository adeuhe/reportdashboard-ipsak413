async function testUltimateEadEndpoints() {
  console.log("--- Testing Web Page Endpoint ---");
  try {
    const resPage = await fetch("http://localhost:3000/report/report-kertas-kerja-konsolidasi-ultimate-ead");
    console.log("Page Status:", resPage.status);
    const pageText = await resPage.text();
    console.log("Page Content Snippet:", pageText.substring(0, 300));
    console.log("Contains Ultimate EAD Title?:", pageText.includes("KERTAS KERJA KONSOLIDASI ULTIMATE EAD"));
  } catch (err: any) {
    console.error("Page Fetch Error:", err.message);
  }

  console.log("\n--- Testing Excel Download Endpoint ---");
  try {
    const resExcel = await fetch("http://localhost:3000/api/report/report-kertas-kerja-konsolidasi-ultimate-ead/export-excel?limit=100");
    console.log("Excel Status:", resExcel.status);
    console.log("Content-Type:", resExcel.headers.get("content-type"));
    console.log("Content-Disposition:", resExcel.headers.get("content-disposition"));
    const arrayBuffer = await resExcel.arrayBuffer();
    console.log("Excel File Byte Length:", arrayBuffer.byteLength);
  } catch (err: any) {
    console.error("Excel Fetch Error:", err.message);
  }
}

testUltimateEadEndpoints();
