import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchNotes } from "../../features/notes/api.js";
import { fetchProjects } from "../../features/projects/api.js";
import { useNotesWorkspace } from "../../features/notes/hooks";
import { buildCategoryCounts, resolveCategoryCountNotes } from "../../features/notes/state.js";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { FolderIcon, NoteIcon, SearchIcon, TagIcon } from "../../shared/ui/Icons";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatDate } from "../../shared/utils/format";
import { CreateNotePanel } from "../notes/components/CreateNotePanel";
import { NoteEditor } from "../notes/components/NoteEditor";

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTimestamp(value) {
  const time = new Date(value ?? 0).getTime();
  return Number.isNaN(time) ? 0 : time;
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
  const [expandedLabelIds, setExpandedLabelIds] = useState(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [labelQuery, setLabelQuery] = useState("");
  const [categoryCountNotes, setCategoryCountNotes] = useState(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("");
  const [selectedLabelPath, setSelectedLabelPath] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectsState, setProjectsState] = useState({
    error: "",
    loading: true,
    projects: [],
  });

  const noteFilters = useMemo(
    () => ({
      categoryKeys: selectedCategoryKey ? [selectedCategoryKey] : [],
      labelPathPrefixes: selectedLabelPath ? [selectedLabelPath] : [],
      projectId: selectedProjectId || null,
    }),
    [selectedCategoryKey, selectedLabelPath, selectedProjectId],
  );

  const workspace = useNotesWorkspace({
    createProjectId: selectedProjectId || null,
    filters: noteFilters,
  });

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

  const sortedNotes = useMemo(
    () => [...workspace.notes].sort((left, right) => getTimestamp(right.updated_at) - getTimestamp(left.updated_at)),
    [workspace.notes],
  );
  const categoryCountSourceNotes = useMemo(
    () => resolveCategoryCountNotes(selectedCategoryKey, workspace.notes, categoryCountNotes),
    [categoryCountNotes, selectedCategoryKey, workspace.notes],
  );
  const categoryCounts = useMemo(() => buildCategoryCounts(categoryCountSourceNotes), [categoryCountSourceNotes]);
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

  useEffect(() => {
    const nextExpandedIds = new Set();
    const visit = (nodes) => {
      nodes.forEach((node) => {
        nextExpandedIds.add(node.id);
        visit(node.children);
      });
    };
    visit(labelTree);
    setExpandedLabelIds(nextExpandedIds);
  }, [labelTree]);

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

  const activeFilterChips = [
    selectedCategoryKey ? `Category: ${formatLabel(selectedCategoryKey)}` : null,
    selectedProjectId ? `Project: ${activeProject?.title ?? "Selected"}` : null,
    selectedLabelPath ? `Label: ${selectedLabelPath}` : null,
    workspace.search ? `Search: ${workspace.search}` : null,
  ].filter(Boolean);

  return (
    <ResponsiveContainer>
      <StatusBanner error={workspace.error || projectsState.error} notice={workspace.notice} />

      <div className="home-notes-workspace">
        <aside className="workspace-sidebar">
          <section className="workspace-section">
            <div className="workspace-section-heading">Workspace</div>
            <h1>Home</h1>
          </section>

          <section className="workspace-section">
            <div className="workspace-section-title">Search</div>
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
          </section>

          <section className="workspace-section">
            <div className="workspace-section-title">Category</div>
            <div className="workspace-flat-list">
              <button
                type="button"
                className={`workspace-tree-row ${selectedCategoryKey === "" ? "active" : ""}`.trim()}
                onClick={() => setSelectedCategoryKey("")}
              >
                <span className="workspace-tree-icon">
                  <NoteIcon />
                </span>
                <span className="workspace-tree-label">All notes</span>
                <span className="workspace-tree-meta">{categoryCountSourceNotes.length}</span>
              </button>
              {workspace.availableCategories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  className={`workspace-tree-row ${selectedCategoryKey === category.key ? "active" : ""}`.trim()}
                  onClick={() => setSelectedCategoryKey((current) => (current === category.key ? "" : category.key))}
                >
                  <span className="workspace-tree-icon">
                    <NoteIcon />
                  </span>
                  <span className="workspace-tree-label">{category.label || formatLabel(category.key)}</span>
                  <span className="workspace-tree-meta">{categoryCounts.get(category.key) ?? 0}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-section">
            <div className="workspace-section-title">Projects</div>
            <div className="workspace-flat-list">
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

          <section className="workspace-section">
            <div className="workspace-section-title">Labels</div>
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
            {activeFilterChips.length > 0 ? (
              activeFilterChips.map((chip) => (
                <span key={chip} className="workspace-filter-chip">{chip}</span>
              ))
            ) : (
              <>
                <span className="workspace-filter-chip">Recent</span>
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
              categoryLabel: selectedCategoryKey ? formatLabel(selectedCategoryKey) : "All categories",
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
    </ResponsiveContainer>
  );
}
