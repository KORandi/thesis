import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_ERROR = "JWT_SECRET has not been set";

declare global {
  namespace Express {
    interface Request {
      user?: { username: string };
    }
  }
}

export const generateToken = (username: string): string => {
  if (!JWT_SECRET) throw new Error(JWT_ERROR);
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = (token: string): { username: string } | null => {
  try {
    if (!JWT_SECRET) throw new Error(JWT_ERROR);
    return jwt.verify(token, JWT_SECRET) as { username: string };
  } catch {
    return null;
  }
};

export const validatePassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing authentication token" });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication error" });
    return;
  }
};
