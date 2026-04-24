# Application Expansion Plan

## Ziel

Der naechste Plan soll nicht nur einen einzelnen Teilbereich beschreiben, sondern die naechste zusammenhaengende Ausbauphase fuer `kbase` als Produkt und als technische Plattform.

Dabei muessen diese Ebenen zusammen gedacht werden:

- Capabilities als fachlicher Kern
- Datenmodell und Persistenz
- HTTP-API
- CLI
- Frontend-App
- Teststrategie
- Dokumentation
- Betriebs- und Migrationsaspekte

Die wichtigste Regel bleibt:

- der Capability-Layer ist der einzige fachliche Schreibpfad
- API, CLI und Frontend sind Adapter ueber diesem Kern
- kein Client darf Fachlogik eigenstaendig verdoppeln

## Ausgangslage

Heute ist bereits vorhanden:

- ein Notes-Kern
- Projektanlage und Projektzuordnung
- Label-Zuweisung
- Metadaten
- History und Provenance
- Datei-Import als Datei-Item
- Inbox-Endpunkte
- FastAPI
- CLI
- eine modularisierte Frontend-App mit `Home`, `Notes`, `Projects`, `Imports`

Es fehlen aber noch zentrale Lesefaelle, Verwaltungsfunktionen und eine konsistente Produktfuehrung ueber alle Schichten.

Besonders sichtbar:

- `Projects` hat noch keinen echten List-/Detail-Read-Use-Case
- `Home` nutzt noch keine echten dedizierten Recent-Capabilities
- Label-Management ist noch keine vollstaendige Fachfunktion
- `Imports` ist funktional, aber noch nicht regelbasiert, batchfaehig oder analysierend
- Session/Auth ist nur vorbereitet, aber noch nicht als echter Layer vorhanden
- Dokumentation beschreibt den neuen App-Zustand noch nicht konsistent genug

## Zielbild der naechsten Ausbauphase

Die naechste groessere Ausbaustufe soll `kbase` in Richtung eines vielseitigen Knowledge-Base-Produkts schieben.

### Funktional soll danach moeglich sein

- Home zeigt sinnvolle aktuelle Einstiege statt nur statischer Platzhalter
- Projects ist als eigener Bereich benutzbar
- Imports fuehlt sich wie ein kontrollierter Eingang in das System an
- Dateien werden ueberall als echte Items behandelt
- Labels koennen als Struktur verwaltet werden
- API, CLI und Frontend bilden dieselben Faelle konsistent ab

### Technisch soll danach gelten

- jede neue fachliche Funktion existiert zuerst als Capability
- neue Read-Capabilities werden explizit eingefuehrt statt nur aus allgemeinen Listen zusammengebaut
- Testabdeckung folgt jeder Capability bis in API und CLI
- Produktdokumentation und Entwicklerdokumentation werden gemeinsam nachgezogen

## Leitthemen

Die naechste Ausbaustufe sollte entlang von sechs Themen umgesetzt werden.

### 1. Read-Modelle fuer die App

Die App braucht mehrere dedizierte Read-Capabilities, damit `Home`, `Projects` und `Imports` nicht mit Hilfskonstruktionen arbeiten.

### 2. Verwaltungsfaehigkeit statt nur Erfassung

Aktuell kann das System Inhalte schon gut erzeugen und veraendern. Es fehlt aber noch an echten Verwaltungsfunktionen fuer Labels, Projekte und spaeter Sessions.

### 3. Datei-zentriertes Wissensmodell

Das Zielbild aus dem File-Items-Plan muss nun breiter in Clients, Detailansichten und Workflows verankert werden.

### 4. Konsistente Adapter

API, CLI und Frontend muessen denselben Ausbaupfad abbilden. Wenn eine Capability neu entsteht, muessen die Adapter bewusst nachziehen.

### 5. Testbarkeit und Migration

Jede neue Funktion muss mit Tests, Fixtures, Migrationsschritten und Rueckfallstrategien gedacht werden.

