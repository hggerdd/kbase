# TODO

Diese Datei ist die strukturierte ToDo-Liste für dieses Repository. Aufgaben sind nach Epics gegliedert; bitte bei Änderungen Owner, Priority und Estimate ergänzen. Jede Aufgabe sollte eine kurze, prüfbare Akzeptanzbedingung bekommen.

## Hinweise zur Nutzung
- Owner: @name
- Priority: high | medium | low
- Estimate: z.B. 1d, 3pt
- Acceptance: kurze, prüfbare Kriterien unter der Aufgabe

## Epic: Label Management
- [ ] Labels are currently only words. But I want also hierarchical labels (eg. finance\income\data or finance\bank\depot\data) that are not just strings with a divider but realy different levels that can individually be searched (not just "label starts with finance"). And data below finance\income is something else than data under finance\bank
- [ ] Refactor the app to handle this kind of labels (also in the filter criteria)
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
- [ ] Frontend: Label-Management standard modal ui for create, rename, remove that is reused in multiple places (in each place of the app where a lable can be added that modal can be used to spontantinious update the labels and use it)
- [ ] Tests & Fixtures für Label-Flows

- [ ] Spec & implementation plan: siehe [03_implementation_plan/10_label_management_plan.md](03_implementation_plan/10_label_management_plan.md)

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

## Architekturreview 2026-04-16: konkrete Umsetzungs-ToDos

Diese ToDos leiten sich direkt aus dem Architektur- und Sicherheitsreview ab. Sie sind absichtlich so formuliert, dass ein neuer Thread ohne weiteren Kontext damit weiterarbeiten kann.

### Security / Trust Boundary

- [ ] `SEC-001` Authentifizierungskonzept fuer API und Frontend festlegen
	- Ziel: Die API darf den Actor nicht mehr implizit oder ungeprueft aus einem frei setzbaren Header uebernehmen.
	- Ist-Zustand: `x-kbase-actor` kann vom Client frei gesetzt werden; ohne Header wird aktuell `heiko` verwendet.
	- Aufgabe:
		- Definiere ein minimales Auth-Konzept fuer die aktuelle lokale/LAN-Nutzung.
		- Entscheide, ob API-Key, Session, Reverse-Proxy-Auth oder ein anderer Mechanismus verwendet wird.
		- Dokumentiere die Vertrauensgrenzen zwischen Browser, LAN und Backend.
	- Acceptance:
		- Es gibt ein kurzes Spec-Dokument fuer Authentifizierung.
		- Der Fallback auf `heiko` ist entfernt.
		- Requests ohne gueltige Authentifizierung werden abgewiesen.
		- Frontend, README und API-Doku verwenden dieselbe Auth-Annahme.

- [ ] `SEC-002` Autorisierung / ACL-Durchsetzung fuer Reads und Writes aktivieren
	- Ziel: Vorhandene ACL-Strukturen im Schema sollen fachlich wirksam werden.
	- Ist-Zustand: `item_acl` existiert im Datenmodell, wird zur Laufzeit aber nicht ausgewertet.
	- Aufgabe:
		- Definiere, welche Operationen Lese- bzw. Schreibrechte benoetigen.
		- Fuehre zentrale Berechtigungspruefungen im Capability-Layer oder in einer gemeinsamen Serviceschicht ein.
		- Ziehe die Pruefungen in die kritischen Endpunkte ein: Items, Notes, Uploads, Labels, Categories, Projects, Datei-Downloads.
	- Acceptance:
		- Es gibt eine dokumentierte ACL-Regelbasis.
		- Unerlaubte Zugriffe liefern einen klaren Fehlerstatus.
		- Tests decken erlaubte und verbotene Zugriffe ab.

