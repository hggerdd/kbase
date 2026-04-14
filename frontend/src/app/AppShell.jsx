import React, { useEffect, useState } from "react";
import { BottomNav } from "./navigation/BottomNav";
import { NAV_ITEMS } from "./navigation/nav-config";
import { getNavIcon, HelpIcon, PlusIcon, SearchIcon } from "../shared/ui/Icons";
import { getSearchScopeForRoute } from "../features/search/state.js";

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
  const showGlobalSearch = activeRoute !== "projects";
  const [projectHeaderMeta, setProjectHeaderMeta] = useState({ count: 0 });

  useEffect(() => {
    function handleProjectHeaderMeta(event) {
      setProjectHeaderMeta({ count: Number(event.detail?.count ?? 0) });
    }

    window.addEventListener("kbase:projects-header-meta", handleProjectHeaderMeta);
    return () => window.removeEventListener("kbase:projects-header-meta", handleProjectHeaderMeta);
  }, []);

  const projectMeta = activeRoute === "projects" ? (
    <div className="app-bar-project-meta">
      <strong>Projekt</strong>
      <span className="projects-header-count">
        {projectHeaderMeta.count} {projectHeaderMeta.count === 1 ? "Projekt" : "Projekte"}
      </span>
      <span className="projects-header-status" aria-label="Projects connected" title="Projects connected">
        <span className="pulse-dot" />
      </span>
    </div>
  ) : null;

  const handleProjectCreateClick = () => {
    window.dispatchEvent(new CustomEvent("kbase:projects-create"));
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
        <header className={`app-bar ${showGlobalSearch ? "" : "app-bar-projects"}`.trim()}>
          <div className="app-bar-left">
            <div className="app-bar-brand">
              <strong>kbase</strong>
              {showGlobalSearch ? <span>{activeNav.label}</span> : null}
            </div>
          </div>

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
            <div className="app-bar-project-slot">{projectMeta}</div>
          )}

          <div className="app-bar-actions">
            {!showGlobalSearch ? (
              <button
                className="header-link header-icon-button"
                type="button"
                aria-label="Add project"
                title="Add project"
                onClick={handleProjectCreateClick}
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
              <span className="header-link-text">Help</span>
            </button>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </section>

      <BottomNav activeRoute={activeRoute} onNavigate={onNavigate} />
    </div>
  );
}
