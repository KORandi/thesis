import type { DataExample } from "../data/examples";

export const preprocessData = (
  dataExamples: DataExample[],
  username: string
) => {
  return dataExamples.map(({ role, content }) => {
    return role === "assistant"
      ? { role, content }
      : {
          role,
          content: addMetadata(content, username),
        };
  });
};

export const addMetadata = (content: string, username: string) => {
  return JSON.stringify({
    metadata: {
      username,
      user_role: "writer",
      assistant_role: "autocomplete",
    },
    document: content,
  });
};
