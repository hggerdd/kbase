# Technology Proposals

Status: historical design background. This file is not the current runbook.
Prefer `README.md`, `DATA_MAP.md`, `API_DOKU.md`, `FRONTEND_APP.md`,
`todo.md`, and the live code when behavior differs.

## Dateistruktur

```text
kb/
  inbox/
    raw/
    processing/
    rejected/

  workspaces/
    projects/
    reviews/

  items/
    notes/
      aa/
      b4/
    documents/
      aa/
      b4/
    images/
      aa/
      b4/
    spreadsheets/
      aa/
      b4/
    summaries/
      aa/
      b4/

  exports/
  db/
    kb.sqlite
  logs/
```

## Überblick

Diese Datei beschreibt das konsolidierte Schema für das Knowledge-Base-System und die dazugehörige Dateistruktur.

Wichtige Prinzipien:

- Generischer, content-zentrierter Kern
- Technische Typen getrennt von inhaltlicher Klassifikation
- ULID als Primärschlüssel
- Flexible Metadatengruppen
- Hierarchische Labels
- Principal-Ansatz für Multiuser
- Tasks / Events / Wiederholungen / Notifications
- Observation Series für Zeitreihen wie Gewicht
- Kanonische Key-Werte in `lowercase_snake_case`

## Struktur

- SQL-Schema
- Sinnvolle Indizes
- Seed-Tabellen für Auswahlwerte
- Empfohlene Start-Filesystem-Struktur

## 1. Vollständiges SQL-Schema

