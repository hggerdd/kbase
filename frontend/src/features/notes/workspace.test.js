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

function createErrorResponse(status, detail) {
  return {
    ok: false,
    status,
    json: async () => ({ detail }),
  };
}

function createWorkspaceHarness(onWorkspace) {
  return function WorkspaceHarness() {
    const workspace = useNotesWorkspace();
    onWorkspace?.(workspace);

    return React.createElement(
      "div",
      null,
      React.createElement("div", { "data-testid": "loading" }, workspace.selectedNoteLoading ? "yes" : "no"),
      React.createElement("div", { "data-testid": "autosave-state" }, workspace.autosaveState),
      React.createElement("div", { "data-testid": "title" }, workspace.editor?.title ?? ""),
      React.createElement("div", { "data-testid": "body" }, workspace.editor?.markdown_body ?? ""),
      React.createElement("div", { "data-testid": "selected-id" }, workspace.selectedId ?? ""),
      React.createElement("div", { "data-testid": "notes-count" }, String(workspace.notes.length)),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "edit-title",
          onClick: () =>
            workspace.setEditor((current) => ({
              ...current,
              title: "Alpha updated",
            })),
        },
        "edit-title",
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "edit-body",
          onClick: () =>
            workspace.setEditor((current) => ({
              ...current,
              html_body: "<p>Body updated</p>",
              markdown_body: "Body updated",
            })),
        },
        "edit-body",
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "same-note",
          onClick: () => {
            if (workspace.notes[0]) {
              workspace.handleSelectNote(workspace.notes[0]);
            }
          },
        },
        "same",
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "other-note",
          onClick: () => {
            if (workspace.notes[1]) {
              workspace.handleSelectNote(workspace.notes[1]);
            }
          },
        },
        "other",
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "data-testid": "set-labels",
          onClick: () => {
            void workspace.updateSelectedNoteLabels(["work/alpha", "private/home"]);
          },
        },
        "set-labels",
      ),
    );
  };
}

test("workspace keeps showing complete note data when the same note is selected again", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });

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
    latestWorkspace.handleSelectNote(latestWorkspace.notes[0]);
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

test("workspace autosaves debounced changes without reloading note details", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });
  globalThis.__KBASE_AUTOSAVE_DELAY_MS__ = 5;

  let fetchNoteCount = 0;
  let updateCoreCount = 0;
  let replaceContentCount = 0;
  let replaceLabelsCount = 0;

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method ?? "GET";
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
    if (value.endsWith("/api/items/note-a/history")) {
      return createResponse({ events: [] });
    }
    if (value.endsWith("/api/items/note-a")) {
      if (method === "PATCH") {
        updateCoreCount += 1;
        return createResponse({ id: "note-a", title: "Alpha updated" });
      }
      fetchNoteCount += 1;
      return createResponse({
        item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
        primary_content_part: { content_text: "# Alpha\nBody A" },
        labels: [],
        files: [],
        related_items: [],
      });
    }
    if (value.endsWith("/api/items/note-a/content")) {
      replaceContentCount += 1;
      return createResponse({});
    }
    if (value.endsWith("/api/items/note-a/labels")) {
      replaceLabelsCount += 1;
      return createResponse([]);
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
      return createResponse({ events: [] });
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
    assert.equal(fetchNoteCount, 1);
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body A/);
  });

  await act(async () => {
    latestWorkspace.setEditor((current) => ({
      ...current,
      title: "Alpha updated",
    }));
    latestWorkspace.setEditor((current) => ({
      ...current,
      html_body: "<p>Body updated</p>",
      markdown_body: "Body updated",
    }));
  });

  await waitFor(() => {
    assert.equal(updateCoreCount, 1);
    assert.equal(replaceContentCount, 1);
    assert.equal(replaceLabelsCount, 1);
    assert.equal(fetchNoteCount, 1);
    assert.equal(container.querySelector('[data-testid="title"]').textContent, "Alpha updated");
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body updated/);
    assert.equal(container.querySelector('[data-testid="autosave-state"]').textContent, "saved");
  });

  delete globalThis.__KBASE_AUTOSAVE_DELAY_MS__;
  await act(async () => {
    root.unmount();
  });
});

test("same-note click with unsaved changes does not overwrite the editor", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });
  globalThis.__KBASE_AUTOSAVE_DELAY_MS__ = 5000;

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
    if (value.endsWith("/api/items/note-a/history")) {
      return createResponse({ events: [] });
    }
    if (value.endsWith("/api/items/note-a")) {
      return createResponse({
        item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
        primary_content_part: { content_text: "# Alpha\nBody A" },
        labels: [],
        files: [],
        related_items: [],
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
      return createResponse({ events: [] });
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body A/);
  });

  await act(async () => {
    latestWorkspace.setEditor((current) => ({
      ...current,
      html_body: "<p>Body updated</p>",
      markdown_body: "Body updated",
    }));
  });
  await waitFor(() => {
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body updated/);
    assert.equal(container.querySelector('[data-testid="autosave-state"]').textContent, "pending");
  });

  await act(async () => {
    latestWorkspace.handleSelectNote(latestWorkspace.notes[0]);
  });
  await flush();

  assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
  assert.match(container.querySelector('[data-testid="body"]').textContent, /Body updated/);

  delete globalThis.__KBASE_AUTOSAVE_DELAY_MS__;
  await act(async () => {
    root.unmount();
  });
});