- [ ] `SEC-003` Stored-XSS-Schutz fuer Notes und File-Summaries einfuehren
	- Ziel: Persistierte Inhalte duerfen beim Anzeigen im Browser keine aktiven Skripte oder unsicheres HTML ausfuehren.
	- Ist-Zustand: Markdown/HTML wird im Frontend in HTML umgewandelt und in Rich-Text-Komponenten uebernommen; eine explizite Sanitization ist nicht ersichtlich.
	- Aufgabe:
		- Definiere eine einheitliche Sanitization-Strategie fuer Notes, File-Summaries und andere Rich-Text-Flaechen.
		- Implementiere diese Strategie an allen relevanten Rendering-Pfaden.
		- Erstelle reproduzierbare Tests oder Sicherheitsbeispiele fuer typische XSS-Payloads.
	- Acceptance:
		- Notes und File-Summaries nutzen dieselbe sichere Rendering-Pipeline.
		- Schadhafte HTML-/Script-Payloads werden neutralisiert.
		- Die Sanitization-Strategie ist dokumentiert.

- [ ] `SEC-004` CORS- und Client-Trust-Modell haerten und dokumentieren
	- Ziel: Die Freigabe fuer lokale und LAN-Clients soll explizit und nachvollziehbar sein.
	- Ist-Zustand: CORS ist fuer Development/LAN pragmatisch offen genug, die Sicherheitsannahmen sind aber nicht sauber dokumentiert.
	- Aufgabe:
		- Dokumentiere erlaubte Origins und den Umgang mit Credentials.
		- Trenne lokale Entwicklung, LAN-Zugriff und einen moeglichen spaeteren produktiven Modus klar.
		- Pruefe, welche Defaults fuer lokale Entwicklung in Ordnung sind und welche explizit als unsicher markiert werden muessen.
	- Acceptance:
		- README/API-Doku enthalten einen klaren Abschnitt zu CORS und Trust Boundary.
		- Unsichere Defaults sind minimiert oder klar als Entwicklungsmodus gekennzeichnet.

- [ ] `SEC-005` Sicherheitsreview fuer Datei-Upload und Datei-Auslieferung vervollstaendigen
	- Ziel: Pfadschutz, Dateigroessen, MIME-Vertrauen und Download-Sicherheit sollen nachvollziehbar bewertet werden.
	- Ist-Zustand: Es gibt bereits Pfadpruefungen, aber kein dokumentiertes Bedrohungsmodell.
	- Aufgabe:
		- Dokumentiere Schutzmechanismen gegen Path Traversal fuer Inbox, Storage und Download.
		- Ergaenze offene Themen wie Dateigroessenlimits, MIME-Spoofing, Malware-Scan und Rate-Limits.
		- Entscheide, welche Themen sofort umgesetzt werden und welche bewusst spaeter folgen.
	- Acceptance:
		- Ein kompaktes Sicherheitsdokument fuer Upload/Download liegt vor.
		- Vorhandene Schutzmechanismen sind durch Tests abgesichert.
		- Offene Restrisiken sind als Folge-ToDos erfasst.

### Architektur-Konsistenz

- [ ] `ARCH-001` README, API-Doku und realen Systemstand synchronisieren
	- Ziel: Dokumentation und Implementierung duerfen sich nicht widersprechen.
	- Ist-Zustand: README und API-Doku beschreiben Teile des aktuellen Stands nicht mehr korrekt.
	- Aufgabe:
		- Aktualisiere README auf den tatsaechlichen Stand von API, Frontend und offenen Themen.
		- Ergaenze die aktuellen Endpunkte fuer Labels und Categories in der API-Doku.
		- Entferne oder korrigiere Aussagen, die nicht mehr zutreffen.
	- Acceptance:
		- README, API_DOKU.md und `todo.md` beschreiben denselben Systemstand.
		- Die neuen Category-Endpunkte sind dokumentiert.
		- Veraltete Aussagen wie "FastAPI-Endpoints noch offen" sind bereinigt.

- [ ] `ARCH-002` Capability-Matrix fuer API, CLI, Frontend und Tests erstellen
	- Ziel: Neue Fachfunktionen sollen nicht versehentlich nur in einer Schnittstelle existieren.
	- Ist-Zustand: Categories existieren bereits in Capability-Layer und API, aber noch nicht in der CLI.
	- Aufgabe:
		- Erstelle eine Tabelle: Capability -> API -> CLI -> Frontend -> Tests.
		- Trage vorhandene Capabilities systematisch ein.
		- Markiere sichtbare Luecken als Folgearbeiten.
	- Acceptance:
		- Es gibt ein Artefakt mit der vollstaendigen Capability-Abdeckung.
		- Categories sind dort als Beispiel vollstaendig eingeordnet.
		- Ein neuer Thread kann daraus fehlende Spiegelungen direkt ableiten.

