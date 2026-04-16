import React, { useEffect, useMemo, useState } from "react";
import { EMPTY_CATEGORY_DRAFT, useCategoriesWorkspace } from "../../features/categories/hooks.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { PencilIcon, PlusIcon } from "../../shared/ui/Icons.jsx";
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

function CategoryModal({ category, mode, saving, onClose, onSubmit }) {
  const [draft, setDraft] = useState(category ?? EMPTY_CATEGORY_DRAFT);

  useEffect(() => {
    setDraft(category ?? EMPTY_CATEGORY_DRAFT);
  }, [category]);

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    void onSubmit(draft);
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-sheet category-edit-modal" role="dialog" aria-modal="true" aria-labelledby="category-edit-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{mode === "create" ? "Add category" : "Edit category"}</p>
            <h2 id="category-edit-title">{mode === "create" ? "Add category" : "Edit category"}</h2>
          </div>
        </div>
        <form className="create-form category-edit-form" onSubmit={handleSubmit}>
          <label>
            <span>Key</span>
            <input
              value={draft.key}
              disabled={mode === "edit"}
              onChange={(event) => updateDraft({ key: normalizeKey(event.target.value) })}
              autoFocus
            />
          </label>
          <label>
            <span>Label</span>
            <input
              value={draft.label}
              onChange={(event) => updateDraft({
                label: event.target.value,
                key: mode === "create" && !draft.key ? normalizeKey(event.target.value) : draft.key,
              })}
            />
          </label>
          <label>
            <span>Applies to</span>
            <select value={draft.applies_to_kind ?? ""} onChange={(event) => updateDraft({ applies_to_kind: event.target.value })}>
              {ITEM_KIND_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Description</span>
            <textarea rows={4} value={draft.description ?? ""} onChange={(event) => updateDraft({ description: event.target.value })} />
          </label>
          {mode === "edit" ? (
            <label className="inline-check">
              <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(event) => updateDraft({ is_active: event.target.checked })} />
              <span>Active</span>
            </label>
          ) : null}
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit" disabled={saving || !draft.key.trim() || !draft.label.trim()}>
              {mode === "create" ? "Create category" : "Save category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CategoriesSettingsPage() {
  const workspace = useCategoriesWorkspace();
  const [modalMode, setModalMode] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const selectedCategory = workspace.categories.find((category) => category.key === selectedKey) ?? null;
  const activeCount = useMemo(
    () => workspace.categories.filter((category) => category.is_active).length,
    [workspace.categories],
  );

  async function submitCreate(draft) {
    const created = await workspace.handleCreateCategory(draft);
    if (created) {
      setModalMode(null);
      setSelectedKey(draft.key);
    }
  }

  async function submitEdit(draft) {
    if (!selectedCategory) {
      return;
    }
    const updated = await workspace.handleUpdateCategory(selectedCategory.key, draft);
    if (updated) {
      setModalMode(null);
    }
  }

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Settings"
        title="Categories"
        description="Manage the possible categories that can be assigned to notes, files and projects."
        actions={
          <button className="primary icon-text-button" type="button" onClick={() => setModalMode("create")}>
            <span className="button-icon"><PlusIcon /></span>
            Add category
          </button>
        }
        aside={<span className="settings-count-pill">{activeCount} active</span>}
      />

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <Panel className="settings-filter-panel">
        <div className="settings-filter-row">
          <label>
            <span>Search</span>
            <input value={workspace.query} onChange={(event) => workspace.setQuery(event.target.value)} placeholder="Search key, label or description" />
          </label>
          <label>
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
            <input type="checkbox" checked={workspace.includeInactive} onChange={(event) => workspace.setIncludeInactive(event.target.checked)} />
            <span>Show inactive</span>
          </label>
        </div>
      </Panel>

      <Panel className="categories-management-panel" eyebrow="Categories" title={`Known categories (${workspace.categories.length})`}>
        {workspace.loading ? <p className="muted">Loading categories...</p> : null}
        {!workspace.loading && workspace.categories.length === 0 ? (
          <EmptyState title="No categories found" description="Create a category or change the filter." />
        ) : (
          <div className="category-list">
            {workspace.categories.map((category) => (
              <article key={category.key} className={`category-row ${category.key === selectedKey ? "active" : ""}`}>
                <button type="button" className="category-row-main" onClick={() => setSelectedKey(category.key)}>
                  <span className="category-row-title">{category.label}</span>
                  <span className="category-row-key">{category.key}</span>
                  {category.description ? <span className="category-row-description">{category.description}</span> : null}
                </button>
                <div className="category-row-meta">
                  <span className="category-kind-pill">{category.applies_to_kind || "all"}</span>
                  <span className={`category-state-pill ${category.is_active ? "active" : "inactive"}`}>
                    {category.is_active ? "active" : "inactive"}
                  </span>
                </div>
                <div className="category-row-actions">
                  <button className="secondary icon-only-button" type="button" aria-label={`Edit ${category.label}`} title="Edit" onClick={() => {
                    setSelectedKey(category.key);
                    setModalMode("edit");
                  }}>
                    <PencilIcon />
                  </button>
                  <button className="secondary" type="button" disabled={workspace.saving} onClick={() => void workspace.handleSetActive(category.key, !category.is_active)}>
                    {category.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {modalMode === "create" ? (
        <CategoryModal mode="create" saving={workspace.saving} onClose={() => setModalMode(null)} onSubmit={submitCreate} />
      ) : null}
      {modalMode === "edit" && selectedCategory ? (
        <CategoryModal category={selectedCategory} mode="edit" saving={workspace.saving} onClose={() => setModalMode(null)} onSubmit={submitEdit} />
      ) : null}
    </ResponsiveContainer>
  );
}
