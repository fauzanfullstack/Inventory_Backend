import { Request, Response } from "express";
import pool from "../database/postgress";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Helper untuk ubah filename → full URL
const formatRow = (row: any) => {
  return {
    ...row,
    documentation: row.documentation
      ? `${BASE_URL}/uploads/${row.documentation}`
      : null,
  };
};

// =============================================
// ✅ GET ALL SREQUESTS
// =============================================
export const getSRequests = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM s_requests ORDER BY id DESC");

    const formatted = result.rows.map(formatRow);

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching service requests:", error);
    res.status(500).json({ message: "Error fetching service requests" });
  }
};

// =============================================
// ✅ CREATE SREQUEST
// =============================================
export const createSRequest = async (req: Request, res: Response) => {
  try {
    const {
      number,
      status,
      open_date,
      expected_date,
      cost_center,
      location,
      request_by,
      notes,
      created_by,
      updated_by,
    } = req.body;

    const documentation = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO s_requests 
      (number, documentation, status, open_date, expected_date, cost_center, location, request_by, notes, created_by, updated_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        number,
        documentation,
        status,
        open_date,
        expected_date,
        cost_center,
        location,
        request_by,
        notes,
        created_by,
        updated_by,
      ]
    );

    res.status(201).json(formatRow(result.rows[0]));
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: "Error creating service request" });
  }
};

// =============================================
// ✅ GET SREQUEST BY ID
// =============================================
export const getSRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM s_requests WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.json(formatRow(result.rows[0]));
  } catch (error) {
    console.error("Error fetching service request by ID:", error);
    res.status(500).json({ message: "Error fetching service request" });
  }
};

// =============================================
// ✅ UPDATE SREQUEST
// =============================================
export const updateSRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      number,
      status,
      open_date,
      expected_date,
      cost_center,
      location,
      request_by,
      notes,
      updated_by,
    } = req.body;

    const documentation = req.file ? req.file.filename : req.body.documentation;

    const result = await pool.query(
      `UPDATE s_requests
       SET number=$1, documentation=$2, status=$3, open_date=$4, expected_date=$5, cost_center=$6,
           location=$7, request_by=$8, notes=$9, updated_by=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [
        number,
        documentation,
        status,
        open_date,
        expected_date,
        cost_center,
        location,
        request_by,
        notes,
        updated_by,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.json(formatRow(result.rows[0]));
  } catch (error) {
    console.error("Error updating service request:", error);
    res.status(500).json({ message: "Error updating service request" });
  }
};

// =============================================
// ✅ DELETE SREQUEST
// =============================================
export const deleteSRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM s_requests WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.json({ message: "Service request deleted successfully" });
  } catch (error) {
    console.error("Error deleting service request:", error);
    res.status(500).json({ message: "Error deleting service request" });
  }
};
