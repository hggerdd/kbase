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

export function FolderClosedIcon() {
  return (
    <IconBase>
      <path d="M3.5 8h6l1.8 1.8H20a1.5 1.5 0 0 1 1.5 1.5v6.8a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8z" />
      <path d="M3.5 8V6.7a1.7 1.7 0 0 1 1.7-1.7h4.5l1.5 1.7h7.1A1.7 1.7 0 0 1 20 8.4v1.4" />
    </IconBase>
  );
}

export function FolderOpenIcon() {
  return (
    <IconBase>
      <path d="M2.8 10.2h18.4l-1.8 8a1.7 1.7 0 0 1-1.6 1.3H6.1a1.7 1.7 0 0 1-1.7-1.4z" />
      <path d="M3.5 8.1V6.8a1.8 1.8 0 0 1 1.8-1.8h4.3l1.6 1.8h7.1a1.8 1.8 0 0 1 1.8 1.8v1.6" />
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

export function FilterIcon() {
  return (
    <IconBase>
      <path d="M4.5 6.5h15" />
      <path d="M7.5 12h9" />
      <path d="M10.5 17.5h3" />
    </IconBase>
  );
}

export function HistoryIcon() {
  return (
    <IconBase>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 5.5v4h4" />
      <path d="M12 8.5v4l2.5 1.5" />
    </IconBase>
  );
}

export function PencilIcon() {
  return (
    <IconBase>
      <path d="m4.5 19.5 4.2-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.7 15.5z" />
      <path d="m13.8 7.4 2.8 2.8" />
    </IconBase>
  );
}

export function HelpIcon() {
  return (
    <IconBase>
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

export function GenericFileIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h7l3 3V19H7z" />
      <path d="M14 4.5v3h3" />
    </IconBase>
  );
}

export function TextFileIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h7l3 3V19H7z" />
      <path d="M14 4.5v3h3" />
      <path d="M9.2 11.1h5.6" />
      <path d="M9.2 14h5.6" />
      <path d="M9.2 16.9h4.1" />
    </IconBase>
  );
}

export function PdfFileIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h7l3 3V19H7z" />
      <path d="M14 4.5v3h3" />
      <path d="M9 15.8V11h1.9a1.2 1.2 0 0 1 0 2.4H9" />
      <path d="M12.1 15.8V11h1.4a2 2 0 0 1 0 4.8h-1.4" />
      <path d="M15.4 15.8V11h2.5" />
      <path d="M15.4 13.4H17.3" />
    </IconBase>
  );
}

export function ImageFileIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h7l3 3V19H7z" />
      <path d="M14 4.5v3h3" />
      <circle cx="10.2" cy="11" r="1.1" />
      <path d="m9 16 2.2-2.4 1.8 1.7 1.8-2.1 1.2 2.8" />
    </IconBase>
  );
}

export function SheetFileIcon() {
  return (
    <IconBase>
      <path d="M7 4.5h7l3 3V19H7z" />
      <path d="M14 4.5v3h3" />
      <path d="M9 11h6" />
      <path d="M9 14h6" />
      <path d="M11 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function ExplorerTreeIcon() {
  return (
    <IconBase>
      <path d="M6.5 5.5h5" />
      <path d="M6.5 12h5" />
      <path d="M12 5.5v13" />
      <path d="M12 9h4.5" />
      <path d="M12 15.5h4.5" />
      <rect x="3.5" y="4" width="3" height="3" />
      <rect x="3.5" y="10.5" width="3" height="3" />
      <rect x="16.5" y="7.5" width="4" height="3" />
      <rect x="16.5" y="14" width="4" height="3" />
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

export function SettingsIcon() {
  return (
    <IconBase>
      <path d="M12 8.3a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Z" />
      <path d="M19.2 13.3a7.7 7.7 0 0 0 .1-1.3 7.7 7.7 0 0 0-.1-1.3l2-1.5-2-3.4-2.4 1a7.7 7.7 0 0 0-2.2-1.3L14.3 3h-4.6l-.4 2.5a7.7 7.7 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0-.1 1.3 7.7 7.7 0 0 0 .1 1.3l-2 1.5 2 3.4 2.4-1a7.7 7.7 0 0 0 2.2 1.3l.4 2.5h4.6l.4-2.5a7.7 7.7 0 0 0 2.2-1.3l2.4 1 2-3.4Z" />
    </IconBase>
  );
}

export function PlusIcon() {
  return (
    <IconBase>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function XIcon() {
  return (
    <IconBase>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}

export function TrashIcon() {
  return (
    <IconBase>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V4.5h5v2" />
      <path d="M7 9l.8 10.5h8.4L17 9" />
      <path d="M10.5 11.5v5" />
      <path d="M13.5 11.5v5" />
    </IconBase>
  );
}

export function getNavIcon(routeId) {
  switch (routeId) {
    case "home":
      return HomeIcon;
    case "search":
      return SearchIcon;
    case "settings":
      return SettingsIcon;
    case "files":
      return ExplorerTreeIcon;
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
