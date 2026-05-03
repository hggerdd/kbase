import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSearchInput,
  createSearchFilters,
  createSearchHistoryEntry,
  getSearchScopeForRoute,
  mergeSearchHistory,
  sortSearchItems,
} from "./state.js";

test("route scope defaults to page-specific item kinds when global search is disabled", () => {
  const scope = getSearchScopeForRoute("notes", false);
  assert.deepEqual(scope.itemKinds, ["note"]);
  assert.equal(scope.label, "Notes");
});

test("home route search scope stays limited to notes after the home workspace refactor", () => {
  const scope = getSearchScopeForRoute("home", false);
  assert.deepEqual(scope.itemKinds, ["note"]);
  assert.equal(scope.label, "Home notes");
});

test("buildSearchInput keeps page scope when no explicit item kinds are provided", () => {
  const searchInput = buildSearchInput({
    query: "alpha",
    globalScope: false,
    scopeRoute: "projects",
    filters: createSearchFilters({
      categoryKeysText: "project_general, roadmap",
      categoryPathPrefixesText: "knowledge, knowledge/research",
      labelPathsText: "product/docs",
    }),
  });

  assert.equal(searchInput.query, "alpha");
  assert.deepEqual(searchInput.itemKinds, ["project"]);
  assert.deepEqual(searchInput.categoryKeys, ["project_general", "roadmap"]);
  assert.deepEqual(searchInput.categoryPathPrefixes, ["knowledge", "knowledge/research"]);
  assert.deepEqual(searchInput.labelPaths, ["product/docs"]);
});

test("buildSearchInput searches globally when the global toggle is active", () => {
  const searchInput = buildSearchInput({
    query: "alpha",
    globalScope: true,
    scopeRoute: "notes",
    filters: createSearchFilters(),
  });

  assert.deepEqual(searchInput.itemKinds, []);
});

test("sortSearchItems prioritizes stronger title matches over recency", () => {
  const sorted = sortSearchItems(
    [
      {
        id: "b",
        title: "Quarterly review",
        item_kind: "note",
        category_key: "decision",
        status: "active",
        updated_at: "2026-04-14T11:00:00Z",
        created_at: "2026-04-14T09:00:00Z",
        match_reason: "text",
      },
      {
        id: "a",
        title: "Alpha launch plan",
        item_kind: "note",
        category_key: "research",
        status: "draft",
        updated_at: "2026-04-14T10:00:00Z",
        created_at: "2026-04-14T08:00:00Z",
        match_reason: "text",
      },
    ],
    "alpha",
  );

  assert.deepEqual(
    sorted.map((item) => item.id),
    ["a", "b"],
  );
});

test("mergeSearchHistory deduplicates identical searches and keeps the newest first", () => {
  const firstEntry = createSearchHistoryEntry({
    query: "alpha",
    globalScope: false,
    scopeRoute: "notes",
    filters: createSearchFilters({ categoryKeysText: "research" }),
  });
  const newerDuplicate = createSearchHistoryEntry({
    query: "alpha",
    globalScope: false,
    scopeRoute: "notes",
    filters: createSearchFilters({ categoryKeysText: "research" }),
  });
  const distinctEntry = createSearchHistoryEntry({
    query: "beta",
    globalScope: true,
    scopeRoute: "home",
    filters: createSearchFilters(),
  });

  const merged = mergeSearchHistory([firstEntry, distinctEntry], newerDuplicate);

  assert.equal(merged.length, 2);
  assert.equal(merged[0].query, "alpha");
  assert.equal(merged[1].query, "beta");
});
