import { GoogleGenAI } from "@google/genai";

import { env } from "../../../config/env.js";
import type {
  AIProvider,
  GenerateTextOptions,
} from "../types.js";

const MODEL = "gemini-3.6-flash";

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
  httpOptions: {
    apiVersion: "v1",
  },
});

export class GeminiProvider implements AIProvider {
  async generateText(
    prompt: string,
    options: GenerateTextOptions = {},
  ): Promise<string> {
    const response = await ai.interactions.create({
      model: MODEL,
      input: prompt,
      system_instruction: options.systemInstruction,
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  }
}