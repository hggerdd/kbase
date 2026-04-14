# Technologie, Datenmodell und Struktur

## Zielbild

Das System ist ein generisches privates Wissens- und Datenmodell fuer Inhalte, Dokumente, Aufgaben, Termine und Zeitreihen. Es soll bewusst nicht aus vielen Fachmodellen bestehen, sondern aus einem stabilen Kern plus einigen wenigen generischen Erweiterungen.

## Finale Architekturentscheidungen

| Thema | Entscheidung |
|---|---|
| Primaerspeicher fuer Wissensinhalte | Markdown-Dateien und andere Originaldateien im Filesystem |
| Strukturierte Abfragen, Beziehungen, Suche | SQLite |
| Dateitypen | technisch ueber `item_kind`, fachlich ueber `category_key` |
| IDs | ULID |
| Multiuser | `principals`, Gruppen, Memberships, ACL |
| Wiederkehrende Dinge | eigene Zeit- und Workflow-Tabellen |
| Zeitreihen | `observation_series` und `observations` |
| Agenten-Zugriff | ueber Capability Layer, nicht ueber freie Tabellennutzung |

## Modellierungsprinzipien

Damit das Modell langfristig konsistent bleibt und fuer Agenten robust nutzbar ist, gelten zusaetzlich diese Regeln:

| Prinzip | Bedeutung |
|---|---|
| Ein Sachverhalt hat einen primaeren Modelltyp | gleiche Dinge werden immer gleich modelliert |
| `item_kind` beschreibt Technik/Verhalten | z. B. `note`, `document`, `task`, `event` |
| `category_key` beschreibt fachliche Einordnung | z. B. `research`, `offer`, `bank_statement` |
| Labels dienen nur Quer-Navigation | keine Berechtigungen, keine Primaerklassifikation |
| Metadaten ergaenzen den Kern | sie ersetzen keine fehlende Modellentscheidung |
| Abgeleitete Daten muessen als solche kenntlich sein | OCR, Summary, LLM-Felder, Inferenz nie mit Original verwechseln |
| Operative Zeitlogik gehoert nicht in freie Metadaten | dafuer `datetime_properties`, `item_states`, `recurrence_rules`, `notifications` |
| Eine Quelle bleibt erhalten | Originaldateien nie durch Extrakte oder Zusammenfassungen ersetzen |
| Schnittstellen arbeiten capability-basiert | UI, CLI, API und MCP sollen dieselben Fachoperationen nutzen |

Diese Regeln sind normativ im separaten Handbook beschrieben:

- [04_modelling_handbook.md](/c:/ttt/kbase/02_ideas/04_modelling_handbook.md)

## Kernobjekte

### `items` als Zentrum

`items` ist das zentrale Objekt fuer:

- Notes
- Dokumente
- Bilder
- Tabellen
- Tasks
- Events
- Projekte oder Kontextobjekte

Die Kernidee ist: Das meiste ist ein Item. Bedeutung und Verhalten kommen ueber Typ, Kategorie, Links, Metadaten und Zusatz-Tabellen.

### Modellgrenzen

`items` ist der Kern fuer inhaltliche und operative Objekte, aber nicht fuer alles.

Nicht in `items` als Primaermodell gehoeren:

- einzelne Messpunkte von Zeitreihen
- abgeleitete Suchindizes
- Embeddings
- Scheduler-Ausfuehrungen fuer Notifications

Diese Trennung ist wichtig, damit das Modell auch bei Agentennutzung klar und stabil bleibt.

### Technische Typen

Empfohlene `item_kinds`:

| Key |
|---|
| `note` |
| `document` |
| `image` |
| `spreadsheet` |
| `summary` |
| `task` |
| `event` |
| `project` |

### Inhalt und Dateien

| Tabelle | Zweck |
|---|---|
| `content_parts` | Markdown, OCR-Text, Chunks, Summaries |
| `item_files` | echte Dateien im Filesystem mit Rolle und Metadaten |
| `item_links` | Beziehungen zwischen Items |

## Fachliche Kategorien

Die spaet konsolidierten Kategorien sind klein und generisch genug, um breit nutzbar zu bleiben.

Regel:

- genau ein `item_kind`
- genau eine primaere `category_key`, wenn fachliche Klassifikation noetig ist
- beliebig viele Labels
- optional zusaetzliche strukturierte Klassifikationen ueber ein spaeteres Mehrfachklassifikationsmodell

Wenn ein Objekt mehrere fachliche Rollen hat, wird die primaere Rolle als `category_key` modelliert. Weitere Sichtweisen gehen in Links, Labels oder in eine spaetere sekundäre Klassifikation.

### Fuer Notes

- `research`
- `decision`
- `learning`
- `reference`
- `process`
- `comparison_note`

### Fuer Dokumente

- `income_document`
- `invoice`
- `offer`
- `bank_statement`
- `insurance_document`
- `school_document`
- `medical_document`
- `product_document`
- `contract_document`

### Fuer Bilder

- `scan`
- `screenshot`
- `photo`
- `product_reference`

### Fuer Tabellen

- `comparison_table`
- `data_table`

### Fuer Tasks

- `task_general`
- `review_task`
- `household_task`
- `admin_task`

### Fuer Events

- `appointment`
- `deadline_event`
- `family_event`
- `school_event`

### Fuer Projekte und Kontexte

- `project_general`
- `case_context`
- `topic_space`
- `life_area`

## Metadatenprinzip

Die finale Richtung ist:

- stabiler Kern fuer haeufige Strukturen
- flexible Metadaten fuer fachliche Unterschiede
- keine neue Tabelle fuer jede neue Domane

Zusaetzliche Modellregel:

- Metadaten duerfen nur fuer Felder verwendet werden, die semantisch zum `item_kind` und zur `category_key` passen.
- Pflichtfelder und empfohlene Felder sollen je Profil definiert werden.
- Freie Ad-hoc-Felder ohne Profil sollten Ausnahme bleiben.

### Empfohlene Metadatengruppen

| Gruppe | Zweck |
|---|---|
| `general` | allgemeine Dokument- und Item-Angaben |
| `classification` | Einordnung und Status |
| `document_details` | Dokumentdetails |
| `review` | Review-relevante Felder |
| `research` | Recherche- und Entscheidungsfelder |
| `finance_income` | Einkommensnachweise |
| `finance_bank_statement` | Kontoauszuege |
| `offers` | Angebotsdokumente |
| `task_details` | Zusatzinfos zu Aufgaben |
| `event_details` | Zusatzinfos zu Terminen |

### Wichtige Feld-Keys

| Bereich | Wichtige Felder |
|---|---|
| Allgemein | `document_date`, `issuer`, `recipient`, `is_scanned`, `ocr_status`, `summary_status`, `reviewed_by_user`, `language_override` |
| Research | `research_subject`, `decision_stage`, `budget_max`, `selected_option`, `comparison_exists` |
| Finance | `gross_amount`, `net_amount`, `currency`, `payment_date`, `period_start`, `period_end`, `bank_name`, `account_reference`, `statement_period_start`, `statement_period_end`, `vendor`, `offer_number`, `valid_until`, `total_amount` |
| Task/Event | `priority`, `estimated_effort_minutes`, `is_blocked`, `blocking_note`, `all_day`, `location`, `attendee_notes` |

Wichtige Ausnahme:

`due_at`, `start_at` und `end_at` gehoeren nicht in `item_metadata`, sondern in `datetime_properties`.

Fuer agententaugliche Konsistenz sollte spaeter pro Kategorie ein kleines Profil existieren:

- erlaubte Felder
- empfohlene Felder
- Pflichtfelder
- validierte Datentypen

Diese Profile sind im Handbook als maschinenlesbare Daten vorbereitet.

Spaetere Modellverbesserung aus `chat_03.md`:

- die aktuelle Klassifikation ist fuer den Endausbau wahrscheinlich zu eng
- empfohlen ist eine Kombination aus primaerer Kategorie plus optionalen weiteren strukturierten Klassifikationen

## Beziehungen und Labels

### Link-Typen

Die finalen Linktypen fuer den Start:

- `related`
- `references`
- `attachment`
- `summary_of`
- `source_of`
- `includes`
- `decision_for`
- `review_for`
- `duplicate_of`
- `derived_from`

### Labels

Labels sind hierarchisch und dienen Navigation und Filterung, nicht Berechtigung.

Beispiele:

- `finance/income`
- `finance/banking`
- `household/appliances`
- `health/weight`

Klare Trennung:

| Mechanismus | Zweck |
|---|---|
| `category_key` | primaere fachliche Einordnung |
| Labels | zusaetzliche Blickwinkel, Themen, Filter |
| Links | explizite Beziehung zu anderen Objekten |
| optionale Sekundaerklassifikation | spaetere strukturierte Zusatzsicht ohne Missbrauch der Labels |

## Multiuser-Modell

### Prinzip

Es gibt Personen, Gruppen und optional Services als `principals`.

Beispielhafte Startmenge:

| Principal | Typ |
|---|---|
| `heiko` | person |
| `wife` | person |
| `son` | person |
| `pair` | group |
| `family` | group |
| `parents_of_son` | group |

### Memberships

- `heiko` in `pair`
- `wife` in `pair`
- `heiko` in `family`
- `wife` in `family`
- `son` in `family`
- `heiko` in `parents_of_son`
- `wife` in `parents_of_son`

### Trennung der Rollen

| Frage | Tabelle/Mechanismus |
|---|---|
| Wer hat es erstellt? | `created_by_principal_id` |
| Wer darf es sehen oder bearbeiten? | `item_acl` |
| Wen betrifft der Inhalt fachlich? | `item_subjects` |

Fuer den MVP wurde spaeter festgehalten:

- das volle ACL-Modell passt gut zum Endausbau
- fuer die erste Version darf die Benutzer- und Rechteebene einfacher starten, solange die Datenstruktur spaeter erweiterbar bleibt

## Planbare Objekte

Tasks und Events wurden nicht als reine Metadaten behandelt, sondern als echte Basiskomponenten.

### Zusatz-Tabellen

| Tabelle | Zweck |
|---|---|
| `workflow_states` | erlaubte Stati je Workflow-Typ |
| `item_states` | aktueller Zustand eines Tasks oder Events |
| `datetime_properties` | strukturierte Zeitpunkte wie `due_at`, `start_at`, `end_at` |
| `recurrence_rules` | Wiederholungsregeln |
| `notifications` | Benachrichtigungsregeln |
| `item_occurrences` | konkrete Instanzen wiederkehrender Objekte |

### Warum nicht nur EAV-Metadaten?

Weil sonst typische operative Abfragen unnoetig kompliziert werden:

- offene Tasks bis naechste Woche
- Events morgen
- kommende Review-Termine
- Notifications in den naechsten 30 Minuten

Modellregel:

- Wissen bleibt Wissen.
- Ein spaeterer Handlungsbedarf wird als eigenes `task`- oder `event`-Item modelliert.
- Reviews werden nicht als Status einer Note modelliert, sondern als verknuepfte planbare Objekte.

## Projekte und Kontexte

In spaeteren Chats wurde klarer, dass Projekte und Kontexte eigene First-Class Objekte oder zumindest explizite Aggregationsstrukturen sein sollten.

Ihre Aufgabe:

- Inhalte thematisch oder operativ buendeln
- eigene Metadaten tragen
- Status und Zeitbezug haben
- als Navigations- und Filteranker dienen

Fuer den Start reicht ein einfaches Projekt-/Kontextmodell. Langfristig sollte es ueber klare Memberships oder Links an `items` angebunden sein.

## Zeitreihen

### Finale Entscheidung

Zeitreihen sind eine eigene Basisschicht und nicht nur ein Sonderfall von Notes.

Modellregel:

- eine Serie repraesentiert das beobachtete Thema
- einzelne Werte sind nur `observations`
- eine Analyse oder Interpretation kann zusaetzlich als `note` existieren

### Modell

| Tabelle | Zweck |
|---|---|
| `metric_definitions` | Katalog von Metriken wie `weight` oder `steps` |
| `observation_series` | eine Serie fuer ein Subjekt und eine Metrik |
| `observations` | einzelne Messpunkte |

### Beispiele

- Gewicht
- Blutdruck
- Puls
- Schlafdauer
- Schritte
- Stromverbrauch
- Wasserzaehlerstand
- Kontostand

Spaetere Architekturbeobachtung:

- das Observation-Modell ist fachlich richtig
- es sollte aber systematisch an Audit, Suche, ACL und agentische Retrieval-Sichten angebunden werden, damit es kein Sonderbereich ausserhalb des Kerns bleibt

## Audit, Provenance und Versionierung

Die spaeteren Chats erweitern den bisherigen Stand um drei wichtige Punkte:

| Bereich | Bedeutung |
|---|---|
| Audit | nachvollziehen, wer was wann geaendert hat |
| Provenance | Herkunft von Inhalten, Extrakten und generierten Daten |
| Versionierung | fruehere Staende von Content Parts wiederherstellen und vergleichen |

Fuer den Endausbau sollten deshalb zusaetzlich vorgesehen werden:

- Audit-Tabellen oder Event-Log
- Provenance-Strukturen fuer Quellen und Ableitungen
- Versionierung fuer `content_parts`

## Asset-Modell

Die fruehere Darstellung mit `item_files` ist fuer den Start brauchbar, spaeter aber voraussichtlich zu grob.

Spaetere Empfehlung aus `chat_03.md`:

- Asset als eigenstaendiges technisches Objekt staerker vom inhaltlichen Item trennen
- Quelle, Anhang, Preview, Derivat und OCR-Ergebnis deutlicher unterscheiden
- Bildverarbeitung, OCR und Derivate mit klarer Provenance modellieren

## Dateisystem und Ordnerstruktur

Die letzte konsolidierte Struktur:

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

### Bedeutung der Bereiche

| Ordner | Rolle |
|---|---|
| `inbox/raw` | neue, noch nicht verarbeitete Eingaben |
| `inbox/processing` | gerade bearbeitete Eingaben |
| `inbox/rejected` | bewusst verworfene Eingaben |
| `workspaces/projects` | temporaere Arbeitsordner fuer laufende Themen |
| `workspaces/reviews` | Review-Arbeitsbereiche |
| `items/*` | dauerhafter Bestand |
| `db` | SQLite-Datenbank |
| `exports` | Exporte |
| `logs` | technische Logs |

Wichtige Zusatzregel fuer Agenten und Tools:

- `items/` enthaelt kanonische Bestandsdaten
- `workspaces/` ist nicht automatisch kanonisch
- Inhalte aus `workspaces/` duerfen nur nach expliziter Uebernahme in `items/` als dauerhaft gelten
- `inbox/` ist Eingang, nicht Wissen

## Interface-Architektur

Die spaeteren Chats haben den Zugriff auf das Modell genauer festgelegt:

| Schicht | Rolle |
|---|---|
| Domain Core | fachliche Regeln und Modelle |
| Capability Layer | fachliche Operationen fuer Lesen und Schreiben |
| Interface Adapter | HTTP API, CLI, MCP, Web-App |
| Persistence Layer | SQLite und spaeter Suchindex / Asset Storage |

Wichtige Regel:

- Keine UI, kein Agent und keine Automation soll direkt auf Tabellenlogik angewiesen sein.
- Alle greifen ueber dieselben Capabilities zu.

### Dateinamensschema

```text
<prefix>_<ulid>_<slug>.<ext>
```

Beispiele:

- `note_01HT..._washing_machine_research.md`
- `doc_01HT..._bosch_offer.pdf`
- `img_01HT..._energy_label.jpg`

### Bucket-Regel

Empfohlen:

```text
bucket = ulid[10:12].lower()
```

Beispiel:

```text
kb/items/documents/m1/doc_<ulid>_bosch_offer.pdf
```

## Kurzfazit

Der letzte Stand ist ein tragfaehiges Gesamtmodell fuer:

- Notizen, Wissen und Entscheidungen
- PDFs, Bilder, Scans und Tabellen
- flexible Metadaten
- Multiuser und ACL
- Aufgaben, Termine, Wiederholungen und Notifications
- Zeitreihen wie Gewicht, Schlaf und Kontostaende
- agentenfaehige Operationen ueber einen Capability Layer
- eine spaeter ausbaubare Notes-first App mit Projekten, Assets und Domains

Das Modell ist damit generisch genug fuer Wachstum, aber konkret genug fuer eine erste echte Implementierung.

Die entscheidende naechste Stufe ist nicht nur SQL, sondern eine konsistente Modellierungsdisziplin. Erst dadurch wird das System fuer Copilot, Codex, Claude oder andere Agents wirklich verlaesslich nutzbar.
