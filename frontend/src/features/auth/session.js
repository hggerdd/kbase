const DEFAULT_ACTOR = import.meta?.env?.VITE_KBASE_ACTOR ?? "heiko";

export function getSession() {
  return {
    actorId: DEFAULT_ACTOR,
    mode: "single-user-local",
  };
}
