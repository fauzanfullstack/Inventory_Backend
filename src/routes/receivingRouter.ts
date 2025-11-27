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

/**
 * CREATE Receiving (dengan upload file)
 * Field file input: "documentation"
 */
router.post("/", upload.single("documentation"), createReceiving);

/**
 * GET semua receiving
 */
router.get("/", getReceivings);

/**
 * GET receiving by ID
 */
router.get("/:id", getReceivingById);

/**
 * UPDATE receiving (boleh upload file baru)
 */
router.put("/:id", upload.single("documentation"), updateReceiving);

/**
 * DELETE receiving
 */
router.delete("/:id", deleteReceiving);

export { router as receivingRoutes };
