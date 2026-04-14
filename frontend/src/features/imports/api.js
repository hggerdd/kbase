import { request } from "../../shared/api/client";

export async function fetchInboxFiles() {
  const payload = await request("/api/inbox/files");
  return payload.files;
}

export async function importInboxFile(input) {
  return request("/api/inbox/import", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
