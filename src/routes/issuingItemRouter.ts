import express, { Router } from "express";
import {
  createIssuingItem,
  getAllIssuingItems,
  getIssuingItemById,
  getIssuingItemsByIssuingId,
  updateIssuingItem,
  deleteIssuingItem,
} from "../controllers/issuingItem.controller";

const router: Router = express.Router();

router.get("/", getAllIssuingItems);
router.get("/issuing/:issuing_id", getIssuingItemsByIssuingId);
router.get("/:id", getIssuingItemById);
router.post("/", createIssuingItem);
router.put("/:id", updateIssuingItem);
router.delete("/:id", deleteIssuingItem);


export { router as issuingItemRoutes };
