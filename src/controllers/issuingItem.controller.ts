import { Request, Response } from "express";
import pool from "../database/postgress";


// GET ALL ISSUING ITEMS
export const getAllIssuingItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM issuing_items ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("🔥 Error fetching all issuing items:", error);
    res.status(500).json({ message: "Error fetching issuing items" });
  }
};


// GET ISSUING ITEMS BY ISSUING ID

export const getIssuingItemsByIssuingId = async (req: Request, res: Response) => {
  try {
    const { issuing_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM issuing_items WHERE issuing_id = $1 ORDER BY id DESC`,
      [issuing_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("🔥 Error fetching items by issuing id:", error);
    res.status(500).json({ message: "Error fetching issuing items" });
  }
};


// GET ONE ISSUING ITEM BY ID

export const getIssuingItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM issuing_items WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Issuing item not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Error fetching issuing item:", error);
    res.status(500).json({ message: "Error fetching issuing item" });
  }
};


// CREATE ISSUING ITEM

export const createIssuingItem = async (req: Request, res: Response) => {
  try {
    const { issuing_id, item_id, part_no, qty, unit_type, notes } = req.body;

    if (!issuing_id || !item_id || !qty) {
      return res
        .status(400)
        .json({ message: "issuing_id, item_id, dan qty wajib diisi" });
    }

    const result = await pool.query(
      `INSERT INTO issuing_items (issuing_id, item_id, part_no, qty, unit_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        issuing_id,
        item_id,
        part_no || "",
        qty,
        unit_type || "",
        notes || "",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Error creating issuing item:", error);
    res.status(500).json({ message: "Error creating issuing item" });
  }
};


// UPDATE ISSUING ITEM (PARTIAL UPDATE)
export const updateIssuingItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { issuing_id, item_id, part_no, qty, unit_type, notes } = req.body;

    console.log(">>> UPDATE ID:", id);
    console.log(">>> UPDATE PAYLOAD:", req.body);

    const result = await pool.query(
      `UPDATE issuing_items
       SET 
         issuing_id = COALESCE($1, issuing_id),
         item_id = COALESCE($2, item_id),
         part_no = COALESCE($3, part_no),
         qty = COALESCE($4, qty),
         unit_type = COALESCE($5, unit_type),
         notes = COALESCE($6, notes)
       WHERE id = $7
       RETURNING *`,
      [
        issuing_id ?? null,
        item_id ?? null,
        part_no ?? null,
        qty ?? null,
        unit_type ?? null,
        notes ?? null,
        id,
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Issuing item not found" });

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("🔥 ERROR UPDATE ISSUING ITEM:", error);
    res.status(500).json({
      message: "Error updating issuing item",
      error: error.message,
    });
  }
};



// DELETE ISSUING ITEM
export const deleteIssuingItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM issuing_items WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Issuing item not found" });

    res.json({ message: "Issuing item deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleting issuing item:", error);
    res.status(500).json({ message: "Error deleting issuing item" });
  }
};
