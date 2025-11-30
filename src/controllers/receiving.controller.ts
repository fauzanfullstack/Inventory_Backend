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
// CREATE RECEIVING + AUTO UPDATE STOCK
// ================================
export const createReceiving = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

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
      created_by, // HARUS berisi user ID (number), bukan string nama
    } = req.body;

    // Validasi item_name
    if (!item_name || item_name.trim() === "") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Field 'item_name' wajib diisi!" });
    }

    const idrNum = parseFloat(idr) || 0;
    const totalNum = parseFloat(total) || 0;
    const qtyNum = parseInt(qty) || 0;
    
    // created_by OPSIONAL - bisa kosong/null
    const createdById = created_by && !isNaN(parseInt(created_by)) ? parseInt(created_by) : null;

    const documentation = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    // 1. Insert receiving
    const result = await client.query(
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
        createdById, // Use parsed integer ID
      ]
    );

    // 2. AUTO UPDATE STOCK jika status = "accepted"
    if (status === "accepted" && qtyNum > 0) {
      const itemNameClean = item_name.trim().toLowerCase();

      // Cari item berdasarkan nama (case-insensitive)
      const itemResult = await client.query(
        `SELECT * FROM items WHERE LOWER(TRIM(name)) = $1`,
        [itemNameClean]
      );

      if (itemResult.rows.length > 0) {
        // Item sudah ada → UPDATE qty
        const item = itemResult.rows[0];
        const newQty = (item.qty || 0) + qtyNum;

        await client.query(
          `UPDATE items SET qty = $1, updated_at = NOW() WHERE id = $2`,
          [newQty, item.id]
        );

        console.log(`✅ Stock updated: ${item.name} (${item.qty} → ${newQty})`);
      } else {
        // Item belum ada → CREATE item baru dengan stock
        await client.query(
          `INSERT INTO items (name, qty, unit_type, supplier, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [item_name.trim(), qtyNum, unit_type || null, supplier || null, createdById]
        );

        console.log(`✅ New item created: ${item_name} with qty ${qtyNum}`);
      }
    }

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating receiving:", error);
    res.status(500).json({ message: "Error creating receiving" });
  } finally {
    client.release();
  }
};

// ================================
// UPDATE RECEIVING + AUTO UPDATE STOCK
// ================================
export const updateReceiving = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Field 'item_name' wajib diisi!" });
    }

    const idrNum = parseFloat(idr) || 0;
    const totalNum = parseFloat(total) || 0;
    const qtyNum = parseInt(qty) || 0;
    const updatedById = updated_by ? parseInt(updated_by) : null; // Parse to integer

    const newFile = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    // Get old receiving data
    const oldReceiving = await client.query(
      `SELECT * FROM receivings WHERE id = $1`,
      [id]
    );

    if (oldReceiving.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Receiving not found" });
    }

    const oldData = oldReceiving.rows[0];
    const oldStatus = oldData.status;
    const oldQty = oldData.qty || 0;
    const oldItemName = oldData.item_name || "";

    // Update receiving
    const result = await client.query(
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
        updatedById, // Use parsed integer ID
        id,
      ]
    );

    // AUTO UPDATE STOCK logic:
    // Case 1: Status berubah dari non-accepted → accepted
    // Case 2: Status tetap accepted, tapi qty berubah
    // Case 3: Item name berubah

    const statusChanged = oldStatus !== "accepted" && status === "accepted";
    const qtyChanged = status === "accepted" && oldQty !== qtyNum;
    const itemNameChanged = oldItemName.trim().toLowerCase() !== item_name.trim().toLowerCase();

    if (status === "accepted" && (statusChanged || qtyChanged || itemNameChanged)) {
      // Rollback old item stock (jika ada)
      if (oldStatus === "accepted" && oldQty > 0) {
        const oldItemClean = oldItemName.trim().toLowerCase();
        const oldItemResult = await client.query(
          `SELECT * FROM items WHERE LOWER(TRIM(name)) = $1`,
          [oldItemClean]
        );

        if (oldItemResult.rows.length > 0) {
          const oldItem = oldItemResult.rows[0];
          const revertedQty = Math.max(0, (oldItem.qty || 0) - oldQty);
          await client.query(
            `UPDATE items SET qty = $1, updated_at = NOW() WHERE id = $2`,
            [revertedQty, oldItem.id]
          );
          console.log(`↩️ Reverted stock: ${oldItem.name} (${oldItem.qty} → ${revertedQty})`);
        }
      }

      // Add new stock
      if (qtyNum > 0) {
        const itemNameClean = item_name.trim().toLowerCase();
        const itemResult = await client.query(
          `SELECT * FROM items WHERE LOWER(TRIM(name)) = $1`,
          [itemNameClean]
        );

        if (itemResult.rows.length > 0) {
          const item = itemResult.rows[0];
          const newQty = (item.qty || 0) + qtyNum;
          await client.query(
            `UPDATE items SET qty = $1, updated_at = NOW() WHERE id = $2`,
            [newQty, item.id]
          );
          console.log(`✅ Stock updated: ${item.name} (${item.qty} → ${newQty})`);
        } else {
          await client.query(
            `INSERT INTO items (name, qty, unit_type, supplier, created_by)
             VALUES ($1, $2, $3, $4, $5)`,
            [item_name.trim(), qtyNum, unit_type || null, supplier || null, updated_by || "System"]
          );
          console.log(`✅ New item created: ${item_name} with qty ${qtyNum}`);
        }
      }
    }

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating receiving:", error);
    res.status(500).json({ message: "Error updating receiving" });
  } finally {
    client.release();
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