test("workspace ends with the last selected note when note requests resolve out of order", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });

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
    latestWorkspace.handleSelectNote(latestWorkspace.notes[1]);
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

test("rapid note selection cannot let an older save select the wrong note", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });

  globalThis.__KBASE_AUTOSAVE_DELAY_MS__ = 5000;
  const patchCalls = [];
  let resolveFirstPatch;

  function noteDetail(id, title, body, category = "research", status = "draft") {
    return {
      item: { id, title, category_key: category, status },
      primary_content_part: { content_text: `# ${title}\n${body}` },
      labels: [],
      files: [],
      related_items: [],
    };
  }

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method ?? "GET";
    if (value.includes("/api/items?item_kind=note")) {
      return createResponse({
        items: [
          { id: "note-a", title: "Alpha", category_key: "research", status: "draft", updated_at: "2026-04-14T10:00:00Z" },
          { id: "note-b", title: "Beta", category_key: "decision", status: "active", updated_at: "2026-04-14T11:00:00Z" },
          { id: "note-c", title: "Charlie", category_key: "learning", status: "draft", updated_at: "2026-04-14T12:00:00Z" },
        ],
      });
    }
    if (value.endsWith("/api/labels")) {
      return createResponse([]);
    }
    if (value.endsWith("/history")) {
      return createResponse({ events: [] });
    }
    if (method === "PATCH") {
      patchCalls.push({ url: value, body: JSON.parse(options.body) });
      if (patchCalls.length === 1) {
        return new Promise((resolve) => {
          resolveFirstPatch = () => resolve(createResponse({}));
        });
      }
      return createResponse({});
    }
    if (value.endsWith("/content") || value.endsWith("/labels")) {
      return createResponse({});
    }
    if (value.endsWith("/api/items/note-a")) {
      return createResponse(noteDetail("note-a", "Alpha", "Body A"));
    }
    if (value.endsWith("/api/items/note-b")) {
      return createResponse(noteDetail("note-b", "Beta", "Body B", "decision", "active"));
    }
    if (value.endsWith("/api/items/note-c")) {
      return createResponse(noteDetail("note-c", "Charlie", "Body C", "learning"));
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
    assert.equal(container.querySelector('[data-testid="title"]').textContent, "Alpha");
  });

  await act(async () => {
    latestWorkspace.setEditor((current) => ({
      ...current,
      title: "Alpha edited",
      html_body: "<p>Alpha edited body</p>",
      markdown_body: "Alpha edited body",
    }));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="autosave-state"]').textContent, "pending");
  });

  let firstSelection;
  await act(async () => {
    firstSelection = latestWorkspace.handleSelectNote(latestWorkspace.notes[1], { saveCurrent: true });
  });
  await waitFor(() => {
    assert.equal(patchCalls.length, 1);
    assert.match(patchCalls[0].url, /\/api\/items\/note-a$/);
    assert.equal(patchCalls[0].body.title, "Alpha edited");
  });

  await act(async () => {
    void latestWorkspace.handleSelectNote(latestWorkspace.notes[2], { saveCurrent: true });
  });
  await flush();
  resolveFirstPatch();
  await act(async () => {
    await firstSelection;
  });

  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-c");
    assert.equal(container.querySelector('[data-testid="title"]').textContent, "Charlie");
    assert.match(container.querySelector('[data-testid="body"]').textContent, /Body C/);
  });

  assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-c");
  assert.equal(container.querySelector('[data-testid="title"]').textContent, "Charlie");
  assert.equal(patchCalls.every((call) => !call.url.endsWith("/api/items/note-b") || call.body.title !== "Alpha edited"), true);

  delete globalThis.__KBASE_AUTOSAVE_DELAY_MS__;
  await act(async () => {
    root.unmount();
  });
});

test("workspace persists note labels through the labels capability only", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });
  let replaceLabelsCount = 0;
  let updateCoreCount = 0;
  let replaceContentCount = 0;

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method ?? "GET";
    if (value.includes("/api/items?item_kind=note")) {
      return createResponse({
        items: [
          { id: "note-a", title: "Alpha", category_key: "research", status: "draft", updated_at: "2026-04-14T10:00:00Z" },
        ],
      });
    }
    if (value.endsWith("/api/labels")) {
      return createResponse([{ id: "label-1", full_path: "work/alpha", is_active: true }]);
    }
    if (value.endsWith("/api/items/note-a/history")) {
      return createResponse({ events: [] });
    }
    if (value.endsWith("/api/items/note-a")) {
      if (method === "PATCH") {
        updateCoreCount += 1;
        return createResponse({});
      }
      return createResponse({
        item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
        primary_content_part: { content_text: "# Alpha\nBody A" },
        labels: [],
        files: [],
        related_items: [],
      });
    }
    if (value.endsWith("/api/items/note-a/content")) {
      replaceContentCount += 1;
      return createResponse({});
    }
    if (value.endsWith("/api/items/note-a/labels")) {
      replaceLabelsCount += 1;
      assert.equal(method, "PUT");
      assert.deepEqual(JSON.parse(options.body), { label_paths: ["work/alpha", "private/home"] });
      return createResponse([
        { id: "label-1", full_path: "work/alpha", is_active: true },
        { id: "label-2", full_path: "private/home", is_active: true },
      ]);
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
  });

  await act(async () => {
    await latestWorkspace.updateSelectedNoteLabels(["work/alpha", "private/home"]);
  });
  await waitFor(() => {
    assert.equal(replaceLabelsCount, 1);
  });

  assert.equal(updateCoreCount, 0);
  assert.equal(replaceContentCount, 0);

  await act(async () => {
    root.unmount();
  });
});

