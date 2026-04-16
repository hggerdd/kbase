import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "./app/AppShell";
import { NAV_ITEMS, getRouteFromHash, getRouteRoot, routeToHash } from "./app/navigation/nav-config";
import { HomePage } from "./pages/home/HomePage";
import { FileViewerPage } from "./pages/files/FileViewerPage";
import { ImportsPage } from "./pages/imports/ImportsPage";
import { NotesPage } from "./pages/notes/NotesPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { SearchPage } from "./pages/search/SearchPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

function useHashRoute() {
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash));

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(nextRoute) {
    const root = getRouteRoot(nextRoute);
    const normalizedRoute = NAV_ITEMS.some((item) => item.id === root) ? nextRoute : "home";
    const nextHash = routeToHash(normalizedRoute);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }
    setRoute(normalizedRoute);
  }

  return [route, navigate];
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const routeRoot = getRouteRoot(route);
  const [searchState, setSearchState] = useState({
    query: "",
    globalScope: false,
    scopeRoute: "home",
    version: 0,
  });

  function handleGlobalSearchSubmit(event) {
    event.preventDefault();
    navigate("search");
    setSearchState((current) => ({
      ...current,
      query: current.query.trim(),
      scopeRoute: routeRoot === "search" ? current.scopeRoute : routeRoot,
      version: current.version + 1,
    }));
  }

  function handleSearchStateChange(patch) {
    setSearchState((current) => ({
      ...current,
      ...patch,
    }));
  }

  function seedGlobalSearch(query, { navigateTo = false, scopeRoute = routeRoot } = {}) {
    setSearchState((current) => ({
      ...current,
      query,
      globalScope: false,
      scopeRoute,
      version: navigateTo ? current.version + 1 : current.version,
    }));

    if (navigateTo) {
      navigate("search");
    }
  }

  const activePage = useMemo(() => {
    switch (routeRoot) {
      case "search":
        return <SearchPage searchRequest={searchState} onSearchStateChange={handleSearchStateChange} />;
      case "files":
        return <FileViewerPage />;
      case "notes":
        return <NotesPage />;
      case "projects":
        return <ProjectsPage />;
      case "imports":
        return <ImportsPage />;
      case "settings":
        return <SettingsPage route={route} onNavigate={navigate} />;
      case "home":
      default:
        return <HomePage onNavigate={navigate} onSeedSearch={seedGlobalSearch} />;
    }
  }, [navigate, route, routeRoot, searchState]);

  const searchContextRoute = routeRoot === "search" ? searchState.scopeRoute : routeRoot;

  return (
    <AppShell
      activeRoute={routeRoot}
      globalScope={searchState.globalScope}
      globalSearch={searchState.query}
      onGlobalScopeChange={(value) => handleSearchStateChange({ globalScope: value })}
      onGlobalSearchChange={(value) => handleSearchStateChange({ query: value })}
      onGlobalSearchSubmit={handleGlobalSearchSubmit}
      onNavigate={navigate}
      searchContextRoute={searchContextRoute}
    >
      {activePage}
    </AppShell>
  );
}
