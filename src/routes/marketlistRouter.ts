import { Router } from "express";
import {
  getMarketlists,
  getMarketlistById,
  createMarketlist,
  updateMarketlist,
  deleteMarketlist,
} from "../controllers/marketlist.controller";

const router: Router = Router();


router.get("/", getMarketlists);
router.get("/:id", getMarketlistById);
router.post("/", createMarketlist);
router.put("/:id", updateMarketlist);
router.delete("/:id", deleteMarketlist);

export { router as marketlistRoutes };
