export interface GenerateTextOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AIProvider {
  generateText(
    prompt: string,
    options?: GenerateTextOptions,
  ): Promise<string>;
}