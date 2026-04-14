import React, { useMemo, useState } from "react";
import { useProjectsWorkspace } from "../../features/projects/hooks";
import { PROJECT_SECTIONS } from "../../features/projects/state";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ClockIcon, FileStackIcon, FolderIcon, NoteIcon, SparkIcon, TagIcon } from "../../shared/ui/Icons";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatCard } from "../../shared/ui/StatCard";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatDate, formatDuration, formatFileSize } from "../../shared/utils/format";

const PROJECT_CATEGORY_OPTIONS = [
  { value: "project_general", label: "Project" },
  { value: "case_context", label: "Case Context" },
  { value: "topic_space", label: "Topic Space" },
  { value: "life_area", label: "Life Area" },
];

export function ProjectsPage() {
  const workspace = useProjectsWorkspace();
  const [activeSection, setActiveSection] = useState("overview");
  const activeProject = workspace.projectDetail?.item ?? null;
  const projectDescription = workspace.projectMetrics.description;
  const visibleItems = useMemo(() => {
    if (activeSection === "notes") {
      return workspace.notes;
    }
    if (activeSection === "files") {
      return workspace.files;
    }
    return workspace.filteredItems;
  }, [activeSection, workspace.files, workspace.filteredItems, workspace.notes]);

  return (
    <ResponsiveContainer>
      <PageHeader
        className="projects-page-header"
        eyebrow="Projects"
        title="Projekt"
        description={null}
        aside={
          <div className="projects-header-meta">
            <span className="pill projects-header-pill">
              <FolderIcon />
              {workspace.projects.length} {workspace.projects.length === 1 ? "Projekt" : "Projekte"}
            </span>
            <span className="pill projects-header-pill projects-header-pill-status">
              <span className="pulse-dot" />
              Bereit
            </span>
          </div>
        }
      />

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="projects-workspace">
        <Panel className="projects-sidebar-panel" eyebrow="Browse" title="Project index">
          <div className="projects-toolbar">
            <label className="search-field">
              <span>Search</span>
              <input
                value={workspace.search}
                onChange={(event) => workspace.setSearch(event.target.value)}
                placeholder="Search title, category, status"
              />
            </label>
            <label className="search-field">
              <span>Status</span>
              <select
                value={workspace.statusFilter}
                onChange={(event) => workspace.setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="done">Done</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          {workspace.loading ? <p className="muted">Loading projects...</p> : null}
          {!workspace.loading && workspace.filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="Create the first project or widen the filters to bring existing contexts back into view."
            />
          ) : null}

          <div className="stack-list">
            {workspace.filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`stack-card project-card ${project.id === workspace.selectedId ? "active" : ""}`.trim()}
                onClick={() => workspace.setSelectedId(project.id)}
              >
                <div>
                  <strong>{project.title}</strong>
                  <p>{project.category_key ?? "project_general"}</p>
                </div>
                <div className="project-card-meta">
                  <span className="token">{project.status ?? "active"}</span>
                  <small>{formatDate(project.updated_at, { dateStyle: "medium" })}</small>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <div className="projects-main-column">
          <Panel
            eyebrow="Project"
            title={activeProject?.title ?? "Select a project"}
            action={activeProject ? <span className="pill"><ClockIcon />{formatDate(activeProject.updated_at, { dateStyle: "medium" })}</span> : null}
          >
            {workspace.projectLoading ? <p className="muted">Loading project detail...</p> : null}
            {!workspace.projectLoading && !activeProject ? (
              <EmptyState
                title="No project selected"
                description="Choose a project from the left column to inspect linked items and metadata."
              />
            ) : null}

            {activeProject ? (
              <div className="project-detail-stack">
                <div className="project-hero">
                  <div>
                    <p className="eyebrow">Context</p>
                    <h3>{activeProject.title}</h3>
                    <p>{projectDescription || "No description stored yet. The project exists, but its narrative context is still empty."}</p>
                  </div>
                  <div className="project-detail-meta">
                    <div className="detail-card">
                      <span>Status</span>
                      <strong>{activeProject.status ?? "active"}</strong>
                    </div>
                    <div className="detail-card">
                      <span>Category</span>
                      <strong>{activeProject.category_key ?? "project_general"}</strong>
                    </div>
                    <div className="detail-card">
                      <span>Created</span>
                      <strong>{formatDate(activeProject.created_at, { dateStyle: "medium" })}</strong>
                    </div>
                  </div>
                </div>

                <div className="stats-grid projects-stats-grid">
                  <StatCard label="Linked items" value={workspace.projectMetrics.totalItems} tone="cyan" icon={FolderIcon} />
                  <StatCard label="Notes" value={workspace.projectMetrics.noteCount} tone="gold" icon={NoteIcon} />
                  <StatCard label="Files" value={workspace.projectMetrics.fileCount} tone="coral" icon={FileStackIcon} />
                </div>

                <div className="section-tabs">
                  {PROJECT_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`section-tab ${activeSection === section.id ? "active" : ""}`.trim()}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>

                <div className="projects-toolbar projects-toolbar-inline">
                  <label className="search-field">
                    <span>Filter items</span>
                    <input
                      value={workspace.itemSearch}
                      onChange={(event) => workspace.setItemSearch(event.target.value)}
                      placeholder="Search linked notes, files, status"
                    />
                  </label>
                  <label className="search-field">
                    <span>Kind</span>
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

                {activeSection === "overview" ? (
                  <div className="projects-actions-grid">
                    <Panel eyebrow="Link" title="Add existing item">
                      <form className="create-form" onSubmit={workspace.handleCandidateSearch}>
                        <label>
                          <span>Search existing notes and files</span>
                          <input
                            value={workspace.candidateQuery}
                            onChange={(event) => workspace.setCandidateQuery(event.target.value)}
                            placeholder="Search across the knowledge base"
                          />
                        </label>
                        <button className="secondary" type="submit" disabled={workspace.actionLoading}>
                          {workspace.actionLoading ? "Searching..." : "Search items"}
                        </button>
                      </form>

                      <div className="stack-list">
                        {workspace.candidateResults.map((item) => (
                          <div key={item.id} className="stack-card static project-action-card">
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.category_key ?? item.item_kind}</p>
                            </div>
                            <button className="secondary compact-button" type="button" onClick={() => workspace.handleAddItemToProject(item.id)}>
                              Add
                            </button>
                          </div>
                        ))}
                        {!workspace.candidateResults.length ? (
                          <p className="muted">Search for an existing note or file to link it into this project.</p>
                        ) : null}
                      </div>
                    </Panel>
                  </div>
                ) : null}

                {activeSection === "notes" ? (
                  <div className="projects-actions-grid">
                    <Panel eyebrow="New note" title="Create note in project">
                      <form className="create-form" onSubmit={workspace.handleCreateProjectNote}>
                        <label>
                          <span>Title</span>
                          <input
                            value={workspace.noteDraft.title}
                            onChange={(event) => workspace.setNoteDraft({ ...workspace.noteDraft, title: event.target.value })}
                            placeholder="Decision log, meeting notes, research angle"
                            required
                          />
                        </label>
                        <label>
                          <span>Category</span>
                          <input
                            value={workspace.noteDraft.category_key}
                            onChange={(event) => workspace.setNoteDraft({ ...workspace.noteDraft, category_key: event.target.value })}
                          />
                        </label>
                        <label>
                          <span>Body</span>
                          <textarea
                            rows="6"
                            value={workspace.noteDraft.markdown_body}
                            onChange={(event) => workspace.setNoteDraft({ ...workspace.noteDraft, markdown_body: event.target.value })}
                            placeholder="Write the first project note directly here."
                          />
                        </label>
                        <button className="primary" type="submit" disabled={workspace.actionLoading}>
                          {workspace.actionLoading ? "Creating..." : "Create note"}
                        </button>
                      </form>
                    </Panel>
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
                  </div>
                ) : null}

                {visibleItems.length === 0 ? (
                  <EmptyState
                    title="No linked items match"
                    description="This project has no items for the current section and filters yet."
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
          </Panel>
        </div>

        <Panel className="projects-create-panel" eyebrow="Create" title="Open a new project">
          <form className="create-form" onSubmit={workspace.handleCreateProject}>
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
            <button className="primary" type="submit" disabled={workspace.saving}>
              {workspace.saving ? "Creating..." : "Create project"}
            </button>
          </form>

          <div className="roadmap projects-create-hints">
            <div>
              <strong>Create project shell</strong>
              <p>The project is stored as a first-class item with project metadata.</p>
            </div>
            <div>
              <strong>Use linked items now</strong>
              <p>Existing notes and imported files can already point at project IDs through current backend flows.</p>
            </div>
            <div>
              <strong>Next UI step</strong>
              <p>Direct linking, upload into project, and section-specific tabs can build on this workspace without a reset.</p>
            </div>
          </div>
        </Panel>

      </div>
    </ResponsiveContainer>
  );
}
