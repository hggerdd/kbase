import React from "react";

const PROJECT_CATEGORY_OPTIONS = [
  { value: "project_general", label: "Project" },
  { value: "case_context", label: "Case Context" },
  { value: "topic_space", label: "Topic Space" },
  { value: "life_area", label: "Life Area" },
];

export function CreateProjectModal({ isOpen, onClose, workspace }) {
  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    const created = await workspace.handleCreateProject(event);
    if (created) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet project-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Project</p>
            <h2 id="create-project-title">Add new project</h2>
          </div>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <label>
            <span>Title</span>
            <input
              value={workspace.draft.title}
              onChange={(event) => workspace.setDraft({ ...workspace.draft, title: event.target.value })}
              placeholder="Kitchen renovation 2026"
              required
            />
          </label>
          <label>
            <span>Category</span>
            <select
              value={workspace.draft.category_key}
              onChange={(event) => workspace.setDraft({ ...workspace.draft, category_key: event.target.value })}
            >
              {PROJECT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select
              value={workspace.draft.status}
              onChange={(event) => workspace.setDraft({ ...workspace.draft, status: event.target.value })}
            >
              <option value="active">active</option>
              <option value="on_hold">on_hold</option>
              <option value="done">done</option>
            </select>
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows="5"
              value={workspace.draft.description}
              onChange={(event) => workspace.setDraft({ ...workspace.draft, description: event.target.value })}
              placeholder="What belongs in this project and how should it structure notes, documents, and imports?"
            />
          </label>

          <div className="modal-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit" disabled={workspace.saving}>
              {workspace.saving ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
