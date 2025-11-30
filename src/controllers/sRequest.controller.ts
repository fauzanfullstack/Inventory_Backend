import { Request, Response } from "express";
import pool from "../database/postgress";

// Helper
const formatRow = (row: any) => {
  const formatted = { ...row };
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
// GET ALL SREQUESTS
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
// CREATE SREQUEST
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
      items,
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

    res.status(201).json(formatRow(result.rows[0]));
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: "Error creating service request" });
  }
};

// =============================================
// GET SREQUEST BY ID
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
// UPDATE SREQUEST + AUTO DEDUCT STOCK
// =============================================
export const updateSRequest = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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
      items,
    } = req.body;

    // Validasi field required
    if (!number || !open_date || !expected_date || !cost_center || !location || !request_by) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Field required tidak boleh kosong" });
    }

    // Validasi items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Items harus diisi minimal 1" });
    }

    // Validasi setiap item
    for (const item of items) {
      if (!item.name || !item.qty || item.qty < 1) {
        await client.query("ROLLBACK");
        return res.status(400).json({ 
          message: "Setiap item harus memiliki name dan qty minimal 1" 
        });
      }
    }

    // Get old service request data
    const oldSRequest = await client.query(
      `SELECT * FROM s_requests WHERE id = $1`,
      [id]
    );

    if (oldSRequest.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Service request not found" });
    }

    const oldData = oldSRequest.rows[0];
    const oldStatus = oldData.status;

    // AUTO DEDUCT STOCK jika status berubah dari non-approved → approved
    if (oldStatus !== "approved" && status === "approved") {
      console.log("🔄 Auto deducting stock for approved service request...");

      for (const requestItem of items) {
        const itemName = requestItem.name.trim();
        const requestQty = parseInt(requestItem.qty) || 0;

        if (requestQty <= 0) continue;

        // Cari item di database (case-insensitive)
        const itemNameClean = itemName.toLowerCase();
        const itemResult = await client.query(
          `SELECT * FROM items WHERE LOWER(TRIM(name)) = $1`,
          [itemNameClean]
        );

        if (itemResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({ 
            message: `Item '${itemName}' tidak ditemukan di master data items!` 
          });
        }

        const item = itemResult.rows[0];
        const currentQty = item.qty || 0;
        const newQty = currentQty - requestQty;

        // Validasi stock cukup
        if (newQty < 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({ 
            message: `Stock '${itemName}' tidak cukup! (Tersedia: ${currentQty}, Diminta: ${requestQty})` 
          });
        }

        // Update stock
        await client.query(
          `UPDATE items SET qty = $1, updated_at = NOW() WHERE id = $2`,
          [newQty, item.id]
        );

        console.log(`✅ Stock deducted: ${item.name} (${currentQty} → ${newQty})`);
      }
    }

    // Update service request
    const result = await client.query(
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

    await client.query("COMMIT");
    res.json(formatRow(result.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating service request:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Error updating service request" });
  } finally {
    client.release();
  }
};

// =============================================
// DELETE SREQUEST
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