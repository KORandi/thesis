import { ContentFetcherProps } from "@thesis/ckeditor5-ghost-text/interfaces/content-fetcher.js";
import { Frequency, getPlainText } from "@thesis/ckeditor5-llm-connector";
import { LlmConnectorData } from "@thesis/ckeditor5-llm-connector/interfaces/llm-connector-data.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const shouldTriggerAutocomplete = (
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

export const createReadableStream = (
  response: Response
): ReadableStream<string> => {
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

export const createAutocompleteService = (
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
      text: getContextWindow(content),
      temperature: state.temperature / 100,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: requestBody,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return createReadableStream(response);
  };
};

const getContextWindow = (text: string, size = 1000) => {
  const cursorPosition = text.indexOf("[[cursor]]");
  if (cursorPosition === -1) return text;

  const start = Math.max(0, cursorPosition - size);
  const end = Math.min(text.length, cursorPosition + size);

  return text.slice(start, end);
};
