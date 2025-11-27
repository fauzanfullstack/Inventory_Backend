import { Router } from "express";
import {
  createSrItem,
  getAllSrItems,
  getSrItemById,
  updateSrItem,
  deleteSrItem,
} from "../controllers/srItem.controller";

const router: Router = Router();

router.post("/", createSrItem);
router.get("/", getAllSrItems);
router.get("/:id", getSrItemById);
router.put("/:id", updateSrItem);
router.delete("/:id", deleteSrItem);

export { router as srItemRoutes };
