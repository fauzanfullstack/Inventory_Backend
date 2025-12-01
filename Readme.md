📝 Inventory Management System (Pengelolaan Barang)

Sistem Inventory yang menyediakan fitur pengelolaan barang seperti persediaan, permintaan, pengeluaran, daftar barang, keranjang barang, hingga laporan lengkap.
Sistem juga mendukung role user & admin dengan level akses yang berbeda.

📑 Daftar Isi

🎯 Tujuan Project
📂 Fitur Utama
🛠️ Teknologi yang Digunakan
🚀 Proses Backend Singkat
🗃️ Struktur Folder
📡 Contoh Routes API
📸 Dokumentasi ERD
👤 Author



                            problem solving

🚀 Proses Backend Singkat
--BUAT TABEL DI POSGRES SQL SAYA KASIH ERD NYA SAJA KALAU PASTE QUERY NYA TERLALU PANJANG JUGA )

📌 1. Instalasi
-pnpm init
-pnpm add express
-pnpm add typescript -D
-pnpm tsc
-npx tsc --init
-pnpm add express cors dotenv
-pnpm add -D @types/node @types/express @types/corsc

📌 2. Membuat Server Dasar (src/app.ts)
app.get("/", (req, res) => {
  res.send("Hello World! Backend Inventory berjalan!");
});

📌 3. Membuat .env
-PORT=5000

🗃️ Struktur Folder

```
INVENTORY-PROJECT/                                                                             
├── backend-inventory/
│   ├── dist/
│   ├── node_modules/
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── app.ts
│   ├── test/
│   ├── uploads/
│   ├── .env
│   ├── nodemon.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── Readme.md
│   └── tsconfig.json
```

📌 Penjelasan Folder

-controllers → fungsi CRUD, join, transform response JSON
-database → koneksi PostgreSQL
-middleware → login, register, Upload foto
-routes → menghubungkan endpoint ke controller
📡 Contoh Routes API  
router.post("/", createIssuing);
router.get("/", getIssuings);
router.get("/:id", getIssuingById);
router.put("/:id", updateIssuing);
router.delete("/:id", deleteIssuing);
-test → alat testing API sederhana
-uploads → penyimpanan file foto

pnpm run dev lalu akses
http://localhost:5000/api/items
maka akan muncul data json seperti ini 
{
    "id": "32",
    "part_no": "HTL-012",
    "name": "Conditioner 30ml",
    "supplier": "PT Aromatic Care",
    "unit_type": "pcs",
    "conversion": "1.0000",
    "unit": "barang",
    "qty": 151,
    "aksi_centang": true,
    "created_by": "Fauzan",
    "updated_by": null,
    "created_at": "2025-11-30T12:11:05.884Z",
    "updated_at": "2025-11-30T12:57:15.377Z"
  },

📸 Dokumentasi ERD
<img width="630" height="805" alt="erd ozan" src="https://github.com/user-attachments/assets/fcd4dc7c-9d5a-44ff-b087-db6dc31febf8" />


🚀 Selesai! 

📌Penutup
“Saya Fauzan Permana menyadari bahwa backend yang saya buat masih belum sepenuhnya kompleks dan belum dapat memenuhi seluruh aspek ideal sebuah sistem. Saya memohon maaf atas kekurangan tersebut. Dengan waktu pengerjaan yang cukup terbatas dan kemampuan yang masih terus saya pelajari, saya berusaha memberikan hasil terbaik yang saya bisa pada kondisi saat ini.”









