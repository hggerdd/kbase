import React, { useEffect, useMemo, useRef, useState } from "react";
import { getFileContentUrl } from "../../features/files/api.js";
import { useFileViewerWorkspace } from "../../features/files/hooks.js";
import { getPrimaryFilename } from "../../features/files/state.js";
import { buildCategoryTree, collectCategoryKeys } from "../../features/categories/state.js";
import { ItemContextPills } from "../../shared/items/ItemContextPills";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { formatFileSize } from "../../shared/utils/format";
import { EmptyState } from "../../shared/ui/EmptyState";
import {
  FolderIcon,
  FolderClosedIcon,
  FolderOpenIcon,
  FilterIcon,
  GenericFileIcon,
  ImageFileIcon,
  PdfFileIcon,
  PlusIcon,
  SearchIcon,
  SheetFileIcon,
  TagIcon,
  TextFileIcon,
  XIcon,
} from "../../shared/ui/Icons.jsx";
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
  if (filename.endsWith(".csv") || filename.endsWith(".xls") || filename.endsWith(".xlsx") || node.itemKind === "spreadsheet") {
    return { Icon: SheetFileIcon, className: "tree-icon-sheet" };
  }
  if (filename.endsWith(".txt") || filename.endsWith(".md") || filename.endsWith(".doc") || filename.endsWith(".docx")) {
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
          className={`workspace-tree-row file-tree-row ${selectedId === node.itemId ? "active" : ""}`}
          onClick={() => onSelectFile(node.itemId)}
        >
          <span className={`workspace-tree-icon ${className}`}>
            <Icon />
          </span>
          <span className="workspace-tree-label">{node.label}</span>
        </button>
      </li>
    );
  }

  const isExpanded = expandedIds.has(node.id);
  return (
    <li role="treeitem" aria-expanded={isExpanded}>
      <button type="button" className="workspace-tree-row file-tree-row" onClick={() => onToggle(node.id)}>
        <span className={`workspace-tree-caret ${isExpanded ? "expanded" : ""}`} />
        <span className="workspace-tree-icon tree-icon-folder">
          {isExpanded ? <FolderOpenIcon /> : <FolderClosedIcon />}
        </span>
        <span className="workspace-tree-label">{node.label}</span>
      </button>
      {isExpanded ? (
        <ul className="workspace-tree-list nested" role="group">
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

function useMobileBreakpoint(query = "(max-width: 860px)") {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }
    const mediaQuery = window.matchMedia(query);
    function handleChange() {
      setMatches(mediaQuery.matches);
    }
    handleChange();
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, [query]);

  return matches;
}

function buildLabelTree(labels) {
  const nodesById = new Map(labels.map((label) => [label.id, { ...label, children: [] }]));
  const roots = [];

  for (const node of nodesById.values()) {
    const parent = node.parent_id ? nodesById.get(node.parent_id) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortNodes(nodes) {
    nodes.sort((left, right) => left.name.localeCompare(right.name));
    nodes.forEach((node) => sortNodes(node.children));
  }

  sortNodes(roots);
  return roots;
}

function collectLabelIds(nodes) {
  return nodes.flatMap((node) => [node.id, ...collectLabelIds(node.children)]);
}

function CategoryFilterRow({ category, expandedKeys, onSelect, onToggle, selectedKey }) {
  const hasChildren = category.children.length > 0;
  const isExpanded = expandedKeys.has(category.key);
  const isSelected = selectedKey === category.key;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <button type="button" className={`workspace-tree-row ${isSelected ? "active" : ""}`.trim()} onClick={() => onSelect(category.key)}>
        <span
          className={`workspace-tree-caret ${isExpanded ? "expanded" : ""} ${hasChildren ? "" : "hidden"}`.trim()}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) {
              onToggle(category.key);
            }
          }}
        />
        <span className="workspace-tree-icon">
          <FolderClosedIcon />
        </span>
        <span className="workspace-tree-label">{category.label || category.full_path || category.key}</span>
      </button>
      {hasChildren && isExpanded ? (
        <ul className="workspace-tree-list nested" role="group">
          {category.children.map((child) => (
            <CategoryFilterRow
              key={child.key}
              category={child}
              expandedKeys={expandedKeys}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedKey={selectedKey}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function LabelFilterRow({ expandedIds, node, onSelect, onToggle, selectedPaths }) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedPaths.includes(node.full_path);

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <button type="button" className={`workspace-tree-row ${isSelected ? "active" : ""}`.trim()} onClick={() => onSelect(node.full_path)}>
        <span
          className={`workspace-tree-caret ${isExpanded ? "expanded" : ""} ${hasChildren ? "" : "hidden"}`.trim()}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) {
              onToggle(node.id);
            }
          }}
        />
        <span className="workspace-tree-icon">
          <TagIcon />
        </span>
        <span className="workspace-tree-label">{node.name}</span>
      </button>
      {hasChildren && isExpanded ? (
        <ul className="workspace-tree-list nested" role="group">
          {node.children.map((child) => (
            <LabelFilterRow
              key={child.id}
              expandedIds={expandedIds}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedPaths={selectedPaths}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function selectedLabelPaths(item) {
  return (item?.labels ?? []).map((label) => label.full_path);
}

function formatItemKind(value) {
  return String(value ?? "file").replaceAll("_", " ");
}

function categoryTreeForUsedFileCategories(categories, items) {
  const usedKeys = new Set(items.map((detail) => detail.item.category_key).filter(Boolean));
  if (usedKeys.size === 0) {
    return [];
  }

  const categoriesByKey = new Map(categories.map((category) => [category.key, category]));
  const includedKeys = new Set();
  for (const key of usedKeys) {
    let current = categoriesByKey.get(key);
    while (current) {
      includedKeys.add(current.key);
      current = current.parent_key ? categoriesByKey.get(current.parent_key) : null;
    }
  }

  return buildCategoryTree(categories.filter((category) => includedKeys.has(category.key)));
}

function labelTreeForUsedFileLabels(labels, items) {
  const usedPaths = new Set(items.flatMap((detail) => (detail.labels ?? []).map((label) => label.full_path)));
  if (usedPaths.size === 0) {
    return [];
  }

  return buildLabelTree(
    labels.filter((label) => {
      const path = label.full_path;
      return [...usedPaths].some((usedPath) => usedPath === path || usedPath.startsWith(`${path}/`));
    }),
  );
}

function projectsUsedByFiles(projects, items) {
  const usedIds = new Set(items.flatMap((detail) => (detail.projects ?? []).map((project) => project.id)));
  return projects.filter((project) => usedIds.has(project.id));
}

export function FileViewerPage() {
  const workspace = useFileViewerWorkspace();
  const isMobile = useMobileBreakpoint();
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [collapsedIds, setCollapsedIds] = useState([]);
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState(new Set());
  const [expandedLabelIds, setExpandedLabelIds] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const selectedFile = workspace.selectedItem?.files?.[0] ?? null;
  const selectedLabels = selectedLabelPaths(workspace.selectedItem);
  const linkedLinksByItemId = useMemo(
    () => new Map((workspace.selectedItem?.outgoing_links ?? []).map((link) => [link.to_item_id, link])),
    [workspace.selectedItem],
  );
  const isPdfPreview =
    Boolean(selectedFile?.id) &&
    (String(selectedFile?.mime_type ?? "").toLowerCase().includes("pdf") ||
      String(selectedFile?.original_filename ?? "").toLowerCase().endsWith(".pdf"));
  const isImagePreview = Boolean(selectedFile?.id) && String(selectedFile?.mime_type ?? "").toLowerCase().startsWith("image/");
  const filePreviewUrl =
    workspace.selectedItem && selectedFile?.id
      ? getFileContentUrl(workspace.selectedItem.item.id, selectedFile.id)
      : "";
  const categoryTree = useMemo(
    () => categoryTreeForUsedFileCategories(workspace.availableCategories, workspace.items),
    [workspace.availableCategories, workspace.items],
  );
  const categoryKeys = useMemo(() => collectCategoryKeys(categoryTree), [categoryTree]);
  const labelTree = useMemo(
    () => labelTreeForUsedFileLabels(workspace.availableLabels, workspace.items),
    [workspace.availableLabels, workspace.items],
  );
  const labelIds = useMemo(() => collectLabelIds(labelTree), [labelTree]);
  const fileProjects = useMemo(
    () => projectsUsedByFiles(workspace.availableProjects, workspace.items),
    [workspace.availableProjects, workspace.items],
  );

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

  function handleSelectFile(itemId) {
    workspace.setSelectedId(itemId);
    if (isMobile) {
      setIsMobileDetailOpen(true);
    }
  }

  useEffect(() => {
    setExpandedCategoryKeys(new Set(categoryKeys));
  }, [categoryKeys]);

  useEffect(() => {
    setExpandedLabelIds(new Set(labelIds));
  }, [labelIds]);

  function toggleExpandedCategory(categoryKey) {
    setExpandedCategoryKeys((current) => {
      const next = new Set(current);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  }

  function toggleExpandedLabel(labelId) {
    setExpandedLabelIds((current) => {
      const next = new Set(current);
      if (next.has(labelId)) {
        next.delete(labelId);
      } else {
        next.add(labelId);
      }
      return next;
    });
  }

  async function handleSelectedUpload(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) {
      return;
    }
    const success = await workspace.uploadNewFile(file);
    if (success) {
      setIsAddModalOpen(false);
    }
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("kbase:page-header-meta", {
        detail: { route: "files", count: workspace.items.length },
      }),
    );
  }, [workspace.items.length]);

  return (
    <ResponsiveContainer>
      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="home-notes-workspace">
        <aside className="workspace-sidebar">
          <section className="workspace-section file-workspace-heading">
            <div className="workspace-section-heading">Workspace</div>
            <h1>Library</h1>
          </section>

          <section className="workspace-section file-mobile-search-section">
            <div className="workspace-section-title">Search</div>
            <div className="file-search-action-row">
              <label className="workspace-search-shell">
                <span className="workspace-search-icon">
                  <SearchIcon />
                </span>
                <input
                  className="workspace-search-input"
                  value={workspace.query}
                  onChange={(event) => workspace.setQuery(event.target.value)}
                  placeholder="Search files, labels, summaries"
                />
              </label>
              <button
                className="file-mobile-advanced-button"
                type="button"
                aria-label="Advanced file filters"
                onClick={() => setIsAdvancedModalOpen(true)}
              >
                <FilterIcon />
                <span>Advanced</span>
              </button>
            </div>
          </section>

          <section className="workspace-section workspace-filter-section file-advanced-filter">
            <div className="workspace-section-head">
              <div className="workspace-section-title">Category</div>
            </div>
            <div className="workspace-tree-scroll">
              <ul className="workspace-tree-list" role="tree" aria-label="File category filter tree">
                {categoryTree.length > 0 ? (
                  <li>
                    <button
                      type="button"
                      className={`workspace-tree-row ${workspace.selectedCategoryKey ? "" : "active"}`}
                      onClick={() => workspace.setSelectedCategoryKey("")}
                    >
                      <span className="workspace-tree-icon">
                        <FolderOpenIcon />
                      </span>
                      <span className="workspace-tree-label">All categories</span>
                    </button>
                  </li>
                ) : null}
                {categoryTree.map((category) => (
                  <CategoryFilterRow
                    key={category.key}
                    category={category}
                    expandedKeys={expandedCategoryKeys}
                    onSelect={workspace.setSelectedCategoryKey}
                    onToggle={toggleExpandedCategory}
                    selectedKey={workspace.selectedCategoryKey}
                  />
                ))}
              </ul>
            </div>
          </section>

          <section className="workspace-section workspace-filter-section file-advanced-filter">
            <div className="workspace-section-head">
              <div className="workspace-section-title">Projects</div>
            </div>
            <div className="workspace-flat-scroll workspace-flat-list" role="tree" aria-label="File project filter tree">
              {fileProjects.length > 0 ? (
                <button
                  type="button"
                  className={`workspace-tree-row ${workspace.selectedProjectId ? "" : "active"}`}
                  onClick={() => workspace.setSelectedProjectId("")}
                >
                  <span className="workspace-tree-icon">
                    <FolderIcon />
                  </span>
                  <span className="workspace-tree-label">All projects</span>
                </button>
              ) : null}
              {fileProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`workspace-tree-row ${workspace.selectedProjectId === project.id ? "active" : ""}`}
                  onClick={() => workspace.setSelectedProjectId(project.id)}
                >
                  <span className="workspace-tree-icon">
                    <FolderIcon />
                  </span>
                  <span className="workspace-tree-label">{project.title}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-section workspace-filter-section file-advanced-filter">
            <div className="workspace-section-head">
              <div className="workspace-section-title">Labels</div>
            </div>
            <div className="workspace-tree-scroll">
              <ul className="workspace-tree-list" role="tree" aria-label="File label filter tree">
                {labelTree.length > 0 ? (
                  <li>
                    <button
                      type="button"
                      className={`workspace-tree-row ${workspace.selectedLabels.length === 0 ? "active" : ""}`.trim()}
                      onClick={() => workspace.clearLabelFilters()}
                    >
                      <span className="workspace-tree-icon">
                        <TagIcon />
                      </span>
                      <span className="workspace-tree-label">All labels</span>
                    </button>
                  </li>
                ) : null}
                {labelTree.map((label) => (
                  <LabelFilterRow
                    key={label.id}
                    expandedIds={expandedLabelIds}
                    node={label}
                    onSelect={workspace.toggleLabelFilter}
                    onToggle={toggleExpandedLabel}
                    selectedPaths={workspace.selectedLabels}
                  />
                ))}
              </ul>
            </div>
          </section>
        </aside>

        <section className="workspace-results-column file-results-column">
          <div className="workspace-results-header">
            <div>
              <strong>File items</strong>
              <span>Items with stored source files</span>
            </div>
            <button className="secondary compact-button" type="button" onClick={workspace.refresh}>
              Reload
            </button>
            <button
              className="round-add-button"
              type="button"
              aria-label="Add file"
              title="Add file"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon />
            </button>
          </div>

          {workspace.loading ? <p className="muted">Loading file explorer...</p> : null}
          {!workspace.loading && workspace.tree.length === 0 ? (
            <EmptyState title="No files for this filter" description="Adjust search, category, project, or label filters." />
          ) : null}
          <ul className="workspace-tree-list workspace-tree-scroll file-tree-scroll" role="tree" aria-label="File explorer tree">
            {workspace.tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                expandedIds={expandedIds}
                onSelectFile={handleSelectFile}
                onToggle={toggleNode}
                selectedId={workspace.selectedId}
              />
            ))}
          </ul>
        </section>

        <section className="workspace-editor-shell file-desktop-editor">
          <Panel className="workspace-note-editor-panel file-detail-panel">
            {workspace.selectedItem ? (
              <>
                <div className="workspace-detail-hero">
                  <div className="workspace-detail-main">
                    <span className="workspace-section-heading">{formatItemKind(workspace.selectedItem.item.item_kind)}</span>
                    <h2>{workspace.selectedItem.item.title}</h2>
                    <p className="workspace-detail-summary">{selectedFile?.original_filename ?? getPrimaryFilename(workspace.selectedItem)}</p>
                    <div className="workspace-detail-stats">
                      <span className="workspace-detail-stat">{workspace.selectedItem.item.category_key ?? "uncategorized"}</span>
                      <span className="workspace-detail-stat">{selectedFile?.mime_type ?? "unknown type"}</span>
                      <span className="workspace-detail-stat">
                        {selectedFile?.size_bytes ? formatFileSize(selectedFile.size_bytes) : "unknown size"}
                      </span>
                    </div>
                  </div>
                  <span className="autosave-state">{workspace.coreSaving || workspace.contentSaving ? "Saving..." : "Autosaved"}</span>
                </div>

                <div className="file-item-editor-grid file-title-editor-grid">
                  <label className="search-field">
                    <span>Title</span>
                    <input
                      value={workspace.coreDraft.title}
                      onChange={(event) => workspace.setCoreDraft((current) => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                </div>

                <div className="file-context-pills">
                  <ItemContextPills
                    availableCategories={workspace.availableCategories}
                    availableLabels={workspace.availableLabels}
                    availableProjects={workspace.availableProjects}
                    categoryFallbacks={[]}
                    categoryKey={workspace.selectedItem.item.category_key ?? ""}
                    emptyProjectLabel="No project selected"
                    itemKind={workspace.selectedItem.item.item_kind ?? ""}
                    onSelectCategory={workspace.updateSelectedItemCategory}
                    onSelectProject={workspace.replaceSelectedItemProject}
                    onToggleLabel={workspace.toggleSelectedItemLabel}
                    projectId={workspace.selectedItem.projects?.[0]?.id ?? ""}
                    projectTitle={workspace.selectedItem.projects?.[0]?.title ?? ""}
                    selectedLabelPaths={selectedLabels}
                  />
                </div>

                <div className="file-detail-section file-preview-section">
                  <h3>Preview</h3>
                  {isPdfPreview ? (
                    <iframe className="file-preview-frame" src={filePreviewUrl} title={`Preview of ${selectedFile?.original_filename ?? "file"}`} />
                  ) : isImagePreview ? (
                    <img className="file-preview-image" src={filePreviewUrl} alt={selectedFile?.original_filename ?? "Selected file"} />
                  ) : (
                    <EmptyState title="No preview available" description="PDF and image files render here." />
                  )}
                </div>

                <div className="file-detail-section">
                  <h3>Description</h3>
                  <textarea
                    className="file-description-editor"
                    value={workspace.descriptionDraft}
                    onChange={(event) => workspace.setDescriptionDraft(event.target.value)}
                    placeholder="Describe what is visible, why this file matters, or what should be remembered."
                  />
                </div>

                <div className="file-detail-section">
                  <div className="file-section-head">
                    <h3>Links</h3>
                    <button
                      className="secondary compact-button"
                      type="button"
                      onClick={() => void workspace.handleSearchLinkCandidates()}
                      disabled={workspace.linking}
                    >
                      Search
                    </button>
                  </div>
                  <label className="workspace-search-shell file-link-search">
                    <span className="workspace-search-icon">
                      <SearchIcon />
                    </span>
                    <input
                      className="workspace-search-input"
                      value={workspace.linkQuery}
                      onChange={(event) => workspace.setLinkQuery(event.target.value)}
                      placeholder="Search notes or files to link"
                    />
                  </label>
                  {workspace.linkCandidates.length > 0 ? (
                    <div className="file-link-candidates">
                      {workspace.linkCandidates.map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          className="file-link-row"
                          onClick={() => void workspace.handleLinkItem(candidate.id)}
                          disabled={workspace.linking}
                        >
                          <strong>{candidate.title}</strong>
                          <span>{candidate.item_kind}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="file-linked-list">
                    {(workspace.selectedItem.related_items ?? []).map((linkedItem) => {
                      const link = linkedLinksByItemId.get(linkedItem.id);
                      return (
                        <div key={linkedItem.id} className="file-linked-row">
                          <div>
                            <strong>{linkedItem.title}</strong>
                            <span>{linkedItem.item_kind}</span>
                          </div>
                          {link ? (
                            <button
                              className="plain-icon-button small"
                              type="button"
                              aria-label={`Unlink ${linkedItem.title}`}
                              onClick={() => void workspace.handleUnlinkItem(link.id)}
                              disabled={workspace.linking}
                            >
                              <XIcon />
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                    {(workspace.selectedItem.related_items ?? []).length === 0 ? (
                      <p className="muted">No linked items yet.</p>
                    ) : null}
                  </div>
                </div>

              </>
            ) : (
              <EmptyState title="No file selected" description="Pick a file from the explorer to inspect and edit it." />
            )}
          </Panel>
        </section>
      </div>

      <input ref={uploadInputRef} type="file" className="visually-hidden-file-input" onChange={handleSelectedUpload} />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="visually-hidden-file-input"
        onChange={handleSelectedUpload}
      />

      {isAddModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsAddModalOpen(false)}>
          <section
            className="modal-sheet file-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-add-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="file-add-title">Add file</h2>
            </div>
            <div className="file-add-actions">
              <button className="primary" type="button" onClick={() => uploadInputRef.current?.click()} disabled={workspace.uploading}>
                Upload file
              </button>
              <button className="secondary" type="button" onClick={() => cameraInputRef.current?.click()} disabled={workspace.uploading}>
                Take picture
              </button>
            </div>
            {workspace.uploading ? (
              <div className="upload-progress" aria-live="polite">
                <div className="upload-progress-track">
                  <div className="upload-progress-bar" style={{ width: `${workspace.uploadProgress?.percent ?? 0}%` }} />
                </div>
                <span>{workspace.uploadProgress?.percent ?? 0}%</span>
              </div>
            ) : null}
            <div className="modal-actions">
              <button className="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isAdvancedModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsAdvancedModalOpen(false)}>
          <section
            className="modal-sheet file-mobile-advanced-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-advanced-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header file-mobile-sticky-header">
              <h2 id="file-advanced-title">Advanced</h2>
              <button className="primary compact-button" type="button" onClick={() => setIsAdvancedModalOpen(false)}>
                Apply
              </button>
            </div>
            <div className="file-mobile-filter-stack">
              <section className="workspace-section workspace-filter-section">
                <div className="workspace-section-title">Category</div>
                <div className="workspace-tree-scroll">
                  <ul className="workspace-tree-list" role="tree" aria-label="Mobile file category filters">
                    {categoryTree.length > 0 ? (
                      <li>
                        <button
                          type="button"
                          className={`workspace-tree-row ${workspace.selectedCategoryKey ? "" : "active"}`}
                          onClick={() => workspace.setSelectedCategoryKey("")}
                        >
                          <span className="workspace-tree-icon">
                            <FolderOpenIcon />
                          </span>
                          <span className="workspace-tree-label">All categories</span>
                        </button>
                      </li>
                    ) : null}
                    {categoryTree.map((category) => (
                      <CategoryFilterRow
                        key={category.key}
                        category={category}
                        expandedKeys={expandedCategoryKeys}
                        onSelect={workspace.setSelectedCategoryKey}
                        onToggle={toggleExpandedCategory}
                        selectedKey={workspace.selectedCategoryKey}
                      />
                    ))}
                  </ul>
                </div>
              </section>

              <section className="workspace-section workspace-filter-section">
                <div className="workspace-section-title">Projects</div>
                <div className="workspace-flat-scroll workspace-flat-list" role="tree" aria-label="Mobile file project filters">
                  {fileProjects.length > 0 ? (
                    <button
                      type="button"
                      className={`workspace-tree-row ${workspace.selectedProjectId ? "" : "active"}`}
                      onClick={() => workspace.setSelectedProjectId("")}
                    >
                      <span className="workspace-tree-icon">
                        <FolderIcon />
                      </span>
                      <span className="workspace-tree-label">All projects</span>
                    </button>
                  ) : null}
                  {fileProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      className={`workspace-tree-row ${workspace.selectedProjectId === project.id ? "active" : ""}`}
                      onClick={() => workspace.setSelectedProjectId(project.id)}
                    >
                      <span className="workspace-tree-icon">
                        <FolderIcon />
                      </span>
                      <span className="workspace-tree-label">{project.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="workspace-section workspace-filter-section">
                <div className="workspace-section-title">Labels</div>
                <div className="workspace-tree-scroll">
                  <ul className="workspace-tree-list" role="tree" aria-label="Mobile file label filters">
                    {labelTree.length > 0 ? (
                      <li>
                        <button
                          type="button"
                          className={`workspace-tree-row ${workspace.selectedLabels.length === 0 ? "active" : ""}`.trim()}
                          onClick={() => workspace.clearLabelFilters()}
                        >
                          <span className="workspace-tree-icon">
                            <TagIcon />
                          </span>
                          <span className="workspace-tree-label">All labels</span>
                        </button>
                      </li>
                    ) : null}
                    {labelTree.map((label) => (
                      <LabelFilterRow
                        key={label.id}
                        expandedIds={expandedLabelIds}
                        node={label}
                        onSelect={workspace.toggleLabelFilter}
                        onToggle={toggleExpandedLabel}
                        selectedPaths={workspace.selectedLabels}
                      />
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : null}

      {isMobileDetailOpen && workspace.selectedItem ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsMobileDetailOpen(false)}>
          <section
            className="modal-sheet file-mobile-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-mobile-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="file-mobile-detail-top">
              <div className="file-mobile-title-row">
                <input
                  id="file-mobile-detail-title"
                  value={workspace.coreDraft.title}
                  onChange={(event) => workspace.setCoreDraft((current) => ({ ...current, title: event.target.value }))}
                  aria-label="File title"
                />
                <button className="plain-icon-button" type="button" aria-label="Close file" onClick={() => setIsMobileDetailOpen(false)}>
                  <XIcon />
                </button>
              </div>
              <ItemContextPills
                availableCategories={workspace.availableCategories}
                availableLabels={workspace.availableLabels}
                availableProjects={workspace.availableProjects}
                categoryFallbacks={[]}
                categoryKey={workspace.selectedItem.item.category_key ?? ""}
                emptyProjectLabel="No project"
                itemKind={workspace.selectedItem.item.item_kind ?? ""}
                onSelectCategory={workspace.updateSelectedItemCategory}
                onSelectProject={workspace.replaceSelectedItemProject}
                onToggleLabel={workspace.toggleSelectedItemLabel}
                projectId={workspace.selectedItem.projects?.[0]?.id ?? ""}
                projectTitle={workspace.selectedItem.projects?.[0]?.title ?? ""}
                selectedLabelPaths={selectedLabels}
              />
            </div>

            <div className="file-mobile-preview">
              {isPdfPreview ? (
                <iframe className="file-preview-frame" src={filePreviewUrl} title={`Preview of ${selectedFile?.original_filename ?? "file"}`} />
              ) : isImagePreview ? (
                <img className="file-preview-image" src={filePreviewUrl} alt={selectedFile?.original_filename ?? "Selected file"} />
              ) : (
                <EmptyState title="No preview available" description="PDF and image files render here." />
              )}
            </div>

            <div className="file-mobile-detail-section">
              <h3>Description</h3>
              <textarea
                className="file-description-editor"
                value={workspace.descriptionDraft}
                onChange={(event) => workspace.setDescriptionDraft(event.target.value)}
                placeholder="Describe this image or file."
              />
            </div>

            <div className="file-mobile-detail-section">
              <div className="file-section-head">
                <h3>Links</h3>
                <button
                  className="secondary compact-button"
                  type="button"
                  onClick={() => void workspace.handleSearchLinkCandidates()}
                  disabled={workspace.linking}
                >
                  Search
                </button>
              </div>
              <label className="workspace-search-shell file-link-search">
                <span className="workspace-search-icon">
                  <SearchIcon />
                </span>
                <input
                  className="workspace-search-input"
                  value={workspace.linkQuery}
                  onChange={(event) => workspace.setLinkQuery(event.target.value)}
                  placeholder="Find notes or images"
                />
              </label>
              {workspace.linkCandidates.length > 0 ? (
                <div className="file-link-candidates">
                  {workspace.linkCandidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className="file-link-row"
                      onClick={() => void workspace.handleLinkItem(candidate.id)}
                      disabled={workspace.linking}
                    >
                      <strong>{candidate.title}</strong>
                      <span>{candidate.item_kind}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="file-linked-list">
                {(workspace.selectedItem.related_items ?? []).map((linkedItem) => {
                  const link = linkedLinksByItemId.get(linkedItem.id);
                  return (
                    <div key={linkedItem.id} className="file-linked-row">
                      <div>
                        <strong>{linkedItem.title}</strong>
                        <span>{linkedItem.item_kind}</span>
                      </div>
                      {link ? (
                        <button
                          className="plain-icon-button small"
                          type="button"
                          aria-label={`Unlink ${linkedItem.title}`}
                          onClick={() => void workspace.handleUnlinkItem(link.id)}
                          disabled={workspace.linking}
                        >
                          <XIcon />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                {(workspace.selectedItem.related_items ?? []).length === 0 ? <p className="muted">No linked items yet.</p> : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </ResponsiveContainer>
  );
}
