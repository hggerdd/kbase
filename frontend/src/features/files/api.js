import { request } from "../../shared/api/client.js";
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

export async function fetchFileLabels(query = "") {
  const params = new URLSearchParams();
  if (query) {
    params.set("query", query);
  }
  params.set("limit", "100");
  return request(`/api/labels?${params.toString()}`);
}
