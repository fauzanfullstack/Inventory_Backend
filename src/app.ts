import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { routes } from "./routes";
import pool from "./database/postgress";

const app = express();
const port = process.env.PORT || 5000;

// ===============================
// CORS FIX – WAJIB DI ATAS
// ===============================
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware json
app.use(express.json());

// ===============================
// STATIC FOLDER UNTUK FOTO UPLOAD
// ===============================
// ini akan menampilkan file di src/uploads
// akses di frontend: http://localhost:5000/uploads/namafile.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route utama
app.use("/", routes);

/**
 * 🩺 Cek koneksi PostgreSQL
 */
(async () => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    console.log("🟢 PostgreSQL connected at:", result.rows[0].current_time);
  } catch (error) {
    console.error("🔴 Failed to connect to PostgreSQL:", error);
  }
})();

app.get("/", (req, res) => {
  res.send("Hello World! Belajar Membuat Backend Server!");
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
