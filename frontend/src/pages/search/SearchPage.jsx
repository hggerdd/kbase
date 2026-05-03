import React from "react";
import { useSearchWorkspace } from "../../features/search/hooks.js";
import { SEARCH_SCOPE_OPTIONS } from "../../features/search/state.js";
import { LabelManagerLauncher } from "../../shared/labels/LabelManagerLauncher.jsx";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ClockIcon, FilterIcon, HistoryIcon, TagIcon } from "../../shared/ui/Icons.jsx";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Panel } from "../../shared/ui/Panel";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatDate } from "../../shared/utils/format";

function SearchResultRow({ item, isActive, onClick }) {
  return (
    <button type="button" className={`search-result-row ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="search-result-top">
        <strong>{item.title}</strong>
        <span>{item.item_kind}</span>
      </div>
      <div className="search-result-meta">
        <span>{item.category_key ?? "uncategorized"}</span>
        <span>{item.status ?? "draft"}</span>
        <span>{formatDate(item.updated_at, { dateStyle: "medium" })}</span>
      </div>
      {item.match_reason ? <small>Match: {item.match_reason}</small> : null}
    </button>
  );
}

function DetailValue({ label, value }) {
  return (
    <div className="detail-kv-row">
      <span>{label}</span>
      <strong>{value || "n/a"}</strong>
    </div>
  );
}

export function SearchPage({ searchRequest, onSearchStateChange }) {
  const workspace = useSearchWorkspace({ searchRequest, onSearchStateChange });
  const detailBody = workspace.selectedDetail?.primary_content_part?.content_text ?? "";

  return (
    <ResponsiveContainer>
      <PageHeader
        eyebrow="Search"
        title="Search"
        description="Scoped and advanced search across the knowledge base."
      />

      <StatusBanner error={workspace.error} />

      <div className="search-layout">
        <Panel
          className="search-results-panel"
          eyebrow={workspace.globalScope ? "Global results" : `Scoped to ${workspace.scope.label}`}
          title={`Results (${workspace.results.length})`}
        >
          {workspace.loading ? <p className="muted">Searching knowledge base...</p> : null}
          {!workspace.loading && workspace.results.length === 0 ? (
            <EmptyState
              title="No results yet"
              description="Run a search from the header or use the advanced form to build a targeted query."
            />
          ) : null}
          <div className="search-results-list">
            {workspace.results.map((item) => (
              <SearchResultRow
                key={item.id}
                item={item}
                isActive={item.id === workspace.selectedId}
                onClick={() => workspace.setSelectedId(item.id)}
              />
            ))}
          </div>
        </Panel>

        <div className="search-main-stack">
          <Panel
            eyebrow="Advanced"
            title="Refine search"
            action={
              <LabelManagerLauncher
                buttonLabel="Manage labels"
                buttonClassName="secondary compact-button"
                onLabelsChanged={workspace.refreshAvailableLabels}
              />
            }
          >
            <form className="search-advanced-form" onSubmit={workspace.handleSubmit}>
              <label className="search-field search-field-wide">
                <span>Query</span>
                <input
                  value={workspace.query}
                  onChange={(event) => workspace.setQuery(event.target.value)}
                  placeholder="Search titles, content, labels, and categories"
                />
              </label>

              <label className="search-field">
                <span>Scope</span>
                <select
                  value={workspace.scopeRoute}
                  disabled={workspace.globalScope}
                  onChange={(event) => workspace.setScopeRoute(event.target.value)}
                >
                  {SEARCH_SCOPE_OPTIONS.map((option) => (
                    <option key={option.route} value={option.route}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="search-field">
                <span>Mode</span>
                <label className="toggle-chip">
                  <input
                    type="checkbox"
                    checked={workspace.globalScope}
                    onChange={(event) => workspace.setGlobalScope(event.target.checked)}
                  />
                  <span>Global search</span>
                </label>
              </div>

              <label className="search-field">
                <span>Category keys</span>
                <input
                  value={workspace.filters.categoryKeysText}
                  onChange={(event) => workspace.updateFilter("categoryKeysText", event.target.value)}
                  placeholder="research, decision"
                />
              </label>

              <label className="search-field">
                <span>Category branches</span>
                <input
                  value={workspace.filters.categoryPathPrefixesText}
                  onChange={(event) => workspace.updateFilter("categoryPathPrefixesText", event.target.value)}
                  placeholder="knowledge, documents/finance"
                />
              </label>

              <label className="search-field">
                <span>Item kinds</span>
                <input
                  value={workspace.filters.itemKinds.join(", ")}
                  onChange={(event) =>
                    workspace.updateFilter(
                      "itemKinds",
                      event.target.value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="note, project, document"
                />
              </label>

              <label className="search-field">
                <span>Exact label paths</span>
                <input
                  value={workspace.filters.labelPathsText}
                  onChange={(event) => workspace.updateFilter("labelPathsText", event.target.value)}
                  placeholder="finance/investing, product/docs"
                />
              </label>

              <label className="search-field">
                <span>Label branches</span>
                <input
                  value={workspace.filters.labelPathPrefixesText}
                  onChange={(event) => workspace.updateFilter("labelPathPrefixesText", event.target.value)}
                  placeholder="finance, household/appliances"
                />
              </label>

              <label className="search-field">
                <span>Status</span>
                <input
                  value={workspace.filters.statusesText}
                  onChange={(event) => workspace.updateFilter("statusesText", event.target.value)}
                  placeholder="draft, active"
                />
              </label>

              <label className="search-field">
                <span>Created by</span>
                <input
                  value={workspace.filters.createdByText}
                  onChange={(event) => workspace.updateFilter("createdByText", event.target.value)}
                  placeholder="heiko"
                />
              </label>

              <label className="search-field">
                <span>Project id</span>
                <input
                  value={workspace.filters.projectId}
                  onChange={(event) => workspace.updateFilter("projectId", event.target.value)}
                  placeholder="Optional project scope"
                />
              </label>

              <label className="toggle-row search-field-wide">
                <input
                  type="checkbox"
                  checked={workspace.filters.includeArchived}
                  onChange={(event) => workspace.updateFilter("includeArchived", event.target.checked)}
                />
                <span>Include archived items</span>
              </label>

              <div className="search-filter-actions search-field-wide">
                <button className="primary" type="submit" disabled={workspace.loading}>
                  {workspace.loading ? "Searching..." : "Run search"}
                </button>
                <div className="search-inline-hint">
                  <FilterIcon />
                  <span>
                    {workspace.globalScope ? "Searching across the whole system" : `Scoped to ${workspace.scope.label}`}
                  </span>
                </div>
              </div>
            </form>

            {workspace.availableLabels.length > 0 ? (
              <div className="search-label-suggestions">
                <div className="sidebar-section-title">Known labels</div>
                <p className="muted search-label-hint">Tap to add a hierarchy branch filter.</p>
                <div className="token-list">
                  {workspace.availableLabels.slice(0, 12).map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      className="token-button"
                      onClick={() =>
                        workspace.updateFilter(
                          "labelPathPrefixesText",
                          workspace.filters.labelPathPrefixesText
                            ? `${workspace.filters.labelPathPrefixesText}, ${label.full_path}`
                            : label.full_path,
                        )
                      }
                    >
                      <TagIcon />
                      <span>{label.full_path}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel
            eyebrow="Preview"
            title={workspace.selectedSummary?.title ?? "Select a search result"}
            action={
              workspace.detailLoading ? (
                <span className="pill">
                  <ClockIcon />
                  Loading detail
                </span>
              ) : null
            }
          >
            {workspace.selectedSummary ? (
              <div className="search-detail-stack">
                <div className="detail-kv-grid">
                  <DetailValue label="Kind" value={workspace.selectedSummary.item_kind} />
                  <DetailValue label="Category" value={workspace.selectedSummary.category_key} />
                  <DetailValue label="Status" value={workspace.selectedSummary.status} />
                  <DetailValue label="Updated" value={formatDate(workspace.selectedSummary.updated_at, { dateStyle: "medium", timeStyle: "short" })} />
                </div>

                {workspace.selectedDetail?.labels?.length ? (
                  <div className="token-list">
                    {workspace.selectedDetail.labels.map((label) => (
                      <span key={label.id}>{label.full_path}</span>
                    ))}
                  </div>
                ) : null}

                {detailBody ? (
                  <pre className="search-detail-body">{detailBody}</pre>
                ) : (
                  <p className="muted">This item has no primary text body to preview.</p>
                )}
              </div>
            ) : (
              <EmptyState
                title="No result selected"
                description="Run a search and pick a result from the left column to inspect it here."
              />
            )}
          </Panel>

          <Panel
            eyebrow="History"
            title="Recent searches"
            action={
              workspace.history.length > 0 ? (
                <button className="secondary compact-button" type="button" onClick={workspace.clearHistory}>
                  Clear
                </button>
              ) : null
            }
          >
            {workspace.history.length === 0 ? (
              <p className="muted">Search history is stored locally once you start using this page.</p>
            ) : (
              <div className="search-history-list">
                {workspace.history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="history-search-row"
                    onClick={() => workspace.applyHistoryEntry(entry)}
                  >
                    <div>
                      <strong>{entry.query}</strong>
                      <p>
                        {entry.globalScope
                          ? "Global"
                          : SEARCH_SCOPE_OPTIONS.find((option) => option.route === entry.scopeRoute)?.label ?? "Scoped"}
                      </p>
                    </div>
                    <span>
                      <HistoryIcon />
                      {formatDate(entry.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
