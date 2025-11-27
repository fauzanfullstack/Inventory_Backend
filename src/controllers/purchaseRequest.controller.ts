import { Request, Response } from "express";
import pool from "../database/postgress";

// ======================================================
// 🔧 Generate PR Number otomatis: PR-2025-0001
// ======================================================
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

// ======================================================
// ✅ Get all Purchase Requests
// ======================================================
export const getPurchaseRequests = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM purchase_requests ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching purchase requests:", error);
    res.status(500).json({ message: "Error fetching purchase requests", error });
  }
};

// ======================================================
// ✅ Get Purchase Request by ID
// ======================================================
export const getPurchaseRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM purchase_requests WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Purchase request not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching purchase request:", error);
    res.status(500).json({ message: "Error fetching purchase request", error });
  }
};

// ======================================================
// ✅ Create Purchase Request (AUTO pr_number + AUTO part_no)
// ======================================================
export const createPurchaseRequest = async (req: Request, res: Response) => {
  try {
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
      created_by = null
    } = req.body;

    // 🔥 part 1: generate pr_number otomatis
    const pr_number = await generatePRNumber();

    // 🔥 part 2: ambil part_no dari tabel items otomatis
    let part_no = null;

    if (item_id) {
      const item = await pool.query(
        "SELECT part_no FROM items WHERE id = $1",
        [item_id]
      );

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
    res.status(500).json({
      message: "Error creating purchase request",
      error: error.message,
    });
  }
};

// ======================================================
// ✅ Update Purchase Request
// ======================================================
export const updatePurchaseRequest = async (req: Request, res: Response) => {
  try {
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
      updated_by
    } = req.body;

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

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Purchase request not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating purchase request:", error);
    res.status(500).json({ message: "Error updating purchase request", error });
  }
};

// ======================================================
// ❌ Delete Purchase Request
// ======================================================
export const deletePurchaseRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM purchase_requests WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Purchase request not found" });
    }

    res.json({
      message: "Purchase request deleted successfully",
      pr: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting purchase request:", error);
    res.status(500).json({ message: "Error deleting purchase request", error });
  }
};
