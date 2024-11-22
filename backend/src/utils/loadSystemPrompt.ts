import { readFileSync } from "fs";
import { resolve } from "path";

export const loadSystemPrompt = (): string => {
  const filePath = resolve(__dirname, "../../prompts/systemPrompt.md");
  return readFileSync(filePath, "utf-8");
};
