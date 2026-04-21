# PRD — Local Project Todo & Asset Hub
**Version:** 3.0  
**Type:** Frontend Only (No Backend, No Server)  
**Stack:** Vanilla JS + File System Access API  
**Style:** SaaS Dashboard (Planti-inspired — clean card layout, sidebar nav, top stats bar)  
**Mode:** Multi-Root Local File Manager  
**Last Updated:** 2025

---

> **Catatan untuk AI Agent:**  
> Dokumen ini dibagi menjadi **3 Phase** yang masing-masing bisa dikerjakan dalam satu window context.  
> Setiap phase memiliki scope yang jelas, komponen spesifik, dan kriteria selesai (done criteria).  
> Kerjakan phase secara berurutan. Jangan loncat ke phase berikutnya sebelum phase sekarang selesai.

---

# BAGIAN 0 — GAMBARAN BESAR

## 0.1 Tujuan Aplikasi

Web app lokal untuk developer yang berfungsi sebagai **"Control Center" project**:

- Mengelola todo dari banyak project lokal
- Menyimpan prompt & asset per project
- Memberikan overview dashboard dari seluruh workspace
- Berjalan 100% di browser, tanpa server, tanpa database eksternal

## 0.2 Arsitektur File Lokal

Aplikasi membaca struktur folder berikut dari disk lokal:

```
workspace-root/
├── project-a/
│   └── .todo/
│       ├── todo.md         ← daftar task (format markdown checklist)
│       ├── prompts/        ← folder prompt (file .md)
│       └── assets/         ← folder aset (gambar, pdf, dll)
├── project-b/
│   └── .todo/
│       └── todo.md
└── ...
```

> Jika `.todo/` tidak ditemukan di suatu folder, project tetap ditampilkan dengan badge "No todo file".

## 0.3 Struktur File Kode

```
src/
├── index.html
├── app.js              ← entry point, inisialisasi app
├── modules/
│   ├── scanner.js      ← baca & scan folder dengan File System Access API
│   ├── parser.js       ← parse todo.md → task objects
│   ├── renderer.js     ← render UI components (bukan full re-render)
│   ├── storage.js      ← IndexedDB untuk cache & state
│   ├── search.js       ← search engine lokal
│   └── settings.js     ← kelola user preferences
├── styles/
│   ├── main.css
│   ├── components.css
│   └── animations.css
└── assets/
    └── icons/
```

---

# BAGIAN 1 — DESIGN SYSTEM (ACUAN UNTUK SEMUA PHASE)

> Desain mengacu pada referensi UI bergaya **Planti dashboard** — clean card layout, sidebar icon + label, header stats, dan accent warna hijau. Disesuaikan ke konteks developer tool.

## 1.1 Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Background utama |
| `--color-bg-soft` | `#F7F8FA` | Background sidebar, card subtle |
| `--color-bg-card` | `#FFFFFF` | Card background |
| `--color-border` | `#E5E7EB` | Border tipis |
| `--color-primary` | `#111827` | Text utama, heading |
| `--color-secondary` | `#6B7280` | Subtext, placeholder |
| `--color-accent` | `#16A34A` | Aksi utama (hijau, seperti Planti) |
| `--color-accent-soft` | `#DCFCE7` | Hover accent, badge done |
| `--color-hover` | `#F3F4F6` | Hover state item |
| `--color-active` | `#EDE9FE` | Selected state |
| `--color-danger` | `#EF4444` | Priority tinggi, overdue, error |
| `--color-warning` | `#F59E0B` | Warning state |
| `--color-info` | `#3B82F6` | Tag, badge info |

### Status Badge Color

| Status | Background | Text |
|---|---|---|
| Done | `#DCFCE7` | `#16A34A` |
| In Progress | `#DBEAFE` | `#1D4ED8` |
| Overdue | `#FEE2E2` | `#DC2626` |
| Pending | `#F3F4F6` | `#6B7280` |
| High Priority | `#FEE2E2` | `#DC2626` |

## 1.2 Tipografi

```css
font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;

/* Scale */
--text-xs: 11px;
--text-sm: 13px;
--text-base: 14px;
--text-md: 16px;
--text-lg: 18px;
--text-xl: 22px;
--text-2xl: 28px;
line-height: 1.6;
```

## 1.3 Spacing & Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

