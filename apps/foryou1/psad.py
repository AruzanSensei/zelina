from reportlab.lib.pagesizes import A4
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 Table, TableStyle, HRFlowable, PageBreak, KeepTogether)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

OUTPUT = "Modul_Belajar_SQL_Lengkap.pdf"

doc = SimpleDocTemplate(
    OUTPUT, pagesize=A4,
    rightMargin=2.2*cm, leftMargin=2.2*cm,
    topMargin=1*cm, bottomMargin=1*cm,
    title="Modul Belajar SQL Lengkap",
    author="SQL Learning Module",
)

# ── Palet warna modul pembelajaran ──────────────────────────────────────────
BIRU_GELAP   = '#1565c0'
BIRU_MUDA    = '#e3f2fd'
HIJAU_GELAP  = '#2e7d32'
HIJAU_MUDA   = '#e8f5e9'
ORANYE       = '#e65100'
ORANYE_MUDA  = '#fff3e0'
UNGU         = '#4a148c'
UNGU_MUDA    = '#f3e5f5'
MERAH        = '#c62828'
MERAH_MUDA   = '#ffebee'
ABU_GELAP    = '#37474f'
ABU_MUDA     = '#f5f5f5'
ABU_BORDER   = '#b0bec5'
KUNING       = '#f57f17'
KUNING_MUDA  = '#fffde7'
KODE_BG      = '#263238'
KODE_TEKS    = '#eceff1'

styles = getSampleStyleSheet()

# ── Styles untuk modul pembelajaran ─────────────────────────────────────────
cover_title = ParagraphStyle('CoverTitle',
    fontSize=28, fontName='Helvetica-Bold',
    textColor=colors.HexColor(BIRU_GELAP),
    alignment=TA_CENTER, spaceAfter=8, leading=36)

cover_sub = ParagraphStyle('CoverSub',
    fontSize=13, fontName='Helvetica',
    textColor=colors.HexColor(ABU_GELAP),
    alignment=TA_CENTER, spaceAfter=6, leading=18)

level_badge = ParagraphStyle('LevelBadge',
    fontSize=11, fontName='Helvetica-Bold',
    textColor=colors.white,
    alignment=TA_CENTER, spaceAfter=4, leading=16)

# Heading level bab (LEVEL BASIC, INTERMEDIATE, ADVANCED)
bab_style = ParagraphStyle('Bab',
    fontSize=15, fontName='Helvetica-Bold',
    textColor=colors.white,
    alignment=TA_CENTER, spaceAfter=6, spaceBefore=4, leading=20)

# Heading per topik (1. SELECT, 2. WHERE, dst)
topik_style = ParagraphStyle('Topik',
    fontSize=13, fontName='Helvetica-Bold',
    textColor=colors.HexColor(BIRU_GELAP),
    spaceAfter=6, spaceBefore=14, leading=18)

# Sub-heading (Penjelasan, Kegunaan, dll)
subheading_style = ParagraphStyle('SubHeading',
    fontSize=10.5, fontName='Helvetica-Bold',
    textColor=colors.HexColor(HIJAU_GELAP),
    spaceAfter=4, spaceBefore=8, leading=15)

# Teks normal
normal_style = ParagraphStyle('Normal2',
    fontSize=9.5, fontName='Helvetica',
    textColor=colors.HexColor(ABU_GELAP),
    spaceAfter=4, leading=14, alignment=TA_JUSTIFY)

# Teks bold inline
bold_style = ParagraphStyle('BoldInline',
    fontSize=9.5, fontName='Helvetica-Bold',
    textColor=colors.black, spaceAfter=4, leading=14)

# Kode SQL
kode_style = ParagraphStyle('Kode',
    fontSize=8.8, fontName='Courier',
    textColor=colors.HexColor(KODE_TEKS),
    backColor=colors.HexColor(KODE_BG),
    spaceAfter=2, spaceBefore=2, leading=13,
    leftIndent=6, rightIndent=6)

# Caption hasil tabel
caption_style = ParagraphStyle('Caption',
    fontSize=8.5, fontName='Helvetica-Oblique',
    textColor=colors.HexColor(ABU_GELAP),
    spaceAfter=4, spaceBefore=2, leading=12)

# Note / warning box
note_style = ParagraphStyle('Note',
    fontSize=9, fontName='Helvetica',
    textColor=colors.HexColor(ORANYE),
    spaceAfter=4, leading=13)

# Latihan heading
latihan_style = ParagraphStyle('Latihan',
    fontSize=10.5, fontName='Helvetica-Bold',
    textColor=colors.HexColor(UNGU),
    spaceAfter=4, spaceBefore=8, leading=15)

# Kunci jawaban
jawaban_style = ParagraphStyle('Jawaban',
    fontSize=9, fontName='Helvetica',
    textColor=colors.HexColor('#1a237e'),
    spaceAfter=3, leading=13, leftIndent=8)

# Nomor soal
soal_style = ParagraphStyle('Soal',
    fontSize=9.5, fontName='Helvetica-Bold',
    textColor=colors.HexColor(ABU_GELAP),
    spaceAfter=2, leading=13)

opsi_style = ParagraphStyle('Opsi',
    fontSize=9, fontName='Helvetica',
    textColor=colors.HexColor(ABU_GELAP),
    spaceAfter=1, leading=12, leftIndent=10)

esai_style = ParagraphStyle('Esai',
    fontSize=9.5, fontName='Helvetica',
    textColor=colors.HexColor(ABU_GELAP),
    spaceAfter=3, leading=13, leftIndent=8)

# ── Helper functions ─────────────────────────────────────────────────────────
def cp(color=colors.black, bold=False, size=8.5, align=TA_LEFT):
    return ParagraphStyle('cell',
        fontSize=size, leading=12,
        fontName='Helvetica-Bold' if bold else 'Helvetica',
        textColor=color, wordWrap='LTR', alignment=align)

CW  = cp()
CWh = cp(colors.white, bold=True, align=TA_CENTER)
CWb = cp(bold=True)
CWc = cp(colors.HexColor(KODE_TEKS))  # kode di tabel
CWg = cp(colors.HexColor(HIJAU_GELAP), bold=True)
CWr = cp(colors.HexColor(MERAH))
CWcenter = cp(align=TA_CENTER)

def kode_block(sql_text):
    """Buat blok kode SQL bergaya dark theme."""
    blok = []
    blok.append(Spacer(1, 3))
    lines = sql_text.strip().split('\n')
    kode_data = [[Paragraph(line if line.strip() else ' ', kode_style)] for line in lines]
    t = Table(kode_data, colWidths=[16*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(KODE_BG)),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    blok.append(t)
    blok.append(Spacer(1, 4))
    return blok

def hasil_tabel(headers, rows, col_widths=None):
    """Tabel hasil query SQL."""
    if col_widths is None:
        n = len(headers)
        w = 16 / n
        col_widths = [w * cm] * n
    data = [[Paragraph(h, CWh) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), CW) for c in row])
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor(BIRU_GELAP)),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(ABU_MUDA), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t

def info_box(text, color_bg=BIRU_MUDA, color_border=BIRU_GELAP, icon='📌'):
    """Kotak info/note."""
    st = ParagraphStyle('boxtext',
        fontSize=9, fontName='Helvetica', leading=13,
        textColor=colors.HexColor(ABU_GELAP), wordWrap='LTR')
    t = Table([[Paragraph(f'<b>{icon}</b> {text}', st)]],
              colWidths=[16*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(color_bg)),
        ('LEFTBORDERPADDING', (0,0), (0,-1), 0),
        ('LINEAFTER', (0,0), (0,-1), 3, colors.HexColor(color_border)),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor(color_border)),
    ]))
    return t

def level_header(text, color_bg, color_text=None):
    """Header untuk level Basic/Intermediate/Advanced."""
    st = ParagraphStyle('lvl',
        fontSize=14, fontName='Helvetica-Bold',
        textColor=colors.white if not color_text else colors.HexColor(color_text),
        alignment=TA_CENTER, leading=20)
    t = Table([[Paragraph(text, st)]], colWidths=[16*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(color_bg)),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def operator_tabel(rows):
    """Tabel operator SQL."""
    headers = ['Operator', 'Arti', 'Contoh']
    widths = [3*cm, 5*cm, 8*cm]
    data = [[Paragraph(h, CWh) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), CW) for c in row])
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor(HIJAU_GELAP)),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(HIJAU_MUDA), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t

def latihan_box(pg_questions, esai_questions):
    """Kotak latihan dengan PG dan Esai."""
    blok = []
    blok.append(Spacer(1, 6))
    # Header latihan
    t_header = Table([[Paragraph('🧪  LATIHAN', ParagraphStyle('lh',
        fontSize=11, fontName='Helvetica-Bold', textColor=colors.white,
        alignment=TA_CENTER, leading=16))]],
        colWidths=[16*cm])
    t_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(UNGU)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    blok.append(t_header)
    
    inner = []
    inner.append(Paragraph('<b>Pilihan Ganda:</b>', ParagraphStyle('ph',
        fontSize=9.5, fontName='Helvetica-Bold', textColor=colors.HexColor(UNGU),
        leading=14, spaceAfter=4, spaceBefore=6)))
    for i, (q, opts) in enumerate(pg_questions, 1):
        inner.append(Paragraph(f'<b>{i}.</b> {q}', ParagraphStyle('qq',
            fontSize=9, fontName='Helvetica', textColor=colors.HexColor(ABU_GELAP),
            leading=13, spaceAfter=2, leftIndent=4)))
        for opt in opts:
            inner.append(Paragraph(f'    {opt}', ParagraphStyle('oo',
                fontSize=8.5, fontName='Helvetica', textColor=colors.HexColor(ABU_GELAP),
                leading=12, spaceAfter=1, leftIndent=12)))
    
    inner.append(Spacer(1, 4))
    inner.append(Paragraph('<b>Esai:</b>', ParagraphStyle('eh',
        fontSize=9.5, fontName='Helvetica-Bold', textColor=colors.HexColor(UNGU),
        leading=14, spaceAfter=4)))
    for i, q in enumerate(esai_questions, 1):
        inner.append(Paragraph(f'<b>{i}.</b> {q}', ParagraphStyle('eq',
            fontSize=9, fontName='Helvetica', textColor=colors.HexColor(ABU_GELAP),
            leading=13, spaceAfter=3, leftIndent=4)))
    
    # Bungkus inner sebagai multi-row table (satu baris per elemen)
    # agar ReportLab bisa memotong konten lintas halaman (splitByRow=True by default),
    # sehingga sisa ruang di halaman sebelumnya dapat diisi, bukan loncat seluruhnya.
    rows = [[p] for p in inner]
    t_inner = Table(rows, colWidths=[16*cm])
    t_inner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(UNGU_MUDA)),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        # Padding tambahan di baris pertama dan terakhir
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 8),
        # Border kiri/kanan di semua baris; atas/bawah hanya di tepi
        ('LINEBEFORE',  (0,0),  (0,-1),  0.5, colors.HexColor(UNGU)),
        ('LINEAFTER',   (-1,0), (-1,-1), 0.5, colors.HexColor(UNGU)),
        ('LINEABOVE',   (0,0),  (-1,0),  0.5, colors.HexColor(UNGU)),
        ('LINEBELOW',   (0,-1), (-1,-1), 0.5, colors.HexColor(UNGU)),
    ]))
    blok.append(t_inner)
    blok.append(Spacer(1, 10))
    return blok

# ═══════════════════════════════════════════════════════════════════════════════
# MULAI BUILD STORY
# ═══════════════════════════════════════════════════════════════════════════════
story = []

# ── COVER ────────────────────────────────────────────────────────────────────
# story.append(Spacer(1, 2*cm))

cover_bg = Table([[Paragraph('📘', ParagraphStyle('ic', fontSize=40, alignment=TA_CENTER, leading=50))]],
                  colWidths=[16*cm])
cover_bg.setStyle(TableStyle([('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
# story.append(cover_bg)
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph("MODUL LENGKAP BELAJAR SQL", cover_title))
story.append(Paragraph("Dari Dasar Hingga Advanced", ParagraphStyle('cs2',
    fontSize=15, fontName='Helvetica', textColor=colors.HexColor(ORANYE),
    alignment=TA_CENTER, spaceAfter=6)))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Penjelasan Mendalam · Contoh Nyata · Latihan & Kunci Jawaban",
    cover_sub))
story.append(Spacer(1, 0.6*cm))

# Badge level
badge_data = [
    [Paragraph('🟢  BASIC', ParagraphStyle('b1', fontSize=11, fontName='Helvetica-Bold',
        textColor=colors.white, alignment=TA_CENTER)),
     Paragraph('🟡  INTERMEDIATE', ParagraphStyle('b2', fontSize=11, fontName='Helvetica-Bold',
        textColor=colors.white, alignment=TA_CENTER)),
     Paragraph('🔴  ADVANCED', ParagraphStyle('b3', fontSize=11, fontName='Helvetica-Bold',
        textColor=colors.white, alignment=TA_CENTER))],
]
badge_t = Table(badge_data, colWidths=[5*cm, 6*cm, 5*cm], rowHeights=[0.9*cm])
badge_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,0), colors.HexColor(HIJAU_GELAP)),
    ('BACKGROUND', (1,0), (1,0), colors.HexColor(KUNING)),
    ('BACKGROUND', (2,0), (2,0), colors.HexColor(MERAH)),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 4),
    ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ('INNERGRID', (0,0), (-1,-1), 2, colors.white),
]))
story.append(badge_t)
story.append(Spacer(1, 0.8*cm))

story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 0.4*cm))

# Daftar isi singkat
toc_data = [
    [Paragraph('<b>LEVEL</b>', cp(colors.white, bold=True, align=TA_CENTER)),
     Paragraph('<b>TOPIK</b>', cp(colors.white, bold=True)),
     Paragraph('<b>JUMLAH</b>', cp(colors.white, bold=True, align=TA_CENTER))],
    [Paragraph('🟢 Basic', cp(colors.HexColor(HIJAU_GELAP), bold=True, align=TA_CENTER)),
     Paragraph('SELECT, WHERE, INSERT, UPDATE, DELETE, ORDER BY, LIMIT & OFFSET', cp()),
     Paragraph('7 Topik', cp(align=TA_CENTER))],
    [Paragraph('🟡 Intermediate', cp(colors.HexColor(KUNING), bold=True, align=TA_CENTER)),
     Paragraph('COUNT, GROUP BY, CREATE TABLE, PRIMARY KEY, DISTINCT, LIKE, IN, BETWEEN, ALIAS, SUM & AVG, HAVING, JOIN, SUBQUERY, INDEX', cp()),
     Paragraph('14 Topik', cp(align=TA_CENTER))],
    [Paragraph('🔴 Advanced', cp(colors.HexColor(MERAH), bold=True, align=TA_CENTER)),
     Paragraph('UNION, CASE, VIEW, ALTER TABLE, NOT NULL & DEFAULT, TRANSACTION, NORMALISASI, WINDOW FUNCTION, CTE, STORED PROCEDURE, TRIGGER, QUERY OPTIMIZATION', cp()),
     Paragraph('12 Topik', cp(align=TA_CENTER))],
]
toc_t = Table(toc_data, colWidths=[3.5*cm, 9.5*cm, 3*cm])
toc_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor(BIRU_GELAP)),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(ABU_MUDA), colors.white]),
    ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
]))
story.append(toc_t)
story.append(Spacer(1, 0.8*cm))

