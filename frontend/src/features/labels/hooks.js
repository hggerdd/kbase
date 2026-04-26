import { useEffect, useState } from "react";
import {
  createLabel,
  deleteLabel,
  deactivateLabel,
  fetchLabels,
  reactivateLabel,
  renameLabel,
} from "./api.js";

const EMPTY_DRAFT = {
  name: "",
  parent_id: "",
  description: "",
};

export function useLabelsWorkspace() {
  const [query, setQuery] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [labels, setLabels] = useState([]);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadLabels(overrides = {}) {
    setLoading(true);
    setError("");
    try {
      const items = await fetchLabels({
        query: overrides.query ?? query,
        includeInactive: overrides.includeInactive ?? includeInactive,
        limit: 200,
      });
      setLabels(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLabels();
  }, [query, includeInactive]);

  async function handleCreateLabel(event, input = null) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const labelDraft = input ?? draft;
    try {
      await createLabel({
        name: labelDraft.name,
        parent_id: labelDraft.parent_id || null,
        description: labelDraft.description || null,
      });
      setDraft(EMPTY_DRAFT);
      setNotice("Label created");
      await loadLabels();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleRenameLabel(labelId, name) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await renameLabel(labelId, { name });
      setNotice("Label renamed");
      await loadLabels();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateLabel(labelId, input) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await renameLabel(labelId, input);
      setNotice("Label updated");
      await loadLabels();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLabel(labelId) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await deleteLabel(labelId);
      setNotice(`${result.deleted_count} label${result.deleted_count === 1 ? "" : "s"} hard deleted`);
      await loadLabels();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivateLabel(labelId) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await deactivateLabel(labelId);
      setNotice("Label deactivated");
      await loadLabels();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivateLabel(labelId) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await reactivateLabel(labelId);
      setNotice("Label reactivated");
      await loadLabels();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    draft,
    error,
    handleCreateLabel,
    handleDeleteLabel,
    handleDeactivateLabel,
    handleReactivateLabel,
    handleRenameLabel,
    handleUpdateLabel,
    includeInactive,
    labels,
    loading,
    notice,
    query,
    saving,
    setDraft,
    setIncludeInactive,
    setQuery,
  };
}
