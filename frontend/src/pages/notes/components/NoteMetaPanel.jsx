import React from "react";
import { formatDate, formatDuration, formatFileSize } from "../../../shared/utils/format";

export function NoteMetaPanel({ workspace }) {
  const labelSuggestions = workspace.availableLabels.slice(0, 18);
  const selectedNote = workspace.selectedNote;

  return (
    <div className="meta-grid">
      <div className="mini-panel">
        <h3>Labels</h3>
        <div className="token-list">
          {selectedNote.labels.length > 0 ? (
            selectedNote.labels.map((label) => <span key={label.id}>{label.full_path}</span>)
          ) : (
            <p className="muted">No labels</p>
          )}
        </div>
        <label className="label-input">
          <span>Add new labels</span>
          <input
            value={workspace.editor.label_paths}
            onChange={(event) => workspace.setEditor({ ...workspace.editor, label_paths: event.target.value })}
            placeholder="new/label, another/path"
          />
        </label>
        <div className="token-list selectable">
          {labelSuggestions.map((label) => (
            <button
              key={label.id}
              type="button"
              className={`token ${workspace.editor.selected_labels.includes(label.full_path) ? "active" : ""}`}
              onClick={() => workspace.toggleEditorLabel(label.full_path)}
            >
              {label.full_path}
            </button>
          ))}
        </div>
      </div>

      <div className="mini-panel">
        <h3>Files and links</h3>
        <ul className="timeline">
          {selectedNote.files.length > 0 ? (
            selectedNote.files.map((file) => (
              <li key={file.id}>
                <strong>{file.original_filename ?? file.relative_path}</strong>
                <span>{formatFileSize(file.size_bytes)} · {file.file_role}</span>
              </li>
            ))
          ) : selectedNote.related_items.length > 0 ? (
            selectedNote.related_items.map((linkedItem) => (
              <li key={linkedItem.id}>
                <strong>{linkedItem.title}</strong>
                <span>{linkedItem.category_key ?? linkedItem.item_kind}</span>
              </li>
            ))
          ) : (
            <li>
              <span>No linked files yet</span>
            </li>
          )}
        </ul>
        <form className="upload-form" onSubmit={workspace.handleUploadAttachment}>
          <input
            type="file"
            onChange={(event) => workspace.setAttachmentFile(event.target.files?.[0] ?? null)}
          />
          {workspace.uploading ? (
            <div className="upload-progress" aria-live="polite">
              <div className="upload-progress-track">
                <div className="upload-progress-bar" style={{ width: `${workspace.uploadProgress?.percent ?? 0}%` }} />
              </div>
              <span>{workspace.uploadProgress?.percent ?? 0}%</span>
              <span className="muted">
                {workspace.uploadProgress?.bytesPerSecond
                  ? `${formatFileSize(workspace.uploadProgress.bytesPerSecond)}/s`
                  : "starting"}
              </span>
              <span className="muted">{formatDuration(workspace.uploadProgress?.etaSeconds)}</span>
            </div>
          ) : null}
          <button className="primary" type="submit" disabled={!workspace.attachmentFile || workspace.uploading}>
            {workspace.uploading ? "Uploading..." : "Attach file item"}
          </button>
        </form>
      </div>

      <div className="mini-panel">
        <h3>History</h3>
        <ul className="timeline">
          {workspace.history.length > 0 ? (
            workspace.history.slice(0, 6).map((event) => (
              <li key={event.id}>
                <strong>{event.operation_key}</strong>
                <span>{formatDate(event.occurred_at, { dateStyle: "medium", timeStyle: "short" })}</span>
              </li>
            ))
          ) : (
            <li>
              <span>No history available yet</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
