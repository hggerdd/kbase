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

export function buildApiUrl(path) {
  if (!API_BASE) {
    return path;
  }
  return `${API_BASE}${path}`;
}

export async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const method = String(options.method ?? "GET").toUpperCase();
  const cache = options.cache ?? (method === "GET" || method === "HEAD" ? "no-store" : undefined);
  const response = await fetch(buildApiUrl(path), {
    credentials: "include",
    cache,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Request failed" }));
    const error = new Error(payload.detail ?? "Request failed");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function uploadRequest(path, { body, headers = {}, method = "POST", onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const xhr = new XMLHttpRequest();
    xhr.open(method, buildApiUrl(path), true);
    xhr.withCredentials = true;

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }
      const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
      const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001);
      const bytesPerSecond = event.loaded / elapsedSeconds;
      const remainingBytes = Math.max(event.total - event.loaded, 0);
      const etaSeconds = bytesPerSecond > 0 ? remainingBytes / bytesPerSecond : null;
      onProgress({
        bytesPerSecond,
        etaSeconds,
        loaded: event.loaded,
        percent,
        total: event.total,
      });
    };

    xhr.onerror = () => reject(new Error("Request failed"));

    xhr.onload = () => {
      const responseText = xhr.responseText || "";
      const payload = responseText ? JSON.parse(responseText) : null;

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({
          bytesPerSecond: null,
          etaSeconds: 0,
          loaded: null,
          percent: 100,
          total: null,
        });
        resolve(payload);
        return;
      }

      reject(new Error(payload?.detail ?? "Request failed"));
    };

    xhr.send(body);
  });
}
