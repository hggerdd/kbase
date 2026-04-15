import React, { useEffect, useState } from "react";
import { useNotesWorkspace } from "../../features/notes/hooks";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { CreateNotePanel } from "./components/CreateNotePanel";
import { NoteEditor } from "./components/NoteEditor";
import { NotesList } from "./components/NotesList";

export function NotesPage({ externalSearch, externalSearchVersion }) {
  const workspace = useNotesWorkspace({ externalSearch, externalSearchVersion });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("kbase:page-header-meta", {
        detail: { route: "notes", count: workspace.notes.length },
      }),
    );
  }, [workspace.notes.length]);

  useEffect(() => {
    const handleOpenCreate = () => setIsCreateOpen(true);
    window.addEventListener("kbase:notes-create", handleOpenCreate);
    return () => window.removeEventListener("kbase:notes-create", handleOpenCreate);
  }, []);

  async function handleSelectNote(note) {
    const selected = await workspace.handleSelectNote(note, { saveCurrent: true });
    if (selected) {
      setIsMobileEditorOpen(true);
    }
  }

  return (
    <ResponsiveContainer>
      <StatusBanner error={workspace.error} notice={workspace.notice} />

      <div className="notes-layout">
        <NotesList workspace={workspace} onSelectNote={handleSelectNote} />
        <div className={`notes-editor-shell ${isMobileEditorOpen ? "open" : ""}`.trim()}>
          <NoteEditor workspace={workspace} onClose={() => setIsMobileEditorOpen(false)} />
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
