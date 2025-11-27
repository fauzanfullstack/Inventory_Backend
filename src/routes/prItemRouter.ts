import { Router } from "express";
import {
  getPrItems,
  getPrItemById,
  createPrItem,
  updatePrItem,
  deletePrItem,
} from "../controllers/prItem.controller";

const router: Router = Router();

// ===============================
// PURCHASE REQUEST ITEM ROUTES
// ===============================

// ➕ Create new PR Item
router.post("/", createPrItem);

// 📄 Get all PR Items
router.get("/", getPrItems);

// 🔍 Get PR Item by ID
router.get("/:id", getPrItemById);

// ✏️ Update PR Item by ID
router.put("/:id", updatePrItem);

// ❌ Delete PR Item by ID
router.delete("/:id", deletePrItem);

// ===============================
// EXPORT ROUTER
// ===============================
export { router as prItemRoutes };
