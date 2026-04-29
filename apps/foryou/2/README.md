# 📸 Polaroid App — Panduan Setup Lengkap

Aplikasi galeri foto bergaya polaroid dengan Google OAuth, Supabase, dan Cloudflare Worker.

---

## 🗂️ Struktur File

```
polaroid-app/
├── index.html      ← Halaman galeri utama (bisa diakses semua orang)
├── create.html     ← Halaman upload foto (perlu login Google)
├── worker.js       ← Cloudflare Worker (OAuth + API backend)
├── schema.sql      ← SQL untuk setup Supabase database
└── README.md       ← Panduan ini
```

---

## ⚡ Desain Database

Kolom `image_urls` di tabel `collections` menyimpan **semua URL foto dalam satu kolom** sebagai JSON array string:

```json
["https://...foto1.webp", "https://...foto2.webp", "https://...foto3.webp"]
```

Ini lebih **scalable** dibanding banyak kolom `gambar_1`, `gambar_2`, dst. — tidak ada batasan jumlah foto per koleksi.

---

## 🚀 Langkah Setup

### 1. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com) dan buat project baru
2. Buka **SQL Editor** dan jalankan seluruh isi `schema.sql`
3. Catat:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon key** (untuk frontend)
   - **service_role key** (untuk Worker — jangan ekspos ke frontend!)

### 2. Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih yang sudah ada
3. Navigasi: **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs — tambahkan:
   ```
   https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev/auth/google/callback
   ```
6. Catat **Client ID** dan **Client Secret**

### 3. Deploy Cloudflare Worker

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Buat project Worker baru:
   ```bash
   mkdir polaroid-worker
   cd polaroid-worker
   wrangler init
   ```

3. Salin isi `worker.js` ke `src/index.js` di project Worker

4. Set environment variables via Wrangler:
   ```bash
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put SESSION_SECRET
   wrangler secret put FRONTEND_URL
   ```
   
   - `SESSION_SECRET` → string acak panjang, contoh: `openssl rand -hex 32`
   - `FRONTEND_URL` → URL dimana `index.html` di-host (misal: `https://polaroid.pages.dev`)

5. Deploy:
   ```bash
   wrangler deploy
   ```

6. Catat URL Worker kamu, contoh: `https://polaroid-worker.namaakun.workers.dev`

### 4. Update Frontend

Buka `index.html` dan `create.html`, ganti baris ini di bagian `<script>`:

```javascript
const WORKER_URL = 'https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev';
```

Ganti dengan URL Worker yang sudah kamu deploy.

Pastikan juga `SUPABASE_URL` dan `SUPABASE_KEY` (anon key) sudah benar.

### 5. Host Frontend

Beberapa opsi gratis:
- **Cloudflare Pages**: `wrangler pages deploy .` (paling mudah karena satu ekosistem)
- **GitHub Pages**: Push ke repo dan aktifkan Pages
- **Netlify**: Drag & drop folder ke netlify.com

---

## 🔑 API Endpoints (Cloudflare Worker)

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/auth/google` | — | Redirect ke Google OAuth |
| `GET` | `/auth/google/callback` | — | Callback OAuth, buat session |
| `GET` | `/auth/me` | ✓ Bearer | Info user yang sedang login |
| `GET` | `/collections` | — | List koleksi publik |
| `GET` | `/collections?email=x` | — | Filter koleksi by email |
| `GET` | `/collections/:id` | — | Detail satu koleksi |
| `POST` | `/collections` | ✓ Bearer | Buat koleksi baru |
| `DELETE` | `/collections/:id` | ✓ Bearer | Hapus koleksi (hanya pemilik) |
| `GET` | `/users/search?email=x` | — | Cari user by email |

---

## 📊 Schema Database

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `google_id` | TEXT | ID dari Google |
| `email` | TEXT | Email Google |
| `name` | TEXT | Nama tampilan |
| `avatar_url` | TEXT | URL foto profil Google |
| `last_login` | TIMESTAMPTZ | Waktu login terakhir |
| `created_at` | TIMESTAMPTZ | Waktu daftar |

### Tabel `collections`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT | Custom ID |
| `user_id` | UUID | FK ke users |
| `title` | TEXT | Judul koleksi |
| `caption` | TEXT | Deskripsi / cerita |
| `location` | TEXT | Lokasi momen |
| `moment_date` | TEXT | Tanggal momen |
| `category` | TEXT | travel, food, dll. |
| `visibility` | TEXT | public / private |
| **`image_urls`** | **TEXT** | **JSON array semua URL foto** |
| `photo_count` | INTEGER | Jumlah foto |
| `view_count` | INTEGER | Jumlah view |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu diupdate |

---

## 🎨 Fitur

- ✅ **Polaroid frame** dengan rotasi acak per foto
- ✅ **Aspect ratio asli** gambar (tidak dipaksa persegi)
- ✅ **Kompresi WebP otomatis** via Canvas API (hemat bandwidth)
- ✅ **Google OAuth** via Cloudflare Worker (serverless)
- ✅ **Session JWT** dengan HMAC-SHA256 (7 hari)
- ✅ **Multi-foto per koleksi** dalam satu sel database
- ✅ **Lightbox** dengan strip thumbnail & navigasi keyboard
- ✅ **Cari galeri orang lain** by email
- ✅ **Filter waktu** (hari ini / minggu / bulan)
- ✅ **Masonry layout** responsif
- ✅ **Loading skeleton** saat fetch data
- ✅ **Visibilitas publik/privat** per koleksi
- ✅ **Kategori koleksi** (travel, food, keluarga, dll.)

---

## 🛠️ Troubleshooting

**OAuth redirect tidak cocok:**
→ Pastikan URL di Google Cloud Console persis sama dengan `https://WORKER_URL/auth/google/callback`

**CORS error:**
→ Set `FRONTEND_URL` di Worker secrets dengan URL frontend yang benar (tanpa trailing slash)

**Upload foto gagal:**
→ Cek apakah bucket `collection-images` sudah dibuat di Supabase Storage dan RLS policy sudah benar

**Foto tidak muncul di galeri:**
→ Pastikan bucket bersifat **public** di Supabase Storage settings
