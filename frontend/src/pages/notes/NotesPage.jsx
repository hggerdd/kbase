import React, { useState } from "react";
import { useNotesWorkspace } from "../../features/notes/hooks";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { CreateNotePanel } from "./components/CreateNotePanel";
import { NoteEditor } from "./components/NoteEditor";
import { NotesList } from "./components/NotesList";

export function NotesPage({ externalSearch, externalSearchVersion }) {
  const workspace = useNotesWorkspace({ externalSearch, externalSearchVersion });
  const activeNote = workspace.selectedNote?.item;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <ResponsiveContainer>
      <section className="notes-workspace-header">
        <div>
          <h2>{activeNote?.title ?? "Notes"}</h2>
          <p>
            {activeNote
              ? `${activeNote.category_key ?? "note"} · ${activeNote.status ?? "draft"}`
              : "Browse notes on the left and edit the selected note here."}
          </p>
        </div>
        <div className="notes-workspace-actions">
          <div className="notes-workspace-stat">
            <span>Total notes</span>
            <strong>{workspace.notes.length}</strong>
          </div>
          <button className="primary" type="button" onClick={() => setIsCreateOpen(true)}>
            Add note
          </button>
        </div>
      </section>

      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="notes-layout">
        <NotesList workspace={workspace} onCreateNote={() => setIsCreateOpen(true)} />
        <NoteEditor workspace={workspace} />
      </div>

      <CreateNotePanel
        workspace={workspace}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </ResponsiveContainer>
  );
}