- [ ] `ARCH-003` Category-Management vollstaendig in die Systemarchitektur einhaengen
	- Ziel: Categories sollen keine halbfertige API/Frontend-Erweiterung bleiben.
	- Ist-Zustand: Categories sind im Backend und Frontend vorhanden, aber noch nicht in der CLI und noch nicht vollstaendig dokumentiert.
	- Aufgabe:
		- Spiegele Category-Capabilities in die CLI.
		- Ergaenze Tests fuer CLI und ggf. Integration.
		- Dokumentiere, wie Categories fachlich genutzt werden sollen.
	- Acceptance:
		- Categories sind in Capability-Layer, API, CLI, Frontend und Tests sichtbar.
		- README/API-Doku enthalten die Bedienwege.

### Labels / Taxonomie

- [ ] `ARCH-004` Label-Lifecycle final fachlich festlegen
	- Ziel: Es muss verbindlich entschieden werden, ob physisches Loeschen erlaubt ist oder `deactivate/reactivate` der Standard bleibt.
	- Ist-Zustand: Konzept bevorzugt `deactivate`, Implementierung bietet trotzdem bereits physisches Loeschen.
	- Aufgabe:
		- Dokumentiere die Zielentscheidung fuer `create`, `rename`, `deactivate`, `reactivate` und `delete`.
		- Beschreibe Auswirkungen auf Subtrees, Item-Zuordnungen und Suche.
	- Acceptance:
		- Ein kurzes Spec-Dokument zum Label-Lifecycle liegt vor.
		- Die Entscheidung ist in `todo.md` klar referenziert.

- [ ] `ARCH-005` Label-Delete an die Lifecycle-Entscheidung anpassen
	- Ziel: Implementierung und Konzept muessen identisch sein.
	- Ist-Zustand: Label-Subtrees koennen physisch geloescht werden; Item-Label-Zuordnungen werden dabei entfernt.
	- Aufgabe:
		- Entferne, schuetze oder bestaetige `DELETE /api/labels/{id}` gemaess `ARCH-004`.
		- Passe Capability, API, CLI, Frontend und Tests konsistent an.
	- Acceptance:
		- Es gibt keinen Widerspruch mehr zwischen Konzept, Doku und Implementierung.
		- Tests decken das gewollte Delete-/Deactivate-Verhalten ab.

- [ ] `ARCH-006` Label-Management gegen das bestehende Konzept sauber abgleichen
	- Ziel: Ein neuer Thread soll sofort erkennen, welche Teile des urspruenglichen Label-Konzepts bereits umgesetzt sind und welche nicht.
	- Aufgabe:
		- Aktualisiere den Label-Abschnitt in `todo.md`.
		- Markiere explizit: umgesetzt, teilweise umgesetzt, offen.
		- Halte offene Entscheidungen getrennt von bereits fixierten Regeln.
	- Acceptance:
		- Der Label-Abschnitt dient als belastbares Arbeitsdokument.
		- Ein neuer Thread kann daraus direkt die naechsten Schritte ableiten.

### Search / Saved Queries

- [ ] `ARCH-007` Search History und Saved Queries fachlich sauber entscheiden
	- Ziel: Search History soll entweder bewusst lokal bleiben oder als echte serverseitige Capability umgesetzt werden.
	- Ist-Zustand: Das Schema enthaelt `saved_queries`, das Frontend speichert die Historie aber nur in `localStorage`.
	- Aufgabe:
		- Entscheide, ob Suchverlaeufe/Saved Queries actor-bezogen serverseitig gespeichert werden sollen.
		- Wenn ja: definiere Capability, API, UI und Datenmodellnutzung.
		- Wenn nein: dokumentiere bewusst, dass `saved_queries` noch ungenutzt ist.
	- Acceptance:
		- Die Zielentscheidung ist dokumentiert.
		- Es gibt keinen impliziten Widerspruch mehr zwischen DB-Schema und Frontend-Verhalten.

