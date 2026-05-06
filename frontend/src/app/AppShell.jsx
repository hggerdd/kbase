import React, { useEffect, useMemo, useState } from "react";
import { BottomNav } from "./navigation/BottomNav";
import { NAV_ITEMS } from "./navigation/nav-config";
import { getNavIcon, HelpIcon, PlusIcon, SettingsIcon } from "../shared/ui/Icons";
import { AppBarPageHeader } from "../shared/ui/AppBarPageHeader";
import { getBuildInfo } from "../shared/build-info.js";

const PAGE_HEADER_CONFIG = {
  home: {
    title: "Home",
    singular: "Notiz",
    plural: "Notizen",
    addLabel: "Notiz hinzufügen",
    createEvent: "kbase:notes-create",
    statusLabel: "Notes connected",
  },
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
  files: {
    title: "Files",
    singular: "Datei",
    plural: "Dateien",
    statusLabel: "Files connected",
  },
};

export function AppShell({
  activeRoute,
  children,
  onLogout,
  onNavigate,
  session,
}) {
  const activeNav = useMemo(() => {
    if (activeRoute === "notes") {
      return NAV_ITEMS.find((item) => item.id === "home") ?? NAV_ITEMS[0];
    }
    return NAV_ITEMS.find((item) => item.id === activeRoute) ?? NAV_ITEMS[0];
  }, [activeRoute]);
  const buildInfo = getBuildInfo();
  const pageHeaderConfig = PAGE_HEADER_CONFIG[activeRoute] ?? null;
  const isWorkspaceRoute = activeRoute === "home" || activeRoute === "notes" || activeRoute === "files";
  const [pageHeaderMeta, setPageHeaderMeta] = useState({
    home: { count: 0 },
    notes: { count: 0 },
    projects: { count: 0 },
    files: { count: 0 },
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
                  className={`sidebar-link sidebar-link-rail ${activeNav.id === item.id ? "active" : ""}`}
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
          <button
            type="button"
            className={`sidebar-link sidebar-link-rail ${activeRoute === "settings" ? "active" : ""}`}
            onClick={() => onNavigate("settings/labels")}
            aria-label="Settings"
            title="Settings"
          >
            <span className="sidebar-link-icon">
              <SettingsIcon />
            </span>
          </button>
          <div className="session-chip session-chip-rail">
            <span className="session-dot" />
            <span>{session?.username ?? "guest"}</span>
          </div>
        </div>
      </aside>

      <section className="app-content">
        <header className="app-bar app-bar-page">
          <div className="app-bar-page-slot">
            {pageHeaderConfig ? (
              <AppBarPageHeader
                title={pageHeaderConfig.title}
                countLabel={activeCountLabel}
                status={{ label: pageHeaderConfig.statusLabel }}
              />
            ) : (
              <div className="app-bar-compact-title">
                <strong>{activeNav.label}</strong>
              </div>
            )}
          </div>

          <div className="app-bar-actions">
            <div
              className="build-version-chip"
              title={`Deployment: ${buildInfo.deployment}\nBranch: ${buildInfo.branch}\nCommit: ${buildInfo.commitHash}\nCommit date: ${buildInfo.commitDateLabel}`}
            >
              <span className="build-version-env">{buildInfo.deployment}</span>
              <span className="build-version-branch">{buildInfo.branch}</span>
              <span className="build-version-commit">{buildInfo.commitShort}</span>
              <span className="build-version-date">{buildInfo.commitDateLabel}</span>
            </div>
            {pageHeaderConfig?.createEvent ? (
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
            <button className="header-link" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className={`app-main ${isWorkspaceRoute ? "app-main-workspace" : ""}`.trim()}>{children}</main>
      </section>

      <BottomNav activeRoute={activeNav.id} onNavigate={onNavigate} />
    </div>
  );
}
