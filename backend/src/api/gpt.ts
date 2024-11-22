import { Router } from "express";
import { AutocompleteController } from "../controllers/autocompleteController";
import { OpenAIService } from "../services/openAIService";
import { loadSystemPrompt } from "../utils/loadSystemPrompt";
import { dataExamples } from "../data/examples";

const router = Router();
const systemPrompt = loadSystemPrompt();
const openAIService = new OpenAIService(process.env.OPENAI_API_KEY || "");
const autocompleteController = new AutocompleteController(
  openAIService,
  systemPrompt,
  dataExamples
);

// Route setup
router.post("/autocomplete", (req, res) =>
  autocompleteController.handleRequest(req, res)
);

export default router;
