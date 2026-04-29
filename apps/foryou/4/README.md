# 📷 Polaroid Gallery — Panduan Setup Lengkap

## File yang Dihasilkan
```
index.html     ← Halaman utama galeri (publik)
create.html    ← Halaman buat galeri (perlu login)
worker.js      ← Cloudflare Worker (logic server)
schema.sql     ← Setup database Supabase
```

---

## Langkah 1 — Setup Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor** → paste isi `schema.sql` → Run
3. Masuk ke **Storage** → klik **New Bucket**
   - Nama: `product-images`
   - Public: ✅
   - File size limit: `10000000` (10 MB)
4. Catat:
   - `SUPABASE_URL` (dari Settings → API)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_KEY` (service_role key — **RAHASIA, server only!**)

---

## Langkah 2 — Setup Google OAuth

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru → **APIs & Services** → **Credentials**
3. Klik **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR_WORKER.workers.dev/auth/callback`
4. Catat `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`

---

## Langkah 3 — Deploy Cloudflare Worker

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Buat file `wrangler.toml`:
   ```toml
   name = "polaroid-gallery"
   main = "worker.js"
   compatibility_date = "2024-01-01"
   ```

3. Set environment variables (JANGAN taruh di kode):
   ```bash
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put JWT_SECRET          # string acak panjang
   wrangler secret put ALLOWED_ORIGIN      # https://situsmu.com
   wrangler secret put STORAGE_BUCKET      # product-images
   ```

4. Deploy:
   ```bash
   wrangler deploy
   ```
   → Catat URL worker: `https://polaroid-gallery.YOUR_SUBDOMAIN.workers.dev`

---

## Langkah 4 — Update Frontend

Di `index.html` dan `create.html`, ganti:
```js
const WORKER_URL = 'https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev';
```
dengan URL worker yang sudah dicatat.

Di `create.html`, ganti juga:
```js
const SUPABASE_URL = 'https://XXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
```

---

## Langkah 5 — Host Frontend

**Opsi A — Cloudflare Pages (gratis, mudah):**
```bash
# Di folder project:
wrangler pages deploy . --project-name=polaroid-gallery
```
→ URL: `https://polaroid-gallery.pages.dev`

**Opsi B — GitHub Pages:**
Push semua `.html` file ke repo GitHub, aktifkan Pages.

---

## Struktur Database

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | PK |
| google_id | TEXT | ID dari Google OAuth |
| email | TEXT | Email Google |
| display_name | TEXT | Nama tampil |
| avatar_url | TEXT | Foto profil Google |

### Tabel `galleries`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | PK |
| user_email | TEXT | FK ke users.email |
| title | TEXT | Judul galeri |
| description | TEXT | Deskripsi opsional |
| **photo_urls** | **TEXT[]** | **Array URL foto dalam 1 sel** |
| photo_count | INT | Dihitung otomatis dari array |
| created_at | TIMESTAMPTZ | Waktu buat |

> `photo_urls` adalah PostgreSQL **array** → semua URL foto tersimpan dalam **satu kolom**.  
> Contoh isi: `{"https://sb.co/.../0.webp","https://sb.co/.../1.webp","https://sb.co/.../2.webp"}`

---

## API Endpoints (Worker)

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/auth/google` | Mulai OAuth |
| GET | `/auth/callback` | Callback OAuth |
| GET | `/auth/me` | Cek session |
| GET | `/auth/logout` | Logout |
| GET | `/api/galleries` | List galeri (publik) |
| GET | `/api/galleries/:id` | Detail galeri |
| POST | `/api/galleries` | Buat galeri (auth) |
| DELETE | `/api/galleries/:id` | Hapus galeri (owner) |
| POST | `/api/upload` | Upload foto (auth) |
| GET | `/api/users/search?q=` | Cari user by email |
