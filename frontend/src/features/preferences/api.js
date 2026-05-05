import { request } from "../../shared/api/client.js";

export async function fetchUserPreference(preferenceKey) {
  return request(`/api/user-preferences/${encodeURIComponent(preferenceKey)}`);
}

export async function saveUserPreference(preferenceKey, value) {
  return request(`/api/user-preferences/${encodeURIComponent(preferenceKey)}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}
