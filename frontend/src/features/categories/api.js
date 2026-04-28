import { request } from "../../shared/api/client.js";

export async function fetchCategories({
  query = "",
  appliesToKind = "",
  includeInactive = false,
  limit = 100,
  offset = 0,
} = {}) {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  if (appliesToKind) {
    params.set("applies_to_kind", appliesToKind);
  }
  if (includeInactive) {
    params.set("include_inactive", "true");
  }
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return request(`/api/categories?${params.toString()}`);
}

export async function createCategory(input) {
  return request("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(categoryKey, input) {
  return request(`/api/categories/${encodeURIComponent(categoryKey)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(categoryKey) {
  return request(`/api/categories/${encodeURIComponent(categoryKey)}`, {
    method: "DELETE",
  });
}
