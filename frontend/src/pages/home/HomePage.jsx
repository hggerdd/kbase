import React from "react";
import { useImportsWorkspace } from "../../features/imports/hooks";
import { useHomeSnapshot } from "../../features/notes/hooks";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { formatDate } from "../../shared/utils/format";
import { EmptyState } from "../../shared/ui/EmptyState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatCard } from "../../shared/ui/StatCard";
import { StatusBanner } from "../../shared/ui/StatusBanner";

export function HomePage({ onNavigate, onSeedSearch }) {
  const { error, labels, loading, notes } = useHomeSnapshot();
  const imports = useImportsWorkspace();
  const decisionCount = notes.filter((note) => note.category_key === "decision").length;

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Home"
        title="A calm launch surface for your knowledge work"
        description="Jump back into recent notes, watch the inbox, and use the app as a real workspace instead of a single editor page."
        actions={
          <>
            <button className="secondary" type="button" onClick={() => onNavigate("notes")}>
              Open notes workspace
            </button>
            <button className="secondary" type="button" onClick={() => onNavigate("imports")}>
              Review imports
            </button>
          </>
        }
        aside={
          <div className="stats-grid">
            <StatCard label="Recent notes" value={notes.length} tone="cyan" detail="Latest workspace slice" />
            <StatCard label="Decision notes" value={decisionCount} tone="gold" detail="Fast route to outcomes" />
            <StatCard
              label="Inbox files"
              value={imports.files.length}
              tone="coral"
              detail="Ready to be turned into items"
            />
          </div>
        }
      />

      <StatusBanner error={error || imports.error} notice={imports.notice} />

      <div className="dashboard-grid">
        <Panel eyebrow="Recent items" title="Continue where you left off">
          {loading ? <p className="muted">Loading recent notes...</p> : null}
          {!loading && notes.length === 0 ? (
            <EmptyState
              title="No notes yet"
              description="Create your first note in the Notes area to start building a reusable knowledge base."
              action={
                <button className="secondary" type="button" onClick={() => onNavigate("notes")}>
                  Go to notes
                </button>
              }
            />
          ) : null}
          <div className="stack-list">
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                className="stack-card"
                onClick={() => {
                  onSeedSearch(note.title);
                  onNavigate("notes");
                }}
              >
                <div>
                  <strong>{note.title}</strong>
                  <p>{note.category_key ?? "uncategorized"}</p>
                </div>
                <span>{formatDate(note.updated_at, { dateStyle: "medium" })}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Taxonomy" title="Labels in circulation">
          {labels.length === 0 ? <p className="muted">No labels discovered yet.</p> : null}
          <div className="token-list">
            {labels.slice(0, 16).map((label) => (
              <span key={label.id}>{label.full_path}</span>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Imports" title="Inbox pulse" action={<span className="pill">{imports.files.length} queued</span>}>
          {imports.loading ? <p className="muted">Scanning inbox...</p> : null}
          {!imports.loading && imports.files.length === 0 ? (
            <p className="muted">Inbox is clear. Drop files into the raw inbox to process them here.</p>
          ) : null}
          <ul className="timeline">
            {imports.files.slice(0, 5).map((file) => (
              <li key={file.relative_path}>
                <strong>{file.filename}</strong>
                <span>{formatDate(file.modified_at, { dateStyle: "medium", timeStyle: "short" })}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel eyebrow="Roadmap" title="Workspace expansion">
          <div className="roadmap">
            <div>
              <strong>Notes</strong>
              <p>Operational today with editing, labeling, history, and file attachment.</p>
            </div>
            <div>
              <strong>Imports</strong>
              <p>Now grounded in the inbox endpoints so files can become first-class items.</p>
            </div>
            <div>
              <strong>Projects</strong>
              <p>UI is prepared, but list and detail reads still need dedicated capabilities.</p>
            </div>
          </div>
        </Panel>
      </div>
    </ResponsiveContainer>
  );
}
