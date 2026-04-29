import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const noteMetaPanelSource = readFileSync(
  resolve(process.cwd(), "src/pages/notes/components/NoteMetaPanel.jsx"),
  "utf8",
);
const hooksSource = readFileSync(resolve(process.cwd(), "src/features/notes/hooks.js"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

function cssRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return styles.match(new RegExp(`${escapedSelector}\\s*\\{[\\s\\S]*?\\n\\}`))?.[0] ?? "";
}

test("linked notes render as clickable note cards with a detail modal", () => {
  assert.match(noteMetaPanelSource, /className="linked-resource-card linked-note-card interactive"/);
  assert.match(noteMetaPanelSource, /<NoteIcon \/>/);
  assert.match(noteMetaPanelSource, /workspace\.openLinkedNotePreview\(linkedItem\)/);
  assert.match(noteMetaPanelSource, /function LinkedNoteModal/);
  assert.match(noteMetaPanelSource, /workspace\.linkedNotePreview\.note/);
  assert.match(hooksSource, /fetchNote\(note\.id\)/);
  assert.match(hooksSource, /renderMarkdownToSafeHtml/);
});

test("linked file items load file detail before building image or pdf previews", () => {
  assert.match(hooksSource, /fetchItemDetail\(itemId\)/);
  assert.match(noteMetaPanelSource, /workspace\.linkedFileDetails\[linkedItem\.id\]/);
  assert.match(noteMetaPanelSource, /<FilePreviewTile file=\{linkedFile\} itemId=\{linkedItem\.id\} \/>/);
  assert.match(noteMetaPanelSource, /setPreviewFile\(\{ file: linkedFile, itemId: linkedItem\.id/);
  assert.match(noteMetaPanelSource, /function LinkedFileModal/);
});

test("linked image and pdf previews preserve aspect ratio and render inline", () => {
  const thumbRule = cssRule(".linked-file-thumb");
  const mediaRule = styles.match(/\.linked-file-thumb img,\n\.linked-file-thumb iframe\s*\{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(thumbRule, /background:\s*#ffffff/);
  assert.match(thumbRule, /padding:\s*4px/);
  assert.match(mediaRule, /object-fit:\s*contain/);
  assert.match(noteMetaPanelSource, /isImageFile\(linkedFile\) \|\| isPdfFile\(linkedFile\)/);
  assert.match(styles, /\.linked-file-modal-frame\s*\{[\s\S]*?min-height:\s*70vh[\s\S]*?\n\}/);
});

test("unsupported linked file formats render without a preview action", () => {
  assert.match(noteMetaPanelSource, /Unsupported linked file formats show a file card without a preview action|linked-file-thumb-generic/);
  assert.match(noteMetaPanelSource, /canPreview \? \(/);
  assert.match(noteMetaPanelSource, /<div className="linked-resource-card linked-file-card">\{body\}<\/div>/);
});