story.append(Paragraph("Dataset standar digunakan di seluruh modul agar kamu bisa fokus pada perbedaan setiap perintah.",
    caption_style))

# Dataset
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Dataset Standar — Tabel <b>users</b>", ParagraphStyle('ds',
    fontSize=10, fontName='Helvetica-Bold', textColor=colors.HexColor(BIRU_GELAP),
    spaceAfter=4, leading=14)))
story.append(hasil_tabel(
    ['id', 'nama', 'umur', 'kota'],
    [['1','Budi','20','Bandung'],['2','Andi','25','Jakarta'],
     ['3','Rina','22','Bandung'],['4','Sari','30','Surabaya']],
    [2*cm, 4*cm, 4*cm, 6*cm]
))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Dataset Standar — Tabel <b>orders</b>", ParagraphStyle('ds2',
    fontSize=10, fontName='Helvetica-Bold', textColor=colors.HexColor(BIRU_GELAP),
    spaceAfter=4, leading=14)))
story.append(hasil_tabel(
    ['id', 'user_id', 'produk', 'harga'],
    [['1','1','Laptop','12.000.000'],['2','2','Mouse','150.000'],
     ['3','1','Keyboard','450.000'],['4','3','Monitor','2.500.000']],
    [2*cm, 3*cm, 5*cm, 6*cm]
))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL BASIC
# ═══════════════════════════════════════════════════════════════════════════════
story.append(level_header("🟢  LEVEL BASIC  —  Fondasi SQL", HIJAU_GELAP))
story.append(Spacer(1, 12))

# ── Topik 1: SELECT ──────────────────────────────────────────────────────────
story.append(Paragraph("1. SELECT — Mengambil Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))

story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>SELECT</b> adalah perintah paling fundamental dalam SQL. Fungsinya adalah <b>membaca dan menampilkan data</b> "
    "dari satu atau lebih tabel. SQL bersifat <b>deklaratif</b> — kita hanya menyebutkan <i>apa</i> yang kita mau, "
    "bukan <i>bagaimana cara mengambilnya</i>. Database engine yang mengurus prosesnya.", normal_style))

story.append(info_box(
    "Kenapa jangan pakai SELECT * di production? Mengambil semua kolom memboroskan bandwidth, "
    "memperlambat query, dan bisa membocorkan kolom sensitif (seperti password_hash). "
    "Selalu sebut nama kolom secara eksplisit.", KUNING_MUDA, KUNING, '⚠️'))
story.append(Spacer(1, 4))

story.append(Paragraph("💡 Contoh Query", subheading_style))
story.append(Paragraph("<b>Contoh 1 — Ambil semua kolom</b>", bold_style))
story += kode_block("SELECT * FROM users;")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['1','Budi','20','Bandung'],['2','Andi','25','Jakarta'],
     ['3','Rina','22','Bandung'],['4','Sari','30','Surabaya']],
    [2*cm, 4*cm, 4*cm, 6*cm]))
story.append(Spacer(1,6))

story.append(Paragraph("<b>Contoh 2 — Ambil kolom tertentu</b>", bold_style))
story += kode_block("SELECT nama, kota FROM users;")
story.append(hasil_tabel(['nama','kota'],
    [['Budi','Bandung'],['Andi','Jakarta'],['Rina','Bandung'],['Sari','Surabaya']],
    [8*cm, 8*cm]))
story.append(Spacer(1,6))

story.append(Paragraph("<b>Contoh 3 — SELECT dengan kalkulasi</b>", bold_style))
story += kode_block("SELECT nama, umur, umur + 5 AS umur_5_tahun_lagi FROM users;")
story.append(hasil_tabel(['nama','umur','umur_5_tahun_lagi'],
    [['Budi','20','25'],['Andi','25','30'],['Rina','22','27'],['Sari','30','35']],
    [5*cm, 5*cm, 6*cm]))

story += latihan_box(
    [("Apa fungsi utama perintah SELECT dalam SQL?",
      ["A. Menghapus data dari tabel","B. Mengambil dan menampilkan data dari tabel","C. Mengubah struktur tabel","D. Menambahkan baris baru ke tabel"]),
     ("Query mana yang HANYA menampilkan kolom nama dari tabel users?",
      ["A. SELECT users FROM nama;","B. SELECT * FROM users;","C. SELECT nama FROM users;","D. FROM users SELECT nama"]),
     ("Apa arti tanda * pada SELECT * FROM users?",
      ["A. Pilih data secara acak","B. Lakukan perkalian pada semua data","C. Ambil semua kolom dari tabel","D. Ambil hanya kolom pertama"])],
    ["Jelaskan perbedaan antara SELECT * dan SELECT nama, umur dari sisi performa dan keamanan data di aplikasi nyata!",
     "Tuliskan query SQL untuk menampilkan kolom nama dan hasil perkalian umur dengan 2, dengan nama kolom hasil berupa \"dua_kali_umur\". Jelaskan tiap bagian query tersebut!"]
)

# ── Topik 2: WHERE ───────────────────────────────────────────────────────────
story.append(Paragraph("2. WHERE — Filter / Menyaring Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))

story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>WHERE</b> adalah klausa yang diletakkan setelah nama tabel untuk <b>memfilter baris</b> mana saja yang "
    "akan dikembalikan. Database mengecek setiap baris satu per satu; hanya baris yang memenuhi kondisi WHERE "
    "yang akan masuk ke hasil query. Tanpa WHERE, query akan mengambil <b>semua baris</b> dalam tabel.", normal_style))

story.append(Paragraph("⚠️ Operator Perbandingan", subheading_style))
op_data = [
    [Paragraph('<b>Operator</b>', CWh), Paragraph('<b>Arti</b>', CWh), Paragraph('<b>Contoh</b>', CWh)],
    [Paragraph('=', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Sama dengan', CW), Paragraph("WHERE kota = 'Bandung'", cp(colors.HexColor(HIJAU_GELAP)))],
    [Paragraph('!= / <>', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Tidak sama dengan', CW), Paragraph("WHERE kota != 'Jakarta'", cp(colors.HexColor(HIJAU_GELAP)))],
    [Paragraph('>', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Lebih besar', CW), Paragraph('WHERE umur > 20', cp(colors.HexColor(HIJAU_GELAP)))],
    [Paragraph('<', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Lebih kecil', CW), Paragraph('WHERE umur < 30', cp(colors.HexColor(HIJAU_GELAP)))],
    [Paragraph('AND', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Kedua kondisi harus terpenuhi', CW), Paragraph("WHERE umur > 20 AND kota = 'Bandung'", cp(colors.HexColor(HIJAU_GELAP)))],
    [Paragraph('OR', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Salah satu kondisi terpenuhi', CW), Paragraph("WHERE kota = 'Bandung' OR kota = 'Jakarta'", cp(colors.HexColor(HIJAU_GELAP)))],
    [Paragraph('NOT', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Membalik kondisi', CW), Paragraph("WHERE NOT kota = 'Surabaya'", cp(colors.HexColor(HIJAU_GELAP)))],
]
op_t = Table(op_data, colWidths=[3*cm, 5.5*cm, 7.5*cm])
op_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor(HIJAU_GELAP)),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(HIJAU_MUDA), colors.white]),
    ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
]))
story.append(op_t)
story.append(Spacer(1, 6))

story.append(Paragraph("💡 Contoh Query", subheading_style))
story.append(Paragraph("<b>Contoh 1 — Filter angka</b>", bold_style))
story += kode_block("SELECT * FROM users WHERE umur > 22;")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['2','Andi','25','Jakarta'],['4','Sari','30','Surabaya']],
    [2*cm,4*cm,4*cm,6*cm]))
story.append(Paragraph("Budi (20) dan Rina (22) tidak muncul karena tidak memenuhi syarat umur > 22.", caption_style))

story.append(Paragraph("<b>Contoh 2 — Filter teks</b>", bold_style))
story += kode_block("SELECT * FROM users WHERE kota = 'Bandung';")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['1','Budi','20','Bandung'],['3','Rina','22','Bandung']],
    [2*cm,4*cm,4*cm,6*cm]))

story.append(Paragraph("<b>Contoh 3 — Kombinasi AND</b>", bold_style))
story += kode_block("SELECT * FROM users WHERE umur > 20 AND kota = 'Bandung';")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['3','Rina','22','Bandung']],
    [2*cm,4*cm,4*cm,6*cm]))
story.append(Paragraph("Hanya Rina yang memenuhi kedua syarat sekaligus. Budi gagal karena umur = 20 (tidak > 20).", caption_style))

story += latihan_box(
    [("Apa fungsi klausa WHERE dalam SQL?",
      ["A. Mengurutkan hasil query","B. Mengelompokkan data berdasarkan kolom","C. Memfilter baris berdasarkan kondisi tertentu","D. Membatasi jumlah kolom yang ditampilkan"]),
     ("Query mana yang mengambil semua user dari kota Jakarta?",
      ["A. SELECT * FROM users WHERE kota = 'Jakarta';","B. SELECT * FROM users FILTER kota = 'Jakarta';","C. SELECT kota FROM users WHERE = 'Jakarta';","D. SELECT * FROM users kota = 'Jakarta';"]),
     ("Operator mana yang digunakan untuk kondisi 'tidak sama dengan'?",
      ["A. ==","B. =","C. >=","D. !="])],
    ["Jelaskan perbedaan antara operator AND dan OR dalam klausa WHERE, dan berikan masing-masing satu contoh query menggunakan dataset di atas!",
     "Mengapa sangat penting menggunakan WHERE saat melakukan perintah DELETE atau UPDATE? Apa yang terjadi jika kita lupa menambahkan WHERE?"]
)

# ── Topik 3: INSERT ──────────────────────────────────────────────────────────
story.append(Paragraph("3. INSERT — Menambah Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>INSERT INTO</b> digunakan untuk <b>menambahkan satu atau lebih baris baru</b> ke dalam tabel. "
    "Data yang dimasukkan harus sesuai dengan tipe data kolom. Jika ada kolom dengan constraint <b>NOT NULL</b>, "
    "kolom tersebut wajib diisi.", normal_style))

story.append(Paragraph("<b>Contoh 1 — Insert satu baris</b>", bold_style))
story += kode_block("INSERT INTO users (id, nama, umur, kota)\nVALUES (5, 'Doni', 28, 'Jakarta');")

story.append(Paragraph("<b>Contoh 2 — Insert banyak baris sekaligus (lebih efisien)</b>", bold_style))
story += kode_block("INSERT INTO users (id, nama, umur, kota)\nVALUES\n  (7, 'Tono', 27, 'Semarang'),\n  (8, 'Wati', 24, 'Yogyakarta');")
story.append(info_box("INSERT banyak baris sekaligus jauh lebih cepat daripada INSERT satu per satu karena hanya membutuhkan satu round-trip ke database.", BIRU_MUDA, BIRU_GELAP, 'ℹ️'))

story += latihan_box(
    [("Perintah SQL mana yang digunakan untuk menambahkan data baru ke tabel?",
      ["A. ADD INTO","B. INSERT INTO","C. UPDATE INTO","D. CREATE INTO"]),
     ("Jika tabel users memiliki kolom id sebagai PRIMARY KEY, apa yang terjadi jika kita INSERT dengan id yang sudah ada?",
      ["A. Data lama otomatis tertimpa","B. Data baru ditambahkan dengan ID baru","C. Query gagal dan menghasilkan error","D. Query berhasil dan menghasilkan dua baris dengan ID sama"]),
     ("Manakah sintaks INSERT yang benar?",
      ["A. INSERT users VALUES (5, 'Doni', 28, 'Jakarta');","B. INSERT INTO users VALUES 5, 'Doni', 28, 'Jakarta';","C. INSERT INTO users (id, nama, umur, kota) VALUES (5, 'Doni', 28, 'Jakarta');","D. INTO users INSERT (id, nama) VALUES (5, 'Doni');"])],
    ["Jelaskan keuntungan melakukan INSERT banyak baris sekaligus dibandingkan INSERT satu per satu dalam hal performa database!",
     "Apa yang dimaksud dengan nilai NULL pada kolom yang tidak diisi saat INSERT? Kapan hal ini diperbolehkan dan kapan tidak?"]
)

# ── Topik 4: UPDATE ──────────────────────────────────────────────────────────
story.append(Paragraph("4. UPDATE — Mengubah Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>UPDATE</b> digunakan untuk <b>memodifikasi nilai</b> pada baris yang sudah ada di tabel. "
    "Kamu bisa mengubah satu kolom saja atau beberapa kolom sekaligus dalam satu query.", normal_style))
story.append(info_box(
    "SANGAT PENTING: Selalu sertakan WHERE saat UPDATE! Tanpa WHERE, SEMUA baris di tabel akan berubah.",
    MERAH_MUDA, MERAH, '🚨'))

story.append(Paragraph("<b>Contoh 1 — Update satu kolom</b>", bold_style))
story += kode_block("UPDATE users SET umur = 26 WHERE id = 2;")
story.append(Paragraph("Sebelum: Andi berumur 25 | Sesudah: Andi berumur 26", caption_style))

story.append(Paragraph("<b>Contoh 2 — Update beberapa kolom sekaligus</b>", bold_style))
story += kode_block("UPDATE users SET kota = 'Bekasi', umur = 21 WHERE id = 1;")

story.append(Paragraph("<b>Contoh 3 — Update berdasarkan kondisi non-ID</b>", bold_style))
story += kode_block("UPDATE users SET kota = 'Jakarta' WHERE kota = 'Bandung';")
story.append(Paragraph("Sesudah: Semua user yang tinggal di Bandung (Budi dan Rina) sekarang pindah ke Jakarta.", caption_style))

story += latihan_box(
    [("Apa yang terjadi jika kita menjalankan UPDATE users SET umur = 99; tanpa WHERE?",
      ["A. Hanya baris pertama yang berubah","B. Query gagal karena tidak ada WHERE","C. Semua baris di tabel akan memiliki umur = 99","D. Tidak ada yang berubah"]),
     ("Query mana yang benar untuk mengubah kota Rina menjadi 'Yogyakarta'?",
      ["A. CHANGE users SET kota = 'Yogyakarta' WHERE nama = 'Rina';","B. UPDATE users SET kota = 'Yogyakarta' WHERE nama = 'Rina';","C. UPDATE kota = 'Yogyakarta' FROM users WHERE nama = 'Rina';","D. SET kota = 'Yogyakarta' IN users WHERE nama = 'Rina';"]),
     ("Bagaimana cara mengubah dua kolom sekaligus dalam satu perintah UPDATE?",
      ["A. UPDATE users SET umur = 25; SET kota = 'Jakarta' WHERE id = 1;","B. UPDATE users SET (umur = 25, kota = 'Jakarta') WHERE id = 1;","C. UPDATE users SET umur = 25, kota = 'Jakarta' WHERE id = 1;","D. UPDATE users umur = 25, kota = 'Jakarta' WHERE id = 1;"])],
    ["Mengapa sangat dianjurkan untuk selalu menggunakan WHERE saat melakukan UPDATE? Berikan contoh skenario nyata di aplikasi e-commerce jika lupa menggunakan WHERE!",
     "Tuliskan query untuk menaikkan umur semua user yang tinggal di Bandung sebesar 1 tahun. Jelaskan mengapa query ini menggunakan ekspresi umur = umur + 1 dan bukan nilai langsung!"]
)

