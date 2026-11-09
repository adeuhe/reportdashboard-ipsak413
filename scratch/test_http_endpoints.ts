async function testEndpointsWithSearch() {
  console.log("--- Testing Web Page Endpoint with Search ---");
  try {
    const resPage = await fetch("http://localhost:3000/report/report-evaluasi-sicr-off-balance?searchRekening=30010001578000");
    console.log("Page Status:", resPage.status);
    const pageText = await resPage.text();
    console.log("Page Content Snippet (Contains searched account?):", pageText.includes("30010001578000"));
  } catch (err: any) {
    console.error("Page Fetch Error:", err.message);
  }

  console.log("\n--- Testing Excel Download Endpoint with Search ---");
  try {
    const resExcel = await fetch("http://localhost:3000/api/report/report-evaluasi-sicr-off-balance/export-excel?searchRekening=30010001578000");
    console.log("Excel Status:", resExcel.status);
    const arrayBuffer = await resExcel.arrayBuffer();
    console.log("Excel File Byte Length:", arrayBuffer.byteLength);
  } catch (err: any) {
    console.error("Excel Fetch Error:", err.message);
  }
}

testEndpointsWithSearch();
