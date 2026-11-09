import { fetchMutasiArusKasData } from "../lib/report-mutasi-arus-kas-pemulihan/services";

async function main() {
  console.log("Testing fetchMutasiArusKasData()...");
  const result = await fetchMutasiArusKasData(1, 10);
  console.log("Bank Name:", result.namaBank);
  console.log("Date Range:", result.startDate, "s/d", result.endDate);
  console.log("Total Data:", result.totalData);
  console.log("Theme Download Btn:", result.themeColorBtnDownload);
  console.log("Theme Filter Btn:", result.themeColorBtnFilterReport);
  console.log("Theme BG Header:", result.themeColorBgHeader);
  console.log("Rows Count:", result.data.length);
  if (result.data.length > 0) {
    console.table(result.data.slice(0, 5));
  }
}

main().catch(console.error);
