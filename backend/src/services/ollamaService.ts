import { Ollama } from "ollama";
import { DataExample } from "../data/examples";

const API_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

export class OllamaService {
  async createStream(
    systemPrompt: string,
    examples: DataExample[],
    userText: string,
    temperature: number
  ) {
    const ollama = new Ollama({ host: API_URL });
    const stream = await ollama.chat({
      model: "llama3.2",
      messages: [
        { role: "system", content: systemPrompt },
        ...examples,
        { role: "user", content: userText },
      ],
      options: {
        temperature,
      },
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
