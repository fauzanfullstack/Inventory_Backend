import { Router } from "express";
import {
  getSRequests,
  getSRequestById,
  createSRequest,
  updateSRequest,
  deleteSRequest,
} from "../controllers/sRequest.controller";

const router: Router = Router();


router.post("/", createSRequest);
router.get("/", getSRequests);
router.get("/:id", getSRequestById);
router.put("/:id", updateSRequest);
router.delete("/:id", deleteSRequest);

export { router as sRequestRoutes };
