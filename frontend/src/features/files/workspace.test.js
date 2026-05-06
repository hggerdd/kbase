import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import domino from "@mixmark-io/domino";
import { useFileViewerWorkspace } from "./hooks.js";

function createDom() {
  const window = domino.createWindow("<!doctype html><html><body><div id='root'></div></body></html>");
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
  Object.defineProperty(global, "HTMLElement", { value: window.HTMLElement, configurable: true });
  Object.defineProperty(global, "Node", { value: window.Node, configurable: true });
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
  const workspace = useFileViewerWorkspace();
  onWorkspace(workspace);
  return React.createElement("div", {
    "data-testid": "notice",
    "data-notice": workspace.notice ?? "",
    "data-saving": workspace.contentSaving ? "yes" : "no",
  });
}

test("file workspace autosaves edited file description", async () => {
  const container = createDom();
  let latestWorkspace;
  let saveCallCount = 0;
  let savedBody = "# Old\nBody";

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method ?? "GET";

    if (value.includes("/api/search/content")) {
      return createResponse({
        items: [{ id: "file-1", title: "Alpha file", item_kind: "document", category_key: "income_document" }],
      });
    }
    if (value.includes("/api/labels")) {
      return createResponse([{ id: "label-1", full_path: "test" }]);
    }
    if (value.includes("/api/categories")) {
      return createResponse({ categories: [{ key: "income_document", full_path: "income_document", label: "Income Document" }] });
    }
    if (value.includes("/api/items?item_kind=project")) {
      return createResponse({ items: [] });
    }
    if (value.endsWith("/api/items/file-1")) {
      return createResponse({
        item: { id: "file-1", title: "Alpha file", item_kind: "document", category_key: "income_document", updated_at: "2026-04-14T10:00:00Z" },
        primary_content_part: { content_text: savedBody },
        content_parts: [],
        labels: [{ id: "label-1", full_path: "test" }],
        metadata: [],
        files: [{ original_filename: "alpha.txt", relative_path: "docs/alpha.txt", mime_type: "text/plain", checksum_sha256: "abc" }],
      });
    }
    if (value.endsWith("/api/items/file-1/content") && method === "PUT") {
      saveCallCount += 1;
      savedBody = JSON.parse(String(options.body)).content_text;
      return createResponse({});
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness, { onWorkspace: (workspace) => { latestWorkspace = workspace; } }));
  });

  await waitFor(() => {
    assert.equal(latestWorkspace.selectedItem?.item.id, "file-1");
    assert.match(latestWorkspace.descriptionDraft, /Old/);
  });

  await act(async () => {
    latestWorkspace.setDescriptionDraft("# Updated\nNew body");
  });

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 950));
  });

  await waitFor(() => {
    assert.equal(saveCallCount, 1);
    assert.match(savedBody, /Updated/);
    assert.equal(latestWorkspace.notice, "File description saved");
  });

  await act(async () => {
    root.unmount();
  });
});
