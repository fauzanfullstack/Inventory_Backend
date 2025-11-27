import { Router } from "express";
import { conController } from "../controllers/conController";

const router: Router = Router();

router.get("/status", conController);

export { router as conRoutes };