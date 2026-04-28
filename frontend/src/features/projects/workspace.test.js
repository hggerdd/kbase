import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import domino from "@mixmark-io/domino";
import { useProjectsWorkspace } from "./hooks.js";

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
  const workspace = useProjectsWorkspace();
  onWorkspace(workspace);
  return React.createElement("div", { "data-notice": workspace.notice });
}

test("projects workspace covers create and delete", async () => {
  const container = createDom();
  let latestWorkspace;
  let projects = [];
  const calls = [];

  global.fetch = async (url, options = {}) => {
    const value = pathAndQuery(url);
    const method = options.method ?? "GET";
    calls.push({ method, url: value, body: options.body ? JSON.parse(String(options.body)) : null });

    if (value === "/api/items?item_kind=project&limit=100" && method === "GET") {
      return createResponse({ items: projects.filter((project) => !project.is_archived) });
    }
    if (value === "/api/projects" && method === "POST") {
      const body = JSON.parse(String(options.body));
      const created = {
        id: "project-1",
        title: body.title,
        category_key: body.category_key,
        status: body.status,
        item_kind: "project",
        is_archived: false,
        created_at: "2026-04-28T08:00:00Z",
        updated_at: "2026-04-28T08:00:00Z",
      };
      projects = [created];
      return createResponse(created);
    }
    if (value === "/api/items/project-1" && method === "GET") {
      return createResponse({
        item: projects[0] ?? {
          id: "project-1",
          title: "Deleted",
          category_key: "project_general",
          status: "active",
          item_kind: "project",
          is_archived: true,
          created_at: "2026-04-28T08:00:00Z",
          updated_at: "2026-04-28T08:00:00Z",
        },
        metadata: [],
        files: [],
        labels: [],
        classifications: [],
        content_parts: [],
        linked_assets: [],
        outgoing_links: [],
        primary_content_part: null,
        projects: [],
        related_items: [],
      });
    }
    if (value === "/api/projects/project-1/items?limit=200" && method === "GET") {
      return createResponse({
        project: { id: "project-1", title: "Launch pad", item_kind: "project" },
        items: [],
        limit: 200,
        offset: 0,
      });
    }
    if (value === "/api/items/project-1" && method === "PATCH") {
      const body = JSON.parse(String(options.body));
      projects = projects.map((project) => ({
        ...project,
        is_archived: body.is_archived ?? project.is_archived,
      }));
      return createResponse(projects[0]);
    }
    throw new Error(`Unhandled fetch: ${method} ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness, { onWorkspace: (workspace) => { latestWorkspace = workspace; } }));
  });
  await waitFor(() => assert.equal(latestWorkspace.loading, false));

  await act(async () => {
    latestWorkspace.setDraft({
      ...latestWorkspace.draft,
      title: "Launch pad",
      category_key: "project_general",
      description: "",
      status: "active",
    });
    await latestWorkspace.handleCreateProject({ preventDefault() {} });
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Project created");
    assert.equal(latestWorkspace.projects.length, 1);
    assert.equal(latestWorkspace.selectedId, "project-1");
  });

  await act(async () => {
    await latestWorkspace.handleDeleteProject("project-1");
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Project deleted");
    assert.equal(latestWorkspace.projects.length, 0);
    assert.equal(latestWorkspace.selectedId, null);
  });

  assert.equal(calls.some((call) => call.method === "POST" && call.url === "/api/projects"), true);
  assert.equal(
    calls.some((call) => call.method === "PATCH" && call.url === "/api/items/project-1" && call.body?.is_archived === true),
    true,
  );

  await act(async () => root.unmount());
});
