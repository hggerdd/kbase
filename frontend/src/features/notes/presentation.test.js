import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const noteMetaPanelSource = readFileSync(
  resolve(process.cwd(), "src/pages/notes/components/NoteMetaPanel.jsx"),
  "utf8",
);
const noteEditorSource = readFileSync(resolve(process.cwd(), "src/pages/notes/components/NoteEditor.jsx"), "utf8");
const hooksSource = readFileSync(resolve(process.cwd(), "src/features/notes/hooks.js"), "utf8");
const homePageSource = readFileSync(resolve(process.cwd(), "src/pages/home/HomePage.jsx"), "utf8");
const preferencesApiSource = readFileSync(resolve(process.cwd(), "src/features/preferences/api.js"), "utf8");
const sharedApiClientSource = readFileSync(resolve(process.cwd(), "src/shared/api/client.js"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

function cssRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return styles.match(new RegExp(`${escapedSelector}\\s*\\{[\\s\\S]*?\\n\\}`))?.[0] ?? "";
}

test("linked notes render as clickable note cards with a detail modal", () => {
  assert.match(noteMetaPanelSource, /className="linked-note-card"/);
  assert.match(noteMetaPanelSource, /function LinkedResourceCard/);
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
  const mediaRule = styles.match(/\.linked-file-thumb img,\r?\n\.linked-file-thumb iframe\s*\{[\s\S]*?\r?\n\}/)?.[0] ?? "";

  assert.match(thumbRule, /background:\s*#ffffff/);
  assert.match(thumbRule, /padding:\s*4px/);
  assert.match(mediaRule, /object-fit:\s*contain/);
  assert.match(noteMetaPanelSource, /isImageFile\(linkedFile\) \|\| isPdfFile\(linkedFile\)/);
  assert.match(styles, /\.linked-file-modal-frame\s*\{[\s\S]*?min-height:\s*70vh[\s\S]*?\n\}/);
});

test("unsupported linked file formats render without a preview action", () => {
  assert.match(noteMetaPanelSource, /Unsupported linked file formats show a file card without a preview action|linked-file-thumb-generic/);
  assert.match(noteMetaPanelSource, /canOpen=\{canPreview\}/);
  assert.match(noteMetaPanelSource, /<div className=\{mainClassName\}>\{body\}<\/div>/);
});

test("linked resources expose an unlink action through the workspace", () => {
  assert.match(noteMetaPanelSource, /function UnlinkResourceButton/);
  assert.match(noteMetaPanelSource, /unlink=\{/);
  assert.match(noteMetaPanelSource, /aria-label=\{label\}/);
  assert.match(noteMetaPanelSource, /<XIcon \/>/);
  assert.match(noteMetaPanelSource, /linked-resource-remove/);
  assert.match(noteMetaPanelSource, /workspace\.handleUnlinkExistingItem/);
  assert.match(noteMetaPanelSource, /handleUnlinkExistingItem\(link\.id\)/);
  assert.match(hooksSource, /unlinkNoteItem\(linkId\)/);
  assert.match(hooksSource, /setNotice\("Item unlinked"\)/);
});

test("linked resources render as compact horizontal cards", () => {
  assert.match(styles, /\.linked-resource-list\s*\{[\s\S]*?display:\s*flex[\s\S]*?flex-direction:\s*row[\s\S]*?overflow-x:\s*auto[\s\S]*?\n\}/);
  assert.match(styles, /\.linked-resource-list li\s*\{[\s\S]*?flex:\s*0 0 clamp\(210px, 28vw, 280px\)[\s\S]*?\n\}/);
  assert.match(styles, /\.linked-resource-card\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto[\s\S]*?\n\}/);
  assert.match(styles, /\.linked-resource-main\s*\{[\s\S]*?grid-template-columns:\s*auto minmax\(0, 1fr\)[\s\S]*?\n\}/);
});

test("home note editor uses a compact single-surface detail layout", () => {
  assert.doesNotMatch(noteEditorSource, /Selected note/);
  assert.match(styles, /\.workspace-note-editor-panel\s*\{[\s\S]*?overflow:\s*hidden[\s\S]*?border-radius:\s*12px[\s\S]*?background:\s*#ffffff[\s\S]*?\n\}/);
  assert.match(styles, /\.workspace-detail-hero\s*\{[\s\S]*?padding:\s*16px 18px[\s\S]*?background:\s*linear-gradient\(135deg, #dbeafe[\s\S]*?box-shadow:\s*none[\s\S]*?\n\}/);
  assert.match(styles, /\.workspace-note-editor-panel \.note-title-row h2\s*\{[\s\S]*?font-size:\s*clamp\(1\.18rem, 1\.7vw, 1\.55rem\)[\s\S]*?\n\}/);
  assert.match(styles, /\.workspace-note-editor-panel \.mini-panel\s*\{[\s\S]*?border:\s*0[\s\S]*?border-radius:\s*0[\s\S]*?background:\s*transparent[\s\S]*?\n\}/);
});

test("note label interactions use the workspace toggle path instead of rebuilding from stale modal state", () => {
  assert.match(noteEditorSource, /workspace\.toggleSelectedNoteLabel\(labelPath\)/);
  assert.match(noteEditorSource, /source !== "user"/);
  assert.match(noteEditorSource, /workspace\.setEditor\(\(currentEditor\) => \(\{/);
  assert.match(noteEditorSource, /\.\.\.currentEditor/);
  assert.match(hooksSource, /function applyOptimisticNoteLabels/);
  assert.match(hooksSource, /async function flushPendingLabelUpdates/);
});

test("home metadata filters expose compact tree controls and internal scroll regions", () => {
  assert.match(homePageSource, /aria-label="Expand all categories"/);
  assert.match(homePageSource, /aria-label="Collapse all categories"/);
  assert.match(homePageSource, /aria-label="Expand all labels"/);
  assert.match(homePageSource, /aria-label="Collapse all labels"/);
  assert.match(homePageSource, /NOTE_SORT_OPTIONS/);
  assert.match(homePageSource, /NOTE_SORT_PREFERENCE_KEY/);
  assert.match(homePageSource, /fetchUserPreference\(NOTE_SORT_PREFERENCE_KEY\)/);
  assert.match(homePageSource, /saveUserPreference\(NOTE_SORT_PREFERENCE_KEY, normalizedSortMode\)/);
  assert.match(homePageSource, /normalizeNoteSortMode\(preference\.value\)/);
  assert.match(homePageSource, /aria-label="Notes order options"/);
  assert.match(homePageSource, /Recent \(last changed\)/);
  assert.match(homePageSource, /Alphabetical/);
  assert.match(homePageSource, /Created on/);
  assert.match(homePageSource, /className="workspace-tree-scroll"/);
  assert.match(styles, /\.workspace-filter-section\s*\{[\s\S]*?flex:\s*1 1 0[\s\S]*?\n\}/);
  assert.match(styles, /\.workspace-tree-scroll,\r?\n\.workspace-flat-scroll\s*\{[\s\S]*?overflow:\s*auto[\s\S]*?\n\}/);
  assert.match(styles, /\.workspace-tree-action\s*\{[\s\S]*?width:\s*24px[\s\S]*?\n\}/);
  assert.match(styles, /\.workspace-sort-menu\s*\{[\s\S]*?position:\s*absolute[\s\S]*?\n\}/);
});

test("home mobile keeps search visible and moves filters behind advanced", () => {
  assert.match(homePageSource, /file-search-action-row/);
  assert.match(homePageSource, /file-mobile-advanced-button/);
  assert.match(homePageSource, /aria-label="Advanced note filters"/);
  assert.match(homePageSource, /file-mobile-advanced-modal/);
  assert.match(homePageSource, /file-advanced-filter/);
  assert.match(styles, /\.file-advanced-filter,\r?\n\s*\.file-desktop-editor\s*\{[\s\S]*?display:\s*none/);
});

test("user preference API uses the shared capability endpoints", () => {
  assert.match(preferencesApiSource, /\/api\/user-preferences\/\$\{encodeURIComponent\(preferenceKey\)\}/);
  assert.match(preferencesApiSource, /method:\s*"PUT"/);
  assert.match(preferencesApiSource, /body:\s*JSON\.stringify\(\{ value \}\)/);
});

test("shared API GET requests bypass stale browser cache entries", () => {
  assert.match(sharedApiClientSource, /const method = String\(options\.method \?\? "GET"\)\.toUpperCase\(\)/);
  assert.match(sharedApiClientSource, /method === "GET" \|\| method === "HEAD" \? "no-store" : undefined/);
  assert.match(sharedApiClientSource, /cache,/);
});
