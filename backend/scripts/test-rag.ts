import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";
import { retrieveRelevantCode } from "../src/services/rag/rag.service.js";
import { buildCodeContext } from "../src/services/rag/context-builder.service.js";

const main = async (): Promise<void> => {
  const repository = await prisma.repository.findUnique({
    where: {
      id: "b48ff5f5-7c6c-4994-b9d7-dfeab40fbdc6",
    },
    select: {
      id: true,
      name: true,
      userId: true,
    },
  });

  if (!repository) {
    throw new Error("No repository found");
  }

  console.log(`Repository: ${repository.name}`);
  console.log(`Repository ID: ${repository.id}`);
  console.log(`User ID: ${repository.userId}`);

  const query =
    "complaints_list complaint_detail POST PUT create update";

  console.log(`Query: ${query}`);

  const results = await retrieveRelevantCode(
    repository.id,
    repository.userId,
    query,
    5,
  );

  console.log(`Retrieved ${results.length} chunks.`);

  console.log("\n--- CONTEXT ---\n");

  console.log(buildCodeContext(results));

  console.log("\n--- END CONTEXT ---");
};

main()
  .catch((error) => {
    console.error("RAG test failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });