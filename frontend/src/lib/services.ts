import { LlmConnectorData } from "@thesis/ckeditor5-llm-connector/interfaces/llm-connector-data.js";
import { createAutocompleteService } from "./utils";

const API_URL = import.meta.env.VITE_API_URL || "";

export const llamaService = (state: LlmConnectorData) =>
  createAutocompleteService(state, `${API_URL}/api/llama/autocomplete`);

export const gptService = (state: LlmConnectorData) =>
  createAutocompleteService(state, `${API_URL}/api/gpt/autocomplete`);