```sql
PRAGMA foreign_keys = ON;

-- =========================================================
-- 1) STAMMDATEN / AUSWAHLWERTE
-- =========================================================

CREATE TABLE item_kinds (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

CREATE TABLE item_categories (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    applies_to_kind TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);

CREATE TABLE content_part_kinds (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

CREATE TABLE link_types (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    symmetric INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE permissions (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

CREATE TABLE subject_relation_types (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

CREATE TABLE workflow_states (
    workflow_type TEXT NOT NULL,
    state_key TEXT NOT NULL,
    label TEXT NOT NULL,
    is_terminal INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (workflow_type, state_key)
);

CREATE TABLE metric_definitions (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    default_unit TEXT,
    value_type TEXT NOT NULL, -- number, integer, text, boolean, json
    description TEXT
);

-- =========================================================
-- 2) PRINCIPALS / MULTIUSER
-- =========================================================

CREATE TABLE principals (
    id TEXT PRIMARY KEY,                  -- ULID
    principal_type TEXT NOT NULL,        -- person, group, service
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE principal_memberships (
    principal_id TEXT NOT NULL,          -- usually the group
    member_principal_id TEXT NOT NULL,   -- member of that group
    role TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (principal_id, member_principal_id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (member_principal_id) REFERENCES principals(id)
);

-- =========================================================
-- 3) CORE ITEMS
-- =========================================================

CREATE TABLE items (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    item_kind TEXT NOT NULL,
    category_key TEXT,
    mime_type TEXT,
    source_path TEXT,                     -- optional relative path
    content_hash TEXT,
    language_code TEXT,
    status TEXT,                          -- generic lifecycle status
    origin TEXT NOT NULL,                 -- manual, import, generated
    created_by_principal_id TEXT,
    parent_item_id TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_kind) REFERENCES item_kinds(key),
    FOREIGN KEY (category_key) REFERENCES item_categories(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    FOREIGN KEY (parent_item_id) REFERENCES items(id)
);

CREATE TABLE item_files (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    file_role TEXT NOT NULL,              -- primary, attachment, preview, extracted
    relative_path TEXT NOT NULL,
    original_filename TEXT,
    extension TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    checksum_sha256 TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE content_parts (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    part_kind TEXT NOT NULL,
    sequence_no INTEGER NOT NULL DEFAULT 0,
    page_no INTEGER,
    heading_path TEXT,
    content_text TEXT NOT NULL,
    source_method TEXT NOT NULL,          -- manual, parser, ocr, llm
    quality_score REAL,
    token_count INTEGER,
    language_code TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (part_kind) REFERENCES content_part_kinds(key)
);

CREATE TABLE item_links (
    id TEXT PRIMARY KEY,                  -- ULID
    from_item_id TEXT NOT NULL,
    to_item_id TEXT NOT NULL,
    link_type TEXT NOT NULL,
    source TEXT NOT NULL,                 -- manual, inferred, imported, llm
    confidence REAL,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (from_item_id) REFERENCES items(id),
    FOREIGN KEY (to_item_id) REFERENCES items(id),
    FOREIGN KEY (link_type) REFERENCES link_types(key)
);

-- =========================================================
-- 4) METADATA
-- =========================================================

CREATE TABLE metadata_groups (
    id TEXT PRIMARY KEY,                  -- ULID
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    applies_to_kind TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);

CREATE TABLE metadata_fields (
    id TEXT PRIMARY KEY,                  -- ULID
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL,             -- string, number, date, datetime, boolean, json
    applies_to_kind TEXT,
    is_multivalue INTEGER NOT NULL DEFAULT 0,
    is_system INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);

CREATE TABLE group_fields (
    group_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    is_required INTEGER NOT NULL DEFAULT 0,
    order_no INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (group_id, field_id),
    FOREIGN KEY (group_id) REFERENCES metadata_groups(id),
    FOREIGN KEY (field_id) REFERENCES metadata_fields(id)
);

CREATE TABLE item_metadata (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    value_text TEXT,
    value_number REAL,
    value_date TEXT,
    value_datetime TEXT,
    value_bool INTEGER,
    value_json TEXT,
    source TEXT NOT NULL,                 -- manual, extracted, inferred, imported
    confidence REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (field_id) REFERENCES metadata_fields(id)
);

-- =========================================================
-- 5) LABELS
-- =========================================================

CREATE TABLE label_nodes (
    id TEXT PRIMARY KEY,                  -- ULID
    name TEXT NOT NULL,
    full_path TEXT NOT NULL UNIQUE,
    parent_id TEXT,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES label_nodes(id)
);

CREATE TABLE item_labels (
    item_id TEXT NOT NULL,
    label_id TEXT NOT NULL,
    source TEXT NOT NULL,                 -- manual, extracted, inferred
    confidence REAL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, label_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (label_id) REFERENCES label_nodes(id)
);

-- =========================================================
-- 6) ACL / BETROFFENHEIT
-- =========================================================

CREATE TABLE item_acl (
    item_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    granted_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, principal_id, permission_key),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (permission_key) REFERENCES permissions(key),
    FOREIGN KEY (granted_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE item_subjects (
    item_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, principal_id, relation_type),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (relation_type) REFERENCES subject_relation_types(key)
);

-- =========================================================
-- 7) TASKS / EVENTS / PLANBARE OBJEKTE
-- =========================================================

CREATE TABLE item_states (
    item_id TEXT PRIMARY KEY,
    workflow_type TEXT NOT NULL,          -- task, event
    state_key TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    cancelled_at TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (workflow_type, state_key)
        REFERENCES workflow_states(workflow_type, state_key)
);

CREATE TABLE datetime_properties (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    property_key TEXT NOT NULL,           -- due_at, start_at, end_at, remind_at, snoozed_until
    value_datetime TEXT NOT NULL,
    timezone TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE recurrence_rules (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,              -- rrule, simple
    rule_text TEXT NOT NULL,
    anchor_datetime TEXT,
    timezone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,      -- reminder, deadline_warning, review_prompt
    trigger_mode TEXT NOT NULL,           -- absolute, relative, recurrence_instance
    relative_to_key TEXT,
    offset_minutes INTEGER,
    trigger_at TEXT,
    channel_key TEXT,                     -- in_app, email, push
    is_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE item_occurrences (
    id TEXT PRIMARY KEY,                  -- ULID
    parent_item_id TEXT NOT NULL,
    occurrence_start TEXT,
    occurrence_end TEXT,
    due_at TEXT,
    state_key TEXT,                       -- open, done, skipped, cancelled, scheduled
    generated_at TEXT NOT NULL,
    source_rule_id TEXT,
    FOREIGN KEY (parent_item_id) REFERENCES items(id),
    FOREIGN KEY (source_rule_id) REFERENCES recurrence_rules(id)
);

-- =========================================================
-- 8) OBSERVATIONS / ZEITREIHEN
-- =========================================================

CREATE TABLE observation_series (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    series_key TEXT UNIQUE,
    metric_key TEXT NOT NULL,
    unit TEXT,
    value_type TEXT NOT NULL,             -- number, integer, text, boolean, json
    subject_principal_id TEXT,
    created_by_principal_id TEXT,
    item_id TEXT,                         -- optional linked note/item describing the series
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (metric_key) REFERENCES metric_definitions(key),
    FOREIGN KEY (subject_principal_id) REFERENCES principals(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE observation_series_acl (
    series_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    granted_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (series_id, principal_id, permission_key),
    FOREIGN KEY (series_id) REFERENCES observation_series(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (permission_key) REFERENCES permissions(key),
    FOREIGN KEY (granted_by_principal_id) REFERENCES principals(id)
);

CREATE TABLE observations (
    id TEXT PRIMARY KEY,                  -- ULID
    series_id TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    value_number REAL,
    value_text TEXT,
    value_bool INTEGER,
    value_json TEXT,
    note TEXT,
    source TEXT NOT NULL,                 -- manual, imported, device, inferred
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (series_id) REFERENCES observation_series(id)
);

-- =========================================================
-- 9) INGESTION / PROCESSING
-- =========================================================

CREATE TABLE ingestion_runs (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    run_type TEXT NOT NULL,               -- import, parse, ocr, classify, summarize
    tool_name TEXT,
    tool_version TEXT,
    status TEXT NOT NULL,                 -- success, failed, partial
    started_at TEXT NOT NULL,
    finished_at TEXT,
    note TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE saved_queries (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    query_json TEXT NOT NULL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);
```

