import { getPoolMID, getPool } from "@/lib/db";
import { ValidasiKomputasiResponse, ValidasiKomputasiRow, SegmentOption, AkadOption } from "../types";

async function getMainDbName(): Promise<string> {
  const pool = await getPool();
  return (pool as any).config?.database || "iPSAK413";
}

async function getActiveRequestMID() {
  const pool = await getPoolMID();
  if (!pool.connected && typeof (pool as any).connect === "function") {
    await pool.connect();
  }
  return pool.request();
}

export async function fetchValidasiKomputasiData(
  page?: number,
  limit?: number,
  startDateParam?: string,
  endDateParam?: string,
  segmentParam?: string,
  akadParam?: string
): Promise<ValidasiKomputasiResponse> {
  const req = await getActiveRequestMID();
  const mainDbName = await getMainDbName();

  // 1. Fetch Nama Bank
  let namaBank = "PT BANK XYZ";
  try {
    const bankResult = await req.query<{ KETERANGAN: string }>(`
      SELECT TOP 1 KETERANGAN FROM ${mainDbName}..Ref_NamaBank
    `);
    if (bankResult.recordset && bankResult.recordset[0]?.KETERANGAN) {
      namaBank = bankResult.recordset[0].KETERANGAN;
    }
  } catch (err) {
    console.warn("Gagal mengambil Ref_NamaBank, menggunakan fallback:", err);
  }

  // 2. Query MAX(tanggal_laporan) dynamically from vw_Kalkulasi_ECL_Statistik (NO HARDCODING)
  let maxTanggalLaporan = "";
  try {
    const maxDateResult = await req.query<{ maxDate: string }>(`
      SELECT CONVERT(VARCHAR(10), MAX(tanggal_laporan), 120) AS maxDate 
      FROM ${mainDbName}..[vw_Kalkulasi_ECL_Statistik] WITH (NOLOCK)
      WHERE tanggal_laporan IS NOT NULL
    `);
    if (maxDateResult.recordset && maxDateResult.recordset.length > 0 && maxDateResult.recordset[0].maxDate) {
      maxTanggalLaporan = String(maxDateResult.recordset[0].maxDate);
    }
  } catch (err) {
    console.warn("Gagal mengambil MAX(tanggal_laporan) dari vw_Kalkulasi_ECL_Statistik:", err);
  }

  let startDate = startDateParam || maxTanggalLaporan;
  let endDate = endDateParam || maxTanggalLaporan;

  if (!startDate || !endDate) {
    try {
      const dateResult = await req.query<{ DateNow: Date }>(`
        SELECT DateNow FROM ${mainDbName}..Ref_CurrentDate WITH (NOLOCK)
      `);
      if (dateResult.recordset && dateResult.recordset.length > 0) {
        const dateNow = new Date(dateResult.recordset[0].DateNow);
        if (!endDate) {
          endDate = dateNow.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        if (!startDate) {
          startDate = `${dateNow.getFullYear()}-${String(dateNow.getMonth() + 1).padStart(2, '0')}-01`;
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil Ref_CurrentDate:", err);
    }
  }

  if (!startDate) startDate = "2025-12-31";
  if (!endDate) endDate = "2025-12-31";

  // 3. Fetch Theme Colors
  let themeColorBtnDownload = "#059669";
  let themeColorBtnFilterReport = "#2563EB";
  let themeColorBgHeader = "#1E293B";
  try {
    const themeResult = await req.query<any>(`
      SELECT TOP 1 * FROM ${mainDbName}..Ref_Dashboard_Theme WITH (NOLOCK) WHERE is_active = 1
    `);
    if (themeResult.recordset && themeResult.recordset.length > 0) {
      const row = themeResult.recordset[0];
      themeColorBtnDownload = row.color_btn_dwnld || themeColorBtnDownload;
      themeColorBtnFilterReport = row.color_btn_fltr_reprt || themeColorBtnFilterReport;
      themeColorBgHeader = row.color_bg_header || themeColorBgHeader;
    }
  } catch (err) {
    console.warn("Gagal mengambil Ref_Dashboard_Theme:", err);
  }

  // 4. Fetch Filter Parameters (Segment where KodeForm = 'ECL' and Ref_JenisAkad)
  let segmentList: SegmentOption[] = [];
  try {
    const segRes = await req.query<SegmentOption>(`
      SELECT id, name FROM ${mainDbName}..segment WITH (NOLOCK) WHERE KodeForm = 'ECL' ORDER BY id
    `);
    segmentList = segRes.recordset || [];
  } catch (err) {
    console.warn("Gagal mengambil daftar segment:", err);
  }

  let akadList: AkadOption[] = [];
  try {
    const akadRes = await req.query<{ sandi: string; keterangan: string }>(`
      SELECT SANDI as sandi, KETERANGAN as keterangan FROM ${mainDbName}..Ref_JenisAkad WITH (NOLOCK) ORDER BY SANDI
    `);
    akadList = akadRes.recordset || [];
  } catch (err) {
    console.warn("Gagal mengambil daftar Ref_JenisAkad:", err);
  }

  // 5. Fetch ECL Data & Total Count with Automatic Fallback
  const fetchTotalCount = async (sDate: string, eDate: string, seg?: string, akd?: string) => {
    try {
      const reqCount = await getActiveRequestMID();
      reqCount.input("tanggal_mulai", sDate);
      reqCount.input("tanggal_selesai", eDate);
      reqCount.input("segment", seg && seg !== "ALL" ? seg : null);
      reqCount.input("akad", akd && akd !== "ALL" ? akd : null);
      const countResult = await reqCount.query<{ total: number }>(`
        SELECT COUNT(*) as total 
        FROM ${mainDbName}..[vw_Kalkulasi_ECL_Statistik] a WITH (NOLOCK)
        LEFT JOIN ${mainDbName}..dim_fasilitas b WITH (NOLOCK) ON a.no_rekening = b.no_rekening
        LEFT JOIN ${mainDbName}..Ref_JenisAkad d WITH (NOLOCK) ON b.akad_syariah = d.SANDI 
        LEFT JOIN ${mainDbName}..segment c WITH (NOLOCK) ON a.kode_segment = c.id AND c.KodeForm = 'ECL'
        WHERE a.tanggal_laporan BETWEEN @tanggal_mulai AND @tanggal_selesai
          AND (@segment IS NULL OR a.kode_segment = @segment)
          AND (@akad IS NULL OR b.akad_syariah = @akad)
      `);
      if (countResult.recordset && countResult.recordset.length > 0) {
        return countResult.recordset[0].total || 0;
      }
    } catch (err) {
      console.warn("Gagal mengambil total data vw_Kalkulasi_ECL_Statistik:", err);
    }
    return 0;
  };

  const fetchTableRows = async (
    sDate: string,
    eDate: string,
    pageNum?: number,
    limitNum?: number,
    seg?: string,
    akd?: string
  ) => {
    try {
      const reqData = await getActiveRequestMID();
      reqData.input("tanggal_mulai", sDate);
      reqData.input("tanggal_selesai", eDate);
      reqData.input("segment", seg && seg !== "ALL" ? seg : null);
      reqData.input("akad", akd && akd !== "ALL" ? akd : null);

      let queryData = `
        SELECT 
            a.no_rekening,
            a.stage_psak,
            a.ead_secured,
            a.ead_unsecured,
            a.final_pd_rate,
            a.lgd_secured,
            a.lgd_unsecured,
            a.nominal_ecl_secured AS nominal_ecl_secured,
            a.nominal_ecl_unsecured AS nominal_ecl_unsecured,
            a.nominal_ecl_secured + a.nominal_ecl_unsecured AS total_ecl_statistik,
            c.name as segment_name,
            a.kode_segment,
            b.akad_syariah,
            d.KETERANGAN as nama_akad
        FROM ${mainDbName}..[vw_Kalkulasi_ECL_Statistik] a WITH (NOLOCK)
        LEFT JOIN ${mainDbName}..dim_fasilitas b WITH (NOLOCK) ON a.no_rekening = b.no_rekening
        LEFT JOIN ${mainDbName}..Ref_JenisAkad d WITH (NOLOCK) ON b.akad_syariah = d.SANDI 
        LEFT JOIN ${mainDbName}..segment c WITH (NOLOCK) ON a.kode_segment = c.id AND c.KodeForm = 'ECL'
        WHERE a.tanggal_laporan BETWEEN @tanggal_mulai AND @tanggal_selesai
          AND (@segment IS NULL OR a.kode_segment = @segment)
          AND (@akad IS NULL OR b.akad_syariah = @akad)
      `;

      if (pageNum && limitNum) {
        const offset = (pageNum - 1) * limitNum;
        queryData += `
        ORDER BY a.no_rekening
        OFFSET ${offset} ROWS FETCH NEXT ${limitNum} ROWS ONLY
        `;
      } else {
        queryData += `
        ORDER BY a.no_rekening
        `;
      }

      const eclResult = await reqData.query<ValidasiKomputasiRow>(queryData);
      return eclResult.recordset || [];
    } catch (err) {
      console.warn("Gagal mengambil vw_Kalkulasi_ECL_Statistik:", err);
      return [];
    }
  };

  let totalData = await fetchTotalCount(startDate, endDate, segmentParam, akadParam);
  let data: ValidasiKomputasiRow[] = await fetchTableRows(startDate, endDate, page, limit, segmentParam, akadParam);

  // FALLBACK: If query returns 0 records and no filter param applied, fallback to MAX(tanggal_laporan) so report form is NEVER empty on load
  if (data.length === 0 && !segmentParam && !akadParam && maxTanggalLaporan && (startDate !== maxTanggalLaporan || endDate !== maxTanggalLaporan)) {
    startDate = maxTanggalLaporan;
    endDate = maxTanggalLaporan;
    totalData = await fetchTotalCount(maxTanggalLaporan, maxTanggalLaporan);
    data = await fetchTableRows(maxTanggalLaporan, maxTanggalLaporan, page, limit);
  }

  return {
    namaBank,
    startDate,
    endDate,
    selectedSegment: segmentParam || "ALL",
    selectedAkad: akadParam || "ALL",
    segmentList,
    akadList,
    themeColorBtnDownload,
    themeColorBtnFilterReport,
    themeColorBgHeader,
    totalData,
    data
  };
}
