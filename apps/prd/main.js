/* ═══════════════════════════════════════════════════════════
   PRD BUILDER — main.js
   Architecture:
   1. SCHEMA — defines all sections/fields
   2. STATE  — holds all form values
   3. RENDER — builds DOM from schema
   4. EVENTS — wires up all interactions
   5. OUTPUT — generates markdown
   6. EXAMPLE — embedded PRD content
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   1. SCHEMA
   Each section → subsections → fields
   Field types: text, textarea, repeater, table, color, select, colorpalette, filetree
───────────────────────────────────────────────────────── */
const SCHEMA = [
  {
    id: 'meta',
    num: 'META',
    title: 'Metadata Dokumen',
    subsections: [
      {
        id: 'meta_info',
        num: '',
        title: 'Informasi Dokumen',
        fields: [
          { id: 'meta_versi', label: 'Versi PRD', type: 'text', placeholder: 'v1.0', hint: '' },
          { id: 'meta_tanggal', label: 'Tanggal Dibuat', type: 'text', placeholder: 'YYYY-MM-DD' },
          { id: 'meta_status', label: 'Status', type: 'select', options: ['Draft', 'In Review', 'Approved', 'Deprecated'] },
          { id: 'meta_author', label: 'Author', type: 'text', placeholder: 'Nama pemilik proyek' },
          { id: 'meta_stack', label: 'Tech Stack Ringkas', type: 'text', placeholder: 'HTML5, CSS3, Vanilla JS — no framework' },
        ]
      }
    ]
  },
  {
    id: 'b1',
    num: '1',
    title: 'Konteks & Tujuan',
    subsections: [
      {
        id: 'b1_1',
        num: '1.1',
        title: 'Problem Statement',
        hint: 'Format: "Saat ini [siapa] mengalami [masalah] karena [penyebab], yang mengakibatkan [dampak]."',
        fields: [
          { id: 'problem_statement', label: 'Problem Statement', type: 'textarea', placeholder: 'Saat ini [siapa] mengalami [masalah] karena [penyebab], yang mengakibatkan [dampak].' }
        ]
      },
      {
        id: 'b1_2',
        num: '1.2',
        title: 'Tujuan Produk',
        fields: [
          { id: 'goals', label: 'Tujuan (satu per baris)', type: 'repeater', placeholder: 'Tujuan spesifik dan terukur', itemType: 'text' }
        ]
      },
      {
        id: 'b1_3',
        num: '1.3',
        title: 'Success Metrics (KPI)',
        fields: [
          {
            id: 'kpi_table',
            label: 'KPI',
            type: 'table',
            columns: ['Metrik', 'Target', 'Cara Ukur'],
            defaultRows: [
              ['Jumlah form inquiry per bulan', '≥ 20', 'Google Analytics event'],
              ['Bounce rate halaman produk', '≤ 60%', 'Google Analytics 4'],
              ['Lighthouse Performance Score', '≥ 85', 'Lighthouse audit'],
            ]
          }
        ]
      },
      {
        id: 'b1_4',
        num: '1.4',
        title: 'Non-Goals (Out of Scope)',
        hint: 'Hal-hal yang secara eksplisit TIDAK termasuk dalam scope.',
        fields: [
          { id: 'non_goals', label: 'Non-Goals', type: 'repeater', placeholder: 'Contoh: Fitur e-commerce / login pengguna', itemType: 'text' }
        ]
      }
    ]
  },
  {
    id: 'b2',
    num: '2',
    title: 'Pengguna',
    subsections: [
      {
        id: 'b2_1',
        num: '2.1',
        title: 'Target Pengguna',
        fields: [
          { id: 'target_users', label: 'Daftar Target Pengguna', type: 'repeater', placeholder: 'Contoh: Kontraktor listrik', itemType: 'text' }
        ]
      },
      {
        id: 'b2_p1',
        num: '2.2',
        title: 'Persona 1',
        fields: [
          { id: 'p1_nama', label: 'Nama Persona', type: 'text', placeholder: 'Contoh: Budi — Kontraktor Listrik' },
          { id: 'p1_peran', label: 'Peran / Jabatan', type: 'text', placeholder: 'Pemilik usaha kontraktor listrik skala menengah' },
          { id: 'p1_tujuan', label: 'Tujuan Utama di Website', type: 'textarea', placeholder: 'Menemukan supplier dengan spesifikasi teknis lengkap...' },
          { id: 'p1_pain', label: 'Pain Point', type: 'textarea', placeholder: 'Supplier online sering tidak mencantumkan spesifikasi...' },
          { id: 'p1_device', label: 'Perangkat', type: 'select', options: ['Mobile (mayoritas)', 'Desktop (mayoritas)', 'Mobile & Desktop (50/50)', 'Tablet'] },
          { id: 'p1_digital', label: 'Tingkat Literasi Digital', type: 'select', options: ['Rendah', 'Menengah', 'Tinggi'] },
          { id: 'p1_find', label: 'Cara Menemukan Website', type: 'text', placeholder: 'Google search: "battery industri [kota]"' },
        ]
      },
      {
        id: 'b2_p2',
        num: '2.3',
        title: 'Persona 2 (opsional)',
        fields: [
          { id: 'p2_nama', label: 'Nama Persona', type: 'text', placeholder: 'Risa — Manajer Pengadaan Pabrik' },
          { id: 'p2_peran', label: 'Peran / Jabatan', type: 'text', placeholder: 'Manager procurement perusahaan manufaktur' },
          { id: 'p2_tujuan', label: 'Tujuan Utama', type: 'textarea', placeholder: '' },
          { id: 'p2_pain', label: 'Pain Point', type: 'textarea', placeholder: '' },
          { id: 'p2_device', label: 'Perangkat', type: 'select', options: ['Mobile (mayoritas)', 'Desktop (mayoritas)', 'Mobile & Desktop (50/50)', 'Tablet'] },
          { id: 'p2_digital', label: 'Tingkat Literasi Digital', type: 'select', options: ['Rendah', 'Menengah', 'Tinggi'] },
          { id: 'p2_find', label: 'Cara Menemukan Website', type: 'text', placeholder: '' },
        ]
      }
    ]
  },
  {
    id: 'b3',
    num: '3',
    title: 'Scope & Prioritas',
    subsections: [
      {
        id: 'b3_1',
        num: '3.1',
        title: 'Daftar Fitur & Prioritas',
        hint: 'P1=MVP (blokir launch), P2=Penting (sebelum launch), P3=Nice-to-have (setelah launch)',
        fields: [
          {
            id: 'features_table',
            label: 'Fitur',
            type: 'table',
            columns: ['ID', 'Fitur', 'Halaman/Scope', 'Prioritas'],
            defaultRows: [
              ['F-01', 'Home dengan hero, keunggulan, highlight produk', 'index.html', 'P1 — MVP'],
              ['F-02', 'Katalog produk dengan filter sidebar', 'product.html', 'P1 — MVP'],
              ['F-03', 'Halaman kontak dengan form inquiry', 'kontak.html', 'P1 — MVP'],
              ['F-04', 'Floating WhatsApp button', 'global', 'P1 — MVP'],
            ]
          }
        ]
      },
      {
        id: 'b3_2',
        num: '3.2',
        title: 'Versioning',
        fields: [
          {
            id: 'versions_table',
            label: 'Rencana Versi',
            type: 'table',
            columns: ['Versi', 'Fitur yang Termasuk', 'Target Selesai'],
            defaultRows: [
              ['v1.0', 'Semua fitur P1', 'Dikerjakan bertahap'],
              ['v1.1', 'Fitur P2', 'Setelah v1.0 selesai'],
              ['v2.0', 'Fitur P3 + iterasi', 'TBD'],
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b4',
    num: '4',
    title: 'Design System',
    subsections: [
      {
        id: 'b4_1',
        num: '4.1',
        title: 'Prinsip Visual (Konkret)',
        hint: 'Definisikan setiap prinsip sebagai properti CSS atau angka spesifik — bukan kata sifat subjektif.',
        fields: [
          {
            id: 'principles_table',
            label: 'Prinsip & Definisi',
            type: 'table',
            columns: ['Prinsip', 'Definisi Konkret'],
            defaultRows: [
              ['Industrial Tech', 'Warna dominan navy dan electric blue. Tidak ada warna pastel.'],
              ['Minimalis', 'Max 2 font family. Max 5 warna utama. Whitespace antar section min 80px desktop, 48px mobile.'],
              ['Produk sebagai fokus', 'Gambar produk min 60% area kartu. Tidak ada dekorasi yang mengalihkan.'],
            ]
          }
        ]
      },
      {
        id: 'b4_colors',
        num: '4.2',
        title: 'Warna',
        hint: 'Masukkan kode hex atau klik kotak warna untuk membuka color picker.',
        fields: [
          {
            id: 'colors',
            label: 'Palette Warna',
            type: 'colorpalette',
            entries: [
              { id: 'color_primary', label: 'Primary', defaultHex: '#0A1F44', usage: 'Background navbar, section gelap, footer' },
              { id: 'color_accent', label: 'Accent', defaultHex: '#007BFF', usage: 'CTA button, link aktif, hover state' },
              { id: 'color_surface', label: 'Surface', defaultHex: '#F4F6F9', usage: 'Background section terang, card background' },
              { id: 'color_white', label: 'Base / White', defaultHex: '#FFFFFF', usage: 'Background halaman, teks pada background gelap' },
              { id: 'color_text', label: 'Text Primary', defaultHex: '#1A1A1A', usage: 'Heading, body text' },
              { id: 'color_text2', label: 'Text Secondary', defaultHex: '#6B7280', usage: 'Caption, label, meta info' },
              { id: 'color_danger', label: 'Danger', defaultHex: '#DC2626', usage: 'Error state, form validation' },
              { id: 'color_success', label: 'Success', defaultHex: '#16A34A', usage: 'Konfirmasi, status aktif' },
              { id: 'color_warning', label: 'Warning', defaultHex: '#D97706', usage: 'Peringatan, informasi penting' },
              { id: 'color_border', label: 'Border', defaultHex: '#E5E7EB', usage: 'Border card, divider, input border' },
            ]
          }
        ]
      },
      {
        id: 'b4_typo',
        num: '4.3',
        title: 'Tipografi',
        fields: [
          { id: 'font_primary', label: 'Font Utama', type: 'text', placeholder: 'Inter (Google Fonts)' },
          { id: 'font_load', label: 'Load via', type: 'text', placeholder: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
          {
            id: 'typo_table',
            label: 'Skala Tipografi',
            type: 'table',
            columns: ['Peran', 'Size Desktop', 'Size Mobile', 'Weight', 'Line Height'],
            defaultRows: [
              ['H1', '48px', '32px', '700', '1.2'],
              ['H2', '36px', '28px', '700', '1.25'],
              ['H3', '24px', '20px', '600', '1.3'],
              ['Body', '16px', '15px', '400', '1.7'],
              ['Caption', '13px', '12px', '400', '1.5'],
              ['Button', '14px', '14px', '600', '1'],
            ]
          }
        ]
      },
      {
        id: 'b4_bp',
        num: '4.4',
        title: 'Breakpoint Responsif',
        fields: [
          {
            id: 'breakpoints_table',
            label: 'Breakpoint',
            type: 'table',
            columns: ['Nama', 'CSS Min-Width', 'Layout Grid', 'Navbar'],
            defaultRows: [
              ['Mobile', '0px', '1 kolom', 'Hamburger'],
              ['Tablet', '768px', '2 kolom', 'Hamburger'],
              ['Desktop S', '992px', '3 kolom', 'Full horizontal'],
              ['Desktop L', '1200px', '4 kolom', 'Full horizontal'],
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b5',
    num: '5',
    title: 'Arsitektur & Teknologi',
    subsections: [
      {
        id: 'b5_stack',
        num: '5.1',
        title: 'Tech Stack',
        fields: [
          {
            id: 'stack_table',
            label: 'Stack',
            type: 'table',
            columns: ['Layer', 'Teknologi', 'Versi', 'Keterangan'],
            defaultRows: [
              ['Markup', 'HTML5', '-', 'Semantic HTML wajib'],
              ['Styling', 'CSS3', '-', 'Tanpa framework CSS. Gunakan CSS custom properties.'],
              ['Scripting', 'Vanilla JavaScript', 'ES6+', 'Tidak menggunakan jQuery atau framework JS'],
              ['Icon', 'Font Awesome', '6.x (CDN)', ''],
              ['Hosting', '[TBD]', '-', ''],
              ['Analytics', 'Google Analytics 4', '-', ''],
              ['CMS', 'Tidak ada — v1.0', '-', 'Konten hardcode di HTML'],
            ]
          }
        ]
      },
      {
        id: 'b5_files',
        num: '5.2',
        title: 'Struktur File & Folder',
        fields: [
          {
            id: 'file_structure',
            label: 'Struktur Folder',
            type: 'filetree',
            placeholder: '[nama-proyek]/\n├── index.html\n├── tentang.html\n├── product.html\n└── assets/\n    ├── css/\n    │   └── main.css\n    ├── js/\n    │   └── main.js\n    └── img/'
          }
        ]
      },
      {
        id: 'b5_browser',
        num: '5.3',
        title: 'Browser Support',
        fields: [
          {
            id: 'browsers_table',
            label: 'Browser yang Didukung',
            type: 'table',
            columns: ['Browser', 'Versi Minimum'],
            defaultRows: [
              ['Chrome', '90+'],
              ['Firefox', '88+'],
              ['Safari', '14+'],
              ['Mobile Safari (iOS)', '14+'],
              ['Chrome Android', '90+'],
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b6',
    num: '6',
    title: 'Navigasi & Information Architecture',
    subsections: [
      {
        id: 'b6_nav',
        num: '6.1',
        title: 'Struktur Navigasi',
        fields: [
          { id: 'nav_structure', label: 'Struktur (tree format)', type: 'filetree', placeholder: '[Nama Brand]\n├── Home (index.html)\n├── Tentang (tentang.html)\n├── Produk (product.html)\n│   └── Detail Produk (product-detail.html)\n└── Kontak (kontak.html)' }
        ]
      },
      {
        id: 'b6_navbar',
        num: '6.2',
        title: 'Spesifikasi Navbar',
        fields: [
          {
            id: 'navbar_table',
            label: 'Navbar Properties',
            type: 'table',
            columns: ['Property', 'Nilai'],
            defaultRows: [
              ['Posisi', 'position: fixed; top: 0; width: 100%; z-index: 1000'],
              ['Default state', 'Background: transparent. Text & icon: #FFFFFF.'],
              ['Scroll state', 'Background: #FFFFFF. Box-shadow: 0 2px 8px rgba(0,0,0,0.1).'],
              ['Trigger scroll state', 'Setelah scroll melewati 80px dari top'],
              ['Height', '72px (desktop), 64px (mobile)'],
            ]
          },
          { id: 'navbar_extra', label: 'Catatan Tambahan Navbar', type: 'textarea', placeholder: 'Hamburger menu behavior, animasi, dll...' }
        ]
      },
      {
        id: 'b6_footer',
        num: '6.3',
        title: 'Footer',
        fields: [
          { id: 'footer_desc', label: 'Deskripsi Footer', type: 'textarea', placeholder: '4 kolom di desktop, 2 kolom di tablet, 1 kolom di mobile. Kolom 1: Logo + tagline. Kolom 2: Nav links. Kolom 3: Kontak. Kolom 4: Social media.' }
        ]
      }
    ]
  },
  {
    id: 'b7',
    num: '7',
    title: 'Detail Halaman',
    subsections: [
      {
        id: 'b7_pages',
        num: '7.x',
        title: 'Halaman-Halaman',
        hint: 'Definisikan setiap halaman. Untuk setiap section: layout, konten, behavior, states, acceptance criteria.',
        fields: [
          {
            id: 'pages_detail', label: 'Detail Semua Halaman', type: 'textarea',
            placeholder: `## 7.1 HOME — index.html
Meta title: [Nama] — Solusi Battery & Kelistrikan Industri
H1: Reliable Power Solution for Your Business

### Hero Section
Layout: Full-width, min-height 100vh, background gambar + overlay navy
Konten: Label, H1, subheadline, 2 tombol CTA
States: Loading (skeleton), Default
Acceptance: [ ] Contrast ratio ≥ 4.5:1, [ ] CTA mengarah ke halaman benar

### Section Keunggulan
...` }
        ]
      }
    ]
  },
  {
    id: 'b8',
    num: '8',
    title: 'User Stories',
    subsections: [
      {
        id: 'b8_stories',
        num: '8.x',
        title: 'User Stories',
        hint: 'Format: "Sebagai [persona], saya ingin [aksi], agar [tujuan/manfaat]."',
        fields: [
          {
            id: 'user_stories',
            label: 'User Stories',
            type: 'repeater',
            placeholder: 'US-01: Sebagai kontraktor, saya ingin filter produk by kategori, agar saya hanya melihat produk yang relevan.\nAC: [ ] Grid terupdate, [ ] Jumlah produk terupdate',
            itemType: 'textarea'
          }
        ]
      }
    ]
  },
  {
    id: 'b9',
    num: '9',
    title: 'Global Component',
    subsections: [
      {
        id: 'b9_components',
        num: '9.x',
        title: 'Komponen Global',
        hint: 'Komponen yang muncul di semua halaman: footer, floating button, navbar, dll.',
        fields: [
          {
            id: 'global_components',
            label: 'Spesifikasi Komponen Global',
            type: 'repeater',
            placeholder: '## Floating WhatsApp Button\nPosisi: fixed, bottom: 32px, right: 32px\nIcon: fa-whatsapp, background: #25D366\nVisibility: muncul setelah hero section terlewati (IntersectionObserver)',
            itemType: 'textarea'
          }
        ]
      }
    ]
  },
  {
    id: 'b10',
    num: '10',
    title: 'Content Strategy',
    subsections: [
      {
        id: 'b10_1',
        num: '10.1',
        title: 'Manajemen Konten',
        fields: [
          {
            id: 'content_table',
            label: 'Pengelola Konten',
            type: 'table',
            columns: ['Jenis Konten', 'Pengelola', 'Frekuensi Update', 'Format'],
            defaultRows: [
              ['Data produk', 'Operator (manual edit HTML)', 'Saat ada produk baru', 'HTML hardcode'],
              ['Gambar produk', 'Operator', 'Saat ada produk baru', 'WebP di assets/img/products/'],
              ['Artikel blog', 'Operator (manual edit HTML)', 'Opsional', 'HTML hardcode'],
              ['Info perusahaan', 'Operator (satu kali setup)', 'Jarang', 'HTML hardcode'],
            ]
          }
        ]
      },
      {
        id: 'b10_2',
        num: '10.2',
        title: 'Spesifikasi Aset',
        fields: [
          {
            id: 'assets_table',
            label: 'Spesifikasi File Aset',
            type: 'table',
            columns: ['Jenis', 'Format', 'Ukuran Max', 'Dimensi', 'Naming Convention'],
            defaultRows: [
              ['Gambar produk (utama)', 'WebP', '150 KB', '800x800px', 'product-[id]-main.webp'],
              ['Gambar produk (thumb)', 'WebP', '60 KB', '400x400px', 'product-[id]-thumb-[n].webp'],
              ['Thumbnail artikel', 'WebP', '80 KB', '800x450px', 'article-[slug]-thumb.webp'],
              ['Hero background', 'WebP', '400 KB', '1920x1080px', 'hero-bg.webp'],
            ]
          }
        ]
      },
      {
        id: 'b10_3',
        num: '10.3',
        title: 'Seed Data Awal',
        fields: [
          {
            id: 'seed_table',
            label: 'Data Awal untuk v1.0',
            type: 'table',
            columns: ['Jenis', 'Jumlah Minimum', 'Keterangan'],
            defaultRows: [
              ['Produk', '12 produk', '3 per kategori: Battery, Genset, Panel Listrik, Aksesoris'],
              ['Artikel', '3 artikel', 'Konten edukasi dasar'],
              ['Kategori', '4 kategori', 'Battery, Genset, Panel Listrik, Aksesoris'],
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b11',
    num: '11',
    title: 'Performa & SEO',
    subsections: [
      {
        id: 'b11_perf',
        num: '11.1',
        title: 'Target Performa',
        fields: [
          {
            id: 'perf_table',
            label: 'Lighthouse Targets',
            type: 'table',
            columns: ['Metrik', 'Target'],
            defaultRows: [
              ['Lighthouse Performance Score', '≥ 85'],
              ['First Contentful Paint (FCP)', '≤ 2.0s'],
              ['Largest Contentful Paint (LCP)', '≤ 3.0s'],
              ['Cumulative Layout Shift (CLS)', '≤ 0.1'],
              ['Total Blocking Time (TBT)', '≤ 300ms'],
            ]
          }
        ]
      },
      {
        id: 'b11_opt',
        num: '11.2',
        title: 'Teknik Optimasi',
        fields: [
          {
            id: 'optimizations', label: 'Checklist Optimasi', type: 'repeater', placeholder: 'Semua gambar menggunakan format WebP', itemType: 'text',
            defaultValues: [
              'Semua gambar menggunakan format WebP',
              'Semua gambar di bawah fold: atribut loading="lazy"',
              'Hero image: <link rel="preload" as="image"> di <head>',
              'Font Google: rel="preconnect" ke fonts.googleapis.com',
              'JavaScript: atribut defer pada semua <script>',
            ]
          }
        ]
      },
      {
        id: 'b11_seo',
        num: '11.3',
        title: 'SEO Requirements',
        fields: [
          {
            id: 'seo_reqs', label: 'Checklist SEO', type: 'repeater', placeholder: 'Setiap halaman punya <title> unik, max 60 karakter', itemType: 'text',
            defaultValues: [
              'Setiap halaman: <title> unik, max 60 karakter',
              'Setiap halaman: <meta name="description"> unik, max 160 karakter',
              'Tepat 1 <h1> per halaman',
              'Semua <img> punya alt yang deskriptif',
              'URL format: lowercase, kata dipisah -',
              'Canonical URL di setiap halaman',
            ]
          }
        ]
      },
      {
        id: 'b11_a11y',
        num: '11.4',
        title: 'Aksesibilitas',
        fields: [
          {
            id: 'a11y_reqs', label: 'Checklist Aksesibilitas', type: 'repeater', placeholder: 'Semua interactive element bisa difokus via keyboard', itemType: 'text',
            defaultValues: [
              'Semua interactive element bisa difokus via keyboard (Tab key)',
              'Focus indicator visible (outline tidak di-remove tanpa alternatif)',
              'Color contrast ratio body text ≥ 4.5:1',
              'Semua form input punya <label> yang berasosiasi',
              'Tombol hamburger punya aria-label dan aria-expanded state',
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b12',
    num: '12',
    title: 'Integrasi & Dependensi Eksternal',
    subsections: [
      {
        id: 'b12_int',
        num: '12.1',
        title: 'Third-Party Integrasi',
        fields: [
          {
            id: 'integrations_table',
            label: 'Integrasi',
            type: 'table',
            columns: ['Layanan', 'Tujuan', 'Implementasi', 'Credential Dibutuhkan'],
            defaultRows: [
              ['Google Maps', 'Embed peta di halaman kontak', '<iframe> embed URL', 'Embed code dari Google Maps'],
              ['WhatsApp', 'Floating button + CTA produk', 'wa.me link', 'Nomor WhatsApp bisnis'],
              ['Google Analytics 4', 'Tracking pengunjung', 'Script GA4 di <head>', 'GA4 Measurement ID'],
            ]
          }
        ]
      },
      {
        id: 'b12_const',
        num: '12.2',
        title: 'Constraints & Batasan',
        fields: [
          {
            id: 'constraints_table',
            label: 'Constraints',
            type: 'table',
            columns: ['Constraint', 'Detail'],
            defaultRows: [
              ['Budget', '[Ada batasan anggaran?]'],
              ['Hosting', '[Platform hosting yang sudah ditentukan?]'],
              ['Domain', '[Sudah ada domain?]'],
              ['Aset visual', '[Gambar produk sudah tersedia / perlu dibuat?]'],
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b13',
    num: '13',
    title: 'Open Issues',
    subsections: [
      {
        id: 'b13_issues',
        num: '13.x',
        title: 'Keputusan yang Belum Dibuat',
        hint: 'AI Agent TIDAK boleh mengasumsikan nilai untuk item ini. Semua Open Issues harus diselesaikan sebelum agent mulai coding.',
        fields: [
          {
            id: 'open_issues',
            label: 'Open Issues',
            type: 'table',
            columns: ['ID', 'Isu / Pertanyaan', 'Status', 'Dampak'],
            defaultRows: [
              ['OI-01', 'Platform hosting belum ditentukan', 'Open', 'Mempengaruhi cara form diimplementasikan'],
              ['OI-02', 'Nomor WhatsApp bisnis', 'Open', 'Dibutuhkan untuk semua link wa.me'],
              ['OI-03', 'Backend form inquiry: Formspree / Netlify / simulasi?', 'Open', 'Mempengaruhi implementasi form handler'],
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b14',
    num: '14',
    title: 'Deliverable & Checklist Final',
    subsections: [
      {
        id: 'b14_dod',
        num: '14.1',
        title: 'Definition of Done',
        fields: [
          {
            id: 'dod', label: 'Checklist Done', type: 'repeater', placeholder: 'Kriteria selesai', itemType: 'text',
            defaultValues: [
              'Semua section dari PRD sudah diimplementasikan',
              'Responsive di semua 4 breakpoint yang didefinisikan',
              'Semua state (default, hover, loading, empty, error) sudah diimplementasikan',
              'Tidak ada console.error di browser developer tools',
              'Lighthouse Performance Score ≥ 85',
              'Semua acceptance criteria terpenuhi',
              'Semua gambar punya atribut alt',
              'Semua link internal berfungsi (tidak ada 404)',
            ]
          }
        ]
      },
      {
        id: 'b14_deploy',
        num: '14.2',
        title: 'Checklist Pre-Deploy',
        fields: [
          {
            id: 'predeploy', label: 'Checklist Pre-Deploy', type: 'repeater', placeholder: 'Item checklist', itemType: 'text',
            defaultValues: [
              'Meta title & description semua halaman sudah diset',
              'GA4 script terpasang di semua halaman',
              'Form inquiry sudah ditest — submit berhasil, email diterima',
              'WhatsApp button mengarah ke nomor yang benar',
              'Google Maps embed menggunakan lokasi yang benar',
              'Favicon sudah dipasang',
              'Tidak ada link yang mengarah ke # kecuali yang memang placeholder',
            ]
          }
        ]
      }
    ]
  }
];

/* ─────────────────────────────────────────────────────────
   2. STATE
───────────────────────────────────────────────────────── */
const STATE = {};

function initState() {
  function processField(f) {
    if (f.type === 'repeater') {
      STATE[f.id] = f.defaultValues ? [...f.defaultValues] : [''];
    } else if (f.type === 'table') {
      STATE[f.id] = f.defaultRows ? f.defaultRows.map(r => [...r]) : [f.columns.map(() => '')];
    } else if (f.type === 'colorpalette') {
      f.entries.forEach(e => { STATE[e.id] = e.defaultHex; });
    } else {
      STATE[f.id] = f.placeholder ? '' : '';
    }
  }
  SCHEMA.forEach(sec => sec.subsections.forEach(sub => sub.fields.forEach(processField)));
}

function getVal(id) { return STATE[id] !== undefined ? STATE[id] : ''; }
function setVal(id, val) { STATE[id] = val; }

/* ─────────────────────────────────────────────────────────
   3. RENDER — Build DOM from SCHEMA
───────────────────────────────────────────────────────── */
function renderForm() {
  const container = document.getElementById('prd-form');
  container.innerHTML = '';
  SCHEMA.forEach(sec => {
    container.appendChild(renderSection(sec));
  });
}

function renderSection(sec) {
  const el = document.createElement('div');
  el.className = 'prd-section';
  el.dataset.sectionId = sec.id;

  el.innerHTML = `
    <button class="section-toggle" aria-expanded="false" aria-controls="sb-${sec.id}">
      <span class="section-num">${sec.num}</span>
      <span class="section-title">${sec.title}</span>
      <span class="section-chevron">▾</span>
    </button>
    <div class="section-body" id="sb-${sec.id}"></div>
  `;

  const body = el.querySelector('.section-body');
  sec.subsections.forEach(sub => {
    body.appendChild(renderSubsection(sub));
  });

  const toggle = el.querySelector('.section-toggle');
  toggle.addEventListener('click', () => {
    const open = el.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    if (open) updateTOCActive(sec.id);
  });

  return el;
}

function renderSubsection(sub) {
  const el = document.createElement('div');
  el.className = 'prd-subsection';
  el.dataset.subId = sub.id;

  el.innerHTML = `
    <button class="subsection-toggle" aria-expanded="false" aria-controls="ssb-${sub.id}">
      <span class="subsection-num">${sub.num}</span>
      <span class="subsection-title">${sub.title}</span>
      <span class="subsection-chevron">▾</span>
    </button>
    <div class="subsection-body" id="ssb-${sub.id}"></div>
  `;

  const body = el.querySelector('.subsection-body');
  if (sub.hint) {
    const note = document.createElement('div');
    note.className = 'note-block';
    note.textContent = sub.hint;
    body.appendChild(note);
  }
  sub.fields.forEach(f => body.appendChild(renderField(f)));

  const toggle = el.querySelector('.subsection-toggle');
  toggle.addEventListener('click', () => {
    const open = el.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });

  return el;
}

function renderField(f) {
  const wrap = document.createElement('div');
  wrap.className = 'field-group';

  switch (f.type) {
    case 'text': wrap.appendChild(renderText(f)); break;
    case 'textarea': wrap.appendChild(renderTextarea(f)); break;
    case 'select': wrap.appendChild(renderSelect(f)); break;
    case 'repeater': wrap.appendChild(renderRepeater(f)); break;
    case 'table': wrap.appendChild(renderTable(f)); break;
    case 'colorpalette': wrap.appendChild(renderColorPalette(f)); break;
    case 'filetree': wrap.appendChild(renderFiletree(f)); break;
    default: wrap.appendChild(renderText(f));
  }
  return wrap;
}

function labelEl(f) {
  const l = document.createElement('label');
  l.className = 'field-label';
  l.setAttribute('for', `field-${f.id}`);
  l.textContent = f.label;
  return l;
}

function hintEl(text) {
  const h = document.createElement('div');
  h.className = 'field-hint';
  h.textContent = text;
  return h;
}

/* Text */
function renderText(f) {
  const frag = document.createDocumentFragment();
  frag.appendChild(labelEl(f));
  if (f.hint) frag.appendChild(hintEl(f.hint));
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.id = `field-${f.id}`;
  inp.placeholder = f.placeholder || '';
  inp.value = getVal(f.id);
  inp.addEventListener('input', () => setVal(f.id, inp.value));
  frag.appendChild(inp);
  return frag;
}

/* Textarea */
function renderTextarea(f) {
  const frag = document.createDocumentFragment();
  frag.appendChild(labelEl(f));
  if (f.hint) frag.appendChild(hintEl(f.hint));
  const ta = document.createElement('textarea');
  ta.id = `field-${f.id}`;
  ta.placeholder = f.placeholder || '';
  ta.value = getVal(f.id);
  ta.rows = 6;
  ta.addEventListener('input', () => setVal(f.id, ta.value));
  frag.appendChild(ta);
  return frag;
}

/* Select */
function renderSelect(f) {
  const frag = document.createDocumentFragment();
  frag.appendChild(labelEl(f));
  const sel = document.createElement('select');
  sel.id = `field-${f.id}`;
  f.options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt; o.textContent = opt;
    sel.appendChild(o);
  });
  const saved = getVal(f.id);
  if (saved) sel.value = saved;
  sel.addEventListener('change', () => setVal(f.id, sel.value));
  frag.appendChild(sel);
  return frag;
}

/* Filetree (monospace textarea) */
function renderFiletree(f) {
  const frag = document.createDocumentFragment();
  frag.appendChild(labelEl(f));
  const div = document.createElement('div');
  div.className = 'file-tree-field';
  const ta = document.createElement('textarea');
  ta.id = `field-${f.id}`;
  ta.placeholder = f.placeholder || '';
  ta.value = getVal(f.id) || '';
  ta.rows = 8;
  ta.addEventListener('input', () => setVal(f.id, ta.value));
  div.appendChild(ta);
  frag.appendChild(div);
  return frag;
}

/* Repeater */
function renderRepeater(f) {
  const frag = document.createDocumentFragment();
  frag.appendChild(labelEl(f));
  const list = document.createElement('div');
  list.className = 'repeater-list';
  list.id = `rep-${f.id}`;

  const vals = getVal(f.id);
  if (Array.isArray(vals) && vals.length > 0) {
    vals.forEach((v, i) => list.appendChild(makeRepItem(f, v, i, list)));
  } else {
    list.appendChild(makeRepItem(f, '', 0, list));
  }

  const addBtn = document.createElement('button');
  addBtn.className = 'add-item-btn';
  addBtn.type = 'button';
  addBtn.innerHTML = '+ Tambah Item';
  addBtn.addEventListener('click', () => {
    const arr = getVal(f.id);
    arr.push('');
    setVal(f.id, arr);
    const idx = arr.length - 1;
    const newItem = makeRepItem(f, '', idx, list);
    list.insertBefore(newItem, addBtn);
    newItem.querySelector('input, textarea').focus();
  });

  const container = document.createDocumentFragment();
  container.appendChild(list);
  container.appendChild(addBtn);
  frag.appendChild(container);
  return frag;
}

function makeRepItem(f, val, idx, list) {
  const row = document.createElement('div');
  row.className = 'repeater-item';
  row.dataset.idx = idx;

  let inp;
  if (f.itemType === 'textarea') {
    inp = document.createElement('textarea');
    inp.rows = 3;
  } else {
    inp = document.createElement('input');
    inp.type = 'text';
  }
  inp.placeholder = f.placeholder || '';
  inp.value = val;
  inp.addEventListener('input', () => {
    const arr = getVal(f.id);
    const rowIdx = [...list.children].indexOf(row);
    arr[rowIdx] = inp.value;
    setVal(f.id, arr);
  });

  const del = document.createElement('button');
  del.className = 'remove-btn';
  del.type = 'button';
  del.title = 'Hapus';
  del.innerHTML = '×';
  del.addEventListener('click', () => {
    const arr = getVal(f.id);
    const rowIdx = [...list.children].indexOf(row);
    arr.splice(rowIdx, 1);
    setVal(f.id, arr);
    row.remove();
  });

  row.appendChild(inp);
  row.appendChild(del);
  return row;
}

/* Table field */
function renderTable(f) {
  const frag = document.createDocumentFragment();
  frag.appendChild(labelEl(f));

  const wrapper = document.createElement('div');
  wrapper.className = 'table-field';

  const table = document.createElement('table');
  // Header
  const thead = document.createElement('thead');
  const hrow = document.createElement('tr');
  f.columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    hrow.appendChild(th);
  });
  const thDel = document.createElement('th');
  thDel.style.width = '28px';
  hrow.appendChild(thDel);
  thead.appendChild(hrow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.id = `tbl-${f.id}`;

  const rows = getVal(f.id);
  (Array.isArray(rows) ? rows : f.defaultRows || []).forEach((row, ri) => {
    tbody.appendChild(makeTableRow(f, row, ri, tbody));
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'table-add-row';
  addBtn.innerHTML = '+ Baris';
  addBtn.addEventListener('click', () => {
    const arr = getVal(f.id);
    const newRow = f.columns.map(() => '');
    arr.push(newRow);
    setVal(f.id, arr);
    tbody.appendChild(makeTableRow(f, newRow, arr.length - 1, tbody));
  });
  wrapper.appendChild(addBtn);

  frag.appendChild(wrapper);
  return frag;
}

function makeTableRow(f, rowData, ri, tbody) {
  const tr = document.createElement('tr');
  tr.dataset.ri = ri;

  f.columns.forEach((col, ci) => {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = rowData[ci] || '';
    inp.placeholder = col;
    inp.addEventListener('input', () => {
      const arr = getVal(f.id);
      const trIdx = [...tbody.children].indexOf(tr);
      if (!arr[trIdx]) arr[trIdx] = [];
      arr[trIdx][ci] = inp.value;
      setVal(f.id, arr);
    });
    td.appendChild(inp);
    tr.appendChild(td);
  });

  const tdDel = document.createElement('td');
  tdDel.style.width = '28px';
  const delBtn = document.createElement('button');
  delBtn.className = 'table-del-row';
  delBtn.type = 'button';
  delBtn.innerHTML = '×';
  delBtn.addEventListener('click', () => {
    const arr = getVal(f.id);
    const trIdx = [...tbody.children].indexOf(tr);
    arr.splice(trIdx, 1);
    setVal(f.id, arr);
    tr.remove();
  });
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);

  return tr;
}

/* Color Palette */
function renderColorPalette(f) {
  const frag = document.createDocumentFragment();

  const grid = document.createElement('div');
  grid.className = 'color-palette-grid';

  f.entries.forEach(entry => {
    const cell = document.createElement('div');
    cell.className = 'color-entry';

    const lbl = document.createElement('div');
    lbl.className = 'color-entry-label';
    lbl.textContent = entry.label;
    cell.appendChild(lbl);

    if (entry.usage) {
      const u = document.createElement('div');
      u.className = 'field-hint';
      u.style.marginBottom = '4px';
      u.textContent = entry.usage;
      cell.appendChild(u);
    }

    const colorField = document.createElement('div');
    colorField.className = 'color-field';

    const textInp = document.createElement('input');
    textInp.type = 'text';
    textInp.id = `field-${entry.id}`;
    textInp.value = getVal(entry.id) || entry.defaultHex;
    textInp.placeholder = '#000000';

    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = textInp.value;

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = textInp.value;
    colorPicker.setAttribute('aria-label', `Color picker for ${entry.label}`);

    // Sync: color picker → text + swatch
    colorPicker.addEventListener('input', () => {
      textInp.value = colorPicker.value.toUpperCase();
      swatch.style.background = colorPicker.value;
      setVal(entry.id, colorPicker.value.toUpperCase());
    });

    // Sync: text → picker + swatch
    textInp.addEventListener('input', () => {
      const val = textInp.value.trim();
      setVal(entry.id, val);
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        colorPicker.value = val;
        swatch.style.background = val;
      }
    });

    swatch.appendChild(colorPicker);
    colorField.appendChild(textInp);
    colorField.appendChild(swatch);
    cell.appendChild(colorField);
    grid.appendChild(cell);
  });

  frag.appendChild(grid);
  return frag;
}

/* ─────────────────────────────────────────────────────────
   4. TABLE OF CONTENTS
───────────────────────────────────────────────────────── */
function buildTOC() {
  const nav = document.getElementById('toc');
  nav.innerHTML = '';
  SCHEMA.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'toc-section';

    const secLink = document.createElement('a');
    secLink.className = 'toc-h1';
    secLink.href = '#';
    secLink.dataset.target = sec.id;
    secLink.innerHTML = `<span class="toc-h1-dot"></span>${sec.title}`;
    secLink.addEventListener('click', e => {
      e.preventDefault();
      scrollToSection(sec.id);
    });

    const children = document.createElement('div');
    children.className = 'toc-children';

    sec.subsections.forEach(sub => {
      const subLink = document.createElement('a');
      subLink.className = 'toc-h2';
      subLink.href = '#';
      subLink.dataset.target = sub.id;
      subLink.textContent = (sub.num ? sub.num + ' ' : '') + sub.title;
      subLink.addEventListener('click', e => {
        e.preventDefault();
        scrollToSubsection(sec.id, sub.id);
      });
      children.appendChild(subLink);
    });

    secEl.appendChild(secLink);
    secEl.appendChild(children);
    nav.appendChild(secEl);
  });
}

function scrollToSection(secId) {
  const el = document.querySelector(`[data-section-id="${secId}"]`);
  if (!el) return;
  // Open section if not open
  if (!el.classList.contains('is-open')) {
    el.classList.add('is-open');
    el.querySelector('.section-toggle').setAttribute('aria-expanded', 'true');
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateTOCActive(secId);
  closeSidebar();
}

function scrollToSubsection(secId, subId) {
  const secEl = document.querySelector(`[data-section-id="${secId}"]`);
  if (secEl && !secEl.classList.contains('is-open')) {
    secEl.classList.add('is-open');
    secEl.querySelector('.section-toggle').setAttribute('aria-expanded', 'true');
  }
  const subEl = document.querySelector(`[data-sub-id="${subId}"]`);
  if (subEl) {
    if (!subEl.classList.contains('is-open')) {
      subEl.classList.add('is-open');
      subEl.querySelector('.subsection-toggle').setAttribute('aria-expanded', 'true');
    }
    subEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateTOCActive(secId, subId);
  closeSidebar();
}

function updateTOCActive(secId, subId) {
  document.querySelectorAll('.toc-h1').forEach(el => {
    el.classList.toggle('active', el.dataset.target === secId);
  });
  document.querySelectorAll('.toc-h2').forEach(el => {
    el.classList.toggle('active', subId && el.dataset.target === subId);
  });
}

/* Intersection observer for auto TOC highlight */
function setupScrollSpy() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const secId = entry.target.dataset.sectionId;
        if (secId) updateTOCActive(secId);
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  document.querySelectorAll('[data-section-id]').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────
   5. MARKDOWN OUTPUT GENERATOR
───────────────────────────────────────────────────────── */
function generateMarkdown() {
  const lines = [];

  // Title
  const projTitle = getVal('meta_author') || '[Nama Proyek]';
  lines.push(`# PRD: ${projTitle}`);
  lines.push('');
  lines.push('> **Dokumen ini dibaca oleh AI Agent.**');
  lines.push('> Semua instruksi harus dieksekusi secara literal. Jangan mengasumsikan detail yang tidak tercantum.');
  lines.push('');
  lines.push('---');
  lines.push('');

  // METADATA
  lines.push('## METADATA DOKUMEN');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|---|---|');
  const metaFields = [
    ['Versi PRD', 'meta_versi'],
    ['Tanggal dibuat', 'meta_tanggal'],
    ['Status', 'meta_status'],
    ['Author', 'meta_author'],
    ['Dibaca oleh', 'AI Agent'],
    ['Stack', 'meta_stack'],
  ];
  metaFields.forEach(([label, id]) => {
    const val = id === 'AI Agent' ? 'AI Agent' : (getVal(id) || `[${label}]`);
    lines.push(`| ${label} | ${val} |`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // Each schema section
  SCHEMA.forEach(sec => {
    if (sec.id === 'meta') return; // already done above

    lines.push(`# ${sec.num} — ${sec.title}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    sec.subsections.forEach(sub => {
      if (sub.num) lines.push(`## ${sub.num} ${sub.title}`);
      else lines.push(`## ${sub.title}`);
      lines.push('');

      if (sub.hint) {
        lines.push(`> ${sub.hint}`);
        lines.push('');
      }

      sub.fields.forEach(f => {
        lines.push(...fieldToMarkdown(f));
      });
    });
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*End of PRD*');

  return lines.join('\n');
}

function fieldToMarkdown(f) {
  const out = [];
  const val = getVal(f.id);

  switch (f.type) {
    case 'text':
    case 'select': {
      const v = val || `[${f.label}]`;
      out.push(`**${f.label}:** ${v}`);
      out.push('');
      break;
    }
    case 'textarea': {
      const v = val || `[${f.label} — diisi operator]`;
      out.push(v);
      out.push('');
      break;
    }
    case 'filetree': {
      const v = val || f.placeholder || '';
      out.push('```');
      out.push(v);
      out.push('```');
      out.push('');
      break;
    }
    case 'repeater': {
      const arr = Array.isArray(val) ? val : [];
      arr.forEach((item, i) => {
        if (item && item.trim()) {
          // Check if it's a checklist item (starts with [ ])
          if (f.label.toLowerCase().includes('checklist') || f.label.toLowerCase().includes('dod') || f.id.includes('dod') || f.id.includes('seo') || f.id.includes('a11y') || f.id.includes('opt') || f.id.includes('deploy')) {
            out.push(`- [ ] ${item.trim()}`);
          } else if (f.itemType === 'textarea') {
            out.push(item.trim());
            out.push('');
          } else {
            out.push(`- ${item.trim()}`);
          }
        }
      });
      out.push('');
      break;
    }
    case 'table': {
      const rows = Array.isArray(val) ? val : (f.defaultRows || []);
      if (f.columns && rows.length > 0) {
        out.push('| ' + f.columns.join(' | ') + ' |');
        out.push('|' + f.columns.map(() => '---|').join(''));
        rows.forEach(row => {
          const cells = f.columns.map((_, ci) => (row[ci] || '').trim());
          out.push('| ' + cells.join(' | ') + ' |');
        });
        out.push('');
      }
      break;
    }
    case 'colorpalette': {
      out.push('| Peran | Hex | Digunakan Untuk |');
      out.push('|---|---|---|');
      const paletteDef = SCHEMA
        .flatMap(s => s.subsections)
        .flatMap(sub => sub.fields)
        .find(ff => ff.id === f.id && ff.type === 'colorpalette');
      if (paletteDef) {
        paletteDef.entries.forEach(e => {
          const hex = getVal(e.id) || e.defaultHex;
          out.push(`| ${e.label} | ${hex} | ${e.usage} |`);
        });
      }
      out.push('');
      break;
    }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────
   6. SIMPLE MARKDOWN RENDERER (for preview)
───────────────────────────────────────────────────────── */
function renderMarkdown(md) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // HR
  html = html.replace(/^---$/gm, '<hr>');

  // H1
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // H2
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  // H3
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // Tables — parse pipe tables
  html = html.replace(/((\|.+\|\n?)+)/g, (match) => {
    const rows = match.trim().split('\n').filter(r => r.trim());
    const filtered = rows.filter(r => !r.match(/^\|[\s\-|]+\|$/));
    if (filtered.length < 2) return match;
    let out = '<table>';
    filtered.forEach((row, i) => {
      const cells = row.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      out += '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    });
    out += '</table>';
    return out;
  });

  // Unordered list
  html = html.replace(/(^- .+\n?)+/gm, match => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered list
  html = html.replace(/(^\d+\. .+\n?)+/gm, match => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragraph (remaining lines)
  html = html.replace(/^(?!<[a-z])(.+)$/gm, '<p>$1</p>');

  // Clean empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

/* ─────────────────────────────────────────────────────────
   7. SIDEBAR CONTROL
───────────────────────────────────────────────────────── */
function openSidebar() {
  document.getElementById('sidebar').classList.add('is-open');
  const overlay = document.getElementById('sidebar-overlay');
  overlay.style.display = 'block';
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('is-open');
  overlay.classList.remove('visible');
  setTimeout(() => { overlay.style.display = 'none'; }, 250);
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────
   8. MODAL CONTROL
───────────────────────────────────────────────────────── */
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-backdrop').addEventListener('click', () => closeModal(id), { once: true });
}

function closeModal(id) {
  document.getElementById(id).classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────
   9. TOAST
───────────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
}

/* ─────────────────────────────────────────────────────────
   10. DOWNLOAD
───────────────────────────────────────────────────────── */
function downloadMD() {
  const md = generateMarkdown();
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = (getVal('meta_author') || 'prd').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  a.download = `prd-${slug || 'document'}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ PRD berhasil diunduh');
}

/* ─────────────────────────────────────────────────────────
   11. PREVIEW
───────────────────────────────────────────────────────── */
let previewShowingSource = false;

function openPreview() {
  const md = generateMarkdown();
  const rendered = document.getElementById('preview-rendered');
  const source = document.getElementById('preview-source');
  const sourceCode = document.getElementById('preview-source-code');

  rendered.innerHTML = renderMarkdown(md);
  sourceCode.textContent = md;

  previewShowingSource = false;
  rendered.classList.remove('hidden');
  source.classList.add('hidden');
  document.getElementById('btn-preview-toggle').textContent = 'MD Source';

  openModal('modal-preview');
}

/* ─────────────────────────────────────────────────────────
   12. EXAMPLE PRD
───────────────────────────────────────────────────────── */
const EXAMPLE_PRD = `# PRD: Website Company Profile — PT [Nama Perusahaan] Battery & Electrical Equipment

> **Dokumen ini dibaca oleh AI Agent.**
> Semua instruksi harus dieksekusi secara literal. Jangan mengasumsikan detail yang tidak tercantum.
> Jika ada placeholder seperti \`[NAMA PERUSAHAAN]\`, jangan isi dengan nilai asumsi — tandai sebagai TODO dan lanjutkan ke bagian lain.

---

## METADATA DOKUMEN

| Field | Value |
|---|---|
| Versi PRD | v1.0 |
| Tanggal dibuat | 2025-07-14 |
| Status | Draft |
| Author | [Nama Pemilik Proyek] |
| Dibaca oleh | AI Agent |
| Stack | HTML5, CSS3, Vanilla JS — no framework |

---

# ### BAGIAN 1 — KONTEKS & TUJUAN

## 1.1 Problem Statement

Saat ini perusahaan tidak memiliki kehadiran digital yang terstruktur. Calon pelanggan dari segmen industri (kontraktor listrik, developer properti, pabrik) yang mencari solusi battery dan kelistrikan secara online tidak dapat menemukan informasi produk, spesifikasi teknis, dan kontak perusahaan dalam satu tempat. Hal ini mengakibatkan hilangnya peluang inquiry dari channel digital.

## 1.2 Tujuan Produk

1. Menampilkan katalog produk (battery industri, genset, panel listrik, aksesoris) secara lengkap.
2. Membangun kredibilitas dengan menampilkan sertifikasi, skala distribusi, dan profil perusahaan.
3. Mengkonversi pengunjung menjadi lead melalui form inquiry, tombol WhatsApp, dan CTA konsultasi.
4. Mendukung SEO agar halaman produk dan artikel ditemukan via Google.

## 1.3 Success Metrics (KPI)

| Metrik | Target | Cara Ukur |
|---|---|---|
| Jumlah form inquiry per bulan | ≥ 20 | Google Analytics event |
| Klik tombol WhatsApp per bulan | ≥ 50 | GA4 event tracking |
| Bounce rate halaman produk | ≤ 60% | Google Analytics 4 |
| Lighthouse Performance Score | ≥ 85 | Lighthouse audit |

## 1.4 Non-Goals (Out of Scope v1.0)

- Fitur e-commerce atau keranjang belanja
- Login / akun pengguna
- Live chat selain WhatsApp
- Multi-bahasa (hanya Bahasa Indonesia untuk v1.0)
- Sistem CMS — konten dikelola manual di file HTML

---

# ### BAGIAN 2 — PENGGUNA

## 2.1 Target Pengguna

- Perusahaan industri skala menengah–besar
- Kontraktor listrik
- Developer properti dan konstruksi
- Manajer fasilitas pabrik dan pergudangan

## 2.2 Persona 1: Budi — Kontraktor Listrik

| Field | Detail |
|---|---|
| Peran | Pemilik usaha kontraktor listrik skala menengah |
| Tujuan utama | Menemukan supplier battery dan panel listrik dengan spesifikasi teknis lengkap |
| Pain point | Supplier online sering tidak mencantumkan spesifikasi lengkap |
| Perangkat | Mayoritas mobile (Android) |
| Tingkat literasi digital | Menengah |
| Cara menemukan website | Google search: "battery industri [kota]" |

---

# ### BAGIAN 3 — SCOPE & PRIORITAS

## 3.1 Daftar Fitur & Prioritas

| ID | Fitur | Halaman | Prioritas |
|---|---|---|---|
| F-01 | Home dengan hero, keunggulan, highlight produk | index.html | P1 — MVP |
| F-02 | Tentang dengan profil, visi misi, sertifikasi | tentang.html | P1 — MVP |
| F-03 | Katalog produk dengan filter sidebar | product.html | P1 — MVP |
| F-04 | Detail produk dengan tab | product-detail.html | P1 — MVP |
| F-05 | Kontak dengan form inquiry dan Maps | kontak.html | P1 — MVP |
| F-06 | Floating WhatsApp button (semua halaman) | global | P1 — MVP |
| F-07 | Halaman Artikel | artikel.html | P2 |

---

# ### BAGIAN 4 — DESIGN SYSTEM

## 4.2 Warna

| Peran | Hex | Digunakan Untuk |
|---|---|---|
| Primary (Dark Navy) | #0A1F44 | Background navbar, section gelap, footer |
| Accent (Electric Blue) | #007BFF | CTA button, link aktif, hover state |
| Surface (Abu Industrial) | #F4F6F9 | Background section terang, card background |
| Text Primary | #1A1A1A | Heading, body text |
| Text Secondary | #6B7280 | Caption, label, meta info |
| Danger | #DC2626 | Error state, form validation |
| Success | #16A34A | Konfirmasi, status aktif |

## 4.3 Tipografi

| Peran | Font | Size Desktop | Size Mobile | Weight |
|---|---|---|---|---|
| H1 | Inter | 48px | 32px | 700 |
| H2 | Inter | 36px | 28px | 700 |
| Body | Inter | 16px | 15px | 400 |
| Button | Inter | 14px | 14px | 600 |

---

# ### BAGIAN 13 — OPEN ISSUES

| ID | Isu / Pertanyaan | Status | Dampak |
|---|---|---|---|
| OI-01 | Platform hosting belum ditentukan | Open | Mempengaruhi cara form diimplementasikan |
| OI-02 | Nomor WhatsApp bisnis | Open | Dibutuhkan untuk semua link wa.me |
| OI-03 | Backend form inquiry: Formspree / Netlify / simulasi? | Open | Mempengaruhi implementasi form handler |
| OI-04 | Data produk nyata: sudah tersedia atau pakai placeholder? | Open | Mempengaruhi seed data halaman produk |

---

*End of PRD*`;

function showExample() {
  const el = document.getElementById('example-rendered');
  el.innerHTML = renderMarkdown(EXAMPLE_PRD);
  openModal('modal-example');
}

/* ─────────────────────────────────────────────────────────
   13. EXPAND / COLLAPSE ALL
───────────────────────────────────────────────────────── */
function expandAll() {
  document.querySelectorAll('.prd-section:not(.is-open)').forEach(el => {
    el.classList.add('is-open');
    el.querySelector('.section-toggle').setAttribute('aria-expanded', 'true');
  });
  document.querySelectorAll('.prd-subsection:not(.is-open)').forEach(el => {
    el.classList.add('is-open');
    el.querySelector('.subsection-toggle').setAttribute('aria-expanded', 'true');
  });
}

function collapseAll() {
  document.querySelectorAll('.prd-section.is-open').forEach(el => {
    el.classList.remove('is-open');
    el.querySelector('.section-toggle').setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.prd-subsection.is-open').forEach(el => {
    el.classList.remove('is-open');
    el.querySelector('.subsection-toggle').setAttribute('aria-expanded', 'false');
  });
}

/* ─────────────────────────────────────────────────────────
   14. WIRE EVENTS & INIT
───────────────────────────────────────────────────────── */
function wireEvents() {
  // Mobile sidebar
  document.getElementById('menu-toggle').addEventListener('click', openSidebar);
  document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  // Download buttons
  ['btn-download', 'btn-download-top', 'btn-download-bottom', 'btn-download-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', downloadMD);
  });

  // Preview buttons
  ['btn-preview', 'btn-preview-bottom'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', openPreview);
  });

  // Preview toggle MD source
  document.getElementById('btn-preview-toggle').addEventListener('click', () => {
    previewShowingSource = !previewShowingSource;
    const rendered = document.getElementById('preview-rendered');
    const source = document.getElementById('preview-source');
    const btn = document.getElementById('btn-preview-toggle');
    if (previewShowingSource) {
      rendered.classList.add('hidden');
      source.classList.remove('hidden');
      btn.textContent = 'Rendered';
    } else {
      rendered.classList.remove('hidden');
      source.classList.add('hidden');
      btn.textContent = 'MD Source';
    }
  });

  // Example buttons
  ['btn-example', 'btn-example-top'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', showExample);
  });

  // Use example
  document.getElementById('btn-use-example').addEventListener('click', () => {
    if (confirm('Ini akan mengisi form dengan data contoh PRD Battery. Lanjutkan?')) {
      loadExampleData();
      closeModal('modal-example');
      showToast('✓ Data contoh berhasil dimuat');
    }
  });

  // Expand/collapse all
  document.getElementById('btn-expand-all').addEventListener('click', expandAll);
  document.getElementById('btn-collapse-all').addEventListener('click', collapseAll);

  // Close modals via X button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  // Keyboard: ESC to close modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.is-open').forEach(m => closeModal(m.id));
    }
  });
}

/* Load example data into STATE and re-render */
function loadExampleData() {
  // Metadata
  setVal('meta_versi', 'v1.0');
  setVal('meta_tanggal', '2025-07-14');
  setVal('meta_status', 'Draft');
  setVal('meta_author', 'PT [Nama Perusahaan] Battery');
  setVal('meta_stack', 'HTML5, CSS3, Vanilla JS — no framework');

  // Problem statement
  setVal('problem_statement', 'Saat ini perusahaan tidak memiliki kehadiran digital yang terstruktur. Calon pelanggan dari segmen industri yang mencari solusi battery dan kelistrikan secara online tidak dapat menemukan informasi produk, spesifikasi teknis, dan kontak perusahaan dalam satu tempat. Hal ini mengakibatkan hilangnya peluang inquiry dari channel digital.');

  // Goals
  setVal('goals', [
    'Menampilkan katalog produk secara lengkap dan mudah dieksplorasi.',
    'Membangun kredibilitas dengan menampilkan sertifikasi dan profil perusahaan.',
    'Mengkonversi pengunjung menjadi lead melalui form inquiry dan tombol WhatsApp.',
    'Mendukung SEO agar halaman produk ditemukan via Google.',
  ]);

  // Non goals
  setVal('non_goals', [
    'Fitur e-commerce atau keranjang belanja (tidak ada transaksi online)',
    'Login / akun pengguna',
    'Live chat selain WhatsApp',
    'Multi-bahasa (hanya Bahasa Indonesia untuk v1.0)',
    'Sistem CMS — konten dikelola manual di file HTML',
  ]);

  // KPI
  setVal('kpi_table', [
    ['Jumlah form inquiry per bulan', '≥ 20', 'Notifikasi form / Google Analytics event'],
    ['Klik tombol WhatsApp per bulan', '≥ 50', 'GA4 event tracking pada element #whatsapp-float'],
    ['Bounce rate halaman produk', '≤ 60%', 'Google Analytics 4'],
    ['Lighthouse Performance Score', '≥ 85', 'Lighthouse audit'],
  ]);

  // Target users
  setVal('target_users', [
    'Perusahaan industri skala menengah–besar',
    'Kontraktor listrik',
    'Developer properti dan konstruksi',
    'Manajer fasilitas pabrik dan pergudangan',
  ]);

  // Persona 1
  setVal('p1_nama', 'Budi — Kontraktor Listrik');
  setVal('p1_peran', 'Pemilik usaha kontraktor listrik skala menengah');
  setVal('p1_tujuan', 'Menemukan supplier battery dan panel listrik dengan spesifikasi teknis lengkap dan harga kompetitif untuk berbagai proyek.');
  setVal('p1_pain', 'Supplier online sering tidak mencantumkan spesifikasi lengkap; harus telepon dulu untuk tahu apakah produk sesuai proyek. Website tanpa kontak resmi sulit dipercaya.');
  setVal('p1_device', 'Mobile (mayoritas)');
  setVal('p1_digital', 'Menengah');
  setVal('p1_find', 'Google search: "battery industri [kota]", "supplier genset [kapasitas] kVA"');

  // Colors
  setVal('color_primary', '#0A1F44');
  setVal('color_accent', '#007BFF');
  setVal('color_surface', '#F4F6F9');
  setVal('color_white', '#FFFFFF');
  setVal('color_text', '#1A1A1A');
  setVal('color_text2', '#6B7280');
  setVal('color_danger', '#DC2626');
  setVal('color_success', '#16A34A');
  setVal('color_warning', '#D97706');
  setVal('color_border', '#E5E7EB');

  // Font
  setVal('font_primary', 'Inter (Google Fonts)');
  setVal('font_load', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  // File structure
  setVal('file_structure', '[nama-proyek]/\n├── index.html\n├── tentang.html\n├── product.html\n├── product-detail.html\n├── artikel.html\n└── assets/\n    ├── css/\n    │   ├── main.css\n    │   └── components.css\n    ├── js/\n    │   ├── main.js\n    │   └── product.js\n    └── img/\n        ├── products/\n        ├── company/\n        └── certifications/');

  // Nav structure
  setVal('nav_structure', '[Nama Brand]\n├── Home (index.html)\n├── Tentang (tentang.html)\n├── Produk (product.html)\n│   └── Detail Produk (product-detail.html?id=[X])\n├── Artikel (artikel.html)\n└── Kontak (kontak.html)');

  // Open issues
  setVal('open_issues', [
    ['OI-01', 'Platform hosting belum ditentukan', 'Open', 'Mempengaruhi cara form diimplementasikan'],
    ['OI-02', 'Nomor WhatsApp bisnis', 'Open', 'Dibutuhkan untuk semua link wa.me'],
    ['OI-03', 'Backend form inquiry: Formspree / Netlify / simulasi?', 'Open', 'Mempengaruhi implementasi kontak.js'],
    ['OI-04', 'Data produk nyata: tersedia atau pakai placeholder?', 'Open', 'Mempengaruhi seed data halaman produk'],
    ['OI-05', 'Nama perusahaan dan tahun berdiri', 'Open', 'Dibutuhkan di semua halaman'],
  ]);

  // Re-render form with new data
  renderForm();
  buildTOC();
  setupScrollSpy();
  showToast('✓ Data contoh dimuat');
}

/* ─────────────────────────────────────────────────────────
   15. INIT
───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initState();
  renderForm();
  buildTOC();
  setupScrollSpy();
  wireEvents();

  // Open first section by default
  const firstSection = document.querySelector('.prd-section');
  if (firstSection) {
    firstSection.classList.add('is-open');
    firstSection.querySelector('.section-toggle').setAttribute('aria-expanded', 'true');
    const firstSub = firstSection.querySelector('.prd-subsection');
    if (firstSub) {
      firstSub.classList.add('is-open');
      firstSub.querySelector('.subsection-toggle').setAttribute('aria-expanded', 'true');
    }
  }
});
