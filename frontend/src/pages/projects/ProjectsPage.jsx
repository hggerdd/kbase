import React, { useState } from "react";
import { request } from "../../shared/api/client";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ClockIcon, FolderIcon, SparkIcon } from "../../shared/ui/Icons";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatCard } from "../../shared/ui/StatCard";
import { StatusBanner } from "../../shared/ui/StatusBanner";

async function createProject(input) {
  return request("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function ProjectsPage() {
  const [draft, setDraft] = useState({
    title: "",
    category_key: "project_general",
    description: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [createdProject, setCreatedProject] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const project = await createProject(draft);
      setCreatedProject(project);
      setNotice("Project shell created");
      setDraft({
        title: "",
        category_key: "project_general",
        description: "",
        status: "active",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Projects"
        title="Project space is prepared for the next capability wave"
        description="This page already supports project creation, but a proper list and detail read model still needs dedicated backend capabilities. The UI is shaped so those reads can slot in without another redesign."
        aside={
          <div className="stats-grid">
            <StatCard label="Create flow" value="Live" tone="coral" icon={SparkIcon} />
            <StatCard label="Project list" value="Pending" tone="gold" detail="Needs list_projects" icon={FolderIcon} />
            <StatCard label="Project detail" value="Pending" tone="cyan" detail="Needs get_project" icon={ClockIcon} />
          </div>
        }
      />

      <StatusBanner error={error} notice={notice} />

      <div className="dashboard-grid projects-grid">
        <Panel eyebrow="Create" title="Open a new project shell">
          <form className="create-form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Kitchen renovation 2026"
                required
              />
            </label>
            <label>
              <span>Category</span>
              <input
                value={draft.category_key}
                onChange={(event) => setDraft({ ...draft, category_key: event.target.value })}
              />
            </label>
            <label>
              <span>Status</span>
              <input
                value={draft.status}
                onChange={(event) => setDraft({ ...draft, status: event.target.value })}
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                rows="5"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="What belongs in this project and how should it structure notes, documents, and imports?"
              />
            </label>
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create project"}
            </button>
          </form>
        </Panel>

        <Panel eyebrow="Current state" title="Why the page looks like this">
          <div className="roadmap">
            <div>
              <strong>What already works</strong>
              <p>Projects can be created and items can be attached through the backend.</p>
            </div>
            <div>
              <strong>What is missing</strong>
              <p>There is no `GET /api/projects` or `GET /api/projects/{id}` yet, so a truthful project browser is not possible.</p>
            </div>
            <div>
              <strong>Why this is still useful</strong>
              <p>The shell, visual language, and form structure are now ready for those endpoints without another layout rewrite.</p>
            </div>
          </div>
        </Panel>

        <Panel eyebrow="Preview" title="Future project overview card">
          {createdProject ? (
            <div className="stack-card static">
              <div>
                <strong>{createdProject.title}</strong>
                <p>{createdProject.category_key ?? "project"}</p>
              </div>
              <span>{createdProject.status ?? "active"}</span>
            </div>
          ) : (
            <EmptyState
              title="No project preview yet"
              description="Create a project above and this panel will show the first shell while we wait for full read capabilities."
            />
          )}
        </Panel>
      </div>
    </ResponsiveContainer>
  );
}
