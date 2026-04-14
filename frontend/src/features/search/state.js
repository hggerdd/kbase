export const SEARCH_HISTORY_STORAGE_KEY = "kbase.search.history";

export const SEARCH_SCOPE_OPTIONS = [
  { route: "home", label: "All content" },
  { route: "notes", label: "Notes" },
  { route: "projects", label: "Projects" },
  { route: "imports", label: "Imports" },
];

const ROUTE_SCOPE_MAP = {
  home: { label: "All content", itemKinds: [] },
  notes: { label: "Notes", itemKinds: ["note"] },
  projects: { label: "Projects", itemKinds: ["project"] },
  imports: { label: "Imports", itemKinds: ["document", "image", "spreadsheet"] },
  search: { label: "All content", itemKinds: [] },
};

export function createSearchFilters(overrides = {}) {
  return {
    itemKinds: [],
    categoryKeysText: "",
    labelPathsText: "",
    statusesText: "",
    createdByText: "",
    projectId: "",
    includeArchived: false,
    ...overrides,
  };
}

export function getSearchScopeForRoute(route, globalScope = false) {
  if (globalScope) {
    return { label: "Global", itemKinds: [] };
  }
  return ROUTE_SCOPE_MAP[route] ?? ROUTE_SCOPE_MAP.home;
}

export function normalizeSearchTerms(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry, index, all) => all.indexOf(entry) === index);
}

export function buildSearchInput({
  query = "",
  globalScope = false,
  scopeRoute = "home",
  filters = createSearchFilters(),
  limit = 100,
  offset = 0,
}) {
  const normalizedFilters = createSearchFilters(filters);
  const scope = getSearchScopeForRoute(scopeRoute, globalScope);
  const explicitItemKinds = normalizeSearchTerms(normalizedFilters.itemKinds);

  return {
    query: query.trim() || null,
    itemKinds: explicitItemKinds.length > 0 ? explicitItemKinds : scope.itemKinds,
    categoryKeys: normalizeSearchTerms(normalizedFilters.categoryKeysText),
    labelPaths: normalizeSearchTerms(normalizedFilters.labelPathsText),
    statuses: normalizeSearchTerms(normalizedFilters.statusesText),
    createdByPrincipalIds: normalizeSearchTerms(normalizedFilters.createdByText),
    projectId: normalizedFilters.projectId.trim() || null,
    includeArchived: Boolean(normalizedFilters.includeArchived),
    limit,
    offset,
  };
}

export function scoreSearchItem(item, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return Date.parse(item.updated_at ?? item.created_at ?? 0) || 0;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const title = (item.title ?? "").toLowerCase();
  const category = (item.category_key ?? "").toLowerCase();
  const kind = (item.item_kind ?? "").toLowerCase();
  const status = (item.status ?? "").toLowerCase();
  const reason = (item.match_reason ?? "").toLowerCase();

  let score = 0;
  if (title === normalizedQuery) {
    score += 120;
  }
  if (title.startsWith(normalizedQuery)) {
    score += 80;
  }
  if (title.includes(normalizedQuery)) {
    score += 60;
  }
  if (reason === "text") {
    score += 25;
  }

  for (const term of terms) {
    if (title.includes(term)) {
      score += 18;
    }
    if (category.includes(term)) {
      score += 9;
    }
    if (kind.includes(term)) {
      score += 7;
    }
    if (status.includes(term)) {
      score += 4;
    }
  }

  const recencyScore = Math.floor((Date.parse(item.updated_at ?? item.created_at ?? 0) || 0) / 100000000);
  return score * 1000 + recencyScore;
}

export function sortSearchItems(items, query) {
  return [...items].sort((left, right) => {
    const scoreDelta = scoreSearchItem(right, query) - scoreSearchItem(left, query);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return (Date.parse(right.updated_at ?? 0) || 0) - (Date.parse(left.updated_at ?? 0) || 0);
  });
}

function buildHistorySignature(entry) {
  return JSON.stringify({
    query: entry.query.trim().toLowerCase(),
    globalScope: Boolean(entry.globalScope),
    scopeRoute: entry.scopeRoute,
    filters: buildSearchInput(entry),
  });
}

export function createSearchHistoryEntry({
  query,
  globalScope,
  scopeRoute,
  filters = createSearchFilters(),
}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query: query.trim(),
    globalScope: Boolean(globalScope),
    scopeRoute,
    filters: createSearchFilters(filters),
    createdAt: new Date().toISOString(),
  };
}

export function mergeSearchHistory(history, entry, limit = 10) {
  const signature = buildHistorySignature(entry);
  const deduped = history.filter((candidate) => buildHistorySignature(candidate) !== signature);
  return [entry, ...deduped].slice(0, limit);
}