## 1.4 Shadow

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 12px rgba(0,0,0,0.06);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
```

## 1.5 Animasi

```css
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
--transition-slow: 400ms ease;
```

| Element | Efek |
|---|---|
| Sidebar item hover | `background highlight` + `transition` |
| Card hover | `translateY(-2px)` + shadow naik |
| Checkbox toggle | `scale` + color transition |
| Tab switch | `opacity` fade 200ms |
| Modal open | `scale(0.95→1)` + `opacity(0→1)` |
| Button hover | `scale(1.01)` + slight shadow |
| Toast/notification | `slide-in` dari kanan |

---

# PHASE 1 — LAYOUT UTAMA, SIDEBAR, TOPBAR & DASHBOARD

> **Scope Phase 1:** Buat kerangka HTML+CSS aplikasi, sidebar navigasi, topbar, halaman dashboard (home), halaman empty state, dan sistem settings dasar.  
> **File yang dibuat:** `index.html`, `main.css`, `components.css`, `app.js`, `storage.js`, `settings.js`

---

## P1.1 — Layout Struktur Utama

```
┌─────────────────────────────────────────────────────────┐
│                       TOPBAR                            │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │            MAIN CONTENT AREA                │
│ (fixed)  │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Breakpoint

| Breakpoint | Sidebar | Main |
|---|---|---|
| Desktop (`>1024px`) | 240px fixed | fluid |
| Tablet (`768–1024px`) | 200px fixed | fluid |
| Mobile (`<768px`) | hidden → drawer overlay | full width |

---

## P1.2 — Sidebar

### Anatomi (dari atas ke bawah):

```
┌────────────────────────┐
│  🟢 DevHub   [≡]       │  ← Logo + app name + collapse toggle
├────────────────────────┤
│  WORKSPACE             │  ← section label (uppercase, xs, secondary)
│  > My Projects         │  ← workspace item (active = accent bg)
│  > Client Work         │
│  + Add Workspace       │  ← ghost button
├────────────────────────┤
│  PROJECTS              │  ← section label
│  📁 project-alpha      │  ← project item
│  📁 project-beta       │
│  📁 project-gamma      │
│  + Add Folder          │
├────────────────────────┤
│  ─────────────────     │  ← divider
│  ⚙ Settings           │  ← settings (bottom)
│  ? Help                │  ← help (bottom)
└────────────────────────┘
```

### Spesifikasi Sidebar:

- **Background:** `--color-bg-soft`
- **Border kanan:** `1px solid --color-border`
- Workspace item: padding `8px 12px`, radius `6px`
- **Active state:** background `--color-active`, teks `--color-accent`, font semi-bold
- **Hover state:** background `--color-hover`
- Project item memiliki **badge jumlah task pending** di kanan (contoh: `3`)
- Badge: background `--color-accent`, text putih, radius `full`, `font-size: 11px`
- Section label: `font-size: 11px`, uppercase, letter-spacing `0.08em`, color secondary
- Collapse mode (mobile): sidebar menjadi overlay drawer dari kiri, dengan backdrop `rgba(0,0,0,0.3)`
- Tombol "+ Add Workspace" dan "+ Add Folder": teks hijau, icon `+`, no border, hover bg soft

---

## P1.3 — Topbar

```
┌──────────────────────────────────────────────────────────┐
│ [Project Name / Breadcrumb]    [🔍 Search...]   [⚡ Write] [👤] │
└──────────────────────────────────────────────────────────┘
```

### Spesifikasi Topbar:

- **Height:** 56px
- **Background:** `#FFFFFF`
- **Border bawah:** `1px solid --color-border`
- **Position:** sticky top 0, `z-index: 100`

#### Komponen Topbar (kiri ke kanan):

1. **Breadcrumb:** `Workspace > Project Name` — text secondary + teks primary untuk nama aktif
2. **Search Bar (center):**
   - Width: 320px, max-width: 40%
   - Placeholder: "Search tasks, projects, tags..."
   - Shortcut hint: `⌘K` di kanan input
   - On focus: border menjadi accent, shadow soft
   - Real-time dropdown hasil pencarian (muncul di bawah input)
3. **Write Mode Toggle:**
   - Switch pill UI: `[Read | Write]`
   - OFF (default): abu, label "Read"
   - ON: hijau accent, label "Write Mode"
   - ON state: muncul banner kecil di bawah topbar: "⚠ Write mode enabled — changes will be saved to disk"
4. **User avatar / settings icon** (kanan paling ujung): klik → dropdown menu kecil

---

## P1.4 — Dashboard Page (Home)

> Halaman yang muncul ketika workspace sudah ditambahkan tapi tidak ada project dipilih.  
> Terinspirasi dari Planti dashboard: stats card di atas, recent activity di bawah.

### Layout Dashboard:

```
┌────────────────────────────────────────────────────────┐
│  Welcome back! 👋  [workspace name]                    │
├──────────┬─────────────┬─────────────┬─────────────────┤
│  Total   │  Done Today │  Overdue    │  In Progress    │
│  Tasks   │             │             │                 │
│   42     │     8       │    3        │    12           │
├──────────┴─────────────┴─────────────┴─────────────────┤
│  RECENT PROJECTS                       [View All →]    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │project-a │  │project-b │  │project-c │             │
│  │ 3/10 ✓  │  │ 0/5  ✓  │  │ 7/7 ✓   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
├────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                       [View All →]    │
│  ✅  Completed "Setup CI/CD" — project-alpha  2m ago  │
│  📝  Created "Fix login bug" — project-beta   1h ago  │
│  📁  Added workspace "Client Work"            3h ago  │
└────────────────────────────────────────────────────────┘
```

