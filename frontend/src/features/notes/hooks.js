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
} from "./api";
import { EMPTY_DRAFT } from "./constants";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

function emptyEditor() {
  return {
    title: "",
    category_key: "research",
    status: "",
    markdown_body: "",
    html_body: "",
    label_paths: "",
    selected_labels: [],
  };
}

function combineLabelPaths(selectedLabels, labelPathsText) {
  return [
    ...selectedLabels,
    ...labelPathsText
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  ].filter((value, index, all) => all.indexOf(value) === index);
}

function provisionalNoteFromSummary(note) {
  return {
    item: note,
    primary_content_part: null,
    content_parts: [],
    files: [],
    labels: [],
    classifications: [],
    metadata: [],
    linked_assets: [],
    outgoing_links: [],
    related_items: [],
    projects: [],
  };
}

export function useNotesWorkspace({ externalSearch = "", externalSearchVersion = 0 } = {}) {
  const noteRequestRef = useRef(0);
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [history, setHistory] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [search, setSearch] = useState(externalSearch);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editor, setEditor] = useState(emptyEditor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);

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
      return;
    }
    const requestId = ++noteRequestRef.current;
    setError("");
    try {
      const [notePayload, historyPayload] = await Promise.all([fetchNote(itemId), fetchHistory(itemId)]);
      if (requestId !== noteRequestRef.current) {
        return;
      }
      const markdownBody = notePayload.primary_content_part?.content_text ?? "";
      const itemLabels = notePayload.labels.map((label) => label.full_path);
      setSelectedNote(notePayload);
      setHistory(historyPayload.events);
      setEditor({
        title: notePayload.item.title,
        category_key: notePayload.item.category_key ?? "research",
        status: notePayload.item.status ?? "",
        markdown_body: markdownBody,
        html_body: await marked.parse(markdownBody),
        label_paths: "",
        selected_labels: itemLabels,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSelectNote(note) {
    setSelectedId(note.id);
    setSelectedNote((current) => (current?.item?.id === note.id ? current : provisionalNoteFromSummary(note)));
    setHistory([]);
    setEditor({
      title: note.title,
      category_key: note.category_key ?? "research",
      status: note.status ?? "",
      markdown_body: "",
      html_body: "",
      label_paths: "",
      selected_labels: [],
    });
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
    loadNotes(externalSearch);
    loadAvailableLabels();
  }, []);

  useEffect(() => {
    loadNote(selectedId);
  }, [selectedId]);

  useEffect(() => {
    setSearch(externalSearch);
    void loadNotes(externalSearch);
  }, [externalSearch, externalSearchVersion]);

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
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const markdownBody = turndown.turndown(editor.html_body || "");
      const labelPaths = combineLabelPaths(editor.selected_labels, editor.label_paths);
      await updateNoteCore(selectedId, {
        title: editor.title,
        category_key: editor.category_key,
        status: editor.status || null,
      });
      await replaceNoteContent(selectedId, {
        content_text: markdownBody,
        change_reason: "web-edit",
      });
      await replaceLabels(selectedId, labelPaths);
      setNotice("Note saved");
      await loadAvailableLabels();
      await loadNotes(search);
      await loadNote(selectedId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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

    load();
    return () => {
      active = false;
    };
  }, []);

  return snapshot;
}
