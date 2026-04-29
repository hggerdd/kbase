import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import TurndownService from "turndown";
import { NOTE_CATEGORIES, NOTE_STATUSES } from "../../../features/notes/constants";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { HistoryIcon, PencilIcon, PlusIcon, TrashIcon, XIcon } from "../../../shared/ui/Icons";
import { OptionSelectModal } from "../../../shared/ui/OptionSelectModal";
import { Panel } from "../../../shared/ui/Panel";
import { formatDate } from "../../../shared/utils/format";
import { NoteLabelModal } from "./NoteLabelModal";
import { NoteMetaPanel } from "./NoteMetaPanel";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function NoteEditor({ onClose, onOpenCreate, workspace, workspaceSummary = null }) {
  const activeNote = workspace.selectedNote?.item;
  const currentStatus = workspace.editor.status || activeNote?.status || "draft";
  const currentCategory = workspace.editor.category_key || activeNote?.category_key || "research";
  const statusOptions = NOTE_STATUSES.includes(currentStatus) ? NOTE_STATUSES : [currentStatus, ...NOTE_STATUSES];
  const managedCategoryOptions = workspace.availableCategories.map((category) => ({
    value: category.key,
    label: category.label || formatLabel(category.key),
  }));
  const fallbackCategoryOptions = NOTE_CATEGORIES.map((category) => ({
    value: category,
    label: formatLabel(category),
  }));
  const categoryOptions = managedCategoryOptions.length > 0 ? managedCategoryOptions : fallbackCategoryOptions;
  const hasCurrentCategoryOption = categoryOptions.some((option) => option.value === currentCategory);
  const visibleCategoryOptions = hasCurrentCategoryOption
    ? categoryOptions
    : [{ value: currentCategory, label: formatLabel(currentCategory) }, ...categoryOptions];
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState("");
  const selectedLabelPaths = workspace.editor.selected_labels;
  const editorInstanceKey = workspace.selectedId ?? "no-note";
  const currentProject = workspace.selectedNote?.projects?.[0] ?? null;
  const projectOptions = [
    { value: "", label: "No project" },
    ...workspace.availableProjects.map((project) => ({
      value: project.id,
      label: project.title,
    })),
  ];
  const summaryBits = [
    workspaceSummary?.categoryLabel ?? formatLabel(currentCategory),
    workspaceSummary?.labelPath ?? null,
  ].filter(Boolean);

  useEffect(() => {
    setPendingTitle(workspace.editor.title ?? "");
  }, [workspace.editor.title, activeNote?.id]);

  async function handleClose() {
    await workspace.handleSaveSelected();
    workspace.closeSelectedNote();
    onClose?.();
  }

  async function handleDelete() {
    const success = await workspace.deleteSelectedNote();
    if (success) {
      onClose?.();
    }
  }

  async function handleTitleSubmit(event) {
    event.preventDefault();
    const nextTitle = pendingTitle.trim();
    if (!nextTitle) {
      return;
    }
    const success = await workspace.updateSelectedNoteFields({ title: nextTitle });
    if (success) {
      setIsTitleModalOpen(false);
    }
  }

  async function handleStatusSelect(status) {
    const success = await workspace.updateSelectedNoteFields({ status });
    if (success) {
      setIsStatusModalOpen(false);
    }
  }

  async function handleCategorySelect(categoryKey) {
    const success = await workspace.updateSelectedNoteFields({ category_key: categoryKey });
    if (success) {
      setIsCategoryModalOpen(false);
    }
  }

  async function handleProjectSelect(projectId) {
    const success = await workspace.updateSelectedNoteProjects(projectId ? [projectId] : []);
    if (success) {
      setIsProjectModalOpen(false);
    }
  }

  async function handleToggleLabel(labelPath) {
    const nextLabels = selectedLabelPaths.includes(labelPath)
      ? selectedLabelPaths.filter((entry) => entry !== labelPath)
      : [...selectedLabelPaths, labelPath];
    await workspace.updateSelectedNoteLabels(nextLabels);
  }

  return (
    <Panel className="panel-main note-editor-panel workspace-note-editor-panel">
      {workspace.selectedNote ? (
        <>
          {workspace.selectedNoteLoading ? (
            <div className="detail-loading-banner">
              <span className="detail-loading-dot" />
              <span>Loading current note...</span>
            </div>
          ) : null}

          <div className="workspace-detail-hero">
            <div className="workspace-detail-main">
              <span className="workspace-detail-kicker">Selected note</span>
              <div className="note-title-row">
                <h2>{workspace.editor.title || activeNote?.title || "Untitled note"}</h2>
                <button
                  className="plain-icon-button"
                  type="button"
                  aria-label="Edit note title"
                  title="Edit note title"
                  onClick={() => {
                    setPendingTitle(workspace.editor.title ?? "");
                    setIsTitleModalOpen(true);
                  }}
                >
                  <PencilIcon />
                </button>
              </div>

              {summaryBits.length > 0 ? (
                <p className="workspace-detail-summary">{summaryBits.join(" · ")}</p>
              ) : null}

              <div className="workspace-detail-stats">
                <button
                  className="status-badge status-badge-button note-status-pill"
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  {currentStatus}
                </button>
                {activeNote?.updated_at ? (
                  <span className="workspace-detail-stat">
                    Updated {formatDate(activeNote.updated_at, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                ) : null}
              </div>

              <div className="note-taxonomy-row">
                <div className="note-project-row">
                  <button
                    className={`note-project-pill ${currentProject ? "" : "empty"}`.trim()}
                    type="button"
                    onClick={() => setIsProjectModalOpen(true)}
                  >
                    {currentProject?.title ?? "No project selected"}
                  </button>
                  <button
                    className="plain-icon-button small"
                    type="button"
                    aria-label="Edit note project"
                    title="Edit note project"
                    onClick={() => setIsProjectModalOpen(true)}
                  >
                    <PencilIcon />
                  </button>
                </div>

                <div className="note-category-row">
                  <button
                    className="note-category-pill"
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                  >
                    {formatLabel(currentCategory)}
                  </button>
                  <button
                    className="plain-icon-button small"
                    type="button"
                    aria-label="Edit note category"
                    title="Edit note category"
                    onClick={() => setIsCategoryModalOpen(true)}
                  >
                    <PencilIcon />
                  </button>
                </div>

                <div className="note-label-pills">
                  {selectedLabelPaths.length > 0 ? (
                    selectedLabelPaths.map((labelPath) => (
                      <button
                        key={labelPath}
                        type="button"
                        className="note-label-pill"
                        onClick={() => setIsLabelModalOpen(true)}
                        title={labelPath}
                      >
                        {labelPath}
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      className="note-label-pill empty"
                      onClick={() => setIsLabelModalOpen(true)}
                    >
                      No labels selected
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="workspace-detail-actions">
              <button
                className="header-link header-icon-button"
                type="button"
                aria-label="Show note history"
                title="Show note history"
                onClick={() => setIsHistoryModalOpen(true)}
              >
                <span className="header-link-icon">
                  <HistoryIcon />
                </span>
              </button>
              <button
                className="header-link header-icon-button"
                type="button"
                aria-label="Create note"
                title="Create note"
                onClick={onOpenCreate}
              >
                <span className="header-link-icon">
                  <PlusIcon />
                </span>
              </button>
              <button
                className="header-link header-icon-button danger-icon-button"
                type="button"
                aria-label="Delete note"
                title="Delete note"
                onClick={handleDelete}
                disabled={workspace.saving}
              >
                <span className="header-link-icon">
                  <TrashIcon />
                </span>
              </button>
              <button
                className="header-link header-icon-button note-editor-close"
                type="button"
                aria-label="Close note"
                title="Close note"
                onClick={handleClose}
              >
                <span className="header-link-icon">
                  <XIcon />
                </span>
              </button>
            </div>
          </div>

          <div className="editor-body note-rich-editor">
            <ReactQuill
              key={editorInstanceKey}
              theme="snow"
              value={workspace.editor.html_body}
              onChange={(value) =>
                workspace.setEditor({
                  ...workspace.editor,
                  html_body: value,
                  markdown_body: turndown.turndown(value || ""),
                })
              }
            />
          </div>

          <NoteMetaPanel workspace={workspace} />

          {isTitleModalOpen ? (
            <div className="modal-backdrop" role="presentation" onClick={() => setIsTitleModalOpen(false)}>
              <section
                className="modal-sheet note-title-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="note-title-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 id="note-title-modal-title">Edit title</h2>
                </div>
                <form className="create-form" onSubmit={handleTitleSubmit}>
                  <label>
                    <span>Title</span>
                    <input
                      value={pendingTitle}
                      onChange={(event) => setPendingTitle(event.target.value)}
                      autoFocus
                    />
                  </label>
                  <div className="modal-actions">
                    <button className="secondary" type="button" onClick={() => setIsTitleModalOpen(false)}>
                      Cancel
                    </button>
                    <button className="primary" type="submit" disabled={!pendingTitle.trim()}>
                      OK
                    </button>
                  </div>
                </form>
              </section>
            </div>
          ) : null}

          {isStatusModalOpen ? (
            <OptionSelectModal
              title="Set status"
              options={statusOptions}
              selectedValue={currentStatus}
              onSelect={handleStatusSelect}
              onClose={() => setIsStatusModalOpen(false)}
            />
          ) : null}

          {isCategoryModalOpen ? (
            <OptionSelectModal
              title="Set category"
              options={visibleCategoryOptions}
              selectedValue={currentCategory}
              onSelect={handleCategorySelect}
              onClose={() => setIsCategoryModalOpen(false)}
            />
          ) : null}

          {isProjectModalOpen ? (
            <OptionSelectModal
              title="Set project"
              options={projectOptions}
              selectedValue={currentProject?.id ?? ""}
              onSelect={handleProjectSelect}
              onClose={() => setIsProjectModalOpen(false)}
            />
          ) : null}

          {isLabelModalOpen ? (
            <NoteLabelModal
              labels={workspace.availableLabels}
              selectedPaths={selectedLabelPaths}
              onToggleLabel={handleToggleLabel}
              onClose={() => setIsLabelModalOpen(false)}
            />
          ) : null}

          {isHistoryModalOpen ? (
            <div className="modal-backdrop" role="presentation" onClick={() => setIsHistoryModalOpen(false)}>
              <section
                className="modal-sheet note-history-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="note-history-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 id="note-history-title">History</h2>
                </div>
                <ul className="timeline note-history-list">
                  {workspace.history.length > 0 ? (
                    workspace.history.map((event) => (
                      <li key={event.id}>
                        <strong>{event.operation_key}</strong>
                        <span>{formatDate(event.occurred_at, { dateStyle: "medium", timeStyle: "short" })}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>No history available yet</span>
                    </li>
                  )}
                </ul>
                <div className="modal-actions">
                  <button className="secondary" type="button" onClick={() => setIsHistoryModalOpen(false)}>
                    Close
                  </button>
                </div>
              </section>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No note selected"
          description="Pick a note from the list or create a new one to start documenting structured knowledge."
        />
      )}
    </Panel>
  );
}
