# Use Cases und Anwendungen

## Zweck dieser Datei

Diese Datei fasst die in den Chats besprochenen Anwendungsfaelle in einer umsetzbaren Form zusammen. Sie bildet den letzten Stand ab, nicht den Diskussionsverlauf.

## Rekonstruierter Endstand

Die inhaltliche Reihenfolge der Entwicklung war:

1. Dateibasierte Wissensbasis mit Markdown als gut lesbarem Inhalt.
2. SQLite nicht als Primaerspeicher des Inhalts, sondern als strukturierter Index und Beziehungs-Layer.
3. Generisches Kernmodell statt vieler Fachtabellen.
4. Konkrete private Use Cases: Notizen, Einkommensdokumente, Bankunterlagen, Kaufrecherche.
5. Multiuser ueber `principals`, Gruppen und ACL.
6. Planbare Objekte: `task`, `event`, Wiederholungen, Notifications.
7. Zeitreihen ueber `observation_series` und `observations`.
8. Agenten- und capability-orientierte Architektur ueber CLI, API und MCP.
9. Notes-first Produktplanung mit spaeteren Domains wie Assets, Finanzen und Messwerten.
10. Konsolidierung zu einem allgemeinen "Personal Data OS".

Quellenlage:

- `chat_00.md`: Ursprung von Modell, Use Cases und Datenbankidee
- `chat_01.md`: Anforderungen, Agenten-Architektur, Capability Layer
- `chat_02.md`: inhaltsgleich zu `chat_01.md`
- `chat_03.md`: spaetere Vertiefung zu MVP, API, Querying, Frontend- und Notes-App-Planung

## Die 3 Kernbereiche des Systems

| Bereich | Zweck | Typische Objekte |
|---|---|---|
| Wissen | Inhalte, Erkenntnisse, Entscheidungen | Notes, Research, Decision Notes, Dokumente |
| Handlung | Dinge, die geplant, erledigt oder ueberwacht werden muessen | Tasks, Events, Reviews, Erinnerungen |
| Zustand/Verlauf | Messwerte und Entwicklung ueber die Zeit | Gewicht, Schlaf, Kontostand, Zaehlerstaende |

## Priorisierte Use Cases

### 1. Wissensnotizen

Du speicherst Wissen, Gedanken, Erklaerungen und Lessons Learned als eigenstaendige Notes.

Typische Beispiele:

- MECE Prinzip
- GraphRAG Konzept
- Hochzeitsfotografie Lessons Learned
- technische Setups und Troubleshooting

Empfohlenes Modell:

- `item_kind = note`
- `category_key = reference | learning | process | decision`
- Hauptinhalt in `content_parts`
- optionale Labels fuer Themen und Kontexte

### 2. Strukturierte Recherche mit Entscheidung

Das wurde als besonders wichtiger Ziel-Use-Case herausgearbeitet, z. B. Waschmaschinen-Kaufentscheidung.

Bestandteile:

- Research Note
- Angebots-PDFs
- Screenshots/Bilder
- Vergleichstabelle
- finale Decision Note

Empfohlenes Modell:

| Bestandteil | Modell |
|---|---|
| Recherchetext | `note` mit `category_key = research` |
| Angebote | `document` mit `category_key = offer` |
| Bilder/Screenshots | `image` mit `category_key = product_reference` oder `screenshot` |
| Vergleich | `spreadsheet` mit `category_key = comparison_table` |
| finale Entscheidung | `note` mit `category_key = decision` |

Wichtige Verknuepfungen:

- Research -> Angebot
- Research -> Vergleich
- Research -> Bilder
- Decision -> Research
- spaeterer Review-Task -> Decision

### 3. Dokumentenmanagement privat

Der letzte Stand ist klar: Originaldateien bleiben erhalten, strukturierte Daten werden zusaetzlich erfasst.

#### Einkommensdokumente

- Original als PDF im Filesystem
- strukturiert erfasste Werte: `gross_amount`, `net_amount`, `payment_date`, `currency`
- nur fuer dich sichtbar, z. B. ACL auf `heiko`

#### Bankdokumente

- Kategorie `bank_statement`
- Werte wie `bank_name`, `statement_period_start`, `statement_period_end`, `account_reference`

#### Angebote, Vertraege, Versicherungen

- Angebote sind Teil von Recherchen und Entscheidungen
- Vertraege und Versicherungen koennen mit Review-Tasks und Fristen verknuepft werden

#### Behoerdenprozesse

- Dokumente, Notizen und Status gehoeren zusammen
- Beispiel: Antrag eingereicht, Rueckfrage erhalten, Antwort dokumentiert

### 4. Multiuser und Familie

Das Modell wurde spaeter klar in Richtung Familie erweitert.

Start-Principals:

- `heiko`
- `wife`
- `son`
- `pair`
- `family`
- `parents_of_son`

Wichtige Regel:

- Berechtigung ist nicht dasselbe wie fachliche Betroffenheit.

