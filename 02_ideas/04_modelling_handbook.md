# Modelling Handbook

## Zweck

Dieses Dokument definiert die verbindlichen Modellierungsregeln fuer die Knowledge Base. Es ist absichtlich sowohl menschenlesbar als auch maschinenfreundlich aufgebaut, damit dieselben Regeln spaeter in App-Logik, Importer, Validierung und Agenten-Tools verwendet werden koennen.

## Normative Regeln

### 1. Primaermodell

- Jeder Sachverhalt bekommt genau einen primaeren Modelltyp.
- Ein Objekt darf nicht gleichzeitig als `note` und `task` modelliert werden.
- Wenn Wissen spaeter zu einer Handlung fuehrt, bleibt das Wissensobjekt bestehen und die Handlung wird als neues verlinktes Objekt angelegt.
- Kontexte wie Projekte oder Faelle duerfen als eigene Objekte modelliert werden, wenn sie mehr sind als nur ein Label.

### 2. Trennung der Ebenen

| Ebene | Zweck | Beispiele |
|---|---|---|
| `item_kind` | technischer Typ und Verhalten | `note`, `document`, `task`, `event` |
| `category_key` | primaere fachliche Einordnung | `research`, `offer`, `bank_statement` |
| Labels | zusaetzliche Perspektiven | `finance/income`, `household/appliances` |
| Links | explizite Beziehungen | `review_for`, `derived_from` |
| Metadaten | strukturierte Zusatzattribute | `gross_amount`, `issuer`, `priority` |

### 3. Kanonisch vs. abgeleitet

- Originaldateien sind kanonische Quellen.
- Nutzerbestaetigte strukturierte Werte sind kanonisch.
- OCR, Extraktion, Inferenz und LLM-Zusammenfassungen sind abgeleitet.
- Abgeleitete Daten duerfen kanonische Daten ergaenzen, aber nicht still ersetzen.

### 4. Kategorie-Regel

- Jedes `item` hat hoechstens eine primaere `category_key`.
- Falls mehrere fachliche Sichtweisen sinnvoll waeren, wird eine primaere Kategorie gewaehlt.
- Weitere Sichtweisen werden ueber Labels, Links, Zusatz-Items oder spaeter ueber eine strukturierte Sekundaerklassifikation modelliert.

### 5. Metadaten-Regel

- Metadaten sind nur erlaubt, wenn sie zum `item_kind` und zum Profil der Kategorie passen.
- Zeitfelder wie `due_at`, `start_at`, `end_at` gehoeren nie in freie Metadaten.
- Freie Felder ohne Profil muessen als Ausnahme behandelt werden.
- Strukturierte Zusatzklassifikation ist von Metadaten und Labels getrennt zu halten.

### 6. Operative Objekte

- Aufgaben, Termine und Reviews sind echte planbare Objekte.
- Review-Bedarf wird als `task` oder `event` modelliert, nicht als Status einer Note.
- Wiederholungen werden ueber `recurrence_rules` und bei Bedarf `item_occurrences` modelliert.

### 7. Zeitreihen

- Messreihen werden immer ueber `observation_series` und `observations` modelliert.
- Einzelne Beobachtungen sind keine Notes.
- Analysen, Reflexionen oder Berichte zu Zeitreihen koennen zusaetzlich als Notes existieren.

### 8. Speicherorte

- `items/` enthaelt kanonische Bestandsdaten.
- `inbox/` enthaelt noch nicht einsortierte Eingaben.
- `workspaces/` ist temporärer Arbeitsraum und nicht automatisch kanonisch.
- Frontend- oder Agenten-Scratch-Daten duerfen nicht still als kanonische Wissensobjekte gelten.

### 9. Multiuser

- ACL steuert Sichtbarkeit und Bearbeitbarkeit.
- `item_subjects` beschreibt fachliche Betroffenheit.
- `created_by_principal_id` beschreibt Herkunft, nicht Berechtigung.

### 10. Agenten-Schreiben

- Agents duerfen nicht frei Tabellen oder Dateien veraendern.
- Schreibpfade muessen ueber validierte App-Operationen gehen.
- Abgeleitete oder vorgeschlagene Inhalte sollen als solche markiert sein.
- Dieselben Capabilities sollen fuer UI, CLI, API und MCP gelten.

## Entscheidungsbaum fuer Objektwahl

| Frage | Wenn ja | Wenn nein |
|---|---|---|
| Ist der Primaerzweck menschlich lesbarer Inhalt oder Wissen? | `note` | weiter |
| Ist das Primaerobjekt eine Originaldatei oder Datei als Quelle? | `document`, `image`, `spreadsheet` | weiter |
| Ist das Objekt planbar, terminierbar oder erledigbar? | `task` oder `event` | weiter |
| Ist das Objekt ein Kontext, Container oder Arbeitsraum mit eigenen Metadaten? | `project` oder Kontextobjekt | weiter |
| Ist es eine Messreihe oder ein Verlauf? | `observation_series` | eigenes Profil pruefen |

