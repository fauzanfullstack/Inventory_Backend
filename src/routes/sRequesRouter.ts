import { Router } from "express";
import {
  getSRequests,
  getSRequestById,
  createSRequest,
  updateSRequest,
  deleteSRequest,
} from "../controllers/sRequest.controller";

import upload from "../middleware/upload";

const router: Router = Router();

/**
 * CREATE SRequest (dengan upload file)
 * Field file input: "documentation"
 */
router.post("/", upload.single("documentation"), createSRequest);

/**
 * GET semua s_requests
 */
router.get("/", getSRequests);

/**
 * GET s_request by ID
 */
router.get("/:id", getSRequestById);

/**
 * UPDATE s_request (boleh upload file baru)
 */
router.put("/:id", upload.single("documentation"), updateSRequest);

/**
 * DELETE s_request
 */
router.delete("/:id", deleteSRequest);

export { router as sRequestRoutes };
