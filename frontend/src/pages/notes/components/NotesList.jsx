import React, { useMemo, useState } from "react";
import { SearchBox } from "../../../shared/ui/SearchBox";
import { Panel } from "../../../shared/ui/Panel";
import { formatDate } from "../../../shared/utils/format";

function NoteRow({ note, isActive, onClick }) {
  return (
    <button className={`note-row ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="note-row-top">
        <strong>{note.title}</strong>
        <span>{note.category_key ?? "uncategorized"}</span>
      </div>
      <div className="note-row-bottom">
        <span>{note.status ?? "draft"}</span>
        <span>{formatDate(note.updated_at, { dateStyle: "medium" })}</span>
      </div>
    </button>
  );
}

function groupNotesByCategory(notes) {
  return notes.reduce((groups, note) => {
    const category = note.category_key ?? "uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(note);
    return groups;
  }, {});
}

export function NotesList({ workspace, onCreateNote }) {
  const [activeTab, setActiveTab] = useState("lists");
  const [activeCategory, setActiveCategory] = useState("all");

  const groupedNotes = useMemo(() => groupNotesByCategory(workspace.notes), [workspace.notes]);
  const orderedCategories = Object.keys(groupedNotes).sort();
  const categoryCounts = orderedCategories.map((category) => ({
    category,
    count: groupedNotes[category].length,
  }));
  const filteredNotes =
    activeCategory === "all" ? workspace.notes : groupedNotes[activeCategory] ?? [];
  const recentHistory = workspace.history.slice(0, 10);

  return (
    <Panel
      eyebrow="Manage notes"
      title="Lists"
      className="panel-sidebar notes-sidebar-panel"
      action={
        <button className="secondary compact-button" type="button" onClick={onCreateNote}>
          Add note
        </button>
      }
    >
      <div className="section-tabs">
        <button
          type="button"
          className={`section-tab ${activeTab === "lists" ? "active" : ""}`}
          onClick={() => setActiveTab("lists")}
        >
          Lists
        </button>
        <button
          type="button"
          className={`section-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      <SearchBox
        buttonLabel="Scan"
        value={workspace.search}
        onChange={workspace.setSearch}
        onSubmit={workspace.handleSearchSubmit}
        placeholder="Search notes, ideas, decisions"
      />

      {activeTab === "lists" ? (
        <div className="notes-sidebar-content">
          <div className="sidebar-section">
            <button
              type="button"
              className={`sidebar-summary-row ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              <span>All notes</span>
              <strong>{workspace.notes.length}</strong>
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Categories</div>
            <div className="sidebar-summary-list">
              {categoryCounts.map(({ category, count }) => (
                <button
                  key={category}
                  type="button"
                  className={`sidebar-summary-row ${activeCategory === category ? "active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <span>{category}</span>
                  <strong>{count}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Labels</div>
            <div className="sidebar-meta-list">
              {workspace.availableLabels.slice(0, 8).map((label) => (
                <div key={label.id} className="sidebar-meta-row">
                  <span>{label.full_path}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Notes</div>
            <div className="note-list">
              {workspace.loading ? <p className="muted">Loading feed...</p> : null}
              {!workspace.loading && filteredNotes.length === 0 ? <p className="muted">No notes found.</p> : null}
              {filteredNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  isActive={note.id === workspace.selectedId}
                  onClick={() => workspace.handleSelectNote(note)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="notes-sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Recent note history</div>
            <div className="timeline">
              {recentHistory.length === 0 ? <p className="muted">Select a note to see its history.</p> : null}
              {recentHistory.map((event) => (
                <div key={event.id} className="history-row">
                  <strong>{event.operation_key}</strong>
                  <span>{formatDate(event.occurred_at, { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Grouped by category</div>
            {orderedCategories.map((category) => (
              <div key={category} className="note-group">
                <div className="note-group-label">{category}</div>
                {groupedNotes[category].slice(0, 3).map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    isActive={note.id === workspace.selectedId}
                    onClick={() => workspace.handleSelectNote(note)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
