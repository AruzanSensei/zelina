# Polaroid App — Setup Guide

## File Structure
```
index.html    ← Halaman galeri publik
create.html   ← Halaman buat postingan (butuh login)
worker.js     ← Cloudflare Worker (backend logic)
schema.sql    ← SQL untuk Supabase
```

---

## 1. Supabase Setup

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Buka **SQL Editor** → paste isi `schema.sql` → Run
3. Catat:
   - **Project URL**: `https://bjikmpmsbkcjcxplhcmk.supabase.co`
   - **Service Role Key**: Settings → API → `service_role` (bukan anon!)

---

## 2. Google OAuth Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** → Web application
4. **Authorized redirect URIs**: tambahkan:
   ```
   https://your-worker.your-subdomain.workers.dev/auth/callback
   ```
5. Catat **Client ID** dan **Client Secret**

---

## 3. Cloudflare Worker Setup

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Buat Worker baru:
   ```bash
   wrangler init polaroid-worker
   # Ganti isi worker.js dengan file yang disediakan
   ```

3. Set environment variables (secrets):
   ```bash
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put SESSION_SECRET     # string random 32 karakter
   wrangler secret put ALLOWED_ORIGIN    # https://yoursite.pages.dev
   ```

4. Deploy:
   ```bash
   wrangler deploy
   ```
   Catat URL Worker: `https://polaroid-worker.xxx.workers.dev`

---

## 4. Update Frontend

Di **index.html** dan **create.html**, ganti baris:
```js
const WORKER_URL = 'https://your-worker.your-subdomain.workers.dev';
```
dengan URL Worker kamu yang asli.

---

## 5. Deploy Frontend

**Opsi A — Cloudflare Pages (rekomendasi):**
```bash
# Di folder project
wrangler pages deploy . --project-name polaroid-app
```

**Opsi B — Netlify / Vercel / GitHub Pages:**
Upload `index.html` dan `create.html` ke hosting statis biasa.

---

## Cara Kerja

```
User → index.html (galeri)
     → klik "Masuk Google"
     → Worker /auth/google → redirect ke Google
     → Google → Worker /auth/callback
     → Worker upsert user ke Supabase
     → Worker issue session token (HMAC-SHA256)
     → Redirect ke create.html#token=...
     → Frontend simpan token di localStorage

User → create.html
     → upload foto → Worker /upload → Supabase Storage
     → simpan post → Worker /posts POST → Supabase DB
       image_urls disimpan sebagai TEXT[] (array dalam 1 kolom)

User → index.html
     → GET /posts → Worker → Supabase (join users)
     → cari email → GET /users/search
     → klik "Lihat semua" → filter by email
```

---

## Database Schema Ringkas

| Table   | Kolom penting                                              |
|---------|------------------------------------------------------------|
| `users` | id, google_id, email, name, avatar_url                     |
| `posts` | id, user_id, title, description, **image_urls TEXT[]**, created_at |

`image_urls TEXT[]` — array PostgreSQL, menyimpan banyak URL dalam 1 sel.
