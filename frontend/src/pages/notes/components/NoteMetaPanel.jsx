import React, { useEffect, useState } from "react";
import { getFileContentUrl } from "../../../features/files/api.js";
import { ImageFileIcon, NoteIcon, PdfFileIcon, TextFileIcon } from "../../../shared/ui/Icons";
import { formatDuration, formatFileSize } from "../../../shared/utils/format";

const LINK_MODAL_CONFIG = {
  image: {
    actionLabel: "Add image",
    emptyLabel: "No matching images found.",
    helperLabel: "Search images or pick from recent uploads.",
    itemKind: "image",
    linkType: "attachment",
    linkTypeLabel: "Attachment",
    searchPlaceholder: "Search images...",
    title: "Link image",
  },
  note: {
    actionLabel: "Add note",
    emptyLabel: "No matching notes found.",
    helperLabel: "Search notes or pick from recent ones.",
    itemKind: "note",
    linkType: "related",
    linkTypeLabel: "Related",
    searchPlaceholder: "Search notes...",
    title: "Link note",
  },
};

function useBodyScrollLock(enabled) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);
}

function isImageFile(file) {
  const filename = String(file?.original_filename ?? file?.relative_path ?? "").toLowerCase();
  const mimeType = String(file?.mime_type ?? "").toLowerCase();
  return (
    mimeType.startsWith("image/") ||
    filename.endsWith(".png") ||
    filename.endsWith(".jpg") ||
    filename.endsWith(".jpeg") ||
    filename.endsWith(".gif") ||
    filename.endsWith(".webp")
  );
}

function isPdfFile(file) {
  const filename = String(file?.original_filename ?? file?.relative_path ?? "").toLowerCase();
  const mimeType = String(file?.mime_type ?? "").toLowerCase();
  return mimeType.includes("pdf") || filename.endsWith(".pdf");
}

function getFileCardKind(file) {
  if (isImageFile(file)) {
    return "image";
  }
  if (isPdfFile(file)) {
    return "pdf";
  }
  return "generic";
}

function isPreviewableRelatedItem(item) {
  return item?.item_kind !== "note";
}

function FilePreviewTile({ file, itemId }) {
  const contentUrl = getFileContentUrl(itemId, file.id);
  const cardKind = getFileCardKind(file);

  if (cardKind === "image") {
    return <img className="linked-file-thumb" src={contentUrl} alt={file.original_filename ?? "Attachment preview"} />;
  }

  if (cardKind === "pdf") {
    return (
      <div className="linked-file-thumb linked-file-thumb-pdf" aria-hidden="true">
        <iframe src={contentUrl} title="" tabIndex={-1} />
        <div className="linked-file-thumb-overlay">
          <span className="linked-file-thumb-badge"><PdfFileIcon />PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className="linked-file-thumb linked-file-thumb-generic" aria-hidden="true">
      <TextFileIcon />
    </div>
  );
}

function LinkItemModal({ mode, workspace, onClose }) {
  const config = LINK_MODAL_CONFIG[mode];
  const [query, setQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  useBodyScrollLock(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void workspace.handleSearchLinkCandidates({
        itemKinds: [config.itemKind],
        limit: 10,
        query,
      });
    }, query.trim() ? 140 : 0);

    return () => clearTimeout(timeoutId);
  }, [config.itemKind, query]);

  useEffect(() => {
    if (workspace.linkCandidateResults.some((item) => item.id === selectedItemId)) {
      return;
    }
    setSelectedItemId(workspace.linkCandidateResults[0]?.id ?? "");
  }, [selectedItemId, workspace.linkCandidateResults]);

  async function handleApply() {
    if (!selectedItemId) {
      return;
    }

    const linked = await workspace.handleLinkExistingItem(selectedItemId, {
      linkType: config.linkType,
    });
    if (linked) {
      setSelectedItemId("");
      void workspace.handleSearchLinkCandidates({
        itemKinds: [config.itemKind],
        limit: 10,
        query,
      });
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet note-link-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-link-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="note-link-modal-title">{config.title}</h2>
            <p>{config.helperLabel}</p>
          </div>
          <div className="note-link-type-chip">
            <span>Link type</span>
            <strong>{config.linkTypeLabel}</strong>
          </div>
        </div>

        <div className="note-link-modal-search">
          <label>
            <span>Search</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={config.searchPlaceholder}
            />
          </label>
          <span className="note-link-modal-status">
            {workspace.linkSearchLoading ? "Searching..." : query.trim() ? "Results" : "Recent items"}
          </span>
        </div>

        <div className="note-link-modal-list">
          {workspace.linkCandidateResults.length === 0 ? (
            <div className="note-link-empty-state">
              <strong>Nothing to add</strong>
              <p>{config.emptyLabel}</p>
            </div>
          ) : (
            <div className="stack-list">
              {workspace.linkCandidateResults.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`stack-card note-link-result ${isSelected ? "active" : ""}`.trim()}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.category_key ?? item.item_kind}</p>
                    </div>
                    <span>{isSelected ? "Selected" : item.item_kind}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onClose}>
            Schliessen
          </button>
          <button
            className="primary"
            type="button"
            disabled={!selectedItemId || workspace.linking}
            onClick={() => void handleApply()}
          >
            {workspace.linking ? "Verknuepfe..." : "Uebernehmen"}
          </button>
        </div>
      </section>
    </div>
  );
}