## 2. Sinnvolle Indizes

```sql
CREATE INDEX idx_items_item_kind ON items(item_kind);
CREATE INDEX idx_items_category_key ON items(category_key);
CREATE INDEX idx_items_created_by ON items(created_by_principal_id);
CREATE INDEX idx_items_parent_item_id ON items(parent_item_id);
CREATE INDEX idx_items_updated_at ON items(updated_at);

CREATE INDEX idx_item_files_item_id ON item_files(item_id);

CREATE INDEX idx_content_parts_item_id ON content_parts(item_id);
CREATE INDEX idx_content_parts_part_kind ON content_parts(part_kind);

CREATE INDEX idx_item_links_from_item_id ON item_links(from_item_id);
CREATE INDEX idx_item_links_to_item_id ON item_links(to_item_id);
CREATE INDEX idx_item_links_link_type ON item_links(link_type);

CREATE INDEX idx_item_metadata_item_id ON item_metadata(item_id);
CREATE INDEX idx_item_metadata_field_id ON item_metadata(field_id);

CREATE INDEX idx_item_labels_label_id ON item_labels(label_id);

CREATE INDEX idx_item_acl_principal_id ON item_acl(principal_id);
CREATE INDEX idx_item_subjects_principal_id ON item_subjects(principal_id);

CREATE INDEX idx_datetime_properties_item_id ON datetime_properties(item_id);
CREATE INDEX idx_datetime_properties_property_key ON datetime_properties(property_key);
CREATE INDEX idx_datetime_properties_value_datetime ON datetime_properties(value_datetime);

CREATE INDEX idx_recurrence_rules_item_id ON recurrence_rules(item_id);
CREATE INDEX idx_notifications_item_id ON notifications(item_id);
CREATE INDEX idx_item_occurrences_parent_item_id ON item_occurrences(parent_item_id);
CREATE INDEX idx_item_occurrences_due_at ON item_occurrences(due_at);
CREATE INDEX idx_item_occurrences_occurrence_start ON item_occurrences(occurrence_start);

CREATE INDEX idx_observation_series_metric_key ON observation_series(metric_key);
CREATE INDEX idx_observation_series_subject_principal_id ON observation_series(subject_principal_id);
CREATE INDEX idx_observations_series_id ON observations(series_id);
CREATE INDEX idx_observations_observed_at ON observations(observed_at);

CREATE INDEX idx_ingestion_runs_item_id ON ingestion_runs(item_id);
```

## 3. Seed-Daten für Auswahlwerte

