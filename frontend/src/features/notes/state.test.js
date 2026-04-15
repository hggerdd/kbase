import test from "node:test";
import assert from "node:assert/strict";
import {
  combineLabelPaths,
  deriveSelectionTransition,
  editorFromItemDetail,
  serializeEditorState,
} from "./state.js";

test("same note selection does not reset the editor and triggers a reload", () => {
  const note = { id: "note-1", title: "Alpha", category_key: "research", status: "draft" };
  const transition = deriveSelectionTransition("note-1", note);

  assert.equal(transition.isSameSelection, true);
  assert.equal(transition.shouldReloadImmediately, true);
  assert.equal(transition.shouldClearHistory, false);
  assert.equal(transition.nextSelectedNote, null);
  assert.equal(transition.nextEditor, null);
});

test("same note selection with unsaved edits does not trigger reload", () => {
  const note = { id: "note-1", title: "Alpha", category_key: "research", status: "draft" };
  const transition = deriveSelectionTransition("note-1", note, { isDirty: true });

  assert.equal(transition.isSameSelection, true);
  assert.equal(transition.shouldReloadImmediately, false);
});

test("switching to another note creates a clean placeholder transition", () => {
  const note = { id: "note-2", title: "Bravo", category_key: "decision", status: "active" };
  const transition = deriveSelectionTransition("note-1", note);

  assert.equal(transition.isSameSelection, false);
  assert.equal(transition.shouldReloadImmediately, false);
  assert.equal(transition.shouldClearHistory, true);
  assert.equal(transition.nextSelectedId, "note-2");
  assert.equal(transition.nextSelectedNote.item.id, "note-2");
  assert.deepEqual(transition.nextEditor, {
    item_id: "note-2",
    title: "Bravo",
    category_key: "decision",
    status: "active",
    markdown_body: "",
    html_body: "",
    label_paths: "",
    selected_labels: [],
  });
});

test("detail payload builds a complete editor state", () => {
  const payload = {
    item: {
      id: "note-3",
      title: "Charlie",
      category_key: "reference",
      status: "archived",
    },
    primary_content_part: {
      content_text: "# Title\nBody",
    },
    labels: [{ full_path: "work/alpha" }, { full_path: "work/beta" }],
  };

  const editor = editorFromItemDetail(payload, "<h1>Title</h1><p>Body</p>");

  assert.deepEqual(editor, {
    item_id: "note-3",
    title: "Charlie",
    category_key: "reference",
    status: "archived",
    markdown_body: "# Title\nBody",
    html_body: "<h1>Title</h1><p>Body</p>",
    label_paths: "",
    selected_labels: ["work/alpha", "work/beta"],
  });
});

test("label combination removes duplicates and trims whitespace", () => {
  const combined = combineLabelPaths(["work/alpha", "work/beta"], " work/beta, private/home , , work/alpha ");

  assert.deepEqual(combined, ["work/alpha", "work/beta", "private/home"]);
});

test("editor serialization is stable for semantically identical states", () => {
  const left = serializeEditorState({
    title: "Alpha",
    category_key: "research",
    status: "draft",
    markdown_body: "Body",
    html_body: "<p>Body</p>",
    label_paths: "",
    selected_labels: ["b/two", "a/one"],
  });
  const right = serializeEditorState({
    title: "Alpha",
    category_key: "research",
    status: "draft",
    markdown_body: "Body",
    html_body: "<p>Body</p>",
    label_paths: "",
    selected_labels: ["a/one", "b/two"],
  });

  assert.equal(left, right);
});
