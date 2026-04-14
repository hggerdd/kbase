import React from "react";
import { useImportsWorkspace } from "../../features/imports/hooks";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { formatDate, formatFileSize } from "../../shared/utils/format";
import { EmptyState } from "../../shared/ui/EmptyState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatCard } from "../../shared/ui/StatCard";
import { StatusBanner } from "../../shared/ui/StatusBanner";

const ITEM_KINDS = ["document", "image", "spreadsheet"];

export function ImportsPage() {
  const workspace = useImportsWorkspace();

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Imports"
        title="Turn raw files into first-class knowledge items"
        description="The inbox flow now has a proper place in the app. Pick a raw file, set its intended role, and import it into the item model instead of leaving files stranded outside the knowledge graph."
        aside={
          <div className="stats-grid">
            <StatCard label="Inbox files" value={workspace.files.length} tone="coral" />
            <StatCard label="Selected" value={workspace.selectedFile ? "Ready" : "None"} tone="cyan" />
            <StatCard
              label="Last import"
              value={workspace.lastImportedItem ? workspace.lastImportedItem.item_kind : "n/a"}
              tone="gold"
            />
          </div>
        }
      />

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="dashboard-grid imports-grid">
        <Panel eyebrow="Inbox" title="Raw files waiting for classification">
          {workspace.loading ? <p className="muted">Loading inbox files...</p> : null}
          {!workspace.loading && workspace.files.length === 0 ? (
            <EmptyState
              title="Inbox is empty"
              description="Drop files into the raw inbox directory and they will appear here for controlled import."
            />
          ) : null}
          <div className="stack-list">
            {workspace.files.map((file) => (
              <button
                key={file.relative_path}
                type="button"
                className={`stack-card ${workspace.selectedPath === file.relative_path ? "active" : ""}`}
                onClick={() => workspace.setSelectedPath(file.relative_path)}
              >
                <div>
                  <strong>{file.filename}</strong>
                  <p>{file.relative_path}</p>
                </div>
                <span>{formatFileSize(file.size_bytes)}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Import form" title="Describe the target item">
          {workspace.selectedFile ? (
            <form className="create-form" onSubmit={workspace.handleImport}>
              <label>
                <span>Selected file</span>
                <div className="detail-card">
                  <strong>{workspace.selectedFile.filename}</strong>
                  <p>{workspace.selectedFile.relative_path}</p>
                  <small>
                    {formatFileSize(workspace.selectedFile.size_bytes)} ·{" "}
                    {formatDate(workspace.selectedFile.modified_at, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </small>
                </div>
              </label>
              <label>
                <span>Title</span>
                <input
                  value={workspace.draft.title}
                  onChange={(event) => workspace.setDraft({ ...workspace.draft, title: event.target.value })}
                />
              </label>
              <label>
                <span>Item kind</span>
                <select
                  value={workspace.draft.item_kind}
                  onChange={(event) => workspace.setDraft({ ...workspace.draft, item_kind: event.target.value })}
                >
                  {ITEM_KINDS.map((itemKind) => (
                    <option key={itemKind} value={itemKind}>
                      {itemKind}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Category</span>
                <input
                  value={workspace.draft.category_key}
                  onChange={(event) =>
                    workspace.setDraft({ ...workspace.draft, category_key: event.target.value })
                  }
                />
              </label>
              <label>
                <span>Optional link to item id</span>
                <input
                  value={workspace.draft.link_to_item_id}
                  onChange={(event) =>
                    workspace.setDraft({ ...workspace.draft, link_to_item_id: event.target.value })
                  }
                  placeholder="Attach to an existing note or document"
                />
              </label>
              <label>
                <span>Link type</span>
                <select
                  value={workspace.draft.link_type}
                  onChange={(event) => workspace.setDraft({ ...workspace.draft, link_type: event.target.value })}
                >
                  <option value="attachment">attachment</option>
                  <option value="references">references</option>
                </select>
              </label>
              <button className="primary" type="submit" disabled={workspace.saving}>
                {workspace.saving ? "Importing..." : "Import as item"}
              </button>
            </form>
          ) : (
            <EmptyState
              title="Select a file"
              description="Choose one of the queued inbox files to map it into the item model."
            />
          )}
        </Panel>

        <Panel eyebrow="Last result" title="Imported item preview">
          {workspace.lastImportedItem ? (
            <div className="stack-card static">
              <div>
                <strong>{workspace.lastImportedItem.title}</strong>
                <p>{workspace.lastImportedItem.item_kind}</p>
              </div>
              <span>{workspace.lastImportedItem.id}</span>
            </div>
          ) : (
            <EmptyState
              title="No import performed yet"
              description="Once a file is imported, the resulting item summary will appear here."
            />
          )}
        </Panel>
      </div>
    </ResponsiveContainer>
  );
}
