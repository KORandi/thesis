import ollama from "ollama";
import { DataExample } from "../data/examples";

export class OllamaService {
  async createStream(
    systemPrompt: string,
    examples: DataExample[],
    userText: string
  ) {
    const stream = await ollama.chat({
      model: "llama3.2",
      messages: [
        { role: "system", content: systemPrompt },
        ...examples,
        { role: "user", content: userText },
      ],
      stream: true,
    });

    return {
      stream,
      abort: () => {
        stream.abort();
      },
      getContent: (chunk: any): string => {
        return chunk?.message?.content || "";
      },
    };
  }
}
