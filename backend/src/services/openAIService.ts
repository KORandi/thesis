import { OpenAI } from "openai";
import { DataExample } from "../data/examples";
import type { User } from "../middlewares/auth";
import { addMetadata, preprocessData } from "../utils/preprocessData";

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

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
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...preprocessData(examples, user.username),
        { role: "user", content: addMetadata(userText, user.username) },
      ],
      temperature,
      stream: true,
    });

    return {
      stream,
      abort: () => {
        stream.controller.abort();
      },
      getContent: (chunk: any): string => {
        return chunk?.choices[0]?.delta?.content || "";
      },
    };
  }
}
