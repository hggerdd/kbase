const rawBuildInfo =
  typeof __KBASE_BUILD_INFO__ === "undefined"
    ? {}
    : __KBASE_BUILD_INFO__;

function shortenCommit(commitHash) {
  if (!commitHash || commitHash === "unknown") {
    return "unknown";
  }
  return commitHash.slice(0, 7);
}

export function formatBuildDate(commitDate) {
  if (!commitDate) {
    return "unknown date";
  }
  const date = new Date(commitDate);
  if (Number.isNaN(date.getTime())) {
    return "unknown date";
  }
  return date.toISOString().slice(0, 10);
}

export function getBuildInfo() {
  const branch = rawBuildInfo.branch || "unknown";
  const deployment = rawBuildInfo.deployment || "dev";
  const commitHash = rawBuildInfo.commitHash || "unknown";
  const commitDate = rawBuildInfo.commitDate || "";
  return {
    branch,
    commitDate,
    commitDateLabel: formatBuildDate(commitDate),
    commitHash,
    commitShort: shortenCommit(commitHash),
    deployment,
    label: `${deployment} ${branch} ${shortenCommit(commitHash)}`,
  };
}