# ── Topik 5: DELETE ──────────────────────────────────────────────────────────
story.append(Paragraph("5. DELETE — Menghapus Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>DELETE FROM</b> digunakan untuk <b>menghapus satu atau lebih baris</b> dari tabel. "
    "DELETE tanpa WHERE adalah bencana — ia akan menghapus <b>semua data</b> di tabel. "
    "Data yang dihapus <b>tidak bisa dikembalikan</b> kecuali menggunakan TRANSACTION (ROLLBACK).", normal_style))

story.append(Paragraph("⚠️ Perbedaan DELETE vs TRUNCATE vs DROP", subheading_style))
diff_data = [
    [Paragraph('<b>Perintah</b>', CWh), Paragraph('<b>Fungsi</b>', CWh),
     Paragraph('<b>Bisa di-rollback?</b>', CWh), Paragraph('<b>Hapus Struktur?</b>', CWh)],
    [Paragraph('DELETE', cp(bold=True)), Paragraph('Hapus baris tertentu (dengan WHERE)', CW),
     Paragraph('Ya (dalam TRANSACTION)', cp(colors.HexColor(HIJAU_GELAP))), Paragraph('Tidak', CW)],
    [Paragraph('TRUNCATE', cp(bold=True)), Paragraph('Hapus semua baris, lebih cepat', CW),
     Paragraph('Tergantung DB', cp(colors.HexColor(KUNING))), Paragraph('Tidak', CW)],
    [Paragraph('DROP', cp(bold=True)), Paragraph('Hapus seluruh tabel beserta strukturnya', CW),
     Paragraph('Tidak', cp(colors.HexColor(MERAH), bold=True)), Paragraph('Ya', cp(colors.HexColor(MERAH)))],
]
diff_t = Table(diff_data, colWidths=[3*cm, 5.5*cm, 4*cm, 3.5*cm])
diff_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor(MERAH)),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(MERAH_MUDA), colors.white]),
    ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
]))
story.append(diff_t)
story.append(Spacer(1, 6))

story.append(Paragraph("<b>Contoh 1 — Hapus berdasarkan ID</b>", bold_style))
story += kode_block("DELETE FROM users WHERE id = 6;")

story.append(Paragraph("<b>Contoh 2 — Hapus berdasarkan kondisi</b>", bold_style))
story += kode_block("DELETE FROM users WHERE umur < 21;")

story.append(Paragraph("<b>Contoh 3 — Hapus semua data (BERBAHAYA!)</b>", bold_style))
story += kode_block("DELETE FROM users;  -- Semua baris terhapus, tabel masih ada tapi kosong")

story += latihan_box(
    [("Apa perbedaan utama antara DELETE FROM users; dan DROP TABLE users;?",
      ["A. Keduanya identik","B. DELETE menghapus baris, DROP menghapus seluruh tabel termasuk strukturnya","C. DROP menghapus baris, DELETE menghapus strukturnya","D. DELETE hanya bisa menghapus satu baris"]),
     ("Query mana yang menghapus semua user yang berumur di atas 25?",
      ["A. REMOVE FROM users WHERE umur > 25;","B. DELETE users WHERE umur > 25;","C. DELETE FROM users WHERE umur > 25;","D. DELETE * FROM users WHERE umur > 25;"]),
     ("Apa yang terjadi jika DELETE FROM users; dijalankan tanpa WHERE?",
      ["A. Query error karena WHERE wajib ada","B. Hanya baris pertama yang terhapus","C. Semua baris terhapus, tabel menjadi kosong","D. Tabel ikut terhapus"])],
    ["Jelaskan perbedaan antara DELETE, TRUNCATE, dan DROP TABLE dari sisi fungsi, kecepatan, dan kemampuan pemulihan data!",
     "Bayangkan kamu bekerja di tim backend dan tidak sengaja menjalankan DELETE FROM orders; tanpa WHERE di database production. Apa langkah-langkah yang bisa dilakukan untuk mencegah dan memulihkan situasi seperti ini?"]
)

# ── Topik 6: ORDER BY ────────────────────────────────────────────────────────
story.append(Paragraph("6. ORDER BY — Mengurutkan Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>ORDER BY</b> digunakan untuk <b>mengurutkan hasil query</b> berdasarkan satu atau lebih kolom. "
    "Secara default, urutan adalah <b>ascending (ASC)</b> — dari kecil ke besar atau A ke Z. "
    "Gunakan <b>DESC</b> untuk membalik urutan. Jika tidak ada ORDER BY, urutan data tidak dijamin konsisten.", normal_style))

story.append(Paragraph("<b>Contoh 1 — Ascending (kecil ke besar)</b>", bold_style))
story += kode_block("SELECT * FROM users ORDER BY umur ASC;")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['1','Budi','20','Bandung'],['3','Rina','22','Bandung'],['2','Andi','25','Jakarta'],['4','Sari','30','Surabaya']],
    [2*cm,4*cm,4*cm,6*cm]))

story.append(Paragraph("<b>Contoh 2 — Descending (besar ke kecil)</b>", bold_style))
story += kode_block("SELECT * FROM users ORDER BY umur DESC;")

story.append(Paragraph("<b>Contoh 3 — Multi-column ORDER BY</b>", bold_style))
story += kode_block("SELECT * FROM users ORDER BY kota ASC, umur DESC;\n-- Urutkan berdasarkan kota (A-Z), jika kota sama maka umur dari terbesar")

story += latihan_box(
    [("Apa urutan default jika ORDER BY tidak menggunakan ASC atau DESC?",
      ["A. Descending (besar ke kecil)","B. Ascending (kecil ke besar)","C. Acak","D. Berdasarkan urutan insert"]),
     ("Query mana yang menampilkan user dari yang paling tua ke yang paling muda?",
      ["A. SELECT * FROM users ORDER BY umur ASC;","B. SELECT * FROM users SORT BY umur DESC;","C. SELECT * FROM users ORDER BY umur DESC;","D. SELECT * FROM users ORDER umur DESC;"]),
     ("Apa hasil dari ORDER BY kota ASC, umur DESC?",
      ["A. Urutkan umur dari besar, lalu kota dari A","B. Urutkan kota dari A-Z, jika kota sama urutkan umur dari besar ke kecil","C. Urutkan berdasarkan kota saja, umur diabaikan","D. Error karena tidak bisa ORDER BY dua kolom"])],
    ["Jelaskan kapan penggunaan ORDER BY dengan dua kolom berguna dalam konteks aplikasi nyata! Berikan satu contoh skenario dari aplikasi e-commerce!",
     "Apakah ORDER BY mempengaruhi data yang tersimpan di database? Jelaskan apa yang sebenarnya terjadi ketika kita menggunakan ORDER BY!"]
)

# ── Topik 7: LIMIT & OFFSET ──────────────────────────────────────────────────
story.append(Paragraph("7. LIMIT & OFFSET — Membatasi Jumlah Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>LIMIT</b> membatasi jumlah baris yang dikembalikan. "
    "<b>OFFSET</b> digunakan bersama LIMIT untuk <b>melewati sejumlah baris</b> dari awal — "
    "menjadi dasar teknik <b>pagination</b> (halaman 1, 2, 3, dst).", normal_style))

story.append(info_box("Formula Pagination: OFFSET = (nomor_halaman - 1) × jumlah_per_halaman\nContoh: halaman 3, 10 item per halaman → LIMIT 10 OFFSET 20", BIRU_MUDA, BIJU_GELAP if False else BIRU_GELAP, '📐'))

story.append(Paragraph("<b>Contoh 1 — Ambil 2 baris pertama</b>", bold_style))
story += kode_block("SELECT * FROM users LIMIT 2;")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['1','Budi','20','Bandung'],['2','Andi','25','Jakarta']],
    [2*cm,4*cm,4*cm,6*cm]))

story.append(Paragraph("<b>Contoh 2 — Mulai dari baris ke-3 (OFFSET 2)</b>", bold_style))
story += kode_block("SELECT * FROM users LIMIT 2 OFFSET 2;")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['3','Rina','22','Bandung'],['4','Sari','30','Surabaya']],
    [2*cm,4*cm,4*cm,6*cm]))

story.append(Paragraph("<b>Contoh 3 — Top-N: 2 user tertua</b>", bold_style))
story += kode_block("SELECT * FROM users ORDER BY umur DESC LIMIT 2;")
story.append(hasil_tabel(['id','nama','umur','kota'],
    [['4','Sari','30','Surabaya'],['2','Andi','25','Jakarta']],
    [2*cm,4*cm,4*cm,6*cm]))

story += latihan_box(
    [("Apa kegunaan utama dari klausa LIMIT?",
      ["A. Membatasi jumlah kolom yang ditampilkan","B. Membatasi jumlah baris yang dikembalikan query","C. Membatasi ukuran file database","D. Membatasi jumlah query per detik"]),
     ("Jika kita ingin menampilkan halaman ke-2 dengan 2 data per halaman, query yang tepat adalah?",
      ["A. SELECT * FROM users LIMIT 2 OFFSET 1;","B. SELECT * FROM users LIMIT 2 OFFSET 2;","C. SELECT * FROM users LIMIT 4;","D. SELECT * FROM users OFFSET 2;"]),
     ("Query SELECT * FROM users ORDER BY umur ASC LIMIT 1; akan mengembalikan apa?",
      ["A. User dengan umur terbesar","B. User pertama yang dimasukkan","C. User dengan umur terkecil","D. Semua user diurutkan umur"])],
    ["Jelaskan konsep pagination menggunakan LIMIT dan OFFSET! Tuliskan formula untuk menghitung OFFSET berdasarkan nomor halaman dan berikan contoh konkretnya!",
     "Apa potensi masalah performa dari OFFSET yang sangat besar (misalnya OFFSET 1000000)? Jelaskan dan sebutkan alternatif yang lebih baik!"]
)

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL INTERMEDIATE
# ═══════════════════════════════════════════════════════════════════════════════
story.append(level_header("🟡  LEVEL INTERMEDIATE  —  Agregat, Relasi & Struktur", KUNING))
story.append(Spacer(1, 12))

def topik_intermediate(nomor, judul, penjelasan, contoh_list, latihan_pg, latihan_esai, catatan=None):
    blok = []
    blok.append(Paragraph(f"{nomor}. {judul}", topik_style))
    blok.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
    blok.append(Spacer(1, 4))
    blok.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
    blok.append(Paragraph(penjelasan, normal_style))
    if catatan:
        blok.append(catatan)
    blok.append(Paragraph("💡 Contoh Query", subheading_style))
    for label, kode in contoh_list:
        blok.append(Paragraph(f"<b>{label}</b>", bold_style))
        blok += kode_block(kode)
    blok += latihan_box(latihan_pg, latihan_esai)
    return blok

# 8. COUNT
story += topik_intermediate("8", "COUNT — Menghitung Jumlah Baris",
    "<b>COUNT</b> adalah fungsi agregat yang <b>menghitung jumlah baris</b>. "
    "<b>COUNT(*)</b> menghitung semua baris termasuk NULL, sedangkan <b>COUNT(nama_kolom)</b> "
    "hanya menghitung baris di mana kolom tersebut tidak NULL.",
    [("Hitung semua baris", "SELECT COUNT(*) FROM users;\n-- Hasil: 4"),
     ("Hitung dengan kondisi", "SELECT COUNT(*) FROM users WHERE kota = 'Bandung';\n-- Hasil: 2"),
     ("Beri nama alias", "SELECT COUNT(*) AS total_user FROM users;\n-- Hasil: total_user = 4")],
    [("Apa perbedaan antara COUNT(*) dan COUNT(kolom)?",
      ["A. Tidak ada perbedaan","B. COUNT(*) menghitung semua baris termasuk NULL, COUNT(kolom) mengabaikan NULL","C. COUNT(*) lebih lambat","D. COUNT(kolom) menghitung semua baris termasuk NULL"]),
     ("Berapa hasil dari SELECT COUNT(*) FROM users WHERE umur >= 22;?",
      ["A. 1","B. 2","C. 3","D. 4"]),
     ("Bagaimana cara memberi nama alias pada hasil COUNT?",
      ["A. COUNT(*) NAME total","B. COUNT(*) RENAME total","C. COUNT(*) AS total","D. COUNT(*) = total"])],
    ["Kapan penggunaan COUNT menjadi penting dalam sebuah aplikasi? Berikan minimal 2 contoh use case nyata!",
     "Jelaskan apa yang terjadi jika sebuah kolom berisi nilai NULL dan kita menggunakan COUNT(kolom) versus COUNT(*)!"]
)

# 9. GROUP BY
story.append(Paragraph("9. GROUP BY — Mengelompokkan Data", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>GROUP BY</b> digunakan untuk <b>mengelompokkan baris-baris</b> yang memiliki nilai sama pada kolom tertentu, "
    "kemudian menerapkan fungsi agregat pada setiap kelompok. Setelah GROUP BY, setiap kelompok direpresentasikan "
    "oleh <b>satu baris</b> dalam hasil.", normal_style))
story.append(info_box("Aturan penting: Kolom yang ada di SELECT harus berupa kolom yang di-GROUP-BY atau hasil fungsi agregat.", KUNING_MUDA, KUNING, '⚠️'))

story.append(Paragraph("<b>Contoh 1 — Hitung user per kota</b>", bold_style))
story += kode_block("SELECT kota, COUNT(*) AS jumlah_user\nFROM users\nGROUP BY kota;")
story.append(hasil_tabel(['kota','jumlah_user'],
    [['Bandung','2'],['Jakarta','1'],['Surabaya','1']],
    [8*cm, 8*cm]))

story.append(Paragraph("<b>Contoh 2 — Multiple agregat sekaligus</b>", bold_style))
story += kode_block("SELECT kota, COUNT(*) AS jumlah, AVG(umur) AS rata_umur, MAX(umur) AS tertua\nFROM users\nGROUP BY kota;")
story.append(hasil_tabel(['kota','jumlah','rata_umur','tertua'],
    [['Bandung','2','21.0','22'],['Jakarta','1','25.0','25'],['Surabaya','1','30.0','30']],
    [5*cm, 3*cm, 4*cm, 4*cm]))

story += latihan_box(
    [("Apa fungsi utama dari GROUP BY?",
      ["A. Mengurutkan data berdasarkan kolom","B. Mengelompokkan baris dengan nilai sama dan memungkinkan fungsi agregat","C. Memfilter kelompok berdasarkan kondisi","D. Menggabungkan dua tabel"]),
     ("Query SELECT nama, kota, COUNT(*) FROM users GROUP BY kota; valid atau tidak?",
      ["A. Valid, akan menampilkan nama, kota, dan jumlah","B. Tidak valid, karena nama tidak ada di GROUP BY dan bukan fungsi agregat","C. Valid, karena COUNT(*) sudah cukup","D. Tidak valid, karena GROUP BY hanya menerima satu kolom"]),
     ("Apa hasil dari SELECT COUNT(*), kota FROM users GROUP BY kota ORDER BY COUNT(*) DESC;?",
      ["A. Semua user diurutkan berdasarkan kota","B. Jumlah user per kota, diurutkan dari yang terbanyak","C. Error karena tidak bisa ORDER BY COUNT","D. Jumlah user per kota, diurutkan A-Z"])],
    ["Jelaskan mengapa kolom yang ada di SELECT harus merupakan kolom GROUP BY atau fungsi agregat!",
     "Tuliskan query untuk menghitung jumlah user dan rata-rata umur per kota, kemudian urutkan berdasarkan jumlah user terbanyak!"]
)

