import React, { useMemo, useState } from "react";

export function LabelManagerModal({ isOpen, onClose, workspace, onLabelsChanged }) {
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const activeLabels = useMemo(
    () => workspace.labels.filter((label) => label.is_active),
    [workspace.labels],
  );

  if (!isOpen) {
    return null;
  }

  async function handleCreate(event) {
    const success = await workspace.handleCreateLabel(event);
    if (success) {
      onLabelsChanged?.();
    }
  }

  async function submitRename(event) {
    event.preventDefault();
    if (!renameTarget) {
      return;
    }
    const success = await workspace.handleRenameLabel(renameTarget.id, renameValue);
    if (success) {
      setRenameTarget(null);
      setRenameValue("");
      onLabelsChanged?.();
    }
  }

  async function handleDeactivate(labelId) {
    const success = await workspace.handleDeactivateLabel(labelId);
    if (success) {
      onLabelsChanged?.();
    }
  }

  async function handleReactivate(labelId) {
    const success = await workspace.handleReactivateLabel(labelId);
    if (success) {
      onLabelsChanged?.();
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet label-manager-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="label-manager-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Labels</p>
            <h2 id="label-manager-title">Manage labels</h2>
          </div>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="label-manager-grid">
          <form className="create-form" onSubmit={handleCreate}>
            <label>
              <span>Name</span>
              <input
                value={workspace.draft.name}
                onChange={(event) => workspace.setDraft({ ...workspace.draft, name: event.target.value })}
                placeholder="finance"
                required
              />
            </label>
            <label>
              <span>Parent label</span>
              <select
                value={workspace.draft.parent_id}
                onChange={(event) => workspace.setDraft({ ...workspace.draft, parent_id: event.target.value })}
              >
                <option value="">root</option>
                {activeLabels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.full_path}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Description</span>
              <input
                value={workspace.draft.description}
                onChange={(event) => workspace.setDraft({ ...workspace.draft, description: event.target.value })}
                placeholder="Optional label description"
              />
            </label>
            <button className="primary" type="submit" disabled={workspace.saving}>
              {workspace.saving ? "Saving..." : "Create label"}
            </button>
          </form>

          <div className="label-manager-list">
            <div className="projects-search-row">
              <label className="search-field search-field-wide">
                <input
                  value={workspace.query}
                  onChange={(event) => workspace.setQuery(event.target.value)}
                  placeholder="Search labels"
                />
              </label>
              <label className="toggle-chip">
                <input
                  type="checkbox"
                  checked={workspace.includeInactive}
                  onChange={(event) => workspace.setIncludeInactive(event.target.checked)}
                />
                <span>Inactive</span>
              </label>
            </div>

            <div className="stack-list">
              {workspace.labels.map((label) => (
                <div key={label.id} className="stack-card static label-row">
                  <div>
                    <strong>{label.full_path}</strong>
                    <p>{label.is_active ? "active" : "inactive"}</p>
                  </div>
                  <div className="label-row-actions">
                    <button
                      className="secondary compact-button"
                      type="button"
                      onClick={() => {
                        setRenameTarget(label);
                        setRenameValue(label.name);
                      }}
                    >
                      Rename
                    </button>
                    {label.is_active ? (
                      <button className="secondary compact-button" type="button" onClick={() => void handleDeactivate(label.id)}>
                        Deactivate
                      </button>
                    ) : (
                      <button className="secondary compact-button" type="button" onClick={() => void handleReactivate(label.id)}>
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renameTarget ? (
          <form className="label-rename-inline" onSubmit={submitRename}>
            <label className="search-field search-field-wide">
              <span>Rename {renameTarget.full_path}</span>
              <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} required />
            </label>
            <div className="modal-actions">
              <button className="secondary" type="button" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button className="primary" type="submit" disabled={workspace.saving}>
                Save rename
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
