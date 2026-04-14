# Capability Core und Persistenz

## Ziel

Dieses Dokument priorisiert die ersten Capabilities, die umgesetzt werden muessen, um einen einfachen, aber echten Kern nutzen zu koennen. Gleichzeitig beschreibt es die minimale Persistenzstrategie, die Multiuser und parallele Nutzung nicht verbaut.

## Leitgedanke

Der erste lauffaehige Kern soll:

- mit einer CLI bedienbar sein
- das Domainmodell wirklich benutzen
- agentenfaehige Strukturen nicht spaeter erzwingen muessen
- aber bewusst klein bleiben

## Was der erste Core koennen muss

Wenn der erste Core diese Dinge kann, ist das System bereits sinnvoll nutzbar:

1. Notes anlegen und lesen
2. Inhalt aktualisieren
3. Kategorien und Labels setzen
4. Metadaten pflegen
5. Dateien registrieren und anhaengen
6. Beziehungen zwischen Objekten herstellen
7. Inhalte suchen und filtern
8. Projekte/Kontexte nutzen
9. Audit und Provenance fuer alle Writes erfassen

Alles andere ist wichtig, aber nicht fuer den ersten nutzbaren Kern.

## Priorisierte Capability-Gruppen

### A. Lesen / Retrieval

Diese Capabilities sind unverzichtbar:

- `get_item`
- `list_items`
- `search_content`
- `list_related_items`

Warum zuerst:

- ohne Lesen kein nutzbares System
- CLI und spaetere Agents brauchen dieselben Query-Pfade
- Such- und Ergebnisformate muessen frueh stabil werden

### B. Item-Kern

- `create_note`
- `update_item_core`
- `archive_item`

Minimaler Nutzen:

- Objekte anlegen
- Titel/Kategorie/Status aendern
- archivieren statt loeschen

### C. Content

- `add_content_part`
- `replace_content_part`

Wichtige Regel:

- fuer den Anfang reicht ein primaerer Markdown-Content-Part
- spaeter koennen weitere Content Parts dazukommen

### D. Strukturierung

- `assign_labels`
- `classify_item`
- `patch_item_metadata`

Das macht den Core erst wirklich querybar.

### E. Beziehungen

- `link_items`
- `unlink_items`

Ohne Links bleibt das System ein Dateisystem mit Zusatzfeldern.

### F. Assets

- `register_asset`
- `attach_asset_to_item`
- `create_document_from_asset`

Warum schon frueh:

- Dokumente und Bilder sind Kern-Use-Cases
- spaetere Capture- und OCR-Flows bauen darauf auf

### G. Projekte / Kontexte

- `create_project`
- `add_item_to_project`
- `list_project_items`

Warum schon im ersten Core:

- Projekte sind eine zentrale Gruppierungsform
- sie helfen sofort bei Navigation und Wiederfindung

### H. Nachvollziehbarkeit

- `get_item_history`
- `get_item_provenance`

Das ist kein Luxus. Sobald Capabilities schreiben, muss Nachvollziehbarkeit vorhanden sein.

## Nicht im ersten Core

Bewusst spaeter:

- `create_task`
- `schedule_event`
- `complete_task`
- `create_measurement_series`
- `record_measurement`
- `create_summary_from_sources`
- Bulk-Import
- automatische Extraktion
- semantische Suche

Diese Dinge sind wichtig, aber nicht noetig, um den ersten Kern robust zu machen.

## Empfohlene Reihenfolge der Implementierung

### Schritt 1

- `create_note`
- `get_item`
- `list_items`

### Schritt 2

- `replace_content_part`
- `search_content`

### Schritt 3

- `assign_labels`
- `classify_item`
- `patch_item_metadata`

### Schritt 4

- `register_asset`
- `attach_asset_to_item`
- `link_items`
- `list_related_items`

### Schritt 5

- `create_project`
- `add_item_to_project`
- `list_project_items`

### Schritt 6

- `get_item_history`
- `get_item_provenance`

Dann ist der erste Core fachlich klein, aber strukturell richtig.

## CLI als erster Client

Die CLI sollte genau diese ersten Capabilities sichtbar machen.

### Empfohlene CLI-Namespace-Struktur

```text
kbase item create-note
kbase item get
kbase item list

kbase content replace

kbase label assign
kbase classify set
kbase metadata patch

kbase asset register
kbase asset attach

kbase link add
kbase link list

kbase project create
kbase project add-item
kbase project list-items

kbase history show
kbase provenance show

kbase search content
```

### Warum die CLI architektonisch wichtig ist

- sie testet Capabilities ohne UI-Ablenkung
- sie ist spaeter fuer Import/Automation direkt brauchbar
- sie zwingt zu klaren DTOs und stabilen I/O-Formaten
- sie ist eine gute Vorstufe fuer MCP

## Persistenzanforderungen

Die Persistenzschicht muss drei Dinge gleichzeitig leisten:

- korrektes Speichern des Kerns
- spaetere Multiuser-Erweiterbarkeit
- sichere Mehrfachnutzung ohne inkonsistente Writes

## Empfohlene Persistenzschichten

### 1. Relationale Kernpersistenz

Hier liegen:

