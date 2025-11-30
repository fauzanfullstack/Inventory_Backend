# 📝 Inventory (Pengelolaan Barang)
Sistem Inventoy atau Pengelolaan barang yang menyediakan berbagai fitur pengelolaan barang seperti persediaan barang permintaan barang pengeluaran barang daftar barang keranjan barang dan report keseluruhan pengelolaan barang,serta menyediakan akses yang berbeda antara users(departemen lain) dan admin 

---

📌 1. Tujuan Project
- Menyediakan sistem yang memudahkan karyawan dalam pengelolaan pencatatan barang
- Menjadi bahan pembelajaran dalam pengembangan system web

---

## 📂 2. Fitur Utama

- 🔐 **Registrasi & Login**
  - Login user & admin dengan role berbeda.
  - Proteksi akses berdasarkan role.

- 📦 **CRUD Items Barang**
  - Menambah, mengubah, menghapus, dan melihat data barang.
  - Atur part number, nama barang, kategori, dan stock awal.

- 📝 **CRUD Purchase Request (PR)**
  - Membuat form permintaan pembelian barang.
  - Approve/Reject PR oleh admin.
  - Tracking status PR.

- 🛒 **CRUD Purchase Request Items**
  - Menambahkan item barang ke dalam PR.
  - Pengaturan quantity dan unit.

- 🧾 **CRUD Market List**
  - Mencatat daftar barang yang perlu dibeli berdasarkan PR.
  - Monitoring list pembelian.

- 📥 **CRUD Receiving**
  - Mendata barang yang masuk dari supplier.
  - Update stok otomatis setelah barang diterima.

- 📥 **CRUD Receiving Items**
  - Input detail barang per receiving.
  - Qty, kondisi barang, catatan penerimaan.

- 🏬 **CRUD Store Request**
  - Permintaan barang dari gudang ke divisi internal.
  - Admin menyetujui dan mempersiapkan barang.

- 🧺 **CRUD Store Request Items**
  - Item-item yang diminta dalam satu Store Request.

- 📤 **CRUD Issuing**
  - Proses pengeluaran barang dari gudang.

- 📤 **CRUD Issuing Items**
  - Detail barang yang dikeluarkan.
  - Stok otomatis berkurang.

- 📊 **Report Stock Balance**
  - Laporan jumlah stok terkini.
  - Menampilkan pergerakan stok (in/out).
  - Bisa difilter berdasarkan tanggal atau jenis pergerakan.

- 🚪 **Logout**
  - Mengakhiri sesi login dengan aman.

---

## 🛠️ 3. Teknologi yang Digunakan
- Express
- Node.js/pnpm
- PosgreSql
- RestClient 
- Postman

---

## ⚙️ 4. Prasyarat
Sebelum menjalankan project, pastikan sudah menginstall:

- PHP 8+
- Composer
- Node.js & npm
- Database (MySQL/PostgreSQL)
- Git (optional)

---

## 🚀 5. Cara Install & Menjalankan Project

### 🧩 Clone Repository
```bash
git clone https://github.com/username/nama-project.git
cd nama-project