- [ ] `ARCH-008` Suchmodell fuer Labels, Label-Unterbaeume und Categories dokumentieren
	- Ziel: Die Bedeutung von `label_paths`, `label_path_prefixes`, `category_keys` und UI-Filtern muss eindeutig sein.
	- Aufgabe:
		- Beschreibe die Suchsemantik mit Beispielen.
		- Gleiche API-Parameter, Frontend-Wording und Tests darauf ab.
	- Acceptance:
		- Die Suchsemantik ist in einem kurzen Dokument eindeutig beschrieben.
		- Tests fuer Exact Match und Prefix-/Subtree-Match existieren.

### Categories / Dateimodell

- [ ] `ARCH-009` Entscheiden, ob Categories flach oder hierarchisch sind
	- Ziel: Das Fachmodell soll dieselbe Sprache sprechen wie die UI.
	- Ist-Zustand: Das Datenmodell ist flach, Teile des Frontends behandeln Categories aber bereits wie Pfade/Hierarchien.
	- Aufgabe:
		- Entscheide, ob Categories echte Hierarchien bekommen oder strikt flache Schluessel bleiben.
		- Wenn flach: entferne implizite Hierarchie-Annahmen aus UI und Doku.
		- Wenn hierarchisch: definiere DB-, API- und UI-Anpassungen.
	- Acceptance:
		- Die Architekturentscheidung ist dokumentiert.
		- Datenmodell, API und UI folgen derselben Definition.

- [ ] `ARCH-010` File-Explorer auf serverseitige Filterung und skalierbares Laden umbauen
	- Ziel: Der File-Viewer soll nicht dauerhaft alle Detailobjekte clientseitig laden und filtern.
	- Ist-Zustand: Erst werden Summaries geladen, danach fuer alle Files die Detailobjekte.
	- Aufgabe:
		- Definiere einen Backend-Datenvertrag fuer gefilterte/paginierte File-Listen.
		- Passe Frontend und API darauf an.
		- Lege fest, welche Daten fuer Baum und Detailansicht wirklich sofort benoetigt werden.
	- Acceptance:
		- File-Filter laufen primaer serverseitig.
		- Der Explorer laedt nicht mehr pauschal alle Details.
		- Performance-Zielbild ist dokumentiert.

### Concurrency / Autosave

- [ ] `ARCH-011` Konfliktstrategie fuer gleichzeitige Bearbeitung definieren
	- Ziel: Die bereits robuste lokale Notes-Auswahl soll um ein echtes Concurrent-Edit-Modell ergaenzt werden.
	- Ist-Zustand: Schnellklick-/Autosave-Rennen innerhalb des Frontends sind adressiert, Multi-Client-Konflikte aber noch nicht.
	- Aufgabe:
		- Entscheide zwischen `last-write-wins`, Versionsnummern, optimistic locking oder einem anderen Verfahren.
		- Beschreibe die Auswirkungen auf API, Frontend und Fehlermeldungen.
	- Acceptance:
		- Es gibt ein dokumentiertes Konfliktmodell.
		- Mindestens ein echter Concurrent-Edit-Fall ist getestet.

### Tests / Verifikation

- [ ] `ARCH-012` Architektur- und Security-Risiken mit gezielten Tests absichern
	- Ziel: Die aus dem Review abgeleiteten Risiken sollen nicht nur dokumentiert, sondern verifizierbar abgesichert sein.
	- Aufgabe:
		- Ergaenze Tests fuer Auth/ACL.
		- Ergaenze Tests fuer XSS-Sanitization.
		- Ergaenze Tests fuer Label-Lifecycle-Entscheidung.
		- Ergaenze Tests fuer Search History / Saved Queries.
		- Ergaenze Tests fuer skalierbares File-Filtering soweit die Architektur umgesetzt wird.
	- Acceptance:
		- Zu jedem Review-Block gibt es mindestens einen passenden Test oder ein bewusst dokumentiertes Test-Gap.

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