test("workspace marks autosave conflicts without updating note core or labels", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });
  globalThis.__KBASE_AUTOSAVE_DELAY_MS__ = 5;
  let updateCoreCount = 0;
  let replaceLabelsCount = 0;
  let replaceContentBody = null;

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method ?? "GET";
    if (value.includes("/api/items?item_kind=note")) {
      return createResponse({
        items: [
          { id: "note-a", title: "Alpha", category_key: "research", status: "draft", updated_at: "2026-04-14T10:00:00Z" },
        ],
      });
    }
    if (value.endsWith("/api/labels")) {
      return createResponse([]);
    }
    if (value.endsWith("/api/items/note-a/history")) {
      return createResponse({ events: [] });
    }
    if (value.endsWith("/api/items/note-a")) {
      if (method === "PATCH") {
        updateCoreCount += 1;
        return createResponse({});
      }
      return createResponse({
        item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
        primary_content_part: { content_text: "# Alpha\nBody A", updated_at: "2026-04-14T10:05:00Z" },
        labels: [],
        files: [],
        related_items: [],
      });
    }
    if (value.endsWith("/api/items/note-a/content")) {
      replaceContentBody = JSON.parse(options.body);
      return createErrorResponse(409, "Note content changed since it was loaded");
    }
    if (value.endsWith("/api/items/note-a/labels")) {
      replaceLabelsCount += 1;
      return createResponse([]);
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
  });

  await act(async () => {
    latestWorkspace.setEditor((current) => ({
      ...current,
      title: "Alpha conflict",
      html_body: "<p>Body conflict</p>",
      markdown_body: "Body conflict",
    }));
  });

  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="autosave-state"]').textContent, "conflict");
    assert.equal(replaceContentBody.expected_content_updated_at, "2026-04-14T10:05:00Z");
  });
  assert.equal(updateCoreCount, 0);
  assert.equal(replaceLabelsCount, 0);

  delete globalThis.__KBASE_AUTOSAVE_DELAY_MS__;
  await act(async () => {
    root.unmount();
  });
});

test("workspace refuses to save an editor snapshot that belongs to another note", async () => {
  const container = createDom();
  let latestWorkspace;
  const Harness = createWorkspaceHarness((workspace) => {
    latestWorkspace = workspace;
  });
  let updateCoreCount = 0;
  let replaceContentCount = 0;
  let replaceLabelsCount = 0;

  global.fetch = async (url, options = {}) => {
    const value = String(url);
    const method = options.method ?? "GET";
    if (value.includes("/api/items?item_kind=note")) {
      return createResponse({
        items: [
          { id: "note-a", title: "Alpha", category_key: "research", status: "draft", updated_at: "2026-04-14T10:00:00Z" },
        ],
      });
    }
    if (value.endsWith("/api/labels")) {
      return createResponse([]);
    }
    if (value.endsWith("/api/items/note-a/history")) {
      return createResponse({ events: [] });
    }
    if (value.endsWith("/api/items/note-a")) {
      if (method === "PATCH") {
        updateCoreCount += 1;
        return createResponse({});
      }
      return createResponse({
        item: { id: "note-a", title: "Alpha", category_key: "research", status: "draft" },
        primary_content_part: { content_text: "# Alpha\nBody A" },
        labels: [],
        files: [],
        related_items: [],
      });
    }
    if (value.endsWith("/api/items/note-a/content")) {
      replaceContentCount += 1;
      return createResponse({});
    }
    if (value.endsWith("/api/items/note-a/labels")) {
      replaceLabelsCount += 1;
      return createResponse([]);
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(Harness));
  });
  await waitFor(() => {
    assert.equal(container.querySelector('[data-testid="selected-id"]').textContent, "note-a");
  });

  await act(async () => {
    latestWorkspace.setEditor({
      item_id: "note-b",
      title: "Beta should not overwrite Alpha",
      category_key: "decision",
      status: "active",
      markdown_body: "Wrong body",
      html_body: "<p>Wrong body</p>",
      label_paths: "",
      selected_labels: [],
    });
    await latestWorkspace.handleSaveSelected();
  });
  await flush();

  assert.equal(updateCoreCount, 0);
  assert.equal(replaceContentCount, 0);
  assert.equal(replaceLabelsCount, 0);

  await act(async () => {
    root.unmount();
  });
});
