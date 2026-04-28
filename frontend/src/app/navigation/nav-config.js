export const NAV_ITEMS = [
  { id: "home", label: "Home", shortLabel: "HM" },
  { id: "search", label: "Search", shortLabel: "SR" },
  { id: "files", label: "Files", shortLabel: "FL" },
  { id: "imports", label: "Imports", shortLabel: "IM" },
];

const AUXILIARY_ROUTE_ROOTS = new Set(["notes", "projects", "settings"]);

export function getRouteRoot(route) {
  return String(route || "home").split("/")[0];
}

export function getRouteFromHash(hash) {
  const normalizedHash = hash.replace(/^#/, "");
  const root = getRouteRoot(normalizedHash);
  if (root === "settings") {
    return normalizedHash || "settings/labels";
  }
  if (NAV_ITEMS.some((item) => item.id === normalizedHash)) {
    return normalizedHash;
  }
  return AUXILIARY_ROUTE_ROOTS.has(root) ? normalizedHash : "home";
}

export function routeToHash(route) {
  return `#${route}`;
}
