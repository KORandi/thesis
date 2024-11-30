const path = require("path");
const fs = require("fs");

export const loadSystemPrompt = (): string => {
  const filePath = path.resolve(__dirname, "../../prompts/systemPrompt.md");
  return fs.readFileSync(filePath, "utf8");
};
