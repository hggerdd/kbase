# TODO

Diese Datei ist die strukturierte ToDo-Liste für dieses Repository. Aufgaben sind nach Epics gegliedert; bitte bei Änderungen Owner, Priority und Estimate ergänzen. Jede Aufgabe sollte eine kurze, prüfbare Akzeptanzbedingung bekommen.

## Hinweise zur Nutzung
- Owner: @name
- Priority: high | medium | low
- Estimate: z.B. 1d, 3pt
- Acceptance: kurze, prüfbare Kriterien unter der Aufgabe

## Epic: Label Management
- [ ] Festlegen: Label-Lifecycle & Regeln (delete vs deactivate; rename-Propagation)
	- Acceptance: Dokument mit Beispiel-Scenarios (rename, deactivate) vorhanden
	- Owner: TBD
	- Priority: High
- [ ] DB-Modell & Migration (labels table: id, parent_id, full_path, active, meta)
	- Acceptance: Migration + rollback + sample data vorhanden
- [ ] Core-Capabilities: create_label, rename_label, deactivate_label, reactivate_label, list_labels (merge optional)
	- Acceptance: Unit-Tests für Capabilities
- [ ] API: POST /api/labels, GET /api/labels, PATCH /api/labels/{id}, POST /api/labels/{id}/deactivate
- [ ] CLI: mirror capabilities (kbase label create|list|rename|deactivate)
- [ ] Frontend: Label-Management UI (search, create, rename, deactivate)
- [ ] Tests & Fixtures für Label-Flows

## Epic: Search
- [ ] Globale Suchleiste (sichtbar auf allen Seiten, toggle global default: off)
	- Acceptance: Page-context filter funktioniert (z.B. Notes → nur Notes)
- [ ] Erweiterte Suchseite mit Filtern (category, label-hierarchy, type, date, owner)
- [ ] Saved searches & Search history
- [ ] Performance: Indexing plan, relevance ranking, paging

## Epic: Files Viewer / File Management
- [x] Files-Page: Explorer-Baum (configurable), Original-Dateinamen anzeigen
	- Acceptance: Tree konfigurierbar, Klick öffnet Detail-Pane
- [ ] File Summary Editor (rich text) mit Edit-Button und Autosave (debounce)
- [ ] Previews: PDF (initial), Images, Text
- [ ] UX-Fixes: linke Navigationsleiste fixiert; Tree default width; Metadaten kompakt
- [ ] Tests: 10 Testdateien mit Label test als Fixtures

## Epic: Projekte (Projects View)
- [ ] Data model & API: projects + project_items (relationale Verknüpfung zu Notes/Files/Tasks)
- [ ] Frontend: Projects List + Project Detail (Tabs: Overview, Notes, Files, Data, Timeline)
- [ ] Verknüpfung: Item→Project (single + bulk) + Drag&Drop
- [ ] Import/Export: ZIP/JSON Export, CSV Import mit Mapping UI
- [ ] Wireframes & Specs: siehe [03_implementation_plan/09_projects_wireframe.md](03_implementation_plan/09_projects_wireframe.md) und [03_implementation_plan/08_projects_view_plan.md](03_implementation_plan/08_projects_view_plan.md)

## Epic: Autosave & UX
- [x] Speichern on change (Autosave mit Debounce) — bereits implementiert
- [ ] Konflikt-Handling bei gleichzeitigem Edit
- [ ] Accessibility & Keyboard Navigation

## Epic: Tests & Test Data
- [ ] API Unit Tests
- [ ] Integration Tests
- [ ] Frontend Smoke / E2E Tests
- [ ] Test fixtures & sample CSVs

## Epic: Ops & Rollout
- [ ] Feature-Flag für Label Management
- [ ] Migrationsplan + Backup + Rollback-Procedures
- [ ] Monitoring / Telemetry (failed operations, latency, adoption)

## Admin / Process
- [ ] Owner & Priority für alle Aufgaben ergänzen
- [ ] Aufwandsschätzung (T-Shirt / Story Points)
- [ ] Aufteilen in Arbeitspakete & Priorisierung (MVP vs Phase 2)