# 10. CREATE TABLE (ringkas)
story.append(Paragraph("10. CREATE TABLE — Membuat Tabel", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>CREATE TABLE</b> digunakan untuk <b>mendefinisikan struktur tabel baru</b>. "
    "Di sinilah kamu menentukan nama tabel, nama kolom, tipe data, dan constraint (aturan).", normal_style))

# Tipe data tabel
tipe_data = [
    [Paragraph('<b>Tipe Data</b>', CWh), Paragraph('<b>Kegunaan</b>', CWh), Paragraph('<b>Contoh</b>', CWh)],
    [Paragraph('INT / INTEGER', cp(bold=True)), Paragraph('Angka bulat', CW), Paragraph('id, umur, stok', CW)],
    [Paragraph('VARCHAR(n)', cp(bold=True)), Paragraph('Teks dengan batas karakter', CW), Paragraph('nama, email', CW)],
    [Paragraph('TEXT', cp(bold=True)), Paragraph('Teks panjang tanpa batas', CW), Paragraph('deskripsi, konten', CW)],
    [Paragraph('BOOLEAN', cp(bold=True)), Paragraph('True/False', CW), Paragraph('is_active, is_verified', CW)],
    [Paragraph('DECIMAL(p,s)', cp(bold=True)), Paragraph('Angka desimal presisi', CW), Paragraph('harga (12000.50)', CW)],
    [Paragraph('TIMESTAMP', cp(bold=True)), Paragraph('Tanggal + waktu', CW), Paragraph('created_at', CW)],
    [Paragraph('UUID', cp(bold=True)), Paragraph('ID unik universal', CW), Paragraph('id di Supabase', CW)],
]
td_t = Table(tipe_data, colWidths=[4*cm, 6*cm, 6*cm])
td_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor(UNGU)),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(UNGU_MUDA), colors.white]),
    ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
]))
story.append(td_t)
story.append(Spacer(1, 6))

story.append(Paragraph("<b>Contoh — Buat tabel lengkap dengan constraint</b>", bold_style))
story += kode_block("CREATE TABLE products (\n  id          SERIAL PRIMARY KEY,\n  nama        VARCHAR(200) NOT NULL,\n  harga       DECIMAL(15,2) NOT NULL,\n  stok        INT DEFAULT 0,\n  is_active   BOOLEAN DEFAULT TRUE,\n  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);")

story += latihan_box(
    [("Tipe data mana yang paling tepat untuk menyimpan harga produk seperti 12000.50?",
      ["A. INT","B. VARCHAR","C. DECIMAL(10,2)","D. BOOLEAN"]),
     ("Apa fungsi DEFAULT dalam definisi kolom?",
      ["A. Membuat kolom wajib diisi","B. Memberikan nilai otomatis jika kolom tidak diisi saat INSERT","C. Menghapus nilai yang ada","D. Membuat kolom menjadi PRIMARY KEY"]),
     ("Apa itu SERIAL di PostgreSQL?",
      ["A. Tipe data untuk menyimpan seri angka","B. Tipe data integer yang otomatis bertambah (auto-increment)","C. Cara membuat tabel secara serial","D. Constraint untuk memastikan nilai unik"])],
    ["Jelaskan perbedaan antara VARCHAR(100) dan TEXT dalam SQL! Kapan sebaiknya menggunakan masing-masing?",
     "Rancang struktur tabel students yang menyimpan data mahasiswa dengan minimal 6 kolom yang relevan dan tuliskan CREATE TABLE-nya!"]
)

# Topik 11-20: ringkas tapi tetap ada kode dan latihan
for nomor, judul, penjelasan, contoh_list, pg, esai in [
    ("11", "PRIMARY KEY — Identitas Unik Data",
     "<b>PRIMARY KEY</b> adalah constraint yang menjamin setiap baris memiliki <b>identitas yang unik dan tidak null</b>. "
     "Sebuah tabel hanya boleh memiliki <b>satu</b> primary key, tapi bisa terdiri dari beberapa kolom (composite PK).",
     [("Surrogate Key (recommended)", "id SERIAL PRIMARY KEY\n-- Atau UUID:\nid UUID DEFAULT gen_random_uuid() PRIMARY KEY"),
      ("Composite Primary Key", "CREATE TABLE enrollments (\n  student_id  INT,\n  course_id   INT,\n  enrolled_at TIMESTAMP,\n  PRIMARY KEY (student_id, course_id)  -- Gabungan dua kolom\n);")],
     [("Berapa jumlah PRIMARY KEY maksimal dalam satu tabel?",
       ["A. Tidak terbatas","B. Maksimal 2","C. Tepat 1 (bisa composite dari beberapa kolom)","D. Maksimal 5"]),
      ("Apa yang membedakan PRIMARY KEY dengan UNIQUE constraint?",
       ["A. Tidak ada perbedaan","B. PRIMARY KEY tidak boleh NULL, UNIQUE boleh NULL (di beberapa database)","C. UNIQUE tidak boleh duplikat, PRIMARY KEY boleh duplikat","D. PRIMARY KEY hanya untuk angka"]),
      ("Mengapa UUID lebih sering digunakan sebagai Primary Key di aplikasi modern?",
       ["A. UUID lebih kecil ukurannya","B. UUID lebih mudah diingat","C. UUID unik secara global sehingga aman untuk sistem terdistribusi","D. UUID lebih cepat diproses"])],
     ["Jelaskan perbedaan antara Natural Key dan Surrogate Key sebagai Primary Key!",
      "Apa itu Composite Primary Key? Berikan contoh tabel nyata yang membutuhkannya!"]),

    ("12", "DISTINCT — Nilai Unik",
     "<b>DISTINCT</b> digunakan untuk <b>menghilangkan duplikat</b> dari hasil query, sehingga setiap nilai "
     "hanya muncul sekali. DISTINCT bekerja pada seluruh kombinasi kolom yang disebutkan.",
     [("Kota unik", "SELECT DISTINCT kota FROM users;\n-- Bandung, Jakarta, Surabaya (tanpa duplikat)"),
      ("COUNT DISTINCT", "SELECT COUNT(DISTINCT kota) AS jumlah_kota FROM users;\n-- Hasil: 3")],
     [("Apa fungsi DISTINCT dalam query SELECT?",
       ["A. Mengurutkan nilai dari kecil ke besar","B. Menghilangkan baris duplikat dari hasil query","C. Memfilter berdasarkan kondisi tertentu","D. Menggabungkan nilai yang sama"]),
      ("Berapa hasil dari SELECT COUNT(DISTINCT kota) FROM users;?",
       ["A. 1","B. 2","C. 3","D. 4"]),
      ("Jika SELECT DISTINCT kota, umur FROM users; dijalankan, apa yang dianggap duplikat?",
       ["A. Baris dengan kota yang sama","B. Baris dengan umur yang sama","C. Baris dengan kombinasi kota DAN umur yang sama","D. Semua baris dianggap duplikat"])],
     ["Apa perbedaan antara SELECT DISTINCT kota dan SELECT kota FROM users GROUP BY kota?",
      "Berikan contoh use case nyata di aplikasi e-commerce di mana DISTINCT sangat berguna!"]),

    ("13", "LIKE — Pencarian Pola Teks",
     "<b>LIKE</b> digunakan untuk mencari data berdasarkan <b>pola teks</b> (pattern matching). "
     "Wildcard: <b>%</b> mewakili nol atau lebih karakter, <b>_</b> mewakili tepat satu karakter. "
     "PostgreSQL juga menyediakan <b>ILIKE</b> untuk pencarian tidak case-sensitive.",
     [("Nama diawali huruf B", "SELECT * FROM users WHERE nama LIKE 'B%';\n-- Hasil: Budi"),
      ("Nama diakhiri huruf i", "SELECT * FROM users WHERE nama LIKE '%i';\n-- Hasil: Budi, Andi"),
      ("Kota mengandung 'ung'", "SELECT * FROM users WHERE kota LIKE '%ung';\n-- Hasil: Bandung")],
     [("Apa arti wildcard % dalam LIKE?",
       ["A. Tepat satu karakter apapun","B. Nol atau lebih karakter apapun","C. Hanya huruf kapital","D. Hanya angka"]),
      ("Query mana yang mencari user dengan nama yang mengandung huruf 'n'?",
       ["A. WHERE nama LIKE 'n';","B. WHERE nama LIKE 'n%';","C. WHERE nama LIKE '%n%';","D. WHERE nama LIKE '%n';"]),
      ("Apa perbedaan antara LIKE dan ILIKE di PostgreSQL?",
       ["A. Tidak ada perbedaan","B. ILIKE mengabaikan perbedaan huruf besar/kecil, LIKE tidak","C. LIKE lebih cepat dari ILIKE","D. ILIKE hanya untuk angka"])],
     ["Jelaskan perbedaan antara wildcard % dan _ dalam LIKE, dan berikan contoh query menggunakan masing-masing!",
      "Mengapa penggunaan LIKE '%kata%' (dengan % di depan) dapat menyebabkan masalah performa pada tabel besar?"]),
]:
    story += topik_intermediate(nomor, judul, penjelasan, contoh_list, pg, esai)

# 14. IN
story += topik_intermediate("14", "IN — Filter dengan Banyak Nilai",
    "<b>IN</b> digunakan untuk <b>memfilter baris</b> di mana nilai kolom cocok dengan <b>salah satu nilai</b> "
    "dalam sebuah daftar. Lebih bersih dan efisien dibandingkan menulis banyak kondisi OR. "
    "<b>NOT IN</b> adalah kebalikannya.",
    [("Filter beberapa kota", "SELECT * FROM users WHERE kota IN ('Bandung', 'Jakarta');"),
     ("Filter beberapa ID", "SELECT * FROM users WHERE id IN (1, 3, 4);"),
     ("NOT IN", "SELECT * FROM users WHERE kota NOT IN ('Bandung', 'Jakarta');")],
    [("WHERE kota IN ('Bandung', 'Jakarta') setara dengan?",
      ["A. WHERE kota = 'Bandung' AND kota = 'Jakarta'","B. WHERE kota = 'Bandung' OR kota = 'Jakarta'","C. WHERE kota BETWEEN 'Bandung' AND 'Jakarta'","D. WHERE kota LIKE 'Bandung' OR 'Jakarta'"]),
     ("Berapa baris hasil dari SELECT * FROM users WHERE id IN (2, 4);?",
      ["A. 1","B. 2","C. 3","D. 4"]),
     ("Apa fungsi NOT IN?",
      ["A. Mengambil baris dengan nilai yang ada dalam daftar","B. Mengambil baris dengan nilai yang tidak ada dalam daftar","C. Membalik urutan daftar","D. Error karena NOT IN tidak ada di SQL"])],
    ["Jelaskan mengapa IN lebih disarankan dibandingkan banyak kondisi OR dalam hal keterbacaan!",
     "Apa risiko menggunakan NOT IN jika salah satu nilai dalam daftar adalah NULL?"]
)

# 15. BETWEEN
story += topik_intermediate("15", "BETWEEN — Filter Rentang Nilai",
    "<b>BETWEEN</b> digunakan untuk memfilter baris di mana nilai kolom berada dalam <b>rentang tertentu, inklusif</b> "
    "(termasuk nilai batas bawah dan atas). Bisa digunakan untuk angka, tanggal, maupun teks.",
    [("Rentang angka", "SELECT * FROM users WHERE umur BETWEEN 21 AND 30;\n-- Rina (22), Andi (25), Sari (30) masuk — Budi (20) tidak"),
     ("Rentang tanggal", "SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';"),
     ("NOT BETWEEN", "SELECT * FROM users WHERE umur NOT BETWEEN 21 AND 25;\n-- Budi (20) dan Sari (30)")],
    [("WHERE umur BETWEEN 20 AND 25 apakah menyertakan umur 20 dan 25?",
      ["A. Tidak, keduanya tidak termasuk","B. Ya, keduanya termasuk (inklusif)","C. Hanya 20 yang termasuk","D. Hanya 25 yang termasuk"]),
     ("WHERE umur BETWEEN 21 AND 30 pada dataset standar menghasilkan berapa baris?",
      ["A. 1","B. 2","C. 3","D. 4"]),
     ("Ekspresi mana yang SETARA dengan WHERE umur BETWEEN 20 AND 25?",
      ["A. WHERE umur > 20 AND umur < 25","B. WHERE umur >= 20 AND umur <= 25","C. WHERE umur >= 20 OR umur <= 25","D. WHERE umur > 20 OR umur < 25"])],
    ["Jelaskan penggunaan BETWEEN untuk kolom bertipe tanggal! Berikan contoh skenario laporan penjualan bulanan!",
     "Apa yang dimaksud bahwa BETWEEN bersifat inklusif?"]
)

# 16. ALIAS
story += topik_intermediate("16", "ALIAS (AS) — Mengganti Nama Sementara",
    "<b>AS</b> digunakan untuk memberikan <b>nama sementara (alias)</b> pada kolom atau tabel dalam hasil query. "
    "Alias hanya berlaku dalam konteks query tersebut dan tidak mengubah nama asli di database.",
    [("Alias pada kolom", "SELECT nama AS username, umur AS usia FROM users;"),
     ("Alias pada fungsi", "SELECT kota, COUNT(*) AS total_pengguna, AVG(umur) AS rata_umur\nFROM users\nGROUP BY kota;"),
     ("Alias pada tabel (saat JOIN)", "SELECT u.nama, o.produk\nFROM users AS u\nJOIN orders AS o ON u.id = o.user_id;")],
    [("Apakah alias mengubah nama kolom di database secara permanen?",
      ["A. Ya, nama kolom berubah permanen","B. Tidak, alias hanya berlaku pada hasil query tersebut","C. Tergantung jenis database","D. Hanya berubah jika menggunakan ALTER TABLE"]),
     ("Kata kunci AS dalam SQL bersifat?",
      ["A. Wajib ada, tidak bisa dihilangkan","B. Opsional, alias bisa ditulis langsung tanpa AS","C. Hanya untuk kolom, tidak bisa untuk tabel","D. Hanya bisa digunakan sekali per query"]),
     ("Dalam konteks JOIN, mengapa alias tabel sangat berguna?",
      ["A. Mempercepat eksekusi query","B. Menyingkat penulisan nama tabel yang panjang sehingga query lebih ringkas","C. Membuat tabel baru di database","D. Menghindari duplikasi data"])],
    ["Jelaskan pentingnya penggunaan alias dalam query yang kompleks! Berikan contoh dengan dan tanpa alias!",
     "Bolehkah menggunakan alias kolom di klausa WHERE? Mengapa? Jelaskan dengan menyebut urutan eksekusi SQL!"]
)

