# MotoPrima – Website Dealer Mobil
**Clean Futuristic Style** | HTML · CSS · JavaScript

---

## 📁 Struktur File

```
dealer-web/
├── index.html          → Halaman Home
├── tentang.html        → Halaman Tentang Kami
├── produk.html         → Halaman Produk (Accordion)
├── produk-detail.html  → Halaman Detail Produk
├── dokumentasi.html    → Halaman Galeri Dokumentasi
├── kontak.html         → Halaman Kontak
└── assets/
    ├── css/
    │   └── style.css   → Stylesheet utama
    ├── js/
    │   ├── main.js     → JavaScript utama
    │   └── components.js → Komponen bersama
    └── img/            → Letakkan foto-foto di sini
```

---

## 🚀 Cara Pakai

1. **Buka langsung**: Double-click `index.html` di browser
2. **Atau gunakan Live Server** (VS Code extension) untuk hasil terbaik

---

## 🖼️ Menambahkan Foto

Letakkan foto mobil dan showroom ke folder `assets/img/`.

Lalu ganti elemen placeholder di HTML dengan tag `<img>`:

```html
<!-- Sebelum (placeholder) -->
<div class="product-img-placeholder">🚙</div>

<!-- Sesudah (dengan foto asli) -->
<img src="assets/img/fortuner-2024.webp" alt="Toyota Fortuner" loading="lazy">
```

**Format foto yang direkomendasikan:**
- Format: `.webp` (terbaik) atau `.jpg`
- Ukuran: max 200KB per foto
- Resolusi: 800×500px untuk card produk

---

## 🗺️ Embed Google Maps

Di file `kontak.html`, cari bagian `maps-placeholder` dan ganti dengan:

```html
<iframe 
  src="https://www.google.com/maps/embed?pb=..." 
  width="100%" 
  height="320" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy">
</iframe>
```

---

## 📱 WhatsApp

Ganti nomor WhatsApp di semua file HTML:
- Cari: `wa.me/6281234567890`
- Ganti dengan: `wa.me/62NOMORANDA`

---

## 🎨 Kustomisasi Warna

Di `assets/css/style.css`, ubah variabel warna di `:root`:

```css
:root {
  --blue: #4DA6FF;    /* Warna aksen utama */
  --dark: #222222;    /* Warna teks gelap */
}
```

---

## ✅ Fitur yang Sudah Ada

- [x] Navbar sticky dengan dropdown produk hover
- [x] Hero slideshow auto-play dengan indikator
- [x] Statistik card animasi scroll
- [x] Grid produk responsive (3→2→1 kolom)
- [x] Brand infinite scroll ticker
- [x] Testimonial cards
- [x] Accordion produk per kategori
- [x] Filter galeri dokumentasi
- [x] Lightbox popup foto
- [x] Simulasi kredit realtime
- [x] Form kontak dengan feedback
- [x] Floating WhatsApp button
- [x] Hamburger menu mobile
- [x] Lazy loading gambar
- [x] Animasi scroll reveal

---

*Dibuat dengan ❤️ untuk MotoPrima Dealer Mobil*
