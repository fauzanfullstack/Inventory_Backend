// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import pool from "../database/postgress";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secret_key_123";

// ===============================
// REGISTER USER
// ===============================
export const register = async (req: Request, res: Response) => {
  try {
    const { username, full_name, email, password } = req.body;

    if (!username || !full_name || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // Cek username
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE LOWER(username)=LOWER($1)",
      [username]
    );

    if (userCheck.rowCount! > 0) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    // Cek email
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE LOWER(email)=LOWER($1)",
      [email]
    );

    if (emailCheck.rowCount! > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, full_name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, full_name, email, created_at`,
      [username, full_name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "User berhasil didaftarkan",
      user: result.rows[0],
    });

  } catch (error: any) {
    console.error("🔥 Error register user:", error);
    return res.status(500).json({ message: "Error register user", error: error.message });
  }
};


// ===============================
// LOGIN USER
// ===============================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    // Ambil user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE LOWER(email)=LOWER($1)",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const user = userResult.rows[0];

    // Cocokkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
      },
      token,
    });

  } catch (error: any) {
    console.error("🔥 Error login user:", error);
    return res.status(500).json({ message: "Error login user", error: error.message });
  }
};


// ===============================
// GET ALL USERS
// ===============================
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await pool.query(
      `SELECT id, username, full_name, email, created_at
       FROM users
       ORDER BY id DESC`
    );

    return res.status(200).json(users.rows);

  } catch (error: any) {
    console.error("🔥 Error get users:", error);
    return res.status(500).json({ message: "Error mengambil data user", error: error.message });
  }
};
