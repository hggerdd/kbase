import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "./app/AppShell";
import { NAV_ITEMS, getRouteFromHash, getRouteRoot, routeToHash } from "./app/navigation/nav-config";
import { fetchSession, login, logout } from "./features/auth/session";
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
    const normalizedRoute =
      NAV_ITEMS.some((item) => item.id === root) || ["notes", "projects", "settings"].includes(root)
        ? nextRoute
        : "home";
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
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [loginState, setLoginState] = useState({ username: "heiko", password: "heiko-local-dev", error: "", loading: false });
  const [route, navigate] = useHashRoute();
  const routeRoot = getRouteRoot(route);
  const [searchState, setSearchState] = useState({
    query: "",
    globalScope: false,
    scopeRoute: "home",
    version: 0,
  });

  useEffect(() => {
    fetchSession()
      .then((nextSession) => {
        setSession(nextSession);
      })
      .finally(() => {
        setSessionLoading(false);
      });
  }, []);

  function handleSearchStateChange(patch) {
    setSearchState((current) => ({
      ...current,
      ...patch,
    }));
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
        return <HomePage />;
    }
  }, [navigate, route, routeRoot, searchState]);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const nextSession = await login(loginState.username, loginState.password);
      setSession(nextSession);
    } catch (error) {
      setLoginState((current) => ({ ...current, error: error.message || "Login failed" }));
    } finally {
      setLoginState((current) => ({ ...current, loading: false }));
    }
  }

  async function handleLogout() {
    await logout();
    setSession(null);
  }

  if (sessionLoading) {
    return <div className="app-main">Session wird geladen…</div>;
  }

  if (!session) {
    return (
      <main className="app-main" style={{ maxWidth: 440, margin: "12vh auto", padding: "2rem" }}>
        <div className="panel">
          <h1 style={{ marginTop: 0 }}>kbase Login</h1>
          <p>Bitte melde dich an, um auf die Knowledge Base zuzugreifen.</p>
          <form onSubmit={handleLoginSubmit} style={{ display: "grid", gap: "0.85rem" }}>
            <input
              value={loginState.username}
              onChange={(event) => setLoginState((current) => ({ ...current, username: event.target.value }))}
              placeholder="Benutzername"
            />
            <input
              type="password"
              value={loginState.password}
              onChange={(event) => setLoginState((current) => ({ ...current, password: event.target.value }))}
              placeholder="Passwort"
            />
            {loginState.error ? <div className="status-banner error">{loginState.error}</div> : null}
            <button type="submit" disabled={loginState.loading}>
              {loginState.loading ? "Anmeldung läuft…" : "Anmelden"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      activeRoute={routeRoot}
      onLogout={handleLogout}
      onNavigate={navigate}
      session={session}
    >
      {activePage}
    </AppShell>
  );
}
