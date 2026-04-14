import { getSession } from "../../features/auth/session";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const session = getSession();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-kbase-actor": session.actorId,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(payload.detail ?? "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
