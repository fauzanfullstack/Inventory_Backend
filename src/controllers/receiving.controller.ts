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
    } = req.body;

    const idrNum = Number(idr);
    const totalNum = Number(total);

    if (isNaN(idrNum) || isNaN(totalNum)) {
      return res.status(400).json({ message: "Field 'idr' dan 'total' harus angka!" });
    }

    // FILE → documentation
    const documentation = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `INSERT INTO receivings 
        (number, document, status, location, cost_center, supplier, idr, total, notes, item_name, condition_status, documentation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
        condition_status,
        documentation,
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
    } = req.body;

    const idrNum = Number(idr);
    const totalNum = Number(total);

    if (isNaN(idrNum) || isNaN(totalNum)) {
      return res.status(400).json({ message: "Field 'idr' dan 'total' harus angka!" });
    }

    // file baru → pakai filename
    const newFile = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `UPDATE receivings
       SET number=$1, document=$2, status=$3, location=$4, cost_center=$5, supplier=$6,
           idr=$7, total=$8, notes=$9, item_name=$10, condition_status=$11,
           documentation = COALESCE($12, documentation)
       WHERE id=$13
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
        condition_status,
        newFile,
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
