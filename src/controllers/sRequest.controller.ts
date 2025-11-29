import { Request, Response } from "express";
import pool from "../database/postgress";

// Helper
const formatRow = (row: any) => {
  const formatted = { ...row };
  // Parse items jika ada
  if (formatted.items && typeof formatted.items === 'string') {
    try {
      formatted.items = JSON.parse(formatted.items);
    } catch (e) {
      formatted.items = [];
    }
  }
  return formatted;
};

// =============================================
// ✅ GET ALL SREQUESTS
// =============================================
export const getSRequests = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM s_requests ORDER BY id DESC");
    res.json(result.rows.map(formatRow));
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
    console.log("=== CREATE SREQUEST DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
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
      items, // array of {name, qty}
    } = req.body;

    console.log("Extracted values:", {
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
      items
    });

    // Validasi field required
    if (!number || !open_date || !expected_date || !cost_center || !location || !request_by) {
      console.log("Validation failed - missing required fields");
      console.log("Check:", {
        hasNumber: !!number,
        hasOpenDate: !!open_date,
        hasExpectedDate: !!expected_date,
        hasCostCenter: !!cost_center,
        hasLocation: !!location,
        hasRequestBy: !!request_by
      });
      return res.status(400).json({ message: "Field required tidak boleh kosong" });
    }

    // Validasi items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("Validation failed - items invalid");
      return res.status(400).json({ message: "Items harus diisi minimal 1" });
    }

    // Validasi setiap item
    for (const item of items) {
      if (!item.name || !item.qty || item.qty < 1) {
        console.log("Validation failed - invalid item:", item);
        return res.status(400).json({ 
          message: "Setiap item harus memiliki name dan qty minimal 1" 
        });
      }
    }

    console.log("All validations passed, inserting to database...");

    const result = await pool.query(
      `INSERT INTO s_requests 
      (number, status, open_date, expected_date, cost_center, location, request_by, notes, created_by, updated_by, items)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        number,
        status || "open",
        open_date,
        expected_date,
        cost_center,
        location,
        request_by,
        notes,
        created_by || 'system',
        updated_by || 'system',
        JSON.stringify(items),
      ]
    );

    console.log("Insert successful!");
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
    const result = await pool.query("SELECT * FROM s_requests WHERE id = $1", [id]);

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
      items, // array of {name, qty}
    } = req.body;

    // Validasi field required
    if (!number || !open_date || !expected_date || !cost_center || !location || !request_by) {
      return res.status(400).json({ message: "Field required tidak boleh kosong" });
    }

    // Validasi items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items harus diisi minimal 1" });
    }

    // Validasi setiap item
    for (const item of items) {
      if (!item.name || !item.qty || item.qty < 1) {
        return res.status(400).json({ 
          message: "Setiap item harus memiliki name dan qty minimal 1" 
        });
      }
    }

    const result = await pool.query(
      `UPDATE s_requests
       SET number=$1, status=$2, open_date=$3, expected_date=$4, cost_center=$5,
           location=$6, request_by=$7, notes=$8, updated_by=$9, items=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [
        number,
        status || "open",
        open_date,
        expected_date,
        cost_center,
        location,
        request_by,
        notes,
        updated_by || 'system',
        JSON.stringify(items),
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

    const result = await pool.query("DELETE FROM s_requests WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.json({ message: "Service request deleted successfully" });
  } catch (error) {
    console.error("Error deleting service request:", error);
    res.status(500).json({ message: "Error deleting service request" });
  }
};