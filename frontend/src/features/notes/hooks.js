import { useEffect, useRef, useState } from "react";
import TurndownService from "turndown";
import { marked } from "marked";
import {
  createNote,
  fetchHistory,
  fetchLabels,
  fetchNote,
  fetchNotes,
  replaceLabels,
  replaceNoteContent,
  updateNoteCore,
  uploadAttachment,
} from "./api.js";
import { EMPTY_DRAFT } from "./constants.js";
import {
  combineLabelPaths,
  deriveSelectionTransition,
  editorFromItemDetail,
  emptyEditor,
  serializeEditorState,
} from "./state.js";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

function getAutosaveDelayMs() {
  return globalThis.__KBASE_AUTOSAVE_DELAY_MS__ ?? 700;
}

export function useNotesWorkspace({ externalSearch = "", externalSearchVersion = 0 } = {}) {
  const noteRequestRef = useRef(0);
  const autosaveTimerRef = useRef(null);
  const lastPersistedEditorRef = useRef(serializeEditorState(emptyEditor()));
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedNoteLoading, setSelectedNoteLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [search, setSearch] = useState(externalSearch);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editor, setEditor] = useState(emptyEditor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [autosaveState, setAutosaveState] = useState("idle");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);

  function clearAutosaveTimer() {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }

  function buildPersistedEditor(editorSnapshot) {
    const markdownBody = turndown.turndown(editorSnapshot.html_body || "");
    const labelPaths = combineLabelPaths(editorSnapshot.selected_labels, editorSnapshot.label_paths);
    return {
      title: editorSnapshot.title,
      category_key: editorSnapshot.category_key,
      status: editorSnapshot.status || null,
      html_body: editorSnapshot.html_body,
      markdown_body: markdownBody,
      label_paths: labelPaths,
    };
  }

  function syncLocalNoteState(itemId, persistedEditor) {
    const now = new Date().toISOString();

    setSelectedNote((current) => {
      if (!current || current.item.id !== itemId) {
        return current;
      }

      return {
        ...current,
        item: {
          ...current.item,
          title: persistedEditor.title,
          category_key: persistedEditor.category_key,
          status: persistedEditor.status,
          updated_at: now,
        },
        primary_content_part: current.primary_content_part
          ? {
              ...current.primary_content_part,
              content_text: persistedEditor.markdown_body,
            }
          : null,
        labels: persistedEditor.label_paths.map((fullPath) => ({
          id: fullPath,
          name: fullPath.split("/").at(-1) ?? fullPath,
          full_path: fullPath,
        })),
      };
    });

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === itemId
          ? {
              ...note,
              title: persistedEditor.title,
              category_key: persistedEditor.category_key,
              status: persistedEditor.status,
              updated_at: now,
            }
          : note,
      ),
    );
  }

  async function persistEditor(itemId, editorSnapshot, { source }) {
    if (!itemId) {
      return false;
    }

    const snapshotKey = serializeEditorState(editorSnapshot);
    if (snapshotKey === lastPersistedEditorRef.current) {
      return true;
    }

    const persistedEditor = buildPersistedEditor(editorSnapshot);

    if (source === "manual") {
      setSaving(true);
    } else {
      setAutosaving(true);
      setAutosaveState("saving");
    }

    try {
      await updateNoteCore(itemId, {
        title: persistedEditor.title,
        category_key: persistedEditor.category_key,
        status: persistedEditor.status,
      });
      await replaceNoteContent(itemId, {
        content_text: persistedEditor.markdown_body,
        change_reason: source === "manual" ? "web-edit" : "web-autosave",
      });
      await replaceLabels(itemId, persistedEditor.label_paths);
      lastPersistedEditorRef.current = snapshotKey;
      syncLocalNoteState(itemId, persistedEditor);
      if (source === "manual") {
        setNotice("Note saved");
      } else {
        setAutosaveState("saved");
      }
      return true;
    } catch (err) {
      setError(err.message);
      if (source !== "manual") {
        setAutosaveState("error");
      }
      return false;
    } finally {
      if (source === "manual") {
        setSaving(false);
      } else {
        setAutosaving(false);
      }
    }
  }

  async function loadNotes(query = "") {
    setLoading(true);
    setError("");
    try {
      const items = await fetchNotes(query);
      setNotes(items);
      setSelectedId((currentId) => {
        if (!currentId && items.length > 0) {
          return items[0].id;
        }
        if (currentId && !items.some((item) => item.id === currentId)) {
          return items[0]?.id ?? null;
        }
        return currentId;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableLabels() {
    try {
      const labels = await fetchLabels();
      setAvailableLabels(labels);
    } catch {
      // Labels are optional for keeping the workspace usable.
    }
  }

  async function loadNote(itemId) {
    if (!itemId) {
      setSelectedNoteLoading(false);
      return;
    }
    const requestId = ++noteRequestRef.current;
    setSelectedNoteLoading(true);
    setError("");
    try {
      const [notePayload, historyPayload] = await Promise.all([fetchNote(itemId), fetchHistory(itemId)]);
      if (requestId !== noteRequestRef.current) {
        return;
      }
      const markdownBody = notePayload.primary_content_part?.content_text ?? "";
      const nextEditor = editorFromItemDetail(notePayload, await marked.parse(markdownBody));
      setSelectedNote(notePayload);
      setHistory(historyPayload.events);
      setEditor(nextEditor);
      lastPersistedEditorRef.current = serializeEditorState(nextEditor);
      setAutosaveState("idle");
    } catch (err) {
      if (requestId !== noteRequestRef.current) {
        return;
      }
      setError(err.message);
    } finally {
      if (requestId === noteRequestRef.current) {
        setSelectedNoteLoading(false);
      }
    }
  }

  function handleSelectNote(note) {
    const transition = deriveSelectionTransition(selectedId, note, {
      isDirty: serializeEditorState(editor) !== lastPersistedEditorRef.current,
    });

    if (transition.shouldReloadImmediately) {
      void loadNote(note.id);
      return;
    }

    if (transition.isSameSelection) {
      return;
    }

    clearAutosaveTimer();
    setSelectedId(transition.nextSelectedId);
    setSelectedNote(transition.nextSelectedNote);
    setSelectedNoteLoading(true);
    setAutosaveState("idle");
    if (transition.shouldClearHistory) {
      setHistory([]);
    }
    setEditor(transition.nextEditor);
  }

  function toggleDraftLabel(labelPath) {
    setDraft((current) => ({
      ...current,
      selected_labels: current.selected_labels.includes(labelPath)
        ? current.selected_labels.filter((entry) => entry !== labelPath)
        : [...current.selected_labels, labelPath],
    }));
  }

  function toggleEditorLabel(labelPath) {
    setEditor((current) => ({
      ...current,
      selected_labels: current.selected_labels.includes(labelPath)
        ? current.selected_labels.filter((entry) => entry !== labelPath)
        : [...current.selected_labels, labelPath],
    }));
  }

  useEffect(() => {
    void loadNotes(externalSearch);
    void loadAvailableLabels();
    return () => clearAutosaveTimer();
  }, []);

  useEffect(() => {
    void loadNote(selectedId);
  }, [selectedId]);

  useEffect(() => {
    setSearch(externalSearch);
    void loadNotes(externalSearch);
  }, [externalSearch, externalSearchVersion]);

  useEffect(() => {
    if (!selectedId || !selectedNote || selectedNoteLoading || saving || uploading) {
      return;
    }

    const currentSnapshot = serializeEditorState(editor);
    if (currentSnapshot === lastPersistedEditorRef.current) {
      return;
    }

    clearAutosaveTimer();
    setAutosaveState("pending");
    autosaveTimerRef.current = setTimeout(() => {
      void persistEditor(selectedId, editor, { source: "autosave" });
    }, getAutosaveDelayMs());

    return () => clearAutosaveTimer();
  }, [editor, saving, selectedId, selectedNote, selectedNoteLoading, uploading]);

  async function handleSearchSubmit(event) {
    event.preventDefault();
    await loadNotes(search);
  }

  async function handleCreateNote(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const markdownBody = turndown.turndown(draft.html_body || "");
      const labelPaths = combineLabelPaths(draft.selected_labels, draft.label_paths);
      const payload = await createNote({
        title: draft.title,
        category_key: draft.category_key,
        markdown_body: markdownBody,
        label_paths: labelPaths,
      });
      setDraft(EMPTY_DRAFT);
      setNotice("Note created");
      await loadNotes(search);
      await loadAvailableLabels();
      setSelectedId(payload.item.id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSelected() {
    if (!selectedId) {
      return;
    }
    clearAutosaveTimer();
    setError("");
    setNotice("");
    await persistEditor(selectedId, editor, { source: "manual" });
    await loadAvailableLabels();
  }

  async function handleUploadAttachment(event) {
    event.preventDefault();
    if (!selectedId || !attachmentFile) {
      return;
    }
    setUploading(true);
    setError("");
    setNotice("");
    try {
      await uploadAttachment(selectedId, attachmentFile);
      setAttachmentFile(null);
      setNotice("Attachment uploaded");
      await loadNote(selectedId);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return {
    attachmentFile,
    autosaveState,
    autosaving,
    availableLabels,
    draft,
    editor,
    error,
    handleCreateNote,
    handleSaveSelected,
    handleSearchSubmit,
    handleSelectNote,
    handleUploadAttachment,
    history,
    loading,
    notice,
    notes,
    saving,
    search,
    selectedId,
    selectedNote,
    selectedNoteLoading,
    setAttachmentFile,
    setDraft,
    setEditor,
    setSearch,
    toggleDraftLabel,
    toggleEditorLabel,
    uploading,
  };
}

export function useHomeSnapshot() {
  const [snapshot, setSnapshot] = useState({
    loading: true,
    notes: [],
    labels: [],
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [notes, labels] = await Promise.all([fetchNotes("", { limit: 6 }), fetchLabels()]);
        if (!active) {
          return;
        }
        setSnapshot({ loading: false, notes, labels, error: "" });
      } catch (err) {
        if (!active) {
          return;
        }
        setSnapshot({ loading: false, notes: [], labels: [], error: err.message });
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return snapshot;
}
