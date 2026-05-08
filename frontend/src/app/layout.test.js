import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
const navConfigSource = readFileSync(resolve(process.cwd(), "src/app/navigation/nav-config.js"), "utf8");
const appShellSource = readFileSync(resolve(process.cwd(), "src/app/AppShell.jsx"), "utf8");

test("desktop sidebar stays fixed while page content scrolls", () => {
  const sidebarBlock = styles.match(/\.app-sidebar\s*\{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(sidebarBlock, /position:\s*sticky/);
  assert.match(sidebarBlock, /top:\s*0/);
  assert.match(sidebarBlock, /height:\s*100vh/);
});

test("primary navigation no longer exposes a dedicated search tab", () => {
  assert.doesNotMatch(navConfigSource, /id:\s*"search"/);
});

test("settings route does not keep a primary content tab active", () => {
  assert.match(appShellSource, /return NAV_ITEMS\.some\(\(item\) => item\.id === activeRoute\) \? activeRoute : null;/);
});
