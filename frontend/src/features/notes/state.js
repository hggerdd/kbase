export function emptyEditor() {
  return {
    item_id: null,
    title: "",
    category_key: "research",
    status: "",
    markdown_body: "",
    html_body: "",
    label_paths: "",
    selected_labels: [],
  };
}

export function buildCategoryCounts(notes) {
  const counts = new Map();
  notes.forEach((note) => {
    const key = note.category_key ?? "uncategorized";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

export function resolveCategoryCountNotes(selectedCategoryKey, visibleNotes, unfilteredCategoryNotes) {
  if (!selectedCategoryKey) {
    return visibleNotes;
  }
  return unfilteredCategoryNotes ?? visibleNotes;
}

export function combineLabelPaths(selectedLabels, labelPathsText) {
  return [
    ...selectedLabels,
    ...labelPathsText
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  ].filter((value, index, all) => all.indexOf(value) === index);
}

export function provisionalNoteFromSummary(note) {
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

export function editorFromItemSummary(note) {
  return {
    item_id: note.id,
    title: note.title,
    category_key: note.category_key ?? "research",
    status: note.status ?? "",
    markdown_body: "",
    html_body: "",
    label_paths: "",
    selected_labels: [],
  };
}

export function editorFromItemDetail(notePayload, htmlBody) {
  return {
    item_id: notePayload.item.id,
    title: notePayload.item.title,
    category_key: notePayload.item.category_key ?? "research",
    status: notePayload.item.status ?? "",
    markdown_body: notePayload.primary_content_part?.content_text ?? "",
    html_body: htmlBody,
    label_paths: "",
    selected_labels: notePayload.labels.map((label) => label.full_path),
  };
}

export function serializeEditorState(editor) {
  return JSON.stringify({
    item_id: editor.item_id ?? null,
    title: editor.title,
    category_key: editor.category_key ?? "research",
    status: editor.status ?? "",
    markdown_body: editor.markdown_body ?? "",
    html_body: editor.html_body ?? "",
    label_paths: editor.label_paths ?? "",
    selected_labels: [...editor.selected_labels].sort(),
  });
}

export function serializeEditorCoreState(editor) {
  return JSON.stringify({
    item_id: editor.item_id ?? null,
    title: editor.title,
    category_key: editor.category_key ?? "research",
    status: editor.status ?? "",
    markdown_body: editor.markdown_body ?? "",
    html_body: editor.html_body ?? "",
  });
}

export function deriveSelectionTransition(currentSelectedId, note, { isDirty = false } = {}) {
  const isSameSelection = currentSelectedId === note.id;
  return {
    isSameSelection,
    nextSelectedId: note.id,
    nextSelectedNote: isSameSelection ? null : provisionalNoteFromSummary(note),
    nextEditor: isSameSelection ? null : editorFromItemSummary(note),
    shouldClearHistory: !isSameSelection,
    shouldReloadImmediately: isSameSelection && !isDirty,
  };
}

export const DEFAULT_NOTE_SORT_MODE = "recent";
export const NOTE_SORT_MODES = new Set(["recent", "alphabetical", "created_on"]);

export function normalizeNoteSortMode(value) {
  return NOTE_SORT_MODES.has(value) ? value : DEFAULT_NOTE_SORT_MODE;
}

function getTimestamp(value) {
  const time = new Date(value ?? 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function sortWorkspaceNotes(notes, sortMode = DEFAULT_NOTE_SORT_MODE) {
  const normalizedSortMode = normalizeNoteSortMode(sortMode);
  const items = [...notes];
  if (normalizedSortMode === "alphabetical") {
    return items.sort((left, right) => {
      const titleOrder = String(left.title ?? "").localeCompare(String(right.title ?? ""));
      if (titleOrder !== 0) {
        return titleOrder;
      }
      return getTimestamp(right.updated_at ?? right.created_at) - getTimestamp(left.updated_at ?? left.created_at);
    });
  }

  if (normalizedSortMode === "created_on") {
    return items.sort((left, right) => {
      const createdOrder = getTimestamp(right.created_at) - getTimestamp(left.created_at);
      if (createdOrder !== 0) {
        return createdOrder;
      }
      return String(left.title ?? "").localeCompare(String(right.title ?? ""));
    });
  }

  return items.sort((left, right) => {
    const updatedOrder = getTimestamp(right.updated_at) - getTimestamp(left.updated_at);
    if (updatedOrder !== 0) {
      return updatedOrder;
    }
    return String(left.title ?? "").localeCompare(String(right.title ?? ""));
  });
}
