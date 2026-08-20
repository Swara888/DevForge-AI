"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  Loader2,
} from "lucide-react";

import {
  getRepositoryFile,
  getRepositoryFiles,
  type RepositoryFile,
} from "@/lib/repository-files-api";

type RepositoryFileExplorerProps = {
  repositoryId: string;
  token: string;
};

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  file?: RepositoryFile;
  children?: TreeNode[];
};

const buildTree = (
  files: RepositoryFile[],
): TreeNode[] => {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      const isFile = index === parts.length - 1;

      let node = current.find(
        (item) => item.name === part,
      );

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          file: isFile ? file : undefined,
          children: isFile ? undefined : [],
        };

        current.push(node);
      }

      if (!isFile && node.children) {
        current = node.children;
      }
    });
  }

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (
        a.type === "folder" &&
        b.type === "file"
      ) {
        return -1;
      }

      if (
        a.type === "file" &&
        b.type === "folder"
      ) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      if (node.children) {
        sortTree(node.children);
      }
    }
  };

  sortTree(root);

  return root;
};

export default function RepositoryFileExplorer({
  repositoryId,
  token,
}: RepositoryFileExplorerProps) {
  const [files, setFiles] = useState<RepositoryFile[]>(
    [],
  );

  const [selectedFile, setSelectedFile] =
    useState<{
      id: string;
      path: string;
      language: string | null;
      content: string;
    } | null>(null);

  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [openFolders, setOpenFolders] =
    useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const loadFiles = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getRepositoryFiles(
            repositoryId,
            token,
          );

        if (cancelled) {
          return;
        }

        setFiles(response.data.files);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load repository files:",
          err,
        );

        setError(
          "Failed to load repository files.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFiles();

    return () => {
      cancelled = true;
    };
  }, [repositoryId, token]);

  const handleFileClick = async (
    file: RepositoryFile,
  ) => {
    try {
      setFileLoading(true);
      setError("");

      const response =
        await getRepositoryFile(
          repositoryId,
          file.id,
          token,
        );

      setSelectedFile(response.data.file);
    } catch (err) {
      console.error(
        "Failed to load file:",
        err,
      );

      setError("Failed to load file.");
    } finally {
      setFileLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    setOpenFolders((previous) => {
      const next = new Set(previous);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  };

  const renderTree = (
    nodes: TreeNode[],
    depth = 0,
  ): React.ReactNode => {
    return nodes.map((node) => {
      if (node.type === "folder") {
        const isOpen = openFolders.has(
          node.path,
        );

        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() =>
                toggleFolder(node.path)
              }
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              style={{
                paddingLeft: `${8 + depth * 16}px`,
              }}
            >
              {isOpen ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronRight size={15} />
              )}

              {isOpen ? (
                <FolderOpen
                  size={16}
                  className="text-blue-400"
                />
              ) : (
                <Folder
                  size={16}
                  className="text-blue-400"
                />
              )}

              <span className="truncate">
                {node.name}
              </span>
            </button>

            {isOpen &&
              node.children &&
              renderTree(
                node.children,
                depth + 1,
              )}
          </div>
        );
      }

      const isSelected =
        selectedFile?.id === node.file?.id;

      return (
        <button
          key={node.path}
          type="button"
          onClick={() => {
            if (node.file) {
              void handleFileClick(node.file);
            }
          }}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
            isSelected
              ? "bg-blue-600/15 text-blue-400"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
          style={{
            paddingLeft: `${24 + depth * 16}px`,
          }}
        >
          <FileCode2 size={15} />

          <span className="truncate">
            {node.name}
          </span>
        </button>
      );
    });
  };

  const tree = buildTree(files);

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">
          Repository Files
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Browse and inspect indexed source files.
        </p>
      </div>

      {error && (
        <div className="border-b border-red-900 bg-red-950/30 px-6 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            size={24}
            className="animate-spin text-blue-400"
          />

          <span className="ml-3 text-sm text-slate-400">
            Loading files...
          </span>
        </div>
      ) : files.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <FileCode2
            size={32}
            className="mx-auto text-slate-600"
          />

          <p className="mt-3 text-sm text-slate-400">
            No indexed files found.
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Index the repository first.
          </p>
        </div>
      ) : (
        <div className="grid min-h-[600px] lg:grid-cols-[320px_1fr]">
          <div className="border-b border-slate-800 p-3 lg:border-b-0 lg:border-r">
            <div className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-slate-600">
              {files.length} files
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {renderTree(tree)}
            </div>
          </div>

          <div className="min-w-0">
            {!selectedFile ? (
              <div className="flex h-full min-h-[500px] items-center justify-center px-6 text-center">
                <div>
                  <FileCode2
                    size={40}
                    className="mx-auto text-slate-700"
                  />

                  <p className="mt-4 text-sm text-slate-500">
                    Select a file to view its source code.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileCode2
                      size={16}
                      className="shrink-0 text-blue-400"
                    />

                    <span className="truncate text-sm font-medium text-white">
                      {selectedFile.path}
                    </span>
                  </div>

                  <span className="ml-4 shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-500">
                    {selectedFile.language ??
                      "text"}
                  </span>
                </div>

                {fileLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2
                      size={24}
                      className="animate-spin text-blue-400"
                    />
                  </div>
                ) : (
                  <pre className="max-h-[600px] overflow-auto bg-slate-950 p-5 text-sm leading-6 text-slate-300">
                    <code>
                      {selectedFile.content}
                    </code>
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}