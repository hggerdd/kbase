import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { fetchFileItemDetail, fetchFileItemSummaries, fetchFileLabels, replaceFileSummary } from "./api.js";
import { buildFileTree, itemMatchesFileFilters } from "./state.js";

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });

export function useFileViewerWorkspace() {
  const [items, setItems] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [treeLayout, setTreeLayout] = useState("category-label-file");
  const [query, setQuery] = useState("");
  const [categoryPrefix, setCategoryPrefix] = useState("");
  const [selectedLabels, setSelectedLabels] = useState(["test"]);
  const [renderedSummary, setRenderedSummary] = useState("");
  const [summaryEditorHtml, setSummaryEditorHtml] = useState("");
  const [summaryEditing, setSummaryEditing] = useState(false);
  const [summarySaving, setSummarySaving] = useState(false);
  const [notice, setNotice] = useState("");
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
      setSummaryEditorHtml("");
      setSummaryEditing(false);
      return;
    }

    const summaryText =
      selectedItem.primary_content_part?.content_text ??
      selectedItem.content_parts?.find((part) => part.part_kind === "summary")?.content_text ??
      "";

    let cancelled = false;
    void Promise.resolve(marked.parse(summaryText)).then((html) => {
      if (!cancelled) {
        setRenderedSummary(html);
        setSummaryEditorHtml(html);
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

  async function saveSummary() {
    if (!selectedItem) {
      return;
    }

    setSummarySaving(true);
    setError("");
    setNotice("");
    try {
      const markdownBody = turndown.turndown(summaryEditorHtml || "");
      await replaceFileSummary(selectedItem.item.id, markdownBody);
      setItems((currentItems) =>
        currentItems.map((detail) =>
          detail.item.id === selectedItem.item.id
            ? {
                ...detail,
                primary_content_part: detail.primary_content_part
                  ? {
                      ...detail.primary_content_part,
                      content_text: markdownBody,
                    }
                  : {
                      id: `generated-${detail.item.id}`,
                      item_id: detail.item.id,
                      part_kind: "markdown_body",
                      sequence_no: 1,
                      content_text: markdownBody,
                      content_format: "markdown",
                      source_method: "manual",
                      source_data_class: "canonical",
                      language_code: null,
                      created_by_principal_id: null,
                      created_at: detail.item.updated_at,
                      updated_at: detail.item.updated_at,
                    },
              }
            : detail,
        ),
      );
      setRenderedSummary(await Promise.resolve(marked.parse(markdownBody)));
      setSummaryEditing(false);
      setNotice("File summary saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setSummarySaving(false);
    }
  }

  return {
    availableLabels,
    categoryPrefix,
    error,
    filteredItems,
    items,
    loading,
    notice,
    query,
    refresh: loadItems,
    renderedSummary,
    saveSummary,
    selectedId,
    selectedItem,
    selectedLabels,
    setCategoryPrefix,
    setQuery,
    setSelectedId,
    setSummaryEditorHtml,
    setSummaryEditing,
    setTreeLayout,
    summaryEditing,
    summaryEditorHtml,
    summarySaving,
    toggleLabelFilter,
    tree,
    treeLayout,
    refreshLabels() {
      void loadItems();
    },
  };
}
