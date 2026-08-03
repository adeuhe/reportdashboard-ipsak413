import { getLatestTanggalLaporan, getSimulasiDampakFinansialData, SimulasiDampakFinansialData } from "../Query/Simulasi-dampak-finansial/SimulasiDampakFinansial.query";

 
export async function fetchSimulasiDampakFinansialService(
  tanggalLaporan?: string,
  kodeSegment?: string
) {
  const effectiveDate = tanggalLaporan || (await getLatestTanggalLaporan());
  
  const data: SimulasiDampakFinansialData[] = await getSimulasiDampakFinansialData(
    effectiveDate,
    kodeSegment
  );

  const totalFasilitas = data.length;
  const totalUnderProvisioning = data.reduce(
    (acc, curr) => acc + (curr.Selisih_ECL || 0),
    0
  );

  return {
    latestDate: effectiveDate,
    data,
    summary: {
      totalFasilitas,
      totalUnderProvisioning,
    },
  };
}