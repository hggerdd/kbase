export const NAV_ITEMS = [
  { id: "home", label: "Home", shortLabel: "HM" },
  { id: "notes", label: "Notes", shortLabel: "NT" },
  { id: "projects", label: "Projects", shortLabel: "PJ" },
  { id: "imports", label: "Imports", shortLabel: "IM" },
];

export function getRouteFromHash(hash) {
  const normalizedHash = hash.replace(/^#/, "");
  return NAV_ITEMS.some((item) => item.id === normalizedHash) ? normalizedHash : "home";
}

export function routeToHash(route) {
  return `#${route}`;
}
