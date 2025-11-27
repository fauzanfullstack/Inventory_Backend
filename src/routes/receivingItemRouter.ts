import { Router } from "express";
import {
  createReceivingItem,
  getReceivingItems,
  getReceivingItemById,
  updateReceivingItem,
  deleteReceivingItem,
} from "../controllers/receivingItem.controller";
const router: Router = Router();

router.post("/", createReceivingItem);
router.get("/", getReceivingItems);
router.get("/:id", getReceivingItemById);
router.put("/:id", updateReceivingItem);
router.delete("/:id", deleteReceivingItem);

export { router as receivingItemRoutes };
