import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";
import { processRepository } from "../src/services/ingestion/process-repository.service.js";

const main = async () => {
  const repositoryUrl =
    "https://github.com/Swara888/Complaint-Box.git";

  const repository = await prisma.repository.create({
    data: {
      userId: "1af67d46-4407-4b2d-b500-a1b761535424",
      name: "Complaint-Box",
      owner: "Swara888",
      url: repositoryUrl,
      status: "PENDING",
    },
  });

  console.log(`Repository created: ${repository.id}`);

  await processRepository(
    repository.id,
    repository.url,
  );

  const result = await prisma.repository.findUnique({
    where: {
      id: repository.id,
    },
    include: {
      files: true,
      codeChunks: true,
    },
  });

  console.log({
    repositoryId: result?.id,
    status: result?.status,
    files: result?.files.length,
    chunks: result?.codeChunks.length,
  });
};

main()
  .catch((error) => {
    console.error("Repository ingestion failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });