# File Items Refactor Plan
## Status

- Abgearbeitet am 2026-04-14
- umgesetzt in Frontend-Logik und Regressionstests
## Ziel

Dateien sollen im Kernmodell keine untergeordneten `assets` eines bestehenden Items mehr sein, sondern selbst vollwertige `items`.

Das bedeutet:

- ein PDF, Bild oder Spreadsheet ist ein eigenes `item`
- die physische Datei im Filesystem ist nur die kanonische Datei dieses Items
- Beziehungen zu Notizen, Projekten oder anderen Dateien laufen ueber `item_links`
- Summaries, OCR, Captions und Extraktionen laufen ueber `content_parts` oder ueber eigene abgeleitete Items

## Ist-Zustand

Die aktuelle Implementierung ist gemischt:

- das Referenzmodell kennt bereits `item_kinds` wie `document`, `image`, `spreadsheet`, `summary`
- Metadaten und `content_part_kinds` passen bereits gut zum Zielbild
- die aktive Schreiblogik behandelt Dateien aber noch als `assets` und nicht als eigene `items`

Aktuelle Hauptabweichungen:

1. Separates Asset-Modell

- `assets` speichert Dateiobjekte getrennt von `items`
- `item_assets` haengt Assets an Items an
- dadurch ist eine Datei fachlich kein primaer adressierbares Objekt

Betroffene Stellen:

- `src/kbase/infrastructure/db/sql/001_schema.sql`
- `src/kbase/infrastructure/db/models/tables.py`
- `src/kbase/infrastructure/db/repositories/asset_repository.py`

2. Capability Layer ist note-zentriert bei Uploads

- `register_asset` erzeugt nur einen Asset-Datensatz
- `attach_asset_to_item` haengt diesen Asset-Datensatz an ein bestehendes Item
- der API-Upload-Endpunkt speichert Dateien sogar unter `.../<item_id>/...`, also physisch unter dem Ziel-Item

Betroffene Stellen:

- `src/kbase/application/capabilities/register_asset.py`
- `src/kbase/application/capabilities/attach_asset_to_item.py`
- `src/kbase/interfaces/api/main.py`

3. Item-Details geben Assets statt Datei-Items zurueck

- `get_item` liefert `linked_assets`
- dadurch sehen Clients keine echten verknuepften Datei-Items mit Titel, Kategorie, Labels, Metadaten und eigener History

Betroffene Stellen:

- `src/kbase/application/capabilities/get_item.py`
- `src/kbase/application/dto/capabilities.py`
- `src/kbase/application/dto/common.py`
- `src/kbase/application/services/mappers.py`

4. CLI und API spiegeln das alte Modell

- CLI hat `asset register` und `asset attach`
- API hat `/api/assets`, `/api/items/{item_id}/assets`, `/api/items/{item_id}/attachments/upload`

Damit wird dieselbe alte Semantik in alle Clients getragen.

## Zielmodell

### Kernprinzip

Es gibt nur ein fachliches Hauptobjekt fuer Inhalte: `item`.

Dateien werden wie folgt modelliert:

- `item(item_kind=document|image|spreadsheet|note|summary|...)`
- `item_files(item_id, file_role, relative_path, original_filename, mime_type, size_bytes, checksum_sha256, ...)`
- `content_parts(item_id, part_kind=ocr_text|summary|caption|text_chunk|...)`
- `item_links(from_item_id, to_item_id, link_type=references|attachment|derived_from|summary_of|...)`

### Trennung der Rollen

- `item`: fachlich adressierbares Objekt
- `item_file`: physische Datei eines Items
- `content_part`: inhaltliche Repraesentation oder Ableitung
- `item_link`: Beziehung zwischen Items

### Summaries

Summaries duerfen in zwei Formen vorkommen:

1. als `content_part(part_kind='summary')` am Ursprungs-Item
2. als eigenes `summary`-Item mit Link `summary_of`

Empfehlung:

- kurze item-nahe Zusammenfassungen zuerst als `content_part`
- eigenstaendige, versionierte oder vergleichende Zusammenfassungen als eigenes `summary`-Item

## Umbauprinzipien

1. Capability Layer bleibt der einzige Schreibpfad

- weder CLI noch API schreiben direkt in Repositories
- neue Logik wird zuerst als Capabilities modelliert

2. Storage-Pfade werden aus Item-ID und Item-Kind abgeleitet

- nicht mehr aus dem Kontext-Item
- keine physische Ablage unterhalb einer Note oder eines Projekts

3. API und CLI werden an dieselben neuen Capabilities angeschlossen

- kein Sonderpfad fuer HTTP-Uploads
- kein eigener Import-Trick nur im Frontend

4. Bestehende `assets`-Struktur wird kontrolliert migriert oder uebergangsweise adaptiert

- nicht alles sofort hart entfernen
- aber neue Schreibpfade duerfen das alte Modell nicht weiter ausbauen

## Ziel-Capabilities

### 1. `create_file_item`

