import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import domino from "@mixmark-io/domino";
import { useCategoriesWorkspace } from "./hooks.js";

function createDom() {
  const window = domino.createWindow("<!doctype html><html><body><div id='root'></div></body></html>");
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
  global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return window.document.getElementById("root");
}

function createResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function pathAndQuery(url) {
  const parsed = new URL(String(url), "http://localhost");
  return `${parsed.pathname}${parsed.search}`;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitFor(assertion, attempts = 20) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await flush();
    }
  }
  throw lastError;
}

function Harness({ onWorkspace }) {
  const workspace = useCategoriesWorkspace();
  onWorkspace(workspace);
  return React.createElement("div", { "data-notice": workspace.notice });
}

test("categories workspace covers create update deactivate reactivate and delete", async () => {
  const container = createDom();
  let latestWorkspace;
  let categories = [];
  const calls = [];

  global.fetch = async (url, options = {}) => {
    const value = pathAndQuery(url);
    const method = options.method ?? "GET";
    calls.push({ method, url: value, body: options.body ? JSON.parse(String(options.body)) : null });

    if (value.startsWith("/api/categories") && method === "GET") {
      const includeInactive = value.includes("include_inactive=true");
      return createResponse({ categories: includeInactive ? categories : categories.filter((category) => category.is_active), limit: 300, offset: 0 });
    }
    if (value === "/api/categories" && method === "POST") {
      const body = JSON.parse(String(options.body));
      const created = {
        key: body.key,
        label: body.label,
        description: body.description,
        applies_to_kind: body.applies_to_kind,
        parent_key: body.parent_key,
        full_path: body.parent_key ? `${body.parent_key}/${body.key}` : body.key,
        depth: body.parent_key ? 1 : 0,
        is_active: true,
      };
      categories = [created];
      return createResponse(created);
    }
    if (value === "/api/categories/meeting_note" && method === "PATCH") {
      const body = JSON.parse(String(options.body));
      categories = categories.map((category) => ({
        ...category,
        label: body.label ?? category.label,
        description: body.description ?? category.description,
        applies_to_kind: body.applies_to_kind ?? category.applies_to_kind,
        parent_key: body.parent_key ?? category.parent_key,
        full_path: body.parent_key ? `${body.parent_key}/${category.key}` : category.key,
        depth: body.parent_key ? 1 : 0,
        is_active: body.is_active ?? category.is_active,
      }));
      return createResponse(categories[0]);
    }
    if (value === "/api/categories/meeting_note" && method === "DELETE") {
      categories = [];
      return createResponse({ key: "meeting_note", deleted: true });
    }
    throw new Error(`Unhandled fetch: ${method} ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness, { onWorkspace: (workspace) => { latestWorkspace = workspace; } }));
  });
  await waitFor(() => assert.equal(latestWorkspace.loading, false));

  await act(async () => {
    await latestWorkspace.handleCreateCategory({
      key: "meeting_note",
      label: "Meeting note",
      description: "Meetings",
      applies_to_kind: "note",
      parent_key: "",
    });
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Category created");
    assert.equal(latestWorkspace.categories[0].key, "meeting_note");
  });

  await act(async () => {
    await latestWorkspace.handleUpdateCategory("meeting_note", {
      label: "Meeting notes",
      description: "Meeting notes",
      applies_to_kind: "note",
      parent_key: "",
      is_active: true,
    });
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Category updated");
    assert.equal(latestWorkspace.categories[0].label, "Meeting notes");
  });

  await act(async () => {
    await latestWorkspace.handleSetActive("meeting_note", false);
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Category deactivated");
    assert.equal(latestWorkspace.categories.length, 0);
  });

  await act(async () => {
    latestWorkspace.setIncludeInactive(true);
  });
  await waitFor(() => assert.equal(latestWorkspace.categories[0].is_active, false));

  await act(async () => {
    await latestWorkspace.handleSetActive("meeting_note", true);
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Category activated");
    assert.equal(latestWorkspace.categories[0].is_active, true);
  });

  await act(async () => {
    await latestWorkspace.handleDeleteCategory("meeting_note");
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Category deleted");
    assert.equal(latestWorkspace.categories.length, 0);
  });
  assert.equal(calls.some((call) => call.method === "PATCH" && call.body?.is_active === false), true);
  assert.equal(calls.some((call) => call.method === "PATCH" && call.body?.is_active === true), true);
  assert.equal(calls.some((call) => call.method === "DELETE" && call.url === "/api/categories/meeting_note"), true);

  await act(async () => root.unmount());
});
