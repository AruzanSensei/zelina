# PRD — Product Management Website (Simple Stack)

## 1. Overview
Website untuk mengelola data produk seperti label mesin. Fokus: input produk, generate data otomatis, simpan ke database ringan, dan fitur pencarian + filtering.

---

## 2. Goals
- User bisa tambah produk baru
- Sistem auto-generate field tertentu
- Data tersimpan (persist)
- Bisa search & filter cepat
- UI clean, fokus data

---

## 3. Tech Stack (WAJIB)
- HTML
- CSS
- Vanilla JS
- Database ringan:
  - LocalStorage (default)
  - IndexedDB (optional jika data mulai banyak)

---

## 4. Data Structure

Product Object:
- product_name: string
- serial_number: string (unique)
- product_number: string
- capacity: string
- voltage: string
- frequency: string
- model: string
- password: string

---

## 5. Auto Generate Rules

### 5.1 Product Name
Format: ETS-{capacity}.{model}  
Contoh: ETS-5000.AIZ

### 5.2 Serial Number
Format: XSI-{random}-{capacity}-1-{random}  
Contoh: XSI-II512-B-5000-1-0004  

Catatan:
- Harus UNIQUE
- Kombinasi random huruf + angka

### 5.3 Product Number
Format: {randomCode}-{incrementID}  
Contoh: B312D-000004

---

## 6. Features

### 6.1 Add Product
User input:
- Capacity
- Voltage
- Frequency
- Model
- Password

System:
- Generate product_name
- Generate serial_number (unique)
- Generate product_number

Action:
- Simpan ke database

---

### 6.2 Search Product
Priority:
1. Serial Number (utama)
2. Product Number
3. Product Name

Behavior:
- Mendukung partial match
- Bisa real-time search (optional debounce)

---

### 6.3 Filter System
Filter berdasarkan:
- Model
- Capacity (optional)
- Voltage (optional)

Bisa digunakan bersamaan dengan search

---

### 6.4 Product List View
Menampilkan:
- Product Name
- Serial Number
- Model
- Capacity

Aksi:
- Klik item → masuk ke detail

---

### 6.5 Product Detail View
Menampilkan:
- Product Name
- Serial Number
- Product Number
- Capacity
- Voltage
- Frequency
- Model
- Password

UI:
- Gunakan layout grid seperti label mesin
- Boxed layout (border tegas, clean)

---

## 7. Database Logic

Struktur penyimpanan:
- key: "products"
- value: array of product object

Function yang dibutuhkan:
- addProduct()
- getAllProducts()
- findProduct(query)
- filterProducts(filters)
- generateSerial()
- generateProductNumber()

---

## 8. UX Flow

Add Product:
1. User buka form
2. Isi data
3. Klik Save
4. System generate field otomatis
5. Data disimpan
6. Redirect ke list atau detail

Search:
1. User input keyword
2. System cari berdasarkan priority
3. Tampilkan hasil
4. Bisa refine pakai filter

---

## 9. UI Guidelines
- Clean, minimal
- Dominan hitam putih
- Gunakan grid layout
- Hindari terlalu banyak warna
- Typography tegas dan jelas

---

## 10. Security (Basic)
- Password disimpan apa adanya (sementara)
- Tidak ada auth system
- Future: hashing password

---

## 11. Constraints
- Tanpa framework
- Tanpa backend
- Harus ringan
- Maksimal ratusan data (limit LocalStorage)

---

## 12. Future Improvements
- Export CSV
- QR / Barcode generator
- Cloud sync
- Authentication system
- Multi-user

---

## 13. Important Instruction for AI Agent
Gunakan struktur layout yang clean dan reusable.  
Jangan hardcode styling berlebihan karena desain akan diubah manual oleh user.  
Fokus ke logic, struktur data, dan usability — bukan tampilan akhir.