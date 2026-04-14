import React, { useMemo, useState } from "react";
import { useFileViewerWorkspace } from "../../features/files/hooks.js";
import { FILE_TREE_LAYOUTS } from "../../features/files/state.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { formatDate, formatFileSize } from "../../shared/utils/format";
import { EmptyState } from "../../shared/ui/EmptyState";
import {
  FilterIcon,
  FolderClosedIcon,
  FolderOpenIcon,
  GenericFileIcon,
  ImageFileIcon,
  PdfFileIcon,
  SheetFileIcon,
  TagIcon,
  TextFileIcon,
} from "../../shared/ui/Icons.jsx";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatusBanner } from "../../shared/ui/StatusBanner";

function getFileIcon(node) {
  const filename = String(node.filename ?? node.label ?? "").toLowerCase();
  const mimeType = String(node.mimeType ?? "").toLowerCase();

  if (filename.endsWith(".pdf")) {
    return { Icon: PdfFileIcon, className: "tree-icon-pdf" };
  }
  if (
    filename.endsWith(".png") ||
    filename.endsWith(".jpg") ||
    filename.endsWith(".jpeg") ||
    filename.endsWith(".gif") ||
    filename.endsWith(".webp") ||
    mimeType.startsWith("image/")
  ) {
    return { Icon: ImageFileIcon, className: "tree-icon-image" };
  }
  if (
    filename.endsWith(".csv") ||
    filename.endsWith(".xls") ||
    filename.endsWith(".xlsx") ||
    node.itemKind === "spreadsheet"
  ) {
    return { Icon: SheetFileIcon, className: "tree-icon-sheet" };
  }
  if (
    filename.endsWith(".txt") ||
    filename.endsWith(".md") ||
    filename.endsWith(".doc") ||
    filename.endsWith(".docx")
  ) {
    return { Icon: TextFileIcon, className: "tree-icon-text" };
  }
  return { Icon: GenericFileIcon, className: "tree-icon-generic" };
}

