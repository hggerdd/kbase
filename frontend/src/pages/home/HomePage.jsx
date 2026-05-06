import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchNotes } from "../../features/notes/api.js";
import { buildCategoryTree, collectCategoryKeys } from "../../features/categories/state.js";
import { fetchProjects } from "../../features/projects/api.js";
import { fetchUserPreference, saveUserPreference } from "../../features/preferences/api.js";
import { useNotesWorkspace } from "../../features/notes/hooks";
import {
  buildCategoryCounts,
  DEFAULT_NOTE_SORT_MODE,
  normalizeNoteSortMode,
  resolveCategoryCountNotes,
  sortWorkspaceNotes,
} from "../../features/notes/state.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { FilterIcon, FolderIcon, NoteIcon, SearchIcon, TagIcon } from "../../shared/ui/Icons";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatDate } from "../../shared/utils/format";
import { CreateNotePanel } from "../notes/components/CreateNotePanel";
import { NoteEditor } from "../notes/components/NoteEditor";

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const NOTE_SORT_OPTIONS = [
  { value: "recent", label: "Recent (last changed)" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "created_on", label: "Created on" },
];
const NOTE_SORT_PREFERENCE_KEY = "notes.home.sort_order";

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

function countCategorySubtree(category, counts) {
  const ownCount = counts.get(category.key) ?? 0;
  return ownCount + category.children.reduce((total, child) => total + countCategorySubtree(child, counts), 0);
}

function collectLabelIds(nodes) {
  return nodes.flatMap((node) => [node.id, ...collectLabelIds(node.children)]);
}

