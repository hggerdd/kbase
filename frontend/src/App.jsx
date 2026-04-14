import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "./app/AppShell";
import { NAV_ITEMS, getRouteFromHash, routeToHash } from "./app/navigation/nav-config";
import { HomePage } from "./pages/home/HomePage";
import { ImportsPage } from "./pages/imports/ImportsPage";
import { NotesPage } from "./pages/notes/NotesPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";

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
  const [globalSearch, setGlobalSearch] = useState("");
  const [notesSearchState, setNotesSearchState] = useState({ query: "", version: 0 });

  function handleGlobalSearchSubmit(event) {
    event.preventDefault();
    navigate("notes");
    setNotesSearchState((current) => ({
      query: globalSearch.trim(),
      version: current.version + 1,
    }));
  }

  const activePage = useMemo(() => {
    switch (route) {
      case "notes":
        return (
          <NotesPage
            externalSearch={notesSearchState.query}
            externalSearchVersion={notesSearchState.version}
          />
        );
      case "projects":
        return <ProjectsPage />;
      case "imports":
        return <ImportsPage />;
      case "home":
      default:
        return <HomePage onNavigate={navigate} onSeedSearch={setGlobalSearch} />;
    }
  }, [navigate, notesSearchState.query, notesSearchState.version, route]);

  return (
    <AppShell
      activeRoute={route}
      globalSearch={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      onGlobalSearchSubmit={handleGlobalSearchSubmit}
      onNavigate={navigate}
    >
      {activePage}
    </AppShell>
  );
}