function TreeNode({ node, expandedIds, onSelectFile, onToggle, selectedId }) {
  if (node.type === "file") {
    const { Icon, className } = getFileIcon(node);
    return (
      <li role="treeitem" aria-selected={selectedId === node.itemId}>
        <button
          type="button"
          className={`tree-file-row ${selectedId === node.itemId ? "active" : ""}`}
          onClick={() => onSelectFile(node.itemId)}
        >
          <span className={`tree-node-icon ${className}`}>
            <Icon />
          </span>
          <span>{node.label}</span>
        </button>
      </li>
    );
  }

  const isExpanded = expandedIds.has(node.id);
  return (
    <li role="treeitem" aria-expanded={isExpanded}>
      <button type="button" className="tree-group-row" onClick={() => onToggle(node.id)}>
        <span className={`tree-caret ${isExpanded ? "expanded" : ""}`} />
        <span className="tree-node-icon tree-icon-folder">
          {isExpanded ? <FolderOpenIcon /> : <FolderClosedIcon />}
        </span>
        <span>{node.label}</span>
        <strong>{node.children.length}</strong>
      </button>
      {isExpanded ? (
        <ul className="tree-list nested" role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onSelectFile={onSelectFile}
              onToggle={onToggle}
              selectedId={selectedId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function FileViewerPage() {
  const workspace = useFileViewerWorkspace();
  const [collapsedIds, setCollapsedIds] = useState([]);
  const selectedFile = workspace.selectedItem?.files?.[0] ?? null;

  const expandedIds = useMemo(() => {
    const ids = new Set();
    function collect(nodes) {
      for (const node of nodes) {
        if (node.type === "group" && !collapsedIds.includes(node.id)) {
          ids.add(node.id);
          collect(node.children);
        }
      }
    }
    collect(workspace.tree);
    return ids;
  }, [collapsedIds, workspace.tree]);

  function toggleNode(nodeId) {
    setCollapsedIds((current) =>
      current.includes(nodeId) ? current.filter((entry) => entry !== nodeId) : [...current, nodeId],
    );
  }

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Files"
        title="Navigate imported files as a real explorer"
        description="Browse file items by category, label, and original filename. Filter the tree down to a working slice, then inspect metadata and the stored markdown summary without leaving the explorer."
      />

      <StatusBanner error={workspace.error} />

      <div className="files-layout">
        <Panel
          className="files-sidebar-panel"
          eyebrow="Filters"
          title="File filters"
          action={
            <button className="secondary compact-button" type="button" onClick={workspace.refresh}>
              Reload
            </button>
          }
        >
          <div className="file-controls">
            <label className="search-field">
              <span>Tree structure</span>
              <select value={workspace.treeLayout} onChange={(event) => workspace.setTreeLayout(event.target.value)}>
                {FILE_TREE_LAYOUTS.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="search-field">
              <span>Search files</span>
              <input
                value={workspace.query}
                onChange={(event) => workspace.setQuery(event.target.value)}
                placeholder="Filename, title, label, summary"
              />
            </label>

            <label className="search-field">
              <span>Category prefix</span>
              <input
                value={workspace.categoryPrefix}
                onChange={(event) => workspace.setCategoryPrefix(event.target.value)}
                placeholder="income_document"
              />
            </label>

            <div className="search-field">
              <span>Label filters</span>
              <div className="token-list">
                {workspace.availableLabels.length === 0 ? <span className="muted">No labels loaded.</span> : null}
                {workspace.availableLabels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    className={`token-button ${workspace.selectedLabels.includes(label.full_path) ? "active" : ""}`}
                    onClick={() => workspace.toggleLabelFilter(label.full_path)}
                  >
                    <TagIcon />
                    <span>{label.full_path}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="search-inline-hint">
              <FilterIcon />
              <span>Current mode: {FILE_TREE_LAYOUTS.find((layout) => layout.id === workspace.treeLayout)?.label}</span>
            </div>
          </div>
        </Panel>

        <Panel className="files-tree-panel" eyebrow="Explorer" title={`Tree (${workspace.filteredItems.length} files)`}>
          {workspace.loading ? <p className="muted">Loading file explorer...</p> : null}
          {!workspace.loading && workspace.tree.length === 0 ? (
            <EmptyState
              title="No files for this filter"
              description="Adjust category and label filters or seed the file-viewer test data."
            />
          ) : null}
          <ul className="tree-list tree-root" role="tree" aria-label="File explorer tree">
            {workspace.tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                expandedIds={expandedIds}
                onSelectFile={workspace.setSelectedId}
                onToggle={toggleNode}
                selectedId={workspace.selectedId}
              />
            ))}
          </ul>
        </Panel>

        <div className="files-detail-column">
          <Panel eyebrow="Selected file" title={selectedFile?.original_filename ?? "Choose a file"}>
            {workspace.selectedItem ? (
              <div className="search-detail-stack">
                <div className="detail-kv-grid">
                  <div className="detail-kv-row">
                    <span>Title</span>
                    <strong>{workspace.selectedItem.item.title}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Kind</span>
                    <strong>{workspace.selectedItem.item.item_kind}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Category</span>
                    <strong>{workspace.selectedItem.item.category_key ?? "uncategorized"}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Status</span>
                    <strong>{workspace.selectedItem.item.status ?? "n/a"}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Original filename</span>
                    <strong>{selectedFile?.original_filename ?? "n/a"}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Stored path</span>
                    <strong>{selectedFile?.relative_path ?? "n/a"}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Mime type</span>
                    <strong>{selectedFile?.mime_type ?? "n/a"}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>File size</span>
                    <strong>{selectedFile?.size_bytes ? formatFileSize(selectedFile.size_bytes) : "n/a"}</strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Updated</span>
                    <strong>
                      {formatDate(workspace.selectedItem.item.updated_at, { dateStyle: "medium", timeStyle: "short" })}
                    </strong>
                  </div>
                  <div className="detail-kv-row">
                    <span>Checksum</span>
                    <strong>{selectedFile?.checksum_sha256?.slice(0, 12) ?? "n/a"}</strong>
                  </div>
                </div>

                <div className="token-list">
                  {(workspace.selectedItem.labels ?? []).map((label) => (
                    <span key={label.id}>{label.full_path}</span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No file selected" description="Pick a file from the explorer tree to inspect it here." />
            )}
          </Panel>

          <Panel eyebrow="Summary" title="Markdown preview">
            {workspace.selectedItem ? (
              workspace.renderedSummary ? (
                <div
                  className="rich-markdown file-summary-preview"
                  dangerouslySetInnerHTML={{ __html: workspace.renderedSummary }}
                />
              ) : (
                <p className="muted">No summary stored yet for this file.</p>
              )
            ) : (
              <EmptyState
                title="No summary available"
                description="Once a file is selected, its markdown summary appears here with formatting."
              />
            )}
          </Panel>

          <Panel eyebrow="Metadata" title="Captured metadata">
            {workspace.selectedItem?.metadata?.length ? (
              <div className="metadata-list">
                {workspace.selectedItem.metadata.map((entry) => (
                  <div key={`${entry.field_key}-${String(entry.value)}`} className="detail-kv-row">
                    <span>{entry.field_key}</span>
                    <strong>{String(entry.value ?? "n/a")}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No metadata stored for this file.</p>
            )}
          </Panel>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
