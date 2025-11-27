import { Request, Response } from "express";
import pool from "../database/postgress"

export const conController = async (req: Request, res: Response) => {
    try {
        // Ambil koneksi langsung dari pool untuk test koneksi aktual
        const client = await pool.connect();

        // Jalankan query ringan
        const testQuery = 'SELECT NOW() AS current_time, version() AS pg_version';
        const result = await client.query(testQuery);

        // Lepaskan koneksi ke pool
        client.release();

        res.json({
            success: true,
            message: "PostgreSQL connection successful",
            data: {
                current_time: result.rows[0].current_time,
                pg_version: result.rows[0].pg_version,
                connection_status: "Connected",
            },
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error instanceof Error ? error.message : String(error),
            connection_status: "Disconnected",
        });
    }
};

export default { conController };