### Stats Card Spesifikasi:

- 4 card dalam satu row, `flex` atau `grid 4 kolom`
- Setiap card: background putih, border `1px`, radius `12px`, padding `20px`
- Angka: `font-size: 28px`, bold, color primary
- Label: `font-size: 13px`, color secondary
- Icon kecil di pojok kanan atas card (misal: ✅ 🔥 ⚡)
- Hover: shadow naik sedikit

### Recent Projects Card:

- Grid 3 kolom (desktop), 2 (tablet), 1 (mobile)
- Card project: nama project, progress bar, jumlah task done/total
- Progress bar: tinggi 4px, warna accent, background border color
- Klik card → navigasi ke project detail

### Recent Activity:

- List item: icon status + deskripsi aksi + nama project + timestamp relative
- Maksimal tampil 8 item
- Timestamp: "2m ago", "1h ago", "Yesterday"

---

## P1.5 — Empty State Page

> Muncul ketika belum ada workspace yang ditambahkan (first open).

```
┌────────────────────────────────────┐
│                                    │
│         📁 (icon besar, 64px)     │
│                                    │
│    No workspace added yet          │
│    Add a local folder to start     │
│    managing your projects          │
│                                    │
│    [ + Add Workspace Folder ]      │
│                                    │
└────────────────────────────────────┘
```

- Background: `--color-bg-soft`
- Konten center (flexbox column, justify-center, align-center)
- Teks heading: `20px`, semi-bold
- Teks body: `14px`, secondary color
- Tombol: primary button (hijau, solid)

---

## P1.6 — Settings Page

> Halaman settings diakses dari sidebar bawah. Bukan modal, melainkan halaman penuh di main content area.

### Navigasi Settings (tab kiri):

```
[ General ]
[ Appearance ]
[ Workspaces ]
[ Keyboard Shortcuts ]
[ About ]
```

### General Settings:

| Setting | Type | Default |
|---|---|---|
| App language | select (ID / EN) | ID |
| Default view | select (todo/dashboard) | Dashboard |
| Auto-refresh on focus | toggle | ON |
| Show completed tasks | toggle | ON |
| Confirm before write | toggle | ON |

### Appearance Settings:

| Setting | Type | Default |
|---|---|---|
| Theme | toggle (Light / Dark) | Light |
| Font size | slider (12–18px) | 14px |
| Compact mode | toggle | OFF |
| Sidebar width | slider (200–300px) | 240px |
| Show project badges | toggle | ON |

> Dark mode: definisikan CSS variables override di `[data-theme="dark"]`  
> Contoh: `--color-bg: #0F172A`, `--color-bg-soft: #1E293B`, dsb.

### Workspaces Settings:

- List semua workspace yang pernah ditambahkan
- Setiap item: nama workspace, path, tanggal ditambahkan, tombol [Remove]
- Tombol "+ Add Workspace" di atas list
- Konfirmasi sebelum remove (modal kecil)

### Keyboard Shortcuts:

| Shortcut | Aksi |
|---|---|
| `⌘K` / `Ctrl+K` | Buka search |
| `⌘N` / `Ctrl+N` | Tambah task baru |
| `⌘W` | Toggle write mode |
| `⌘B` | Toggle sidebar |
| `ESC` | Tutup modal/search |
| `↑ ↓` | Navigasi search results |

### About:

- App name, versi, deskripsi singkat
- Link ke README atau GitHub (jika ada)

---

## P1.7 — Sistem Storage & State (storage.js)

```javascript
// IndexedDB schema
DB_NAME: 'devhub-local'
VERSION: 1

stores:
  - workspaces: { id, name, path, handle, addedAt }
  - projects:   { id, workspaceId, name, path, handle, lastScanned }
  - cache:      { projectId, tasks, prompts, assets, scannedAt }
  - settings:   { key, value }
  - activity:   { id, type, description, projectId, timestamp }
```

**API yang diekspos:**

```javascript
storage.saveWorkspace(handle)
storage.getWorkspaces()
storage.removeWorkspace(id)
storage.saveProjectCache(projectId, data)
storage.getProjectCache(projectId)
storage.saveSetting(key, value)
storage.getSetting(key)
storage.logActivity(type, description, projectId)
storage.getRecentActivity(limit)
```

---

## P1.8 — Done Criteria Phase 1

