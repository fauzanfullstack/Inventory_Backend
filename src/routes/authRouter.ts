import express, { Router } from "express";
import { register, login, getUsers } from "../controllers/auth.controller";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router: Router = express.Router();

// REGISTER & LOGIN tetap publik
router.post("/register", register);
router.post("/login", login);

// GET ALL USERS → cuma admin yang bisa akses
router.get("/users", authenticateToken, isAdmin, getUsers);

export { router as authRoutes };
