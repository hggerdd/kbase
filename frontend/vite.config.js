import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { inflateSync } from "node:zlib";
import { defineConfig, loadEnv } from "vite";

function findGitDirectory(startDirectory) {
  let currentDirectory = startDirectory;
  while (currentDirectory !== dirname(currentDirectory)) {
    const candidate = join(currentDirectory, ".git");
    if (existsSync(candidate)) {
      const statsPath = candidate;
      try {
        const content = readFileSync(statsPath, "utf8");
        if (content.startsWith("gitdir:")) {
          return resolve(currentDirectory, content.replace("gitdir:", "").trim());
        }
      } catch {
        return candidate;
      }
      return candidate;
    }
    currentDirectory = dirname(currentDirectory);
  }
  return null;
}

function readGitRef(gitDirectory, refName) {
  const refPath = join(gitDirectory, refName);
  if (existsSync(refPath)) {
    return readFileSync(refPath, "utf8").trim();
  }

  const packedRefsPath = join(gitDirectory, "packed-refs");
  if (!existsSync(packedRefsPath)) {
    return "";
  }
  const packedRef = readFileSync(packedRefsPath, "utf8")
    .split(/\r?\n/)
    .find((line) => line.endsWith(` ${refName}`));
  return packedRef?.split(" ")[0] ?? "";
}

function readCommitDate(gitDirectory, commitHash) {
  if (!commitHash || commitHash.length < 2) {
    return "";
  }
  const objectPath = join(gitDirectory, "objects", commitHash.slice(0, 2), commitHash.slice(2));
  if (!existsSync(objectPath)) {
    return "";
  }
  try {
    const commitObject = inflateSync(readFileSync(objectPath)).toString("utf8");
    const committerLine = commitObject.split("\n").find((line) => line.startsWith("committer "));
    const timestamp = committerLine?.match(/\s(\d+)\s[+-]\d{4}$/)?.[1];
    return timestamp ? new Date(Number(timestamp) * 1000).toISOString() : "";
  } catch {
    return "";
  }
}

function readReflogDate(gitDirectory) {
  const reflogPath = join(gitDirectory, "logs", "HEAD");
  if (!existsSync(reflogPath)) {
    return "";
  }
  const lastLine = readFileSync(reflogPath, "utf8").trim().split(/\r?\n/).at(-1) ?? "";
  const timestamp = lastLine.match(/\s(\d+)\s[+-]\d{4}\s/)?.[1];
  return timestamp ? new Date(Number(timestamp) * 1000).toISOString() : "";
}

function readGitCommandMetadata() {
  try {
    return {
      branch: execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim(),
      commitDate: execFileSync("git", ["log", "-1", "--format=%cI"], { encoding: "utf8" }).trim(),
      commitHash: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    };
  } catch {
    return {};
  }
}

function readGitMetadata() {
  const commandMetadata = readGitCommandMetadata();
  if (commandMetadata.commitHash) {
    return commandMetadata;
  }

  const gitDirectory = findGitDirectory(process.cwd());
  if (!gitDirectory) {
    return {};
  }

  let head = "";
  try {
    head = readFileSync(join(gitDirectory, "HEAD"), "utf8").trim();
  } catch {
    return {};
  }
  const refMatch = head.match(/^ref:\s+(.+)$/);
  const refName = refMatch?.[1] ?? "";
  const commitHash = refName ? readGitRef(gitDirectory, refName) : head;
  const branch = refName ? refName.replace("refs/heads/", "") : "detached";

  return {
    branch,
    commitDate: readCommitDate(gitDirectory, commitHash) || readReflogDate(gitDirectory),
    commitHash,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gitMetadata = readGitMetadata();
  const configured = (value) => (value && value !== "unknown" ? value : "");
  const buildInfo = {
    branch: configured(env.VITE_KBASE_GIT_BRANCH) || gitMetadata.branch || "unknown",
    commitDate: configured(env.VITE_KBASE_GIT_COMMIT_DATE) || gitMetadata.commitDate || "",
    commitHash: configured(env.VITE_KBASE_GIT_COMMIT) || gitMetadata.commitHash || "unknown",
    deployment: env.VITE_KBASE_DEPLOYMENT_LABEL || (mode === "production" ? "prod" : "dev"),
  };

  return {
    define: {
      __KBASE_BUILD_INFO__: JSON.stringify(buildInfo),
    },
    server: {
      host: env.VITE_DEV_HOST || "127.0.0.1",
      port: Number(env.VITE_DEV_PORT || 5173),
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000",
          changeOrigin: true,
        },
        "/health": {
          target: env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000",
          changeOrigin: true,
        },
      },
    },
  };
});
