"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const postgress_1 = __importDefault(require("./database/postgress"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Middleware router utama
app.use(express_1.default.json());
app.use("/", routes_1.routes);
/**
 * 🩺 Cek koneksi PostgreSQL saat server mulai
 */
(async () => {
    try {
        const result = await postgress_1.default.query("SELECT NOW() as current_time");
        console.log("🟢 PostgreSQL connected at:", result.rows[0].current_time);
    }
    catch (error) {
        console.error("🔴 Failed to connect to PostgreSQL:", error);
    }
})();
app.get("/", (req, res) => {
    res.send("Hello World! Belajar Membuat Backend Server!");
});
// Jalankan server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map