## Kurzfristige UI-Fixes (Status)
- [ ] Linke Navigationsleiste fixieren (UX)
- [ ] File viewer: Stored path → Zeilenumbruch aktivieren
- [ ] File summary: Benennen + Edit-Button (rich text)
- [ ] Treeview schmaler, Metadaten kompakter, Preview-Bereich für PDFs

## Appendix / Hinweise
- Originale Detailnotizen zu Label-Management sind im Git-Log; bei Bedarf extrahiere ich sie in ein eigenes Spec-Dokument.


Aktuell koennen Labels:

- global gelesen werden
- an Items angehaengt werden
- an Items komplett ersetzt werden

Was noch fehlt, ist eine echte Verwaltung der Label-Entitaeten selbst.

## Zielbild

Labels sollten nicht nur implizit beim Zuweisen an ein Item entstehen, sondern auch explizit verwaltet werden koennen.

Dafuer braucht es eine eigene Label-Management-Schicht mit klaren Regeln.

## Fachliche Idee

### 1. Labels als eigenstaendige Struktur behandeln

Ein Label ist nicht nur ein freier String, sondern ein Knoten in einer Hierarchie:

- `finance`
- `finance/investing`
- `finance/investing/etf`

Die Verwaltung sollte auf `full_path` und der Parent-Child-Struktur aufbauen.

### 2. Gewuenschte Operationen

Es sollten eigene Capabilities geben fuer:

- `create_label`
- `rename_label`
- `deactivate_label` oder `delete_label`
- optional spaeter: `merge_labels`

### 3. Delete nicht sofort physisch

Ein hartes Loeschen ist riskant, weil Labels bereits mit vielen Items verknuepft sein koennen.

Deshalb ist fuer den ersten sinnvollen Schritt wahrscheinlich besser:

- `deactivate_label`

statt:

- physisch loeschen

Vorteile:

- bestehende Referenzen bleiben nachvollziehbar
- UI kann inaktive Labels ausblenden
- spaeteres Restore bleibt moeglich

### 4. Rename sauber definieren

Beim Umbenennen eines Labels muss klar geregelt werden, ob:

- nur der Zielknoten umbenannt wird
- oder die ganze Subtree-Struktur mitgezogen wird

Beispiel:

- alt: `finance/investing`
- neu: `finance/assets`

Dann muss entschieden werden, ob auch automatisch:

- `finance/investing/etf`

zu:

- `finance/assets/etf`

wird.

Fuer eine hierarchische Labelstruktur ist diese Propagation in der Regel sinnvoll.

### 5. Auswirkungen auf bestehende Item-Zuordnungen

Wenn ein Label umbenannt wird, muessen auch alle `item_labels` konsistent bleiben.

Das kann technisch auf zwei Arten gedacht werden:

- Label-ID bleibt stabil, nur `full_path` aendert sich
- Unterknoten werden ebenfalls angepasst

Das waere die bevorzugte Richtung, weil Item-Zuordnungen dann nicht neu geschrieben werden muessen, sondern nur die Knotendaten.

### 6. Vorschlaege fuer Modellregeln

- `full_path` bleibt global eindeutig
- jedes Segment darf nur einen Parent haben
- Rename darf keine Kollision mit bestehendem `full_path` erzeugen
- Delete/Deactivate darf bei aktiven Referenzen nicht unkontrolliert zu Inkonsistenz fuehren
- Capabilities muessen Hierarchie und Referenzen atomar veraendern

## Technische Richtung

### Neue oder erweiterte Capabilities

Geplante Capabilities:

- `create_label`
- `list_labels` ist bereits vorhanden
- `rename_label`
- `deactivate_label`
- optional spaeter: `reactivate_label`

### API

Wichtiger Hinweis:

Wenn diese Capabilities eingefuehrt werden, muessen sie nicht nur intern existieren, sondern auch auf die HTTP-API gegeben werden.

Geplante API-Endpunkte koennten sein:

- `POST /api/labels`
- `GET /api/labels`
- `PATCH /api/labels/{label_id}` oder `PATCH /api/labels/by-path/{full_path}`
- `DELETE /api/labels/{label_id}` oder besser `POST /api/labels/{label_id}/deactivate`

