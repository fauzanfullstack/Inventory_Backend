import { Request, Response } from "express";
import pool from "../database/postgress";

// ✅ Get all Receiving Items
export const getReceivingItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        ri.*,
        r.item_name AS r_item_name,
        r.qty AS r_qty,
        r.unit_type AS r_unit_type
      FROM receiving_items ri
      LEFT JOIN receivings r ON ri.receiving_id = r.id
      ORDER BY ri.id DESC
    `);

    // Jika receiving_id ada, pakai data dari receivings sebagai default
    const data = result.rows.map((row: any) => ({
      ...row,
      item_name: row.item_name || row.r_item_name,
      qty: row.qty || row.r_qty,
      unit_type: row.unit_type || row.r_unit_type,
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching receiving items:", error);
    res.status(500).json({ message: "Error fetching receiving items" });
  }
};

// ✅ Get Receiving Item by ID
export const getReceivingItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        ri.*,
        r.item_name AS r_item_name,
        r.qty AS r_qty,
        r.unit_type AS r_unit_type
      FROM receiving_items ri
      LEFT JOIN receivings r ON ri.receiving_id = r.id
      WHERE ri.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving item not found" });
    }

    const row = result.rows[0];
    const data = {
      ...row,
      item_name: row.item_name || row.r_item_name,
      qty: row.qty || row.r_qty,
      unit_type: row.unit_type || row.r_unit_type,
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching receiving item:", error);
    res.status(500).json({ message: "Error fetching receiving item" });
  }
};

// ✅ Create Receiving Item
export const createReceivingItem = async (req: Request, res: Response) => {
  try {
    const { receiving_id, item_name, part_no, qty, unit_type, receive_status, source_type, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO receiving_items 
        (receiving_id, item_name, part_no, qty, unit_type, receive_status, source_type, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        receiving_id || null,
        item_name || null,
        part_no || null,
        qty || 1,
        unit_type || null,
        receive_status || 'received',
        source_type || (receiving_id ? 'supplier' : 'manual'),
        notes || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating receiving item:", error);
    res.status(500).json({ message: "Error creating receiving item" });
  }
};

// ✅ Update Receiving Item
export const updateReceivingItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receiving_id, item_name, part_no, qty, unit_type, receive_status, source_type, notes } = req.body;

    const result = await pool.query(
      `UPDATE receiving_items 
       SET receiving_id=$1,
           item_name=$2,
           part_no=$3,
           qty=$4,
           unit_type=$5,
           receive_status=$6,
           source_type=$7,
           notes=$8,
           updated_at = now()
       WHERE id=$9
       RETURNING *`,
      [
        receiving_id || null,
        item_name || null,
        part_no || null,
        qty || 1,
        unit_type || null,
        receive_status || 'received',
        source_type || (receiving_id ? 'supplier' : 'manual'),
        notes || null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating receiving item:", error);
    res.status(500).json({ message: "Error updating receiving item" });
  }
};

// ✅ Delete Receiving Item
export const deleteReceivingItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM receiving_items WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving item not found" });
    }

    res.json({ message: "Receiving item deleted successfully" });
  } catch (error) {
    console.error("Error deleting receiving item:", error);
    res.status(500).json({ message: "Error deleting receiving item" });
  }
};
