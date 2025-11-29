import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secret_key_123";

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// Middleware verifikasi token (opsional)
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token && typeof req.query.token === "string") {
    token = req.query.token; // opsional untuk testing
  }

  if (!token) {
    // Token tidak ada → tetap lanjut
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user: any) => {
    if (err) {
      console.error("JWT verification error:", err);
      // Token tidak valid → tetap lanjut, tapi req.user tetap undefined
      return next();
    }

    req.user = user;
    next();
  });
};

// Middleware cek admin tetap sama
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
