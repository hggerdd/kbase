import { request, uploadRequest } from "../../shared/api/client.js";

export async function fetchProjects({ limit = 100 } = {}) {
  const payload = await request(`/api/items?item_kind=project&limit=${limit}`);
  return payload.items;
}

export async function fetchProject(itemId) {
  const [detail, membership] = await Promise.all([
    request(`/api/items/${itemId}`),
    request(`/api/projects/${itemId}/items?limit=200`),
  ]);

  return {
    detail,
    items: membership.items,
  };
}

export async function fetchProjectItemDetail(itemId) {
  return request(`/api/items/${itemId}`);
}

export async function createProject(input) {
  return request("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProjectCore(itemId, input) {
  return request(`/api/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createProjectNote(input) {
  return request("/api/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function searchProjectCandidates(query) {
  const payload = await request(
    `/api/search/content?query=${encodeURIComponent(query)}&item_kinds=note&item_kinds=document&item_kinds=image&item_kinds=spreadsheet&limit=12`,
  );
  return payload.items;
}

export async function addProjectItem(projectId, itemId) {
  return request(`/api/projects/${projectId}/items`, {
    method: "POST",
    body: JSON.stringify({ item_id: itemId }),
  });
}

export async function uploadFileToProject(projectId, file, input = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("project_ids", projectId);
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
  return uploadRequest("/api/file-items/upload", {
    method: "POST",
    body: formData,
    onProgress: input.onProgress,
  });
}
