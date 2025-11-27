import { Request, Response } from "express";
import pool from "../database/postgress";

// ✅ GET ALL
export const getIssuings = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM issuings ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching issuings" });
  }
};

// ✅ GET BY ID
export const getIssuingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM issuings WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Issuing not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching issuing by id" });
  }
};

// ✅ CREATE
export const createIssuing = async (req: Request, res: Response) => {
  try {
    const { number, document, status, location, cost_center, request_by, total, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO issuings (number, document, status, location, cost_center, request_by, total, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [number, document, status, location, cost_center, request_by, total, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating issuing" });
  }
};

// ✅ UPDATE
export const updateIssuing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { number, document, status, location, cost_center, request_by, total, notes } = req.body;
    const result = await pool.query(
      `UPDATE issuings SET 
        number = $1, document = $2, status = $3, location = $4,
        cost_center = $5, request_by = $6, total = $7, notes = $8,
        updated_at = now()
       WHERE id = $9 RETURNING *`,
      [number, document, status, location, cost_center, request_by, total, notes, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Issuing not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating issuing" });
  }
};

// ✅ DELETE
export const deleteIssuing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM issuings WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Issuing not found" });
    res.json({ message: "Issuing deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting issuing" });
  }
};
