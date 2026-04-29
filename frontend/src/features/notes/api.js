import { request, uploadRequest } from "../../shared/api/client.js";

export async function fetchNotes(
  query = "",
  {
    limit = 100,
    categoryKeys = [],
    labelPathPrefixes = [],
    projectId = null,
  } = {},
) {
  const hasScopedFilters =
    categoryKeys.length > 0 ||
    labelPathPrefixes.length > 0 ||
    Boolean(projectId);

  const path = query || hasScopedFilters
    ? (() => {
        const params = new URLSearchParams();
        if (query) {
          params.set("query", query);
        }
        params.append("item_kinds", "note");
        params.set("limit", String(limit));
        categoryKeys.forEach((categoryKey) => params.append("category_keys", categoryKey));
        labelPathPrefixes.forEach((labelPath) => params.append("label_path_prefixes", labelPath));
        if (projectId) {
          params.set("project_id", projectId);
        }
        return `/api/search/content?${params.toString()}`;
      })()
    : `/api/items?item_kind=note&limit=${limit}`;
  const payload = await request(path);
  return payload.items;
}

export async function fetchItemDetail(itemId) {
  return request(`/api/items/${itemId}`);
}

export async function fetchNote(itemId) {
  return fetchItemDetail(itemId);
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

export async function fetchNoteCategories() {
  const payload = await request("/api/categories?applies_to_kind=note&limit=200");
  return payload.categories ?? [];
}

export async function fetchProjects({ limit = 200 } = {}) {
  const payload = await request(`/api/items?item_kind=project&limit=${limit}`);
  return payload.items;
}

export async function replaceLabels(itemId, labelPaths) {
  return request(`/api/items/${itemId}/labels`, {
    method: "PUT",
    body: JSON.stringify({ label_paths: labelPaths }),
  });
}

export async function replaceNoteProjects(itemId, projectIds) {
  return request(`/api/items/${itemId}/projects`, {
    method: "PUT",
    body: JSON.stringify({ project_ids: projectIds }),
  });
}

export async function searchLinkCandidates(query, { limit = 12, itemKinds = ["note", "image"] } = {}) {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  itemKinds.forEach((itemKind) => params.append("item_kinds", itemKind));
  params.set("limit", String(limit));
  const payload = await request(`/api/search/content?${params.toString()}`);
  return payload.items;
}

export async function linkNoteItem(fromItemId, toItemId, { linkType = "related", note = "" } = {}) {
  return request("/api/links", {
    method: "POST",
    body: JSON.stringify({
      from_item_id: fromItemId,
      to_item_id: toItemId,
      link_type: linkType,
      note: note || null,
    }),
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
