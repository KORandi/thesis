import { Request, Response } from "express";
import { validatePassword, generateToken } from "../middlewares/auth";

export class AuthController {
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      if (!validatePassword(password)) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = generateToken(username);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  }
}
