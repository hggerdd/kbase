import React from "react";
import { BottomNav } from "./navigation/BottomNav";
import { NAV_ITEMS } from "./navigation/nav-config";
import { getNavIcon, HelpIcon, SearchIcon } from "../shared/ui/Icons";
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
        <header className="app-bar">
          <div className="app-bar-left">
            <div className="app-bar-brand">
              <strong>kbase</strong>
              <span>{activeNav.label}</span>
            </div>
            <div className="app-breadcrumbs">
              <span>Workspace</span>
              <span className="breadcrumb-sep">/</span>
              <span>{activeNav.label}</span>
            </div>
          </div>

          <form className="global-search" onSubmit={onGlobalSearchSubmit}>
            <span className="input-icon">
              <SearchIcon />
            </span>
            <input
              value={globalSearch}
              onChange={(event) => onGlobalSearchChange(event.target.value)}
              placeholder="Search notes, docs, decisions, projects"
              aria-label="Global search"
            />
            <label className="search-toggle">
              <input
                type="checkbox"
                checked={globalScope}
                onChange={(event) => onGlobalScopeChange(event.target.checked)}
              />
              <span>Global</span>
            </label>
            <span className="search-scope-pill">{globalScope ? "All content" : searchScope.label}</span>
            <button type="submit">Search</button>
          </form>

          <div className="app-bar-actions">
            <button className="header-link" type="button">
              <span className="header-link-icon">
                <HelpIcon />
              </span>
              <span>Help</span>
            </button>
            <div className="header-avatar">{activeNav.shortLabel.slice(0, 1)}</div>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </section>

      <BottomNav activeRoute={activeRoute} onNavigate={onNavigate} />
    </div>
  );
}
