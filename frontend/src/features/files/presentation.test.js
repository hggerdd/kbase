import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pageSource = readFileSync(resolve(process.cwd(), "src/pages/files/FileViewerPage.jsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

test("stored path field uses a wrapping value class", () => {
  assert.match(pageSource, /Stored path/);
  assert.match(pageSource, /className="detail-value-wrap"/);
});

test("wrapping class enables long path line breaks", () => {
  const wrapRule = styles.match(/\.detail-value-wrap\s*\{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(wrapRule, /overflow-wrap:\s*anywhere/);
  assert.match(wrapRule, /word-break:\s*break-word/);
});
