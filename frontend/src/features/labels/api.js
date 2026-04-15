import { request } from "../../shared/api/client.js";

export async function fetchLabels({
  query = "",
  includeInactive = false,
  parentId = "",
  fullPathPrefix = "",
  limit = 100,
} = {}) {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  if (includeInactive) {
    params.set("include_inactive", "true");
  }
  if (parentId) {
    params.set("parent_id", parentId);
  }
  if (fullPathPrefix) {
    params.set("full_path_prefix", fullPathPrefix);
  }
  params.set("limit", String(limit));
  return request(`/api/labels?${params.toString()}`);
}

export async function createLabel(input) {
  return request("/api/labels", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function renameLabel(labelId, input) {
  return request(`/api/labels/${labelId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteLabel(labelId) {
  return request(`/api/labels/${labelId}`, {
    method: "DELETE",
  });
}

export async function deactivateLabel(labelId) {
  return request(`/api/labels/${labelId}/deactivate`, {
    method: "POST",
  });
}

export async function reactivateLabel(labelId) {
  return request(`/api/labels/${labelId}/reactivate`, {
    method: "POST",
  });
}
