import React, { useEffect, useMemo, useRef } from "react";
import { Panel } from "../../../shared/ui/Panel";
import { XIcon } from "../../../shared/ui/Icons";
import { formatDate } from "../../../shared/utils/format";

function getTimestamp(value) {
  const time = new Date(value ?? 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function NoteRow({ note, isActive, onClick }) {
  return (
    <button className={`note-row compact-note-row ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="note-row-top">
        <strong title={note.title}>{note.title}</strong>
      </div>
      <div className="note-row-bottom compact-note-meta">
        <span>{note.status ?? "draft"}</span>
        <span>{note.category_key ?? "uncategorized"}</span>
        <span>{formatDate(note.updated_at, { dateStyle: "medium" })}</span>
      </div>
    </button>
  );
}

export function NotesList({ workspace, onSelectNote }) {
  const didMountRef = useRef(false);
  const sortedNotes = useMemo(
    () => [...workspace.notes].sort((left, right) => getTimestamp(right.updated_at) - getTimestamp(left.updated_at)),
    [workspace.notes],
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return undefined;
    }

    const timer = setTimeout(() => {
      void workspace.runSearch(workspace.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [workspace.search]);

  function handleClearSearch() {
    if (workspace.search) {
      workspace.setSearch("");
    }
    void workspace.runSearch("");
  }

  return (
    <Panel className="panel-sidebar notes-sidebar-panel">
      <div className="notes-search-form">
        <label className="notes-search-field">
          <input
            aria-label="Search notes"
            value={workspace.search}
            onChange={(event) => workspace.setSearch(event.target.value)}
            placeholder="Search notes"
          />
        </label>
        <button
          className="secondary icon-button notes-search-button"
          type="button"
          aria-label="Clear note search"
          title="Clear note search"
          onClick={handleClearSearch}
        >
          <XIcon />
        </button>
      </div>

      <div className="note-list compact-note-list">
        {workspace.loading ? <p className="muted">Loading feed...</p> : null}
        {!workspace.loading && sortedNotes.length === 0 ? <p className="muted">No notes found.</p> : null}
        {sortedNotes.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            isActive={note.id === workspace.selectedId}
            onClick={() => onSelectNote(note)}
          />
        ))}
      </div>
    </Panel>
  );
}
