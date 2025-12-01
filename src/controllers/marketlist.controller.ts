import { Request, Response } from "express";
import pool from "../database/postgress";


// Helper: Hitung status otomatis berdasarkan tanggal
const getAutoStatus = (open_date: string, close_date: string, currentStatus?: string) => {
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  if (!open_date || !close_date) return currentStatus || "pending";

  if (today < open_date) return "pending";
  if (today === open_date) return "open";
  if (today > open_date && today < close_date) return "approaching";
  if (today === close_date) return "due";
  if (today > close_date && currentStatus !== "completed") return "overdue";

  return currentStatus || "pending";
};

// Get all marketlists with item info
export const getMarketlists = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.no,
        m.status,
        m.open_date,
        m.close_date,
        m.cd,
        m.cost_center,
        m.type_cost,
        m.total,
        m.notes,
        m.item_id,
        i.name AS item_name,
        i.part_no AS part_number
      FROM marketlists m
      LEFT JOIN items i ON m.item_id = i.id
      ORDER BY m.id ASC
    `);

    // Update status otomatis sebelum dikirim
    const data = result.rows.map((row: any) => ({
      ...row,
      status: getAutoStatus(row.open_date, row.close_date, row.status),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error in getMarketlists:", error);
    res.status(500).json({
      message: "Error fetching marketlists",
      error: error instanceof Error ? error.message : error
    });
  }
};


// Get marketlist by ID
export const getMarketlistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.id,
        m.no,
        m.status,
        m.open_date,
        m.close_date,
        m.cd,
        m.cost_center,
        m.type_cost,
        m.total,
        m.notes,
        m.item_id,
        i.name AS item_name,
        i.part_no AS part_number
      FROM marketlists m
      LEFT JOIN items i ON m.item_id = i.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Marketlist not found" });

    const row = result.rows[0];
    row.status = getAutoStatus(row.open_date, row.close_date, row.status);

    res.json(row);
  } catch (error) {
    console.error("Error in getMarketlistById:", error);
    res.status(500).json({
      message: "Error fetching marketlist",
      error: error instanceof Error ? error.message : error
    });
  }
};


// Create new marketlist
export const createMarketlist = async (req: Request, res: Response) => {
  try {
    const {
      status,
      open_date,
      close_date,
      cd,
      cost_center,
      type_cost,
      total,
      notes,
      item_id
    } = req.body;

    if (!item_id) {
      return res.status(400).json({ message: "'item_id' is required" });
    }

    // Generate nomor otomatis
    const lastNoResult = await pool.query("SELECT MAX(no) AS last_no FROM marketlists");
    const lastNo = lastNoResult.rows[0].last_no || "0";
    const newNo = String(Number(lastNo) + 1).padStart(3, "0"); // contoh: 001,002,003

    const autoStatus = getAutoStatus(open_date, close_date, status);

    const result = await pool.query(`
      INSERT INTO marketlists 
        (no, status, open_date, close_date, cd, cost_center, type_cost, total, notes, item_id)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `, [newNo, autoStatus, open_date, close_date, cd, cost_center, type_cost, total, notes, item_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error in createMarketlist:", error);
    res.status(500).json({
      message: "Error creating marketlist",
      error: error instanceof Error ? error.message : error
    });
  }
};


// Update marketlist
export const updateMarketlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      open_date,
      close_date,
      cd,
      cost_center,
      type_cost,
      total,
      notes,
      item_id
    } = req.body;

    const autoStatus = getAutoStatus(open_date, close_date, status);

    const result = await pool.query(`
      UPDATE marketlists 
      SET 
        status=$1,
        open_date=$2,
        close_date=$3,
        cd=$4,
        cost_center=$5,
        type_cost=$6,
        total=$7,
        notes=$8,
        item_id=$9,
        updated_at=NOW()
      WHERE id=$10
      RETURNING *
    `, [autoStatus, open_date, close_date, cd, cost_center, type_cost, total, notes, item_id, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Marketlist not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error in updateMarketlist:", error);
    res.status(500).json({
      message: "Error updating marketlist",
      error: error instanceof Error ? error.message : error
    });
  }
};


// Delete marketlist
export const deleteMarketlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM marketlists WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Marketlist not found" });

    res.json({ message: "Marketlist deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMarketlist:", error);
    res.status(500).json({
      message: "Error deleting marketlist",
      error: error instanceof Error ? error.message : error
    });
  }
};
