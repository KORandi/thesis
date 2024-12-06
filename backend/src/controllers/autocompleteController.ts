import { Request, Response } from "express";
import { OpenAIService } from "../services/openAIService";
import { OllamaService } from "../services/ollamaService";
import { DataExample } from "../data/examples";
import { extractAroundCursor } from "../utils/extractAroundCursor";
import type { User } from "../middlewares/auth";

const ERRORS = {
  CURSOR: "Input text must contain [[cursor]].",
  TEMPERATURE: "Input temperature should be a number between 0 and 1.",
};

const CURSOR_MARKER = "[[cursor]]";

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

  async handleRequest(req: Request, res: Response, user: User): Promise<void> {
    try {
      const { text, temperature } = req.body;

      this.validateInput(text, temperature);

      const shortText = extractAroundCursor(text, CURSOR_MARKER, 500);
      if (!shortText) throw new Error(ERRORS.CURSOR);

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");

      await this.streamResponse(req, res, { shortText, temperature, user });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private validateInput(text: string, temperature: any): void {
    if (!text || !text.includes(CURSOR_MARKER)) {
      throw new Error(ERRORS.CURSOR);
    }

    if (typeof temperature !== "number" || temperature < 0 || temperature > 1) {
      throw new Error(ERRORS.TEMPERATURE);
    }
  }

  private async streamResponse(
    req: Request,
    res: Response,
    {
      shortText,
      temperature,
      user,
    }: {
      shortText: string;
      temperature: number;
      user: User;
    }
  ): Promise<void> {
    const { stream, abort, getContent } = await this.service.createStream(
      user,
      this.dataExamples,
      {
        userText: shortText,
        temperature,
        systemPrompt: this.systemPrompt,
      }
    );

    let responseEnded = false;

    const cleanup = () => {
      if (!responseEnded) {
        responseEnded = true;
        if (abort) abort();
        res.end();
      }
    };

    req.socket.on("close", cleanup);

    try {
      for await (const chunk of stream) {
        if (responseEnded) return;
        res.write(getContent(chunk));
      }
    } catch (error) {
      console.error("Error in streaming:", error);
      cleanup();
      throw error;
    } finally {
      cleanup();
    }
  }

  private handleError(res: Response, error: any): void {
    console.error("Error handling request:", error);

    if (!res.writableEnded) {
      const statusCode =
        error.message === ERRORS.CURSOR || error.message === ERRORS.TEMPERATURE
          ? 400
          : 500;
      res
        .status(statusCode)
        .json({ error: error.message || "Internal Server Error" });
    }
  }
}
