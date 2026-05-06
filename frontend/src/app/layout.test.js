import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
const appShellSource = readFileSync(resolve(process.cwd(), "src/app/AppShell.jsx"), "utf8");

test("desktop sidebar stays fixed while page content scrolls", () => {
  const sidebarBlock = styles.match(/\.app-sidebar\s*\{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(sidebarBlock, /position:\s*sticky/);
  assert.match(sidebarBlock, /top:\s*0/);
  assert.match(sidebarBlock, /height:\s*100vh/);
});

test("app shell does not render the removed global top search", () => {
  assert.doesNotMatch(appShellSource, /global-search/);
  assert.doesNotMatch(styles, /\.global-search/);
});