# 17. SUM & AVG
story += topik_intermediate("17", "SUM & AVG — Operasi Matematika",
    "<b>SUM</b> menghitung total penjumlahan semua nilai, sedangkan <b>AVG</b> menghitung nilai rata-rata. "
    "Keduanya fungsi agregat yang mengabaikan nilai NULL. Selain itu ada <b>MIN</b> dan <b>MAX</b>.",
    [("Total umur", "SELECT SUM(umur) AS total_umur FROM users;\n-- Hasil: 97 (20+25+22+30)"),
     ("Rata-rata umur", "SELECT AVG(umur) AS rata_rata_umur FROM users;\n-- Hasil: 24.25"),
     ("Semua agregat sekaligus", "SELECT MIN(umur) AS termuda, MAX(umur) AS tertua,\n       SUM(umur) AS total, AVG(umur) AS rata, COUNT(*) AS jumlah\nFROM users;")],
    [("Apa hasil dari SELECT SUM(umur) FROM users?",
      ["A. 24.25","B. 97","C. 4","D. 30"]),
     ("Bagaimana fungsi agregat memperlakukan nilai NULL?",
      ["A. NULL dianggap 0","B. NULL menyebabkan seluruh hasil menjadi NULL","C. NULL diabaikan dalam perhitungan","D. NULL dianggap 1"]),
     ("Query mana yang menghasilkan umur tertua dari tabel users?",
      ["A. SELECT TOP(umur) FROM users;","B. SELECT MAX(umur) FROM users;","C. SELECT umur ORDER BY umur DESC LIMIT 1;","D. SELECT HIGHEST(umur) FROM users;"])],
    ["Jelaskan perbedaan antara AVG(kolom) dan SUM(kolom)/COUNT(*). Kapan hasilnya bisa berbeda?",
     "Tuliskan query untuk mendapatkan total pendapatan, rata-rata transaksi, transaksi terbesar, dan terkecil dari tabel orders!"]
)

# 18. HAVING
story.append(Paragraph("18. HAVING — Filter Setelah GROUP BY", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>HAVING</b> digunakan untuk <b>memfilter hasil GROUP BY</b> berdasarkan kondisi pada fungsi agregat. "
    "Perbedaan mendasar: <b>WHERE</b> memfilter baris <i>sebelum</i> pengelompokan, sedangkan "
    "<b>HAVING</b> memfilter <i>kelompok</i> yang sudah terbentuk.", normal_style))
story.append(info_box("Analogi: WHERE menyaring bahan mentah sebelum dimasak, HAVING menyaring hidangan yang sudah jadi.", HIJAU_MUDA, HIJAU_GELAP, '🍳'))

story.append(Paragraph("<b>Contoh 1 — Kota dengan lebih dari 1 user</b>", bold_style))
story += kode_block("SELECT kota, COUNT(*) AS jumlah\nFROM users\nGROUP BY kota\nHAVING COUNT(*) > 1;")
story.append(hasil_tabel(['kota','jumlah'],[['Bandung','2']],[8*cm,8*cm]))
story.append(Paragraph("Jakarta dan Surabaya tidak muncul karena masing-masing hanya punya 1 user.", caption_style))

story.append(Paragraph("<b>Contoh 2 — Kota dengan rata-rata umur di atas 22</b>", bold_style))
story += kode_block("SELECT kota, AVG(umur) AS rata_umur\nFROM users\nGROUP BY kota\nHAVING AVG(umur) > 22;")
story.append(hasil_tabel(['kota','rata_umur'],[['Jakarta','25.0'],['Surabaya','30.0']],[8*cm,8*cm]))

story += latihan_box(
    [("Apa perbedaan utama antara WHERE dan HAVING?",
      ["A. WHERE untuk teks, HAVING untuk angka","B. WHERE memfilter baris sebelum GROUP BY, HAVING memfilter kelompok setelah GROUP BY","C. HAVING lebih cepat dari WHERE","D. WHERE dan HAVING identik"]),
     ("Apakah kita bisa menggunakan HAVING tanpa GROUP BY?",
      ["A. Tidak bisa sama sekali","B. Bisa, tapi jarang berguna karena seluruh tabel dianggap satu kelompok","C. Hanya bisa di PostgreSQL","D. Bisa dan sangat sering digunakan"]),
     ("Manakah urutan klausa SQL yang benar?",
      ["A. SELECT → HAVING → WHERE → GROUP BY → FROM","B. FROM → WHERE → GROUP BY → HAVING → SELECT","C. SELECT → WHERE → FROM → GROUP BY → HAVING","D. FROM → HAVING → WHERE → SELECT → GROUP BY"])],
    ["Jelaskan dengan analogi sehari-hari perbedaan antara WHERE dan HAVING! Kemudian berikan satu contoh query yang menggunakan keduanya sekaligus!",
     "Tuliskan query untuk menemukan kota yang memiliki rata-rata umur user di atas 20, urutkan dari rata-rata umur tertinggi!"]
)

# 19. JOIN
story.append(Paragraph("19. JOIN — Menggabungkan Tabel", topik_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 4))
story.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
story.append(Paragraph(
    "<b>JOIN</b> adalah operasi untuk <b>menggabungkan data dari dua atau lebih tabel</b> berdasarkan kolom yang berelasi. "
    "Ini adalah salah satu fitur terpenting dalam relational database.", normal_style))

join_data = [
    [Paragraph('<b>Jenis JOIN</b>', CWh), Paragraph('<b>Penjelasan</b>', CWh)],
    [Paragraph('INNER JOIN', cp(colors.HexColor(BIRU_GELAP), bold=True)), Paragraph('Hanya baris yang cocok di KEDUA tabel', CW)],
    [Paragraph('LEFT JOIN', cp(colors.HexColor(HIJAU_GELAP), bold=True)), Paragraph('Semua baris dari tabel kiri + baris cocok dari kanan (NULL jika tidak ada)', CW)],
    [Paragraph('RIGHT JOIN', cp(colors.HexColor(ORANYE), bold=True)), Paragraph('Semua baris dari tabel kanan + baris cocok dari kiri', CW)],
    [Paragraph('FULL OUTER JOIN', cp(colors.HexColor(UNGU), bold=True)), Paragraph('Semua baris dari kedua tabel', CW)],
]
join_t = Table(join_data, colWidths=[5*cm, 11*cm])
join_t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor(BIRU_GELAP)),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor(BIRU_MUDA), colors.white]),
    ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor(ABU_BORDER)),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
]))
story.append(join_t)
story.append(Spacer(1, 6))

story.append(Paragraph("<b>Contoh 1 — INNER JOIN</b>", bold_style))
story += kode_block("SELECT users.nama, orders.produk, orders.harga\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;")
story.append(hasil_tabel(['nama','produk','harga'],
    [['Budi','Laptop','12.000.000'],['Andi','Mouse','150.000'],['Budi','Keyboard','450.000'],['Rina','Monitor','2.500.000']],
    [5*cm, 6*cm, 5*cm]))
story.append(Paragraph("Sari tidak muncul karena tidak ada pesanan dengan user_id = 4.", caption_style))

story.append(Paragraph("<b>Contoh 2 — LEFT JOIN (semua user termasuk yang tidak punya pesanan)</b>", bold_style))
story += kode_block("SELECT users.nama, orders.produk\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;")
story.append(hasil_tabel(['nama','produk'],
    [['Budi','Laptop'],['Budi','Keyboard'],['Andi','Mouse'],['Rina','Monitor'],['Sari','NULL']],
    [8*cm, 8*cm]))
story.append(Paragraph("Sari muncul dengan nilai NULL karena tidak ada pesanan. Ini yang membedakan LEFT JOIN dari INNER JOIN.", caption_style))

story += latihan_box(
    [("Apa perbedaan antara INNER JOIN dan LEFT JOIN?",
      ["A. Tidak ada perbedaan","B. INNER JOIN hanya mengembalikan baris yang cocok di kedua tabel; LEFT JOIN mengembalikan semua baris dari tabel kiri meskipun tidak ada pasangannya","C. LEFT JOIN lebih cepat dari INNER JOIN","D. INNER JOIN mengambil semua baris dari tabel kiri"]),
     ("Mengapa Sari muncul dengan nilai NULL pada contoh LEFT JOIN?",
      ["A. Data produk Sari belum dimasukkan ke tabel orders","B. LEFT JOIN memaksa semua baris dari tabel kiri muncul, meski tidak ada data di tabel kanan","C. Sari memiliki produk tapi harganya 0","D. JOIN selalu menghasilkan NULL untuk baris terakhir"]),
     ("Kondisi ON users.id = orders.user_id berfungsi untuk?",
      ["A. Menyaring baris berdasarkan umur","B. Menentukan kolom mana yang dijadikan kunci penghubung antara dua tabel","C. Membuat kolom baru di tabel","D. Mengurutkan hasil"])],
    ["Jelaskan kapan sebaiknya menggunakan LEFT JOIN dibandingkan INNER JOIN! Berikan contoh skenario nyata!",
     "Mengapa data harus dipisah ke banyak tabel padahal nanti harus di-JOIN kembali? Jelaskan keuntungannya!"]
)

# 20. SUBQUERY
story += topik_intermediate("20", "SUBQUERY — Query di Dalam Query",
    "<b>Subquery</b> (inner query / nested query) adalah <b>query SQL yang berada di dalam query lain</b>. "
    "Subquery dieksekusi terlebih dahulu, dan hasilnya digunakan oleh query luar. "
    "Bisa berada di klausa WHERE, FROM, atau SELECT.",
    [("Lebih tua dari rata-rata", "SELECT * FROM users\nWHERE umur > (SELECT AVG(umur) FROM users);\n-- Subquery menghasilkan 24.25, query luar filter > 24.25"),
     ("User dengan nilai maximum", "SELECT * FROM users\nWHERE umur = (SELECT MAX(umur) FROM users);\n-- Hasil: Sari (umur 30)"),
     ("Subquery dengan IN", "SELECT * FROM users\nWHERE id IN (SELECT user_id FROM orders WHERE harga > 1000000);\n-- Budi dan Rina yang beli di atas 1 juta")],
    [("Bagian mana yang dieksekusi pertama dalam query dengan subquery?",
      ["A. Query luar (outer query)","B. Subquery (inner query)","C. Keduanya paralel","D. Tergantung posisi subquery"]),
     ("Subquery mana yang menghasilkan user dengan umur tertua?",
      ["A. WHERE umur = (SELECT MIN(umur) FROM users)","B. WHERE umur > (SELECT AVG(umur) FROM users)","C. WHERE umur = (SELECT MAX(umur) FROM users)","D. WHERE umur IN (SELECT umur FROM users)"]),
     ("Kapan sebaiknya menggunakan JOIN dibandingkan Subquery?",
      ["A. Selalu gunakan Subquery","B. JOIN umumnya lebih efisien untuk menggabungkan data antar tabel; Subquery lebih cocok untuk kondisi berbasis agregat","C. Keduanya selalu identik","D. Subquery selalu lebih cepat"])],
    ["Tuliskan query untuk menemukan user yang usianya di atas rata-rata. Bandingkan dengan pendekatan lain!",
     "Apa yang dimaksud dengan correlated subquery? Jelaskan perbedaannya dengan subquery biasa!"]
)

# 21. INDEX
story += topik_intermediate("21", "INDEX — Mempercepat Query",
    "<b>Index</b> adalah struktur data tambahan yang dibuat pada kolom tertentu untuk <b>mempercepat pencarian data</b>. "
    "Analogi: indeks di belakang buku. Tanpa index, database melakukan <b>Full Table Scan</b> — membaca setiap baris satu per satu.",
    [("Buat index pada kolom nama", "CREATE INDEX idx_users_nama ON users(nama);\n-- Setelah ini WHERE nama = 'Budi' jauh lebih cepat"),
     ("Composite index", "CREATE INDEX idx_users_kota_umur ON users(kota, umur);\n-- Mempercepat query yang filter kota DAN umur"),
     ("Hapus index", "DROP INDEX idx_users_nama;")],
    [("Apa analogi yang paling tepat untuk INDEX dalam database?",
      ["A. Sampul buku","B. Indeks di belakang buku yang membantu menemukan kata di halaman tertentu","C. Daftar isi buku","D. Bookmark halaman favorit"]),
     ("Kapan INDEX justru dapat memperlambat database?",
      ["A. Saat menjalankan SELECT dengan WHERE","B. Saat melakukan operasi INSERT, UPDATE, atau DELETE","C. Saat menggunakan ORDER BY","D. Saat melakukan JOIN"]),
     ("Mengapa tidak disarankan membuat index pada kolom boolean is_active?",
      ["A. Boolean tidak bisa di-index","B. Index tidak efisien pada kolom dengan sedikit variasi nilai","C. Boolean memperlambat pembuatan index","D. Kolom boolean tidak bisa dipakai di WHERE"])],
    ["Jelaskan konsep Full Table Scan dan bagaimana index mencegah hal tersebut!",
     "Kapan kamu TIDAK sebaiknya membuat index? Sebutkan minimal 3 kondisi!"]
)

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL ADVANCED
# ═══════════════════════════════════════════════════════════════════════════════
story.append(level_header("🔴  LEVEL ADVANCED  —  Teknik Profesional & Optimasi", MERAH))
story.append(Spacer(1, 12))

def topik_advanced(nomor, judul, penjelasan, contoh_list, pg, esai, catatan=None):
    blok = []
    blok.append(Paragraph(f"{nomor}. {judul}", topik_style))
    blok.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(BIRU_GELAP)))
    blok.append(Spacer(1, 4))
    blok.append(Paragraph("📌 Penjelasan Mendalam", subheading_style))
    blok.append(Paragraph(penjelasan, normal_style))
    if catatan:
        blok.append(catatan)
    blok.append(Paragraph("💡 Contoh Query", subheading_style))
    for label, kode in contoh_list:
        blok.append(Paragraph(f"<b>{label}</b>", bold_style))
        blok += kode_block(kode)
    blok += latihan_box(pg, esai)
    return blok

story += topik_advanced("22", "UNION & UNION ALL — Menggabungkan Hasil Query",
    "<b>UNION</b> menggabungkan hasil dari dua atau lebih query menjadi satu hasil dan <b>menghapus duplikat</b>. "
    "<b>UNION ALL</b> melakukan hal sama tapi <b>mempertahankan duplikat</b> dan lebih cepat. "
    "Syarat: kedua query harus memiliki jumlah kolom yang sama dan tipe data yang kompatibel.",
    [("UNION (hapus duplikat)", "SELECT nama FROM users WHERE kota = 'Bandung'\nUNION\nSELECT nama FROM users WHERE umur > 25;"),
     ("UNION dari dua tabel berbeda", "SELECT nama AS entitas, 'user' AS jenis FROM users\nUNION\nSELECT produk AS entitas, 'produk' AS jenis FROM orders;")],
    [("Apa perbedaan utama antara UNION dan UNION ALL?",
      ["A. UNION ALL lebih lambat dari UNION","B. UNION menghapus duplikat, UNION ALL mempertahankan duplikat","C. UNION bisa menggabungkan tabel berbeda, UNION ALL tidak","D. Tidak ada perbedaan"]),
     ("Syarat apa yang harus dipenuhi agar dua query bisa digabungkan dengan UNION?",
      ["A. Kedua tabel harus memiliki PRIMARY KEY yang sama","B. Kedua query harus menghasilkan jumlah kolom yang sama dan tipe data kompatibel","C. Kedua query harus FROM tabel yang sama","D. Keduanya harus memiliki kondisi WHERE yang sama"]),
     ("Kapan sebaiknya menggunakan UNION ALL dibanding UNION?",
      ["A. Ketika kita ingin duplikat dihapus","B. Ketika kita tahu tidak ada duplikat atau ingin mempertahankannya, karena UNION ALL lebih cepat","C. UNION ALL selalu lebih buruk","D. Ketika menggabungkan lebih dari 3 query"])],
    ["Jelaskan mengapa UNION ALL umumnya lebih cepat daripada UNION!",
     "Berikan skenario nyata di mana kamu perlu menggunakan UNION untuk menggabungkan data dari dua tabel berbeda!"]
)

