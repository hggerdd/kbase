import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdownToSafeHtml, sanitizeRichHtml } from "./rich-content.js";

test("sanitizeRichHtml removes scripts and event handlers", () => {
  const sanitized = sanitizeRichHtml('<h1 onclick="alert(1)">Title</h1><script>alert(2)</script>');

  assert.match(sanitized, /<h1/);
  assert.doesNotMatch(sanitized, /onclick/i);
  assert.doesNotMatch(sanitized, /script/i);
});

test("sanitizeRichHtml removes unsafe links", () => {
  const sanitized = sanitizeRichHtml('<a href="javascript:alert(1)">bad</a><a href="https://example.test">ok</a>');

  assert.match(sanitized, /https:\/\/example\.test/);
  assert.doesNotMatch(sanitized, /javascript:/i);
});

test("renderMarkdownToSafeHtml neutralizes stored markdown html payloads", async () => {
  const sanitized = await renderMarkdownToSafeHtml('# Summary\n<img src=x onerror="alert(1)">\n<script>alert(2)</script>');

  assert.match(sanitized, /Summary/);
  assert.doesNotMatch(sanitized, /onerror/i);
  assert.doesNotMatch(sanitized, /script/i);
});
