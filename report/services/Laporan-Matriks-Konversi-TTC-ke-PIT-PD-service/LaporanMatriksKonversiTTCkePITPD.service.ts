import { getDataMatriksKonnversi, getListPeriodeMatriksKonversi, getNamaBank } from "../Query/Laporan-Matriks-Konversi-TTC-ke-PIT-PD/LaporanMatriksKonversiTTCkePITPD.query";

export async function getMatriksKonnversiData(selectedPeriode?: string) {
  const listPeriode = await getListPeriodeMatriksKonversi();
  const activePeriode = selectedPeriode || (listPeriode.length > 0 ? listPeriode[listPeriode.length - 1] : "2026-12-31");
  
  const [rawData, bankName] = await Promise.all([
    getDataMatriksKonnversi(activePeriode),
    getNamaBank(),
  ]);

  const safeNum = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));

  const matriksData = (Array.isArray(rawData) ? rawData : []).map((row: any) => ({
    segment_id: row.segment_id ?? "-",
    TTC_PD_Base: safeNum(row.TTC_PD_Base),
    BaseLine_Scalar: safeNum(row.BaseLine_Scalar),
    PIT_PD_Baseline: safeNum(row.PIT_PD_Baseline),
    optimistic_Scalar: safeNum(row.optimistic_Scalar),
    PIT_PD_Optimistic: safeNum(row.PIT_PD_Optimistic),
    pessimistic_Scalar: safeNum(row.pessimistic_Scalar),
    PIT_PD_Pessimistic: safeNum(row.PIT_PD_Pessimistic),
    Bobot_Normal: safeNum(row.Bobot_Normal),
    Bobot_Best: safeNum(row.Bobot_Best),
    Bobot_Worst: safeNum(row.Bobot_Worst),
    Final_Weight_PIT_PD: safeNum(row.Final_Weight_PIT_PD),
  }));

  return {
    meta: {
      bankName: bankName || "PT BANK MUAMALAT INDONESIA TBK",
      reportTitle: "LAPORAN AUDIT: MATRIKS KONVERSI TTC TO FORECAST PD",
      periodLabel: activePeriode,
      listPeriode,
    },
    data: matriksData,
  };
}