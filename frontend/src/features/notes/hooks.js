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
  const notesRequestRef = useRef(0);
  const noteRequestRef = useRef(0);
  const selectionActionRef = useRef(0);
  const autosaveTimerRef = useRef(null);
  const lastPersistedEditorRef = useRef(serializeEditorState(emptyEditor()));
  const persistedEditorByNoteIdRef = useRef(new Map());
  const selectedIdRef = useRef(null);
  const selectedNoteRef = useRef(null);
  const editorRef = useRef(emptyEditor());
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
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    selectedNoteRef.current = selectedNote;
  }, [selectedNote]);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  function clearAutosaveTimer() {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }

  function commitEditor(nextEditorOrUpdater) {
    if (typeof nextEditorOrUpdater === "function") {
      const nextEditor = nextEditorOrUpdater(editorRef.current);
      editorRef.current = nextEditor;
      setEditor(nextEditor);
      return;
    }
    editorRef.current = nextEditorOrUpdater;
    setEditor(nextEditorOrUpdater);
  }

  function commitSelectedId(nextSelectedId) {
    selectedIdRef.current = nextSelectedId;
    setSelectedId(nextSelectedId);
  }

  function commitSelectedNote(nextSelectedNote) {
    if (typeof nextSelectedNote === "function") {
      setSelectedNote((current) => {
        const nextNote = nextSelectedNote(current);
        selectedNoteRef.current = nextNote;
        return nextNote;
      });
      return;
    }
    selectedNoteRef.current = nextSelectedNote;
    setSelectedNote(nextSelectedNote);
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

    commitSelectedNote((current) => {
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

  function syncLocalNoteLabels(itemId, labels) {
    const labelPaths = labels.map((label) => label.full_path);

    commitSelectedNote((current) => {
      if (!current || current.item.id !== itemId) {
        return current;
      }

      return {
        ...current,
        labels,
      };
    });

    commitEditor((current) => {
      if (selectedIdRef.current !== itemId) {
        return current;
      }
      const nextEditor = {
        ...current,
        item_id: itemId,
        label_paths: "",
        selected_labels: labelPaths,
      };
      persistedEditorByNoteIdRef.current.set(itemId, serializeEditorState(nextEditor));
      lastPersistedEditorRef.current = serializeEditorState(nextEditor);
      return nextEditor;
    });
  }

  async function persistEditor(itemId, editorSnapshot, { source }) {
    if (!itemId) {
      return false;
    }
    if (editorSnapshot.item_id !== itemId) {
      return false;
    }

    const snapshotKey = serializeEditorState(editorSnapshot);
    if (snapshotKey === persistedEditorByNoteIdRef.current.get(itemId)) {
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
      persistedEditorByNoteIdRef.current.set(itemId, snapshotKey);
      if (selectedIdRef.current === itemId) {
        lastPersistedEditorRef.current = snapshotKey;
      }
      syncLocalNoteState(itemId, persistedEditor);
      if (source === "manual") {
        if (selectedIdRef.current === itemId) {
          setNotice("Note saved");
        }
      } else if (selectedIdRef.current === itemId) {
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

  async function loadNotes(query = "", { autoSelect = true } = {}) {
    const requestId = ++notesRequestRef.current;
    setLoading(true);
    setError("");
    try {
      const items = await fetchNotes(query);
      if (requestId !== notesRequestRef.current) {
        return;
      }
      setNotes(items);
      setSelectedId((currentId) => {
        let nextId = currentId;
        if (!autoSelect && !currentId) {
          nextId = null;
        } else if (!currentId && items.length > 0) {
          nextId = items[0].id;
        } else if (currentId && !items.some((item) => item.id === currentId)) {
          nextId = autoSelect ? items[0]?.id ?? null : null;
        }
        selectedIdRef.current = nextId;
        return nextId;
      });
    } catch (err) {
      if (requestId !== notesRequestRef.current) {
        return;
      }
      setError(err.message);
    } finally {
      if (requestId === notesRequestRef.current) {
        setLoading(false);
      }
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
      if (requestId !== noteRequestRef.current || selectedIdRef.current !== itemId) {
        return;
      }
      const markdownBody = notePayload.primary_content_part?.content_text ?? "";
      const nextEditor = editorFromItemDetail(notePayload, await marked.parse(markdownBody));
      commitSelectedNote(notePayload);
      setHistory(historyPayload.events);
      commitEditor(nextEditor);
      const persistedKey = serializeEditorState(nextEditor);
      persistedEditorByNoteIdRef.current.set(itemId, persistedKey);
      lastPersistedEditorRef.current = persistedKey;
      setAutosaveState("idle");
    } catch (err) {
      if (requestId !== noteRequestRef.current || selectedIdRef.current !== itemId) {
        return;
      }
      setError(err.message);
    } finally {
      if (requestId === noteRequestRef.current && selectedIdRef.current === itemId) {
        setSelectedNoteLoading(false);
      }
    }
  }

  async function handleSelectNote(note, { saveCurrent = false } = {}) {
    const actionId = ++selectionActionRef.current;
    const currentSelectedId = selectedIdRef.current;
    const currentEditor = editorRef.current;
    const currentSnapshot = serializeEditorState(currentEditor);
    const currentPersistedSnapshot = currentSelectedId
      ? persistedEditorByNoteIdRef.current.get(currentSelectedId)
      : serializeEditorState(emptyEditor());
    const currentIsDirty = currentSnapshot !== currentPersistedSnapshot;

    if (saveCurrent && currentSelectedId && currentIsDirty) {
      clearAutosaveTimer();
      await persistEditor(currentSelectedId, currentEditor, { source: "manual" });
      if (actionId !== selectionActionRef.current) {
        return false;
      }
    }

    const activeSelectedId = selectedIdRef.current;
    const activeEditor = editorRef.current;
    const activeSnapshot = serializeEditorState(activeEditor);
    const activePersistedSnapshot = activeSelectedId
      ? persistedEditorByNoteIdRef.current.get(activeSelectedId)
      : serializeEditorState(emptyEditor());
    const transition = deriveSelectionTransition(activeSelectedId, note, {
      isDirty: activeSnapshot !== activePersistedSnapshot,
    });

    if (transition.shouldReloadImmediately) {
      void loadNote(note.id);
      return true;
    }

    if (transition.isSameSelection) {
      return true;
    }

    clearAutosaveTimer();
    commitSelectedId(transition.nextSelectedId);
    commitSelectedNote(transition.nextSelectedNote);
    setSelectedNoteLoading(true);
    setAutosaveState("idle");
    if (transition.shouldClearHistory) {
      setHistory([]);
    }
    commitEditor(transition.nextEditor);
    return true;
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
    if (currentSnapshot === persistedEditorByNoteIdRef.current.get(selectedId)) {
      return;
    }

    clearAutosaveTimer();
    setAutosaveState("pending");
    const autosaveItemId = selectedId;
    const autosaveEditor = editor;
    autosaveTimerRef.current = setTimeout(() => {
      void persistEditor(autosaveItemId, autosaveEditor, { source: "autosave" });
    }, getAutosaveDelayMs());

    return () => clearAutosaveTimer();
  }, [editor, saving, selectedId, selectedNote, selectedNoteLoading, uploading]);

  async function handleSearchSubmit(event) {
    event.preventDefault();
    await loadNotes(search);
  }

  async function runSearch(query) {
    await loadNotes(query);
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
      commitSelectedId(payload.item.id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSelected() {
    const itemId = selectedIdRef.current;
    if (!itemId) {
      return;
    }
    const editorSnapshot = editorRef.current;
    clearAutosaveTimer();
    setError("");
    setNotice("");
    await persistEditor(itemId, editorSnapshot, { source: "manual" });
    await loadAvailableLabels();
  }

  function closeSelectedNote() {
    selectionActionRef.current += 1;
    noteRequestRef.current += 1;
    clearAutosaveTimer();
    commitSelectedId(null);
    commitSelectedNote(null);
    setSelectedNoteLoading(false);
    setHistory([]);
    const nextEditor = emptyEditor();
    commitEditor(nextEditor);
    lastPersistedEditorRef.current = serializeEditorState(nextEditor);
    setAutosaveState("idle");
  }

  async function deleteSelectedNote() {
    if (!selectedId) {
      return false;
    }

    clearAutosaveTimer();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateNoteCore(selectedId, { is_archived: true });
      closeSelectedNote();
      await loadNotes(search, { autoSelect: false });
      setNotice("Note deleted");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateSelectedNoteFields(fields) {
    const itemId = selectedIdRef.current;
    if (!itemId) {
      return false;
    }

    const nextEditor = {
      ...editorRef.current,
      ...fields,
    };
    commitEditor(nextEditor);
    clearAutosaveTimer();
    setError("");
    setNotice("");
    const success = await persistEditor(itemId, nextEditor, { source: "autosave" });
    if (success) {
      await loadAvailableLabels();
    }
    return success;
  }

  async function updateSelectedNoteLabels(labelPaths) {
    const itemId = selectedIdRef.current;
    if (!itemId) {
      return false;
    }

    clearAutosaveTimer();
    setError("");
    setNotice("");
    setAutosaving(true);
    setAutosaveState("saving");
    try {
      const labels = await replaceLabels(itemId, labelPaths);
      syncLocalNoteLabels(itemId, labels);
      setAutosaveState("saved");
      await loadAvailableLabels();
      return true;
    } catch (err) {
      setError(err.message);
      setAutosaveState("error");
      return false;
    } finally {
      setAutosaving(false);
    }
  }

  async function handleUploadAttachment(event) {
    event.preventDefault();
    if (!selectedId || !attachmentFile) {
      return;
    }
    setUploading(true);
    setUploadProgress({
      bytesPerSecond: null,
      etaSeconds: null,
      loaded: 0,
      percent: 0,
      total: attachmentFile.size ?? null,
    });
    setError("");
    setNotice("");
    try {
      await uploadAttachment(selectedId, attachmentFile, {
        onProgress: setUploadProgress,
      });
      setAttachmentFile(null);
      setNotice("Attachment uploaded");
      await loadNote(selectedId);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadProgress(null);
      setUploading(false);
    }
  }

  return {
    attachmentFile,
    autosaveState,
    autosaving,
    availableLabels,
    closeSelectedNote,
    deleteSelectedNote,
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
    runSearch,
    setAttachmentFile,
    setDraft,
    setEditor: commitEditor,
    setSearch,
    updateSelectedNoteLabels,
    updateSelectedNoteFields,
    uploading,
    uploadProgress,
    refreshAvailableLabels() {
      void loadAvailableLabels();
    },
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