- [ ] HTML layout dengan sidebar + topbar + main content area terbuat dan responsive
- [ ] Sidebar menampilkan workspace list, project list, dan tombol add
- [ ] Topbar dengan search bar (UI only, belum fungsional) dan write mode toggle
- [ ] Dashboard home page dengan stats card (data mock) dan recent activity (data mock)
- [ ] Empty state page muncul ketika belum ada workspace
- [ ] Settings page dengan semua tab dan form input
- [ ] Dark/light mode toggle berfungsi
- [ ] `storage.js` dengan IndexedDB bisa simpan dan baca workspace
- [ ] Animasi sidebar hover, card hover, dan tab switch berfungsi
- [ ] Aplikasi bisa dijalankan hanya dengan membuka `index.html` di browser

---

# PHASE 2 — FILE SYSTEM, SCANNER, PARSER & PROJECT DETAIL VIEW

> **Scope Phase 2:** Implementasi integrasi File System Access API, scanning folder, parsing todo.md, dan tampilan detail project dengan tiga tab (Todo, Prompt, Assets).  
> **File yang dibuat/diedit:** `scanner.js`, `parser.js`, `renderer.js`, `app.js` (update)

---

## P2.1 — Add Workspace Flow

### Flow lengkap:

```
User klik "+ Add Workspace"
        ↓
window.showDirectoryPicker() dipanggil
        ↓
User pilih folder root workspace
        ↓
scanner.scanWorkspace(handle) dipanggil
        ↓
Iterasi semua subfolder
        ↓
Deteksi subfolder yang punya .todo/ di dalamnya → catat sebagai "project"
        ↓
Simpan ke IndexedDB (workspaces + projects)
        ↓
Update sidebar list
        ↓
Navigate ke Dashboard
```

### Error Handling Add Workspace:

| Error | Tampilan |
|---|---|
| User cancel picker | Tidak ada aksi, tutup |
| Permission denied | Toast error: "Folder access denied. Please try again." |
| Folder kosong / tidak ada .todo | Toast warning + tetap tampil di sidebar dengan badge "No todo" |

---

## P2.2 — Scanner (scanner.js)

```javascript
// Fungsi utama
async scanWorkspace(dirHandle) → { projects: [] }
async scanProject(dirHandle) → { name, path, hasTodo, hasPrompts, hasAssets }
async readTodoFile(projectHandle) → string (raw markdown)
async listPromptFiles(projectHandle) → [{ name, handle }]
async listAssetFiles(projectHandle) → [{ name, size, type, handle }]
async refreshProject(projectId) → updated project data
```

**Aturan scan:**

- Scan hanya 2 level ke dalam (workspace → project), tidak rekursif lebih dalam
- `.todo/` folder: deteksi case-insensitive
- Jika `todo.md` tidak ada di `.todo/`: project tetap muncul, tab Todo tampilkan empty state
- Asset yang didukung: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.pdf`, `.mp4`, `.zip`, `.md`
- Refresh otomatis ketika window mendapat fokus (`visibilitychange` event), dengan debounce 2 detik

---

## P2.3 — Parser (parser.js)

### Format todo.md yang didukung:

```markdown
# Section Name

- [ ] Task yang belum selesai
- [x] Task yang sudah selesai
- [ ] Task dengan tag #bug #backend
- [ ] Task dengan due date 📅 2025-12-31
- [ ] High priority task ⚡
- [ ] !high Task dengan priority marker
```

### Output parse (task object):

```javascript
{
  id: string,           // hash dari content + line number
  text: string,         // teks bersih tanpa tag/marker
  done: boolean,
  section: string,      // nama section (#heading terdekat di atas)
  tags: string[],       // ['bug', 'backend']
  dueDate: Date | null,
  priority: 'high' | 'medium' | 'low',  // default medium
  isOverdue: boolean,   // true jika dueDate < today && !done
  lineNumber: number,   // untuk write back ke file
  rawLine: string       // raw markdown line
}
```

### Parsing Rules:

- Heading `#` → menjadi section group
- Heading `##` → sub-section (nested di bawah section parent)
- `- [ ]` → task pending
- `- [x]` atau `- [X]` → task done
- `#tagname` dalam teks → extract sebagai tag (tanpa `#` heading)
- `📅 YYYY-MM-DD` atau `due: YYYY-MM-DD` → parse sebagai due date
- `⚡` atau `!high` di awal/akhir → priority high
- `!low` → priority low

---

## P2.4 — Project Detail View

> Tampil di main content area ketika user klik project di sidebar.

### Header Project:

```
┌──────────────────────────────────────────────────────┐
│  📁 project-alpha                        [🔄 Refresh] │
│  /workspace/client-work/project-alpha               │
│  ─────────────────────────────────────────────────  │
│  Progress: ████████░░ 8/10 tasks done    (80%)      │
│                                                      │
│  [ Todo (8) ]  [ Prompts (3) ]  [ Assets (12) ]     │
└──────────────────────────────────────────────────────┘
```

**Spesifikasi Header:**

