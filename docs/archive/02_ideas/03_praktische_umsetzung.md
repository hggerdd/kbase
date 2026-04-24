# Praktische Umsetzung

## Grundsatz fuer die erste Version

Nicht zuerst eine grosse PKM-App bauen. Der vernuenftige Start ist ein kleines lokales System mit klaren Schichten.

Die im Chat am klarsten getroffene Architekturentscheidung war:

1. Inhalte und Originaldateien dateibasiert halten.
2. SQLite als strukturierte Abfrage-, Index- und Beziehungs-Schicht nutzen.
3. Einen zentralen Python/FastAPI-Service davor setzen.
4. Darauf CLI, React-Web-App, Suche, MCP und Agenten aufbauen.

## Empfohlene Zielarchitektur

| Schicht | Aufgabe |
|---|---|
| Filesystem | Markdown, PDFs, Bilder, Tabellen als Originale |
| SQLite | Metadaten, Beziehungen, Suchdaten, Status, Zeitangaben |
| Domain / Capabilities | stabile Fachoperationen unabhaengig von UI oder Agent |
| Backend | FastAPI als zentrales Produkt-Backend |
| UI | React-Web-App als separater Client |
| Agenten-Zugriff | CLI, API und MCP ueber dieselben Capabilities |

## Agentenfaehige Zielsetzung

Das System soll nicht nur Daten speichern, sondern spaeter von Agenten stabil gelesen und erweitert werden koennen. Dafuer braucht es neben dem Schema auch feste Retrieval- und Schreibregeln.

Wichtige Zusatzanforderungen:

- kanonische Daten von abgeleiteten Daten trennen
- Kontextpakete statt nur rohe Einzelobjekte liefern
- Schreiboperationen nur entlang definierter Modellregeln erlauben
- Herkunft und Vertrauen von Extraktionen sichtbar machen

## High-Level-Architektur

Die spaeteren Chats praezisieren die interne Struktur deutlich:

```text
Clients
  - React Web App
  - CLI
  - MCP Server / Agents
        |
Interface Adapters
  - HTTP API
  - CLI Commands
  - MCP Tools
        |
Application / Capability Layer
        |
Domain Core
        |
Persistence / Search / Assets
  - SQLite
  - FTS / spaeter semantische Suche
  - Filesystem / Asset Storage
```

Wichtige Architekturentscheidung:

- kein zweites Fach-Backend fuer das Frontend
- eine gemeinsame FastAPI-Anwendung als zentrales Backend
- React ist ein eigener Client, aber nicht ein eigenes Business-Backend

## Rollen der Speicherformen

| Element | Rolle |
|---|---|
| PDF/Bild/Datei | Original und referenzierte Quelle |
| Markdown | menschlich lesbarer Kontext, Interpretation, Zusammenfassung |
| SQLite | strukturierte Daten, Suchbasis, Beziehungen, ACL |
| Agent | Analyse, Query, Zusammenfuehrung, Vorschlaege |

## Konkreter Startvorschlag

### Phase 1: Minimaler Kern

Start mit:

- Markdown-Dateien fuer Wissensinhalte
- Filesystem fuer Originaldokumente und Bilder
- SQLite fuer `items`, `item_files` oder spaeter erweitertes Asset-Modell, `content_parts`, `item_metadata`, `item_links`
- zusaetzlich von Anfang an `principals` und ACL mitdenken
- Capability Layer als zentrale Application-Schicht einziehen

### Phase 2: Praktisch nuetzliche Erweiterungen

- Volltextsuche
- Filter auf Typ, Kategorie, Labels, Zeitraum
- Ingestion fuer neue PDFs und Bilder
- manuelle Metadatenerfassung mit spaeterer halbautomatischer Extraktion

### Phase 3: Operative Funktionen

- Tasks und Events
- Wiederholungen
- Notifications als Regeln
- Review-Workflows

### Phase 4: Zeitreihen

- Gewicht und andere Metriken als `observation_series`
- einfache Verlaufsauswertung
- Analyse-Notes mit Link auf Serien

### Phase 5: Agent und MCP

- leseorientierte Tools fuer Suche und Kontext
- spaeter auch schreibende Workflows mit Review

Dabei sollte nicht direkt mit freien Universal-Tools gestartet werden, sondern mit wenigen stabilen Agentenfunktionen.

## Capability-First statt CRUD-First

Aus `chat_01.md` und `chat_03.md` ist eine klare Architekturentscheidung entstanden:

- nicht primär generische Repository- oder CRUD-Endpunkte nach aussen geben
- stattdessen fachliche Capabilities definieren

Beispiele:

- `create_item`
- `update_item_core`
- `replace_content_part`
- `register_asset`
- `attach_asset_to_item`
- `link_items`
- `assign_labels`
- `classify_item`
- `patch_item_metadata`
- `search_content`
- `get_item`
- `list_items`

Diese Operationen bilden spaeter gleichzeitig:

- HTTP API
- CLI
- MCP-Tools
- interne UI-Aktionen

## Minimaler MVP

Wenn direkt umgesetzt werden soll, reicht fuer Version 1:

### A. Inhalte anlegen und bearbeiten

- Note erstellen/bearbeiten
- definierte Metadatenfelder pflegen
- Bilder oder PDFs anhaengen
- interne Links zwischen Items setzen

### B. Beim Speichern indexieren

- Frontmatter oder Formularwerte uebernehmen
- `items` aktualisieren
- `content_parts` erzeugen
- Links und Dateien erfassen
- optional spaeter OCR, Chunks und Summaries

### C. Suche

- Volltext
- Filter nach `item_kind`
- Filter nach `category_key`
- Filter nach Principals, Labels und Zeitraemen

### D. Retrieval fuer Agenten

Sinnvolle erste API- oder MCP-Funktionen:

- `get_item`
- `search_items`
- `find_related_items`
- `get_recent_items`
- `get_item_context`
- `get_upcoming_tasks`
- `get_series_history`

Besser noch sind fachlich stabilere Kontextfunktionen:

- `get_item_with_sources`
- `get_research_bundle`
- `get_decision_context`
- `get_subject_timeline`
- `get_upcoming_for_principal`

Diese Funktionen reduzieren Prompt-Aufwand und sorgen dafuer, dass unterschiedliche Agents mit denselben konsistenten Datenpaketen arbeiten.

## MVP aus den spaeteren Chats

Der spaetere Stand definiert einen deutlich konkreteren MVP.

### MVP v1

- `get_item`
- `search_content`
- `list_items`
- `list_related_items`
- `create_note`
- `update_item_core`
- `archive_item`
- `add_content_part`
- `replace_content_part`
- `register_asset`
- `attach_asset_to_item`
- `create_document_from_asset`
- `link_items`
- `unlink_items`
- `assign_labels`
- `classify_item`
- `patch_item_metadata`
- `create_project`
- `add_item_to_project`
- `list_project_items`
- `get_item_history`
- `get_item_provenance`

### MVP v1.1

- Summaries
- Tasks und Events
- Measurements / Zeitreihen
- erweitertes Content Editing
- Label-Erstellung

## Kanonische und abgeleitete Daten

Fuer Tools und Agents sollte jedes relevante Datenfeld einer dieser Klassen zugeordnet werden:

| Klasse | Bedeutung |
|---|---|
| canonical | vom Benutzer bestaetigt oder Originaldatei |
| extracted | automatisiert aus Quelle extrahiert |
| inferred | aus anderen Daten abgeleitet |
| generated | von einem LLM oder Prozess erzeugt |

Beispiele:

- PDF = `canonical`
- OCR-Text = `extracted`
- erkannter Lieferant = `extracted` oder `inferred`
- Zusammenfassung = `generated`

Ohne diese Trennung wird Agentenverhalten spaeter schwer kontrollierbar.

## Schreibregeln fuer Agents

Agents sollten spaeter nicht beliebig in alle Tabellen schreiben. Sinnvoll ist ein abgestuftes Modell:

| Modus | Erlaubte Aktionen |
|---|---|
| read_only | lesen, suchen, Kontext bilden |
| propose | neue Metadaten, Links oder Summaries vorschlagen |
| reviewed_write | nach Nutzerbestaetigung schreiben |
| trusted_automation | klar begrenzte, regelbasierte Schreibpfade |

Fuer den Start reicht:

- Agenten duerfen lesen
- Agenten duerfen Vorschlaege erzeugen
- bestaetigte Writes laufen ueber klare App-Operationen

## Notes-first App als erster Client

Aus `chat_03.md` wurde fuer das Produkt eine klare erste Benutzeroberflaeche abgeleitet:

- Notizen sind der erste sichtbare Vertical Slice
- Rich Text Editor mit Markdown-Speicherung
- Desktop und Mobile bewusst unterschiedlich
- Kategorien und Labels suchbar
- neue Kategorien/Labels per Modal anlegbar
- Linked Resources als gemeinsames Konzept fuer Assets und andere Notizen
- spontane Aufnahme oder Upload direkt aus dem Note-Editor

### Primäre Navigation

- Home / Inbox
- Notes
- Assets / Library
- Search
- Domains
- Profile / Settings

### Erste Notes-Module

- Notes List
- Note Editor / Detail
- Metadata Panel
- Asset Picker / Uploader
- Search & Filter
- User / Identity

### Wichtige Notiz-Metafelder in v1

- Titel
- Kategorie
- Labels
- Ersteller
- Erstellungsdatum
- Letzte Aenderung
- Status
- optionale Kurzbeschreibung
- optionales Ereignisdatum
- Sichtbarkeit / Owner / Shared with
- Linked Resources

## UI-Vorschlag fuer die erste App

Kein komplexes Produkt, sondern ein kleines lokales Werkzeug.

### Sinnvolle Startansicht

| Bereich | Inhalt |
|---|---|
| linke Seite | Suche, Filter, Navigation |
| Mitte | Listenansicht oder Trefferliste |
| rechte Seite | Editor oder Detailansicht |

### Wichtige Eingabemasken

1. Item anlegen
2. Datei importieren
3. Metadaten bearbeiten
4. Links setzen
5. ACL und Subjects pflegen

## Praktische Modellierung fuer die ersten 5 Themen

| Thema | Primaerer Inhalt | Zusatzdaten |
|---|---|---|
| Wissensnotiz | Markdown | Labels, Links |
| Waschmaschinen-Recherche | Markdown + Dateien | Angebote, Bilder, Vergleich, Decision Note |
| Einkommensdokument | PDF | manuelle Finanzmetadaten |
| Kinderarzttermin | DB-Item | `start_at`, `end_at`, Notifications, ACL |
| Gewichtstracking | DB-Serie | Messpunkte und Analyse-Note |

## Vorschlag fuer die ersten Ordner im Projekt

Falls du aus den Ideen direkt ein Repo bauen willst, ist diese Startstruktur passend:

```text
project/
  app/
    core/
    application/
    persistence/
    search/
    assets/
    interfaces/
      api/
      cli/
      mcp/
    audit/
    automation/
  frontend/
  scripts/
  migrations/
  tests/
  kb/
    inbox/
    workspaces/
    items/
    db/
    logs/
```

## Reihenfolge fuer die Umsetzung

Die sinnvollste Reihenfolge aus den Chats ist:

1. `04_modelling_handbook.md` als normative Regelbasis festziehen.
2. `schema.sql` und `seed.sql` aus dem konsolidierten Modell ableiten.
3. Capability Layer und DTOs fuer den MVP festlegen.
4. Initialisierungsskript bauen, das DB und Ordnerstruktur erzeugt.
5. Einfachen Import fuer Notes und Dateien bauen.
6. Erste agentenfaehige Read-APIs, CLI oder MCP-Tools bauen.
7. Notes-first React-Client fuer Liste, Editor, Metadaten und Linked Resources bauen.
8. Research-Use-Case, Einkommensdokument und Projektkontext als Referenzfaelle umsetzen.
9. Danach Tasks/Events und zuletzt Zeitreihen ergaenzen.

## Was man anfangs bewusst nicht tun sollte

- nicht alles nur in PDFs speichern
- nicht alles in Markdown pressen
- nicht nur mit Dateinamen und Ordnern arbeiten
- nicht zu frueh vollautomatisch extrahieren
- nicht mit zu vielen Fachmodellen starten

## Empfehlung fuer den naechsten konkreten Schritt

Die naechste sinnvolle Arbeitsstufe ist:

1. das Modelling Handbook als verbindliche Regelbasis verwenden
2. daraus `schema.sql` und `seed.sql` erzeugen
3. Capability-Interface fuer MVP v1 festlegen
4. ein kleines Initialisierungsskript bauen
5. dazu agentenfaehige Read-Operationen definieren
6. dann 3-4 Referenzfaelle modellieren:
   - Waschmaschinen-Recherche
   - Einkommensdokument
   - Gewichtsserie
   - Notes-Workspace mit Kategorie, Labels und Linked Resources

Damit hast du sofort ein System, das nicht nur gut klingt, sondern schon real getestet werden kann.
