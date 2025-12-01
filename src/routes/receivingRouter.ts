import { Router } from "express";
import {
  createReceiving,
  getReceivings,
  getReceivingById,
  updateReceiving,
  deleteReceiving,
} from "../controllers/receiving.controller";

import upload from "../middleware/upload";

const router: Router = Router();

router.post("/", upload.single("documentation"), createReceiving);

router.get("/", getReceivings);
router.get("/:id", getReceivingById);
router.put("/:id", upload.single("documentation"), updateReceiving);
router.delete("/:id", deleteReceiving);

export { router as receivingRoutes };
