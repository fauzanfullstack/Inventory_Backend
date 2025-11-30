import { Router } from "express";

// ===============================
// IMPORT SEMUA ROUTER
// ===============================
import { conRoutes } from "./conRouter";
import { purchaseRequestRoutes } from "./purchaseRequestRouter";
import { prItemRoutes } from "./prItemRouter";
import { issuingRoutes } from "./issuingRouter";
import { issuingItemRoutes } from "./issuingItemRouter";
import { marketlistRoutes } from "./marketlistRouter";
import { receivingRoutes } from "./receivingRouter";
import { receivingItemRoutes } from "./receivingItemRouter";
import { sRequestRoutes } from "./sRequesRouter";
import { srItemRoutes } from "./srItemRouter";
import { itemRoutes } from "./itemRouter";


// ✅ IMPORT AUTH ROUTER
import { authRoutes } from "./authRouter";

// ===============================
// INISIALISASI ROUTER UTAMA
// ===============================
const router: Router = Router();

// ===============================
// ROUTE DASAR
// ===============================
router.use("/api", conRoutes);

// ===============================
// ROUTE AUTH
// ===============================
router.use("/api/auth", authRoutes);

// ===============================
// ROUTE Item
// ===============================
router.use("/api/items", itemRoutes);

// ===============================
// PURCHASE REQUEST
// ===============================
router.use("/api/purchase-requests", purchaseRequestRoutes);
router.use("/api/purchase-request-items", prItemRoutes);

// ===============================
// ISSUING
// ===============================
router.use("/api/issuings", issuingRoutes);
router.use("/api/issuing-items", issuingItemRoutes);

// ===============================
// MARKETLIST
// ===============================
router.use("/api/marketlists", marketlistRoutes);

// ===============================
// RECEIVING
// ===============================
router.use("/api/receivings", receivingRoutes);
router.use("/api/receiving-items", receivingItemRoutes);

// ===============================
// S-REQUEST
// ===============================
router.use("/api/s-requests", sRequestRoutes);
router.use("/api/sr-items", srItemRoutes);

// ===============================
// EXPORT ROUTER
// ===============================
export { router as routes };
