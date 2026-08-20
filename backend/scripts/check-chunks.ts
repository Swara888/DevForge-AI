import { prisma } from "../src/lib/prisma.js";

const repositoryId =
  "8d9f1210-a142-46ce-86f1-1f67036a6ba9";

const totalChunks = await prisma.codeChunk.count({
  where: {
    repositoryId,
  },
});

const embeddedChunks = await prisma.$queryRaw<
  Array<{ count: number }>
>`
  SELECT COUNT(*)::int AS count
  FROM "CodeChunk"
  WHERE "repositoryId" = ${repositoryId}
    AND "embedding" IS NOT NULL
`;

console.log("TOTAL CODE CHUNKS:", totalChunks);
console.log("EMBEDDED CODE CHUNKS:", embeddedChunks);

await prisma.$disconnect();