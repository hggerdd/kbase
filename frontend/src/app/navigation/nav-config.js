export const NAV_ITEMS = [
  { id: "home", label: "Home", shortLabel: "HM" },
  { id: "search", label: "Search", shortLabel: "SR" },
  { id: "files", label: "Files", shortLabel: "FL" },
  { id: "notes", label: "Notes", shortLabel: "NT" },
  { id: "projects", label: "Projects", shortLabel: "PJ" },
  { id: "imports", label: "Imports", shortLabel: "IM" },
  { id: "settings", label: "Einstellungen", shortLabel: "ST" },
];

export function getRouteRoot(route) {
  return String(route || "home").split("/")[0];
}

export function getRouteFromHash(hash) {
  const normalizedHash = hash.replace(/^#/, "");
  const root = getRouteRoot(normalizedHash);
  if (root === "settings") {
    return normalizedHash || "settings/labels";
  }
  return NAV_ITEMS.some((item) => item.id === normalizedHash) ? normalizedHash : "home";
}

export function routeToHash(route) {
  return `#${route}`;
}
