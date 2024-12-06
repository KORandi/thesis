import { Ollama } from "ollama";
import { DataExample } from "../data/examples";
import type { User } from "../middlewares/auth";
import { addMetadata, preprocessData } from "../utils/preprocessData";

const API_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

export class OllamaService {
  async createStream(
    user: User,
    examples: DataExample[],
    {
      systemPrompt,
      userText,
      temperature,
    }: {
      systemPrompt: string;
      userText: string;
      temperature: number;
    }
  ) {
    const { username } = user;
    const ollama = new Ollama({ host: API_URL });
    const stream = await ollama.chat({
      model: "llama3.2",
      messages: [
        { role: "system", content: systemPrompt },
        ...preprocessData(examples, username),
        { role: "user", content: addMetadata(userText, username) },
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