## Kanonische Muster

### Muster 1: Research mit Entscheidung

| Rolle | Modell |
|---|---|
| Recherchetext | `note` + `category_key = research` |
| Angebotsdatei | `document` + `category_key = offer` |
| Produktbild | `image` + `category_key = product_reference` |
| Vergleich | `spreadsheet` + `category_key = comparison_table` |
| Entscheidung | `note` + `category_key = decision` |
| spaeterer Review | `task` + `category_key = review_task` |

Pflichtbeziehungen:

- Decision `decision_for` Research
- Review `review_for` Decision oder Research
- Dateien `references` oder `attachment` auf die Research Note

### Muster 2: Einkommensdokument

| Rolle | Modell |
|---|---|
| Original-PDF | `document` + `category_key = income_document` |
| optionale Zusammenfassung | `content_part` oder separate `summary` |
| strukturierte Werte | `item_metadata` nach Profil |

### Muster 3: Termin fuer Kind

| Rolle | Modell |
|---|---|
| Termin | `event` + `category_key = appointment` |
| Betroffener | `item_subjects` -> `son` |
| Sichtbarkeit | `item_acl` -> `parents_of_son` |
| Zeiten | `datetime_properties` |
| Erinnerung | `notifications` |

### Muster 4: Review zu Wissen

| Rolle | Modell |
|---|---|
| Wissensobjekt | bleibt `note` oder `decision` |
| Review | eigenes `task`-Item |
| Beziehung | `review_for` |

### Muster 5: Gewichtsverlauf

| Rolle | Modell |
|---|---|
| Serie | `observation_series` |
| Messpunkte | `observations` |
| Interpretation | optionale `note` |

### Muster 6: Projekt- oder Themenraum

| Rolle | Modell |
|---|---|
| Kontextobjekt | `project` oder `item_kind = project` |
| enthaltene Inhalte | Membership oder Links zu Items |
| eigene Metadaten | Status, Zeitraum, Beschreibung |

## Agentenorientierte Retrieval-Pakete

Diese Pakete sollten spaeter ueber API oder MCP bereitgestellt werden, damit Agents nicht selbst rohe Tabellen zusammensuchen muessen.

| Paket | Inhalt |
|---|---|
| `item_with_sources` | Item, Dateien, Links, Herkunft, relevante Content Parts |
| `research_bundle` | Research, zugeordnete Angebote, Bilder, Vergleich, Entscheidung |
| `decision_context` | Entscheidung, Begruendung, Quellen, Review-Tasks |
| `subject_timeline` | Events, Tasks, Dokumente und Serien zu einem Principal |
| `upcoming_for_principal` | anstehende Tasks, Events, Notifications |
| `series_history` | Serie, Werte, optionale Analyse-Notes |
| `project_bundle` | Projekt, enthaltene Items, offene Aufgaben, relevante Assets |

## Maschinenlesbare Regelbasis

