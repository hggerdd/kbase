import React from "react";

function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function HomeIcon() {
  return (
    <IconBase>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9.5 20v-5h5v5" />
    </IconBase>
  );
}

export function NoteIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h7l3 3V19.5H7z" />
      <path d="M14 4.5v3h3" />
      <path d="M9.5 11h5" />
      <path d="M9.5 14h5" />
    </IconBase>
  );
}

export function FolderIcon() {
  return (
    <IconBase>
      <path d="M3.5 7.5h6l2 2h9v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 7.5v-1a2 2 0 0 1 2-2H10l1.5 2h7a2 2 0 0 1 2 2v1" />
    </IconBase>
  );
}

export function InboxIcon() {
  return (
    <IconBase>
      <path d="M4 5.5h16l-2 11.5H6z" />
      <path d="M8 12.5h2.5l1.5 2h0l1.5-2H16" />
    </IconBase>
  );
}

export function SearchIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconBase>
  );
}

export function HelpIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.75 9.25a2.75 2.75 0 1 1 4.1 2.4c-.95.52-1.35 1-1.35 2.1" />
      <path d="M12 17.2h.01" />
    </IconBase>
  );
}

export function FileStackIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h8l3 3V18a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z" />
      <path d="M15 4.5v3h3" />
      <path d="M9 11h6" />
      <path d="M9 14h4" />
    </IconBase>
  );
}

export function SparkIcon() {
  return (
    <IconBase>
      <path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8Z" />
    </IconBase>
  );
}

export function ClockIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 1.8" />
    </IconBase>
  );
}

export function TagIcon() {
  return (
    <IconBase>
      <path d="M11 4.5h-5a1.5 1.5 0 0 0-1.5 1.5v5l8.5 8.5a1.5 1.5 0 0 0 2.1 0l4.4-4.4a1.5 1.5 0 0 0 0-2.1Z" />
      <circle cx="8" cy="8" r="1" />
    </IconBase>
  );
}

export function getNavIcon(routeId) {
  switch (routeId) {
    case "home":
      return HomeIcon;
    case "notes":
      return NoteIcon;
    case "projects":
      return FolderIcon;
    case "imports":
      return InboxIcon;
    default:
      return FileStackIcon;
  }
}
