import { Request, Response } from "express";
import pool from "../database/postgress";

// ================================
// GET ALL
// ================================
export const getReceivings = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM receivings ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching receivings:", error);
    res.status(500).json({ message: "Error fetching receivings" });
  }
};

// ================================
// GET BY ID
// ================================
export const getReceivingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM receivings WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching receiving:", error);
    res.status(500).json({ message: "Error fetching receiving" });
  }
};

// ================================
// CREATE RECEIVING + FILE UPLOAD
// ================================
export const createReceiving = async (req: Request, res: Response) => {
  try {
    const {
      number,
      document,
      status,
      location,
      cost_center,
      supplier,
      idr,
      total,
      notes,
      item_name,
      condition_status,
      unit_type,
      qty,
      created_by,
    } = req.body;

    // Validasi item_name
    if (!item_name || item_name.trim() === "") {
      return res.status(400).json({ message: "Field 'item_name' wajib diisi!" });
    }

    const idrNum = parseFloat(idr) || 0;
    const totalNum = parseFloat(total) || 0;
    const qtyNum = parseInt(qty) || 0;

    const documentation = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `INSERT INTO receivings 
        (number, document, status, location, cost_center, supplier, idr, total, notes,
         item_name, condition_status, unit_type, qty, documentation, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        number,
        document,
        status,
        location,
        cost_center,
        supplier,
        idrNum,
        totalNum,
        notes,
        item_name,
        condition_status || null,
        unit_type || null,
        qtyNum,
        documentation,
        created_by || "Unknown",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating receiving:", error);
    res.status(500).json({ message: "Error creating receiving" });
  }
};

// ================================
// UPDATE RECEIVING + OPTIONAL FILE
// ================================
export const updateReceiving = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      number,
      document,
      status,
      location,
      cost_center,
      supplier,
      idr,
      total,
      notes,
      item_name,
      condition_status,
      unit_type,
      qty,
      updated_by,
    } = req.body;

    if (!item_name || item_name.trim() === "") {
      return res.status(400).json({ message: "Field 'item_name' wajib diisi!" });
    }

    const idrNum = parseFloat(idr) || 0;
    const totalNum = parseFloat(total) || 0;
    const qtyNum = parseInt(qty) || 0;

    const newFile = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `UPDATE receivings
       SET number=$1,
           document=$2,
           status=$3,
           location=$4,
           cost_center=$5,
           supplier=$6,
           idr=$7,
           total=$8,
           notes=$9,
           item_name=$10,
           condition_status=$11,
           unit_type=$12,
           qty=$13,
           documentation = COALESCE($14, documentation),
           updated_by = $15,
           updated_at = NOW()
       WHERE id=$16
       RETURNING *`,
      [
        number,
        document,
        status,
        location,
        cost_center,
        supplier,
        idrNum,
        totalNum,
        notes,
        item_name,
        condition_status || null,
        unit_type || null,
        qtyNum,
        newFile,
        updated_by || "Unknown",
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating receiving:", error);
    res.status(500).json({ message: "Error updating receiving" });
  }
};

// ================================
// DELETE RECEIVING
// ================================
export const deleteReceiving = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM receivings WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving not found" });
    }

    res.json({ message: "Receiving deleted successfully" });
  } catch (error) {
    console.error("Error deleting receiving:", error);
    res.status(500).json({ message: "Error deleting receiving" });
  }
};
