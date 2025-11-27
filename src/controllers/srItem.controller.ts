import { Request, Response } from "express";
import pool from "../database/postgress";

// ✅ CREATE srItem (versi debug)
export const createSrItem = async (req: Request, res: Response) => {
  try {
    const { s_request_id, item_id, part_no, qty, unit_type, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO sr_items (s_request_id, item_id, part_no, qty, unit_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [s_request_id, item_id, part_no, qty, unit_type, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("❌ Error creating srItem:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET ALL
export const getAllSrItems = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM sr_items ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching srItems:", error);
    res.status(500).json({ error: "Failed to fetch srItems" });
  }
};

// ✅ GET BY ID
export const getSrItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM sr_items WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "srItem not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching srItem by ID:", error);
    res.status(500).json({ error: "Failed to fetch srItem" });
  }
};

// ✅ UPDATE
export const updateSrItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { s_request_id, item_id, part_no, qty, unit_type, notes } = req.body;
    const result = await pool.query(
      `UPDATE sr_items
       SET s_request_id = $1, item_id = $2, part_no = $3, qty = $4, unit_type = $5, notes = $6
       WHERE id = $7 RETURNING *`,
      [s_request_id, item_id, part_no, qty, unit_type, notes, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "srItem not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating srItem:", error);
    res.status(500).json({ error: "Failed to update srItem" });
  }
};

// ✅ DELETE
export const deleteSrItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM sr_items WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "srItem not found" });
    res.json({ message: "srItem deleted successfully" });
  } catch (error) {
    console.error("Error deleting srItem:", error);
    res.status(500).json({ error: "Failed to delete srItem" });
  }
};
