import test from "node:test";
import assert from "node:assert/strict";
import { formatBuildDate, getBuildInfo } from "./build-info.js";

test("build info exposes a compact visible label", () => {
  const info = getBuildInfo();

  assert.ok(info.deployment);
  assert.ok(info.branch);
  assert.ok(info.commitShort);
  assert.match(info.label, new RegExp(info.deployment));
});

test("formatBuildDate renders ISO dates as calendar dates", () => {
  assert.equal(formatBuildDate("2026-04-26T12:34:56.000Z"), "2026-04-26");
  assert.equal(formatBuildDate("not-a-date"), "unknown date");
});

