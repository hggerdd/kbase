import React from "react";
import { formatDuration, formatFileSize } from "../../../shared/utils/format";

export function NoteMetaPanel({ workspace }) {
  const selectedNote = workspace.selectedNote;

  return (
    <div className="meta-grid">
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
    </div>
  );
}
