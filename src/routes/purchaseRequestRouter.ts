import express, { Router } from "express";
import {
  createPurchaseRequest,
  getPurchaseRequests,
  getPurchaseRequestById,
  updatePurchaseRequest,
  deletePurchaseRequest,
} from "../controllers/purchaseRequest.controller";

const router: Router = express.Router();
router.post("/", createPurchaseRequest);
router.get("/", getPurchaseRequests);
router.get("/:id", getPurchaseRequestById);
router.put("/:id", updatePurchaseRequest);
router.delete("/:id", deletePurchaseRequest);

export { router as purchaseRequestRoutes };
