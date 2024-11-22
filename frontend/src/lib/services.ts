import { ContentFetcherProps } from "@thesis/ckeditor5-ghost-text/interfaces/content-fetcher.d.ts";
import { getPlainText } from "@thesis/ckeditor5-llm-connector";
import { Frequency } from "@thesis/ckeditor5-llm-connector";
import { ClassicEditor } from "ckeditor5";
import { RefObject } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

/**
 * Initializes event listeners for configuration updates.
 * Updates the provided state variables on receiving relevant events.
 * @param ckeditor - A React ref object containing the CKEditor instance.
 * @param state - An object containing state variables to update.
 */
const initializeEventListeners = (
  ckeditor: RefObject<CKEditor<ClassicEditor>>,
  state: { accuracy: number; frequency: Frequency; metadata: string }
) => {
  window.addEventListener("load", () => {
    const editorInstance = ckeditor.current?.editor;
    if (!editorInstance) return;

    editorInstance.on("parameterConfig:submit", (_, data) => {
      Object.assign(state, data);
    });
  });
};

/**
 * Determines whether autocomplete should trigger based on frequency and content.
 * @param content - The plain text content of the editor.
 * @param frequency - The frequency configuration for triggering autocomplete.
 * @returns A boolean indicating if autocomplete should trigger.
 */
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

/**
 * Creates a readable stream from a fetch response body.
 * @param response - The fetch response object.
 * @returns A readable stream or throws an error if not possible.
 */
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

/**
 * Creates a service for handling autocomplete integration with CKEditor.
 * @param ckeditor - A React ref object containing the CKEditor instance.
 * @param endpoint - The API endpoint for fetching autocomplete content.
 * @returns An async function for fetching autocomplete content.
 */
const createAutocompleteService = (
  ckeditor: RefObject<CKEditor<ClassicEditor>>,
  endpoint: string
) => {
  const state = {
    accuracy: 80,
    frequency: "onWordComplete" as Frequency,
    metadata: "",
  };

  initializeEventListeners(ckeditor, state);

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
      accuracy: state.accuracy,
      metadata: state.metadata,
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
export const llamaService = (ckeditor: RefObject<CKEditor<ClassicEditor>>) =>
  createAutocompleteService(
    ckeditor,
    "http://localhost:8000/llama/autocomplete"
  );

export const gptService = (ckeditor: RefObject<CKEditor<ClassicEditor>>) =>
  createAutocompleteService(ckeditor, "http://localhost:8000/gpt/autocomplete");
