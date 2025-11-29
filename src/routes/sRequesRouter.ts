import { Router } from "express";
import {
  getSRequests,
  getSRequestById,
  createSRequest,
  updateSRequest,
  deleteSRequest,
} from "../controllers/sRequest.controller";

const router: Router = Router();

/**
 * CREATE SRequest (tanpa upload file)
 */
router.post("/", createSRequest);

/**
 * GET semua s_requests
 */
router.get("/", getSRequests);

/**
 * GET s_request by ID
 */
router.get("/:id", getSRequestById);

/**
 * UPDATE s_request (tanpa upload file)
 */
router.put("/:id", updateSRequest);

/**
 * DELETE s_request
 */
router.delete("/:id", deleteSRequest);

export { router as sRequestRoutes };
