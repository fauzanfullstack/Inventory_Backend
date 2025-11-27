"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conController = void 0;
const postgress_1 = __importDefault(require("../database/postgress"));
const conController = async (req, res) => {
    try {
        // Ambil koneksi langsung dari pool untuk test koneksi aktual
        const client = await postgress_1.default.connect();
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
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error instanceof Error ? error.message : String(error),
            connection_status: "Disconnected",
        });
    }
};
exports.conController = conController;
exports.default = { conController: exports.conController };
//# sourceMappingURL=conController.js.map