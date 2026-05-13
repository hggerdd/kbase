import { buildApiUrl, request, uploadRequest } from "../../shared/api/client.js";
import { FILE_ITEM_KINDS } from "./state.js";

export async function fetchFileItemSummaries() {
  const params = new URLSearchParams();
  for (const itemKind of FILE_ITEM_KINDS) {
    params.append("item_kinds", itemKind);
  }
  params.set("limit", "250");
  params.set("offset", "0");
  const payload = await request(`/api/search/content?${params.toString()}`);
  return payload.items;
}

export async function fetchFileItemDetail(itemId) {
  return request(`/api/items/${itemId}`);
}

export async function fetchFileCategories() {
  const payload = await request("/api/categories?limit=500");
  return payload.categories ?? [];
}

export async function fetchFileLabels(query = "") {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  params.set("limit", "500");
  return request(`/api/labels?${params.toString()}`);
}

export async function fetchFileProjects({ limit = 200 } = {}) {
  const payload = await request(`/api/items?item_kind=project&limit=${limit}`);
  return payload.items;
}

export async function updateFileCore(itemId, input) {
  return request(`/api/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function replaceFileLabels(itemId, labelPaths) {
  return request(`/api/items/${itemId}/labels`, {
    method: "PUT",
    body: JSON.stringify({ label_paths: labelPaths }),
  });
}

export async function replaceFileProjects(itemId, projectIds) {
  return request(`/api/items/${itemId}/projects`, {
    method: "PUT",
    body: JSON.stringify({ project_ids: projectIds }),
  });
}

export async function replaceFileSummary(itemId, markdownBody) {
  return request(`/api/items/${itemId}/content`, {
    method: "PUT",
    body: JSON.stringify({
      content_text: markdownBody,
      change_reason: "file-summary-edit",
    }),
  });
}

export async function uploadFileItem(file, input = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (input.title) {
    formData.append("title", input.title);
  }
  if (input.item_kind) {
    formData.append("item_kind", input.item_kind);
  }
  if (input.category_key) {
    formData.append("category_key", input.category_key);
  }
  if (input.status) {
    formData.append("status", input.status);
  }
  for (const projectId of input.project_ids ?? []) {
    formData.append("project_ids", projectId);
  }
  return uploadRequest("/api/file-items/upload", {
    method: "POST",
    body: formData,
    onProgress: input.onProgress,
  });
}

export async function searchLinkCandidates(query, { limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  ["note", ...FILE_ITEM_KINDS].forEach((itemKind) => params.append("item_kinds", itemKind));
  params.set("limit", String(limit));
  const payload = await request(`/api/search/content?${params.toString()}`);
  return payload.items;
}

export async function linkFileItem(fromItemId, toItemId, { linkType = "related" } = {}) {
  return request("/api/links", {
    method: "POST",
    body: JSON.stringify({
      from_item_id: fromItemId,
      to_item_id: toItemId,
      link_type: linkType,
      note: null,
    }),
  });
}

export async function unlinkFileItem(linkId) {
  return request(`/api/links/${linkId}`, {
    method: "DELETE",
  });
}

export function getFileContentUrl(itemId, fileId) {
  return buildApiUrl(`/api/items/${itemId}/files/${fileId}/content`);
}