- Nama project: `font-size: 22px`, bold
- Path: `font-size: 12px`, secondary color, mono font
- Progress bar: height `6px`, warna accent, label `X/Y tasks done (Z%)`
- Tombol Refresh: icon only, tooltip "Re-scan project", hover accent

---

## P2.5 — Tab: TODO

### Layout Todo View:

```
[ Write Mode OFF ]  [ + Add Task ]  [ Filter ▾ ]  [ Sort ▾ ]

──── SECTION NAME ────────────────────────────────────

☐  Task teks di sini                #tag    📅 Dec 31
☐  High priority task ⚡             #bug              ← border-left merah
✅  Completed task                   #done              ← strikethrough, opacity 0.6

──── ANOTHER SECTION ─────────────────────────────────

☐  Another task
```

### Task Item Spesifikasi:

```
[Checkbox]  [Task Text]  [Tags]  [Due Date]  [Priority Icon]
```

- **Checkbox:** 16x16px, rounded square, border `--color-border`
  - Read mode: `pointer-events: none`, visual saja
  - Write mode: klikable, toggle done state
  - Checked: background accent hijau, icon ✓ putih
- **Task Text:**
  - Normal: `font-size: 14px`, color primary
  - Done: `text-decoration: line-through`, `opacity: 0.55`
  - Overdue: color danger merah
- **Priority indicator:**
  - High: `border-left: 3px solid --color-danger`
  - Medium: tidak ada border
  - Low: `border-left: 3px solid --color-border`
- **Tags:** badge kecil, background `#EFF6FF`, teks `#1D4ED8`, radius full
- **Due date:** text secondary, `font-size: 12px`
  - Jika overdue: teks merah + icon ⚠

### Filter Options:

- All / Pending / Done / Overdue / High Priority
- Filter state disimpan per-project di localStorage

### Sort Options:

- Default (urutan file) / Due Date / Priority / Alphabetical

### Section Group:

- Render sebagai sub-header: garis horizontal + teks section name
- Section bisa di-collapse (klik toggle ▾/▸)
- State collapse disimpan di sessionStorage

### Empty State Todo:

- Jika tidak ada task: ilustrasi kecil + "No tasks yet" + tombol "Create todo.md" (write mode only)

### Add Task (Write Mode):

- Inline input muncul di atas task list
- Tekan `Enter` → simpan
- Tekan `Escape` → batal
- Input: teks task, select section, select priority, date picker

---

## P2.6 — Tab: PROMPTS

### Layout Prompt View:

```
┌─────────────────┬─────────────────────────────────────┐
│  PROMPT FILES   │  PROMPT CONTENT                     │
│                 │                                     │
│ > system.md     │  # System Prompt                    │
│   context.md    │                                     │
│   refactor.md   │  You are an expert developer...     │
│                 │  [Copy to Clipboard]                │
└─────────────────┴─────────────────────────────────────┘
```

**Spesifikasi:**

- Sidebar kiri: 200px, list file `.md` dalam `.todo/prompts/`
- Item aktif: background active, teks accent
- Klik file → render kontennya di kanan
- Konten: render sebagai markdown (gunakan `marked.js` atau manual simple parser)
  - Support: heading, bold, italic, code block, code inline, list
- Tombol "Copy" di pojok kanan atas konten area
  - Klik: copy raw markdown ke clipboard, toast "Copied!"
- Write mode: tombol "Edit" muncul → inline markdown editor (textarea)
- Empty state: "No prompt files found" + tombol "Create prompt.md" (write mode only)

---

## P2.7 — Tab: ASSETS

### Layout Asset View:

