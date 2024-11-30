import { LlmConnectorData } from "@thesis/ckeditor5-llm-connector/interfaces/llm-connector-data.js";
import { createAutocompleteService } from "./utils";

const API_URL = process.env.REACT_APP_API_URL;

export const llamaService = (state: LlmConnectorData) =>
  createAutocompleteService(state, `${API_URL}/llama/autocomplete`);

export const gptService = (state: LlmConnectorData) =>
  createAutocompleteService(state, `${API_URL}/gpt/autocomplete`);
