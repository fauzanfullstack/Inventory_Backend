import express, { Router } from "express";
import {
  createPurchaseRequest,
  getPurchaseRequests,
  getPurchaseRequestById,
  updatePurchaseRequest,
  deletePurchaseRequest,
} from "../controllers/purchaseRequest.controller";

import { authenticateToken } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Semua route harus login
router.use(authenticateToken);

// CREATE PR → semua user bisa
router.post("/", createPurchaseRequest);

// GET ALL PR → user lihat miliknya, admin lihat semua
router.get("/", getPurchaseRequests);

// GET PR BY ID → user bisa akses miliknya, admin bisa akses semua
router.get("/:id", getPurchaseRequestById);

// UPDATE PR → hanya admin
router.put("/:id", updatePurchaseRequest);

// DELETE PR → hanya admin
router.delete("/:id", deletePurchaseRequest);

export { router as purchaseRequestRoutes };
