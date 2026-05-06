import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pageSource = readFileSync(resolve(process.cwd(), "src/pages/files/FileViewerPage.jsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

test("wrapping class enables long path line breaks", () => {
  const wrapRule = styles.match(/\.detail-value-wrap\s*\{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(wrapRule, /overflow-wrap:\s*anywhere/);
  assert.match(wrapRule, /word-break:\s*break-word/);
});

test("file viewer renders a dedicated preview area", () => {
  assert.match(pageSource, /<h3>Preview<\/h3>/);
  assert.match(pageSource, /className="file-preview-frame"/);
});

test("file viewer exposes item context editing controls", () => {
  assert.doesNotMatch(pageSource, /workspace\.saveCore/);
  assert.match(pageSource, /ItemContextPills/);
  assert.match(pageSource, /updateSelectedItemCategory/);
  assert.match(pageSource, /replaceSelectedItemProject/);
  assert.match(pageSource, /toggleSelectedItemLabel/);
  assert.match(pageSource, /<h3>Description<\/h3>/);
  assert.match(pageSource, /<h3>Links<\/h3>/);
  assert.doesNotMatch(pageSource, /<select/);
});

test("file viewer exposes autosave and add-file upload controls", () => {
  assert.match(pageSource, /Autosaved/);
  assert.match(pageSource, /round-add-button/);
  assert.match(pageSource, /capture="environment"/);
  assert.match(pageSource, /uploadNewFile/);
});

test("file viewer renders tree-based filters in the sidebar", () => {
  assert.match(pageSource, /File category filter tree/);
  assert.match(pageSource, /File label filter tree/);
  assert.match(pageSource, /File project filter tree/);
  assert.doesNotMatch(pageSource, /Filter by category prefix/);
});

test("file viewer has a mobile advanced filter and detail modal flow", () => {
  assert.match(pageSource, /file-mobile-advanced-button/);
  assert.match(pageSource, /file-mobile-advanced-modal/);
  assert.match(pageSource, /file-mobile-detail-modal/);
  assert.match(pageSource, /handleSelectFile/);
  assert.match(styles, /\.file-desktop-editor\s*\{[\s\S]*?display:\s*none/);
});