```
[🔍 Filter by type: All ▾]  [Grid ▾ / List]

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ [preview]│ │ [preview]│ │ [preview]│ │ [preview]│
│ logo.png │ │ bg.jpg   │ │ doc.pdf  │ │ data.zip │
│ 24 KB    │ │ 128 KB   │ │ 2.3 MB   │ │ 450 KB   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Grid Spesifikasi:**

| Breakpoint | Kolom |
|---|---|
| Desktop | 4 |
| Tablet | 3 |
| Mobile | 2 |

**Asset Card:**

- Background putih, border `1px`, radius `8px`, padding `12px`
- Thumbnail area: 120px height
  - Gambar (jpg/png/gif/svg/webp): preview langsung
  - PDF: icon PDF besar dengan warna merah
  - Video: icon play besar
  - Zip/archive: icon compress
  - Lainnya: icon file generic dengan ekstensi
- Filename: truncate jika panjang, max 2 baris
- File size: secondary, `font-size: 12px`
- Hover: `translateY(-3px)`, shadow naik, scale `1.01`

**Asset Modal Preview (klik card):**

- Modal overlay full screen (backdrop blur)
- Gambar: ditampilkan langsung, bisa zoom
- PDF: buka di iframe atau link download
- Video: `<video>` tag dengan kontrol
- Lainnya: info nama file + tombol "Open File" (jika browser support)
- Tombol close di pojok kanan atas modal

**Filter Type:**

- All / Images / PDF / Video / Archive / Other

---

## P2.8 — Write Mode Detail

### Aktivasi:

1. User klik toggle "Write" di topbar
2. Muncul konfirmasi modal: "Enable write mode? Changes will be saved directly to your files."
3. Tombol: [Cancel] [Enable Write Mode]
4. Jika diaktifkan: banner kuning muncul di bawah topbar

### Backup Otomatis:

- Sebelum write pertama per session: buat backup `todo.md` → `todo.md.bak`
- Backup disimpan di folder `.todo/` yang sama
- Jika backup sudah ada: skip (tidak overwrite backup lama)

### Operasi Write:

| Aksi | File yang ditulis |
|---|---|
| Toggle task checkbox | `todo.md` — update baris yang sesuai |
| Add task | `todo.md` — tambah baris baru di section |
| Edit prompt | `.todo/prompts/[filename].md` |

### Re-read after Write:

- Setelah setiap write, re-parse file dan re-render section yang berubah (bukan full re-render)

---

## P2.9 — Done Criteria Phase 2

- [ ] Tombol "+ Add Workspace" memanggil `showDirectoryPicker()` dan menyimpan handle
- [ ] Sidebar menampilkan workspace dan project dari IndexedDB
- [ ] `scanner.js` scan folder dan deteksi project dengan `.todo/`
- [ ] `parser.js` parse `todo.md` menjadi task object dengan semua field
- [ ] Project detail view menampilkan header dengan progress bar
- [ ] Tab Todo menampilkan task list dengan grouping per section
- [ ] Visual state task (done, overdue, priority) berfungsi
- [ ] Filter dan sort task berfungsi
- [ ] Tab Prompts menampilkan file list dan render markdown
- [ ] Tab Assets menampilkan grid dengan thumbnail dan modal preview
- [ ] Write mode: toggle, konfirmasi, banner, backup, dan toggle checkbox berfungsi
- [ ] Add task (write mode) berfungsi dan menyimpan ke file
- [ ] Auto-refresh ketika window refocus

---

# PHASE 3 — SEARCH, NOTIFICATIONS, ACTIVITY LOG & POLISH

> **Scope Phase 3:** Search system, real-time search dropdown, global activity log, notifikasi/toast, polish animasi, error handling menyeluruh, dan optimasi performa.  
> **File yang dibuat/diedit:** `search.js`, `renderer.js` (polish), `app.js` (event handling), `animations.css` (polish)

---

## P3.1 — Search System

### UI Search:

- Input di topbar, width `320px`
- Placeholder: "Search tasks, projects, tags... (⌘K)"
- Shortcut `⌘K` / `Ctrl+K`: fokus ke input
- On focus: border accent, shadow soft

### Search Dropdown:

```
┌────────────────────────────────────────┐
│  🔍 "fix login"                        │
├────────────────────────────────────────┤
│  TASKS                                 │
│  ☐  Fix login bug  ← project-beta     │
│  ☐  Fix login UI   ← project-alpha    │
├────────────────────────────────────────┤
│  PROJECTS                              │
│  📁 project-login-service              │
├────────────────────────────────────────┤
│  TAGS                                  │
│  🏷  #login  (3 tasks)                 │
└────────────────────────────────────────┘
```

**Spesifikasi Dropdown:**

- Muncul tepat di bawah input, width sama dengan input (min 400px)
- Max height: `480px`, scrollable
- Section headers: uppercase, `11px`, secondary
- Result item: hover state, klik → navigasi ke project/task
- Task result: tampilkan nama task + nama project asal
- Highlight kata yang cocok dengan query (bold)
- Max 5 hasil per kategori
- "View all results →" di bawah setiap kategori jika lebih dari 5
- ESC: tutup dropdown, kosongkan input
- ↑↓ arrow: navigasi dalam dropdown
- Enter: buka item yang terfokus

### Search Engine (search.js):

```javascript
// Fungsi
search.query(text) → { tasks: [], projects: [], tags: [] }
search.buildIndex(allProjects) → void  // dipanggil setelah scan
search.updateIndex(projectId, tasks) → void  // dipanggil setelah refresh