Legt ein Datei-Item inklusive primaerer Dateireferenz an.

Input:

- `title`
- `item_kind`
- `category_key`
- `origin`
- `language_code`
- `original_filename`
- `mime_type`
- `size_bytes`
- `checksum_sha256`
- `source_path` oder Upload-Quelle
- optionale `label_paths`
- optionale `metadata`
- optionale `project_ids`

Schreibt in einer Transaktion:

- `items`
- `item_files`
- optional `item_labels`
- optional `item_metadata`
- optional `project_items`
- `audit_events`
- `provenance_records`

### 2. `import_file_as_item`

Importiert eine echte Datei aus `inbox/raw` oder einem Upload in den finalen Storage und erzeugt das Item.

Zusaetzlich:

- bestimmt Zielpfad unter `kb/items/<kind>/<bucket>/...`
- schreibt Dateibits
- setzt `file_role='primary'`
- kann optional sofort einen Link zu einem Kontext-Item anlegen

### 3. `link_item_to_item`

Vorhanden als `link_items`, semantisch bereits passend.

Nutzung fuer Dateien:

- Note `references` Document
- Note `attachment` Image
- Summary `summary_of` Document
- Spreadsheet `derived_from` mehreren Documents nur ueber zusaetzliche Links oder Projektkontext

### 4. `replace_item_summary`

Schreibt oder ersetzt eine Zusammenfassung als `content_part(part_kind='summary')`.

Optional spaeter:

- `create_summary_item`

### 5. `extract_content_from_file_item`

Spaetere Capability fuer OCR, Parser, PDF-Text, Spreadsheet-Extrakt.

Schreibt:

- `content_parts` wie `ocr_text`, `text_chunk`, `caption`
- Metadaten
- Provenance mit Methode `ocr`, `pdf_parse`, `llm_extract`

## Datenmodell-Umbau

### Phase A: Additiv erweitern

Neue Tabelle:

- `item_files`

Empfohlene Felder:

- `id`
- `item_id`
- `file_role`
- `relative_path`
- `original_filename`
- `extension`
- `mime_type`
- `size_bytes`
- `checksum_sha256`
- `source_data_class`
- `created_by_principal_id`
- `created_at`

Optional zusaetzlich:

- `storage_provider`
- `is_primary`

### Phase B: Lesen auf neues Modell heben

- `get_item` soll `files` und verknuepfte Datei-Items liefern
- `search` bleibt item-zentriert
- Detailansichten duerfen nicht mehr von `linked_assets` abhaengen

### Phase C: `assets` entkernen

Optionen:

1. `assets` komplett ersetzen
2. `assets` nur noch fuer abgeleitete technische Artefakte behalten

Empfehlung:

- Originaldateien und benutzerrelevante Dateien nach `item_files`
- `assets` optional spaeter nur fuer rein technische Derivate wie Thumbnail, OCR-JSON, Preview

Dann gilt:

- `assets` sind technische Beiprodukte
- `items` plus `item_files` sind fachliche Objekte

## API-Umbau

### Entfernen oder abkuendigen

- `POST /api/assets`
- `POST /api/items/{item_id}/assets`
- `POST /api/items/{item_id}/attachments/upload`

### Neue Endpunkte

1. `POST /api/file-items`

Erzeugt ein Datei-Item aus Dateiupload oder referenziertem Quellpfad.

Payload bzw. Multipart:

- Datei
- `item_kind`
- `category_key`
- `title` optional
- `link_to_item_id` optional
- `link_type` optional, default `attachment` oder `references`
- `label_paths`
- `metadata`
- `project_ids`

Antwort:

- `ItemDetailResult` des neu erzeugten Datei-Items

2. `POST /api/items/{item_id}/links`

Optional spaeter fuer item-lokale Verlinkung, falls die generische `/api/links` nicht reicht.

3. `PUT /api/items/{item_id}/summary`

Setzt oder ersetzt die Summary als `content_part`

### Rueckgabemodelle

`ItemDetailResult` sollte erweitert oder angepasst werden:

- `files: list[ItemFileData]`
- `related_items` bleibt
- `linked_assets` wird deprecated

Optional sinnvoll:

- `linked_file_items: list[ItemRef]`

## CLI-Umbau

### Entfernen oder abkuendigen

- `asset register`
- `asset attach`

### Neue Commands

1. `file-item import`

Beispiel:

```text
kbase file-item import --path C:\docs\offer.pdf --item-kind document --category offer --link-to-item-id <note_id> --link-type references
```

2. `file-item create`

Fuer bereits im Storage liegende Dateien oder spaetere Batch-Prozesse.

3. `item summary set`

Beispiel:

```text
kbase item summary set <item_id> --body-file summary.md
```

4. `item file list`

Zum Anzeigen der kanonischen Dateien eines Items.

Wichtig:

- CLI ist nur Adapter
- keine Dateiablage- oder Bucket-Logik in der CLI
- alles ueber die neuen Capabilities

## Storage-Umbau

### Aktuell problematisch

Der Upload speichert unter:

- `kb/items/files/uploads/<ziel_item_id>/...`

Das koppelt Speicherort an den Kontext statt an die Datei selbst.

### Ziel

Pfadableitung aus Datei-Item:

```text
kb/items/documents/<bucket>/doc_<ulid>_<slug>.pdf
kb/items/images/<bucket>/img_<ulid>_<slug>.png
kb/items/spreadsheets/<bucket>/sheet_<ulid>_<slug>.xlsx
```

Regeln:

- Bucket aus ULID
- Dateiname aus Item-ID plus Slug
- relativer Pfad in DB
- Workspace Root wird nur in der Storage-Schicht aufgeloest

### Eigene Storage-Komponente

Empfehlung:

- neue Infrastrukturkomponente `ItemFileStore`

Verantwortlich fuer:

- Zielpfad berechnen
- Verzeichnisse anlegen
- Datei schreiben
- relative Pfade zurueckgeben

Diese Logik darf nicht im API-Endpunkt liegen.

## Migrationsstrategie

### Schritt 1

Neue Tabelle `item_files` additiv einfuehren.

### Schritt 2

Neue Capabilities und neue API/CLI-Endpunkte einfuehren.

### Schritt 3

Frontend und sonstige Clients auf Datei-Items umstellen.

### Schritt 4

Bestehende `assets`-Datensaetze migrieren:

- fuer jedes benutzerrelevante Originalfile neues Datei-Item anlegen
- Metadaten aus `assets` in `item_files`
- Beziehungen aus `item_assets` in `item_links`

Empfohlene Link-Abbildung:

- `relationship_role='attachment'` -> `link_type='attachment'`
- `relationship_role='reference'` -> `link_type='references'`
- sonst direkte Mapping-Tabelle definieren

### Schritt 5

Alte Endpunkte nur noch lesend oder gar nicht mehr anbieten.

### Schritt 6

`assets` auf rein technische Artefakte reduzieren oder spaeter entfernen.

## Reihenfolge der Umsetzung

1. DB additive erweitern: `item_files`
2. DTOs fuer `ItemFileData` und neue Inputs einfuehren
3. Repository fuer `item_files` bauen
4. `ItemFileStore` bauen
5. Capability `create_file_item` bauen
6. Capability `import_file_as_item` bauen
7. `get_item` auf `files` und Datei-Links erweitern
8. API-Endpunkte fuer Datei-Items einfuehren
9. CLI-Kommandos fuer Datei-Import einfuehren
10. Frontend von `linked_assets` auf verknuepfte Datei-Items umstellen
11. Datenmigration fuer bestehende `assets`
12. alte Asset-Schreibpfade deprecaten und entfernen

## Konkrete Code-Baustellen

### Direkt betroffen

- `src/kbase/infrastructure/db/sql/001_schema.sql`
- `src/kbase/infrastructure/db/models/tables.py`
- `src/kbase/infrastructure/db/repositories/asset_repository.py`
- `src/kbase/infrastructure/db/repositories/item_repository.py`
- `src/kbase/application/dto/common.py`
- `src/kbase/application/dto/capabilities.py`
- `src/kbase/application/services/mappers.py`
- `src/kbase/application/services/capability_support.py`
- `src/kbase/application/capabilities/get_item.py`
- `src/kbase/interfaces/api/schemas.py`
- `src/kbase/interfaces/api/main.py`
- `src/kbase/interfaces/cli/main.py`
- `frontend/src/api.js`
- `frontend/src/App.jsx`

### Neu hinzuzufuegen

- `src/kbase/infrastructure/db/repositories/item_file_repository.py`
- `src/kbase/infrastructure/files/item_file_store.py`
- `src/kbase/application/capabilities/create_file_item.py`
- `src/kbase/application/capabilities/import_file_as_item.py`

## Risiken

1. Doppelte Semantik waehrend der Uebergangszeit

- wenn `assets` und `item_files` parallel fuer Originaldateien genutzt werden, entsteht Verwirrung

2. Storage-Pfad-Migration

- bestehende Pfade unter item-bezogenen Upload-Ordnern passen nicht zum neuen Modell

3. Client-Kompatibilitaet

- Frontend erwartet aktuell `linked_assets`

4. Suchmodell fuer Bilder und PDFs

- Suche bleibt item-zentriert, braucht aber spaeter Parser-/OCR-Inhalte in `content_parts`

## Entscheidungsempfehlung

Fuer das Zielkonzept sollte die Architektur kuenftig so gelesen werden:

- benutzerrelevante Dateien sind `items`
- ein `item` kann eine oder mehrere physische Dateien in `item_files` besitzen
- technische Artefakte duerfen optional weiter als `assets` existieren, aber nicht als Ersatz fuer Datei-Items

Damit bleiben Capability Layer, CLI und API konsistent, und das Filesystem wird nur noch als Storage unterhalb eines item-zentrierten Modells verwendet.
