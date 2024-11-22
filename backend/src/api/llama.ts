import { Router } from "express";
import { AutocompleteController } from "../controllers/autocompleteController";
import { OllamaService } from "../services/ollamaService";
import { loadSystemPrompt } from "../utils/loadSystemPrompt";
import { dataExamples } from "../data/examples";

const router = Router();

const systemPrompt = loadSystemPrompt();
const ollamaService = new OllamaService();
const autocompleteController = new AutocompleteController(
  ollamaService,
  systemPrompt,
  dataExamples
);

router.post("/autocomplete", (req, res) =>
  autocompleteController.handleRequest(req, res)
);

export default router;