### 6. Produktdokumentation

Die Architektur- und Nutzerdokumentation muss den neuen Stand wieder korrekt beschreiben.

## Arbeitsstroeme

## A. Capabilities

### Ziel

Die wichtigste naechste Arbeit liegt im Ausbau des Capability-Layers.

### A1. Home-Read-Capabilities

Neu einzufuehren:

- `list_recent_items`
- `list_recent_assets` oder besser `list_recent_file_items`
- optional `list_recent_projects`

Zweck:

- Home bekommt einen stabilen, schnellen, expliziten Read-Use-Case
- Clients muessen nicht selbst allgemeine Listen umsortieren oder kuerzen

Wichtige Entscheidungen:

- was bedeutet `recent`: `updated_at`, `created_at` oder nutzerspezifisch `last_touched_by_actor`
- nur aktuellem Actor zugeordnet oder global im Workspace
- wie wird Archivierung behandelt

### A2. Project-Read-Capabilities

Neu einzufuehren:

- `list_projects`
- `get_project`
- optional `search_projects`
- optional spaeter `list_recent_project_activity`

Zweck:

- `Projects` wird zu einer echten Hauptseite
- Projekt-Detailansichten koennen sauber aufgebaut werden

Rueckgabe sollte enthalten:

- Projekt-Summary
- Status
- Beschreibung
- letzte Aktivitaet
- Anzahl verknuepfter Items
- optionale Vorschauliste von verknuepften Items

### A3. Label-Management-Capabilities

Neu einzufuehren:

- `create_label`
- `rename_label`
- `deactivate_label`
- optional `reactivate_label`

Wichtige Fachregeln:

- `full_path` bleibt eindeutig
- Rename eines Knotens muss Subtree-Regeln sauber definieren
- Deactivate statt hartem Delete ist fuer den ersten Schritt vorzuziehen

### A4. Import-Weiterentwicklung

Aufbauend auf dem bestehenden Inbox-Flow:

- `preview_import_candidate`
- `attach_inbox_file_to_item` falls nicht schon implizit ueber `import_inbox_file` ausreichend
- spaeter `run_import_analysis`
- spaeter `suggest_import_metadata`
- spaeter `import_batch_by_rule`

Zweck:

- Imports soll nicht nur Datei reinnehmen, sondern Importentscheidungen vorbereiten

### A5. Session-/Actor-Vorbereitung

Noch ohne vollstaendige Auth:

- `get_current_session`
- `list_available_principals`
- optional `switch_actor_context`

Zweck:

- Frontend und API loesen sich von fest verdrahteten Actor-Annahmen
- Single-User lokal bleibt moeglich
- Multiuser kann spaeter sauber andocken

### A6. Datei-Item-Nacharbeit

Aufbauend auf dem File-Items-Refactor:

- `get_item` soll Datei-Informationen ueberall stabil liefern
- Datei-Links muessen in UI und API konsistent sichtbar sein
- alte Asset-Schreibpfade duerfen nicht weiter ausgebaut werden

## B. Datenmodell und Persistenz

### Ziel

Neue Fachfaelle duerfen nicht nur oberflaechlich in API oder UI erscheinen, sondern muessen sauber im Modell verankert werden.

### B1. Projekt-Read-Unterstuetzung

Pruefen und ggf. erweitern:

- wie Projektbeschreibung gespeichert wird
- wie Projektstatus modelliert ist
- wie Projekt-Counts effizient gelesen werden
- ob eine letzte Aktivitaet ableitbar ist oder explizit benoetigt wird

### B2. Label-Lifecycle-Unterstuetzung

Wahrscheinliche Erweiterungen:

- `is_active`
- ggf. `renamed_from_label_id` oder Audit reicht aus
- klare Parent-/Path-Aktualisierung

### B3. Datei-Item-Modell festigen

Pruefen:

- `item_files` ausreichend fuer alle Kernfaelle
- technisches Asset-Modell nur fuer Derivate reservieren
- Migration bestehender benutzerrelevanter Assets vorbereiten

### B4. Migrationsstrategie

Vor jeder groesseren Erweiterung muss klar sein:

- additive DB-Aenderung
- Seed-Anpassungen
- Ruemigration nicht zwingend, aber Fehlerfallstrategie
- Tests fuer Schema-Upgrade

## C. API

### Ziel

Die API soll die neuen Capabilities vollstaendig und konsistent exponieren.

### C1. Neue Endpunkte

Empfohlene Reihenfolge:

- `GET /api/home/recent-items`
- `GET /api/home/recent-file-items`
- optional `GET /api/home/recent-projects`
- `GET /api/projects`
- `GET /api/projects/{project_id}`
- optional `GET /api/projects/search`
- `POST /api/labels`
- `PATCH /api/labels/{label_id}`
- `POST /api/labels/{label_id}/deactivate`
- `GET /api/session`
- `GET /api/session/principals`
- optional `POST /api/session/switch`

### C2. Imports-API

Sinnvolle Erweiterungen:

- `POST /api/imports/preview`
- `POST /api/imports/attach-to-item`
- spaeter `POST /api/imports/analyze`

Wichtig:

- nicht verschiedene konkurrierende Upload- oder Importpfade schaffen
- neue Imports-Endpunkte muessen auf denselben Capability-Kern zeigen

### C3. API-Schemas

Fuer alle neuen Faelle muessen DTOs und Pydantic-Schemas sauber erweitert werden:

- keine ad-hoc Dictionaries
- sprechende Rueckgabemodelle
- explizite `Result`-Typen fuer Listen und Detailfaelle

### C4. API-Konventionen

Die naechste Phase sollte bestehende Konventionen angleichen:

- konsistente Namensgebung fuer Endpunkte
- klare Trennung zwischen `GET` Read-Modellen und `POST/PATCH/PUT` Write-Faellen
- standardisierte Fehlerrueckgaben

## D. CLI

### Ziel

Die CLI bleibt ein vollwertiger Erst-Client und muss jeden neuen Kernfall abbilden.

### D1. Neue CLI-Befehle

Einzufuehren:

- `home recent-items`
- `home recent-file-items`
- `project list`
- `project get`
- optional `project search`
- `label create`
- `label rename`
- `label deactivate`
- `session whoami`
- `session list-principals`
- optional `session switch`

### D2. Import-CLI

Weiterentwicklung:

- `import preview`
- `import attach-to-item`
- spaeter `import batch`

### D3. CLI-Regeln

Wichtig:

- CLI bleibt duenn
- keine Pfadlogik oder Fachvalidierung im Interface
- JSON-Ausgaben fuer Automatisierung konsequent pflegen

## E. Frontend-App

### Ziel

Die App-Struktur ist jetzt vorhanden. Die naechste Stufe ist, die Hauptbereiche mit echten fachlichen Daten zu fuellen.

### E1. Home produktiv machen

Wenn die Read-Capabilities verfuegbar sind:

- echte `recent items`
- echte `recent file items`
- echte `recent projects`
- spaeter Aktivitaetsmodul

### E2. Projects produktiv machen

Mit `list_projects` und `get_project`:

- Projektliste
- Projekt-Detailseite
- verknuepfte Items
- Filter nach Status
- Suchfeld

### E3. Imports ausbauen

Mit Preview- und Analyse-Capabilities:

- Vorschau-Panel
- Zuordnung zu bestehendem Item
- Erzeugung eines neuen Items
- spaeter Regelsets fuer Batch-Importe

### E4. Label-Management-Oberflaeche

Nach Capability/API/CLI:

- Label suchen
- Label anlegen
- Label umbenennen
- Label deaktivieren

### E5. Session-Layer im Frontend

Nach Session-Endpunkten:

