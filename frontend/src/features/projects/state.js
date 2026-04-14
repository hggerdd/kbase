export const PROJECT_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Notes" },
  { id: "files", label: "Files" },
];

export function isFileKind(itemKind) {
  return itemKind === "document" || itemKind === "image" || itemKind === "spreadsheet";
}