Beispiele:

| Fall | ACL | Subjects |
|---|---|---|
| Einkommensnachweis | `heiko` | `heiko` |
| gemeinsamer Haushaltskauf | `pair` | `pair` |
| Schulunterlagen / Arzttermine des Kindes | `parents_of_son` | `son` |

### 5. Aufgaben, Termine und Reviews

Dieser Bereich wurde spaeter als eigener Basisteil des Systems festgelegt.

Typische Stories:

- Stromzaehlerstand melden
- Kinderarzttermin
- Versicherung jaehrlich pruefen
- ETF-Strategie in 1 Jahr pruefen
- Waschmaschinenentscheidung nach 2 Jahren bewerten

Wichtige Modellregel:

- Wissen bleibt Wissen.
- Ein spaeterer Review wird als eigenes `task`-Item modelliert und per Link mit der Note oder Entscheidung verbunden.

### 6. Zeitreihen und Tracking

Das ist die groesste spaetere Erweiterung im Chat.

Beispiele:

- Gewicht
- Schlaf
- Puls
- Schritte
- Stromverbrauch
- Kontostand

Finale Modellentscheidung:

- keine taegliche Note pro Messpunkt
- keine grosse Markdown-Tabelle als Hauptspeicher
- stattdessen `observation_series` + `observations`
- optional eine begleitende Note fuer Analyse und Interpretation

### 7. Projekte und Themenraeume

In den spaeteren Chats wurde klarer, dass die App neben einzelnen Items auch Kontexte braucht, in denen Inhalte gebuendelt werden.

Typische Rollen:

- Projekt
- Thema
- Lebensbereich
- Vorgang
- Fall

Praktische Funktion:

- ein Projekt oder Kontext verbindet Notes, Dokumente, Bilder, Tasks und Events
- Inhalte koennen dadurch sowohl in Listen als auch in thematischen Raeumen gefunden werden

### 8. Notes-first KBase-App

Aus dem allgemeinen Modell wurde spaeter ein klares Produktbild fuer die erste App abgeleitet.

Der Startpunkt ist:

- eine starke Notiz-App
- Rich Text als Editor-Erlebnis
- Markdown als Speicherformat
- Metadaten, Labels, Kategorien, Assets und Links als First-Class Features

Wichtige Benutzerfaelle:

- Notiz erfassen und strukturieren
- bestehende Labels/Kategorien suchen und zuweisen
- fehlende Eintraege direkt im Modal anlegen
- Dateien, Bilder und andere Notizen verlinken
- spontan Datei-Upload oder Fotoaufnahme aus dem Notizkontext
- auf Desktop und Mobile bewusst unterschiedliche, fokussierte Ansichten

### 9. Agenten- und Automations-Use-Cases

Die spaeteren Chats machen klar: Das System soll nicht nur von Menschen genutzt, sondern von Agenten stabil gelesen und kontrolliert beschrieben werden koennen.

Wichtige Stories:

- Agent liest strukturierte Recherche-Kontexte statt roher Einzeldateien
- Agent erstellt Summaries oder Extraktionen mit klarer Provenance
- CLI, HTTP API und MCP greifen auf dieselbe Capability-Schicht zu
- Schreibzugriffe laufen kontrolliert ueber validierte Operationen statt direkt ueber Tabellen

## Konkrete Testfaelle fuer die erste Umsetzung

Diese Stories sind am besten geeignet, um das System end-to-end zu pruefen:

1. Eine Wissensnotiz mit Markdown-Inhalt, Labels und internen Links.
2. Eine Waschmaschinen-Recherche mit Angebot, Bild, Vergleich und Decision Note.
3. Ein Einkommens-PDF mit manuell gepflegten Metadaten.
4. Ein Bank Statement mit Zeitraum und Bankreferenz.
5. Ein Kinderarzttermin fuer `son` mit ACL auf `parents_of_son`.
6. Ein Review-Task, der auf eine Entscheidung verweist.
7. Eine Gewichtsserie mit mehreren Messpunkten und einer Analyse-Note.
8. Ein Projektkontext, in dem Note, Dokument und Termin zusammenhaengen.
9. Eine Notes-UI, in der Kategorie, Labels und Linked Resources aktiv genutzt werden.
10. Ein agentenfaehiger Read-Flow, der ein `research_bundle` oder `decision_context` liefert.

## Nicht Teil des Modells

Folgende Dinge wurden bewusst nicht als Kern des Datenmodells definiert:

- UI-Design
- Notification Engine zur echten Auslieferung
- Agentenlogik selbst

Das Datenmodell ist der strukturierte Speicher- und Beziehungs-Layer, auf dem spaeter Apps und Agenten aufsetzen.

Neuere Chats ergaenzen aber: Ueber dem Datenmodell wird ein Capability Layer benoetigt, damit API, CLI, MCP und Web-App dieselben konsistenten Operationen verwenden.
