import { useEffect, useMemo, useRef, useState } from "react";
import { fetchSearchDetail, fetchSearchLabels, searchContent } from "./api.js";
import {
  buildSearchInput,
  createSearchFilters,
  createSearchHistoryEntry,
  getSearchScopeForRoute,
  mergeSearchHistory,
  SEARCH_HISTORY_STORAGE_KEY,
  sortSearchItems,
} from "./state.js";

function readSearchHistory() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSearchHistory(history) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function useSearchWorkspace({ searchRequest, onSearchStateChange }) {
  const detailRequestRef = useRef(0);
  const [query, setQuery] = useState(searchRequest.query ?? "");
  const [globalScope, setGlobalScope] = useState(Boolean(searchRequest.globalScope));
  const [scopeRoute, setScopeRoute] = useState(searchRequest.scopeRoute ?? "home");
  const [filters, setFilters] = useState(createSearchFilters());
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => readSearchHistory());
  const [availableLabels, setAvailableLabels] = useState([]);

  const selectedSummary = useMemo(
    () => results.find((item) => item.id === selectedId) ?? null,
    [results, selectedId],
  );
  const scope = useMemo(() => getSearchScopeForRoute(scopeRoute, globalScope), [globalScope, scopeRoute]);

  function updateSearchState(patch) {
    onSearchStateChange?.(patch);
  }

  async function runSearch(overrides = {}, { persistHistory = true } = {}) {
    const nextQuery = overrides.query ?? query;
    const nextGlobalScope = overrides.globalScope ?? globalScope;
    const nextScopeRoute = overrides.scopeRoute ?? scopeRoute;
    const nextFilters = createSearchFilters(overrides.filters ?? filters);

    setQuery(nextQuery);
    setGlobalScope(nextGlobalScope);
    setScopeRoute(nextScopeRoute);
    setFilters(nextFilters);
    updateSearchState({
      query: nextQuery,
      globalScope: nextGlobalScope,
      scopeRoute: nextScopeRoute,
    });

    const searchInput = buildSearchInput({
      query: nextQuery,
      globalScope: nextGlobalScope,
      scopeRoute: nextScopeRoute,
      filters: nextFilters,
    });

    setLoading(true);
    setError("");
    try {
      const items = await searchContent(searchInput);
      const sortedItems = sortSearchItems(items, searchInput.query ?? "");
      setResults(sortedItems);
      setSelectedId((current) =>
        sortedItems.some((item) => item.id === current) ? current : (sortedItems[0]?.id ?? null),
      );

      if (persistHistory && searchInput.query) {
        const entry = createSearchHistoryEntry({
          query: searchInput.query,
          globalScope: nextGlobalScope,
          scopeRoute: nextScopeRoute,
          filters: nextFilters,
        });
        setHistory((currentHistory) => {
          const mergedHistory = mergeSearchHistory(currentHistory, entry);
          writeSearchHistory(mergedHistory);
          return mergedHistory;
        });
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    writeSearchHistory([]);
  }

  function applyHistoryEntry(entry) {
    void runSearch(
      {
        query: entry.query,
        globalScope: entry.globalScope,
        scopeRoute: entry.scopeRoute,
        filters: entry.filters,
      },
      { persistHistory: false },
    );
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    void runSearch();
  }

  useEffect(() => {
    void fetchSearchLabels()
      .then(setAvailableLabels)
      .catch(() => setAvailableLabels([]));
  }, []);

  useEffect(() => {
    setQuery(searchRequest.query ?? "");
    setGlobalScope(Boolean(searchRequest.globalScope));
    setScopeRoute(searchRequest.scopeRoute ?? "home");
  }, [searchRequest.globalScope, searchRequest.query, searchRequest.scopeRoute]);

  useEffect(() => {
    if (!searchRequest.version) {
      return;
    }

    void runSearch(
      {
        query: searchRequest.query ?? "",
        globalScope: Boolean(searchRequest.globalScope),
        scopeRoute: searchRequest.scopeRoute ?? "home",
      },
      { persistHistory: true },
    );
  }, [searchRequest.version]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(null);
      setDetailLoading(false);
      return;
    }

    const requestId = ++detailRequestRef.current;
    setDetailLoading(true);
    void fetchSearchDetail(selectedId)
      .then((payload) => {
        if (requestId !== detailRequestRef.current) {
          return;
        }
        setSelectedDetail(payload);
      })
      .catch((err) => {
        if (requestId !== detailRequestRef.current) {
          return;
        }
        setError(err.message);
      })
      .finally(() => {
        if (requestId === detailRequestRef.current) {
          setDetailLoading(false);
        }
      });
  }, [selectedId]);

  return {
    availableLabels,
    clearHistory,
    error,
    filters,
    globalScope,
    handleSubmit,
    history,
    loading,
    query,
    results,
    runSearch,
    scope,
    scopeRoute,
    selectedDetail,
    selectedId,
    selectedSummary,
    setGlobalScope(value) {
      setGlobalScope(value);
      updateSearchState({ globalScope: value });
    },
    setQuery(value) {
      setQuery(value);
      updateSearchState({ query: value });
    },
    setScopeRoute(value) {
      setScopeRoute(value);
      updateSearchState({ scopeRoute: value });
    },
    setSelectedId,
    updateFilter,
    applyHistoryEntry,
    detailLoading,
  };
}
