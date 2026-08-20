import {
  cloneRepository,
  removeClonedRepository,
} from "./github-clone.service.js";
import { ingestRepository } from "./repository-ingestion.service.js";

export const processRepository = async (
  repositoryId: string,
  repositoryUrl: string,
): Promise<void> => {
  let repositoryPath: string | null = null;

  try {
    console.log(`Cloning repository: ${repositoryUrl}`);

    repositoryPath = await cloneRepository(repositoryUrl);

    console.log(`Repository cloned to: ${repositoryPath}`);

    await ingestRepository(
      repositoryId,
      repositoryPath,
    );

    console.log("Repository processing completed.");
  } finally {
    if (repositoryPath) {
      await removeClonedRepository(repositoryPath);
      console.log("Temporary repository removed.");
    }
  }
};