function LinkedNoteModal({ preview, onClose }) {
  const { detail, error, loading, note, renderedBody } = preview;
  useBodyScrollLock(true);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet linked-note-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="linked-note-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Linked note</p>
            <h2 id="linked-note-modal-title">{note.title}</h2>
          </div>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="linked-note-modal-meta">
          <span className="linked-kind-pill"><NoteIcon />Note</span>
          <span>{note.category_key ?? note.item_kind}</span>
        </div>

        <div className="linked-note-modal-body">
          {loading ? <p className="muted">Loading note...</p> : null}
          {error ? <p className="error">{error}</p> : null}
          {!loading && !error ? (
            renderedBody ? (
              <div className="rich-markdown linked-note-render" dangerouslySetInnerHTML={{ __html: renderedBody }} />
            ) : (
              <p className="muted">This note has no stored body yet.</p>
            )
          ) : null}
        </div>

        {!loading && detail?.labels?.length ? (
          <div className="token-list">
            {detail.labels.map((label) => (
              <span key={label.id}>{label.full_path}</span>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function LinkedFileModal({ file, itemId, onClose }) {
  const contentUrl = getFileContentUrl(itemId, file.id);
  const cardKind = getFileCardKind(file);
  useBodyScrollLock(true);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet linked-file-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="linked-file-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Linked file</p>
            <h2 id="linked-file-modal-title">{file.original_filename ?? file.relative_path}</h2>
          </div>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="linked-file-modal-meta">
          <span className="linked-kind-pill">
            {cardKind === "pdf" ? <PdfFileIcon /> : cardKind === "image" ? <ImageFileIcon /> : <TextFileIcon />}
            {cardKind}
          </span>
          <span>{formatFileSize(file.size_bytes)}</span>
          <span>{file.file_role}</span>
        </div>

        <div className="linked-file-modal-body">
          {cardKind === "image" ? (
            <img className="linked-file-modal-image" src={contentUrl} alt={file.original_filename ?? "Linked file"} />
          ) : cardKind === "pdf" ? (
            <iframe className="linked-file-modal-frame" src={contentUrl} title={file.original_filename ?? "Linked PDF"} />
          ) : (
            <p className="muted">Preview is currently available for images and PDF files.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function NoteMetaPanel({ workspace }) {
  const selectedNote = workspace.selectedNote;
  const [activeModal, setActiveModal] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const linkedTypeByItemId = new Map(
    (selectedNote?.outgoing_links ?? []).map((link) => [link.to_item_id, link.link_type]),
  );
  const files = selectedNote?.files ?? [];
  const relatedItems = selectedNote?.related_items ?? [];
  const relatedNotes = relatedItems.filter((item) => item.item_kind === "note");
  const relatedFiles = relatedItems.filter((item) => isPreviewableRelatedItem(item));
  const hasLinks = files.length > 0 || relatedItems.length > 0;
  const selectedItemId = selectedNote?.item?.id ?? "";

  return (
    <>
      <div className="meta-grid">
        <div className="mini-panel">
          <div className="mini-panel-header">
            <h3>Files and links</h3>
            <div className="compact-actions">
              <button className="secondary compact-button" type="button" onClick={() => setActiveModal("note")}>
                {LINK_MODAL_CONFIG.note.actionLabel}
              </button>
              <button className="secondary compact-button" type="button" onClick={() => setActiveModal("image")}>
                {LINK_MODAL_CONFIG.image.actionLabel}
              </button>
            </div>
          </div>
          <ul className="timeline linked-resource-list">
            {files.map((file) => {
              const canPreview = isImageFile(file) || isPdfFile(file);
              const body = (
                <>
                  <FilePreviewTile file={file} itemId={selectedItemId} />
                  <div className="linked-resource-copy">
                    <strong>{file.original_filename ?? file.relative_path}</strong>
                    <span>{formatFileSize(file.size_bytes)} · {file.file_role}</span>
                  </div>
                </>
              );

              return (
                <li key={file.id}>
                  {canPreview ? (
                    <button
                      type="button"
                      className="linked-resource-card linked-file-card interactive"
                      onClick={() => setPreviewFile({ file, itemId: selectedItemId })}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="linked-resource-card linked-file-card">{body}</div>
                  )}
                </li>
              );
            })}
            {relatedFiles.map((linkedItem) => {
              const detail = workspace.linkedFileDetails[linkedItem.id];
              const linkedFile = detail?.files?.[0] ?? null;
              const canPreview = Boolean(linkedFile) && (isImageFile(linkedFile) || isPdfFile(linkedFile));
              const body = (
                <>
                  {linkedFile ? (
                    <FilePreviewTile file={linkedFile} itemId={linkedItem.id} />
                  ) : (
                    <div className="linked-file-thumb linked-file-thumb-generic" aria-hidden="true">
                      <TextFileIcon />
                    </div>
                  )}
                  <div className="linked-resource-copy">
                    <strong>{linkedItem.title}</strong>
                    <span>
                      {linkedTypeByItemId.get(linkedItem.id) ?? "attachment"} · {linkedItem.category_key ?? linkedItem.item_kind}
                    </span>
                  </div>
                </>
              );

              return (
                <li key={linkedItem.id}>
                  {canPreview ? (
                    <button
                      type="button"
                      className="linked-resource-card linked-file-card interactive"
                      onClick={() => setPreviewFile({ file: linkedFile, itemId: linkedItem.id, title: linkedItem.title })}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="linked-resource-card linked-file-card">{body}</div>
                  )}
                </li>
              );
            })}
            {relatedNotes.map((linkedItem) => (
              <li key={linkedItem.id}>
                <button
                  type="button"
                  className="linked-resource-card linked-note-card interactive"
                  onClick={() => void workspace.openLinkedNotePreview(linkedItem)}
                >
                  <span className="linked-note-icon">
                    <NoteIcon />
                  </span>
                  <div className="linked-resource-copy">
                    <strong>{linkedItem.title}</strong>
                    <span>
                      {linkedTypeByItemId.get(linkedItem.id) ?? "related"} · {linkedItem.category_key ?? linkedItem.item_kind}
                    </span>
                  </div>
                </button>
              </li>
            ))}
            {!hasLinks ? (
              <li>
                <span>No linked files or items yet</span>
              </li>
            ) : null}
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
      {activeModal ? <LinkItemModal mode={activeModal} workspace={workspace} onClose={() => setActiveModal(null)} /> : null}
      {workspace.linkedNotePreview.note ? (
        <LinkedNoteModal preview={workspace.linkedNotePreview} onClose={workspace.closeLinkedNotePreview} />
      ) : null}
      {previewFile ? (
        <LinkedFileModal file={previewFile.file} itemId={previewFile.itemId} onClose={() => setPreviewFile(null)} />
      ) : null}
    </>
  );
}
