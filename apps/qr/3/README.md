# QR Zanxa — Product Tracking System

Sistem tracking produk berbasis QR Code. Demo MVP dengan HTML, CSS, JS + JSON static.

## Struktur File

```
/
├── index.html          ← Landing page
├── product.html        ← Halaman detail produk
├── style.css           ← Global stylesheet
├── worker.js           ← Cloudflare Worker (routing)
└── data/
    └── product.json    ← Data produk (JSON static)
```

## Cara Deploy

### 1. GitHub Pages

1. Push semua file ke repository GitHub
2. Masuk ke **Settings → Pages**
3. Source: `Deploy from branch` → `main` → `/ (root)`
4. Simpan. URL akan jadi: `https://username.github.io/repo-name`

### 2. Custom Domain (Cloudflare)

1. Di Cloudflare DNS, tambahkan CNAME:
   - Name: `qr`
   - Target: `username.github.io`
2. Di GitHub Pages Settings → Custom domain: `qr.zanxa.site`
3. Centang "Enforce HTTPS"

### 3. Cloudflare Worker

1. Buka Cloudflare Dashboard → **Workers & Pages → Create Worker**
2. Copy-paste isi `worker.js`
3. Deploy
4. Tambahkan Route di **Workers → Routes**:
   - Route: `qr.zanxa.site/product/*`
   - Worker: pilih worker yang baru dibuat

## Flow

```
User scan QR  →  qr.zanxa.site/product/BRG001
                         ↓
              Cloudflare Worker menangkap route
                         ↓
           Redirect ke /product.html?id=BRG001
                         ↓
             JS fetch data/product.json
                         ↓
              Render detail produk
```

## Menambah Produk

Edit `data/product.json`, tambahkan objek baru:

```json
{
  "id": "BRG004",
  "nama_produk": "Nama Mesin",
  "tipe": "Tipe",
  "tahun_pembuatan": 2024,
  "nomor_seri": "SN-000000",
  "lokasi_produksi": "Kota",
  "spesifikasi": "Deskripsi spesifikasi teknis.",
  "status": "aktif",
  "gambar": "URL_gambar_utama",
  "galeri": [
    "URL_foto_1",
    "URL_foto_2"
  ]
}
```

## Generate QR Code

Format URL untuk QR:
```
https://qr.zanxa.site/product/{ID}
```

Generate via QR Server API:
```
https://api.qrserver.com/v1/create-qr-code/?data=https://qr.zanxa.site/product/BRG001&size=300x300
```
