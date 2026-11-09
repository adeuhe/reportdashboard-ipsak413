export interface ValidasiKomputasiRow {
  no_rekening: string;
  stage_psak: number | string;
  ead_secured: number;
  ead_unsecured: number;
  final_pd_rate: number;
  lgd_secured: number;
  lgd_unsecured: number;
  nominal_ecl_secured: number;
  nominal_ecl_unsecured: number;
  total_ecl_statistik: number;
  kode_segment?: string;
  segment_name?: string;
  akad_syariah?: string;
  nama_akad?: string;
}

export interface SegmentOption {
  id: number | string;
  name: string;
}

export interface AkadOption {
  sandi: string;
  keterangan: string;
}

export interface ValidasiKomputasiResponse {
  namaBank: string;
  startDate: string;
  endDate: string;
  selectedSegment?: string;
  selectedAkad?: string;
  segmentList?: SegmentOption[];
  akadList?: AkadOption[];
  themeColorBtnDownload: string;
  themeColorBtnFilterReport: string;
  themeColorBgHeader: string;
  totalData: number;
  data: ValidasiKomputasiRow[];
}
