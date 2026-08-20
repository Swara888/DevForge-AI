import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { simpleGit } from "simple-git";

export const cloneRepository = async (
  repositoryUrl: string,
): Promise<string> => {
  const tempDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "devforge-"),
  );

  const repositoryPath = path.join(tempDirectory, "repository");

  const git = simpleGit();

  await git.clone(repositoryUrl, repositoryPath, [
    "--depth",
    "1",
  ]);

  return repositoryPath;
};

export const removeClonedRepository = async (
  repositoryPath: string,
): Promise<void> => {
  const tempDirectory = path.dirname(repositoryPath);

  await fs.rm(tempDirectory, {
    recursive: true,
    force: true,
  });
};