```sql
-- 3.1 item_kinds
INSERT INTO item_kinds (key, label, description) VALUES
('note', 'Note', 'Markdown note or knowledge item'),
('document', 'Document', 'PDF or other document file'),
('image', 'Image', 'Image, scan, screenshot, photo'),
('spreadsheet', 'Spreadsheet', 'Spreadsheet file such as xlsx or csv'),
('summary', 'Summary', 'Standalone summary item if needed'),
('task', 'Task', 'Actionable task or to-do'),
('event', 'Event', 'Scheduled event or appointment');

-- 3.2 item_categories
INSERT INTO item_categories (key, label, description, applies_to_kind) VALUES
('research', 'Research', 'Research note or investigation', 'note'),
('decision', 'Decision', 'Decision note', 'note'),
('learning', 'Learning', 'Learning note or lesson learned', 'note'),
('reference', 'Reference', 'Reference note', 'note'),
('process', 'Process', 'How-to or process note', 'note'),
('comparison_note', 'Comparison Note', 'Comparison-oriented note', 'note'),

('income_document', 'Income Document', 'Income-related document', 'document'),
('invoice', 'Invoice', 'Invoice or bill', 'document'),
('offer', 'Offer', 'Offer or quotation document', 'document'),
('bank_statement', 'Bank Statement', 'Bank statement or account extract', 'document'),
('insurance_document', 'Insurance Document', 'Insurance-related document', 'document'),
('school_document', 'School Document', 'School-related document', 'document'),
('medical_document', 'Medical Document', 'Medical or care-related document', 'document'),
('product_document', 'Product Document', 'Datasheet, manual, specification or offer', 'document'),
('contract_document', 'Contract Document', 'Contract or agreement', 'document'),

('scan', 'Scan', 'Scanned image or photo of a document', 'image'),
('screenshot', 'Screenshot', 'Screenshot image', 'image'),
('photo', 'Photo', 'Regular photo', 'image'),
('product_reference', 'Product Reference', 'Image used as reference in research', 'image'),

('comparison_table', 'Comparison Table', 'Spreadsheet used for comparison', 'spreadsheet'),
('data_table', 'Data Table', 'General spreadsheet data', 'spreadsheet'),

('task_general', 'General Task', 'General actionable task', 'task'),
('review_task', 'Review Task', 'Task for reviewing something later', 'task'),
('household_task', 'Household Task', 'Task related to household matters', 'task'),
('admin_task', 'Admin Task', 'Administrative task', 'task'),

('appointment', 'Appointment', 'Scheduled appointment', 'event'),
('deadline_event', 'Deadline Event', 'Deadline represented as event', 'event'),
('family_event', 'Family Event', 'Family-related event', 'event'),
('school_event', 'School Event', 'School-related event', 'event');

-- 3.3 content_part_kinds
INSERT INTO content_part_kinds (key, label, description) VALUES
('markdown_body', 'Markdown Body', 'Main markdown content'),
('text_chunk', 'Text Chunk', 'Extracted text chunk'),
('ocr_text', 'OCR Text', 'OCR extracted text'),
('summary', 'Summary', 'Manual or generated summary'),
('caption', 'Caption', 'Image description or caption'),
('table_extract', 'Table Extract', 'Extracted table text'),
('keywords', 'Keywords', 'Keywords extracted from content');

-- 3.4 link_types
INSERT INTO link_types (key, label, description, symmetric) VALUES
('related', 'Related', 'General relation between items', 1),
('references', 'References', 'Item references another item', 0),
('attachment', 'Attachment', 'Attached file or supporting item', 0),
('summary_of', 'Summary Of', 'This item or content summarizes another item', 0),
('source_of', 'Source Of', 'This item is source for another item', 0),
('includes', 'Includes', 'Parent includes another item', 0),
('decision_for', 'Decision For', 'Decision item belongs to a research item', 0),
('review_for', 'Review For', 'Task or event is for reviewing another item', 0),
('duplicate_of', 'Duplicate Of', 'Potential duplicate relation', 1),
('derived_from', 'Derived From', 'Generated or extracted from another item', 0);

-- 3.5 permissions
INSERT INTO permissions (key, label, description) VALUES
('view', 'View', 'Can view item'),
('edit', 'Edit', 'Can edit item'),
('manage', 'Manage', 'Can manage permissions and metadata');

-- 3.6 subject_relation_types
INSERT INTO subject_relation_types (key, label, description) VALUES
('concerns', 'Concerns', 'The item concerns this principal'),
('owned_by', 'Owned By', 'The item is owned by this principal'),
('managed_for', 'Managed For', 'The item is managed on behalf of this principal'),
('about', 'About', 'The item is about this principal');

-- 3.7 workflow_states
INSERT INTO workflow_states (workflow_type, state_key, label, is_terminal, sort_order) VALUES
('task', 'open', 'Open', 0, 10),
('task', 'in_progress', 'In Progress', 0, 20),
('task', 'done', 'Done', 1, 30),
('task', 'cancelled', 'Cancelled', 1, 40),
('task', 'skipped', 'Skipped', 1, 50),

('event', 'scheduled', 'Scheduled', 0, 10),
('event', 'completed', 'Completed', 1, 20),
('event', 'cancelled', 'Cancelled', 1, 30),
('event', 'missed', 'Missed', 1, 40);

-- 3.8 metric_definitions
INSERT INTO metric_definitions (key, label, default_unit, value_type, description) VALUES
('weight', 'Weight', 'kg', 'number', 'Body weight'),
('sleep_hours', 'Sleep Hours', 'h', 'number', 'Hours slept'),
('body_temperature', 'Body Temperature', 'c', 'number', 'Body temperature'),
('blood_pressure_systolic', 'Blood Pressure Systolic', 'mmhg', 'number', 'Systolic blood pressure'),
('blood_pressure_diastolic', 'Blood Pressure Diastolic', 'mmhg', 'number', 'Diastolic blood pressure'),
('heart_rate', 'Heart Rate', 'bpm', 'number', 'Heart rate'),
('steps', 'Steps', 'steps', 'integer', 'Daily steps'),
('account_balance', 'Account Balance', 'eur', 'number', 'Account balance'),
('electricity_meter', 'Electricity Meter', 'kwh', 'number', 'Electricity meter reading');
```

