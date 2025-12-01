import { Request, Response } from "express";
import pool from "../database/postgress";

/* ------------------------- GET ALL PR ITEMS ------------------------- */
export const getPrItems = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pr_items.*,
        items.name AS item_name,
        items.part_no AS item_part_no,
        items.unit_type AS item_unit_type
      FROM pr_items
      LEFT JOIN items ON items.id = pr_items.item_id
      ORDER BY pr_items.id DESC
    `);

    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Error fetching PR items" });
  }
};

/* ------------------------- GET PR ITEM BY ID ------------------------- */
export const getPrItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        pr_items.*,
        items.name AS item_name,
        items.part_no AS item_part_no,
        items.unit_type AS item_unit_type
      FROM pr_items
      LEFT JOIN items ON items.id = pr_items.item_id
      WHERE pr_items.id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "PR Item not found" });

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error fetching PR item" });
  }
};

/* ------------------------- CREATE PR ITEM (AUTO) ------------------------- */
export const createPrItem = async (req: Request, res: Response) => {
  try {
    const { purchase_request_id } = req.body;

    if (!purchase_request_id) {
      return res.status(400).json({ message: "purchase_request_id is required" });
    }

    // Ambil data pr untuk diisi otomatis
    const pr = await pool.query(
      `SELECT item_id, part_no, description, unit_type, qty_f AS qty, cost
       FROM purchase_requests
       WHERE id = $1`,
      [purchase_request_id]
    );

    if (pr.rows.length === 0) {
      return res.status(404).json({ message: "Purchase Request not found" });
    }

    let { item_id, part_no, description, unit_type, qty, cost } = pr.rows[0];

    // ✅ Jika ada item_id, ambil name, part_no, unit_type dari items
    if (item_id) {
      const itemResult = await pool.query(
        "SELECT name, part_no, unit_type FROM items WHERE id = $1",
        [item_id]
      );

      if (itemResult.rows.length > 0) {
        const itemData = itemResult.rows[0];
        // Prioritas: data dari items > data dari PR
        part_no = itemData.part_no || part_no;
        description = itemData.name || description; // ✅ Gunakan name dari items
        unit_type = itemData.unit_type || unit_type;
      }
    }

    const result = await pool.query(
      `INSERT INTO pr_items 
        (purchase_request_id, item_id, part_no, description, unit_type, qty, cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        purchase_request_id,
        item_id,
        part_no,
        description,
        unit_type,
        qty,
        cost,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("🔥 Error creating PR item:", error);
    res.status(500).json({ message: "Error creating PR item" });
  }
};

/* ------------------------- UPDATE PR ITEM ------------------------- */
export const updatePrItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { purchase_request_id, item_id, part_no, description, unit_type, qty, cost } = req.body;

    // ✅ Jika item_id diubah/ada, ambil data dari items
    if (item_id) {
      const itemResult = await pool.query(
        "SELECT name, part_no, unit_type FROM items WHERE id = $1",
        [item_id]
      );

      if (itemResult.rows.length > 0) {
        const itemData = itemResult.rows[0];
        // Update dengan data dari items jika tidak ada input manual
        part_no = part_no || itemData.part_no;
        description = description || itemData.name; // ✅ Gunakan name dari items
        unit_type = unit_type || itemData.unit_type;
      }
    }

    const result = await pool.query(
      `UPDATE pr_items 
       SET purchase_request_id=$1, item_id=$2, part_no=$3, description=$4, unit_type=$5, qty=$6, cost=$7, updated_at=NOW()
       WHERE id=$8 
       RETURNING *`,
      [purchase_request_id, item_id, part_no, description, unit_type, qty, cost, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "PR Item not found" });

    res.json(result.rows[0]);

  } catch {
    res.status(500).json({ message: "Error updating PR item" });
  }
};

/* ------------------------- DELETE PR ITEM ------------------------- */
export const deletePrItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM pr_items WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "PR item not found" });

    res.json({ message: "PR item deleted successfully" });

  } catch {
    res.status(500).json({ message: "Error deleting PR item" });
  }
};