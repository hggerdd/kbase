import React from "react";
import ReactQuill from "react-quill";
import TurndownService from "turndown";
import { NOTE_CATEGORIES } from "../../../features/notes/constants";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

function formatCategoryLabel(category) {
  if (category.full_path && category.full_path !== category.key) {
    return category.full_path
      .split("/")
      .map((part) => part.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))
      .join(" / ");
  }
  return category.label || category.key;
}

export function CreateNotePanel({ workspace, isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }
  const categoryOptions = workspace.availableCategories.length > 0
    ? workspace.availableCategories.map((category) => ({
        value: category.key,
        label: formatCategoryLabel(category),
      }))
    : NOTE_CATEGORIES.map((category) => ({ value: category, label: category }));

  async function handleSubmit(event) {
    const success = await workspace.handleCreateNote(event);
    if (success) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Create note">
      <div className="modal-sheet note-modal">
        <div className="modal-header">
          <div>
            <p className="panel-label">New note</p>
            <h3>Create a note</h3>
          </div>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="create-form note-modal-form" onSubmit={handleSubmit}>
          <div className="note-modal-grid">
            <label>
              <span>Title</span>
              <input
                value={workspace.draft.title}
                onChange={(event) => workspace.setDraft({ ...workspace.draft, title: event.target.value })}
                placeholder="A new brief, insight, or decision"
                required
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={workspace.draft.category_key}
                onChange={(event) =>
                  workspace.setDraft({ ...workspace.draft, category_key: event.target.value })
                }
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="note-modal-editor">
            <span>Body</span>
            <ReactQuill
              theme="snow"
              value={workspace.draft.html_body}
              onChange={(value) =>
                workspace.setDraft({
                  ...workspace.draft,
                  html_body: value,
                  markdown_body: turndown.turndown(value || ""),
                })
              }
            />
          </label>

          <div className="modal-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit" disabled={workspace.saving}>
              {workspace.saving ? "Submitting..." : "Create note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
