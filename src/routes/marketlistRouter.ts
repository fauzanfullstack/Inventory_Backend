import { Router } from "express";
import {
  getMarketlists,
  getMarketlistById,
  createMarketlist,
  updateMarketlist,
  deleteMarketlist,
} from "../controllers/marketlist.controller";

const router: Router = Router();

// ===============================
// MARKETLIST ROUTES
// ===============================

// 📄 Get all marketlists
router.get("/", getMarketlists);

// 🔍 Get marketlist by ID
router.get("/:id", getMarketlistById);

// ➕ Create new marketlist
router.post("/", createMarketlist);

// ✏️ Update marketlist by ID
router.put("/:id", updateMarketlist);

// ❌ Delete marketlist by ID
router.delete("/:id", deleteMarketlist);

// ===============================
// EXPORT ROUTER
// ===============================
export { router as marketlistRoutes };
