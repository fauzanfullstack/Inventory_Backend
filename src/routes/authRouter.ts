// src/routes/authRouter.ts
import express, { Router } from "express";
import { register, login, getUsers } from "../controllers/auth.controller";

const router: Router = express.Router();

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// GET ALL USERS
router.get("/users", getUsers);

export { router as authRoutes };
