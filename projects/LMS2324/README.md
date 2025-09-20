# Username & Password LMS 2023-2024 (Web Static)

## Deskripsi
Aplikasi ini adalah versi web statis dari sistem Learning Management System (LMS) yang menampilkan daftar username dan password siswa per kelas. Tidak membutuhkan backend/server (seperti Flask), sehingga **aman untuk di-host di GitHub Pages atau layanan hosting statis lainnya**.

---

## Fitur
- **Pilih Kelas:** Tampilkan daftar siswa berdasarkan kelas yang dipilih.
- **Tabel Siswa:** Data siswa (Nama, Username, Password) ditampilkan dalam bentuk tabel.
- **Copy Data:** Terdapat tombol copy di setiap baris untuk menyalin data siswa (nama, username, password).
- **Random Student:** Pilih siswa secara acak dari kelas yang dipilih, tampilkan dalam tabel kecil, dan bisa di-copy juga.
- **Tombol Sticky "Go to LMS":** Tombol mengarah ke halaman LMS utama sekolah, selalu tampil di pojok kanan bawah.
- **Responsif:** Tampilan modern dan responsif menggunakan Bootstrap 5.

---

## Struktur File

```
web_lms/
│
├── index.html      # Halaman utama (frontend)
├── data.js         # Data siswa semua kelas (format array JS)
├── README.md       # Dokumentasi (file ini)
└── (opsional: assets, css, dsb)
```

---

## Cara Menjalankan

1. **Clone atau download repository ini.**
2. **Pastikan file `index.html` dan `data.js` berada dalam satu folder.**
3. **Buka `index.html` di browser** (cukup klik dua kali atau drag ke browser).
4. **(Opsional) Deploy ke GitHub Pages** atau hosting statis lain.

---

## Cara Menambah/Mengedit Data Siswa

- **Edit file `data.js`.**
- Setiap kelas adalah properti pada objek `LMS_data`, misal:
  ```js
  const LMS_data = {
      X_DKV_I: [
          ["Nama Siswa", "Username", "Password"],
          // ...
      ],
      XI_APHP_II: [
          // ...
      ],
      // dst.
  };
  ```
- **Pastikan nama kelas di `data.js` sama persis dengan yang ada di frontend.**

---

## Customisasi

- **Judul, warna, dan tampilan** dapat diubah di file `index.html` dan CSS di dalamnya.
- **Tombol "Go to LMS"**: Ubah link di bagian `<a href="...">` jika ingin diarahkan ke halaman lain.

---

## Keamanan

- **Jangan gunakan untuk data sensitif** (misal: password asli siswa) jika di-publish ke publik.
- Data hanya tersimpan di sisi client (browser), tidak ada backend/server.

---

## Contoh Screenshot

![Contoh Tampilan](https://i.imgur.com/your-screenshot.png)  
*Ganti link di atas dengan screenshot aplikasi Anda.*

---

## Credits

- Dibuat oleh: **Zel**
- Template UI: [Bootstrap 5](https://getbootstrap.com/)
- Ikon: [Font Awesome](https://fontawesome.com/)

---

## Lisensi

Bebas digunakan dan dimodifikasi untuk keperluan edukasi/non-komersial.

---

**Jika butuh bantuan lebih lanjut, silakan hubungi pembuat atau buka issue di repository ini!**