## 4. Metadatengruppen und Felder

### 4.1 Gruppen

Empfohlene Start-Gruppen:

- general
- classification
- document_details
- review
- research
- finance_income
- finance_bank_statement
- offers
- task_details
- event_details

### 4.2 Wichtige Feld-Keys

**Allgemein**

- document_date
- issuer
- recipient
- is_scanned
- ocr_status
- summary_status
- reviewed_by_user
- language_override

**Research**

- research_subject
- decision_stage
- budget_max
- selected_option
- comparison_exists

**Finance**

- gross_amount
- net_amount
- currency
- payment_date
- period_start
- period_end
- bank_name
- account_reference
- statement_period_start
- statement_period_end
- vendor
- offer_number
- valid_until
- total_amount

**Task / Event**

- priority
- estimated_effort_minutes
- is_blocked
- blocking_note
- all_day
- location
- attendee_notes

**Wichtig**

- due_at
- start_at
- end_at

Hinweis: Diese Werte gehören nicht in `item_metadata`, sondern in `datetime_properties`.

## 5. Principals zum Start

**Empfohlen**

- heiko
- wife
- son
- pair
- family
- parents_of_son

**Mit Memberships**

- heiko ∈ pair
- wife ∈ pair
- heiko ∈ family
- wife ∈ family
- son ∈ family
- heiko ∈ parents_of_son
- wife ∈ parents_of_son

## 6. Start-Filesystem-Struktur

```text
kb/
  inbox/
    raw/
    processing/
    rejected/

  workspaces/
    projects/
    reviews/

  items/
    notes/
      aa/
      b4/
    documents/
      aa/
      b4/
    images/
      aa/
      b4/
    spreadsheets/
      aa/
      b4/
    summaries/
      aa/
      b4/

  exports/
  db/
    kb.sqlite
  logs/
```

### Prinzip

- `inbox/` = neue, unsortierte Eingänge
- `workspaces/projects/` = temporäre Projekt-Arbeitsordner
- `items/` = dauerhafter Bestand

> Bedeutung und Zusammenhang kommen aus der Datenbank, nicht aus der Ordnerstruktur.

### Dateinamenschema

`<prefix>_<ulid>_<slug>.<ext>`

**Beispiele:**

- `note_01HT..._washing_machine_research.md`
- `doc_01HT..._bosch_offer.pdf`
- `img_01HT..._energy_label.jpg`

### Bucket-Regel

Empfohlen:

- `bucket = ulid[10:12].lower()`

**Beispiel:**

- `kb/items/documents/m1/doc_<ulid>_bosch_offer.pdf`

## 7. Wichtige Anmerkung zum Modell

Für Wissensinhalte und Dokumente ist `items` der zentrale Kern.

Für Zeitreihen/Messwerte wie Gewicht ist das Hauptmodell:

- `observation_series`
- `observations`

und nicht:

- eine Note pro Messpunkt
- eine riesige Markdown-Datei mit Tabellenzeilen

Markdown kann dort ergänzend eine beschreibende Note sein, aber nicht der Primärspeicher.

## 8. Kurzfazit

Mit diesem Stand deckt das Modell jetzt ab:

- Notizen, Wissen, Entscheidungen
- PDFs, Bilder, Scans, Spreadsheets
- Metadaten und Metadatengruppen
- Zusammenfassungen als Content Parts
- Labels
- Multiuser über Principals
- ACL und Betroffenheit
- Aufgaben, Termine, Wiederholungen, Notifications
- Zeitreihen wie Gewicht, Schlaf, Kontostände

Das ist jetzt ein tragfähiges Gesamtmodell.
