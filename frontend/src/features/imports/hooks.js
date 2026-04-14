import { useEffect, useMemo, useState } from "react";
import { fetchInboxFiles, importInboxFile } from "./api";

const initialDraft = {
  title: "",
  item_kind: "document",
  category_key: "incoming",
  link_to_item_id: "",
  link_type: "attachment",
};

export function useImportsWorkspace() {
  const [files, setFiles] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [draft, setDraft] = useState(initialDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastImportedItem, setLastImportedItem] = useState(null);

  async function loadFiles() {
    setLoading(true);
    setError("");
    try {
      const nextFiles = await fetchInboxFiles();
      setFiles(nextFiles);
      setSelectedPath((current) => current || nextFiles[0]?.relative_path || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  const selectedFile = useMemo(
    () => files.find((entry) => entry.relative_path === selectedPath) ?? null,
    [files, selectedPath],
  );

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    setDraft((current) => ({
      ...current,
      title: current.title || selectedFile.filename.replace(/\.[^.]+$/, ""),
    }));
  }, [selectedFile]);

  async function handleImport(event) {
    event.preventDefault();
    if (!selectedPath) {
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const imported = await importInboxFile({
        inbox_relative_path: selectedPath,
        title: draft.title || null,
        item_kind: draft.item_kind,
        category_key: draft.category_key || null,
        link_to_item_id: draft.link_to_item_id || null,
        link_type: draft.link_to_item_id ? draft.link_type : null,
      });
      setLastImportedItem(imported.item);
      setNotice("File imported into the knowledge base");
      setDraft(initialDraft);
      await loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return {
    draft,
    error,
    files,
    handleImport,
    lastImportedItem,
    loading,
    notice,
    saving,
    selectedFile,
    selectedPath,
    setDraft,
    setSelectedPath,
  };
}
