import { request } from "../../shared/api/client.js";

export async function searchContent(input) {
  const params = new URLSearchParams();
  if (input.query) {
    params.set("query", input.query);
  }
  for (const itemKind of input.itemKinds ?? []) {
    params.append("item_kinds", itemKind);
  }
  for (const categoryKey of input.categoryKeys ?? []) {
    params.append("category_keys", categoryKey);
  }
  for (const labelPath of input.labelPaths ?? []) {
    params.append("label_paths", labelPath);
  }
  for (const labelPathPrefix of input.labelPathPrefixes ?? []) {
    params.append("label_path_prefixes", labelPathPrefix);
  }
  for (const status of input.statuses ?? []) {
    params.append("statuses", status);
  }
  for (const principalId of input.createdByPrincipalIds ?? []) {
    params.append("created_by_principal_ids", principalId);
  }
  if (input.projectId) {
    params.set("project_id", input.projectId);
  }
  if (input.includeArchived) {
    params.set("include_archived", "true");
  }
  params.set("limit", String(input.limit ?? 100));
  params.set("offset", String(input.offset ?? 0));

  const payload = await request(`/api/search/content?${params.toString()}`);
  return payload.items;
}

export async function fetchSearchDetail(itemId) {
  return request(`/api/items/${itemId}`);
}

export async function fetchSearchLabels(query = "") {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  params.set("limit", "24");
  return request(`/api/labels?${params.toString()}`);
}
