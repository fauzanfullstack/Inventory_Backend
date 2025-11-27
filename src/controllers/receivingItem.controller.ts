import { Request, Response } from "express";
import pool from "../database/postgress";

// ✅ Get all Receiving Items
export const getReceivingItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM receiving_items ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching receiving items:", error);
    res.status(500).json({ message: "Error fetching receiving items" });
  }
};

// ✅ Get Receiving Item by ID
export const getReceivingItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM receiving_items WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Receiving item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching receiving item:", error);
    res.status(500).json({ message: "Error fetching receiving item" });
  }
};

// ✅ Create Receiving Item
export const createReceivingItem = async (req: Request, res: Response) => {
  try {
    const { receiving_id, item_id, part_no, qty, unit_type, price } = req.body;

    const result = await pool.query(
      `INSERT INTO receiving_items (receiving_id, item_id, part_no, qty, unit_type, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [receiving_id, item_id, part_no, qty, unit_type, price]
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
    const { receiving_id, item_id, part_no, qty, unit_type, price } = req.body;

    const result = await pool.query(
      `UPDATE receiving_items 
       SET receiving_id=$1, item_id=$2, part_no=$3, qty=$4, unit_type=$5, price=$6
       WHERE id=$7
       RETURNING *`,
      [receiving_id, item_id, part_no, qty, unit_type, price, id]
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