### CLI

Wichtiger Hinweis:

Die neuen Label-Capabilities muessen auch in die CLI gespiegelt werden.

Beispiele:

- `kbase label create`
- `kbase label list`
- `kbase label rename`
- `kbase label deactivate`

Die Zielarchitektur bleibt nur dann konsistent, wenn Capability Layer, API und CLI denselben Fachkern nutzen.

## Frontend-Auswirkung

Wenn Label-Management eingefuehrt wird, sollte das Frontend spaeter auch eine kleine Verwaltungsoberflaeche bekommen:

- existierende Labels durchsuchen
- neue Labels anlegen
- Labels umbenennen
- Labels deaktivieren

Das ist aber nachgelagert. Der erste Schritt ist die saubere Capability-/API-/CLI-Schicht.

## Offene Entscheidungen

Noch zu klaeren:

- soll `delete` ueberhaupt erlaubt sein oder nur `deactivate`
- wie wird Rename von Subtrees genau behandelt
- soll global ueber `id` oder ueber `full_path` adressiert werden
- wie werden inaktive Labels in Suche, Frontend und Zuordnung behandelt

## Empfohlene Reihenfolge

1. Fachregeln fuer Label-Lifecycle festziehen
2. Capability-Design definieren
3. Repository-Operationen sauber entwerfen
4. API-Endpunkte darauf setzen
5. CLI-Befehle darauf setzen
6. danach Frontend-Management ergaenzen


## [ ] prüfe die aktuelle implementierung gegen das konzept
- passt das so
- sind wir nicht zu stringent unterwegs und verlieren flexibilität (siehe zuordnung files zu notes)

## [x] speichern on change
Speichere Änderungen wie bei modernen online tools automatisch uns sofort (mit einer leichten Verzögerung, um unendlich viele schreibvoränge zu vermeiden). Stelle sicher, dass der Nutzer es nicht merkt. Also nicht irgendwelche reloads oder verschieben des Fokus o.ä.


## [x] Suchfunktion deutlich verbessern
Wenn ich etwas suche, dann gib mir eine strukturierten output.
1. Die Suchleiste soll global sichtbar sein auf jeder seite.
2. Bei der Suche füge einen Schalter für global hinzu (er ist standardmäßig aus)
3. bei der Suche verwende die aktuelle seite als Filter (z.B. Notes Seite sucht nur in Notes)
4. Wenn global ausgewählt ist, Suche im ganzen System
5. wenn die Suche ausgeführt ist, dann zeige alle Ergebnisse (nach relevanz sortiert an) - auf der Linken Seite
6. Füge eine explizite Suchseite hinzu. Hier muss es dann möglich sein, advanced zu suchen nach gezielten Kriterien (z.B. Categorie, Label, labelhierarchie, etc.)
7. Speichere Suchverläufe 

## [x] Ertelle eine Seite, die explizit für Dateien gemacht ist
Erstelle eine Seite, die dafür da ist, durch die Dateien zu navigieren. Dies soll anhand eines Explorerartigen Baumes erfolgen. Die Struktur des Baumes muss auswählbar sein.
- Category --> label --> Datei (mit Orginalname, nicht wie er abgelegt ist) --> Füge Filter für Labels hinzu, damit nur diese angezeigt werden
- Beispiel: Category: finance/income --> labels: Jahr 2025 und 2026. Dann werden in dem Baum alle evtl. Unterkategorien für finance/income als root nodes verwendet. Unterordner sind dann alle Labels die gewählt sind (hier 2025 und 2026). darunter werden alle Dateien angezeigt die diese Kriterien erfüllen (am Besten mit dem Orginalnamen). Wenn auf eine Datei geklickt wird, kommt rechts dabenen (oben rechts) eine detailansicht mit dem titel der datei, metadaten soweit vorhanden und die Zusammenfassung (markdown). Zeige die zusammenfassung in einem rich text element an mit passender formatierung.
- für das testen erstelle 10 testdateien die dann in der struktur sind (gib das label test)