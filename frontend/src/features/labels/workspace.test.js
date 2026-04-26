import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import domino from "@mixmark-io/domino";
import { useLabelsWorkspace } from "./hooks.js";

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
  const workspace = useLabelsWorkspace();
  onWorkspace(workspace);
  return React.createElement("div", { "data-notice": workspace.notice });
}

test("labels workspace covers create rename deactivate reactivate and delete", async () => {
  const container = createDom();
  let latestWorkspace;
  let labels = [];
  const calls = [];

  global.fetch = async (url, options = {}) => {
    const value = pathAndQuery(url);
    const method = options.method ?? "GET";
    calls.push({ method, url: value, body: options.body ? JSON.parse(String(options.body)) : null });

    if (value.startsWith("/api/labels") && method === "GET") {
      const includeInactive = value.includes("include_inactive=true");
      return createResponse(includeInactive ? labels : labels.filter((label) => label.is_active));
    }
    if (value === "/api/labels" && method === "POST") {
      const body = JSON.parse(String(options.body));
      const created = {
        id: "label-1",
        name: body.name,
        parent_id: body.parent_id,
        full_path: body.name,
        description: body.description,
        depth: 0,
        is_active: true,
      };
      labels = [created];
      return createResponse(created);
    }
    if (value === "/api/labels/label-1" && method === "PATCH") {
      const body = JSON.parse(String(options.body));
      labels = labels.map((label) => ({
        ...label,
        name: body.name ?? label.name,
        full_path: body.name ?? label.full_path,
        description: body.description ?? label.description,
      }));
      return createResponse(labels[0]);
    }
    if (value === "/api/labels/label-1/deactivate" && method === "POST") {
      labels = labels.map((label) => ({ ...label, is_active: false }));
      return createResponse(labels[0]);
    }
    if (value === "/api/labels/label-1/reactivate" && method === "POST") {
      labels = labels.map((label) => ({ ...label, is_active: true }));
      return createResponse(labels[0]);
    }
    if (value === "/api/labels/label-1" && method === "DELETE") {
      labels = [];
      return createResponse({ deleted_label_ids: ["label-1"], deleted_count: 1, deleted_paths: ["finance"] });
    }
    throw new Error(`Unhandled fetch: ${method} ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness, { onWorkspace: (workspace) => { latestWorkspace = workspace; } }));
  });
  await waitFor(() => assert.equal(latestWorkspace.loading, false));

  await act(async () => {
    await latestWorkspace.handleCreateLabel({ preventDefault() {} }, { name: "finance", description: "Money" });
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Label created");
    assert.equal(latestWorkspace.labels[0].full_path, "finance");
  });

  await act(async () => {
    await latestWorkspace.handleUpdateLabel("label-1", { name: "assets", description: "Investments" });
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Label updated");
    assert.equal(latestWorkspace.labels[0].full_path, "assets");
  });

  await act(async () => {
    await latestWorkspace.handleDeactivateLabel("label-1");
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Label deactivated");
    assert.equal(latestWorkspace.labels.length, 0);
  });

  await act(async () => {
    latestWorkspace.setIncludeInactive(true);
  });
  await waitFor(() => assert.equal(latestWorkspace.labels[0].is_active, false));

  await act(async () => {
    await latestWorkspace.handleReactivateLabel("label-1");
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "Label reactivated");
    assert.equal(latestWorkspace.labels[0].is_active, true);
  });

  await act(async () => {
    await latestWorkspace.handleDeleteLabel("label-1");
  });
  await waitFor(() => {
    assert.equal(latestWorkspace.notice, "1 label hard deleted");
    assert.equal(latestWorkspace.labels.length, 0);
  });
  assert.equal(calls.some((call) => call.method === "DELETE" && call.url === "/api/labels/label-1"), true);

  await act(async () => root.unmount());
});