// Algoritma
- Case-insensitive matching
- Substring match untuk task text
- Exact match untuk tags (tanpa #)
- Prefix match untuk project name
- Debounce 200ms sebelum trigger search
- Cache hasil search terakhir per query string
```

---

## P3.2 — Toast Notifications

### Jenis Toast:

| Type | Warna | Icon |
|---|---|---|
| Success | Hijau accent | ✅ |
| Error | Merah | ❌ |
| Warning | Kuning | ⚠ |
| Info | Biru | ℹ |

### Spesifikasi Toast:

- Posisi: pojok kanan bawah, `fixed`, `z-index: 9999`
- Stack: maks 4 toast sekaligus, yang baru muncul di bawah
- Animasi masuk: `slide-in` dari kanan (300ms ease)
- Animasi keluar: `fade-out + slide-right` (200ms ease)
- Auto-dismiss: 4 detik (error: 6 detik)
- Bisa di-dismiss manual (klik × atau swipe kanan)
- Width: 320px

### Toast API:

```javascript
toast.success('Task completed!')
toast.error('Failed to save file. Check permissions.')
toast.warning('Write mode enabled. Be careful.')
toast.info('Project refreshed — 12 tasks found.')
toast.show({ message, type, duration, action: { label, onClick } })
```

---

## P3.3 — Activity Log

### Halaman Activity Log:

- Diakses via sidebar (icon 📋) atau link dari dashboard
- Menampilkan semua aktivitas pengguna dengan filter dan pagination

### Layout Activity Log:

```
┌───────────────────────────────────────────────────────┐
│  Activity Log                                         │
│  [Filter: All ▾]  [Project: All ▾]  [Clear Log]      │
├───────────────────────────────────────────────────────┤
│  TODAY                                                │
│  ✅  Completed "Setup CI/CD"   project-alpha  14:32  │
│  📝  Added "Fix login bug"     project-beta   13:10  │
│  ─────────────────────────────────────────────────── │
│  YESTERDAY                                            │
│  📁  Added workspace "Client Work"            09:01  │
│  🔄  Refreshed project-gamma                  08:45  │
└───────────────────────────────────────────────────────┘
```

### Event types yang dilog:

| Event | Icon | Deskripsi |
|---|---|---|
| `task_complete` | ✅ | Task di-centang done |
| `task_add` | 📝 | Task baru ditambahkan |
| `task_edit` | ✏ | Task diedit |
| `workspace_add` | 📁 | Workspace baru ditambahkan |
| `workspace_remove` | 🗑 | Workspace dihapus |
| `project_refresh` | 🔄 | Project di-refresh manual |
| `prompt_copy` | 📋 | Prompt di-copy ke clipboard |

### Filter Activity:

- Filter type: All / Tasks / Workspace / Projects
- Filter project: dropdown semua project
- Date range picker (opsional, nice-to-have)

---

## P3.4 — Error Handling Menyeluruh

### Permission Handling:

```javascript
// Sebelum setiap operasi file, cek ulang permission
const perm = await handle.queryPermission({ mode: 'readwrite' })
if (perm !== 'granted') {
  // Tampilkan modal re-authorization
  showReAuthModal(projectName)
}
```

### Re-Authorization Modal:

```
┌──────────────────────────────────────┐
│  🔒 Permission Required              │
│                                      │
│  Access to "project-alpha" was lost. │
│  Please re-grant permission to       │
│  continue working with this project. │
│                                      │
│  [Cancel]  [Re-grant Permission]     │
└──────────────────────────────────────┘
```

### Error States per View:

| Situasi | Tampilan |
|---|---|
| File gagal dibaca | Banner kuning di dalam tab: "Could not read todo.md" + Retry button |
| Parse error | Warning kecil di atas task list: "Some tasks couldn't be parsed" |
| Write gagal | Toast error + file tidak diubah |
| Asset gagal diload | Placeholder abu dengan ikon broken + nama file |

---

## P3.5 — Keyboard Navigation

Semua shortcut harus bekerja tanpa konflik dengan shortcut browser.

```
⌘K / Ctrl+K     → Fokus search
⌘N / Ctrl+N     → Add task baru (jika project terbuka, write mode)
⌘W / Ctrl+W     → Toggle write mode (ganti: bukan tutup tab)
⌘B / Ctrl+B     → Toggle sidebar
⌘R / Ctrl+R     → Refresh project aktif
ESC             → Tutup modal / dropdown / search
Tab             → Navigasi antar elemen fokus
Space           → Toggle checkbox task (ketika task terfokus, write mode)
↑ ↓             → Navigasi search result, navigasi task list
Enter           → Pilih item terfokus, konfirmasi aksi
```

---

## P3.6 — Performance & Optimasi

### Lazy Loading:

- Project di sidebar: hanya load task count, bukan full data
- Full data di-load ketika project diklik
- Data di-cache ke IndexedDB, re-fetch hanya jika ada perubahan

### Debounce & Throttle:

```javascript
// Debounce
search input: 200ms
auto-refresh on focus: 2000ms
resize handler: 100ms

// Throttle  
scroll handler: 16ms (60fps)
```

### DOM Rendering:

- **Jangan full re-render DOM** ketika update task
- Gunakan `getElementById` dan update node spesifik
- Gunakan `DocumentFragment` untuk render list baru
- Gunakan `IntersectionObserver` untuk lazy-load thumbnail asset

### Cache Strategy:

```
Scan hasil: cache di IndexedDB, TTL = sampai refresh manual atau window refocus
Search index: cache di memory (hilang saat refresh page)
Settings: localStorage (cepat, sinkronus)
```

---

## P3.7 — Responsiveness Polish

### Mobile Sidebar Drawer:

- Hamburger button `☰` muncul di topbar kiri (mobile)
- Klik: sidebar slide in dari kiri dengan animasi (300ms ease)
- Backdrop: `rgba(0,0,0,0.3)`, klik untuk tutup
- Swipe kiri untuk tutup (touch event)

### Mobile Topbar:

- Search bar: kecil di mobile, klik untuk expand ke full-width overlay
- Write toggle: tetap visible

### Mobile Todo:

- Task item: layout lebih lebar, checkbox lebih besar (touch friendly, min 44px tap target)
- Tags: scroll horizontal jika overflow

---

## P3.8 — Final Polish Checklist

### Animasi:

- [ ] Sidebar item hover: highlight `150ms`
- [ ] Card hover: `translateY(-2px)` + shadow `250ms`
- [ ] Checkbox toggle: scale + color `200ms`
- [ ] Tab switch: fade `200ms`
- [ ] Modal: scale + fade `300ms`
- [ ] Toast: slide-in `300ms`, slide-out `200ms`
- [ ] Sidebar drawer (mobile): slide `300ms`
- [ ] Search dropdown: fade-in `150ms`
- [ ] Progress bar: animate on load (`width` dari 0 ke nilai aktual)

### Micro-interactions:

- [ ] Checkbox setelah di-check: brief green pulse
- [ ] Copy button: berubah jadi "Copied!" selama 2 detik
- [ ] Refresh button: spin animasi selama loading
- [ ] Add task: input slide-down `200ms`
- [ ] Task collapse section: smooth height transition

### Accessibility:

- [ ] Semua button memiliki `aria-label`
- [ ] Checkbox menggunakan `role="checkbox"` dan `aria-checked`
- [ ] Modal menggunakan `role="dialog"` dan `aria-labelledby`
- [ ] Focus trap dalam modal aktif
- [ ] Tab key navigasi berfungsi di semua komponen
- [ ] Color contrast ratio >= 4.5:1 untuk semua teks

---

## P3.9 — Done Criteria Phase 3

- [ ] Search real-time berfungsi dengan dropdown hasil
- [ ] Keyboard shortcut `⌘K` membuka search
- [ ] Navigasi keyboard dalam search dropdown (↑↓ + Enter) berfungsi
- [ ] Toast notification berfungsi untuk semua event
- [ ] Activity log menampilkan histori aktivitas dengan filter
- [ ] Re-authorization modal muncul ketika permission hilang
- [ ] Error state per view tampil dengan pesan yang jelas dan retry option
- [ ] Semua keyboard shortcut berfungsi tanpa konflik
- [ ] Performance: tidak ada full DOM re-render untuk update partial
- [ ] Mobile: sidebar drawer berfungsi dengan swipe gesture
- [ ] Semua animasi dari checklist berjalan smooth
- [ ] Accessibility: keyboard navigation dan ARIA label lengkap
- [ ] Aplikasi berjalan tanpa error di Chrome, Edge, dan Brave (browser yang support File System Access API)

---

# LAMPIRAN

## Browser Support

| Browser | Support |
|---|---|
| Chrome 86+ | ✅ Full support |
| Edge 86+ | ✅ Full support |
| Brave | ✅ Full support |
| Firefox | ❌ File System Access API tidak didukung — tampilkan pesan error saat buka |
| Safari | ⚠ Partial (File System Access API eksperimental) |

**Handling browser tidak support:**

Saat app pertama kali dibuka, cek `'showDirectoryPicker' in window`. Jika tidak ada, tampilkan:

```
┌─────────────────────────────────────────────────────┐
│  ⚠ Browser Not Supported                           │
│                                                     │
│  This app requires the File System Access API.      │
│  Please use Chrome, Edge, or Brave (v86+).          │
│                                                     │
│  [Download Chrome]  [Download Edge]                 │
└─────────────────────────────────────────────────────┘
```

## External Dependencies

| Library | Versi | Kegunaan |
|---|---|---|
| `marked.js` | v9+ | Parse markdown untuk Prompt view |
| `Inter` (Google Fonts) | — | Tipografi |

Tidak ada framework JS (Vanilla only). Tidak ada build tool yang wajib.

## Contoh todo.md yang valid

```markdown
# Development

- [ ] Setup project structure ⚡
- [x] Initialize git repo
- [ ] Create README.md #docs 📅 2025-01-15

## Backend

- [ ] Build REST API #backend #api
- [ ] Connect database #backend

# Bugs

- [ ] Fix login redirect #bug !high
- [x] Fix typo on homepage #bug
```

---

*PRD v3.0 — Dibuat untuk pengerjaan berbasis AI Agent dengan 3 phase context window*
