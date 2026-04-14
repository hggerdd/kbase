import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import domino from "@mixmark-io/domino";
import { useNotesWorkspace } from "./hooks.js";

function createDom() {
  const window = domino.createWindow("<!doctype html><html><body><div id='root'></div></body></html>");
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
  Object.defineProperty(global, "HTMLElement", { value: window.HTMLElement, configurable: true });
  Object.defineProperty(global, "Node", { value: window.Node, configurable: true });
  Object.defineProperty(global, "Event", { value: window.Event, configurable: true });
  Object.defineProperty(global, "MouseEvent", { value: window.MouseEvent, configurable: true });
  global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return window.document.getElementById("root");
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitFor(assertion, { attempts = 20 } = {}) {
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

function createResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function createWorkspaceHarness() {
  return function WorkspaceHarness() {
    const workspace = useNotesWorkspace();

    return React.createElement(
      "div",
      null,
      React.createElement("div", { "data-testid": "loading" }, workspace.selectedNoteLoading ? "yes" : "no"),
      React.createElement("div", { "data-testid": "title" }, workspace.editor.title),
      React.createElement("div", { "data-testid": "body" }, workspace.editor.markdown_body),
      React.createElement("div", { "data-testid": "selected-id" }, workspace.selectedId ?? ""),
      React.createElement("div", { "data-testid": "notes-count" }, String(workspace.notes.length)),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "same-note",
          onClick: () => workspace.handleSelectNote(workspace.notes[0]),
        },
        "same",
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "other-note",
          onClick: () => workspace.handleSelectNote(workspace.notes[1]),
        },
        "other",
      ),
    );
  };
}

test("workspace keeps showing complete note data when the same note is selected again", async () => {
  const container = createDom();
  const Harness = createWorkspaceHarness();

  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes("/api/items?item_kind=note")) {
      return createResponse({
        items: [
          { id: "note-a", title: "Alpha", category_key: "research", status: "draft", updated_at: "2026-04-14T10:00:00Z" },
          { id: "note-b", title: "Beta", category_key: "decision", status: "active", updated_at: "2026-04-14T11:00:00Z" },
        ],
      });
    }
    if (value.endsWith("/api/labels")) {
      return createResponse([{ id: "label-1", full_path: "work/alpha" }]);
    }
    if (value.endsWith("/api/items/note-a/history")) {
      return createResponse({ events: [{ id: "hist-a", operation_key: "open", occurred_at: "2026-04-14T10:10:00Z" }] });
    }
    if (value.endsWith("/api/items/note-a")) {
      return createResponse({
        item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
        primary_content_part: { content_text: "# Alpha\nBody A" },
        labels: [{ id: "label-1", full_path: "work/alpha" }],
        files: [],
        related_items: [],
      });
    }
    if (value.endsWith("/api/items/note-b/history")) {
      return createResponse({ events: [] });
    }
    if (value.endsWith("/api/items/note-b")) {
      return createResponse({
        item: { id: "note-b", title: "Beta", category_key: "decision", status: "active" },
        primary_content_part: { content_text: "# Beta\nBody B" },
        labels: [],
        files: [],
        related_items: [],
      });
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="notes-count"]').textContent, "2");
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body A/);
  });

  assert.equal(container.querySelector('[data-testid="title"]').textContent, "Alpha");
  assert.match(container.querySelector('[data-testid="body"]').textContent, /Body A/);

  await act(async () => {
    container.querySelector('[data-testid="same-note"]').click();
  });
  await flush();
  await flush();

  assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
  assert.equal(container.querySelector('[data-testid="title"]').textContent, "Alpha");
  assert.match(container.querySelector('[data-testid="body"]').textContent, /Body A/);

  await act(async () => {
    root.unmount();
  });
});

test("workspace ends with the last selected note when note requests resolve out of order", async () => {
  const container = createDom();
  const Harness = createWorkspaceHarness();

  let resolveNoteA;
  let resolveHistoryA;

  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes("/api/items?item_kind=note")) {
      return createResponse({
        items: [
          { id: "note-a", title: "Alpha", category_key: "research", status: "draft", updated_at: "2026-04-14T10:00:00Z" },
          { id: "note-b", title: "Beta", category_key: "decision", status: "active", updated_at: "2026-04-14T11:00:00Z" },
        ],
      });
    }
    if (value.endsWith("/api/labels")) {
      return createResponse([]);
    }
    if (value.endsWith("/api/items/note-a")) {
      return new Promise((resolve) => {
        resolveNoteA = () =>
          resolve(
            createResponse({
              item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
              primary_content_part: { content_text: "# Alpha\nBody A" },
              labels: [],
              files: [],
              related_items: [],
            }),
          );
      });
    }
    if (value.endsWith("/api/items/note-a/history")) {
      return new Promise((resolve) => {
        resolveHistoryA = () => resolve(createResponse({ events: [] }));
      });
    }
    if (value.endsWith("/api/items/note-b")) {
      return createResponse({
        item: { id: "note-b", title: "Beta", category_key: "decision", status: "active" },
        primary_content_part: { content_text: "# Beta\nBody B" },
        labels: [],
        files: [],
        related_items: [],
      });
    }
    if (value.endsWith("/api/items/note-b/history")) {
      return createResponse({ events: [{ id: "hist-b", operation_key: "open", occurred_at: "2026-04-14T11:10:00Z" }] });
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="notes-count"]').textContent, "2");
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
  });

  await act(async () => {
    container.querySelector('[data-testid="other-note"]').click();
  });
  await flush();
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-b");
  });

  resolveHistoryA();
  resolveNoteA();
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-b");
    assert.equal(container.querySelector('[data-testid="title"]').textContent, "Beta");
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body B/);
  });

  assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-b");
  assert.equal(container.querySelector('[data-testid="title"]').textContent, "Beta");
  assert.match(container.querySelector('[data-testid="body"]').textContent, /Body B/);

  await act(async () => {
    root.unmount();
  });
});
