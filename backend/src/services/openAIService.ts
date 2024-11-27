import { OpenAI } from "openai";
import { DataExample } from "../data/examples";

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async createStream(
    systemPrompt: string,
    examples: DataExample[],
    userText: string,
    temperature: number
  ) {
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...examples,
        { role: "user", content: userText },
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