story += topik_advanced("23", "CASE — Logika Kondisional (IF-ELSE)",
    "<b>CASE</b> adalah ekspresi SQL yang memungkinkan <b>logika kondisional</b> (seperti IF-ELSE) langsung di dalam query. "
    "Sangat berguna untuk mengkategorikan, mengklasifikasikan, atau mentransformasi data secara dinamis.",
    [("Kategorisasi umur", "SELECT nama, umur,\n  CASE\n    WHEN umur < 21 THEN 'Remaja'\n    WHEN umur BETWEEN 21 AND 25 THEN 'Dewasa Muda'\n    ELSE 'Dewasa'\n  END AS kategori_umur\nFROM users;"),
     ("CASE dalam agregat (Pivot)", "SELECT\n  COUNT(CASE WHEN kota = 'Bandung' THEN 1 END) AS jumlah_bandung,\n  COUNT(CASE WHEN kota = 'Jakarta' THEN 1 END) AS jumlah_jakarta,\n  COUNT(CASE WHEN kota = 'Surabaya' THEN 1 END) AS jumlah_surabaya\nFROM users;")],
    [("Apa padanan CASE dalam bahasa pemrograman umum?",
      ["A. For loop","B. While loop","C. IF-ELSE atau switch statement","D. Try-catch"]),
     ("Apa yang dikembalikan jika tidak ada kondisi WHEN yang terpenuhi dan tidak ada ELSE?",
      ["A. Error","B. 0","C. NULL","D. String kosong"]),
     ("Teknik mengubah nilai baris menjadi kolom menggunakan CASE disebut?",
      ["A. Normalisasi","B. Pivot","C. Partisi","D. Transpose JOIN"])],
    ["Tuliskan query untuk mengkategorikan harga pesanan di tabel orders menjadi Budget, Mid-range, dan Premium!",
     "Jelaskan penggunaan CASE di dalam fungsi agregat! Berikan contoh query yang menghitung jumlah user berdasarkan kategori umur!"]
)

story += topik_advanced("24", "VIEW — Tabel Virtual",
    "<b>VIEW</b> adalah <b>query yang disimpan</b> sebagai objek dalam database dan bisa dipanggil seperti tabel biasa. "
    "View tidak menyimpan data secara fisik — setiap kali view diakses, query di baliknya dieksekusi ulang.",
    [("Buat view user Bandung", "CREATE VIEW user_bandung AS\nSELECT id, nama, umur\nFROM users\nWHERE kota = 'Bandung';\n\n-- Penggunaan:\nSELECT * FROM user_bandung;"),
     ("View dengan JOIN", "CREATE VIEW user_orders AS\nSELECT u.nama, u.kota, o.produk, o.harga\nFROM users u\nJOIN orders o ON u.id = o.user_id;\n\n-- Penggunaan cukup:\nSELECT * FROM user_orders;"),
     ("Hapus dan update view", "DROP VIEW user_bandung;\n\nCREATE OR REPLACE VIEW user_bandung AS\nSELECT * FROM users WHERE kota = 'Bandung';")],
    [("Apakah VIEW menyimpan data secara fisik di database?",
      ["A. Ya, data disalin ke storage terpisah","B. Tidak, view hanya menyimpan definisi query","C. Ya, tapi hanya data terbaru","D. Tergantung jenis database"]),
     ("Apa keuntungan utama menggunakan VIEW untuk keamanan?",
      ["A. View mengenkripsi data secara otomatis","B. View memungkinkan pembatasan akses hanya pada kolom/baris tertentu tanpa mengekspos seluruh tabel","C. View membuat data tidak bisa dihapus","D. View otomatis membackup data"]),
     ("Perintah apa yang digunakan untuk menghapus sebuah VIEW?",
      ["A. DELETE VIEW nama_view;","B. REMOVE VIEW nama_view;","C. DROP VIEW nama_view;","D. TRUNCATE VIEW nama_view;"])],
    ["Jelaskan perbedaan antara View biasa dan Materialized View! Kapan sebaiknya menggunakan Materialized View?",
     "Bagaimana VIEW dapat meningkatkan keamanan database dalam konteks aplikasi multi-user?"]
)

story += topik_advanced("25", "ALTER TABLE — Mengubah Struktur Tabel",
    "<b>ALTER TABLE</b> digunakan untuk <b>memodifikasi struktur tabel</b> yang sudah ada tanpa harus menghapus "
    "dan membuat ulang tabel. Beberapa operasi bersifat destruktif dan tidak bisa di-undo.",
    [("Operasi ALTER TABLE umum", "ALTER TABLE users ADD COLUMN email VARCHAR(200) UNIQUE;\nALTER TABLE users DROP COLUMN email;\nALTER TABLE users RENAME COLUMN nama TO full_name;\nALTER TABLE users ALTER COLUMN umur TYPE BIGINT;"),
     ("Tambah kolom dengan DEFAULT", "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;\n-- Semua baris yang ada otomatis mendapat nilai TRUE")],
    [("Apa yang terjadi pada data yang sudah ada ketika menambahkan kolom baru?",
      ["A. Semua baris terhapus otomatis","B. Baris yang ada mendapat nilai NULL (atau DEFAULT jika didefinisikan)","C. Kita harus mengisi nilai kolom baru secara manual","D. Error karena tidak bisa menambah kolom pada tabel berisi data"]),
     ("Query mana yang benar untuk mengganti nama kolom nama menjadi full_name di PostgreSQL?",
      ["A. ALTER TABLE users CHANGE nama full_name VARCHAR(100);","B. ALTER TABLE users RENAME nama TO full_name;","C. ALTER TABLE users RENAME COLUMN nama TO full_name;","D. UPDATE TABLE users SET column_name = 'full_name' WHERE column = 'nama';"]),
     ("Apa risiko menjalankan ALTER TABLE users DROP COLUMN email?",
      ["A. Tidak ada risiko, kolom bisa dikembalikan","B. Kolom email dan semua datanya terhapus permanen (kecuali dalam TRANSACTION)","C. Hanya definisi kolom yang terhapus, datanya aman","D. Error, tidak bisa menghapus kolom yang ada datanya"])],
    ["Jelaskan strategi yang aman untuk melakukan perubahan kolom pada tabel production yang berisi jutaan baris!",
     "Apa perbedaan perintah ALTER TABLE di MySQL dengan PostgreSQL dalam hal sintaks penggantian nama kolom?"]
)

story += topik_advanced("26", "NOT NULL & DEFAULT — Constraint Validasi",
    "<b>NOT NULL</b> memastikan sebuah kolom <b>tidak boleh dikosongkan</b>. "
    "<b>DEFAULT</b> adalah nilai yang otomatis diisikan jika kolom tidak disebutkan saat INSERT. "
    "Penting: <b>NULL ≠ String kosong ''</b> — NULL berarti tidak ada nilai sama sekali.",
    [("Definisi saat CREATE TABLE", "CREATE TABLE users (\n  id        SERIAL PRIMARY KEY,\n  nama      VARCHAR(100) NOT NULL,\n  email     VARCHAR(200) NOT NULL UNIQUE,\n  umur      INT DEFAULT 18,\n  is_active BOOLEAN DEFAULT TRUE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);"),
     ("IS NULL dan IS NOT NULL", "-- Mencari user yang belum mengisi umur\nSELECT * FROM users WHERE umur IS NULL;\n\n-- SALAH: WHERE umur = NULL  (tidak akan menemukan apapun!)")],
    [("Apa perbedaan antara nilai NULL dan string kosong dalam SQL?",
      ["A. Keduanya identik","B. NULL berarti tidak ada nilai sama sekali, string kosong adalah nilai yang ada tapi isinya kosong","C. String kosong lebih baik dari NULL","D. NULL sama dengan angka 0"]),
     ("Bagaimana cara memeriksa apakah sebuah kolom bernilai NULL?",
      ["A. WHERE kolom = NULL","B. WHERE kolom == NULL","C. WHERE kolom IS NULL","D. WHERE ISNULL(kolom)"]),
     ("Jika kolom umur memiliki DEFAULT 18 dan kita INSERT tanpa menyebutkan umur, apa yang terjadi?",
      ["A. Error karena umur tidak diisi","B. Umur otomatis diisi dengan nilai 18","C. Umur bernilai NULL","D. Umur diisi 0"])],
    ["Jelaskan mengapa menggunakan NULL bisa menjadi sumber bug yang sulit ditemukan dalam aplikasi!",
     "Rancang struktur kolom yang tepat untuk tabel payments (pembayaran) dengan mempertimbangkan NOT NULL dan DEFAULT!"]
)

story += topik_advanced("27", "TRANSACTION — Keamanan Perubahan Data",
    "<b>TRANSACTION</b> mengelompokkan beberapa operasi SQL menjadi satu unit kerja yang bersifat <b>atomik</b> — "
    "semua operasi berhasil, atau semua dibatalkan. Konsep ACID: <b>A</b>tomicity, <b>C</b>onsistency, "
    "<b>I</b>solation, <b>D</b>urability.",
    [("ROLLBACK — batalkan perubahan", "BEGIN;\nUPDATE users SET umur = 999 WHERE id = 1;\n-- Ups, salah!\nROLLBACK;\n-- Data kembali seperti semula"),
     ("Transfer uang (use case klasik)", "BEGIN;\n\n-- Kurangi saldo pengirim\nUPDATE accounts SET saldo = saldo - 100000 WHERE user_id = 1;\n\n-- Tambah saldo penerima\nUPDATE accounts SET saldo = saldo + 100000 WHERE user_id = 2;\n\nCOMMIT;  -- Jika sukses\n-- ROLLBACK;  -- Jika ada error di tengah jalan")],
    [("Apa yang dimaksud dengan sifat Atomicity dalam ACID?",
      ["A. Transaksi berjalan sangat cepat","B. Semua operasi dalam transaksi harus berhasil semua, atau dibatalkan semua — tidak ada yang setengah jadi","C. Transaksi tidak bisa dibagi menjadi sub-transaksi","D. Hanya satu transaksi yang bisa berjalan"]),
     ("Apa yang terjadi pada data jika kita menjalankan ROLLBACK?",
      ["A. Data terhapus permanen","B. Semua perubahan sejak BEGIN dibatalkan dan data kembali ke kondisi sebelum transaksi","C. Hanya operasi terakhir yang dibatalkan","D. Database reboot"]),
     ("Mengapa TRANSACTION sangat penting untuk operasi transfer uang?",
      ["A. Membuat transfer lebih cepat","B. Memastikan tidak ada uang yang hilang jika terjadi error di tengah proses","C. Mengenkripsi data transfer","D. Mencatat log transfer secara otomatis"])],
    ["Jelaskan seluruh prinsip ACID dalam TRANSACTION! Mengapa setiap prinsip penting untuk integritas data?",
     "Berikan skenario nyata selain transfer uang di mana TRANSACTION sangat krusial! Tuliskan query lengkap!"]
)

story += topik_advanced("28", "NORMALISASI DATABASE — Merancang Struktur yang Efisien",
    "<b>Normalisasi</b> adalah proses mendesain struktur tabel agar data tersimpan secara efisien, "
    "tidak redundan, dan konsisten. Ada tiga level utama: <b>1NF, 2NF, dan 3NF</b>.",
    [("1NF — Nilai harus atomic (satu sel = satu nilai)", "-- ❌ MELANGGAR 1NF:\n-- hobi = 'Membaca, Olahraga, Coding'  (banyak nilai dalam satu sel)\n\n-- ✅ SOLUSI: pisah ke tabel terpisah\nCREATE TABLE user_hobi (\n  user_id INT REFERENCES users(id),\n  hobi    VARCHAR(100)\n);"),
     ("3NF — Hilangkan ketergantungan transitif", "-- ❌ MELANGGAR 3NF: nama_kota & kode_pos tergantung kota_id, bukan user.id\n-- Tabel users: (id, nama, kota_id, nama_kota, kode_pos)\n\n-- ✅ SOLUSI: pisah tabel kota\nCREATE TABLE kota (\n  id        SERIAL PRIMARY KEY,\n  nama_kota VARCHAR(100),\n  kode_pos  VARCHAR(10)\n);\n\n-- users hanya simpan kota_id:\nCREATE TABLE users (id SERIAL PK, nama VARCHAR(100), kota_id INT REFERENCES kota(id));")],
    [("Sebuah tabel memiliki kolom hobi yang berisi nilai 'Membaca, Olahraga, Coding' dalam satu sel. Aturan Normal Form mana yang dilanggar?",
      ["A. 2NF","B. 3NF","C. 1NF","D. 4NF"]),
     ("Apa yang dimaksud dengan ketergantungan transitif yang harus dihilangkan pada 3NF?",
      ["A. Kolom A bergantung pada Primary Key","B. Kolom C bergantung pada Kolom B, dan Kolom B bergantung pada Primary Key — sehingga C bergantung tidak langsung pada PK","C. Dua tabel saling bergantung","D. Semua kolom harus bergantung pada foreign key"]),
     ("Apa keuntungan memisahkan data kota ke tabel tersendiri?",
      ["A. Query menjadi lebih sederhana tanpa JOIN","B. Menghilangkan redundansi data, memudahkan update, dan menjaga konsistensi","C. Membuat database lebih lambat","D. Membuat primary key menjadi otomatis"])],
    ["Jelaskan ketiga level normalisasi (1NF, 2NF, 3NF) dengan menggunakan satu contoh kasus yang sama dari awal hingga akhir!",
     "Apakah normalisasi penuh selalu yang terbaik? Kapan kita justru perlu melakukan denormalisasi?"]
)