function CategoryTreeRow({ category, counts, expandedKeys, onSelect, onToggle, selectedKey }) {
  const hasChildren = category.children.length > 0;
  const isExpanded = expandedKeys.has(category.key);
  const isSelected = selectedKey === category.key;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <button
        type="button"
        className={`workspace-tree-row ${isSelected ? "active" : ""}`.trim()}
        onClick={() => onSelect(category)}
      >
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
          <NoteIcon />
        </span>
        <span className="workspace-tree-label">{category.label || formatLabel(category.key)}</span>
        <span className="workspace-tree-meta">{countCategorySubtree(category, counts)}</span>
      </button>
      {hasChildren && isExpanded ? (
        <ul className="workspace-tree-list nested" role="group">
          {category.children.map((child) => (
            <CategoryTreeRow
              key={child.key}
              category={child}
              counts={counts}
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

function LabelTreeRow({ expandedIds, node, onSelect, onToggle, selectedPath }) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedPath === node.full_path;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <button
        type="button"
        className={`workspace-tree-row ${isSelected ? "active" : ""}`.trim()}
        onClick={() => onSelect(node.full_path)}
      >
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
            <LabelTreeRow
              key={child.id}
              expandedIds={expandedIds}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function NoteCard({ isActive, note, onClick }) {
  return (
    <button type="button" className={`workspace-note-card ${isActive ? "active" : ""}`.trim()} onClick={onClick}>
      <strong>{note.title}</strong>
      <span>
        {formatLabel(note.status ?? "draft")} · {formatLabel(note.category_key ?? "uncategorized")}
      </span>
      <span>{formatDate(note.updated_at, { dateStyle: "medium" })}</span>
    </button>
  );
}

export function HomePage() {
  const didSearchMountRef = useRef(false);
  const categoryExpansionInitializedRef = useRef(false);
  const labelExpansionInitializedRef = useRef(false);
  const hasUserChosenSortRef = useRef(false);
  const sortMenuRef = useRef(null);
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState(new Set());
  const [expandedLabelIds, setExpandedLabelIds] = useState(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [labelQuery, setLabelQuery] = useState("");
  const [noteSortMode, setNoteSortMode] = useState(DEFAULT_NOTE_SORT_MODE);
  const [categoryCountNotes, setCategoryCountNotes] = useState(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("");
  const [selectedCategoryPath, setSelectedCategoryPath] = useState("");
  const [selectedLabelPath, setSelectedLabelPath] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectsState, setProjectsState] = useState({
    error: "",
    loading: true,
    projects: [],
  });

  const noteFilters = useMemo(
    () => ({
      categoryPathPrefixes: selectedCategoryPath ? [selectedCategoryPath] : [],
      labelPathPrefixes: selectedLabelPath ? [selectedLabelPath] : [],
      projectId: selectedProjectId || null,
    }),
    [selectedCategoryPath, selectedLabelPath, selectedProjectId],
  );

  const workspace = useNotesWorkspace({
    createProjectId: selectedProjectId || null,
    filters: noteFilters,
  });
  const selectedCategory = workspace.availableCategories.find((category) => category.key === selectedCategoryKey) ?? null;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("kbase:page-header-meta", {
        detail: { route: "home", count: workspace.notes.length },
      }),
    );
  }, [workspace.notes.length]);

  useEffect(() => {
    function handleOpenCreate() {
      setIsCreateOpen(true);
    }

    window.addEventListener("kbase:notes-create", handleOpenCreate);
    return () => window.removeEventListener("kbase:notes-create", handleOpenCreate);
  }, []);

  useEffect(() => {
    if (!didSearchMountRef.current) {
      didSearchMountRef.current = true;
      return undefined;
    }

    const timer = setTimeout(() => {
      void workspace.runSearch(workspace.search);
    }, 350);

    return () => clearTimeout(timer);
  }, [workspace.search]);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const projects = await fetchProjects({ limit: 200 });
        if (!active) {
          return;
        }
        setProjectsState({ error: "", loading: false, projects });
      } catch (error) {
        if (!active) {
          return;
        }
        setProjectsState({ error: error.message, loading: false, projects: [] });
      }
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSortPreference() {
      try {
        const preference = await fetchUserPreference(NOTE_SORT_PREFERENCE_KEY);
        if (!active || hasUserChosenSortRef.current || !preference?.is_set) {
          return;
        }
        setNoteSortMode(normalizeNoteSortMode(preference.value));
      } catch {
        // Ignore preference bootstrap errors and keep the default order.
      }
    }

    void loadSortPreference();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryKey) {
      setCategoryCountNotes(null);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const items = await fetchNotes(workspace.search, {
            labelPathPrefixes: selectedLabelPath ? [selectedLabelPath] : [],
            projectId: selectedProjectId || null,
          });
          if (active) {
            setCategoryCountNotes(items);
          }
        } catch {
          if (active) {
            setCategoryCountNotes(null);
          }
        }
      })();
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedCategoryKey, selectedLabelPath, selectedProjectId, workspace.search]);

  const sortedNotes = useMemo(() => sortWorkspaceNotes(workspace.notes, noteSortMode), [noteSortMode, workspace.notes]);
  const categoryCountSourceNotes = useMemo(
    () => resolveCategoryCountNotes(selectedCategoryKey, workspace.notes, categoryCountNotes),
    [categoryCountNotes, selectedCategoryKey, workspace.notes],
  );
  const categoryCounts = useMemo(() => buildCategoryCounts(categoryCountSourceNotes), [categoryCountSourceNotes]);
  const categoryTree = useMemo(() => buildCategoryTree(workspace.availableCategories), [workspace.availableCategories]);
  const categoryKeys = useMemo(() => collectCategoryKeys(categoryTree), [categoryTree]);
  const activeProject = projectsState.projects.find((project) => project.id === selectedProjectId) ?? null;
  const visibleLabels = useMemo(() => {
    const normalizedQuery = labelQuery.trim().toLowerCase();
    return workspace.availableLabels.filter((label) => {
      if (!label.is_active) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return label.full_path.toLowerCase().includes(normalizedQuery);
    });
  }, [labelQuery, workspace.availableLabels]);
  const labelTree = useMemo(() => buildLabelTree(visibleLabels), [visibleLabels]);
  const labelIds = useMemo(() => collectLabelIds(labelTree), [labelTree]);

  useEffect(() => {
    const availableKeys = new Set(categoryKeys);
    setExpandedCategoryKeys((current) => {
      if (!categoryExpansionInitializedRef.current) {
        categoryExpansionInitializedRef.current = true;
        return new Set(categoryKeys);
      }
      return new Set([...current].filter((key) => availableKeys.has(key)));
    });
  }, [categoryKeys]);

  useEffect(() => {
    const availableIds = new Set(labelIds);
    setExpandedLabelIds((current) => {
      if (!labelExpansionInitializedRef.current) {
        labelExpansionInitializedRef.current = true;
        return new Set(labelIds);
      }
      return new Set([...current].filter((id) => availableIds.has(id)));
    });
  }, [labelIds]);

  useEffect(() => {
    if (!isSortMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setIsSortMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isSortMenuOpen]);

  async function handleSelectNote(note) {
    const selected = await workspace.handleSelectNote(note, { saveCurrent: true });
    if (selected) {
      setIsMobileEditorOpen(true);
    }
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

  function expandAllCategories() {
    setExpandedCategoryKeys(new Set(categoryKeys));
  }

  function collapseAllCategories() {
    setExpandedCategoryKeys(new Set());
  }

  function expandAllLabels() {
    setExpandedLabelIds(new Set(labelIds));
  }

  function collapseAllLabels() {
    setExpandedLabelIds(new Set());
  }

  function handleSelectSortMode(nextSortMode) {
    const normalizedSortMode = normalizeNoteSortMode(nextSortMode);
    hasUserChosenSortRef.current = true;
    setNoteSortMode(normalizedSortMode);
    setIsSortMenuOpen(false);
    void saveUserPreference(NOTE_SORT_PREFERENCE_KEY, normalizedSortMode).catch(() => {});
  }

  const activeFilterChips = [
    selectedCategory ? `Category: ${selectedCategory.label || formatLabel(selectedCategory.key)}` : null,
    selectedProjectId ? `Project: ${activeProject?.title ?? "Selected"}` : null,
    selectedLabelPath ? `Label: ${selectedLabelPath}` : null,
    workspace.search ? `Search: ${workspace.search}` : null,
  ].filter(Boolean);
  const normalizedNoteSortMode = normalizeNoteSortMode(noteSortMode);
  const selectedSortOption =
    NOTE_SORT_OPTIONS.find((option) => option.value === normalizedNoteSortMode) ?? NOTE_SORT_OPTIONS[0];

  return (
    <ResponsiveContainer>
      <StatusBanner error={workspace.error || projectsState.error} notice={workspace.notice} />

      <div className="home-notes-workspace">
        <aside className="workspace-sidebar">
          <section className="workspace-section file-workspace-heading">
            <div className="workspace-section-heading">Workspace</div>
            <h1>Home</h1>
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
                  aria-label="Search notes"
                  value={workspace.search}
                  onChange={(event) => workspace.setSearch(event.target.value)}
                  placeholder="Search notes, projects, labels..."
                />
              </label>
              <button
                className="file-mobile-advanced-button"
                type="button"
                aria-label="Advanced note filters"
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
              <div className="workspace-tree-tools">
                <button type="button" className="workspace-tree-action" aria-label="Expand all categories" title="Expand all categories" onClick={expandAllCategories}>
                  +
                </button>
                <button type="button" className="workspace-tree-action" aria-label="Collapse all categories" title="Collapse all categories" onClick={collapseAllCategories}>
                  -
                </button>
              </div>
            </div>
            <div className="workspace-tree-scroll">
              <ul className="workspace-tree-list" role="tree" aria-label="Category filters">
                <li>
                  <button
                    type="button"
                    className={`workspace-tree-row ${selectedCategoryKey === "" ? "active" : ""}`.trim()}
                    onClick={() => {
                      setSelectedCategoryKey("");
                      setSelectedCategoryPath("");
                    }}
                  >
                    <span className="workspace-tree-icon">
                      <NoteIcon />
                    </span>
                    <span className="workspace-tree-label">All notes</span>
                    <span className="workspace-tree-meta">{categoryCountSourceNotes.length}</span>
                  </button>
                </li>
                {categoryTree.map((category) => (
                  <CategoryTreeRow
                    key={category.key}
                    category={category}
                    counts={categoryCounts}
                    expandedKeys={expandedCategoryKeys}
                    onSelect={(entry) => {
                      const isCurrent = selectedCategoryKey === entry.key;
                      setSelectedCategoryKey(isCurrent ? "" : entry.key);
                      setSelectedCategoryPath(isCurrent ? "" : entry.full_path);
                    }}
                    onToggle={toggleExpandedCategory}
                    selectedKey={selectedCategoryKey}
                  />
                ))}
              </ul>
            </div>
          </section>

          <section className="workspace-section workspace-filter-section file-advanced-filter">
            <div className="workspace-section-head">
              <div className="workspace-section-title">Projects</div>
            </div>
            <div className="workspace-flat-scroll workspace-flat-list">
              <button
                type="button"
                className={`workspace-tree-row ${selectedProjectId === "" ? "active" : ""}`.trim()}
                onClick={() => setSelectedProjectId("")}
              >
                <span className="workspace-tree-icon">
                  <FolderIcon />
                </span>
                <span className="workspace-tree-label">All projects</span>
              </button>
              {projectsState.loading ? <p className="muted">Loading projects...</p> : null}
              {projectsState.projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`workspace-tree-row ${selectedProjectId === project.id ? "active" : ""}`.trim()}
                  onClick={() => setSelectedProjectId((current) => (current === project.id ? "" : project.id))}
                >
                  <span className="workspace-tree-icon">
                    <FolderIcon />
                  </span>
                  <span className="workspace-tree-label">{project.title}</span>
                  <span className="workspace-tree-meta">{formatLabel(project.status ?? "active")}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-section workspace-filter-section file-advanced-filter">
            <div className="workspace-section-head">
              <div className="workspace-section-title">Labels</div>
              <div className="workspace-tree-tools">
                <button type="button" className="workspace-tree-action" aria-label="Expand all labels" title="Expand all labels" onClick={expandAllLabels}>
                  +
                </button>
                <button type="button" className="workspace-tree-action" aria-label="Collapse all labels" title="Collapse all labels" onClick={collapseAllLabels}>
                  -
                </button>
              </div>
            </div>
            <label className="workspace-search-shell">
              <span className="workspace-search-icon">
                <SearchIcon />
              </span>
              <input
                className="workspace-search-input"
                aria-label="Search labels"
                value={labelQuery}
                onChange={(event) => setLabelQuery(event.target.value)}
                placeholder="Search labels..."
              />
            </label>
            <div className="workspace-tree-scroll">
              <ul className="workspace-tree-list" role="tree" aria-label="Label filters">
                <li>
                  <button
                    type="button"
                    className={`workspace-tree-row ${selectedLabelPath === "" ? "active" : ""}`.trim()}
                    onClick={() => setSelectedLabelPath("")}
                  >
                    <span className="workspace-tree-icon">
                      <TagIcon />
                    </span>
                    <span className="workspace-tree-label">All labels</span>
                  </button>
                </li>
                {labelTree.map((node) => (
                  <LabelTreeRow
                    key={node.id}
                    expandedIds={expandedLabelIds}
                    node={node}
                    onSelect={(labelPath) =>
                      setSelectedLabelPath((current) => (current === labelPath ? "" : labelPath))
                    }
                    onToggle={toggleExpandedLabel}
                    selectedPath={selectedLabelPath}
                  />
                ))}
              </ul>
            </div>
          </section>
        </aside>

        <section className="workspace-results-column">
          <header className="workspace-results-header">
            <div>
              <strong>Notes</strong>
              <span>{sortedNotes.length} selected results</span>
            </div>
          </header>

          <div className="workspace-filter-chips">
            <div className="workspace-sort-control" ref={sortMenuRef}>
              <button
                type="button"
                className="workspace-filter-chip workspace-filter-chip-button"
                aria-haspopup="menu"
                aria-expanded={isSortMenuOpen}
                onClick={() => setIsSortMenuOpen((current) => !current)}
              >
                {selectedSortOption.label}
              </button>
              {isSortMenuOpen ? (
                <div className="workspace-sort-menu" role="menu" aria-label="Notes order options">
                  {NOTE_SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={normalizedNoteSortMode === option.value}
                      className={`workspace-sort-option ${normalizedNoteSortMode === option.value ? "active" : ""}`.trim()}
                      onClick={() => handleSelectSortMode(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {activeFilterChips.length > 0 ? (
              activeFilterChips.map((chip) => (
                <span key={chip} className="workspace-filter-chip">{chip}</span>
              ))
            ) : (
              <>
                <span className="workspace-filter-chip">Active workspace</span>
                <span className="workspace-filter-chip">All notes</span>
              </>
            )}
          </div>

          <div className="workspace-note-list">
            {workspace.loading ? <p className="muted">Loading notes...</p> : null}
            {!workspace.loading && sortedNotes.length === 0 ? <p className="muted">No notes found.</p> : null}
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                isActive={note.id === workspace.selectedId}
                note={note}
                onClick={() => handleSelectNote(note)}
              />
            ))}
          </div>
        </section>

        <div className={`notes-editor-shell workspace-editor-shell ${isMobileEditorOpen ? "open" : ""}`.trim()}>
          <NoteEditor
            workspace={workspace}
            onClose={() => setIsMobileEditorOpen(false)}
            onOpenCreate={() => setIsCreateOpen(true)}
            workspaceSummary={{
              categoryLabel: selectedCategory ? selectedCategory.label || formatLabel(selectedCategory.key) : "All categories",
              projectLabel: activeProject?.title ?? "All projects",
              labelPath: selectedLabelPath,
            }}
          />
        </div>
      </div>

      <CreateNotePanel
        workspace={workspace}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {isAdvancedModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsAdvancedModalOpen(false)}>
          <section
            className="modal-sheet file-mobile-advanced-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-advanced-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header file-mobile-sticky-header">
              <h2 id="home-advanced-title">Advanced</h2>
              <button className="primary compact-button" type="button" onClick={() => setIsAdvancedModalOpen(false)}>
                Apply
              </button>
            </div>
            <div className="file-mobile-filter-stack">
              <section className="workspace-section workspace-filter-section">
                <div className="workspace-section-head">
                  <div className="workspace-section-title">Category</div>
                  <div className="workspace-tree-tools">
                    <button type="button" className="workspace-tree-action" aria-label="Expand all categories" title="Expand all categories" onClick={expandAllCategories}>
                      +
                    </button>
                    <button type="button" className="workspace-tree-action" aria-label="Collapse all categories" title="Collapse all categories" onClick={collapseAllCategories}>
                      -
                    </button>
                  </div>
                </div>
                <div className="workspace-tree-scroll">
                  <ul className="workspace-tree-list" role="tree" aria-label="Mobile note category filters">
                    <li>
                      <button
                        type="button"
                        className={`workspace-tree-row ${selectedCategoryKey === "" ? "active" : ""}`.trim()}
                        onClick={() => {
                          setSelectedCategoryKey("");
                          setSelectedCategoryPath("");
                        }}
                      >
                        <span className="workspace-tree-icon">
                          <NoteIcon />
                        </span>
                        <span className="workspace-tree-label">All notes</span>
                        <span className="workspace-tree-meta">{categoryCountSourceNotes.length}</span>
                      </button>
                    </li>
                    {categoryTree.map((category) => (
                      <CategoryTreeRow
                        key={category.key}
                        category={category}
                        counts={categoryCounts}
                        expandedKeys={expandedCategoryKeys}
                        onSelect={(entry) => {
                          const isCurrent = selectedCategoryKey === entry.key;
                          setSelectedCategoryKey(isCurrent ? "" : entry.key);
                          setSelectedCategoryPath(isCurrent ? "" : entry.full_path);
                        }}
                        onToggle={toggleExpandedCategory}
                        selectedKey={selectedCategoryKey}
                      />
                    ))}
                  </ul>
                </div>
              </section>

              <section className="workspace-section workspace-filter-section">
                <div className="workspace-section-title">Projects</div>
                <div className="workspace-flat-scroll workspace-flat-list">
                  <button
                    type="button"
                    className={`workspace-tree-row ${selectedProjectId === "" ? "active" : ""}`.trim()}
                    onClick={() => setSelectedProjectId("")}
                  >
                    <span className="workspace-tree-icon">
                      <FolderIcon />
                    </span>
                    <span className="workspace-tree-label">All projects</span>
                  </button>
                  {projectsState.loading ? <p className="muted">Loading projects...</p> : null}
                  {projectsState.projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      className={`workspace-tree-row ${selectedProjectId === project.id ? "active" : ""}`.trim()}
                      onClick={() => setSelectedProjectId((current) => (current === project.id ? "" : project.id))}
                    >
                      <span className="workspace-tree-icon">
                        <FolderIcon />
                      </span>
                      <span className="workspace-tree-label">{project.title}</span>
                      <span className="workspace-tree-meta">{formatLabel(project.status ?? "active")}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="workspace-section workspace-filter-section">
                <div className="workspace-section-head">
                  <div className="workspace-section-title">Labels</div>
                  <div className="workspace-tree-tools">
                    <button type="button" className="workspace-tree-action" aria-label="Expand all labels" title="Expand all labels" onClick={expandAllLabels}>
                      +
                    </button>
                    <button type="button" className="workspace-tree-action" aria-label="Collapse all labels" title="Collapse all labels" onClick={collapseAllLabels}>
                      -
                    </button>
                  </div>
                </div>
                <label className="workspace-search-shell">
                  <span className="workspace-search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    className="workspace-search-input"
                    aria-label="Search labels"
                    value={labelQuery}
                    onChange={(event) => setLabelQuery(event.target.value)}
                    placeholder="Search labels..."
                  />
                </label>
                <div className="workspace-tree-scroll">
                  <ul className="workspace-tree-list" role="tree" aria-label="Mobile note label filters">
                    <li>
                      <button
                        type="button"
                        className={`workspace-tree-row ${selectedLabelPath === "" ? "active" : ""}`.trim()}
                        onClick={() => setSelectedLabelPath("")}
                      >
                        <span className="workspace-tree-icon">
                          <TagIcon />
                        </span>
                        <span className="workspace-tree-label">All labels</span>
                      </button>
                    </li>
                    {labelTree.map((node) => (
                      <LabelTreeRow
                        key={node.id}
                        expandedIds={expandedLabelIds}
                        node={node}
                        onSelect={(labelPath) =>
                          setSelectedLabelPath((current) => (current === labelPath ? "" : labelPath))
                        }
                        onToggle={toggleExpandedLabel}
                        selectedPath={selectedLabelPath}
                      />
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </ResponsiveContainer>
  );
}
