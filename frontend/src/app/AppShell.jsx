import React, { useEffect, useState } from "react";
import { BottomNav } from "./navigation/BottomNav";
import { NAV_ITEMS } from "./navigation/nav-config";
import { getNavIcon, HelpIcon, PlusIcon, SearchIcon } from "../shared/ui/Icons";
import { AppBarPageHeader } from "../shared/ui/AppBarPageHeader";
import { getSearchScopeForRoute } from "../features/search/state.js";

const PAGE_HEADER_CONFIG = {
  notes: {
    title: "Notizen",
    singular: "Notiz",
    plural: "Notizen",
    addLabel: "Notiz hinzufügen",
    createEvent: "kbase:notes-create",
    statusLabel: "Notes connected",
  },
  projects: {
    title: "Projekt",
    singular: "Projekt",
    plural: "Projekte",
    addLabel: "Projekt hinzufügen",
    createEvent: "kbase:projects-create",
    statusLabel: "Projects connected",
  },
};

export function AppShell({
  activeRoute,
  children,
  globalScope,
  globalSearch,
  onGlobalScopeChange,
  onGlobalSearchChange,
  onGlobalSearchSubmit,
  onNavigate,
  searchContextRoute,
}) {
  const activeNav = NAV_ITEMS.find((item) => item.id === activeRoute) ?? NAV_ITEMS[0];
  const searchScope = getSearchScopeForRoute(searchContextRoute, globalScope);
  const pageHeaderConfig = PAGE_HEADER_CONFIG[activeRoute] ?? null;
  const showGlobalSearch = !pageHeaderConfig;
  const [pageHeaderMeta, setPageHeaderMeta] = useState({
    notes: { count: 0 },
    projects: { count: 0 },
  });

  useEffect(() => {
    function handlePageHeaderMeta(event) {
      const route = event.detail?.route;
      if (!route || !PAGE_HEADER_CONFIG[route]) {
        return;
      }
      setPageHeaderMeta((current) => ({
        ...current,
        [route]: { count: Number(event.detail?.count ?? 0) },
      }));
    }

    window.addEventListener("kbase:page-header-meta", handlePageHeaderMeta);
    return () => window.removeEventListener("kbase:page-header-meta", handlePageHeaderMeta);
  }, []);

  const activePageMeta = pageHeaderMeta[activeRoute] ?? { count: 0 };
  const activeCountLabel = pageHeaderConfig
    ? `${activePageMeta.count} ${activePageMeta.count === 1 ? pageHeaderConfig.singular : pageHeaderConfig.plural}`
    : "";

  const handlePageCreateClick = () => {
    if (pageHeaderConfig?.createEvent) {
      window.dispatchEvent(new CustomEvent(pageHeaderConfig.createEvent));
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar app-rail">
        <div className="brand-mark brand-mark-rail">kb</div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            (() => {
              const Icon = getNavIcon(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-link sidebar-link-rail ${activeRoute === item.id ? "active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className="sidebar-link-icon">
                    <Icon />
                  </span>
                </button>
              );
            })()
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="session-chip session-chip-rail">
            <span className="session-dot" />
          </div>
        </div>
      </aside>

      <section className="app-content">
        <header className={`app-bar ${showGlobalSearch ? "" : "app-bar-page"}`.trim()}>
          {showGlobalSearch ? (
            <div className="app-bar-left">
              <div className="app-bar-brand">
                <strong>kbase</strong>
                <span>{activeNav.label}</span>
              </div>
            </div>
          ) : null}

          {showGlobalSearch ? (
            <form className="global-search" onSubmit={onGlobalSearchSubmit}>
              <span className="input-icon">
                <SearchIcon />
              </span>
              <div className="global-search-input-group">
                <input
                  value={globalSearch}
                  onChange={(event) => onGlobalSearchChange(event.target.value)}
                  placeholder="Search notes, docs, decisions, projects"
                  aria-label="Global search"
                />
                <label className="search-toggle global-search-toggle">
                  <input
                    type="checkbox"
                    checked={globalScope}
                    onChange={(event) => onGlobalScopeChange(event.target.checked)}
                  />
                  <span>Global</span>
                </label>
              </div>
              <span className="search-scope-pill">{globalScope ? "All content" : searchScope.label}</span>
              <button className="global-search-submit" type="submit">Search</button>
            </form>
          ) : (
            <div className="app-bar-page-slot">
              <AppBarPageHeader
                title={pageHeaderConfig.title}
                countLabel={activeCountLabel}
                status={{ label: pageHeaderConfig.statusLabel }}
              />
            </div>
          )}

          <div className="app-bar-actions">
            {!showGlobalSearch ? (
              <button
                className="header-link header-icon-button"
                type="button"
                aria-label={pageHeaderConfig.addLabel}
                title={pageHeaderConfig.addLabel}
                onClick={handlePageCreateClick}
              >
                <span className="header-link-icon">
                  <PlusIcon />
                </span>
              </button>
            ) : null}
            <button className="header-link header-help-button" type="button" aria-label="Help" title="Help">
              <span className="header-link-icon">
                <HelpIcon />
              </span>
            </button>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </section>

      <BottomNav activeRoute={activeRoute} onNavigate={onNavigate} />
    </div>
  );
}
