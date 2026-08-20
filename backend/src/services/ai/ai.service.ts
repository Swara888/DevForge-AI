import { GeminiProvider } from "./providers/gemini.provider.js";
import type {
  AIProvider,
  GenerateTextOptions,
} from "./types.js";

const provider: AIProvider = new GeminiProvider();

export const generateAIText = async (
  prompt: string,
  options?: GenerateTextOptions,
): Promise<string> => {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("AI prompt cannot be empty");
  }

  return provider.generateText(cleanPrompt, options);
};