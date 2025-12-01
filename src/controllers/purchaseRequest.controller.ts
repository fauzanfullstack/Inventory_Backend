// src/controllers/purchaseRequest.controller.ts
import { Request, Response } from "express";
import pool from "../database/postgress";

interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// 🔧 Generate PR Number otomatis: PR-2025-0001
async function generatePRNumber() {
  const year = new Date().getFullYear();

  const result = await pool.query(
    `SELECT pr_number 
     FROM purchase_requests
     WHERE pr_number LIKE $1
     ORDER BY id DESC LIMIT 1`,
    [`PR-${year}-%`]
  );

  if (result.rowCount === 0) {
    return `PR-${year}-0001`;
  }

  const last = result.rows[0].pr_number; // contoh: PR-2025-0007
  const seq = parseInt(last.split("-")[2]) + 1;

  return `PR-${year}-${seq.toString().padStart(4, "0")}`;
}

// ✅ Get all Purchase Requests dengan JOIN items untuk ambil name
export const getPurchaseRequests = async (req: AuthRequest, res: Response) => {
  try {
    let result;

    if (req.user?.role === "admin") {
      // Admin → semua PR dengan JOIN items
      result = await pool.query(`
        SELECT 
          pr.*,
          i.name as item_name,
          i.part_no as item_part_no
        FROM purchase_requests pr
        LEFT JOIN items i ON pr.item_id = i.id
        ORDER BY pr.id DESC
      `);
    } else if (req.user) {
      // User → hanya PR miliknya dengan JOIN items
      result = await pool.query(`
        SELECT 
          pr.*,
          i.name as item_name,
          i.part_no as item_part_no
        FROM purchase_requests pr
        LEFT JOIN items i ON pr.item_id = i.id
        WHERE pr.created_by=$1 
        ORDER BY pr.id DESC
      `, [req.user.id]);
    } else {
      // Publik → tampilkan semua PR dengan JOIN items
      result = await pool.query(`
        SELECT 
          pr.*,
          i.name as item_name,
          i.part_no as item_part_no
        FROM purchase_requests pr
        LEFT JOIN items i ON pr.item_id = i.id
        ORDER BY pr.id DESC
      `);
    }

    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching purchase requests:", error);
    res.status(500).json({ message: "Error fetching purchase requests", error: error.message });
  }
};

// ✅ Get Purchase Request by ID dengan JOIN items
export const getPurchaseRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        pr.*,
        i.name as item_name,
        i.part_no as item_part_no,
        i.unit_type as item_unit_type
      FROM purchase_requests pr
      LEFT JOIN items i ON pr.item_id = i.id
      WHERE pr.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Purchase request not found" });
    }

    const pr = result.rows[0];

    if (!req.user || req.user?.role === "admin" || pr.created_by === req.user.id) {
      return res.json(pr);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error: any) {
    console.error("Error fetching purchase request:", error);
    res.status(500).json({ message: "Error fetching purchase request", error: error.message });
  }
};

// ✅ Create Purchase Request (Admin/User, token wajib)
export const createPurchaseRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Token required to create PR" });
    }

    const {
      item_id = null,
      description = null,
      unit_type = null,
      qty_f = 0,
      currency = "IDR",
      cost = 0,
      team = null,
      due_date = null,
      number = null,
      request_by = null,
      department = null,
      status = "open",
    } = req.body;

    const created_by = req.user.id;

    const pr_number = await generatePRNumber();

    let part_no = null;
    if (item_id) {
      const item = await pool.query("SELECT part_no FROM items WHERE id = $1", [item_id]);
      if (item.rowCount === 0) {
        return res.status(404).json({ message: "Item not found" });
      }
      part_no = item.rows[0].part_no;
    }

    const result = await pool.query(
      `INSERT INTO purchase_requests 
      (pr_number, item_id, part_no, description, unit_type, qty_f, currency, cost, team, due_date, number, request_by, department, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        pr_number,
        item_id,
        part_no,
        description,
        unit_type,
        qty_f,
        currency,
        cost,
        team,
        due_date,
        number,
        request_by,
        department,
        status,
        created_by,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating purchase request:", error.message);
    res.status(500).json({ message: "Error creating purchase request", error: error.message });
  }
};

// ✅ Update Purchase Request (Admin Only)
export const updatePurchaseRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update PR" });
    }

    const { id } = req.params;
    const {
      pr_number,
      item_id,
      part_no,
      description,
      unit_type,
      qty_f,
      currency = "IDR",
      cost = 0,
      team,
      due_date,
      number,
      request_by,
      department,
      status,
    } = req.body;

    const updated_by = req.user.id;

    const check = await pool.query("SELECT * FROM purchase_requests WHERE id=$1", [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Purchase request not found" });
    }

    const result = await pool.query(
      `UPDATE purchase_requests SET
        pr_number=$1,
        item_id=$2,
        part_no=$3,
        description=$4,
        unit_type=$5,
        qty_f=$6,
        currency=$7,
        cost=$8,
        team=$9,
        due_date=$10,
        number=$11,
        request_by=$12,
        department=$13,
        status=$14,
        updated_by=$15,
        updated_at=now()
       WHERE id=$16
       RETURNING *`,
      [
        pr_number,
        item_id,
        part_no,
        description,
        unit_type,
        qty_f,
        currency,
        cost,
        team,
        due_date,
        number,
        request_by,
        department,
        status,
        updated_by,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating purchase request:", error.message);
    res.status(500).json({ message: "Error updating purchase request", error: error.message });
  }
};

// ❌ Delete Purchase Request (Admin Only)
export const deletePurchaseRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete PR" });
    }

    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM purchase_requests WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Purchase request not found" });
    }

    res.json({ message: "Purchase request deleted successfully", pr: result.rows[0] });
  } catch (error: any) {
    console.error("Error deleting purchase request:", error.message);
    res.status(500).json({ message: "Error deleting purchase request", error: error.message });
  }
};