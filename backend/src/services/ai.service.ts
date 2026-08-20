import { pipeline } from "@huggingface/transformers";

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

let embeddingPipeline: any = null;

const getEmbeddingPipeline = async () => {
  if (!embeddingPipeline) {
    console.log("Loading local embedding model...");

    embeddingPipeline = await pipeline(
      "feature-extraction",
      MODEL_NAME,
    );

    console.log("Local embedding model loaded.");
  }

  return embeddingPipeline;
};

export const createEmbedding = async (
  text: string,
): Promise<number[]> => {
  if (!text.trim()) {
    throw new Error("Cannot create embedding from empty text");
  }

  const extractor = await getEmbeddingPipeline();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
};