import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const labelsPageSource = readFileSync(resolve(process.cwd(), "src/pages/labels/LabelsPage.jsx"), "utf8");
const categoriesPageSource = readFileSync(resolve(process.cwd(), "src/pages/settings/CategoriesSettingsPage.jsx"), "utf8");
const projectsPageSource = readFileSync(resolve(process.cwd(), "src/pages/settings/ProjectsSettingsPage.jsx"), "utf8");
const roundIconButtonSource = readFileSync(resolve(process.cwd(), "src/shared/ui/RoundIconButton.jsx"), "utf8");
const treeActionButtonsSource = readFileSync(resolve(process.cwd(), "src/shared/ui/TreeActionButtons.jsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

test("settings labels page uses the shared workspace shell with search and tree detail panes", () => {
  assert.match(labelsPageSource, /className="settings-workspace-layout"/);
  assert.match(labelsPageSource, /className="settings-workspace-panel settings-workspace-list-panel"/);
  assert.match(labelsPageSource, /className="settings-workspace-panel settings-workspace-detail-panel"/);
  assert.match(labelsPageSource, /workspace\.setQuery\(event\.target\.value\)/);
  assert.match(labelsPageSource, /aria-label="Label explorer tree"/);
});

test("settings categories page renders a tree-based editor with compact create and inline detail editing", () => {
  assert.match(categoriesPageSource, /function CategoryTreeNode/);
  assert.match(categoriesPageSource, /function CategoryDetailForm/);
  assert.match(categoriesPageSource, /function DeleteCategoryModal/);
  assert.match(categoriesPageSource, /<RoundIconButton/);
  assert.match(categoriesPageSource, /<TreeActionButtons/);
  assert.match(categoriesPageSource, /aria-label="Create category"/);
  assert.match(treeActionButtonsSource, /aria-label=\{expandLabel\}/);
  assert.match(treeActionButtonsSource, /aria-label=\{collapseLabel\}/);
  assert.match(categoriesPageSource, /Delete and clear categories/);
  assert.match(categoriesPageSource, /Delete this category\./);
  assert.match(categoriesPageSource, /I understand that related notes and items will lose this category\./);
  assert.doesNotMatch(categoriesPageSource, /window\.confirm/);
  assert.match(categoriesPageSource, /title=\{mode === "create" \? "Create category" : selectedCategory\?\.label \?\? "No category selected"\}/);
  assert.match(categoriesPageSource, /await workspace\.handleUpdateCategory\(selectedCategory\.key, draft\)/);
  assert.match(categoriesPageSource, /await workspace\.handleCreateCategory\(draft\)/);
});

test("settings projects page uses the shared workspace shell and the workspace-scoped filtered project list", () => {
  assert.match(projectsPageSource, /className="settings-workspace-layout"/);
  assert.match(projectsPageSource, /workspace\.filteredProjects\.length/);
  assert.match(projectsPageSource, /workspace\.setSearch\(event\.target\.value\)/);
  assert.match(projectsPageSource, /className="settings-tree-scroll settings-project-list"/);
  assert.match(projectsPageSource, /<RoundIconButton/);
});

test("shared settings workspace styles provide bounded panes and round shared actions", () => {
  assert.match(roundIconButtonSource, /export function RoundIconButton/);
  assert.match(treeActionButtonsSource, /export function TreeActionButtons/);
  assert.match(styles, /\.settings-workspace-layout\s*\{[\s\S]*?grid-template-columns:\s*minmax\(300px, 380px\) minmax\(0, 1fr\)[\s\S]*?\n\}/);
  assert.match(styles, /\.settings-tree-scroll\s*\{[\s\S]*?max-height:\s*62vh[\s\S]*?overflow:\s*auto[\s\S]*?\n\}/);
  assert.match(styles, /\.round-icon-button\s*\{[\s\S]*?border-radius:\s*999px[\s\S]*?\n\}/);
  assert.match(styles, /\.settings-workspace-create-button\s*\{[\s\S]*?width:\s*42px[\s\S]*?\n\}/);
});
