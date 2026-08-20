import { generateAIText } from "../src/services/ai/ai.service.js";

const main = async () => {
  const result = await generateAIText(
    "Explain what a REST API is in one sentence.",
    {
      systemInstruction:
        "You are a concise software engineering assistant.",
      temperature: 0.2,
      maxOutputTokens: 100,
    },
  );

  console.log("\nAI RESPONSE:\n");
  console.log(result);
};

main().catch((error) => {
  console.error("\nAI TEST FAILED:\n");
  console.error(error);
  process.exit(1);
});