- Session-Provider
- Actor-Anzeige in der App-Bar
- Umschalten des Actor-Kontexts
- API-Header zentral aus Session-Modul

### E6. Datei-Items im UI

Weiterer Ausbau:

- Datei-Items nicht nur als Anhang verstehen
- Datei-Detailansichten spaeter moeglich machen
- verknuepfte Dateien auf `Notes` und `Projects` klarer darstellen

## F. Teststrategie

### Ziel

Jede neue Funktion wird von Anfang an ueber mehrere Ebenen abgesichert.

### F1. Capability-Tests

Fuer jede neue Capability:

- Happy Path
- Validierungsfehler
- Randfaelle
- Berechtigungs-/Actor-Annahmen soweit relevant
- Audit-/Provenance-Eintrag falls vorgesehen

### F2. Repository- und Integrations-Tests

Notwendig fuer:

- Label-Rename mit Subtree
- Project-Read-Modelle
- Datei-Item-Details
- Inbox-/Import-Verhalten
- DB-Migrationen

### F3. API-Tests

Abzusichern:

- Statuscodes
- Fehlerfaelle
- Schemaform der Antworten
- Actor-Header-Verhalten

### F4. CLI-Tests

Abzusichern:

- neue Befehle
- JSON-Format
- Fehlermeldungen
- Interaktion neuer Commands mit bestehenden Workflows

### F5. Frontend-Tests

Sinnvolle Einfuehrung jetzt oder spaetestens mit den naechsten echten Seiten:

- Komponenten-/Hook-Tests fuer Notes- und Imports-Workspaces
- Navigation
- Home-Datenladelogik
- Fehler- und Empty-States

Falls noch kein Teststack im Frontend existiert, sollte jetzt ein kleiner, gezielter Start erfolgen statt auf spaeter zu schieben.

### F6. End-to-End-Denken

Noch nicht zwingend sofort vollautomatisiert, aber konzeptionell vorbereiten:

- API + Frontend zusammen fuer Kernflows
- Note erstellen
- Datei importieren
- Projekt erstellen

## G. Dokumentation

### Ziel

Dokumentation soll nicht hinter der Implementierung herlaufen.

### G1. Architektur

Nachziehen oder erweitern:

- Capability-Landschaft
- Datei-Item-Modell
- Read-Modelle fuer Home/Projects
- Session-/Actor-Konzept

### G2. API-Dokumentation

Aktualisieren:

- neue Endpunkte
- Beispiel-Requests
- Beispiel-Responses
- Actor-/Session-Konventionen

### G3. CLI-Dokumentation

Aktualisieren:

- neue Befehle
- typische Workflows
- JSON-Beispiele

### G4. Frontend-Dokumentation

[FRONTEND_APP.md](../FRONTEND_APP.md) muss nach dem App-Shell-Refactor aktualisiert werden:

- neue Struktur
- neue Navigationslogik
- neue API-Nutzung
- aktueller Designansatz
- neue Startanweisungen

### G5. README

[README.md](../README.md) muss ebenfalls nachgezogen werden:

- aktueller Status
- aktueller Frontend-Stand
- Datei-Items statt altem Asset-Fokus
- neue CLI- und API-Faelle

## H. Reihenfolge der Umsetzung

Die naechste Ausbauphase sollte in dieser Reihenfolge erfolgen.

### Phase 1: Read-Capabilities fuer App-Navigation

Implementieren:

- `list_recent_items`
- `list_recent_file_items`
- `list_projects`
- `get_project`

Danach:

- API-Endpunkte
- CLI-Befehle
- Home und Projects im Frontend anschliessen

### Phase 2: Label-Management

Implementieren:

- `create_label`
- `rename_label`
- `deactivate_label`

Danach:

- API
- CLI
- Tests
- spaeter Frontend-Verwaltung

### Phase 3: Import-Flow ausbauen

Implementieren:

