import React, { useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_CATEGORY_DRAFT, useCategoriesWorkspace } from "../../features/categories/hooks.js";
import {
  buildCategoryTree,
  collectCategoryAncestors,
  collectCategoryKeys,
} from "../../features/categories/state.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { NoteIcon, PlusIcon, TrashIcon } from "../../shared/ui/Icons.jsx";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatusBanner } from "../../shared/ui/StatusBanner";

const ITEM_KIND_OPTIONS = [
  { value: "", label: "All item types" },
  { value: "note", label: "Notes" },
  { value: "document", label: "Documents" },
  { value: "image", label: "Images" },
  { value: "spreadsheet", label: "Spreadsheets" },
  { value: "project", label: "Projects" },
];

function normalizeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildParentOptions(categories, currentCategory, appliesToKind) {
  const currentPath = currentCategory?.full_path;
  return categories.filter((entry) => {
    if (entry.key === currentCategory?.key) {
      return false;
    }
    if (currentPath && (entry.full_path === currentPath || entry.full_path.startsWith(`${currentPath}/`))) {
      return false;
    }
    return !entry.applies_to_kind || entry.applies_to_kind === (appliesToKind ?? "");
  });
}

function CategoryTreeNode({ category, expandedKeys, onSelect, onToggle, selectedKey }) {
  const hasChildren = category.children.length > 0;
  const isExpanded = expandedKeys.has(category.key);
  const isSelected = selectedKey === category.key;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <button
        type="button"
        className={`workspace-tree-row settings-tree-row ${isSelected ? "active" : ""}`.trim()}
        onClick={() => onSelect(category.key)}
      >
        <span
          className={`workspace-tree-caret ${isExpanded ? "expanded" : ""} ${hasChildren ? "" : "hidden"}`.trim()}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) {
              onToggle(category.key);
            }
          }}
        />
        <span className="workspace-tree-icon">
          <NoteIcon />
        </span>
        <span className="workspace-tree-label">{category.label}</span>
        {!category.is_active ? <span className="label-state-chip">inactive</span> : null}
      </button>
      {hasChildren && isExpanded ? (
        <ul className="workspace-tree-list nested" role="group">
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.key}
              category={child}
              expandedKeys={expandedKeys}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedKey={selectedKey}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CategoryDetailForm({
  draft,
  mode,
  parentOptions,
  saving,
  selectedCategory,
  onCancelCreate,
  onDelete,
  onSave,
  onStartCreate,
  onUpdateDraft,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    void onSave();
  }

  return (
    <form className="settings-detail-form" onSubmit={handleSubmit}>
      {selectedCategory && mode === "edit" ? (
        <div className="settings-detail-meta-row">
          <span className="category-kind-pill">{selectedCategory.applies_to_kind || "all"}</span>
          <span className={`category-state-pill ${selectedCategory.is_active ? "active" : "inactive"}`}>
            {selectedCategory.is_active ? "active" : "inactive"}
          </span>
          <span className="settings-count-pill">{selectedCategory.full_path}</span>
        </div>
      ) : null}

      <label className="settings-detail-field">
        <span>Key</span>
        <input
          value={draft.key}
          disabled={mode === "edit"}
          onChange={(event) => onUpdateDraft({
            key: normalizeKey(event.target.value),
          })}
          autoFocus
        />
      </label>

      <label className="settings-detail-field">
        <span>Label</span>
        <input
          value={draft.label}
          onChange={(event) => onUpdateDraft({
            label: event.target.value,
            key: mode === "create" && !draft.key ? normalizeKey(event.target.value) : draft.key,
          })}
        />
      </label>

      <label className="settings-detail-field">
        <span>Applies to</span>
        <select value={draft.applies_to_kind ?? ""} onChange={(event) => onUpdateDraft({ applies_to_kind: event.target.value })}>
          {ITEM_KIND_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="settings-detail-field">
        <span>Parent category</span>
        <select value={draft.parent_key ?? ""} onChange={(event) => onUpdateDraft({ parent_key: event.target.value })}>
          <option value="">Root category</option>
          {parentOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {"  ".repeat(option.depth)}{option.label} ({option.key})
            </option>
          ))}
        </select>
      </label>

      <label className="settings-detail-field">
        <span>Description</span>
        <textarea
          rows={5}
          value={draft.description ?? ""}
          onChange={(event) => onUpdateDraft({ description: event.target.value })}
        />
      </label>

      <label className="inline-check">
        <input
          type="checkbox"
          checked={Boolean(draft.is_active)}
          onChange={(event) => onUpdateDraft({ is_active: event.target.checked })}
        />
        <span>Active</span>
      </label>

      <div className="settings-detail-actions">
        {mode === "create" ? (
          <button className="secondary" type="button" onClick={onCancelCreate}>
            Clear
          </button>
        ) : (
          <button className="secondary" type="button" onClick={onStartCreate}>
            New child
          </button>
        )}
        <button className="primary" type="submit" disabled={saving || !draft.key.trim() || !draft.label.trim()}>
          {mode === "create" ? "Create category" : "Save category"}
        </button>
        {mode === "edit" && selectedCategory ? (
          <button className="danger icon-text-button" type="button" disabled={saving} onClick={() => onDelete(selectedCategory)}>
            <span className="button-icon"><TrashIcon /></span>
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}

function DeleteCategoryModal({
  category,
  saving,
  confirmationRequired,
  confirmedForceDelete,
  onCancel,
  onConfirm,
  onToggleConfirmedForceDelete,
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={saving ? undefined : onCancel}>
      <div
        className="modal-sheet category-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Delete category</p>
            <h2 id="category-delete-title">Delete {category.label}?</h2>
          </div>
        </div>
        <div className="settings-detail-stack">
          {confirmationRequired ? (
            <>
              <p className="muted">
                This category is still assigned to existing items. If you continue, all related notes and other items will lose this category assignment.
              </p>
              <label className="inline-check settings-delete-confirm-check">
                <input
                  type="checkbox"
                  checked={confirmedForceDelete}
                  onChange={(event) => onToggleConfirmedForceDelete(event.target.checked)}
                  disabled={saving}
                />
                <span>I understand that related notes and items will lose this category.</span>
              </label>
            </>
          ) : (
            <p className="muted">
              Delete this category. If it is still in use, this same dialog will ask for an explicit confirmation before clearing existing category assignments.
            </p>
          )}
          <div className="settings-detail-actions">
            <button className="secondary" type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button
              className="danger"
              type="button"
              onClick={onConfirm}
              disabled={saving || (confirmationRequired && !confirmedForceDelete)}
            >
              {confirmationRequired ? "Delete and clear categories" : "Delete category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoriesSettingsPage() {
  const workspace = useCategoriesWorkspace();
  const expansionInitializedRef = useRef(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [mode, setMode] = useState("create");
  const [draft, setDraft] = useState(EMPTY_CATEGORY_DRAFT);
  const [pendingForceDeleteCategory, setPendingForceDeleteCategory] = useState(null);
  const [confirmedForceDelete, setConfirmedForceDelete] = useState(false);
  const tree = useMemo(() => buildCategoryTree(workspace.categories), [workspace.categories]);
  const categoryKeys = useMemo(() => collectCategoryKeys(tree), [tree]);
  const selectedCategory = workspace.categories.find((category) => category.key === selectedKey) ?? null;
  const activeCount = useMemo(
    () => workspace.categories.filter((category) => category.is_active).length,
    [workspace.categories],
  );
  const parentOptions = useMemo(
    () => buildParentOptions(workspace.categories, mode === "edit" ? selectedCategory : null, draft.applies_to_kind),
    [draft.applies_to_kind, mode, selectedCategory, workspace.categories],
  );

  useEffect(() => {
    const availableKeys = new Set(categoryKeys);
    setExpandedKeys((current) => {
      if (!expansionInitializedRef.current) {
        expansionInitializedRef.current = true;
        return new Set(categoryKeys);
      }
      const next = new Set([...current].filter((key) => availableKeys.has(key)));
      if (selectedKey && availableKeys.has(selectedKey)) {
        next.add(selectedKey);
        collectCategoryAncestors(selectedKey, workspace.categories).forEach((key) => next.add(key));
      }
      return next;
    });
  }, [categoryKeys, selectedKey, workspace.categories]);

  useEffect(() => {
    if (selectedKey && !workspace.categories.some((category) => category.key === selectedKey)) {
      setSelectedKey("");
      setMode("create");
    }
  }, [selectedKey, workspace.categories]);

  useEffect(() => {
    if (mode === "edit" && selectedCategory) {
      setDraft({
        key: selectedCategory.key,
        label: selectedCategory.label ?? "",
        description: selectedCategory.description ?? "",
        applies_to_kind: selectedCategory.applies_to_kind ?? "",
        parent_key: selectedCategory.parent_key ?? "",
        is_active: Boolean(selectedCategory.is_active),
      });
    }
  }, [mode, selectedCategory]);

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function toggleExpanded(categoryKey) {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  }

  function startCreateCategory(parentKey = selectedCategory?.key ?? "") {
    setMode("create");
    setSelectedKey("");
    setDraft({
      ...EMPTY_CATEGORY_DRAFT,
      applies_to_kind: selectedCategory?.applies_to_kind ?? workspace.appliesToKind ?? "note",
      parent_key: parentKey,
      is_active: true,
    });
  }

  function selectCategory(categoryKey) {
    setSelectedKey(categoryKey);
    setMode("edit");
  }

  function openDeleteCategoryModal(category) {
    setPendingForceDeleteCategory({
      ...category,
      requiresForceConfirmation: false,
    });
    setConfirmedForceDelete(false);
  }

  async function saveCategory() {
    if (mode === "create") {
      const created = await workspace.handleCreateCategory(draft);
      if (!created) {
        return;
      }
      setSelectedKey(draft.key);
      setMode("edit");
      setExpandedKeys((current) => {
        const next = new Set(current);
        next.add(draft.key);
        if (draft.parent_key) {
          next.add(draft.parent_key);
        }
        return next;
      });
      return;
    }

    if (!selectedCategory) {
      return;
    }
    await workspace.handleUpdateCategory(selectedCategory.key, draft);
  }

  async function submitDeleteCategory() {
    if (!pendingForceDeleteCategory) {
      return;
    }
    const outcome = await workspace.handleDeleteCategory(pendingForceDeleteCategory.key, {
      force: pendingForceDeleteCategory.requiresForceConfirmation,
    });
    if (outcome.ok) {
      const parentKey = pendingForceDeleteCategory.parent_key ?? "";
      setPendingForceDeleteCategory(null);
      setConfirmedForceDelete(false);
      setSelectedKey("");
      startCreateCategory(parentKey);
      return;
    }
    if (outcome.requiresForce) {
      setPendingForceDeleteCategory((current) => (current ? { ...current, requiresForceConfirmation: true } : current));
      setConfirmedForceDelete(false);
    }
  }

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Settings"
        title="Categories"
        description="Manage the possible categories that can be assigned to notes, files and projects."
        actions={(
          <button
            className="primary icon-only-button settings-workspace-create-button"
            type="button"
            aria-label="Create category"
            title="Create category"
            onClick={() => startCreateCategory()}
          >
            <PlusIcon />
          </button>
        )}
        aside={<span className="settings-count-pill">{activeCount} active</span>}
      />

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="settings-workspace-layout">
        <Panel
          className="settings-workspace-panel settings-workspace-list-panel"
          eyebrow="Categories"
          title={`Known categories (${workspace.categories.length})`}
          action={(
            <div className="settings-tree-actions">
              <button
                type="button"
                className="secondary icon-only-button settings-tree-action-button"
                aria-label="Expand all categories"
                title="Expand all categories"
                onClick={() => setExpandedKeys(new Set(categoryKeys))}
              >
                +
              </button>
              <button
                type="button"
                className="secondary icon-only-button settings-tree-action-button"
                aria-label="Collapse all categories"
                title="Collapse all categories"
                onClick={() => setExpandedKeys(new Set())}
              >
                -
              </button>
            </div>
          )}
        >
          <div className="settings-workspace-toolbar settings-workspace-toolbar-grid">
            <label className="settings-search-field">
              <span>Search</span>
              <input
                value={workspace.query}
                onChange={(event) => workspace.setQuery(event.target.value)}
                placeholder="Search key, label or description"
              />
            </label>
            <label className="settings-search-field">
              <span>Item type</span>
              <select value={workspace.appliesToKind} onChange={(event) => workspace.setAppliesToKind(event.target.value)}>
                {ITEM_KIND_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-check settings-filter-check">
              <input
                type="checkbox"
                checked={workspace.includeInactive}
                onChange={(event) => workspace.setIncludeInactive(event.target.checked)}
              />
              <span>Show inactive</span>
            </label>
          </div>

          {workspace.loading ? <p className="muted">Loading categories...</p> : null}
          {!workspace.loading && workspace.categories.length === 0 ? (
            <EmptyState title="No categories found" description="Create a category or change the filter." />
          ) : (
            <div className="settings-tree-scroll">
              <ul className="workspace-tree-list" role="tree" aria-label="Category settings tree">
                {tree.map((category) => (
                  <CategoryTreeNode
                    key={category.key}
                    category={category}
                    expandedKeys={expandedKeys}
                    onSelect={selectCategory}
                    onToggle={toggleExpanded}
                    selectedKey={selectedKey}
                  />
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel
          className="settings-workspace-panel settings-workspace-detail-panel"
          eyebrow={mode === "create" ? "New category" : "Category"}
          title={mode === "create" ? "Create category" : selectedCategory?.label ?? "No category selected"}
        >
          {mode === "edit" && !selectedCategory ? (
            <EmptyState title="No category selected" description="Choose a category from the tree or create a new one." />
          ) : (
            <CategoryDetailForm
              draft={draft}
              mode={mode}
              parentOptions={parentOptions}
              saving={workspace.saving}
              selectedCategory={selectedCategory}
              onCancelCreate={() => startCreateCategory()}
              onDelete={openDeleteCategoryModal}
              onSave={saveCategory}
              onStartCreate={() => startCreateCategory(selectedCategory?.key ?? "")}
              onUpdateDraft={updateDraft}
            />
          )}
        </Panel>
      </div>

      {pendingForceDeleteCategory ? (
        <DeleteCategoryModal
          category={pendingForceDeleteCategory}
          saving={workspace.saving}
          confirmationRequired={pendingForceDeleteCategory.requiresForceConfirmation}
          confirmedForceDelete={confirmedForceDelete}
          onCancel={() => {
            setPendingForceDeleteCategory(null);
            setConfirmedForceDelete(false);
          }}
          onConfirm={() => void submitDeleteCategory()}
          onToggleConfirmedForceDelete={setConfirmedForceDelete}
        />
      ) : null}
    </ResponsiveContainer>
  );
}
