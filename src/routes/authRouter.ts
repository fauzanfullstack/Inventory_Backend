import express, { Router } from "express";
import { 
  register, 
  login, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from "../controllers/auth.controller";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router: Router = express.Router();


// PUBLIC ROUTES

// REGISTER & LOGIN tetap publik
router.post("/register", register);
router.post("/login", login);


// PROTECTED ROUTES (Admin Only)

// GET ALL USERS → cuma admin yang bisa akses
router.get("/users", authenticateToken, isAdmin, getUsers);

// GET USER BY ID → cuma admin yang bisa akses
router.get("/users/:id", authenticateToken, isAdmin, getUserById);

// UPDATE USER → cuma admin yang bisa akses
router.put("/users/:id", authenticateToken, isAdmin, updateUser);

// DELETE USER → cuma admin yang bisa akses
router.delete("/users/:id", authenticateToken, isAdmin, deleteUser);

export { router as authRoutes };