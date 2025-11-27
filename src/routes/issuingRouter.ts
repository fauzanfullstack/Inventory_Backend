import express, { Router } from "express";
import {
  createIssuing,
  getIssuings,
  getIssuingById,
  updateIssuing,
  deleteIssuing,
} from "../controllers/issuing.controller";

const router: Router = express.Router();

router.post("/", createIssuing);
router.get("/", getIssuings);
router.get("/:id", getIssuingById);
router.put("/:id", updateIssuing);
router.delete("/:id", deleteIssuing);

export { router as issuingRoutes };
