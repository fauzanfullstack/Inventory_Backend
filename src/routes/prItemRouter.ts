import { Router } from "express";
import {
  getPrItems,
  getPrItemById,
  createPrItem,
  updatePrItem,
  deletePrItem,
} from "../controllers/prItem.controller";

const router: Router = Router();

router.post("/", createPrItem);
router.get("/", getPrItems);
router.get("/:id", getPrItemById);
router.put("/:id", updatePrItem);
router.delete("/:id", deletePrItem);

export { router as prItemRoutes };
