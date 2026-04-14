export const PROJECT_SECTIONS = [
  { id: "items", label: "Items" },
  { id: "notes", label: "Notes" },
  { id: "files", label: "Files" },
];

export function isFileKind(itemKind) {
  return itemKind === "document" || itemKind === "image" || itemKind === "spreadsheet";
}
