import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = docx.Document()

    # --- Page Setup & Margins ---
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # --- Color Palette ---
    COLOR_PRIMARY = RGBColor(30, 58, 138)     # Navy Blue (#1E3A8A)
    COLOR_SECONDARY = RGBColor(15, 118, 110)  # Teal Slate (#0F766E)
    COLOR_TEXT = RGBColor(51, 65, 85)         # Slate 700 (#334155)
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate 500 (#64748B)

    HEX_PRIMARY = "1E3A8A"
    HEX_LIGHT_BG = "F8FAFC"
    HEX_ZEBRA = "F1F5F9"
    HEX_CALLOUT_BG = "EFF6FF"
    HEX_CALLOUT_BORDER = "1D4ED8"

    # --- Helper Functions ---
    def set_cell_bg(cell, hex_color):
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for margin, value in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{margin}')
            node.set(qn('w:w'), str(value))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    def add_callout(doc, text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.5)
        cell = tbl.cell(0, 0)
        set_cell_bg(cell, HEX_CALLOUT_BG)
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        
        # Add left border
        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{HEX_CALLOUT_BORDER}"/>'
            f'<w:top w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(f"📌 Catatan Operational & Audit:\n{text}")
        run.font.size = Pt(9.5)
        run.font.italic = True
        run.font.color.rgb = COLOR_PRIMARY
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    def style_heading_1(text):
        h = doc.add_heading(text, level=1)
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(8)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return h

    def style_heading_2(text):
        h = doc.add_heading(text, level=2)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return h

    def style_heading_3(text):
        h = doc.add_heading(text, level=3)
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return h

    def style_heading_4(text):
        h = doc.add_heading(text, level=4)
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
        h.paragraph_format.keep_with_next = True
        run = h.runs[0]
        run.font.size = Pt(10.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return h

    def add_table(headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Header Row
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            set_cell_bg(hdr_cells[i], HEX_PRIMARY)
            set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.bold = True
                run.font.size = Pt(9.5)
                run.font.color.rgb = RGBColor(255, 255, 255)

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.rows[r_idx + 1].cells
            bg_color = HEX_ZEBRA if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                set_cell_bg(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=100, right=100)
                p = row_cells[c_idx].paragraphs[0]
                for run in p.runs:
                    run.font.size = Pt(9.0)
                    run.font.color.rgb = COLOR_TEXT

        if col_widths:
            for row in table.rows:
                for idx, width in enumerate(col_widths):
                    row.cells[idx].width = Inches(width)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # 1. TITLE & COVER SECTION
    # ==========================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(24)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("DOKUMEN PENJELASAN REPORT & DASHBOARD REGULATOR PSAK 71")
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Panduan Operasional, Penjelasan Variabel Data, dan Parameter Input Pelaporan CKPN & Credit Risk")
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = COLOR_SECONDARY

    # Metadata Block Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Tanggal Posisi Sistem", "19 September 2026"),
        ("Cakupan Modul", "Seluruh Report Baru (folder lib/) & Report Lama (folder report/)"),
        ("Standar Regulasi", "PSAK 71 / PSAK 413 (Instrumen Keuangan & CKPN) / Regulator Bank"),
        ("Format Dokumen", "Single Document per PIC / Header Hierarchies MS Office")
    ]
    for idx, (label, val) in enumerate(meta_data):
        c1, c2 = meta_table.rows[idx].cells
        c1.text = label
        c2.text = val
        set_cell_bg(c1, HEX_LIGHT_BG)
        set_cell_bg(c2, "FFFFFF")
        c1.paragraphs[0].runs[0].font.bold = True
        c1.paragraphs[0].runs[0].font.size = Pt(9)
        c2.paragraphs[0].runs[0].font.size = Pt(9)
        c1.width = Inches(2.2)
        c2.width = Inches(4.3)

    doc.add_page_break()

    # ==========================================
    # 2. EXECUTIVE SUMMARY & HOW TO READ
    # ==========================================
    style_heading_1("Ringkasan Eksekutif & Panduan Penggunaan")
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    p.add_run(
        "Dokumen ini dirancang khusus untuk memberikan pemahaman menyeluruh kepada Auditor Eksternal/Internal, Dewan Pengawas Syariah, Komite Risiko, dan Manajemen Risiko Bank dalam membaca serta mengoperasikan seluruh modul pelaporan (*reporting*) dan dasbor interaktif (*dashboard*) pada Sistem Regulator PSAK 71.\n\n"
        "Dokumen ini mengintegrasikan seluruh modul yang dikembangkan dalam dua versi codebase:\n"
        "1. Modul Baru (Berada di folder lib/): Merupakan standar pelaporan terbaru yang mencakup arsitektur audit agunan, haircut syariah, komputasi ECL waterfall, dan pengujian regresi makroekonomi.\n"
        "2. Modul Lama (Berada di folder report/): Merupakan modul legacy service yang mencakup audit trail anomali fasilitas, matriks konversi TTC ke PIT PD, EAD revolving, jurnal CKPN, dan proyeksi amortisasi.\n\n"
        "Setiap modul report diuraikan secara konsisten dalam tiga bagian utama:"
    )

    add_callout(doc, 
        "1. Fungsi Report: Penjelasan tujuan operasional, kebutuhan audit, serta manfaat bisnis report.\n"
        "2. Parameter yang Dipakai: Daftar seluruh filter input, tanggal posisi, segmen, dan opsi simulasi.\n"
        "3. Variabel-Variabel (Fields): Deskripsi detail setiap kolom/field data hasil keluaran sistem."
    )

    # ==========================================
    # PIC 1: AUDIT AGUNAN, HAIRCUT & VALUASI
    # ==========================================
    style_heading_1("PIC 1: Audit Agunan, Haircut & Valuasi (Valuation & Collateral Audit PIC)")
    p = doc.add_paragraph()
    p.add_run("Domain PIC ini bertanggung jawab atas keabsahan agunan sebagai underlying asset pembentukan LGD (Loss Given Default), kelayakan appraisal, audit alokasi agunan, serta penerapan haircut sesuai standar PSAK 71 dan Kepatuhan Syariah.")

    # --- Kategori 1.1 ---
    style_heading_2("Kategori 1.1: Valuasi & Appraisal Agunan")
    
    style_heading_3("1.1.1 Report Uji Valuasi & Kualitas Appraisal")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul ini dirancang khusus untuk mengaudit kewajaran nilai agunan fisik yang diikat sebagai penjamin fasilitas kredit. "
        "Mengacu pada standar konservatisme PSAK 71, nilai agunan tidak boleh 'kedaluwarsa'. Semakin lama umur penilaian (appraisal age), "
        "semakin besar penalti pemotongan nilai (haircut kedaluwarsa) yang diterapkan oleh sistem engine. Laporan ini memberikan bukti "
        "audit trail bahwa agunan terikat telah diverifikasi umur ekonomisnya dan dinilai secara independen."
    )
    add_callout(doc, "Fasilitas dengan agunan yang telah melebihi batas umur appraisal (misal > 24 bulan) otomatis mendapat haircut konservatif tambahan hingga 50% dari nilai pasar.")
    
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Tanggal Position", "Date Picker", "Tanggal Akhir Bulan (T-0)", "Menentukan posisi data snapshot yang diaudit."],
            ["Segmen Portofolio", "Dropdown", "All / Commercial / Retail / KPR", "Filter segmen kredit fasilitas terikat."],
            ["Status Valuation", "Select Option", "All / Active / Expired", "Menyaring agunan berdasarkan status masa berlaku appraisal."],
            ["Jenis Agunan", "Dropdown", "Tanah & Bangunan / Mesin / Kendaraan", "Menyaring kategori fisik barang agunan."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )

    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["No Rekening / CIF", "String", "Nomor fasilitas kredit dan identifier unik nasabah."],
            ["Nama Nasabah", "String", "Nama komersial debitur pemegang fasilitas."],
            ["Jenis Agunan", "String", "Klasifikasi bentuk fisik agunan terikat."],
            ["Nilai Appraisal Original", "Currency (IDR)", "Nilai pasar (Market Value) hasil wewenang independen appraiser."],
            ["Tanggal Valuation", "Date", "Tanggal penetapan nilai appraisal terakhir oleh penilai independen."],
            ["Umur Appraisal (Bulan)", "Integer", "Selisih waktu (bulan) antara Tanggal Position dengan Tanggal Valuation."],
            ["Status Kedaluwarsa", "Badge / String", "Status 'Valid' jika umur <= 24 bulan, atau 'Expired' jika umur > 24 bulan."],
            ["Haircut Kedaluwarsa (%)", "Percentage", "Tingkat penalti diskon tambahan yang dikenakan akibat faktor usia agunan."],
            ["Nilai Agunan Terkonservasi", "Currency (IDR)", "Nilai agunan final diakui = Nilai Original * (1 - Total Haircut %)."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 1.2 ---
    style_heading_2("Kategori 1.2: Penerapan Haircut Agunan")
    
    style_heading_3("1.2.1 Report Laporan Penerapan Haircut (Syariah Compliance)")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul ini merangkum pemotongan nilai agunan (Haircut) dengan mematuhi prinsip Kepatuhan Syariah (Sharia Compliance). "
        "Sistem membuktikan bahwa pemotongan nilai tidak dilakukan secara sewenang-wenang, melainkan murni berdasarkan proyeksi "
        "biaya lelang/eksekusi riil dan penarikan nilai kini (Present Value / PV) menggunakan Effective Profit Rate (EPR) sebagai tingkat diskonto."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Tanggal Position", "Date Picker", "Current Month End", "Tanggal snapshot posisi portofolio."],
            ["Bank / Cabang", "Dropdown", "Konsolidasi Bank / Cabang Specific", "Menyaring data skala bank atau entitas cabang."],
            ["Kategori Agunan", "Dropdown", "Real Estate / Cash / Vehicle", "Mengelompokkan berdasarkan jenis jaminan."],
            ["Discount Factor (EPR)", "Numeric (%)", "Effective Profit Rate Locked-in", "Tingkat marjin efektif yang digunakan untuk penarikan PV."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Jenis Agunan", "String", "Kelompok jaminan (misal: Rumah Tinggal, Ruko, Mobil)."],
            ["Vol Agunan", "Integer", "Jumlah unit fisik agunan yang dievaluasi."],
            ["Base Haircut (%)", "Percentage", "Persentase diskon standar industri/regulator atas likuidasi barang."],
            ["Eligible LTV (Gross)", "Currency (IDR)", "Batas maksimum pengakuan nilai agunan sebelum biaya eksekusi."],
            ["Potongan Biaya Eksekusi", "Currency (IDR)", "Estimasi biaya legal, lelang, dan notaris saat likuidasi."],
            ["Net Realizable (NRV)", "Currency (IDR)", "Nilai bersih agunan yang dapat dicairkan = (Gross LTV - Biaya) / (1 + EPR)^TTR."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 1.3 ---
    style_heading_2("Kategori 1.3: Alokasi & Coverage Agunan")
    
    style_heading_3("1.3.1 Report Alokasi Agunan")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul instrumen audit ini bertugas mencegah terjadinya alokasi ganda (double counting) agunan fisik pada beberapa rekening "
        "kredit yang saling terikat (cross-collateralized). Laporan ini membuktikan bahwa total nilai agunan yang didistribusikan "
        "ke seluruh rekening tidak pernah melebihi wujud fisik utuh agunan tersebut."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Periode Data", "Date Picker", "Current Audit Period", "Tanggal penarikan saldo alokasi agunan."],
            ["No Rekening / Fasilitas", "Text Search", "Optional (Single/All)", "Pencarian khusus nomor fasilitas tertentu."],
            ["Segmen Portofolio", "Dropdown", "All Segments", "Penyaringan segmen portofolio pembiayaan."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["ID Agunan", "String", "Kode unik pendaftaran sertifikat/aset agunan."],
            ["No Fasilitas Terikat", "String", "Daftar nomor rekening kredit yang dijamin oleh ID Agunan yang sama."],
            ["Nilai Pasar Appraisal", "Currency (IDR)", "Nilai fisik utuh agunan berdasarkan hasil appraisal independen."],
            ["Proporsi Alokasi (%)", "Percentage", "Persentase porsi jaminan yang dialokasikan ke rekening spesifik."],
            ["Nilai Agunan Dialokasikan", "Currency (IDR)", "Nominal rupiah agunan yang diperhitungkan untuk rekening tersebut."],
            ["Total Cover Collateral", "Currency (IDR)", "Akumulasi nilai alokasi ke seluruh fasilitas."],
            ["Status Over-Allocation", "Badge (Pass/Flag)", "Indikator peringatan jika total alokasi > Nilai Pasar (Flag Red)."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 1.4 ---
    style_heading_2("Kategori 1.4: Anomali & Root Cause Agunan")
    
    style_heading_3("1.4.1 Definisi Audit Trail Fasilitas (Asal-Usul Anomali)")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Laporan audit trail ini berfungsi melacak dan mengisolasi fasilitas pembiayaan yang mengalami anomali perhitungan "
        "(seperti NRV agunan melebihi Nilai Pasar, EAD Netto bernilai negatif, atau lonjakan haircut yang tidak wajar) "
        "sekaligus menentukan akar penyebab teknisnya (root cause analysis)."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Bank / Cabang", "Dropdown", "All Banks", "Pilihan entitas bank/cabang."],
            ["Segmen Portofolio", "Dropdown", "All Segments", "Pilihan segmen kredit."],
            ["Stage PSAK", "Dropdown", "All / Stage 1 / Stage 2 / Stage 3", "Filter kualitas kredit (Stage)."],
            ["Jenis Akad", "Dropdown", "Murabahah / Musyarakah / Ijarah / Conventional", "Pilihan skema akad pembiayaan."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Segmen / Akad", "String", "Klasifikasi segmen dan jenis akad fasilitas."],
            ["No. Fasilitas / Stage", "String", "Identifier rekening dan posisi Stage PSAK 71."],
            ["Nilai Pasar (A)", "Currency (IDR)", "Nilai appraisal awal barang agunan."],
            ["Total Haircut / NRV (B)", "Currency (IDR)", "Akumulasi pemotongan nilai dan Net Realizable Value final."],
            ["EAD Netto (C)", "Currency (IDR)", "Sisa porsi eksposur tanpa agunan (Unsecured EAD)."],
            ["Surplus (B - C)", "Currency (IDR)", "Selisih antara NRV agunan dengan EAD fasilitas."],
            ["Akar Penyebab (Root Cause)", "Text / Description", "Penjelasan teknis penyebab anomali (misal: Data appraisal missing, Double allocation, EAD override)."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 1.5 ---
    style_heading_2("Kategori 1.5: Mutasi & Arus Kas Pemulihan")
    
    style_heading_3("1.5.1 Report Mutasi Arus Kas Pemulihan (Recovery Cash Flow)")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul ini mencatat mutasi riil serta estimasi penarikan nilai kini (Net Present Value / NPV) dari arus kas pemulihan "
        "atas aset kredit macet (Stage 3). Mengukur efisiensi eksekusi lelang dan pengembalian kas sukarela nasabah."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Tanggal Default", "Date Range", "Default Date Range", "Rentang waktu penetapan status macet."],
            ["Sumber Arus Kas", "Dropdown", "All / Lelang / Eksekusi Agunan / Voluntari", "Jalur penerimaan uang pemulihan."],
            ["Effective Profit Rate", "Numeric (%)", "Locked-in Rate", "Tingkat bunga/marjin efektif diskonto."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["No Rekening", "String", "Identifier rekening kredit bermasalah."],
            ["Tgl Default", "Date", "Tanggal posisi fasilitas resmi masuk Stage 3."],
            ["Sumber Kas", "String", "Asal-usul penerimaan dana pemulihan."],
            ["Nominal Kotor", "Currency (IDR)", "Jumlah uang masuk bruto sebelum dipotong biaya eksekusi."],
            ["Haircut & TTR", "Numeric / Integer", "Diskon biaya lelang dan Time to Recovery (bulan)."],
            ["EPR Rate (%)", "Percentage", "Tingkat diskonto yang dikunci dari akad awal."],
            ["NPV Bersih", "Currency (IDR)", "Nilai kini arus kas pemulihan bersih = Nominal Kotor / (1 + EPR)^TTR."]
        ],
        [1.8, 1.2, 3.5]
    )

    # ==========================================
    # PIC 2: KALKULASI LGD, STAGE & ECL ATTRIBUTION
    # ==========================================
    doc.add_page_break()
    style_heading_1("PIC 2: Kalkulasi LGD, Stage & ECL Attribution (LGD & ECL Engine PIC)")
    p = doc.add_paragraph()
    p.add_run("Domain PIC ini bertanggung jawab atas perhitungan besaran potensi kerugian kredit saat default (Loss Given Default / LGD), komputasi cadangan kerugian (ECL) berbasis Grand Formula PSAK 71, serta penyajian waterfall penyerapan risiko.")

    # --- Kategori 2.1 ---
    style_heading_2("Kategori 2.1: Kalkulasi LGD (Collateral-Based & Kolektif)")
    
    style_heading_3("2.1.1 Report Kalkulasi LGD - Collateral Base")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Laporan ini membongkar anatomi perhitungan LGD berbasis agunan fisik secara granular. "
        "Menyajikan alur perubahan dari EAD Bruto, pengurangan nilai kini agunan (PV Recovery), hingga terbentuknya "
        "Uncovered EAD dan LGD Final (%). Sangat krusial bagi komite risiko untuk memastikan transparansi formula LGD."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Tanggal Position", "Date Picker", "Current Snapshot", "Tanggal posisi perhitungan LGD."],
            ["Segmen Kredit", "Dropdown", "Commercial / KPR / Auto", "Filter segmen bisnis."],
            ["Jenis Agunan", "Dropdown", "Properti / Cash / Non-Properti", "Kategori fisik jaminan."],
            ["Stage PSAK", "Dropdown", "All / Stage 1 / Stage 2 / Stage 3", "Tingkat risiko kredit."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["No Rekening", "String", "Nomor rekening kredit nasabah."],
            ["EAD Bruto", "Currency (IDR)", "Total eksposur kewajiban nasabah saat ini."],
            ["Nilai Pasar Agunan", "Currency (IDR)", "Nilai appraisal independen fisik agunan."],
            ["Total Haircut (%)", "Percentage", "Gabungan Base Haircut + Vintage Penalty + Biaya Eksekusi."],
            ["Total PV Recovery", "Currency (IDR)", "Nilai kini bersih penerimaan agunan masa depan."],
            ["Uncovered EAD", "Currency (IDR)", "Porsi EAD yang tidak ter-cover agunan = MAX(0, EAD - PV Recovery)."],
            ["LGD Final (%)", "Percentage", "Persentase kerugian final = Uncovered EAD / EAD Bruto."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("2.1.2 Report LGD Kolektif")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Menyajikan perhitungan LGD secara kolektif untuk segmen kredit massal/retail (misal Kartu Kredit, Pembiayaan Mikro, Tanpa Agunan) "
        "menggunakan historical recovery rate, base haircut segmen, dan vintage penalty."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Nama Segmen", "Dropdown", "Unsecured / Micro / Credit Card", "Filter segmen kolektif."],
            ["Metode LGD", "Dropdown", "Historical / Recovery Rate / Discounted Cash Flow", "Metode pengukur LGD kolektif."],
            ["Page & Limit", "Pagination", "Page 1, 100 rows", "Pengaturan navigasi baris data."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Nama Segmen", "String", "Kelompok portofolio kolektif."],
            ["Avg Base Haircut / Vintage Penalty", "Percentage", "Rata-rata diskon standar dan penalti umur tunggakan segmen."],
            ["LGD Floor Set", "Percentage", "Batas bawah minimum LGD regulator (misal 10%)."],
            ["Nominal EAD Purified", "Currency (IDR)", "Baki debet setelah pembersihan pencatatan."],
            ["Nilai Fisik / Agunan Diakui", "Currency (IDR)", "Porsi jaminan yang diakui secara kolektif."],
            ["Unsecured EAD / LGD Rate", "Currency / %", "Besaran eksposur terbuka dan rate LGD kolektif."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("2.1.3 Report Agregasi LGD Stage 2")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Menganalisis dampak lonjakan nilai LGD dan kebutuhan CKPN khusus pada portofolio kredit yang mengalami penurunan kualitas "
        "signifikan (Significant Increase in Credit Risk / SICR) yang berpindah ke Stage 2."
    )
    style_heading_4("B. Parameter & Variabel Utama")
    add_table(
        ["Nama Field / Parameter", "Tipe Data", "Keterangan Fungsional"],
        [
            ["Segmen Portofolio", "Dropdown / String", "Segmen kredit yang dievaluasi pada Stage 2."],
            ["Jumlah Rekening Stage 2", "Integer", "Total fasilitas yang teridentifikasi mengalami SICR."],
            ["Total EAD Stage 2", "Currency (IDR)", "Total eksposur kewajiban kredit di Stage 2."],
            ["Rata-rata LGD Baseline vs Adjusted", "Percentage", "Perbandingan tingkat LGD kondisi normal vs setelah penyesuaian SICR."],
            ["Delta ECL LGD Stage 2", "Currency (IDR)", "Tambahan pencadangan CKPN akibat kenaikan LGD Stage 2."]
        ],
        [2.0, 1.5, 3.0]
    )

    # --- Kategori 2.2 ---
    style_heading_2("Kategori 2.2: ECL Waterfall & Validasi Komputasi")
    
    style_heading_3("2.2.1 Report & Dashboard ECL Waterfall Attribution Chart")
    style_heading_4("A. Fungsi Report & Dashboard")
    p = doc.add_paragraph(
        "Modul Waterfall Attribution Chart menyajikan jembatan penyerapan risiko (Risk Absorption Traceability) "
        "dari hulu (Total EAD Bruto) hingga hilir (Final CKPN). Memvisualisasikan pos penyaring (Pilar & Drop): "
        "mulai dari penyusutan Off-Balance, pembentukan Stage 1 ECL (12-Month), Stage 2 ECL (Lifetime SICR), "
        "Stage 3 ECL (Impaired), hingga penyesuaian Macroeconomic Shock Adjustment."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Tanggal Position", "Date Picker", "T-0 Snapshot", "Tanggal posisi pelaporan komite risiko."],
            ["Segmen Kredit", "Dropdown", "All Segments", "Penyaringan portofolio pembiayaan."],
            ["Macro Scenario Shock", "Select", "Baseline / Optimistic / Pessimistic", "Pilihan skenario makro untuk melihat pergeseran waterfall."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Total Ultimate EAD", "Currency (IDR)", "Titik awal eksposur kotor portofolio sebelum penyaringan."],
            ["Drop Off-Balance", "Currency (IDR)", "Porsi fasilitas komitmen yang tidak ditarik nasabah."],
            ["EAD On-Balance", "Currency (IDR)", "Baki debet bersih di neraca bank."],
            ["Stage 1 ECL (12-Month)", "Currency (IDR)", "Cadangan kerugian kredit performa lancar (12 bulan)."],
            ["Stage 2 ECL (Lifetime)", "Currency (IDR)", "Cadangan kerugian kredit yang mengalami SICR (sepanjang tenor)."],
            ["Stage 3 ECL (Default)", "Currency (IDR)", "Cadangan kerugian kredit macet/impaired."],
            ["Macro Shock Adjustment", "Currency (IDR)", "Tambahan/pengurangan cadangan akibat proyeksi faktor FLI makro."],
            ["Final CKPN (ECL)", "Currency (IDR)", "Total Cadangan Kerugian Penurunan Nilai final di neraca."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("2.2.2 Report Validasi Komputasi Grand Formula ECL")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul audit teknis ini bertugas memverifikasi ketepatan komputasi Grand Formula PSAK 71 pada setiap fasilitas: "
        "ECL = EAD * PD * LGD * DF. Memisahkan perhitungan antara porsi Secured (tercover agunan) dan Unsecured (tanpa agunan)."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["No Rekening / Stage", "String / Enum", "Identifier fasilitas dan Stage PSAK (1, 2, 3)."],
            ["Final PD (%)", "Percentage", "Point-in-Time Probability of Default yang digunakan."],
            ["LGD Sec (%) / LGD Unsec (%)", "Percentage", "Tingkat kerugian porsi secured dan unsecured."],
            ["ECL Secured (Rp)", "Currency (IDR)", "Hasil kalkulasi ECL porsi jaminan = EAD_Sec * PD * LGD_Sec * DF."],
            ["ECL Unsecured (Rp)", "Currency (IDR)", "Hasil kalkulasi ECL porsi terbuka = EAD_Unsec * PD * LGD_Unsec * DF."],
            ["Total ECL Statistik (Rp)", "Currency (IDR)", "Akumulasi ECL statistik = ECL Secured + ECL Unsecured."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 2.3 ---
    style_heading_2("Kategori 2.3: Unsecured Floor & LGD Compliance")
    
    style_heading_3("2.3.1 Dashboard Unsecure Floor Compliance LGD")
    style_heading_4("A. Fungsi Dashboard")
    p = doc.add_paragraph(
        "Dasbor ini memantau pemenuhan batas minimum LGD (LGD Floor) yang dipersyaratkan regulator untuk porsi kredit tanpa agunan. "
        "Mencegah bank memasang nilai LGD terlalu rendah secara tidak realistis."
    )
    style_heading_4("B. Parameter & Variabel")
    add_table(
        ["Nama Variabel / Param", "Tipe Data", "Keterangan Fungsional"],
        [
            ["LGD Floor Target (%)", "Percentage Input", "Batas minimum LGD regulator (misal 10%, 25%)."],
            ["ECL As-Is vs Compliance Floor", "Currency (IDR)", "Perbandingan kebutuhan cadangan sebelum dan sesudah penerapan LGD Floor."],
            ["Selisih Cadangan Floor", "Currency (IDR)", "Nominal kekurangan cadangan yang harus ditambahkan jika LGD engine < LGD Floor."]
        ],
        [2.0, 1.5, 3.0]
    )

    # ==========================================
    # PIC 3: PEMODELAN PD, SICR & MAKROEKONOMI
    # ==========================================
    doc.add_page_break()
    style_heading_1("PIC 3: Pemodelan PD, SICR & Evaluasi Makroekonomi (PD, Macroeconomics & Modeling PIC)")
    p = doc.add_paragraph()
    p.add_run("Domain PIC ini bertanggung jawab atas pemodelan peluang gagal bayar (PD), kalibrasi Forward-Looking Information (FLI) makroekonomi, pengujian regresi econometric, serta penetapan kriteria perpindahan stage (SICR).")

    # --- Kategori 3.1 ---
    style_heading_2("Kategori 3.1: Matriks Konversi PD & Z-Macro Proyeksi")
    
    style_heading_3("3.1.1 Laporan Matriks Konversi TTC ke PIT PD")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Laporan ini menyajikan proses transformasi dari Through-The-Cycle (TTC) PD historis menjadi Point-In-Time (PIT) PD "
        "yang berwawasan ke depan (forward-looking). Mengintegrasikan bobot skenario makroekonomi (Baseline, Optimistic, Pessimistic) "
        "dan variabel skalar FLI."
    )
    style_heading_4("B. Parameter yang Dipakai")
    add_table(
        ["Nama Parameter", "Tipe Input", "Opsi / Default", "Deskripsi Fungsional"],
        [
            ["Periode Matriks", "Dropdown", "Current Period", "Periode berlakunya matriks konversi."],
            ["Segment ID", "Dropdown", "Corporate / Commercial / Retail", "Pilihan segmen kredit."],
            ["Stage PSAK", "Dropdown", "Stage 1 / Stage 2", "Tingkat risiko fasilitas."]
        ],
        [1.5, 1.2, 1.5, 2.3]
    )
    style_heading_4("C. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["SEGMENT ID", "String", "Kode identifikasi segmen portofolio."],
            ["TTC PD BASE (%)", "Percentage", "Nilai dasar PD historis jangka panjang (Through-The-Cycle)."],
            ["BASELINE (BOBOT %)", "Percentage", "Nilai PD dan bobot proyeksi skenario kondisi normal (misal 60%)."],
            ["OPTIMISTIC (BOBOT %)", "Percentage", "Nilai PD dan bobot skenario kondisi ekonomi membaik (misal 20%)."],
            ["PESSIMISTIC (BOBOT %)", "Percentage", "Nilai PD dan bobot skenario kondisi ekonomi memburuk (misal 20%)."],
            ["SCALAR / PIT PD (%)", "Numeric / %", "Faktor pengali pengisolasian FLI dan hasil akhir Point-In-Time PD."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("3.1.2 Report & Dashboard Proyeksi Z-Macro")
    style_heading_4("A. Fungsi Report & Dashboard")
    p = doc.add_paragraph(
        "Modul ini menyajikan proyeksi variabel indeks Z-Macroekonomi untuk horizon waktu ke depan. "
        "Mengukur dampak pergerakan variabel PDB, Suku Bunga, dan Inflasi terhadap risiko kredit dalam 3 skenario (Optimis, Moderat, Pesimis)."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Kualitas Pembiayaan", "String", "Kelompok hari tunggakan (DPD Bucket)."],
            ["Periode Proyeksi", "Date / Quarter", "Horizon waktu proyeksi (T+1 s/d T+12 kuartal)."],
            ["Standard Error (SE)", "Numeric", "Tingkat deviasi standar kesalahan estimasi model."],
            ["Z-Macro Optimis / Moderat / Pesimis", "Numeric", "Indeks proyeksi Z-Score untuk masing-masing skenario makro."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 3.2 ---
    style_heading_2("Kategori 3.2: Evaluasi SICR & Pemicu Kualitatif/Sektor Riil")
    
    style_heading_3("3.2.1 Report Pemicu SICR Kualitatif")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Dokumen pelaporan audit ini mendokumentasikan fasilitas pembiayaan yang mengalami penurunan kualitas signifikan (SICR) "
        "bukan karena tunggakan hari (DPD), melainkan karena pemicu kualitatif (non-financial triggers) seperti Yield Drop, "
        "Deviasi Fisik Agunan, atau indikator Syariah (Ta'addi / Taqsir)."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["No. Fasilitas / Akad", "String", "Identifier rekening kredit dan jenis akad."],
            ["DPD", "Integer", "Jumlah hari tunggakan pembayaran saat ini."],
            ["Yield Drop", "Badge (Flag)", "Indikator penurunan hasil usaha/margin bisnis nasabah."],
            ["Deviasi Fisik", "Badge (Flag)", "Indikator kerusakan atau penurunan fungsi fisik barang agunan."],
            ["Ta'addi / Taqsir", "Badge (Flag)", "Indikator kelalaian atau pelanggaran kesepakatan akad syariah."],
            ["Stage Awal -> Stage Akhir", "String / Enum", "Perubahan klasifikasi Stage (misal Stage 1 berpindah ke Stage 2)."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("3.2.2 Report Evaluasi SICR Off-Balance & Dashboard Sektor Riil")
    style_heading_4("A. Fungsi Report & Dashboard")
    p = doc.add_paragraph(
        "Evaluasi fasilitas komitmen off-balance sheet yang teridentifikasi SICR serta pemantauan indeks sektor riil "
        "(misal manufaktur, tambang) yang mempengaruhi degradasi kualitas kredit industri."
    )
    add_table(
        ["Indikator / Field", "Tipe Data", "Penjelasan Fungsional"],
        [
            ["Indeks Sektor Riil", "Numeric Index", "Indeks kesehatan industri sektor riil spesifik."],
            ["Plafon Undrawn & CCF", "Currency / %", "Eksposur komitmen yang belum ditarik dan Credit Conversion Factor."],
            ["ECL Off-Balance", "Currency (IDR)", "Cadangan kerugian yang dibentuk untuk fasilitas off-balance."]
        ],
        [2.0, 1.5, 3.0]
    )

    # --- Kategori 3.3 ---
    style_heading_2("Kategori 3.3: Uji Statistik, Asumsi Klasik & Sensitivitas")
    
    style_heading_3("3.3.1 Report & Dashboard Uji Asumsi Klasik")
    style_heading_4("A. Fungsi Report & Dashboard")
    p = doc.add_paragraph(
        "Modul pengujian validitas ekonometrika untuk memastikan model regresi PD FLI memenuhi 4 uji asumsi klasik: "
        "Normalitas, Multikolinearitas, Autokorelasi (Durbin-Watson), dan Heteroskedastisitas (White Test)."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Segmen Portofolio", "String", "Segmen kredit yang diuji model regresinya."],
            ["Kolektibilitas Pembiayaan", "String", "Tingkat kualitas historis yang dijadikan variabel terikat."],
            ["R-Square", "Numeric (0-1)", "Tingkat koefisien determinasi/dayation jelaskan model."],
            ["Durbin-Watson", "Numeric (0-4)", "Statistik uji autokorelasi residual (ideal di sekitar 2.0)."],
            ["Status Model", "Badge (Pass/Fail)", "Keputusan akhir kelayakan statistik model regresi."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("3.3.2 Audit Sensitivitas Makroekonomi Report")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Mengukur derajat sensitivitas responsivitas perubahan variabel makroekonomi (PDB, Suku Bunga) terhadap "
        "lonjakan nilai PD dan pembentukan CKPN (Sensitivity Analysis)."
    )
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["MODEL ID / VARIABEL MAKRO", "String", "Kode model regresi dan indikator makroekonomi penguji."],
            ["KOEFISIEN / P-VALUE", "Numeric", "Nilai bobot koefisien dan tingkat signifikansi statistik (p < 0.05)."],
            ["PERIODE LAG", "Integer (Q)", "Jeda waktu perambatan dampak makro ke kredit (misal Lag 2 Kuartal)."],
            ["STATUS ENGINE FLI", "Badge (Active/Inactive)", "Status pengaktifan variabel ke dalam engine otomatis FLI."]
        ],
        [1.8, 1.2, 3.5]
    )

    # ==========================================
    # PIC 4: PORTOFOLIO EAD, EXPOSURE & AMORTISASI
    # ==========================================
    doc.add_page_break()
    style_heading_1("PIC 4: Portofolio EAD, Exposure & Amortisasi (Credit Risk Exposure PIC)")
    p = doc.add_paragraph()
    p.add_run("Domain PIC ini bertanggung jawab atas perhitungan eksposur kewajiban nasabah saat default (Exposure at Default / EAD), konsolidasi komitmen off-balance, proyeksi jadwal amortisasi EIR, dan analisis transisi migrasi portofolio.")

    # --- Kategori 4.1 ---
    style_heading_2("Kategori 4.1: Konsolidasi EAD & Revolving Facilities")
    
    style_heading_3("4.1.1 Report Kertas Kerja Konsolidasi Ultimate EAD")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Kertas kerja konsolidasi ini mengagregasi seluruh komponen eksposur kredit nasabah: baik dari posisi On-Balance Sheet "
        "(Baki Debet / Outstanding Principal) maupun Off-Balance Sheet (Undrawn Limit * CCF Rate) hingga menghasilkan nilai final Ultimate EAD."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["No Rekening / CIF", "String", "Identifier fasilitas dan nomor induk nasabah."],
            ["Baki Debet On-Bal", "Currency (IDR)", "Saldo pokok pinjaman aktual di neraca saat ini."],
            ["Undrawn Limit", "Currency (IDR)", "Sisa plafon komitmen pembiayaan yang belum ditarik."],
            ["CCF Rate (%)", "Percentage", "Credit Conversion Factor (faktor konversi kredit historis segmen)."],
            ["EAD Off-Bal", "Currency (IDR)", "Nilai eksposur off-balance = Undrawn Limit * CCF Rate."],
            ["Total Ultimate EAD", "Currency (IDR)", "Total eksposur akhir = Baki Debet On-Bal + EAD Off-Bal."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("4.1.2 Report EAD Revolving & Dashboard Contagion")
    style_heading_4("A. Fungsi Report & Dashboard")
    p = doc.add_paragraph(
        "Laporan khusus untuk fasilitas berulang (Revolving) seperti Kartu Kredit dan Rekening Koran yang memiliki fluktuasi tarik-setor tinggi, "
        "serta analisis efek penularan (Contagion Effect) risiko kredit dalam grup usaha nasabah."
    )
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["SEGMEN PORTOFOLIO", "String", "Segmen kredit revolving (Kartu Kredit / Overdraft)."],
            ["TOTAL PLAFON / BAKI DEBET", "Currency (IDR)", "Agregasi limit kredit dan baki debet penggunaan."],
            ["AVG. CCF HISTORIS (%)", "Percentage", "Rata-rata historis pencairan sisa plafon."],
            ["TOTAL EAD FINAL", "Currency (IDR)", "Hasil komputasi EAD final portofolio revolving."],
            ["GROUP CONTAGION EAD", "Currency (IDR)", "Total eksposur risiko yang terjangkit efek penularan grup usaha."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 4.2 ---
    style_heading_2("Kategori 4.2: Proyeksi Amortisasi EIR")
    
    style_heading_3("4.2.1 Laporan Proyeksi Amortisasi")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul proyeksi ini menyajikan skedul pengembalian angsuran pokok, marjin/ujrah, dan sisa baki debet (EAD Proyeksi) "
        "hingga akhir tenor pembiayaan menggunakan metode Suku Bunga / Marjin Efektif (EIR Amortization)."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Bulan Ke- (Future)", "Integer", "Urutan bulan proyeksi angsuran ke depan (1, 2, ..., N)."],
            ["Tanggal Proyeksi (Est.)", "Date", "Estimasi tanggal jatuh tempo pembayaran angsuran."],
            ["Sisa Tenor (Bulan)", "Integer", "Sisa sisa durasi tenor kredit yang tersisa."],
            ["Angsuran Pokok", "Currency (IDR)", "Porsi pembayaran yang mengurangi sisa baki debet pokok."],
            ["Est. Marjin / Ujrah", "Currency (IDR)", "Porsi nisbah/marjin pendapatan bank."],
            ["Proyeksi EAD (Pokok Netto)", "Currency (IDR)", "Estimasi sisa eksposur pokok pada periode T+N."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 4.3 ---
    style_heading_2("Kategori 4.3: Transisi & Migrasi Portofolio")
    
    style_heading_3("4.3.1 Dashboard Transisi Migrasi")
    style_heading_4("A. Fungsi Dashboard")
    p = doc.add_paragraph(
        "Menyajikan matriks perpindahan posisi kolektibilitas atau Stage PSAK 71 dari periode awal (T-1) ke periode akhir (T-0) "
        "untuk mengukur tingkat perbaikan atau perburukan portofolio."
    )
    add_table(
        ["Field Matriks Migrasi", "Tipe Data", "Keterangan Fungsional"],
        [
            ["Stage Initial (T-1) -> Final (T-0)", "Matrix Table", "Jumlah rekening dan EAD yang berpindah antar Stage (misal Stage 1 -> Stage 2)."],
            ["Persentase Transisi (%)", "Percentage", "Tingkat rasio migrasi perpindahan kolektibilitas segmen."]
        ],
        [2.0, 1.5, 3.0]
    )

    # ==========================================
    # PIC 5: AKUNTANSI CKPN, FINANCIAL IMPACT & SYARIAH
    # ==========================================
    doc.add_page_break()
    style_heading_1("PIC 5: Akuntansi CKPN, Financial Impact & Kepatuhan Syariah (Accounting & Regulatory PIC)")
    p = doc.add_paragraph()
    p.add_run("Domain PIC ini bertanggung jawab atas penetapan cadangan kerugian (CKPN), pembentukan ayat jurnal akuntansi, simulasi dampak keuangan terhadap rasio kecukupan modal (CAR), audit hindsight outcome tagging, dan pengujian kepatuhan syariah.")

    # --- Kategori 5.1 ---
    style_heading_2("Kategori 5.1: Penentuan & Jurnal CKPN")
    
    style_heading_3("5.1.1 Penentuan CKPN (Simulasi Makro Shocks)")
    style_heading_4("A. Fungsi Dashboard & Report")
    p = doc.add_paragraph(
        "Modul simulasi 'What-If Analysis' yang dirancang bagi komite manajemen dan akuntan untuk memproyeksikan dampak kejutan makroekonomi "
        "(Macroeconomic Shocks) terhadap total CKPN dan rasio permodalan (CAR Impact)."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Segmen Portofolio", "String", "Kelompok bisnis pembiayaan bank."],
            ["Baseline CKPN", "Currency (IDR)", "Kebutuhan cadangan kerugian kondisi eksisting."],
            ["Adjusted CKPN", "Currency (IDR)", "Hasil kalkulasi cadangan setelah simulasi adjustment PD/LGD shock."],
            ["Variance CKPN (Nominal & %)", "Currency / %", "Selisih kenaikan/penurunan kebutuhan cadangan."],
            ["Impact to Capital / CAR", "Percentage", "Dampak penurunan/peningkatan Rasio Kecukupan Modal (CAR)."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("5.1.2 Report Jurnal CKPN")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Laporan instruksi akuntansi yang menghasilkan ayat jurnal pembukuan (Accounting Journal Entries) "
        "debet/kredit untuk pengakuan beban atau pemulihan CKPN bulanan sesuai Chart of Accounts (COA) Bank."
    )
    style_heading_4("B. Variabel-Variabel (Fields)")
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Segmen Portofolio", "String", "Kelompok segmen pembiayaan."],
            ["Target ECL Bulan Ini (A)", "Currency (IDR)", "Hasil komputasi total ECL statistik posisi bulan berjalan."],
            ["Saldo CKPN Bulan Lalu (B)", "Currency (IDR)", "Saldo akhir pembentukan CKPN posisi bulan sebelumnya."],
            ["Delta (Neto A - B)", "Currency (IDR)", "Besaran neto penambahan beban (jika A > B) atau pemulihan (jika A < B)."],
            ["Aksi Akuntansi (Instruction)", "String", "Instruksi pembukuan: 'Beban CKPN (Debet)' atau 'Pemulihan CKPN (Kredit)'."],
            ["COA Debet / COA Kredit", "String (GL Code)", "Kode rekening General Ledger debet dan kredit bank."]
        ],
        [1.8, 1.2, 3.5]
    )

    # --- Kategori 5.2 ---
    style_heading_2("Kategori 5.2: Simulasi Dampak Finansial & Executive Dashboard")
    
    style_heading_3("5.2.1 Simulasi Dampak Finansial & Summary Executive Dashboard")
    style_heading_4("A. Fungsi Report & Dashboard")
    p = doc.add_paragraph(
        "Membandingkan kebutuhan cadangan antara metode terdahulu (DPD Only) dengan standar PSAK 71 (Expected Credit Loss) "
        "guna mengidentifikasi selisih kekurangan cadangan (under-provisioning), serta menyajikan ringkasan indikator CAR, LCR, dan NSFR."
    )
    add_table(
        ["Field Executive", "Tipe Data", "Keterangan Fungsional"],
        [
            ["ECL AS-IS (DPD ONLY)", "Currency (IDR)", "Cadangan kerugian dihitung murni dari keterlambatan hari."],
            ["ECL TO-BE (PSAK 71)", "Currency (IDR)", "Cadangan kerugian dihitung dari kombinasi EAD * PD * LGD * DF."],
            ["SELISIH ECL (UNDER-PROVISIONING)", "Currency (IDR)", "Potensi beban kekurangan cadangan yang harus diserap ekuitas."],
            ["CAR Ratio / Trend", "Percentage", "Tingkat rasio permodalan eksekutif bank."]
        ],
        [2.0, 1.5, 3.0]
    )

    # --- Kategori 5.3 ---
    style_heading_2("Kategori 5.3: Hindsight Audit & Kepatuhan Syariah")
    
    style_heading_3("5.3.1 Report Outcome Tagging")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Laporan 'Kaca Spion' (Hindsight Audit) yang berfungsi mengevaluasi status akhir nasabah bermasalah "
        "setelah melewati masa observasi penagihan (12-24 bulan) untuk membuktikan akurasi penandaan sistem."
    )
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["KODE STATUS / DESKRIPSI", "String", "Status akhir nasabah: 'Lunas', 'Restrukturisasi Berhasil', 'Hapus Buku'."],
            ["JUMLAH REKENING / %", "Integer / %", "Jumlah dan proporsi persentase nasabah pada status tersebut."],
            ["PENYEBAB TERBERAT", "Text", "Faktor utama pemicu default (Trigger Reason)."]
        ],
        [1.8, 1.2, 3.5]
    )

    style_heading_3("5.3.2 Report Pengujian Kepatuhan Syariah")
    style_heading_4("A. Fungsi Report")
    p = doc.add_paragraph(
        "Modul laporan resmi bagi Dewan Pengawas Syariah (DPS) untuk membuktikan bahwa penarikan Nilai Kini (Present Value) "
        "dalam kalkulasi LGD dan CKPN TIDAK menggunakan suku bunga pasar berfluktuasi (Floating Rate), melainkan dikunci (locked-in) "
        "menggunakan Effective Profit Rate (EPR) sesuai akad syariah awal."
    )
    add_table(
        ["Nama Field / Header", "Tipe Data", "Deskripsi & Formulasi Fungsional"],
        [
            ["Jenis Akad", "String", "Skema akad syariah (Murabahah, Ijarah, Musyarakah, Mudharabah)."],
            ["Vol Fasilitas / Total EAD", "Integer / Currency", "Volume portofolio dan total nilai eksposur."],
            ["Total PV Recovery", "Currency (IDR)", "Nilai kini hasil pemulihan yang didiskonto dengan EPR."],
            ["Rata-Rata LGD %", "Percentage", "Tingkat Loss Given Default bersih yang patuh syariah."],
            ["Status Compliance Statement", "Badge (Pass)", "Pernyataan bebas riba dan keabsahan formula syariah engine."]
        ],
        [1.8, 1.2, 3.5]
    )

    # Save output document
    output_path = r"d:\work\Dashboard PSAK\regulator-dashboard\DOKUMEN_PENJELASAN_REPORT_PSAK71.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_document()
