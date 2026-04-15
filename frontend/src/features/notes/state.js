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
