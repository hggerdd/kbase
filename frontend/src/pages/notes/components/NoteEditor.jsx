import React from "react";
import ReactQuill from "react-quill";
import TurndownService from "turndown";
import { NOTE_CATEGORIES } from "../../../features/notes/constants";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Panel } from "../../../shared/ui/Panel";
import { NoteMetaPanel } from "./NoteMetaPanel";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

export function NoteEditor({ workspace }) {
  const activeNote = workspace.selectedNote?.item;

  return (
    <Panel
      eyebrow="Active note"
      title={activeNote?.title ?? "Select a note"}
      className="panel-main"
      action={
        activeNote ? (
          <div className="header-chips">
            <span>{activeNote.category_key ?? "note"}</span>
            <span>{activeNote.status ?? "draft"}</span>
          </div>
        ) : null
      }
    >
      {workspace.selectedNote ? (
        <>
          {workspace.selectedNoteLoading ? (
            <div className="detail-loading-banner">
              <span className="detail-loading-dot" />
              <span>Loading current note...</span>
            </div>
          ) : null}

          <div className="editor-grid">
            <label>
              <span>Title</span>
              <input
                value={workspace.editor.title}
                onChange={(event) => workspace.setEditor({ ...workspace.editor, title: event.target.value })}
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={workspace.editor.category_key}
                onChange={(event) =>
                  workspace.setEditor({ ...workspace.editor, category_key: event.target.value })
                }
              >
                {NOTE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <input
                value={workspace.editor.status}
                onChange={(event) => workspace.setEditor({ ...workspace.editor, status: event.target.value })}
                placeholder="draft, active, archived"
              />
            </label>
          </div>

          <label className="editor-body">
            <span>Rich text body</span>
            <ReactQuill
              theme="snow"
              value={workspace.editor.html_body}
              onChange={(value) =>
                workspace.setEditor({
                  ...workspace.editor,
                  html_body: value,
                  markdown_body: turndown.turndown(value || ""),
                })
              }
            />
          </label>

          <NoteMetaPanel workspace={workspace} />

          <div className="toolbar">
            <button className="primary" type="button" onClick={workspace.handleSaveSelected} disabled={workspace.saving}>
              {workspace.saving ? "Saving..." : "Save note"}
            </button>
            <span className="muted">Item ID: {workspace.selectedNote.item.id}</span>
          </div>
        </>
      ) : (
        <EmptyState
          title="No note selected"
          description="Pick a note from the list or create a new one to start documenting structured knowledge."
        />
      )}
    </Panel>
  );
}
