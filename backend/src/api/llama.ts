import { Router } from "express";
import { AutocompleteController } from "../controllers/autocompleteController";
import { OllamaService } from "../services/ollamaService";
import { loadSystemPrompt } from "../utils/loadSystemPrompt";
import { dataExamples } from "../data/examples";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

const systemPrompt = loadSystemPrompt();
const ollamaService = new OllamaService();
const autocompleteController = new AutocompleteController(
  ollamaService,
  systemPrompt,
  dataExamples
);

router.post("/autocomplete", authMiddleware, (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(500).json({ error: "Authentication error" });
    return;
  }
  autocompleteController.handleRequest(req, res, user);
});

export default router;
