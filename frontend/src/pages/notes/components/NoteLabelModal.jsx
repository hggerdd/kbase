import React, { useEffect, useMemo, useState } from "react";
import { FolderClosedIcon, FolderOpenIcon } from "../../../shared/ui/Icons";

function buildLabelTree(labels) {
  const nodesById = new Map(labels.map((label) => [label.id, { ...label, children: [] }]));
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

function LabelTreeNode({ node, selectedPaths, expandedIds, onSelect, onToggle }) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedPaths.includes(node.full_path);
  const hasChildren = node.children.length > 0;
  const FolderIcon = isExpanded ? FolderOpenIcon : FolderClosedIcon;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <button
        type="button"
        className={`tree-group-row label-tree-row ${isSelected ? "active" : ""}`.trim()}
        onClick={() => onSelect(node.full_path)}
      >
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
        {isSelected ? <span className="label-selected-chip">selected</span> : null}
      </button>
      {hasChildren && isExpanded ? (
        <ul className="tree-list nested" role="group">
          {node.children.map((child) => (
            <LabelTreeNode
              key={child.id}
              node={child}
              selectedPaths={selectedPaths}
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

export function NoteLabelModal({ labels, selectedPaths, onToggleLabel, onClose }) {
  const tree = useMemo(() => buildLabelTree(labels.filter((label) => label.is_active)), [labels]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    setExpandedIds(new Set(collectLabelIds(tree)));
  }, [tree]);

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

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet note-label-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-label-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="note-label-modal-title">Labels</h2>
        </div>

        <div className="note-label-modal-tree">
          {tree.length === 0 ? (
            <p className="muted">No active labels available.</p>
          ) : (
            <ul className="tree-list tree-root" role="tree" aria-label="Select note labels">
              {tree.map((node) => (
                <LabelTreeNode
                  key={node.id}
                  node={node}
                  selectedPaths={selectedPaths}
                  expandedIds={expandedIds}
                  onSelect={onToggleLabel}
                  onToggle={toggleExpanded}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
