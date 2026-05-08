import React, { useState } from "react";
import { useProjectsWorkspace } from "../../features/projects/hooks.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FolderIcon, PlusIcon, TrashIcon } from "../../shared/ui/Icons.jsx";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { RoundIconButton } from "../../shared/ui/RoundIconButton.jsx";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatDate } from "../../shared/utils/format";
import { CreateProjectModal } from "../projects/components/CreateProjectModal.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ProjectsSettingsPage() {
  const workspace = useProjectsWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const selectedProject = workspace.projects.find((project) => project.id === workspace.selectedId) ?? null;

  async function deleteSelectedProject(project) {
    const confirmed = window.confirm(`Delete project "${project.title}"? Existing linked notes and files will remain.`);
    if (!confirmed) {
      return;
    }
    await workspace.handleDeleteProject(project.id);
  }

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Settings"
        title="Projects"
        description="Manage the project containers used to group notes, files, and related work."
        actions={
          <>
            <label className="settings-search-field settings-header-search">
              <span>Search</span>
              <input
                value={workspace.search}
                onChange={(event) => workspace.setSearch(event.target.value)}
                placeholder="Search title, category or status"
              />
            </label>
            <RoundIconButton
              type="button"
              aria-label="Add project"
              title="Add project"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon />
            </RoundIconButton>
          </>
        }
        aside={<span className="settings-count-pill">{workspace.projects.length} active</span>}
      />

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="settings-workspace-layout">
        <Panel className="settings-workspace-panel settings-workspace-list-panel" eyebrow="Projects" title={`Known projects (${workspace.filteredProjects.length})`}>
          {workspace.loading ? <p className="muted">Loading projects...</p> : null}
          {!workspace.loading && workspace.filteredProjects.length === 0 ? (
            <EmptyState title="No projects found" description="Create a project or change the search." />
          ) : (
            <div className="settings-tree-scroll settings-project-list">
              {workspace.filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`settings-project-row ${workspace.selectedId === project.id ? "active" : ""}`.trim()}
                  onClick={() => workspace.setSelectedId(project.id)}
                >
                  <span className="settings-project-row-icon"><FolderIcon /></span>
                  <span className="settings-project-row-copy">
                    <strong>{project.title}</strong>
                    <span>{formatLabel(project.category_key ?? "project_general")} · {formatLabel(project.status ?? "active")}</span>
                  </span>
                  <span className="settings-project-row-date">{formatDate(project.updated_at, { dateStyle: "medium" })}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          className="settings-workspace-panel settings-workspace-detail-panel"
          eyebrow="Project"
          title={selectedProject ? selectedProject.title : "No project selected"}
        >
          {workspace.projectLoading ? <p className="muted">Loading project detail...</p> : null}
          {!workspace.projectLoading && !selectedProject ? (
            <EmptyState title="No project selected" description="Pick a project from the list to inspect or delete it." />
          ) : null}
          {selectedProject && !workspace.projectLoading ? (
            <div className="settings-detail-stack settings-project-detail">
              <div className="settings-project-detail-meta">
                <span className="category-kind-pill">{formatLabel(selectedProject.category_key ?? "project_general")}</span>
                <span className="category-state-pill active">{formatLabel(selectedProject.status ?? "active")}</span>
              </div>
              <div className="label-description-box">
                <span>Description</span>
                <p>{workspace.projectMetrics.description || "No description"}</p>
              </div>
              <div className="settings-project-metrics">
                <span>{workspace.projectMetrics.totalItems} linked items</span>
                <span>{workspace.projectMetrics.noteCount} notes</span>
                <span>{workspace.projectMetrics.fileCount} files</span>
              </div>
              <div className="label-detail-actions">
                <button
                  className="danger icon-text-button"
                  type="button"
                  disabled={workspace.actionLoading}
                  onClick={() => void deleteSelectedProject(selectedProject)}
                >
                  <span className="button-icon"><TrashIcon /></span>
                  Delete project
                </button>
              </div>
            </div>
          ) : null}
        </Panel>
      </div>

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} workspace={workspace} />
    </ResponsiveContainer>
  );
}
