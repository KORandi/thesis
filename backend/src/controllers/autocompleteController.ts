import { Request, Response } from "express";
import { OpenAIService } from "../services/openAIService";
import { OllamaService } from "../services/ollamaService";
import { DataExample } from "../data/examples";

export class AutocompleteController {
  private service: OpenAIService | OllamaService;
  private systemPrompt: string;
  private dataExamples: DataExample[];

  constructor(
    service: OpenAIService | OllamaService,
    systemPrompt: string,
    dataExamples: DataExample[]
  ) {
    this.service = service;
    this.systemPrompt = systemPrompt;
    this.dataExamples = dataExamples;
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const { text } = req.body;

    if (!text || !text.includes("[[cursor]]")) {
      res.status(400).json({ error: "Input text must contain [[cursor]]." });
      return;
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
      const { stream, abort, getContent } = await this.service.createStream(
        this.systemPrompt,
        this.dataExamples,
        text
      );

      req.on("close", () => {
        abort();
        console.log("Client connection closed. Aborting stream.");
      });

      for await (const chunk of stream) {
        res.write(getContent(chunk));
      }

      res.end();
    } catch (error) {
      console.error("Error in streaming:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the request." });
    }
  }
}