story += topik_advanced("29", "WINDOW FUNCTION — Analitik Lanjutan",
    "<b>Window Function</b> bekerja pada sekumpulan baris yang berhubungan (window) tanpa mengelompokkannya "
    "seperti GROUP BY. Setiap baris tetap ada, tapi mendapatkan nilai hasil kalkulasi dari seluruh window.",
    [("ROW_NUMBER — penomoran baris", "SELECT nama, umur,\n  ROW_NUMBER() OVER (ORDER BY umur ASC) AS nomor_urut\nFROM users;"),
     ("RANK vs DENSE_RANK", "SELECT nama, umur,\n  RANK()       OVER (ORDER BY umur DESC) AS rank_biasa,\n  DENSE_RANK() OVER (ORDER BY umur DESC) AS rank_dense\nFROM users;\n-- RANK ada gap jika nilai sama, DENSE_RANK tidak ada gap"),
     ("SUM dengan PARTITION (per grup)", "SELECT nama, kota, umur,\n  SUM(umur)  OVER (PARTITION BY kota) AS total_umur_per_kota,\n  AVG(umur)  OVER (PARTITION BY kota) AS rata_umur_per_kota\nFROM users;")],
    [("Apa perbedaan utama antara Window Function dan GROUP BY?",
      ["A. Tidak ada perbedaan","B. GROUP BY mengelompokkan baris menjadi satu hasil per grup, Window Function menambahkan kolom kalkulasi tanpa mengurangi jumlah baris","C. Window Function hanya bisa digunakan dengan ROW_NUMBER","D. GROUP BY lebih cepat"]),
     ("Apa perbedaan antara RANK() dan DENSE_RANK()?",
      ["A. Tidak ada perbedaan","B. RANK() menghasilkan gap pada ranking jika ada nilai sama, DENSE_RANK() tidak","C. DENSE_RANK() lebih lambat","D. RANK() hanya untuk angka"]),
     ("Apa fungsi klausa PARTITION BY dalam Window Function?",
      ["A. Mengurutkan baris dalam window","B. Membagi data menjadi partisi untuk menerapkan window function secara terpisah per grup","C. Membatasi jumlah baris","D. Menyaring baris sebelum window function dijalankan"])],
    ["Jelaskan kapan Window Function jauh lebih tepat dibandingkan kombinasi GROUP BY dan subquery!",
     "Jelaskan kegunaan fungsi LAG() dan LEAD() dalam analisis data! Berikan contoh query!"]
)

story += topik_advanced("30", "CTE (Common Table Expression) — Query Lebih Terstruktur",
    "<b>CTE</b> adalah cara mendefinisikan <b>query sementara yang diberi nama</b> menggunakan klausa <b>WITH</b>. "
    "CTE membuat query kompleks lebih mudah dibaca dengan memecahnya menjadi langkah-langkah logis. "
    "CTE hanya hidup selama satu eksekusi query.",
    [("CTE dasar", "WITH user_dewasa AS (\n  SELECT * FROM users WHERE umur > 22\n)\nSELECT * FROM user_dewasa ORDER BY umur DESC;\n\n-- Lebih mudah dibaca dibanding nested subquery!"),
     ("CTE + Window Function", "WITH ranked_users AS (\n  SELECT nama, kota, umur,\n    RANK() OVER (PARTITION BY kota ORDER BY umur DESC) AS rank_per_kota\n  FROM users\n)\nSELECT * FROM ranked_users WHERE rank_per_kota = 1;\n-- User tertua di setiap kota")],
    [("Apa perbedaan utama antara CTE dan VIEW?",
      ["A. CTE lebih cepat dari VIEW","B. CTE bersifat sementara (hanya untuk satu query), VIEW disimpan permanen di database","C. VIEW bisa rekursif, CTE tidak","D. CTE hanya bisa digunakan sekali per query"]),
     ("Apa kata kunci yang digunakan untuk mendefinisikan CTE?",
      ["A. DEFINE","B. TEMP","C. WITH","D. AS TABLE"]),
     ("Keuntungan utama CTE dibandingkan nested subquery?",
      ["A. CTE selalu lebih cepat","B. CTE membuat query lebih mudah dibaca dan dipelihara karena setiap langkah diberi nama deskriptif","C. CTE bisa menyimpan data permanen","D. CTE otomatis membuat index"])],
    ["Tuliskan ulang query berikut menggunakan CTE: SELECT * FROM (SELECT nama, umur, RANK() OVER (ORDER BY umur DESC) AS rank_umur FROM users) AS sub WHERE sub.rank_umur <= 2;",
     "Jelaskan konsep Recursive CTE! Untuk kasus data seperti apa Recursive CTE sangat berguna?"]
)

story += topik_advanced("31", "STORED PROCEDURE & FUNCTION — Logika di Database",
    "<b>Stored Procedure</b> adalah sekumpulan perintah SQL yang disimpan di database dan bisa dipanggil berulang. "
    "<b>Function</b> mirip tapi selalu mengembalikan nilai dan bisa digunakan di SELECT.",
    [("Function kategorisasi umur (PostgreSQL)", "CREATE OR REPLACE FUNCTION kategori_umur(usia INT)\nRETURNS VARCHAR AS $$\nBEGIN\n  IF usia < 21 THEN RETURN 'Remaja';\n  ELSIF usia <= 25 THEN RETURN 'Dewasa Muda';\n  ELSE RETURN 'Dewasa';\n  END IF;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Penggunaan:\nSELECT nama, umur, kategori_umur(umur) AS kategori FROM users;"),
     ("Function total pembelian", "CREATE OR REPLACE FUNCTION total_pembelian(uid INT)\nRETURNS DECIMAL AS $$\n  SELECT COALESCE(SUM(harga), 0) FROM orders WHERE user_id = uid;\n$$ LANGUAGE sql;\n\n-- Penggunaan:\nSELECT nama, total_pembelian(id) AS total_belanja FROM users;")],
    [("Apa perbedaan utama antara Function dan Stored Procedure?",
      ["A. Function lebih lambat","B. Function wajib mengembalikan nilai dan bisa digunakan di SELECT; Stored Procedure tidak wajib return nilai","C. Stored Procedure bisa di-cache, Function tidak","D. Tidak ada perbedaan fungsional"]),
     ("Apa keuntungan menggunakan Function di database?",
      ["A. Function di database selalu lebih cepat","B. Logika tersedia untuk semua aplikasi yang terhubung dan mengurangi traffic data","C. Function di database lebih mudah di-debug","D. Function tidak membutuhkan testing"]),
     ("COALESCE(nilai, 0) dalam SQL berfungsi untuk?",
      ["A. Menggabungkan dua nilai","B. Mengembalikan nilai pertama yang tidak NULL; jika semua NULL, kembalikan nilai default","C. Menghitung jumlah nilai","D. Mengkonversi tipe data"])],
    ["Jelaskan kapan sebaiknya logika bisnis ditempatkan di database vs di kode aplikasi!",
     "Tuliskan sebuah function PostgreSQL yang menerima user_id dan mengembalikan ringkasan user sebagai teks!"]
)

story += topik_advanced("32", "TRIGGER — Otomasi di Database",
    "<b>TRIGGER</b> adalah prosedur yang <b>otomatis dieksekusi</b> sebagai respons terhadap event "
    "(INSERT, UPDATE, DELETE) pada sebuah tabel. Bisa diatur BEFORE atau AFTER event.",
    [("Auto-update timestamp", "CREATE OR REPLACE FUNCTION set_updated_at()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.updated_at = CURRENT_TIMESTAMP;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trigger_updated_at\nBEFORE UPDATE ON users\nFOR EACH ROW\nEXECUTE FUNCTION set_updated_at();"),
     ("Audit log perubahan kota", "CREATE OR REPLACE FUNCTION log_kota_change()\nRETURNS TRIGGER AS $$\nBEGIN\n  IF OLD.kota != NEW.kota THEN\n    INSERT INTO user_audit (user_id, action, old_kota, new_kota)\n    VALUES (OLD.id, 'UPDATE', OLD.kota, NEW.kota);\n  END IF;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;")],
    [("Kapan TRIGGER dieksekusi?",
      ["A. Hanya saat aplikasi memanggilnya secara manual","B. Secara otomatis oleh database sebagai respons terhadap event (INSERT/UPDATE/DELETE)","C. Setiap 1 jam secara terjadwal","D. Hanya saat database di-restart"]),
     ("Apa perbedaan antara TRIGGER BEFORE dan AFTER?",
      ["A. BEFORE lebih cepat dari AFTER","B. BEFORE dieksekusi sebelum operasi utama (bisa memodifikasi data), AFTER dieksekusi setelah operasi selesai","C. AFTER bisa membatalkan operasi, BEFORE tidak","D. Tidak ada perbedaan fungsional"]),
     ("Dalam trigger PostgreSQL, NEW dan OLD merujuk pada?",
      ["A. Versi terbaru dan terlama dari database","B. NEW adalah nilai baru yang akan disimpan, OLD adalah nilai sebelum perubahan","C. Trigger baru dan trigger lama","D. Tabel baru dan tabel lama"])],
    ["Jelaskan bagaimana TRIGGER dapat digunakan untuk membuat sistem audit log yang lengkap!",
     "Apa potensi masalah jika terlalu banyak trigger pada satu tabel? Jelaskan juga konsep cascading trigger!"]
)

story += topik_advanced("33", "QUERY OPTIMIZATION — Performa Query",
    "<b>Query optimization</b> adalah seni menulis query SQL agar <b>dieksekusi seefisien mungkin</b>. "
    "Gunakan <b>EXPLAIN</b> dan <b>EXPLAIN ANALYZE</b> untuk melihat rencana eksekusi query.",
    [("EXPLAIN untuk analisis query", "-- Lihat rencana eksekusi (tanpa menjalankan):\nEXPLAIN SELECT * FROM users WHERE nama = 'Budi';\n\n-- Jalankan dan lihat statistik aktual:\nEXPLAIN ANALYZE SELECT * FROM users WHERE nama = 'Budi';\n\n-- Istilah: Seq Scan (baca semua baris), Index Scan (pakai index)"),
     ("Best practices optimasi", "-- ❌ Hindari SELECT *:\nSELECT * FROM users WHERE id = 1;\n\n-- ✅ Pilih kolom spesifik:\nSELECT nama, email FROM users WHERE id = 1;\n\n-- ❌ Fungsi pada kolom WHERE (tidak bisa pakai index):\nSELECT * FROM users WHERE LOWER(nama) = 'budi';\n\n-- ✅ Langsung:\nSELECT * FROM users WHERE nama = 'Budi';\n\n-- ✅ Gunakan EXISTS untuk subquery besar:\nSELECT * FROM users u\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);")],
    [("Perintah SQL apa yang digunakan untuk melihat rencana eksekusi sebuah query?",
      ["A. DESCRIBE query","B. SHOW PLAN query","C. EXPLAIN query","D. ANALYZE query"]),
     ("Mengapa menggunakan fungsi pada kolom di WHERE (WHERE LOWER(nama)) bisa memperlambat query?",
      ["A. Fungsi LOWER membutuhkan banyak memori","B. Database tidak bisa menggunakan index karena harus menghitung fungsi untuk setiap baris","C. LOWER hanya bisa digunakan di SELECT","D. Tidak ada dampak performa"]),
     ("Apa itu N+1 Query Problem?",
      ["A. Query yang mengambil N+1 kolom","B. Pola buruk di mana 1 query mengambil daftar, lalu N query terpisah dijalankan untuk setiap item — bisa digantikan dengan satu JOIN","C. Tabel yang memiliki N+1 index","D. Error karena terlalu banyak JOIN"])],
    ["Jelaskan apa itu Seq Scan dan Index Scan dalam EXPLAIN output! Kapan Seq Scan tidak selalu buruk?",
     "Tuliskan 5 best practice dalam menulis query SQL yang efisien dengan contoh query buruk dan versi perbaikannya!"]
)

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# KUNCI JAWABAN
# ═══════════════════════════════════════════════════════════════════════════════
story.append(level_header("✅  KUNCI JAWABAN", BIJU_GELAP if False else BIRU_GELAP))
story.append(Spacer(1, 12))

def jawaban_section(level_color, level_label, items):
    blok = []
    blok.append(Paragraph(level_label, ParagraphStyle('jlevel',
        fontSize=12, fontName='Helvetica-Bold', textColor=colors.HexColor(level_color),
        spaceAfter=6, spaceBefore=10, leading=16)))
    blok.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor(level_color)))
    blok.append(Spacer(1, 4))
    for nomor, nama, pg_answers, esai_answers in items:
        blok.append(Paragraph(f"<b>{nomor}. {nama}</b>", ParagraphStyle('jt',
            fontSize=10, fontName='Helvetica-Bold', textColor=colors.HexColor(BIRU_GELAP),
            spaceAfter=3, spaceBefore=6, leading=14)))
        blok.append(Paragraph(
            f"<b>PG:</b> {' | '.join([f'{i+1}. <b>{a}</b>' for i,a in enumerate(pg_answers)])}",
            ParagraphStyle('jpg', fontSize=9, fontName='Helvetica',
                textColor=colors.HexColor(ABU_GELAP), spaceAfter=2, leading=13, leftIndent=8)))
        for i, esai in enumerate(esai_answers, 1):
            blok.append(Paragraph(f"<b>Esai {i}:</b> {esai}", ParagraphStyle('je',
                fontSize=8.5, fontName='Helvetica', textColor=colors.HexColor(ABU_GELAP),
                spaceAfter=2, leading=12, leftIndent=8)))
    return blok

story += jawaban_section(HIJAU_GELAP, "🟢 LEVEL BASIC", [
    ("1", "SELECT", ["B","C","C"],
     ["SELECT * mengambil semua kolom — boros bandwidth dan berpotensi ekspos kolom sensitif. SELECT nama, umur hanya ambil kolom yang dibutuhkan — lebih cepat dan aman.",
      "SELECT nama, umur * 2 AS dua_kali_umur FROM users; — nama adalah kolom biasa, umur * 2 adalah kalkulasi, AS dua_kali_umur memberi nama hasil kalkulasi."]),
    ("2", "WHERE", ["C","A","D"],
     ["AND: kedua kondisi harus terpenuhi. Contoh: WHERE umur > 20 AND kota = 'Bandung' → hanya Rina. OR: cukup satu kondisi. Contoh: WHERE kota = 'Bandung' OR kota = 'Jakarta' → Budi, Andi, Rina.",
      "Tanpa WHERE, DELETE dan UPDATE berlaku pada SEMUA baris. Contoh: DELETE FROM users; menghapus seluruh data. UPDATE users SET kota = 'Jakarta'; memindahkan semua user ke Jakarta."]),
    ("3", "INSERT", ["B","C","C"],
     ["INSERT banyak baris hanya butuh satu round-trip ke database vs N round-trips untuk N INSERT terpisah. Mengurangi overhead koneksi dan meningkatkan throughput signifikan.",
      "NULL berarti nilai tidak diketahui/tidak ada. Diperbolehkan jika kolom tidak memiliki NOT NULL. Tidak diperbolehkan jika kolom memiliki NOT NULL atau merupakan PRIMARY KEY."]),
    ("4", "UPDATE", ["C","B","C"],
     ["Tanpa WHERE, semua baris terpengaruh. Di e-commerce: UPDATE products SET harga = 0; tanpa WHERE akan mengubah harga semua produk menjadi gratis.",
      "UPDATE users SET umur = umur + 1 WHERE kota = 'Bandung'; — Gunakan umur + 1 karena nilai umur masing-masing berbeda; kita ingin menambah 1 dari nilai yang sudah ada."]),
    ("5", "DELETE", ["B","C","C"],
     ["DELETE: hapus baris tertentu, bisa di-rollback dalam transaksi. TRUNCATE: hapus semua baris lebih cepat, reset auto-increment. DROP: hapus seluruh tabel + struktur, tidak bisa di-undo.",
      "Pencegahan: jalankan SELECT dulu sebelum DELETE; gunakan TRANSACTION; batasi hak akses; backup rutin. Pemulihan: gunakan backup terakhir atau point-in-time recovery."]),
    ("6", "ORDER BY", ["B","C","B"],
     ["Di e-commerce: ORDER BY kategori ASC, harga ASC — urutkan per kategori (A-Z) dan dalam satu kategori dari termurah. User melihat produk terurut rapi.",
      "ORDER BY tidak mengubah data di database. Data tetap tersimpan dalam urutan fisik aslinya. ORDER BY hanya mempengaruhi urutan tampilan hasil yang dikembalikan untuk satu query."]),
    ("7", "LIMIT & OFFSET", ["B","B","C"],
     ["Formula: OFFSET = (halaman - 1) × per_halaman. Halaman 1: LIMIT 10 OFFSET 0. Halaman 2: LIMIT 10 OFFSET 10. Halaman 5: LIMIT 10 OFFSET 40.",
      "OFFSET besar sangat lambat karena database tetap harus membaca dan membuang semua baris sebelum OFFSET. Alternatif: keyset pagination — WHERE id > last_seen_id LIMIT 10."]),
])

