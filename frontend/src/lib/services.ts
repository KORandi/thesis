import { ContentFetcherProps } from "@thesis/ckeditor5-ghost-text/interfaces/content-fetcher.d.ts";
import { getPlainText } from "@thesis/ckeditor5-llm-connector";
import { Frequency } from "@thesis/ckeditor5-llm-connector";
import { LlmConnectorData } from "@thesis/ckeditor5-llm-connector/interfaces/llm-connector-data.js";

const shouldTriggerAutocomplete = (
  content: string,
  frequency: Frequency
): boolean => {
  switch (frequency) {
    case "disabled":
      return false;
    case "onKeyPress":
      return content.includes("[[cursor]]");
    case "onWordComplete":
      return /.\s\[\[cursor\]\]|\n\[\[cursor\]\]/u.test(content);
    case "onSentenceComplete":
      return /[!.?]\s\[\[cursor\]\]/g.test(content);
    default:
      return false;
  }
};

const createReadableStream = (response: Response): ReadableStream<string> => {
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.error(new Error("No readable stream in response."));
        return;
      }

      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (error) {
        console.error("Error while reading stream:", error);
        controller.error(error);
      }
    },
  });
};

const createAutocompleteService = (
  state: LlmConnectorData,
  endpoint: string
) => {
  return async ({
    editor,
    signal,
  }: ContentFetcherProps): Promise<ReadableStream | string> => {
    const root = editor.model.document.getRoot();
    if (!root) return "";

    const content: string = getPlainText(root);

    if (!shouldTriggerAutocomplete(content, state.frequency)) {
      return "";
    }

    const requestBody = JSON.stringify({
      text: content,
      temperature: state.temperature / 100,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return createReadableStream(response);
  };
};

// Create specific services for LLaMA and GPT
export const llamaService = (state: LlmConnectorData) =>
  createAutocompleteService(state, "http://localhost:8000/llama/autocomplete");

export const gptService = (state: LlmConnectorData) =>
  createAutocompleteService(state, "http://localhost:8000/gpt/autocomplete");
