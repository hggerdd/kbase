import { useEffect, useMemo, useState } from "react";
import {
  fetchFileCategories,
  fetchFileItemDetail,
  fetchFileItemSummaries,
  fetchFileLabels,
  fetchFileProjects,
  linkFileItem,
  replaceFileLabels,
  replaceFileProjects,
  replaceFileSummary,
  searchLinkCandidates,
  unlinkFileItem,
  updateFileCore,
  uploadFileItem,
} from "./api.js";
import { buildFileTree, itemMatchesFileFilters } from "./state.js";

export function useFileViewerWorkspace() {
  const [items, setItems] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [coreDraft, setCoreDraft] = useState({ title: "", category_key: "" });
  const [linkQuery, setLinkQuery] = useState("");
  const [linkCandidates, setLinkCandidates] = useState([]);
  const [linking, setLinking] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [coreSaving, setCoreSaving] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const [summaries, labels, categories, projects] = await Promise.all([
        fetchFileItemSummaries(),
        fetchFileLabels(),
        fetchFileCategories(),
        fetchFileProjects({ limit: 200 }),
      ]);
      const details = await Promise.all(summaries.map((item) => fetchFileItemDetail(item.id)));
      setItems(details);
      setAvailableLabels(labels);
      setAvailableCategories(categories);
      setAvailableProjects(projects);
      setSelectedId((current) => current ?? details[0]?.item.id ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const selectedCategoryKeys = useMemo(() => {
    if (!selectedCategoryKey) {
      return [];
    }
    const selectedCategory = availableCategories.find((category) => category.key === selectedCategoryKey);
    const selectedPath = selectedCategory?.full_path || selectedCategory?.key || "";
    if (!selectedPath) {
      return [selectedCategoryKey];
    }
    return availableCategories
      .filter((category) => {
        const path = category.full_path || category.key;
        return path === selectedPath || path.startsWith(`${selectedPath}/`);
      })
      .map((category) => category.key);
  }, [availableCategories, selectedCategoryKey]);

  const filteredItems = useMemo(
    () =>
      items.filter((detail) =>
        itemMatchesFileFilters(detail, {
          query,
          selectedCategoryKeys,
          selectedLabels,
          selectedProjectId,
        }),
      ),
    [items, query, selectedCategoryKeys, selectedLabels, selectedProjectId],
  );

  const tree = useMemo(
    () =>
      buildFileTree(filteredItems, {
        selectedLabels,
      }),
    [filteredItems, selectedLabels],
  );

  const selectedItem = useMemo(
    () => filteredItems.find((detail) => detail.item.id === selectedId) ?? filteredItems[0] ?? null,
    [filteredItems, selectedId],
  );

  useEffect(() => {
    if (!selectedItem) {
      setCoreDraft({ title: "", category_key: "" });
      setDescriptionDraft("");
      return;
    }

    setCoreDraft({
      title: selectedItem.item.title ?? "",
      category_key: selectedItem.item.category_key ?? "",
    });

    const summaryText =
      selectedItem.primary_content_part?.content_text ??
      selectedItem.content_parts?.find((part) => part.part_kind === "summary")?.content_text ??
      "";
    setDescriptionDraft(summaryText);
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }
    const nextTitle = coreDraft.title.trim();
    const currentTitle = selectedItem.item.title ?? "";
    if (!nextTitle || nextTitle === currentTitle) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setCoreSaving(true);
      setError("");
      try {
        await updateFileCore(selectedItem.item.id, { title: nextTitle });
        const detail = await fetchFileItemDetail(selectedItem.item.id);
        replaceItemInState(detail);
        setNotice("File title saved");
      } catch (err) {
        setError(err.message);
      } finally {
        setCoreSaving(false);
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [coreDraft.title, selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }
    const currentText =
      selectedItem.primary_content_part?.content_text ??
      selectedItem.content_parts?.find((part) => part.part_kind === "summary")?.content_text ??
      "";
    if (descriptionDraft === currentText) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setContentSaving(true);
      setError("");
      try {
        await replaceFileSummary(selectedItem.item.id, descriptionDraft);
        const detail = await fetchFileItemDetail(selectedItem.item.id);
        replaceItemInState(detail);
        setNotice("File description saved");
      } catch (err) {
        setError(err.message);
      } finally {
        setContentSaving(false);
      }
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [descriptionDraft, selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedId(null);
      return;
    }
    if (selectedItem.item.id !== selectedId) {
      setSelectedId(selectedItem.item.id);
    }
  }, [selectedId, selectedItem]);

  function toggleLabelFilter(labelPath) {
    setSelectedLabels((current) =>
      current.includes(labelPath) ? current.filter((entry) => entry !== labelPath) : [...current, labelPath],
    );
  }

  function clearLabelFilters() {
    setSelectedLabels([]);
  }

  function replaceItemInState(itemDetail) {
    setItems((currentItems) =>
      currentItems.map((detail) => (detail.item.id === itemDetail.item.id ? itemDetail : detail)),
    );
  }

  function selectedLabelPaths() {
    return (selectedItem?.labels ?? []).map((label) => label.full_path);
  }

  async function updateSelectedItemCategory(categoryKey) {
    if (!selectedItem) {
      return false;
    }
    setError("");
    setNotice("");
    try {
      await updateFileCore(selectedItem.item.id, {
        category_key: categoryKey || null,
      });
      const detail = await fetchFileItemDetail(selectedItem.item.id);
      replaceItemInState(detail);
      setNotice("File category updated");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function replaceSelectedItemProject(projectId) {
    if (!selectedItem) {
      return false;
    }
    setError("");
    setNotice("");
    try {
      await replaceFileProjects(selectedItem.item.id, projectId ? [projectId] : []);
      const detail = await fetchFileItemDetail(selectedItem.item.id);
      replaceItemInState(detail);
      setNotice("File project updated");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function toggleSelectedItemLabel(labelPath) {
    if (!selectedItem) {
      return false;
    }
    const currentPaths = selectedLabelPaths();
    const nextPaths = currentPaths.includes(labelPath)
      ? currentPaths.filter((entry) => entry !== labelPath)
      : [...currentPaths, labelPath];
    setError("");
    setNotice("");
    try {
      await replaceFileLabels(selectedItem.item.id, nextPaths);
      const detail = await fetchFileItemDetail(selectedItem.item.id);
      replaceItemInState(detail);
      setNotice("File labels updated");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleSearchLinkCandidates() {
    if (!selectedItem) {
      return [];
    }
    setLinking(true);
    setError("");
    try {
      const existingIds = new Set((selectedItem.related_items ?? []).map((item) => item.id));
      const candidates = (await searchLinkCandidates(linkQuery)).filter(
        (item) => item.id !== selectedItem.item.id && !existingIds.has(item.id),
      );
      setLinkCandidates(candidates);
      return candidates;
    } catch (err) {
      setError(err.message);
      setLinkCandidates([]);
      return [];
    } finally {
      setLinking(false);
    }
  }

  async function handleLinkItem(targetItemId) {
    if (!selectedItem) {
      return false;
    }
    setLinking(true);
    setError("");
    setNotice("");
    try {
      const detail = await linkFileItem(selectedItem.item.id, targetItemId);
      replaceItemInState(detail);
      setLinkCandidates((current) => current.filter((item) => item.id !== targetItemId));
      setNotice("Item linked");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlinkItem(linkId) {
    if (!selectedItem) {
      return false;
    }
    setLinking(true);
    setError("");
    setNotice("");
    try {
      const detail = await unlinkFileItem(linkId);
      replaceItemInState(detail);
      setNotice("Item unlinked");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLinking(false);
    }
  }

  async function uploadNewFile(file) {
    if (!file) {
      return false;
    }

    setUploading(true);
    setUploadProgress({ percent: 0 });
    setError("");
    setNotice("");
    try {
      const projectIds = selectedProjectId ? [selectedProjectId] : [];
      const detail = await uploadFileItem(file, {
        category_key: selectedCategoryKey || null,
        project_ids: projectIds,
        onProgress: setUploadProgress,
      });
      let uploadedDetail = detail;
      if (selectedLabels.length > 0) {
        await replaceFileLabels(detail.item.id, selectedLabels);
        uploadedDetail = await fetchFileItemDetail(detail.item.id);
      }
      setItems((currentItems) => [uploadedDetail, ...currentItems.filter((entry) => entry.item.id !== uploadedDetail.item.id)]);
      setSelectedId(uploadedDetail.item.id);
      setNotice("File uploaded");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setUploading(false);
    }
  }

  return {
    availableCategories,
    availableLabels,
    availableProjects,
    clearLabelFilters,
    contentSaving,
    coreDraft,
    coreSaving,
    descriptionDraft,
    error,
    filteredItems,
    handleLinkItem,
    handleSearchLinkCandidates,
    handleUnlinkItem,
    items,
    linkCandidates,
    linking,
    linkQuery,
    loading,
    notice,
    query,
    refresh: loadItems,
    replaceSelectedItemProject,
    selectedId,
    selectedItem,
    selectedCategoryKey,
    selectedLabels,
    selectedProjectId,
    setCoreDraft,
    setDescriptionDraft,
    setLinkQuery,
    setQuery,
    setSelectedCategoryKey,
    setSelectedId,
    setSelectedProjectId,
    toggleSelectedItemLabel,
    toggleLabelFilter,
    tree,
    updateSelectedItemCategory,
    uploading,
    uploadNewFile,
    uploadProgress,
    refreshLabels() {
      void loadItems();
    },
  };
}
