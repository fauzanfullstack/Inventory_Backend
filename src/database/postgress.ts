import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("ENV TEST:", {
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD ? "****" : "(empty)",
  PG_DATABASE: process.env.PG_DATABASE,
});

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 10, // jumlah koneksi maksimal di pool
  idleTimeoutMillis: 30000, // waktu idle sebelum koneksi ditutup
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err: Error) => {
  console.error("❌ PostgreSQL connection error:", err.message);
});

export default pool;
