import { getReportAgregasiLGDStage2Data } from "../lib/report-agregasi-lgd-stage2/services";

async function main() {
  console.log("Fetching Agregasi LGD Stage 2 Report Data...");
  const data = await getReportAgregasiLGDStage2Data();
  console.log("Nama Bank:", data.namaBank);
  console.log("Data Position:", data.dataPosition);
  console.log("Theme:", data.theme);
  console.log("Data Rows Count:", data.data.length);
  console.table(data.data);
}

main().catch(console.error);
