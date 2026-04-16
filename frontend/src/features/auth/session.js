function resolveApiBase() {
  const explicitBase = import.meta?.env?.VITE_API_BASE_URL;
  if (explicitBase !== undefined) {
    return explicitBase.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.origin;
  }

  return "http://127.0.0.1:8000";
}

const API_BASE = resolveApiBase();
let currentSession = null;

function buildApiUrl(path) {
  if (!API_BASE) {
    return path;
  }
  return `${API_BASE}${path}`;
}

function emitSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kbase:session-changed", { detail: currentSession }));
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }
  return response.json().catch(() => null);
}

export function getSession() {
  return currentSession;
}

export async function fetchSession() {
  const response = await fetch(buildApiUrl("/api/auth/session"), {
    credentials: "include",
  });

  if (response.status === 401) {
    currentSession = null;
    emitSessionChange();
    return null;
  }

  if (!response.ok) {
    const payload = await parseResponse(response);
    throw new Error(payload?.detail ?? "Session request failed");
  }

  currentSession = await parseResponse(response);
  emitSessionChange();
  return currentSession;
}

export async function login(username, password) {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(payload?.detail ?? "Login failed");
  }

  currentSession = payload;
  emitSessionChange();
  return currentSession;
}

export async function logout() {
  await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
  currentSession = null;
  emitSessionChange();
}