- Preview-Use-Case
- Item-Zuordnung aus Inbox
- bessere Importentscheidung im Frontend

### Phase 4: Session-/Actor-Layer

Implementieren:

- Session-Read-Endpunkte
- Frontend-Session-Modul an API koppeln
- CLI-Introspektion

### Phase 5: Dokumentation und Konsolidierung

Pflicht am Ende jeder groesseren Phase:

- README
- FRONTEND_APP
- API_DOKU
- relevante Architekturdateien

## Konkrete Code-Baustellen

Die folgenden Bereiche sind fuer die naechste Phase besonders relevant.

### Backend / Application

- `src/kbase/application/capabilities/`
- `src/kbase/application/dto/capabilities.py`
- `src/kbase/application/dto/common.py`
- `src/kbase/application/services/mappers.py`

### Persistenz

- `src/kbase/infrastructure/db/repositories/`
- `src/kbase/infrastructure/db/sql/001_schema.sql`
- zusaetzliche Migration-/Init-Skripte falls eingefuehrt

### API

- `src/kbase/interfaces/api/main.py`
- `src/kbase/interfaces/api/schemas.py`
- `API_DOKU.md`

### CLI

- `src/kbase/interfaces/cli/main.py`

### Frontend

- `frontend/src/features/`
- `frontend/src/pages/`
- `frontend/src/shared/`
- `frontend/src/app/`
- `FRONTEND_APP.md`

### Tests

- `tests/application/`
- `tests/integration/`
- `tests/interfaces/api/`
- `tests/interfaces/cli/`
- optional neuer Frontend-Testordner

## Risiken

### 1. Read-Modelle zu spaet definieren

Wenn `Home` und `Projects` weiter ohne echte Read-Capabilities wachsen, entstehen unsaubere Client-Workarounds.

### 2. Doppelte Semantik bei Dateien

Wenn alte Asset-Pfade und neue Datei-Item-Pfade parallel weiter ausgebaut werden, wird das Modell unklar.

### 3. Label-Rename ohne klare Regeln

Hier drohen Inkonsistenzen in Hierarchien und Item-Zuordnungen.

### 4. Session nur halb vorbereiten

Wenn API, CLI und Frontend Actor-Kontext unterschiedlich behandeln, wird die spaetere Auth-Integration teuer.

### 5. Dokumentation driftet erneut weg

Nach der letzten Frontend-Ausbaustufe ist dieser Drift bereits sichtbar. Das sollte nicht wieder passieren.

## Definition of Done fuer diese Ausbauphase

Die Phase ist erst dann wirklich abgeschlossen, wenn:

- neue Kernfaelle als Capabilities implementiert sind
- API und CLI die neuen Faelle abbilden
- Frontend mindestens `Home`, `Projects` und `Imports` sinnvoll anschliesst
- Tests auf Capability-, API- und CLI-Ebene vorliegen
- README, FRONTEND_APP und API-Doku aktualisiert sind
- offene Altpfade klar als deprecated markiert oder nicht weiter ausgebaut werden

## Prioritaet

Die sinnvollste Priorisierung lautet:

1. Read-Capabilities fuer `Home` und `Projects`
2. API + CLI dafuer
3. Frontend-Seiten an echte Daten anschliessen
4. Label-Management
5. Import-Preview und Import-Entscheidungen
6. Session-/Actor-Layer
7. Dokumentation konsequent nachziehen

## Zusammenfassung

Die naechste Ausbaustufe sollte `kbase` nicht nur um einzelne Features ergaenzen, sondern die App als zusammenhaengendes Produkt stabilisieren.

Der wichtigste Schritt ist jetzt:

- fehlende Read-Capabilities sauber einfuehren
- Adapter konsistent nachziehen
- Datei-Items, Projekte, Imports und Labels als echte Produktbereiche ausbauen

Nur so wird aus dem aktuellen Notes-zentrierten Kern eine vielseitige, belastbare Knowledge-Base-Anwendung.