```yaml
model_version: 1
storage_zones:
  canonical:
    - items
    - db
  intake:
    - inbox
  temporary:
    - workspaces

data_classes:
  canonical:
    description: user-confirmed data or original source files
  extracted:
    description: parser or OCR output directly derived from a source
  inferred:
    description: derived interpretation from existing structured or textual data
  generated:
    description: llm-written or system-generated content

item_kind_rules:
  note:
    purpose: human-readable knowledge, reflection, explanation, decision text
    allowed_categories:
      - research
      - decision
      - learning
      - reference
      - process
      - comparison_note
    required_components:
      - content_parts
  document:
    purpose: source-centric file object
    allowed_categories:
      - income_document
      - invoice
      - offer
      - bank_statement
      - insurance_document
      - school_document
      - medical_document
      - product_document
      - contract_document
    required_components:
      - item_files
  image:
    purpose: image or scan source
    allowed_categories:
      - scan
      - screenshot
      - photo
      - product_reference
    required_components:
      - item_files
  spreadsheet:
    purpose: structured tabular source
    allowed_categories:
      - comparison_table
      - data_table
    required_components:
      - item_files
  task:
    purpose: actionable item
    allowed_categories:
      - task_general
      - review_task
      - household_task
      - admin_task
    required_components:
      - item_states
  event:
    purpose: scheduled occurrence
    allowed_categories:
      - appointment
      - deadline_event
      - family_event
      - school_event
    required_components:
      - datetime_properties
  project:
    purpose: context or container object with own metadata and linked items
    allowed_categories:
      - project_general
      - case_context
      - topic_space
      - life_area
    required_components: []

category_profiles:
  research:
    item_kind: note
    recommended_metadata:
      - research_subject
      - decision_stage
      - budget_max
      - selected_option
      - comparison_exists
    allowed_links_out:
      - references
      - includes
      - decision_for
      - related
  decision:
    item_kind: note
    recommended_metadata:
      - decision_stage
      - selected_option
    allowed_links_out:
      - decision_for
      - review_for
      - related
  income_document:
    item_kind: document
    recommended_metadata:
      - document_date
      - issuer
      - gross_amount
      - net_amount
      - currency
      - payment_date
    required_acl_mode: restricted_personal
  bank_statement:
    item_kind: document
    recommended_metadata:
      - document_date
      - bank_name
      - account_reference
      - statement_period_start
      - statement_period_end
    required_acl_mode: restricted_personal
  offer:
    item_kind: document
    recommended_metadata:
      - vendor
      - offer_number
      - valid_until
      - total_amount
    typical_links_in:
      - references
      - attachment
  review_task:
    item_kind: task
    recommended_metadata:
      - priority
      - estimated_effort_minutes
    required_datetime_properties:
      - due_at
    required_links_out:
      - review_for
  appointment:
    item_kind: event
    recommended_metadata:
      - location
      - attendee_notes
      - all_day
    required_datetime_properties:
      - start_at
  project_general:
    item_kind: project
    recommended_metadata:
      - description
      - status
      - period_start
      - period_end
    allowed_links_out:
      - includes
      - related
      - references

cross_field_rules:
  - rule_id: due_dates_not_in_item_metadata
    forbidden_metadata_keys:
      - due_at
      - start_at
      - end_at
    required_table: datetime_properties
  - rule_id: observations_not_notes
    description: single measurement points must not be modeled as note items
  - rule_id: review_requires_separate_task
    description: review intent should create a linked task or event, not only a status on a note
  - rule_id: ui_and_agents_use_capabilities
    description: direct table writes are forbidden outside validated capability implementations
  - rule_id: scratch_not_canonical
    description: workspace or temporary client state must not be treated as canonical knowledge until persisted

agent_operations:
  read_profiles:
    - item_with_sources
    - research_bundle
    - decision_context
    - subject_timeline
    - upcoming_for_principal
    - series_history
    - project_bundle
  write_modes:
    read_only:
      can_write: false
    propose:
      can_write: false
      can_create_suggestions: true
    reviewed_write:
      can_write: true
      requires_user_confirmation: true
    trusted_automation:
      can_write: true
      requires_rule_scope: true

capability_groups:
  item_lifecycle:
    - create_item
    - update_item_core
    - archive_item
  content:
    - add_content_part
    - replace_content_part
    - append_to_content_part
  assets:
    - register_asset
    - attach_asset_to_item
    - create_document_from_asset
  relations:
    - link_items
    - unlink_items
    - list_related_items
  classification:
    - assign_labels
    - classify_item
    - create_label
    - get_item_metadata_schema
    - patch_item_metadata
  projects:
    - create_project
    - add_item_to_project
    - list_project_items
  retrieval:
    - get_item
    - list_items
    - search_content
  temporal:
    - schedule_event
    - create_task
    - complete_task
  measurements:
    - create_measurement_series
    - record_measurement
    - list_measurements
  derived_content:
    - create_summary_from_sources
    - create_extracted_content
  audit:
    - get_item_history
    - get_item_provenance
```

## Maschinenlesbare Beispielobjekte

```yaml
examples:
  - name: washing_machine_research
    primary_object:
      item_kind: note
      category_key: research
    linked_objects:
      - item_kind: document
        category_key: offer
      - item_kind: image
        category_key: product_reference
      - item_kind: spreadsheet
        category_key: comparison_table
      - item_kind: note
        category_key: decision
      - item_kind: task
        category_key: review_task
    required_link_types:
      - decision_for
      - review_for

  - name: salary_slip
    primary_object:
      item_kind: document
      category_key: income_document
    recommended_metadata:
      - gross_amount
      - net_amount
      - currency
      - payment_date
    acl_subject:
      principal: heiko

  - name: child_appointment
    primary_object:
      item_kind: event
      category_key: appointment
    required_datetime_properties:
      - start_at
    subject:
      principal: son
    acl_group:
      principal: parents_of_son

  - name: weight_tracking
    primary_object:
      object_type: observation_series
      metric_key: weight
    child_objects:
      - object_type: observations
    optional_linked_note:
      item_kind: note
      category_key: learning
  - name: family_project_space
    primary_object:
      item_kind: project
      category_key: project_general
    linked_objects:
      - item_kind: note
        category_key: research
      - item_kind: document
        category_key: offer
      - item_kind: event
        category_key: appointment
    retrieval_profile:
      - project_bundle
```

## Nutzung im Tooling

Dieses Dokument kann spaeter auf drei Arten genutzt werden:

1. als Grundlage fuer Validierungslogik in der App
2. als Konfiguration fuer Import- und Extraktionspipelines
3. als eingebettete Regelbasis fuer MCP- oder Agenten-Tools

Die einfache Grundidee ist: Tools sollen nicht frei modellieren, sondern gegen diese Regeln validieren.
