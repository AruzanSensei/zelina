# 📷 Polaroid Gallery

Website galeri foto bergaya polaroid dengan login Google, upload multi-foto ke Supabase Storage, dan tampilan masonry yang indah.

---

## 🗂️ Struktur File

```
index.html     ← Halaman galeri utama (publik)
create.html    ← Halaman buat polaroid (butuh login)
worker.js      ← Cloudflare Worker (Google OAuth logic)
wrangler.toml  ← Konfigurasi Wrangler untuk deploy Worker
```

---

## 🚀 Setup Lengkap

### 1. Supabase — Buat Tabel & Storage

Buka **Supabase Dashboard → SQL Editor**, jalankan SQL berikut:

```sql
-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_login  TIMESTAMPTZ DEFAULT now()
);

-- Tabel polaroid_posts
-- image_urls disimpan sebagai JSON string di 1 kolom → scalable, tidak perlu kolom terpisah per foto
CREATE TABLE IF NOT EXISTS polaroid_posts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  location     TEXT,
  date_taken   TEXT,
  tags         TEXT[],
  image_urls   TEXT,        -- contoh: '["https://...","https://..."]'
  image_count  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON polaroid_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON polaroid_posts(created_at DESC);

-- RLS
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE polaroid_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read" ON polaroid_posts FOR SELECT USING (true);
CREATE POLICY "users_public_read" ON users          FOR SELECT USING (true);
CREATE POLICY "service_role_full" ON users          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_posts" ON polaroid_posts FOR ALL USING (auth.role() = 'service_role');
```

Lalu buat Storage Bucket:
- Buka **Storage → New Bucket**
- Name: `polaroid-photos`
- Public: ✅ centang
- Atau via SQL: `INSERT INTO storage.buckets (id, name, public) VALUES ('polaroid-photos', 'polaroid-photos', true);`

---

### 2. Google Cloud Console — OAuth Client

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru (atau pakai yang ada)
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs:
   ```
   https://polaroid-auth.YOUR_SUBDOMAIN.workers.dev/auth/google/callback
   ```
6. Simpan **Client ID** dan **Client Secret**

---

### 3. Cloudflare Worker — Deploy

```bash
# Install Wrangler
npm install -g wrangler

# Login ke Cloudflare
wrangler login

# Masuk ke folder project
cd /path/to/folder

# Set secrets (satu per satu, akan diminta input)
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SUPABASE_URL
# → masukkan: https://cxtmilenczpjetlnqiwo.supabase.co
wrangler secret put SUPABASE_SERVICE_KEY
# → masukkan service role key dari Supabase Settings → API
wrangler secret put APP_ORIGIN
# → masukkan URL frontend kamu, mis: https://yourdomain.com

# Deploy
wrangler deploy
```

Wrangler akan memberikan URL Worker seperti:
```
https://polaroid-auth.yourname.workers.dev
```

---

### 4. Update WORKER_URL di Frontend

Buka `index.html` dan `create.html`, cari baris:
```js
const WORKER_URL = 'https://polaroid-auth.YOUR_SUBDOMAIN.workers.dev';
```
Ganti dengan URL Worker yang didapat dari Wrangler.

---

### 5. Serve Frontend

Kamu bisa host `index.html` dan `create.html` di:
- **Cloudflare Pages**: drag & drop folder ke dashboard
- **Netlify / Vercel**: upload atau connect GitHub repo
- **GitHub Pages**: push ke branch `gh-pages`
- **Local testing**: `npx serve .` atau `python3 -m http.server 8080`

---

## 🎯 Fitur

| Fitur | Keterangan |
|---|---|
| Login Google | Via Cloudflare Worker + OAuth 2.0 |
| Upload multi-foto | Maks. 6 foto per post |
| Kompresi WebP | Auto-kompresi via Canvas API, dimensi mengikuti rasio asli |
| Storage Supabase | Foto disimpan di Storage, URL di-simpan dalam 1 kolom JSON |
| Galeri masonry | Tampilan polaroid dengan rotasi acak & efek hover |
| Lightbox | Klik polaroid untuk lihat full size |
| Cari pengguna | Filter by nama/email di galeri |
| Filter | Semua / Terbaru / Punyaku |
| Tags | Tambah tag ke setiap post |
| Lokasi & tanggal | Metadata opsional per post |

---

## 🗄️ Desain Database

### Kenapa `image_urls` disimpan sebagai JSON string di 1 kolom?

- **Scalable**: bisa simpan 1–100 foto tanpa ubah schema
- **Sederhana**: tidak perlu tabel `post_images` terpisah + JOIN
- **Performa**: satu query cukup untuk ambil semua data post + foto
- **Trade-off**: tidak bisa query by individual URL (tapi tidak dibutuhkan di use case ini)

Contoh nilai kolom `image_urls`:
```json
["https://...supabase.co/.../photo-0.webp","https://...supabase.co/.../photo-2.webp"]
```

---

## 🔑 Supabase Keys

| Key | Digunakan di | Aman di |
|---|---|---|
| `anon` key | Frontend (index.html, create.html) | ✅ Client-side OK (dilindungi RLS) |
| `service_role` key | Worker (worker.js) | ✅ Server-side only, JANGAN di frontend |
