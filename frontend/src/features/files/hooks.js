import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { fetchFileItemDetail, fetchFileItemSummaries, fetchFileLabels } from "./api.js";
import { buildFileTree, itemMatchesFileFilters } from "./state.js";

export function useFileViewerWorkspace() {
  const [items, setItems] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [treeLayout, setTreeLayout] = useState("category-label-file");
  const [query, setQuery] = useState("");
  const [categoryPrefix, setCategoryPrefix] = useState("");
  const [selectedLabels, setSelectedLabels] = useState(["test"]);
  const [renderedSummary, setRenderedSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const [summaries, labels] = await Promise.all([fetchFileItemSummaries(), fetchFileLabels()]);
      const details = await Promise.all(summaries.map((item) => fetchFileItemDetail(item.id)));
      setItems(details);
      setAvailableLabels(labels);
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

  const filteredItems = useMemo(
    () =>
      items.filter((detail) =>
        itemMatchesFileFilters(detail, {
          categoryPrefix,
          query,
          selectedLabels,
        }),
      ),
    [categoryPrefix, items, query, selectedLabels],
  );

  const tree = useMemo(
    () =>
      buildFileTree(filteredItems, {
        treeLayout,
        selectedLabels,
        categoryPrefix,
      }),
    [categoryPrefix, filteredItems, selectedLabels, treeLayout],
  );

  const selectedItem = useMemo(
    () => filteredItems.find((detail) => detail.item.id === selectedId) ?? filteredItems[0] ?? null,
    [filteredItems, selectedId],
  );

  useEffect(() => {
    if (!selectedItem) {
      setRenderedSummary("");
      return;
    }

    const summaryText =
      selectedItem.primary_content_part?.content_text ??
      selectedItem.content_parts?.find((part) => part.part_kind === "summary")?.content_text ??
      "";

    let cancelled = false;
    void marked.parse(summaryText).then((html) => {
      if (!cancelled) {
        setRenderedSummary(html);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedItem]);

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

  return {
    availableLabels,
    categoryPrefix,
    error,
    filteredItems,
    items,
    loading,
    query,
    refresh: loadItems,
    renderedSummary,
    selectedId,
    selectedItem,
    selectedLabels,
    setCategoryPrefix,
    setQuery,
    setSelectedId,
    setTreeLayout,
    toggleLabelFilter,
    tree,
    treeLayout,
  };
}
