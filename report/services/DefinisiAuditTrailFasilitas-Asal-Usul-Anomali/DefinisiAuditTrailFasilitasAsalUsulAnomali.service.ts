import { getDefinisiAuditTrailFasilitasAsalUsulAnomaliData, getNamaBank, getSegmentOptions } from "../Query/DefinisiAuditTrailFasilitas-Asal-Usul-Anomali/DefinisiAuditTrailFasilitasAsalUsulAnomali.query";
export interface AuditTrailItem {
  tanggalLaporan: string;
  segment: string;
  nomorRekening: string;
  jenisAkad: string;
  tipeAgunan: string;
  nilaiPasar: number;
  totalHaircut: number;
  nrv: number;
  eadNetto: number;
  surplus: number;
  akarPenyebab: string;
}

export async function getDefinisiAuditTrailFasilitasAsalUsulAnomaliService(selectedSegment?: string) {
  const [rawData, segmentList, bankName] = await Promise.all([
    getDefinisiAuditTrailFasilitasAsalUsulAnomaliData(selectedSegment),
    getSegmentOptions(),
    getNamaBank(),
  ]);

  const safeNum = (v: any): number => (isNaN(Number(v)) ? 0 : Number(v));

  const items: AuditTrailItem[] = (Array.isArray(rawData) ? rawData : []).map((row: any) => ({
    tanggalLaporan: row.Tanggal_Laporan ? new Date(row.Tanggal_Laporan).toISOString().split("T")[0] : "-",
    segment: String(row.segment ?? "-"),
    nomorRekening: row.Nomor_rekening ?? "-",
    jenisAkad: row.Jenis_Akad ?? "-",
    tipeAgunan: row.Tipe_Agunan ?? "-",
    nilaiPasar: safeNum(row.Nilai_Pasar),
    totalHaircut: safeNum(row.Total_Haircut),
    nrv: safeNum(row.NRV),
    eadNetto: safeNum(row.EAD_Netto),
    surplus: safeNum(row.Surplus),
    akarPenyebab: row.Akar_Penyebab ?? "",
  }));

  const periode = items.length > 0 && items[0].tanggalLaporan !== "-" ? items[0].tanggalLaporan : "-";

  return {
    data: items,
    segmentOptions: segmentList,
    meta: {
      bankName: bankName,
      reportTitle: "LAPORAN AUDIT: ANALISIS AKAR PENYEBAB ANOMALI (OVER-COLLATERALIZED)",
      currency: "IDR",
      tujuanLaporan: "Membuktikan secara historis matematis penyebab fasilitas mengalami LGD Mentah Negatif (sebelum intervensi Floor 0%).",
      periode: periode,
      selectedSegment: selectedSegment || "ALL",
    },
  };
}