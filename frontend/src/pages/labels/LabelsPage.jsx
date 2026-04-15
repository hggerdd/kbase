import React, { useEffect, useMemo, useState } from "react";
import { useLabelsWorkspace } from "../../features/labels/hooks.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FolderClosedIcon, FolderOpenIcon, PlusIcon, TagIcon } from "../../shared/ui/Icons.jsx";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatusBanner } from "../../shared/ui/StatusBanner";

const EMPTY_DRAFT = {
  name: "",
  parent_id: "",
  description: "",
};

function buildLabelTree(labels) {
  const nodesById = new Map(
    labels.map((label) => [label.id, { ...label, children: [] }]),
  );
  const roots = [];
  nodesById.forEach((node) => {
    const parent = node.parent_id ? nodesById.get(node.parent_id) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  function sortNodes(nodes) {
    nodes.sort((first, second) => first.name.localeCompare(second.name));
    nodes.forEach((node) => sortNodes(node.children));
  }
  sortNodes(roots);
  return roots;
}

function collectLabelIds(nodes) {
  return nodes.flatMap((node) => [node.id, ...collectLabelIds(node.children)]);
}

function LabelTreeNode({ node, selectedId, expandedIds, onSelect, onToggle }) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;
  const FolderIcon = isExpanded ? FolderOpenIcon : FolderClosedIcon;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <button type="button" className={`tree-group-row label-tree-row ${isSelected ? "active" : ""}`} onClick={() => onSelect(node.id)}>
        <span
          className={`tree-caret ${isExpanded ? "expanded" : ""} ${hasChildren ? "" : "hidden"}`}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) {
              onToggle(node.id);
            }
          }}
        />
        <span className="tree-node-icon tree-icon-folder">
          <FolderIcon />
        </span>
        <span className="tree-node-label">{node.name}</span>
        {!node.is_active ? <span className="label-state-chip">inactive</span> : null}
      </button>
      {hasChildren && isExpanded ? (
        <ul className="tree-list nested" role="group">
          {node.children.map((child) => (
            <LabelTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function LabelModal({ labels, mode, initialDraft, saving, onClose, onSubmit }) {
  const [draft, setDraft] = useState(initialDraft);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  function handleSubmit(event) {
    event.preventDefault();
    void onSubmit(draft);
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-sheet label-edit-modal" role="dialog" aria-modal="true" aria-labelledby="label-edit-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{mode === "create" ? "Add label" : "Edit label"}</p>
            <h2 id="label-edit-title">{mode === "create" ? "Add label" : "Edit label"}</h2>
          </div>
        </div>
        <form className="create-form label-edit-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} autoFocus />
          </label>
          {mode === "create" ? (
            <label>
              <span>Root</span>
              <select value={draft.parent_id} onChange={(event) => setDraft({ ...draft, parent_id: event.target.value })}>
                <option value="">Root</option>
                {labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.full_path}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span>Description</span>
            <textarea rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit" disabled={saving || !draft.name.trim()}>
              {mode === "create" ? "Create label" : "Save label"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LabelsPage() {
  const workspace = useLabelsWorkspace();
  const [selectedId, setSelectedId] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [modalMode, setModalMode] = useState(null);
  const tree = useMemo(() => buildLabelTree(workspace.labels), [workspace.labels]);
  const selectedLabel = workspace.labels.find((label) => label.id === selectedId) ?? null;

  useEffect(() => {
    setExpandedIds(new Set(collectLabelIds(tree)));
  }, [tree]);

  useEffect(() => {
    if (selectedId && !workspace.labels.some((label) => label.id === selectedId)) {
      setSelectedId("");
    }
  }, [selectedId, workspace.labels]);

  function toggleExpanded(labelId) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(labelId)) {
        next.delete(labelId);
      } else {
        next.add(labelId);
      }
      return next;
    });
  }

  async function submitCreate(draft) {
    const created = await workspace.handleCreateLabel({ preventDefault() {} }, draft);
    if (created) {
      setModalMode(null);
    }
  }

  async function submitEdit(draft) {
    if (!selectedLabel) {
      return;
    }
    const updated = await workspace.handleUpdateLabel(selectedLabel.id, {
      name: draft.name,
      description: draft.description || null,
    });
    if (updated) {
      setModalMode(null);
    }
  }

  async function deleteSelectedLabel() {
    if (!selectedLabel) {
      return;
    }
    const deleted = await workspace.handleDeleteLabel(selectedLabel.id);
    if (deleted) {
      setSelectedId("");
    }
  }

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Labels"
        title="Labels"
        description="Manage hierarchical labels and keep the taxonomy stable across the knowledge base."
        actions={
          <button className="primary icon-text-button" type="button" onClick={() => setModalMode("create")}>
            <span className="button-icon"><PlusIcon /></span>
            Add label
          </button>
        }
      />

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="labels-explorer-layout">
        <Panel className="labels-tree-panel" eyebrow="Explorer" title={`Known labels (${workspace.labels.length})`}>
          {workspace.loading ? <p className="muted">Loading labels...</p> : null}
          {!workspace.loading && workspace.labels.length === 0 ? (
            <EmptyState title="No labels yet" description="Create the first taxonomy node." />
          ) : (
            <ul className="tree-list tree-root" role="tree" aria-label="Label explorer tree">
              {tree.map((node) => (
                <LabelTreeNode
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onSelect={setSelectedId}
                  onToggle={toggleExpanded}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="labels-detail-panel" eyebrow="Label" title={selectedLabel ? selectedLabel.name : "No label selected"}>
          {selectedLabel ? (
            <div className="label-detail">
              <div className="label-detail-title">
                <span className="tree-node-icon tree-icon-generic"><TagIcon /></span>
                <div>
                  <strong>{selectedLabel.full_path}</strong>
                  <p>{selectedLabel.is_active ? "active" : "inactive"} / Depth {selectedLabel.depth}</p>
                </div>
              </div>
              <div className="label-description-box">
                <span>Description</span>
                <p>{selectedLabel.description || "No description"}</p>
              </div>
              <div className="label-detail-actions">
                <button className="secondary" type="button" onClick={() => setModalMode("edit")} disabled={workspace.saving}>
                  Edit
                </button>
                <button className="danger" type="button" onClick={() => void deleteSelectedLabel()} disabled={workspace.saving}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <EmptyState title="No label selected" description="Pick a label from the explorer tree to inspect it." />
          )}
        </Panel>
      </div>

      {modalMode === "create" ? (
        <LabelModal
          labels={workspace.labels}
          mode="create"
          initialDraft={{ ...EMPTY_DRAFT, parent_id: selectedLabel?.id ?? "" }}
          saving={workspace.saving}
          onClose={() => setModalMode(null)}
          onSubmit={submitCreate}
        />
      ) : null}
      {modalMode === "edit" && selectedLabel ? (
        <LabelModal
          labels={workspace.labels}
          mode="edit"
          initialDraft={{
            name: selectedLabel.name,
            parent_id: selectedLabel.parent_id ?? "",
            description: selectedLabel.description ?? "",
          }}
          saving={workspace.saving}
          onClose={() => setModalMode(null)}
          onSubmit={submitEdit}
        />
      ) : null}
    </ResponsiveContainer>
  );
}
