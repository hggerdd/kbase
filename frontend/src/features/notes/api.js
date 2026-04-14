import { request, uploadRequest } from "../../shared/api/client.js";

export async function fetchNotes(query = "", { limit = 100 } = {}) {
  const path = query
    ? `/api/search/content?query=${encodeURIComponent(query)}&item_kinds=note&limit=${limit}`
    : `/api/items?item_kind=note&limit=${limit}`;
  const payload = await request(path);
  return payload.items;
}

export async function fetchNote(itemId) {
  return request(`/api/items/${itemId}`);
}

export async function createNote(input) {
  return request("/api/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateNoteCore(itemId, input) {
  return request(`/api/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function replaceNoteContent(itemId, input) {
  return request(`/api/items/${itemId}/content`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function fetchHistory(itemId) {
  return request(`/api/items/${itemId}/history`);
}

export async function fetchLabels(query = "") {
  const path = query ? `/api/labels?query=${encodeURIComponent(query)}` : "/api/labels";
  return request(path);
}

export async function replaceLabels(itemId, labelPaths) {
  return request(`/api/items/${itemId}/labels`, {
    method: "PUT",
    body: JSON.stringify({ label_paths: labelPaths }),
  });
}

export async function uploadAttachment(
  itemId,
  file,
  { caption = "", relationshipRole = "attachment", onProgress } = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("link_to_item_id", itemId);
  formData.append("link_type", relationshipRole);
  if (caption) {
    formData.append("link_note", caption);
  }
  return uploadRequest("/api/file-items/upload", {
    method: "POST",
    body: formData,
    onProgress,
  });
}
