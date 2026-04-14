from __future__ import annotations


PRIMARY_CONTENT_PART_KIND = "markdown_body"
PROJECT_ITEM_KIND = "project"
NOTE_ITEM_KIND = "note"
FILE_ITEM_KINDS = {"document", "image", "spreadsheet", "summary"}
ITEM_FILE_ROLE_PRIMARY = "primary"

FORBIDDEN_METADATA_KEYS = {"due_at", "start_at", "end_at"}
