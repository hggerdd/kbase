import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "./app/AppShell";
import { NAV_ITEMS, getRouteFromHash, routeToHash } from "./app/navigation/nav-config";
import { HomePage } from "./pages/home/HomePage";
import { ImportsPage } from "./pages/imports/ImportsPage";
import { NotesPage } from "./pages/notes/NotesPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { SearchPage } from "./pages/search/SearchPage";

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
    const normalizedRoute = NAV_ITEMS.some((item) => item.id === nextRoute) ? nextRoute : "home";
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
      scopeRoute: route === "search" ? current.scopeRoute : route,
      version: current.version + 1,
    }));
  }

  function handleSearchStateChange(patch) {
    setSearchState((current) => ({
      ...current,
      ...patch,
    }));
  }

  function seedGlobalSearch(query, { navigateTo = false, scopeRoute = route } = {}) {
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
    switch (route) {
      case "search":
        return <SearchPage searchRequest={searchState} onSearchStateChange={handleSearchStateChange} />;
      case "notes":
        return <NotesPage />;
      case "projects":
        return <ProjectsPage />;
      case "imports":
        return <ImportsPage />;
      case "home":
      default:
        return <HomePage onNavigate={navigate} onSeedSearch={seedGlobalSearch} />;
    }
  }, [navigate, route, searchState]);

  const searchContextRoute = route === "search" ? searchState.scopeRoute : route;

  return (
    <AppShell
      activeRoute={route}
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
