import React, { useEffect, useMemo, useState } from "react";
import { fetchProjectItemDetail } from "../../features/projects/api";
import { useProjectsWorkspace } from "../../features/projects/hooks";
import { PROJECT_SECTIONS } from "../../features/projects/state";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ClockIcon, TagIcon, SearchIcon } from "../../shared/ui/Icons";
import { Panel } from "../../shared/ui/Panel";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatDate, formatDuration, formatFileSize } from "../../shared/utils/format";
import { CreateProjectModal } from "./components/CreateProjectModal";

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function itemMatchesQuery(item, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    item.title,
    item.category_key,
    item.status,
    item.item_kind,
    item.match_reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function formatCategoryLabel(categoryKey) {
  return String(categoryKey ?? "project_general")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatusLabel(status) {
  if (!status) {
    return "Active";
  }
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "done":
      return "status-badge is-done";
    case "on_hold":
      return "status-badge is-on-hold";
    case "archived":
      return "status-badge is-archived";
    case "active":
    default:
      return "status-badge is-active";
  }
}

function getTabCount(sectionId, workspace) {
  if (sectionId === "items") {
    return workspace.projectMetrics.totalItems;
  }
  if (sectionId === "notes") {
    return workspace.projectMetrics.noteCount;
  }
  if (sectionId === "files") {
    return workspace.projectMetrics.fileCount;
  }
  return 0;
}

export function ProjectsPage() {
  const workspace = useProjectsWorkspace();
  const [activeSection, setActiveSection] = useState("items");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("active");
  const [projectQuery, setProjectQuery] = useState("");
  const [hasSubmittedProjectSearch, setHasSubmittedProjectSearch] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [noteDetailsById, setNoteDetailsById] = useState({});
  const [noteDetailErrorById, setNoteDetailErrorById] = useState({});
  const [noteLoadingId, setNoteLoadingId] = useState(null);
  const activeProject = workspace.projectDetail?.item ?? null;
  const projectDescription = workspace.projectMetrics.description;
  const showProjectResults = hasSubmittedProjectSearch || workspace.statusFilter !== "all";

  const itemQuery = normalizeText(workspace.itemSearch);
  const filteredProjectItems = useMemo(() => {
    return workspace.projectItems.filter((item) => {
      if (workspace.kindFilter !== "all" && item.item_kind !== workspace.kindFilter) {
        return false;
      }
      return itemMatchesQuery(item, itemQuery);
    });
  }, [itemQuery, workspace.kindFilter, workspace.projectItems]);

  const filteredFileItems = useMemo(() => {
    return workspace.files.filter((item) => itemMatchesQuery(item, itemQuery));
  }, [itemQuery, workspace.files]);

  const visibleItems = useMemo(() => {
    if (activeSection === "notes") {
      return workspace.notes;
    }
    if (activeSection === "files") {
      return filteredFileItems;
    }
    return filteredProjectItems;
  }, [activeSection, filteredFileItems, filteredProjectItems, workspace.notes]);

  const handleProjectSearch = (event) => {
    event.preventDefault();
    workspace.setSearch(projectQuery);
    setHasSubmittedProjectSearch(Boolean(projectQuery.trim()) || workspace.statusFilter !== "all");
  };

  const handleStatusFilterChange = (event) => {
    const nextStatus = event.target.value;
    workspace.setStatusFilter(nextStatus);
    setHasSubmittedProjectSearch(Boolean(projectQuery.trim()) || nextStatus !== "all");
  };

  async function handleToggleNote(noteId) {
    if (expandedNoteId === noteId) {
      setExpandedNoteId(null);
      return;
    }

    setExpandedNoteId(noteId);
    if (noteDetailsById[noteId]) {
      return;
    }

    setNoteLoadingId(noteId);
    setNoteDetailErrorById((current) => ({ ...current, [noteId]: "" }));
    try {
      const detail = await fetchProjectItemDetail(noteId);
      setNoteDetailsById((current) => ({ ...current, [noteId]: detail }));
    } catch (error) {
      setNoteDetailErrorById((current) => ({ ...current, [noteId]: error.message }));
    } finally {
      setNoteLoadingId((current) => (current === noteId ? null : current));
    }
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("kbase:page-header-meta", {
        detail: { route: "projects", count: workspace.projects.length },
      }),
    );
  }, [workspace.projects.length]);

  useEffect(() => {
    const handleOpenCreate = () => setIsCreateOpen(true);
    window.addEventListener("kbase:projects-create", handleOpenCreate);
    return () => window.removeEventListener("kbase:projects-create", handleOpenCreate);
  }, []);

  useEffect(() => {
    setExpandedNoteId(null);
  }, [workspace.selectedId]);

  useEffect(() => {
    setPendingStatus(activeProject?.status ?? "active");
  }, [activeProject?.id, activeProject?.status]);

  async function handleStatusSubmit(event) {
    event.preventDefault();
    const success = await workspace.handleUpdateProjectStatus(pendingStatus);
    if (success) {
      setIsStatusModalOpen(false);
    }
  }

  return (
    <ResponsiveContainer>
      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="projects-workspace">
        <Panel className="projects-sidebar-panel">
          <form className="projects-search-form" onSubmit={handleProjectSearch}>
            <div className="projects-search-row">
              <label className="search-field search-field-wide">
                <input
                  aria-label="Search projects"
                  value={projectQuery}
                  onChange={(event) => setProjectQuery(event.target.value)}
                  placeholder="Search projects"
                />
              </label>
              <button className="secondary icon-button" type="submit" aria-label="Search projects">
                <SearchIcon />
              </button>
            </div>
            <label className="search-field">
              <select
                aria-label="Filter project status"
                value={workspace.statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </form>

          {workspace.loading ? <p className="muted">Loading projects...</p> : null}
          {!workspace.loading && showProjectResults && workspace.filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="Adjust the search or widen the filters to bring matching projects into view."
            />
          ) : null}

          {!workspace.loading && !showProjectResults ? (
            <p className="muted projects-search-hint">Search for a project to open it here.</p>
          ) : null}

          {showProjectResults ? (
            <div className="stack-list project-results-list">
              {workspace.filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`stack-card project-card ${project.id === workspace.selectedId ? "active" : ""}`.trim()}
                  onClick={() => workspace.setSelectedId(project.id)}
                >
                  <div className="project-result-main">
                    <strong>{project.title}</strong>
                    <span className={getStatusBadgeClass(project.status)}>{formatStatusLabel(project.status)}</span>
                  </div>
                  <small>Created {formatDate(project.created_at, { dateStyle: "medium" })}</small>
                </button>
              ))}
            </div>
          ) : null}
        </Panel>

        <div className={`projects-main-column ${activeProject ? "has-project" : ""}`.trim()}>
          {workspace.projectLoading ? (
            <Panel className="projects-detail-panel" title={null}>
              <p className="muted">Loading project detail...</p>
            </Panel>
          ) : null}

          {!workspace.projectLoading && !activeProject ? (
            <Panel className="projects-detail-panel projects-detail-placeholder" title={null}>
              <EmptyState
                title="No project selected"
                description="Choose a project from the left column to inspect linked items and metadata."
              />
            </Panel>
          ) : null}

          {activeProject ? (
            <Panel className="projects-detail-panel" title={null}>
              <div className="projects-detail-close-row">
                <button className="secondary compact-button" type="button" onClick={() => workspace.setSelectedId(null)}>
                  Close
                </button>
              </div>

              <div className="project-detail-stack">
                <div className="project-summary-head">
                  <div className="project-summary-title-row">
                    <h3>{activeProject.title}</h3>
                    <span className="project-inline-category">{formatCategoryLabel(activeProject.category_key)}</span>
                  </div>
                  <div className="project-summary-meta-row">
                    <button
                      type="button"
                      className={`status-badge status-badge-button ${getStatusBadgeClass(activeProject.status)}`.trim()}
                      onClick={() => setIsStatusModalOpen(true)}
                    >
                      {formatStatusLabel(activeProject.status)}
                    </button>
                    <span className="project-created-pill"><ClockIcon />{formatDate(activeProject.created_at, { dateStyle: "medium" })}</span>
                    <span>{workspace.projectMetrics.totalItems} items</span>
                    <span>{workspace.projectMetrics.noteCount} notes</span>
                    <span>{workspace.projectMetrics.fileCount} files</span>
                  </div>
                  {projectDescription ? <p className="project-summary-description">{projectDescription}</p> : null}
                </div>

                <div className="section-tabs">
                  {PROJECT_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`section-tab ${activeSection === section.id ? "active" : ""}`.trim()}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.label} <span className="section-tab-count">{getTabCount(section.id, workspace)}</span>
                    </button>
                  ))}
                </div>

                {activeSection !== "notes" ? (
                  <div className="projects-toolbar projects-toolbar-inline">
                    <label className="search-field">
                      <span>Filter items</span>
                      <input
                        value={workspace.itemSearch}
                        onChange={(event) => workspace.setItemSearch(event.target.value)}
                        placeholder={activeSection === "files" ? "Search files" : "Search linked items"}
                      />
                    </label>
                    <label className="search-field">
                      <span>{activeSection === "files" ? "Type" : "Kind"}</span>
                      <select
                        value={workspace.kindFilter}
                        onChange={(event) => workspace.setKindFilter(event.target.value)}
                      >
                        <option value="all">All item kinds</option>
                        {workspace.availableKinds.map((itemKind) => (
                          <option key={itemKind} value={itemKind}>
                            {itemKind}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}

                {activeSection === "items" ? (
                  <>
                    {visibleItems.length === 0 ? (
                      <EmptyState
                        title="No linked items match"
                        description="This project has no linked items for the current filters."
                      />
                    ) : (
                      <div className="stack-list">
                        {visibleItems.map((item) => (
                          <article key={item.id} className="stack-card static project-item-row">
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.category_key ?? item.item_kind}</p>
                            </div>
                            <div className="project-card-meta">
                              <span className="token project-kind-token"><TagIcon />{item.item_kind}</span>
                              <small>{formatDate(item.updated_at, { dateStyle: "medium", timeStyle: "short" })}</small>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}

                {activeSection === "notes" ? (
                  <div className="project-notes-accordion">
                    {!workspace.notes.length ? (
                      <EmptyState
                        title="No notes in this project"
                        description="Create the first note or link an existing note into this project."
                      />
                    ) : (
                      <div className="project-note-table">
                        <div className="project-note-table-head">
                          <span>Note</span>
                          <span>Status</span>
                          <span>Updated</span>
                        </div>
                        {workspace.notes.map((note) => {
                          const isExpanded = expandedNoteId === note.id;
                          const detail = noteDetailsById[note.id];
                          const noteError = noteDetailErrorById[note.id];
                          const noteBody = detail?.primary_content_part?.content_text ?? "";

                          return (
                            <div key={note.id} className={`project-note-row ${isExpanded ? "expanded" : ""}`.trim()}>
                              <button
                                type="button"
                                className="project-note-summary"
                                onClick={() => void handleToggleNote(note.id)}
                              >
                                <strong>{note.title}</strong>
                                <span className={getStatusBadgeClass(note.status)}>{formatStatusLabel(note.status)}</span>
                                <span>{formatDate(note.updated_at, { dateStyle: "medium" })}</span>
                              </button>
                              {isExpanded ? (
                                <div className="project-note-body">
                                  {noteLoadingId === note.id ? <p className="muted">Loading note...</p> : null}
                                  {noteError ? <p className="error">{noteError}</p> : null}
                                  {!noteLoadingId && !noteError ? (
                                    <>
                                      <div className="project-note-body-meta">
                                        <span>{formatCategoryLabel(note.category_key)}</span>
                                        <span>ID {note.id}</span>
                                      </div>
                                      <pre>{noteBody || "No note body stored yet."}</pre>
                                    </>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {activeSection === "files" ? (
                  <div className="projects-actions-grid">
                    <Panel eyebrow="Upload" title="Add file to project">
                      <form className="create-form" onSubmit={workspace.handleProjectUpload}>
                        <label>
                          <span>File</span>
                          <input type="file" onChange={(event) => workspace.setUploadFile(event.target.files?.[0] ?? null)} required />
                        </label>
                        <label>
                          <span>Title</span>
                          <input
                            value={workspace.uploadDraft.title}
                            onChange={(event) => workspace.setUploadDraft({ ...workspace.uploadDraft, title: event.target.value })}
                            placeholder="Optional display title"
                          />
                        </label>
                        <label>
                          <span>Item kind</span>
                          <select
                            value={workspace.uploadDraft.item_kind}
                            onChange={(event) => workspace.setUploadDraft({ ...workspace.uploadDraft, item_kind: event.target.value })}
                          >
                            <option value="document">document</option>
                            <option value="image">image</option>
                            <option value="spreadsheet">spreadsheet</option>
                          </select>
                        </label>
                        <label>
                          <span>Category</span>
                          <input
                            value={workspace.uploadDraft.category_key}
                            onChange={(event) => workspace.setUploadDraft({ ...workspace.uploadDraft, category_key: event.target.value })}
                            placeholder="Optional category key"
                          />
                        </label>
                        {workspace.uploading ? (
                          <div className="upload-progress" aria-live="polite">
                            <div className="upload-progress-track">
                              <div className="upload-progress-bar" style={{ width: `${workspace.uploadProgress?.percent ?? 0}%` }} />
                            </div>
                            <span>{workspace.uploadProgress?.percent ?? 0}%</span>
                            <span className="muted">
                              {workspace.uploadProgress?.bytesPerSecond
                                ? `${formatFileSize(workspace.uploadProgress.bytesPerSecond)}/s`
                                : "starting"}
                            </span>
                            <span className="muted">{formatDuration(workspace.uploadProgress?.etaSeconds)}</span>
                          </div>
                        ) : null}
                        <button className="primary" type="submit" disabled={workspace.uploading}>
                          {workspace.uploading ? "Uploading..." : "Upload into project"}
                        </button>
                      </form>
                    </Panel>

                    {visibleItems.length === 0 ? (
                      <EmptyState
                        title="No files in this project"
                        description="Upload or link files to populate this section."
                      />
                    ) : (
                      <div className="stack-list">
                        {visibleItems.map((item) => (
                          <article key={item.id} className="stack-card static project-item-row">
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.category_key ?? item.item_kind}</p>
                            </div>
                            <div className="project-card-meta">
                              <span className="token project-kind-token"><TagIcon />{item.item_kind}</span>
                              <small>{formatDate(item.updated_at, { dateStyle: "medium", timeStyle: "short" })}</small>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} workspace={workspace} />
      {activeProject && isStatusModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsStatusModalOpen(false)}>
          <section
            className="modal-sheet project-status-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-status-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Project</p>
                <h2 id="project-status-title">Set status</h2>
              </div>
              <button className="secondary" type="button" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </button>
            </div>

            <form className="create-form" onSubmit={handleStatusSubmit}>
              <label>
                <span>Status</span>
                <select value={pendingStatus} onChange={(event) => setPendingStatus(event.target.value)}>
                  <option value="active">active</option>
                  <option value="on_hold">on_hold</option>
                  <option value="done">done</option>
                  <option value="archived">archived</option>
                </select>
              </label>

              <div className="modal-actions">
                <button className="secondary" type="button" onClick={() => setIsStatusModalOpen(false)}>
                  Cancel
                </button>
                <button className="primary" type="submit" disabled={workspace.actionLoading}>
                  {workspace.actionLoading ? "Saving..." : "Save status"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </ResponsiveContainer>
  );
}