story += jawaban_section(KUNING, "🟡 LEVEL INTERMEDIATE", [
    ("8", "COUNT", ["B","C","C"],
     ["(1) Dashboard: 'Total user: 10.432'. (2) Cek duplikat sebelum INSERT: SELECT COUNT(*) FROM users WHERE email = 'test@mail.com'.",
      "COUNT(kolom) mengabaikan NULL; COUNT(*) hitung semua baris. Jika 3 dari 4 user mengisi umur: COUNT(umur) = 3, COUNT(*) = 4."]),
    ("9", "GROUP BY", ["B","B","B"],
     ["Database tidak tahu nilai nama mana yang harus ditampilkan untuk grup 'Bandung' (Budi atau Rina?). Hasilnya error atau tidak deterministik.",
      "SELECT kota, COUNT(*) AS jumlah, AVG(umur) AS rata_umur FROM users GROUP BY kota ORDER BY jumlah DESC;"]),
    ("10", "CREATE TABLE", ["C","B","B"],
     ["VARCHAR(100): batas 100 karakter, gunakan untuk nama/email. TEXT: panjang tak terbatas, untuk deskripsi/konten panjang.",
      "CREATE TABLE students (id SERIAL PK, nim VARCHAR(20) NOT NULL UNIQUE, nama VARCHAR(150) NOT NULL, jurusan VARCHAR(100) NOT NULL, angkatan INT NOT NULL, ipk DECIMAL(3,2) DEFAULT 0.00);"]),
    ("11", "PRIMARY KEY", ["C","B","C"],
     ["Natural Key (NIK, email): risiko berubah. Surrogate Key (integer/UUID buatan): stabil, pendek. Surrogate Key lebih direkomendasikan.",
      "Composite PK ketika tidak ada satu kolom yang bisa jadi identitas unik sendiri. Contoh: tabel enrollments dengan (student_id, course_id) — keduanya baru unik sebagai kombinasi."]),
    ("12", "DISTINCT", ["B","C","C"],
     ["DISTINCT lebih singkat untuk sekadar mendapat nilai unik. GROUP BY lebih fleksibel karena bisa digabung dengan agregat. Gunakan DISTINCT untuk kesederhanaan.",
      "SELECT DISTINCT brand FROM products ORDER BY brand; — berguna untuk dropdown filter di halaman pencarian e-commerce."]),
    ("13", "LIKE", ["B","C","B"],
     ["% = nol atau lebih karakter: 'B%' cocok Budi, Besar, B. _ = tepat satu karakter: 'B_di' hanya cocok Budi.",
      "LIKE '%kata%' tidak bisa pakai index B-tree biasa karena harus scan semua nilai dari awal. Alternatif: Full-Text Search atau Elasticsearch."]),
    ("14", "IN", ["B","B","B"],
     ["WHERE kota IN ('Bandung','Jakarta','Surabaya') jauh lebih ringkas dari 3 kondisi OR, mudah ditambah/dikurangi nilai.",
      "Jika salah satu nilai NOT IN adalah NULL, hasilnya selalu kosong! SQL tidak bisa menentukan apakah nilai 'tidak sama dengan NULL'. Solusi: gunakan NOT EXISTS."]),
    ("15", "BETWEEN", ["B","C","B"],
     ["WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31' — inklusif, termasuk 1 Januari dan 31 Desember. Umum untuk laporan bulanan/tahunan.",
      "BETWEEN bersifat inklusif artinya kedua batas termasuk dalam rentang. BETWEEN 20 AND 25 identik dengan >= 20 AND <= 25."]),
    ("16", "ALIAS", ["B","B","B"],
     ["Tanpa alias: SELECT users.nama, orders.produk FROM users JOIN orders ON users.id = orders.user_id; — dengan alias: SELECT u.nama, o.produk FROM users u JOIN orders o ON u.id = o.user_id;",
      "Tidak boleh pakai alias kolom di WHERE karena urutan eksekusi: FROM→WHERE→GROUP BY→HAVING→SELECT. Alias didefinisikan di SELECT, tapi WHERE diproses sebelum SELECT."]),
    ("17", "SUM & AVG", ["B","C","B"],
     ["AVG(kolom) = SUM(tidak NULL)/COUNT(tidak NULL). SUM/COUNT(*) = SUM/COUNT(semua baris). Jika ada NULL, COUNT(*) lebih besar → SUM/COUNT(*) lebih kecil dari AVG.",
      "SELECT MIN(harga) AS terkecil, MAX(harga) AS terbesar, SUM(harga) AS total, AVG(harga) AS rata FROM orders;"]),
    ("18", "HAVING", ["B","B","B"],
     ["WHERE menyaring bahan mentah sebelum dimasak. GROUP BY memasak per porsi. HAVING memilih porsi yang layak disajikan.",
      "SELECT kota, AVG(umur) AS rata_umur FROM users GROUP BY kota HAVING AVG(umur) > 20 ORDER BY rata_umur DESC;"]),
    ("19", "JOIN", ["B","B","B"],
     ["LEFT JOIN berguna saat ingin melihat semua data termasuk yang belum punya data terkait. Contoh: semua user + pesanannya — user belum pernah pesan tetap muncul dengan NULL.",
      "Keuntungan normalisasi: hemat storage, update konsisten di satu tempat, integritas data, tabel lebih kecil → query lebih cepat."]),
    ("20", "SUBQUERY", ["B","C","B"],
     ["SELECT * FROM users WHERE umur > (SELECT AVG(umur) FROM users); — atau dengan CTE: WITH avg_umur AS (SELECT AVG(umur) AS avg FROM users) SELECT u.* FROM users u, avg_umur a WHERE u.umur > a.avg;",
      "Correlated subquery mereferensikan kolom dari query luar — dieksekusi satu kali per baris (lambat). Subquery biasa dieksekusi sekali. Contoh: umur > (SELECT AVG(umur) FROM users WHERE kota = u.kota)."]),
    ("21", "INDEX", ["B","B","B"],
     ["Full Table Scan: baca setiap baris dari awal. Pada 10 juta baris = 10 juta pembacaan. Dengan index: langsung lompat ke data menggunakan B-tree — O(log n) vs O(n).",
      "(1) Kolom jarang dipakai di WHERE/JOIN. (2) Kolom dengan sedikit variasi nilai (boolean). (3) Tabel kecil. (4) Kolom yang sangat sering di-UPDATE."]),
])

story += jawaban_section(MERAH, "🔴 LEVEL ADVANCED", [
    ("22", "UNION & UNION ALL", ["B","B","B"],
     ["UNION melakukan deduplication: sort semua data, bandingkan baris, hapus duplikat — O(n log n). UNION ALL langsung gabungkan tanpa sorting.",
      "Gabungkan active_users dan archived_users: SELECT nama, email, 'active' AS status FROM active_users UNION SELECT nama, email, 'archived' AS status FROM archived_users;"]),
    ("23", "CASE", ["C","C","B"],
     ["SELECT u.nama, o.produk, o.harga, CASE WHEN o.harga < 500000 THEN 'Budget' WHEN o.harga BETWEEN 500000 AND 5000000 THEN 'Mid-range' ELSE 'Premium' END AS kategori FROM users u JOIN orders o ON u.id = o.user_id;",
      "SELECT COUNT(CASE WHEN umur < 21 THEN 1 END) AS remaja, COUNT(CASE WHEN umur BETWEEN 21 AND 25 THEN 1 END) AS dewasa_muda, COUNT(CASE WHEN umur > 25 THEN 1 END) AS dewasa FROM users;"]),
    ("24", "VIEW", ["B","B","C"],
     ["Regular View: query dieksekusi ulang setiap kali diakses — selalu data terbaru tapi bisa lambat. Materialized View: hasil tersimpan fisik, lebih cepat tapi bisa tidak real-time.",
      "Buat view public_users: CREATE VIEW public_users AS SELECT id, nama, kota FROM users; — berikan akses ke view ini, bukan ke tabel users yang punya kolom sensitif."]),
    ("25", "ALTER TABLE", ["B","C","B"],
     ["Strategi aman: (1) Tambah kolom baru. (2) Isi dari kolom lama. (3) Update aplikasi. (4) Hapus kolom lama setelah yakin.",
      "MySQL: CHANGE COLUMN old_name new_name data_type. PostgreSQL: RENAME COLUMN old TO new. Penting untuk migrasi antar database."]),
    ("26", "NOT NULL & DEFAULT", ["B","C","B"],
     ["Bug dari NULL: AVG(umur) hanya hitung user yang mengisi umur — hasilnya menyesatkan jika banyak NULL. WHERE umur = NULL tidak pernah menemukan apapun (harus IS NULL).",
      "CREATE TABLE payments (id SERIAL PK, user_id INT NOT NULL, amount DECIMAL(15,2) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending', payment_method VARCHAR(50), paid_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW());"]),
    ("27", "TRANSACTION", ["B","B","B"],
     ["A (Atomicity): semua atau tidak sama sekali. C (Consistency): data selalu valid. I (Isolation): transaksi tidak saling mengganggu. D (Durability): data COMMIT tidak hilang meski crash.",
      "Pemesanan tiket: BEGIN; UPDATE seats SET is_booked = TRUE WHERE seat_id = 5; INSERT INTO bookings (user_id, seat_id) VALUES (1, 5); COMMIT; — jika salah satu gagal, ROLLBACK semua."]),
    ("28", "NORMALISASI", ["C","B","B"],
     ["1NF: setiap sel satu nilai atomic. 2NF: hilangkan partial dependency (non-key bergantung pada sebagian PK). 3NF: hilangkan transitive dependency (non-key bergantung pada non-key lain).",
      "Normalisasi tidak selalu terbaik. Denormalisasi dilakukan ketika performa kritis dan JOIN terlalu lambat, atau untuk OLAP/data warehouse. Risiko: duplikasi, inkonsistensi."]),
    ("29", "WINDOW FUNCTION", ["B","B","B"],
     ["WITH ranked AS (SELECT *, RANK() OVER (PARTITION BY kategori ORDER BY total_terjual DESC) AS rk FROM products) SELECT * FROM ranked WHERE rk <= 3;",
      "LAG() ambil nilai baris sebelumnya — bandingkan dengan periode sebelumnya. LEAD() ambil nilai baris berikutnya. Contoh: LAG(umur) OVER (ORDER BY umur) AS umur_sebelumnya."]),
    ("30", "CTE", ["B","C","B"],
     ["WITH ranked_users AS (SELECT nama, umur, RANK() OVER (ORDER BY umur DESC) AS rank_umur FROM users) SELECT * FROM ranked_users WHERE rank_umur <= 2; — lebih mudah dibaca karena setiap langkah bernama.",
      "Recursive CTE untuk data hierarkis: WITH RECURSIVE subordinates AS (SELECT * FROM employees WHERE id = 1 UNION ALL SELECT e.* FROM employees e JOIN subordinates s ON e.manager_id = s.id) SELECT * FROM subordinates;"]),
    ("31", "STORED PROCEDURE & FUNCTION", ["B","B","B"],
     ["Di DB: logika tersedia untuk semua aplikasi, aman (user tidak akses tabel langsung). Di aplikasi: mudah version control, portable. Rekomendasi: logika bisnis di aplikasi.",
      "CREATE OR REPLACE FUNCTION ringkasan_user(uid INT) RETURNS TEXT AS $$ DECLARE r TEXT; BEGIN SELECT CONCAT('Nama: ', nama, ', Kota: ', kota, ', Total: ', COALESCE(SUM(o.harga),0)) INTO r FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.id = uid GROUP BY u.nama, u.kota; RETURN r; END; $$ LANGUAGE plpgsql;"]),
    ("32", "TRIGGER", ["B","B","B"],
     ["Audit log minimum: id, tabel_name, record_id, action (INSERT/UPDATE/DELETE), old_values (JSONB), new_values (JSONB), changed_by, changed_at. Penting untuk compliance dan forensik.",
      "Terlalu banyak trigger: memperlambat write, urutan tidak terduga, sulit di-debug. Cascading trigger bisa menyebabkan loop tak terbatas. Solusi: dokumentasikan dan batasi penggunaan."]),
    ("33", "QUERY OPTIMIZATION", ["C","B","B"],
     ["Seq Scan: baca setiap baris dari awal (seperti baca buku dari hal. 1). Index Scan: langsung lompat ke data. Seq Scan tidak selalu buruk: untuk tabel kecil bisa lebih cepat dari overhead index.",
      "(1) Pilih kolom spesifik, hindari SELECT *. (2) Pastikan kolom WHERE ber-index. (3) Hindari fungsi pada kolom WHERE. (4) Gunakan JOIN bukan subquery. (5) Gunakan LIMIT untuk data besar."]),
])

# FOOTER (konten akhir dokumen — di dalam story)
story.append(Spacer(1, 20))
story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor(BIRU_GELAP)))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "📘 Modul Lengkap Belajar SQL · Dari Dasar Hingga Advanced · 33 Topik · Basic | Intermediate | Advanced",
    ParagraphStyle('footer', fontSize=8.5, fontName='Helvetica',
        textColor=colors.HexColor(ABU_GELAP), alignment=TA_CENTER, leading=12)))

# ── Fungsi footer dengan nomor halaman ───────────────────────────────────────
# Fungsi ini dipanggil otomatis oleh ReportLab setiap kali halaman baru
# di-render, sehingga nomor halaman muncul di footer SETIAP halaman.
def footer_halaman(canvas, doc):
    """Gambar footer dengan nomor halaman di tengah bawah setiap halaman."""
    canvas.saveState()
    page_width, page_height = A4

    # ── Garis tipis di atas footer
    canvas.setStrokeColor(colors.HexColor(ABU_BORDER))
    canvas.setLineWidth(0.5)
    # Posisi Y garis: bottomMargin dikurangi sedikit agar berada di bawah konten
    garis_y = doc.bottomMargin - 2
    canvas.line(doc.leftMargin, garis_y, page_width - doc.rightMargin, garis_y)

    # ── Teks nomor halaman
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor(ABU_GELAP))
    teks = f'Halaman {doc.page}'
    canvas.drawCentredString(page_width / 2, garis_y - 10, teks)

    canvas.restoreState()

# BUILD — callback footer_halaman dipakai di semua halaman
doc.build(story, onFirstPage=footer_halaman, onLaterPages=footer_halaman)
print("[OK] PDF selesai:", OUTPUT)