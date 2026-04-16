import { useEffect, useState } from "react";
import { createCategory, fetchCategories, updateCategory } from "./api.js";

export const EMPTY_CATEGORY_DRAFT = {
  key: "",
  label: "",
  description: "",
  applies_to_kind: "note",
  is_active: true,
};

export function useCategoriesWorkspace() {
  const [query, setQuery] = useState("");
  const [appliesToKind, setAppliesToKind] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadCategories(overrides = {}) {
    setLoading(true);
    setError("");
    try {
      const result = await fetchCategories({
        query: overrides.query ?? query,
        appliesToKind: overrides.appliesToKind ?? appliesToKind,
        includeInactive: overrides.includeInactive ?? includeInactive,
        limit: 300,
      });
      setCategories(result.categories ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, [query, appliesToKind, includeInactive]);

  async function handleCreateCategory(input) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await createCategory({
        key: input.key.trim(),
        label: input.label.trim(),
        description: input.description?.trim() || null,
        applies_to_kind: input.applies_to_kind || null,
      });
      setNotice("Category created");
      await loadCategories();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateCategory(categoryKey, input) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateCategory(categoryKey, {
        label: input.label?.trim(),
        description: input.description?.trim() || null,
        applies_to_kind: input.applies_to_kind || null,
        is_active: input.is_active,
      });
      setNotice("Category updated");
      await loadCategories();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSetActive(categoryKey, isActive) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateCategory(categoryKey, { is_active: isActive });
      setNotice(isActive ? "Category activated" : "Category deactivated");
      await loadCategories();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    appliesToKind,
    categories,
    error,
    handleCreateCategory,
    handleSetActive,
    handleUpdateCategory,
    includeInactive,
    loading,
    notice,
    query,
    saving,
    setAppliesToKind,
    setIncludeInactive,
    setQuery,
  };
}
