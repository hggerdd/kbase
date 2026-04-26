import test from "node:test";
import assert from "node:assert/strict";
import { buildFileTree, getPrimaryFilename, getSummaryMarkdown, itemMatchesFileFilters } from "./state.js";

function makeDetail({
  id,
  title,
  categoryKey = "income_document",
  labels = ["test"],
  filename = "sample.txt",
  summary = "# Summary\nBody",
}) {
  return {
    item: {
      id,
      title,
      category_key: categoryKey,
    },
    labels: labels.map((label) => ({ id: label, full_path: label })),
    files: [{ original_filename: filename, relative_path: `documents/${filename}` }],
    primary_content_part: { content_text: summary },
    content_parts: [],
  };
}

test("primary filename prefers the original filename", () => {
  const detail = makeDetail({ id: "a", title: "Alpha", filename: "alpha.pdf" });
  assert.equal(getPrimaryFilename(detail), "alpha.pdf");
});

test("summary markdown falls back to the primary content part", () => {
  const detail = makeDetail({ id: "a", title: "Alpha", summary: "# Alpha\nBody" });
  assert.match(getSummaryMarkdown(detail), /Alpha/);
});

test("file filter requires matching labels and category key prefix", () => {
  const detail = makeDetail({
    id: "a",
    title: "Salary 2025",
    categoryKey: "income_document",
    labels: ["test", "year/2025"],
    summary: "income summary",
  });

  assert.equal(
    itemMatchesFileFilters(detail, {
      query: "salary",
      categoryPrefix: "income",
      selectedLabels: ["test", "year/2025"],
    }),
    true,
  );
  assert.equal(
    itemMatchesFileFilters(detail, {
      query: "salary",
      categoryPrefix: "invoice",
      selectedLabels: ["test"],
    }),
    false,
  );
});

test("file tree treats category keys as flat values", () => {
  const tree = buildFileTree(
    [makeDetail({ id: "a", title: "Alpha", categoryKey: "finance/income", labels: ["year/2025"], filename: "alpha.pdf" })],
    {
      treeLayout: "category-file",
    },
  );

  assert.equal(tree[0].label, "finance/income");
  assert.equal(tree[0].children[0].label, "alpha.pdf");
});

test("category-label-file tree groups files under category and selected labels", () => {
  const tree = buildFileTree(
    [
      makeDetail({ id: "a", title: "Alpha", categoryKey: "income_document", labels: ["test", "year/2025"], filename: "alpha.pdf" }),
      makeDetail({ id: "b", title: "Beta", categoryKey: "income_document", labels: ["test", "year/2026"], filename: "beta.pdf" }),
    ],
    {
      treeLayout: "category-label-file",
      selectedLabels: ["year/2025", "year/2026"],
    },
  );

  assert.equal(tree[0].label, "income_document");
  assert.deepEqual(
    tree[0].children.map((child) => child.label),
    ["year/2025", "year/2026"],
  );
});

test("label-category-file tree flips the grouping order", () => {
  const tree = buildFileTree(
    [makeDetail({ id: "a", title: "Alpha", categoryKey: "income_document", labels: ["test", "year/2025"], filename: "alpha.pdf" })],
    {
      treeLayout: "label-category-file",
      selectedLabels: ["year/2025"],
    },
  );

  assert.equal(tree[0].label, "year/2025");
  assert.equal(tree[0].children[0].label, "income_document");
  assert.equal(tree[0].children[0].children[0].label, "alpha.pdf");
});
