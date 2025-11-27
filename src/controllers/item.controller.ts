import { Request, Response } from "express";
import pool from "../database/postgress";

// ======================================================
// GET ALL ITEMS (rapi + urutan kolom estetik)
// ======================================================
export const getItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        part_no,
        name,
        supplier,
        unit_type,
        conversion,
        unit,
        qty,
        aksi_centang,
        created_by,
        updated_by,
        created_at,
        updated_at
      FROM items
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("🔥 Error getItems:", error);
    res.status(500).json({ message: "Error fetching items" });
  }
};

// ======================================================
// GET ONE ITEM
// ======================================================
export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        id,
        part_no,
        name,
        supplier,
        unit_type,
        conversion,
        unit,
        qty,
        aksi_centang,
        created_by,
        updated_by,
        created_at,
        updated_at
      FROM items
      WHERE id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Error getItemById:", error);
    res.status(500).json({ message: "Error fetching item" });
  }
};

// ======================================================
// CREATE ITEM (with supplier + created_by real)
// ======================================================
export const createItem = async (req: Request, res: Response) => {
  try {
    const {
      part_no,
      name,
      unit_type,
      conversion,
      unit,
      qty,
      aksi_centang,
      supplier,
      created_by
    } = req.body;

    const result = await pool.query(
      `INSERT INTO items 
        (part_no, name, supplier, unit_type, conversion, unit, qty, aksi_centang, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *
      `,
      [
        part_no,
        name,
        supplier || null,
        unit_type || null,
        conversion || 1,
        unit || null,
        qty || 0,
        aksi_centang || false,
        created_by || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Error createItem:", error);
    res.status(500).json({ message: "Error creating item" });
  }
};

// ======================================================
// UPDATE ITEM (with supplier)
// ======================================================
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      part_no,
      name,
      unit_type,
      conversion,
      unit,
      qty,
      aksi_centang,
      supplier,
      updated_by
    } = req.body;

    const result = await pool.query(
      `UPDATE items
       SET 
         part_no      = COALESCE($1, part_no),
         name         = COALESCE($2, name),
         supplier     = COALESCE($3, supplier),
         unit_type    = COALESCE($4, unit_type),
         conversion   = COALESCE($5, conversion),
         unit         = COALESCE($6, unit),
         qty          = COALESCE($7, qty),
         aksi_centang = COALESCE($8, aksi_centang),
         updated_by   = $9,
         updated_at   = NOW()
       WHERE id = $10
       RETURNING *
      `,
      [
        part_no ?? null,
        name ?? null,
        supplier ?? null,
        unit_type ?? null,
        conversion ?? null,
        unit ?? null,
        qty ?? null,
        aksi_centang ?? null,
        updated_by || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Error updateItem:", error);
    res.status(500).json({ message: "Error updating item" });
  }
};

// ======================================================
// DELETE ITEM
// ======================================================
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM items WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleteItem:", error);
    res.status(500).json({ message: "Error deleting item" });
  }
};