- `items`
- `content_parts`
- `item_metadata`
- `item_links`
- `projects` oder Projektzuordnung
- `principals`
- ACL
- Audit
- Provenance

### 2. Asset-Persistenz

Hier liegen Dateien im Filesystem:

- Original-PDFs
- Bilder
- Uploads
- spaetere Previews oder Derivate

In der Datenbank liegt nur die strukturierte Referenzierung.

### 3. Suchpersistenz

Hier liegen:

- FTS-Inhalte
- spaeter Suchprojektionen oder semantische Indizes

Diese Schicht sollte aus der relationalen Wahrheit abgeleitet sein.

## Multiuser und Multi-Nutzung

### Multiuser im Modell

Von Anfang an noetig:

- `principals`
- Memberships
- ACL / Sichtbarkeit
- Actor Context auf Capability-Ebene

Auch wenn der erste Runtime-Use-Case nur ein Benutzer ist, darf das Modell nicht singlenutzerhaft sein.

### Multi-Nutzung technisch

Mit Multi-Nutzung ist hier gemeint:

- mehrere Clients
- parallele Prozesse
- spaetere Hintergrundjobs
- UI + CLI + Agent gleichzeitig

Dafuer braucht die Persistenz:

- klare Transaktionsgrenzen
- idempotente Operationen, wo sinnvoll
- keine stillen Side Effects ausserhalb der Capability
- Write-Serialization ueber die DB-Transaktion

## SQLite als Startpunkt

SQLite ist fuer den Start richtig, aber man muss bewusst damit umgehen.

### Vorteile

- lokal
- robust
- wenig Betriebsaufwand
- schnell genug fuer den persoenlichen Rahmen
- hervorragend fuer CLI- und Einzelknotenbetrieb

### Wichtige Regeln bei SQLite

- `PRAGMA foreign_keys = ON`
- WAL-Modus aktivieren
- Busy Timeout setzen
- kurze Schreibtransaktionen
- keine langen Locks durch vermischte UI- oder Agentenlogik

### Konkret empfohlen

```text
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

## Wann SQLite problematisch wird

Nicht im ersten Schritt, aber spaeter bei:

- vielen gleichzeitigen Schreibern
- mehreren dauerhaften Worker-Prozessen
- starkem OCR-/Import-Durchsatz
- Netzlaufwerk-Setup

Dann sollte eine Postgres-Migration vorbereitet sein. Deshalb:

- kein SQLite-spezifisches Domain-Design
- Repositories und SQLAlchemy so bauen, dass ein spaeterer Wechsel moeglich bleibt

## Minimale Transaktionsregeln

### Regel 1

Jede schreibende Capability oeffnet genau eine fachliche Transaktion.

### Regel 2

Audit und Provenance gehoeren in dieselbe Commit-Grenze wie der eigentliche Write.

### Regel 3

FTS oder Suchprojektionen duerfen synchron oder kurz danach aktualisiert werden, aber nie unkontrolliert auseinanderlaufen.

### Regel 4

Dateiablage und DB-Write muessen sauber koordiniert sein.

Empfehlung:

- Datei zuerst in temporären Bereich schreiben
- DB-Transaktion vorbereiten
- bei Erfolg Datei finalisieren
- bei Fehler Rollback + Cleanup

## Minimale Audit- und Provenance-Persistenz

### Audit

Mindestens speichern:

- `event_id`
- `item_id`
- `actor_principal_id`
- `operation`
- `occurred_at`
- `payload_summary`

### Provenance

Mindestens speichern:

- Zielobjekt oder Zielfeld
- Herkunftstyp
- Quellobjekt oder Quelle
- Methode
- Confidence optional
- erstellt von Mensch/System/Agent

## Empfohlene SQLAlchemy-Strategie

### Domänennah arbeiten

- Domainmodelle nicht 1:1 mit ORM-Tabellen vermischen
- Repositories geben domainnahe Strukturen oder DTOs zurueck

### Session-Nutzung

- pro Capability eine Session / Unit of Work
- Session nicht ueber UI- oder Adaptergrenzen leaken

### Migrationen

- Alembic von Anfang an verwenden
- auch im lokalen SQLite-Setup

## Erste Persistenzmodule

Empfohlene Startmodule:

- `item_repository`
- `content_repository`
- `metadata_repository`
- `link_repository`
- `asset_repository`
- `project_repository`
- `principal_repository`
- `audit_repository`
- `provenance_repository`
- `search_repository`

Wichtige Regel:

- Repositories sind intern
- Capabilities sind die oeffentliche fachliche Oberflaeche

## Konkrete Empfehlung

Wenn du richtig planen willst, ohne die Zukunft zu verbauen, dann:

1. Zielarchitektur mit Capability Layer festziehen
2. den ersten Core klein halten
3. CLI als ersten echten Client bauen
4. Persistenz von Anfang an mit Audit, Provenance und Actor Context denken
5. SQLite bewusst als Startpunkt nutzen, aber Postgres nicht ausschliessen

## Nächster sinnvoller Schritt

Direkt anschliessend sollte aus diesem Dokument ein `08_persistence_design.md` oder direkt `schema.sql` plus `capability_mvp.md` abgeleitet werden.
