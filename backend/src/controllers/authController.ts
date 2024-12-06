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

      if (!this.validateUsername(username)) {
        res.status(400).json({ error: "Invalid username format" });
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

  private validateUsername(username: string): boolean {
    // Allow only alphanumerics, spaces, dashes, underscores, and dots
    const validFormat = /^[a-zA-Z0-9\s\-_.]{1,50}$/;
    return validFormat.test(username);
  }
}
