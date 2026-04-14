


Ich hatte heute eine Diskussion dazu ob man Informationen die eine persönliche knowledge base als markdown oder als Datenbank abbildet. Llms verstehen md. Aber mit der Datenbank kann mit einem MCP Server auch die DB zugänglich gemacht werden. Vorteil DB, man leicht Metadaten zu Informationen ablegen. Wie sollte ich daran gehen? Was ist für eine persönliche knowledge base sinnvoll?

Für eine persönliche Knowledge Base ist die Frage Markdown oder Datenbank meistens falsch gestellt.

Die sinnvollere Antwort ist fast immer:

Markdown für den Inhalt, Datenbank für den Index und die Metadaten.

Warum das stark ist:

Markdown ist hervorragend für menschlich lesbaren, langlebigen Inhalt.

Datenbank ist hervorragend für Struktur, Beziehungen, Filter, Status, Zeitbezug, Versionen, Embeddings, Tags, Provenance und schnelle Queries.

LLMs können Markdown direkt gut lesen, aber sie profitieren zusätzlich stark von sauberer Struktur aus einer DB.

Die Kernentscheidung
Du musst zuerst unterscheiden zwischen 3 Dingen:

Originalinhalt

Notizen

Zusammenfassungen

Gedanken

Protokolle

Dokumentextrakte

Struktur und Metadaten

Quelle

Erstellungsdatum

Aktualisiert am

Themen

Relevanz

Status

Beziehungen

Dokumenttyp

Vertrauensniveau

Abfrage- und KI-Schicht

Volltextsuche

semantische Suche

Graph-/Beziehungsabfragen

Agent/MCP/Tool-Zugriff

Diese 3 Dinge sollten nicht zwanghaft in einem Format landen.

Wann Markdown sinnvoll ist
Markdown ist sehr gut, wenn:

du Inhalte selbst schreibst und lesen willst

Portabilität wichtig ist

Git, Diff, Backup, Sync wichtig sind

die Daten langfristig unabhängig von Tools bleiben sollen

du LLMs direkt mit lesbarem Kontext füttern willst

du manuell editieren können willst, ohne UI oder Spezialtool

Für eine persönliche KB ist das ein sehr großer Vorteil.

Vorteile von Markdown
zukunftssicher

leicht exportierbar

leicht versionierbar

sehr gute LLM-Kompatibilität

einfach mit Editor, Git, Skripten, Obsidian, VS Code nutzbar

robust gegen Tool-Wechsel

Nachteile von Markdown
schwach bei komplexen Relationen

Metadaten werden schnell unübersichtlich

Queries wie „zeige mir alle Notizen mit Thema X, hoher Priorität, Quelle Y, geändert in den letzten 30 Tagen“ sind mühsam

wenn du viele kleine strukturierte Entitäten hast, wird es hässlich

Konsistenz von Frontmatter/Tags leidet oft mit der Zeit

Wann eine Datenbank sinnvoll ist
Eine DB ist gut, wenn du stark strukturierte Dinge hast:

Aufgaben

Kontakte

Bücher

Projekte

Behördenvorgänge

Rechnungen

Assets

Fristen

Personen

Entitäten und Beziehungen

Dokumentchunks, Embeddings, Referenzen

Vorteile der DB
saubere Metadaten

starke Filterbarkeit

Relationen und Verknüpfungen

schnelle Suche

gute Basis für MCP/Tools/Agenten

leichter für Dashboards, Automationen, Regeln

Nachteile der DB
Inhalte sind oft schlechter direkt lesbar

mehr Lock-in-Risiko

manuelle Pflege ist nerviger

Export und Toolwechsel sind oft schlechter

viele persönliche KBs sterben an zu viel Struktur

Das ist der entscheidende Punkt:

Menschen pflegen ungern hochstrukturierte persönliche Datenbanken.
Was theoretisch elegant ist, scheitert praktisch oft an Reibung.

Die eigentliche Empfehlung
Für eine persönliche KB würde ich nicht DB gegen Markdown entscheiden, sondern ein hybrides Modell bauen.

Empfohlene Architektur
1. Markdown als Source of Truth für Wissensinhalte
Nutze Markdown für:

Notizen

Journals

Meeting-/Gesprächsnotizen

Zusammenfassungen

Learnings

Ideen

Referenzseiten

Projektwissen

Wissensartikel

Jede Note bleibt lesbar und unabhängig.

2. Frontmatter nur für wenige, stabile Metadaten
Nicht alles ins YAML kippen. Nur das Nötigste:

---
id: note-2026-04-07-001
title: Persönliche Knowledge Base Architektur
type: concept
created: 2026-04-07
updated: 2026-04-07
tags: [pkm, llm, architecture]
status: evergreen
source_type: self
---
Mehr würde ich am Anfang nicht machen.

3. Datenbank als abgeleiteter Index
Die DB speichert nicht primär den menschlichen Text als einziges Original, sondern abgeleitete Strukturen:

Dateipfad

Note-ID

Titel

Tags

Typ

Änderungsdatum

Chunks

Embeddings

Entitäten

Links zwischen Notes

Aufgabenreferenzen

Quellenbeziehungen

Qualitäts-/Reviewstatus

Also eher:

Markdown = Content Layer
DB = Retrieval & Structure Layer

4. MCP-Server auf die DB und optional auf Files
Dann kann dein MCP-Server beides anbieten:

search_notes

get_note_by_id

find_related_notes

list_notes_by_tag

search_semantic

get_open_tasks_for_project

find_documents_about_topic

get_note_markdown

So hat das LLM strukturierte Zugriffe, ohne dass du deinen eigentlichen Wissensbestand in ein unhandliches reines DB-System pressen musst.

Was viele falsch machen
Fehler 1: Alles in Markdown
Dann endet man bei:

unklaren Metadaten

chaotischen Tags

schwacher Querybarkeit

schwerer Automatisierung

Fehler 2: Alles in eine DB
Dann endet man bei:

hoher Pflegehürde

schlechter Lesbarkeit

geringerer Portabilität

Abhängigkeit von einem Tool/UI

mehr Modellierungsaufwand als echter Nutzen

Fehler 3: Zu frühe Ontologie
Viele bauen sofort Kategorien, Typen, Relationen, Tabellen, Graphen.
Für privat ist das oft Overengineering.

Starte einfacher:

wenige Notetypen

wenige Metadaten

gute Suchbarkeit

gute Verlinkung

saubere Ablage

Was für eine persönliche KB wirklich sinnvoll ist
Für das Privatleben brauchst du meist zwei Wissensformen:

A. Freies Wissen
Beispiele:

Gedanken

Erkenntnisse

Zusammenfassungen

Erlebnisse

Erklärungen

Recherchen

Dafür ist Markdown ideal.

B. Operatives Wissen
Beispiele:

Fristen

Verträge

Versicherungen

Kontakte

Projekte

Käufe

Dokumente

Aufgaben

Haushaltsplanung

Gesundheits-/Behördenthemen

Geräteinventar

Dafür ist eine strukturierte Datenbank oft besser.

Deshalb ist ein persönliches System meist am besten als:

Markdown-Wissensbasis

plus strukturierte Register/Tabellen

plus gemeinsamer Suchindex

Praktischer Minimalansatz
Wenn du heute anfangen willst, würde ich so starten:

Ebene 1: Filesystem + Markdown
Ordner z. B.:

inbox/

areas/

projects/

resources/

archive/

documents/

Ebene 2: SQLite oder Postgres als Index
Tabellen grob:

notes

note_chunks

entities

relationships

documents

tasks

sources

tags

embeddings

SQLite reicht für privat fast immer.

Ebene 3: Ingestion
Ein kleiner Prozess:

liest Markdown-Dateien

extrahiert Frontmatter

chunked Text

erzeugt Embeddings

schreibt Metadaten und Chunks in DB

erkennt Links [[...]] oder normale Referenzen

Ebene 4: Retrieval
Für LLMs:

erst Filter über Metadaten

dann Volltext/BM25

dann Vektor-Suche

dann Rückgabe als Markdown-Snippets mit Quelle

Das ist deutlich besser als nur „ganze Markdown-Dateien ins Modell kippen“.

Meine klare Empfehlung
Für deine persönliche KB:

Nicht “Markdown oder DB”, sondern “Markdown zuerst, DB dahinter”.

Konkret:
Markdown für alles, was du lesen, schreiben, exportieren und langfristig behalten willst

SQLite/Postgres für Metadaten, Beziehungen, Suche, Embeddings, Automationen, MCP-Zugriff

MCP als Zugriffsschicht auf den Index und auf Originaldokumente

kein reines DB-only-System als Startpunkt

kein Markdown-only-System, wenn du LLM- und Query-Fähigkeit ernst meinst

Faustregel
Nutze Markdown, wenn der primäre Akteur ein Mensch ist.
Nutze eine DB, wenn der primäre Akteur eine Maschine/Abfrage/Automation ist.

Eine gute persönliche KB braucht beides.

Wenn du es auf einen Satz reduzieren willst
Baue deine persönliche Knowledge Base als file-based Markdown-System mit einer abgeleiteten SQLite- oder Postgres-Indexdatenbank für Metadaten, Suche, Relationen und LLM/MCP-Zugriff.

Im nächsten Schritt kann ich dir dafür eine konkrete Zielarchitektur skizzieren, z. B. als:

sehr einfaches Privat-Setup

lokales Power-User-Setup mit SQLite

fortgeschrittenes Setup mit Postgres, pgvector und MCP Server.


Um besser die Ideen zu verstehen, Gib mir ein paar Ideen, was in so eine KB hinein kommt und sinnvoll ist (privat)

Ich gebe dir keine generische Liste, sondern eine strukturierte, praxisnahe Sicht auf echte Inhalte, die in einer privaten Knowledge Base langfristig Mehrwert bringen.

Ziel:
Nicht “alles speichern”, sondern entscheidungsrelevantes, wiederverwendbares Wissen.

1. Lebensbereiche als Top-Level-Struktur
Eine sinnvolle KB orientiert sich nicht an Tools, sondern an deinem Leben:

🧠 Denken & Lernen
Erkenntnisse aus Büchern, Podcasts, Artikeln

Eigene mentale Modelle (z. B. Entscheidungsstrategien)

Zusammenfassungen komplexer Themen (Steuern, ETF, Gesundheit)

Dinge, die du “einmal verstanden hast und nicht wieder neu lernen willst”

👉 Beispiel:

„Wie funktioniert französisches Steuersystem für Grenzgänger“

„Unterschied MSCI World vs ACWI vs EM“

💰 Finanzen & Verträge
Versicherungen (was habe ich, warum, Bedingungen)

Kredite / Immobilien

ETF-Strategie + Begründung (!! wichtig)

Steuerlogik (nicht nur Zahlen, sondern Verständnis)

wichtige Entscheidungen + rationale Begründung

👉 Beispiel:

„Warum ich PEA + MSCI World + EM gewählt habe“

„Vergleich assurance vie Anbieter“

🏠 Haushalt & Organisation
Geräte + Wartung (Filterwechsel, Ersatzteile etc.)

Kaufentscheidungen + Bewertung (war es gut?)

Wiederkehrende Aufgaben (nicht als ToDo, sondern als Wissen)

👉 Beispiel:

„Staubsauger Roboter – Probleme und Lösungen“

„Reifenwahl Auto – Erfahrung Norauto vs Premium“

👨‍👩‍👧 Familie & Kinder
Erziehungsansätze, die funktionieren / nicht funktionieren

wichtige Ereignisse, Entwicklung

Lösungen für typische Konflikte

medizinische Infos (nicht sensibel speichern, aber Struktur)

👉 Beispiel:

„Was hilft bei Wutausbrüchen (4–5 Jahre)“

„Schlafroutine Baby – was funktioniert hat“

🧾 Behörden & Prozesse
Das ist extrem wertvoll und wird oft unterschätzt.

Schritt-für-Schritt Guides für Dinge, die du einmal gelernt hast

Dokumentenlogik (wo liegt was, warum)

Erfahrungswissen (!!)

👉 Beispiel:

„Kindergeld Frankreich beantragen – Ablauf“

„Grenzgänger Steuer – was wirklich relevant ist“

🧠 Projekte & Ideen
Ideen (nicht nur sammeln → strukturieren)

Projektentscheidungen

Lessons Learned

👉 Beispiel:

„Balancing Robot – Designentscheidungen“

„Multi-Agent-System Architektur Ideen“

💻 Tech / Tools / Setup
Setup-Dokumentation (extrem wertvoll)

bekannte Probleme + Fixes

Entscheidungen (warum dieses Tool)

👉 Beispiel:

„uv + Python Setup – Best Practices“

„LM Studio + OpenAI API Setup lokal“

📚 Referenzwissen (persönlich kuratiert)
Dinge, die du immer wieder brauchst

Cheatsheets

eigene Erklärungen

👉 Beispiel:

„MECE Prinzip einfach erklärt“

„FOC vs DTC Motorsteuerung“

2. Was wirklich wertvoll ist (die meisten machen das falsch)
Nicht alles ist gleich wichtig.

🔥 High-Value Inhalte
Das solltest du gezielt speichern:

1. Entscheidungen + Begründung
Warum du etwas entschieden hast.

Das ist Gold wert, weil du später nicht mehr weißt, warum.

2. Lessons Learned
Was hat funktioniert / nicht funktioniert

3. Prozesse (How-To)
Alles, was du nicht nochmal neu lernen willst

4. Verdichtetes Wissen
Nicht Rohdaten, sondern:

Zusammenfassungen

Modelle

eigene Erklärung

5. Verknüpfungen
Dieses Thema hängt mit jenem zusammen

Kontext ist entscheidend

❌ Low-Value Inhalte
Das solltest du nicht einfach dumpen:

zufällige Notizen ohne Struktur

kopierte Artikel ohne Verarbeitung

ToDo-Listen ohne Kontext

reine Linksammlungen

Daten ohne Interpretation

3. Konkrete Beispiele (so sieht guter Inhalt aus)
Beispiel 1 – Entscheidung
# ETF Strategie

## Entscheidung
PEA mit MSCI World + Emerging Markets Ergänzung

## Begründung
- Steuerlich optimal in Frankreich (PEA)
- MSCI World deckt Industrieländer gut ab
- EM als Ergänzung für Wachstum

## Alternativen
- ACWI → zu viel Überschneidung
- All-in-one ETF → weniger Kontrolle

## Risiken
- EM Volatilität
- Währungsrisiken

## Review
Nächste Überprüfung: 2027
👉 Das ist extrem wertvoll später.

Beispiel 2 – Prozess
# Kindergeld Frankreich beantragen

## Schritte
1. CAF Account erstellen
2. Dokumente hochladen:
   - Geburtsurkunde
   - Steuerbescheid
3. Bearbeitung dauert ca. 4–8 Wochen

## Probleme
- Dokumente müssen übersetzt sein
- Rückfragen kommen oft per Post

## Tipp
Direkt alle Dokumente vollständig einreichen → spart Wochen
Beispiel 3 – Learnings
# Hochzeitsfotografie – Lessons Learned

## Was gut funktioniert hat
- Natürliches Licht statt Blitz
- Kinder aktiv einbinden

## Fehler
- Zu wenig Gruppenfotos geplant
- Zeitdruck unterschätzt

## Verbesserung
- Shotlist vorher definieren
- Zeitpuffer einbauen
4. Verbindung zur Architektur (Markdown + DB)
Jetzt wird klar, warum Hybrid sinnvoll ist:

Markdown enthält:
Inhalte oben (Erklärungen, Prozesse, Entscheidungen)

Datenbank enthält:
Tags (finance, family, tech)

Typ (decision, process, learning)

Datum

Verknüpfungen

Embeddings

5. Minimal sinnvolle Kategorien (nicht overengineeren)
Wenn du startest, reichen diese Typen:

decision

process

note

learning

reference

project

Mehr brauchst du am Anfang nicht.

6. Der wichtigste Punkt überhaupt
Eine gute persönliche KB ist kein Archiv.

Sie ist ein:

👉 System zur Verbesserung deiner Entscheidungen und deines Denkens

Wenn etwas das nicht unterstützt → nicht speichern.

7. Kompakte Zusammenfassung
Eine sinnvolle private KB enthält:

Entscheidungen + Begründung

Prozesse, die du wiederholen musst

verdichtetes Wissen

persönliche Learnings

strukturierte Lebensbereiche

Verknüpfungen zwischen Themen

Nicht enthalten:

ungefilterte Infos

reine Datensammlungen

Copy-Paste Wissen ohne Verarbeitung

Nächster sinnvoller Schritt
Ich kann dir jetzt helfen, das konkret aufzusetzen:

konkrete Ordnerstruktur + Naming

Markdown Templates (decision, process, etc.)

SQLite Schema für deinen Index

einfacher Ingestion-Prozess

MCP Tool-Design

Frage 1 (wichtig für den nächsten Schritt)
Was ist dein primäres Ziel mit der KB?

a) Besser denken & Entscheidungen dokumentieren
b) Organisation des Privatlebens (Dokumente, Prozesse, Überblick)
c) LLM-/AI-System darauf aufbauen (RAG, Agenten, Automatisierung)
d) Mischung aus allem, aber mit Fokus auf Effizienz


Wie baue ich das praktisch auf? Soll ich eine einfache App bauen und dann z.b. einen markdown Editor mit der möglichkeit vorgegebene Metadaten und Bilder zu Speicher (am Anfang SQLite). Wie kann ich das mit einem Agent koppeln, der die Daten sinnvoll auswertet. Geht dass dann mit GitHub Copilot in vs Code?


Nachgedacht für 10s
Ja, das geht. Und der sinnvolle Weg ist nicht erst eine “große PKM-App” zu bauen, sondern ein kleines lokales System mit klaren Schichten.

Meine klare Empfehlung:

Phase 1: file-based Markdown + SQLite + lokaler Indexer
Phase 2: MCP-Server davor
Phase 3: Agent/Copilot darauf zugreifen lassen

So vermeidest du, dass du monatelang ein UI baust, bevor überhaupt klar ist, welche Datenstruktur und welche Workflows wirklich taugen.

Die praktisch sinnvolle Architektur
1. Source of truth: Markdown-Dateien
Speichere den eigentlichen Wissensinhalt als .md Dateien.

Warum:

lesbar

leicht editierbar

git-fähig

LLM-freundlich

tool-unabhängig

Beispiel:

---
id: 2026-04-07-etf-strategy
title: ETF Strategie PEA
type: decision
tags: [finance, investing, pea]
created: 2026-04-07
updated: 2026-04-07
status: active
---

# Entscheidung

Ich nutze im PEA ...
2. SQLite als strukturierter Index
SQLite hält nicht primär die Wahrheit des Inhalts, sondern:

Dateipfad

Frontmatter

extrahierte Tags

Chunks

Embeddings

Verknüpfungen

Bilder/Attachments

Entities

eventuell Tasks / Fristen / Quellen

Das ist für privat genau richtig: wenig Overhead, lokal, robust.

3. Attachments-Ordner für Bilder und Dokumente
Nicht Bilder in SQLite-BLOBs stopfen.
Speichere Dateien im Filesystem, und in SQLite nur:

Referenzpfad

Typ

Metadaten

Hash

Bezug zur Note

Beispiel:

kb/notes/...

kb/assets/images/...

kb/assets/docs/...

4. Kleiner lokaler Service
Baue eine kleine App, aber nicht zuerst als schwere Full-App.

Sinnvoller Start:

FastAPI Backend

einfacher Web-Editor oder Markdown-Editor-Komponente

SQLite

Hintergrundprozess für Indexing

So kannst du Schritt für Schritt wachsen.

Was du zuerst bauen solltest
Nicht alles gleichzeitig.

Minimaler MVP
A. Note erstellen/bearbeiten
Markdown-Text

definierte Metadaten-Felder

Bilder anhängen

interne Links zu anderen Notes

B. Indexer
Beim Speichern:

Frontmatter parsen

Chunks erzeugen

SQLite aktualisieren

optionale Embeddings berechnen

C. Suche
Volltext

Filter auf Tags/Typ/Datum

später semantische Suche

D. Retrieval für Agenten
get_note

search_notes

find_related_notes

get_recent_notes

search_by_tag

get_note_context

Das ist schon genug für echten Nutzen.

Wie die Daten modelliert werden sollten
Markdown-Datei
Enthält:

Fließtext

Überschriften

Listen

Bilderreferenzen

interne Links

SQLite-Tabellen
Praktisch wären z. B.:

notes

note_chunks

attachments

tags

note_tags

links

entities

embeddings

sources

Beispiel grob:

notes
id

path

title

type

status

created_at

updated_at

body_markdown

summary

note_chunks
id

note_id

chunk_index

heading_path

content

embedding

attachments
id

note_id

file_path

media_type

caption

created_at

links
from_note_id

to_note_id

link_type

Solltest du eine eigene App bauen?
Ja, aber klein und zweckmäßig.

Nicht:

Notion-Klon

Obsidian-Klon

riesiges Frontend

komplexe Mehrbenutzerlogik

Sondern:

lokaler Markdown-Editor

Metadatenformular

Suche

Note-Ansicht

Attachments

einfache Graph-/Relationsansicht optional

Der große Fehler wäre, zuerst monatelang UI zu bauen.

Was ich konkret tun würde
Variante 1: Sehr pragmatisch
Dateien auf Platte

SQLite

Python FastAPI

einfacher React-Frontend-Editor oder sogar server-rendered UI

später MCP

Variante 2: Noch schneller
anfangs gar kein eigenes Frontend

Notes in VS Code oder Obsidian schreiben

Python-Indexer liest den Ordner

kleines Such-UI separat

MCP-Server darauf

Das ist oft der bessere Start.

Denn die eigentliche Schwierigkeit ist meist nicht Editing, sondern:

sauberes Datenmodell

Retrieval

Agenten-Integration

sinnvolle Metadaten

Wie koppelst du das mit einem Agenten?
Am besten nicht direkt “der Agent liest SQLite roh”, sondern über eine Werkzeugschicht.

Also:

Agent → MCP Tools / API → SQLite + Files

Warum das besser ist:

kontrollierte Queries

saubere Ergebnisse

weniger Halluzination

Sicherheitsgrenzen

reproduzierbare Retrieval-Pfade

Sinnvolle MCP-Tools
Zum Beispiel:

search_notes(query, tags?, type?, limit?)

get_note(note_id)

get_note_markdown(note_id)

find_related_notes(note_id)

list_recent_notes(days, type?)

search_semantic(query, limit?)

get_note_attachments(note_id)

get_notes_by_entity(entity_name)

Der Agent muss dann nicht “DB verstehen”, sondern nur diese Tools benutzen.

MCP ist genau dafür gedacht: Modelle mit externen Tools und Systemen zu verbinden. GitHub beschreibt MCP explizit als Protokoll, um Copilot mit anderen Systemen zu integrieren. 

Wie der Agent sinnvoll auswertet
Wichtig: Der Agent sollte nicht nur “Suche machen”, sondern einen kleinen Arbeitsablauf haben.

Sinnvolle Agent-Pipeline
1. Intent erkennen
Beispiel:

suche ich eine konkrete Note?

will ich Zusammenfassung?

will ich Querverbindungen?

will ich Entscheidungen zu einem Thema?

2. Metadatenfilter
Erst strukturierte Einschränkung:

Bereich

Typ

Zeit

Tags

3. Retrieval
Dann:

BM25 / Volltext

optional semantische Suche

optional Link-Nachbarn / verwandte Notes

4. Verdichtung
Agent fasst relevante Snippets zusammen:

mit Quellen

mit Konflikten

mit “offenen Punkten”

5. Optionales Schreiben
Agent kann Vorschläge machen:

neue Summary

Decision Note

Review Note

Missing links

Das ist viel besser als “eine lange Datei in den Kontext kippen”.

Ein sehr guter Zusatz: systemgenerierte Sekundärdaten
Der Agent oder Indexer kann zusätzlich erzeugen:

Kurzsummary pro Note

Schlüsselbegriffe

erkannte Personen/Orte/Produkte/Themen

“related notes”

offene Fragen

Entscheidung / Prozess / Learning-Klassifikation

Diese Dinge gehören nicht unbedingt in die Markdown-Datei selbst, sondern oft besser in SQLite.

Geht das mit GitHub Copilot in VS Code?
Ja, grundsätzlich ja.
VS Code unterstützt MCP-Server für Copilot, und Agent Mode kann mit MCP-Tools arbeiten. Offizielle VS-Code- und GitHub-Dokumentation beschreibt genau dieses Modell: MCP-Server bereitstellen, in VS Code konfigurieren, und der Agent kann diese Tools im Arbeitsablauf verwenden. 

Außerdem ist der VS-Code-Agent-Modus laut offizieller Doku in der Lage, mehrstufige Aufgaben auszuführen, Werkzeuge zu verwenden und mit MCP-Servern oder Extensions zu interagieren. 

Praktisch heißt das:
Du kannst einen eigenen MCP-Server bauen, der auf deine KB zugreift, und diesen in VS Code registrieren. VS Code dokumentiert auch das Hinzufügen und Verwalten solcher MCP-Server. 

Aber die wichtige Einschränkung:
Copilot ist dann nicht deine Knowledge Base, sondern nur ein Client/Agent auf deiner KB.

Also:

KB bleibt dein System

MCP ist die Zugriffsschicht

Copilot ist einer von mehreren möglichen Agenten/Clients

Das ist architektonisch sauber.

Was ich nicht machen würde
Nicht gut:
Alles direkt in SQLite ohne Markdown-Originale

Der Agent bekommt rohen DB-Zugriff auf alles

Zu viele Metadaten am Anfang

Embeddings zuerst, statt erst gutes Retrievalmodell

großer App-Bau vor echtem Nutzen

Besser:
Markdown zuerst

SQLite als Index

MCP für Zugriff

Agent auf Tool-Ebene

später UI und Intelligenz ausbauen

Konkreter Startplan in 5 Schritten
Schritt 1
Lege eine KB-Struktur im Filesystem an:

kb/
  notes/
  assets/
    images/
    docs/
  db/
    kb.sqlite
Schritt 2
Definiere 5–6 Note-Typen:

decision

process

learning

reference

project

journal

Schritt 3
Baue einen kleinen Python-Service:

Markdown lesen/schreiben

Frontmatter parsen

SQLite aktualisieren

Schritt 4
Baue Retrieval-APIs bzw. MCP-Tools:

Suche

Detailansicht

Related notes

Recent notes

Schritt 5
Binde diesen MCP-Server in VS Code / Copilot Agent ein

Meine klare Empfehlung für dich
Ja, eine kleine App ist sinnvoll.
Aber:

Nicht als “schöne Wissens-App” starten, sondern als “KB-Core mit Editor, SQLite-Index und MCP-Zugriff”.

Das beste Setup für dich wäre wahrscheinlich:

Markdown-Dateien als Content-Layer

SQLite als Struktur-/Retrieval-Layer

Python/FastAPI als Service

einfacher Editor

eigener MCP-Server

GitHub Copilot in VS Code als Agent-Client

So bekommst du:

menschlich gute Editierbarkeit

maschinell gute Querybarkeit

LLM-/Agent-Zugriff

langfristige Portabilität

Der nächste sinnvolle Schritt wäre, daraus eine konkrete Zielarchitektur mit Ordnerstruktur, SQLite-Schema, API/MCP-Tools und Implementierungsreihenfolge zu machen.


Ich möchte beispielsweise alle Einkommensnachweise als PDF Speicher. Was ist deine Empfehlung?

Für Einkommensnachweise (PDFs) bist du klar im Bereich
👉 “Dokumentenmanagement + strukturierte Metadaten”
nicht primär klassische “Notizen”.

Hier ist die richtige Strategie etwas anders als bei Markdown-Notes.

🔑 Grundprinzip
PDF = Source of Truth
SQLite = strukturierter Index + Metadaten + Suchbasis
(optional) Markdown = Zusammenfassung / Kontext

1. Was du konkret speichern solltest
Ein Einkommensnachweis ist mehr als nur eine Datei.

Du willst später Dinge beantworten können wie:

„Wie viel habe ich im Schnitt verdient?“

„Finde alle Gehaltsabrechnungen 2024“

„Was war mein Netto im März?“

„Welche Firma hat wann gezahlt?“

„Wo ist das Dokument für Bank X?“

👉 Dafür brauchst du strukturierte Daten.

2. Empfohlene Struktur (praktisch)
📁 Filesystem (Source of Truth)
kb/
  documents/
    income/
      2026/
        2026-03_salary_companyX.pdf
        2026-02_salary_companyX.pdf
Wichtig:

sprechende Dateinamen

keine random Namen wie scan_1234.pdf

🗄️ SQLite (Index + Metadaten)
Tabelle documents
id

file_path

doc_type (income)

source (companyX)

date (2026-03-01)

period_start

period_end

created_at

imported_at

Tabelle income_records
Das ist entscheidend.

id

document_id

employer

gross_income

net_income

currency

payment_date

period (z. B. 2026-03)

tax

social_contributions

👉 Das ist dein echter Mehrwert.

🔍 Optional: Fulltext / OCR / Chunks
extrahierter Text (für Suche)

optional Embeddings

3. Wie kommen die Daten rein?
Du hast 3 Optionen (kombinierbar):

Option A – manuell (Start)
PDF ablegen

Metadaten eingeben (Form oder CLI)

👉 simpel, zuverlässig

Option B – halbautomatisch (empfohlen)
PDF wird erkannt

Text extrahiert (z. B. mit OCR / Parser)

LLM extrahiert:

Netto

Brutto

Datum

Arbeitgeber

👉 dann Review durch dich

Option C – vollautomatisch
nur sinnvoll, wenn Struktur sehr konstant ist (z. B. immer gleiche Firma)

4. Brauchst du Markdown hier?
👉 Optional, aber sinnvoll für Kontext

Beispiel:

# Einkommen 2026-03

## Kontext
Bonus enthalten wegen Projektabschluss.

## Besonderheiten
- einmaliger Bonus
- Steuer höher als üblich

## Referenz
[[2026-03_salary_companyX.pdf]]
Markdown ist hier:

Kontext

Erklärung

Interpretation

Nicht:

Datenquelle

5. Wie der Agent darauf zugreift
Dein MCP / API sollte sowas anbieten:

Dokumente
list_documents(type="income", year=2026)

get_document(document_id)

search_documents(query)

Strukturierte Daten
get_income_by_month(year)

get_income_summary(year)

get_average_income(period)

compare_income(year1, year2)

6. Was der Agent dann kann
Beispiele:

👉 „Wie hat sich mein Einkommen entwickelt?“
→ DB Query + Aggregation

👉 „Warum war mein Einkommen im März höher?“
→ PDF + Markdown Kontext

👉 „Zeig mir alle Gehaltsabrechnungen von Firma X“
→ Metadatenfilter

👉 „Fasse meine Einkommensentwicklung 2024 zusammen“
→ strukturierte Daten + Textkontext

7. Wichtig: Trennung der Rollen
Element	Rolle
PDF	Originaldokument (rechtlich relevant)
SQLite	strukturierte Daten
Markdown	Interpretation / Kontext
Agent	Analyse / Query
8. Typische Fehler
❌ Alles nur als PDFs speichern
→ keine Auswertung möglich

❌ Alles nur als Markdown extrahieren
→ verlierst Originaldokument

❌ Nur Dateinamen + Ordnerstruktur
→ nicht skalierbar

❌ Vollautomatische Extraktion ohne Kontrolle
→ Fehler summieren sich

9. Minimal sinnvolle Umsetzung
Wenn du heute startest:

Schritt 1
PDFs sauber benennen und ablegen

Schritt 2
SQLite Tabelle documents

Schritt 3
SQLite Tabelle income_records

Schritt 4
kleines Script:

PDF hinzufügen

Metadaten erfassen

Schritt 5 (optional)
LLM-Extraktion + Review

10. Erweiterung (sehr sinnvoll)
Später kannst du:

Diagramme generieren (Income over time)

Steuerabschätzungen machen

Cashflow analysieren

Finanzplanung darauf aufbauen

🧠 Kurzfassung
Für Einkommensnachweise:

👉 PDF speichern (Original)
👉 strukturierte Daten extrahieren (SQLite)
👉 optional Kontext als Markdown
👉 Agent greift über API/MCP darauf zu

Frage 1 (entscheidend für Design)
Wie willst du mit der Datenerfassung starten?

a) komplett manuell (einfach & kontrolliert)
b) halbautomatisch mit LLM + Review
c) möglichst automatisiert (max Komfort, mehr Komplexität)


Würdest du für den use case "income documents" make an own table? What about other domains. Every time a new table? 

Nicht für jedes neue Thema sofort eine eigene Tabelle.

Die richtige Antwort ist:

Baue einen stabilen generischen Kern und ergänze domain-spezifische Tabellen nur dort, wo strukturierte Abfragen echten Mehrwert bringen.

Die Grundregel
Trenne in drei Ebenen:

1. Generische Dokument-Ebene
Die brauchst du fast immer.

Beispiel:

documents

document_chunks

attachments

tags

entities

links

Diese Ebene ist für alle Domains gültig:

income documents

insurance

invoices

contracts

school documents

medical letters

house documents

2. Generische Metadaten-/Property-Ebene
Für Felder, die noch nicht stabil genug sind oder selten vorkommen.

Zum Beispiel:

document_properties

document_id

key

value_text

value_number

value_date

unit

Damit kannst du flexibel arbeiten, ohne dauernd das Schema umzubauen.

Beispiele:

gross_income = 5200

net_income = 3410

employer = Mercedes

contract_end = 2027-12-31

3. Domain-spezifische Tabellen
Nur wenn:

das Domainmodell stabil ist

du wiederholt darauf zugreifst

du Berechnungen/Aggregationen brauchst

du saubere Typisierung willst

du gute Queries brauchst

Dann lohnt sich z. B.:

income_records

invoices

contracts

vehicles

insurance_policies

Für income documents konkret
Ja, für Income würde ich wahrscheinlich eine eigene Tabelle machen.

Warum?

Weil du typischerweise Fragen hast wie:

Durchschnittsnetto pro Monat

Entwicklung über Zeit

Bonus vs. Grundgehalt

Summe brutto pro Jahr

Arbeitgebervergleich

Monatslücken erkennen

Das sind klassische strukturierte Queries.
Mit nur document_properties geht es auch, aber wird schnell hässlich und fehleranfällig.

Also:

Empfehlenswerte Kombination
documents
Allgemeine Dokumentinformationen

document_properties
Flexible Extraktionsfelder, auch für unfertige Domains

income_records
Sauber normalisierte Income-Daten

Beispiel:

documents
- id
- path
- domain = income
- doc_type = payslip
- source
- issue_date
- text_content
income_records
- id
- document_id
- employer
- person
- period_start
- period_end
- payment_date
- gross_amount
- net_amount
- tax_amount
- social_contributions
- currency
- bonus_amount
Wann du keine eigene Tabelle machen solltest
Keine neue Domain-Tabelle, wenn eines davon zutrifft:

du hast nur wenige Dokumente

du weißt noch nicht, welche Felder dauerhaft relevant sind

Struktur ändert sich oft

du brauchst kaum Aggregationen

du willst erst explorieren

Dann ist besser:

documents

document_properties

optional document_classification

Beispiel Domains dafür:

einzelne Schulbescheide

einzelne Briefe

seltene Behördenunterlagen

Reisebelege mit sehr heterogenen Inhalten

Gute Entscheidungsregel
Frage dich pro Domain:

1. Gibt es wiederkehrende, stabile Felder?
Bei income: ja.
Bei random Behördenbriefen: oft nein.

2. Will ich darauf rechnen, filtern oder aggregieren?
Bei income: klar ja.
Bei einzelnen PDFs: oft nein.

3. Ist das Domainobjekt fachlich eigenständig?
Income record ist ein echtes Objekt.
Ein “beliebiger Brief” eher nicht.

Wenn 2 von 3 klar mit ja beantwortet sind, ist eine eigene Tabelle meist sinnvoll.

Praktische Architektur, die skaliert
Ich würde es so bauen:

Kernschema
documents

document_chunks

document_properties

entities

tags

links

Domaintabellen nur für starke Bereiche
income_records

invoices

contracts

insurance_policies

assets

vehicles

So wächst das System sauber.

Warum nicht einfach nur EAV / key-value?
document_properties ist im Prinzip ein EAV-artiger Ansatz. Der ist gut für Flexibilität, aber schlecht als alleiniges Modell.

Probleme:

unsaubere Typisierung

komplexe SQL-Queries

schwierige Constraints

schwache Performance bei vielen Auswertungen

höhere Fehleranfälligkeit

Deshalb:

EAV/Properties für Exploration und Randfälle.
Eigene Tabellen für wichtige, stabile Domänen.

Sehr sinnvolles Vorgehen
Phase 1
Starte nur mit:

documents

document_properties

Damit kannst du schnell loslegen.

Phase 2
Beobachte echte Nutzung:

Welche Felder kommen oft vor?

Welche Abfragen willst du wiederholt machen?

Welche Domänen sind wirklich wichtig?

Phase 3
Ziehe diese Domänen in eigene Tabellen um:

income_records

später vielleicht invoice_records, contracts, etc.

Das ist der pragmatischste Weg.

Mein Rat für dein System
Für dein Vorhaben würde ich nicht für jede neue Domain sofort eine neue Tabelle bauen.

Ich würde so vorgehen:

Immer vorhanden
documents

document_chunks

document_properties

Frühe feste Domaintabellen
income_records

eventuell contracts

eventuell financial_accounts oder assets, falls du das aktiv auswerten willst

Später nach Bedarf
insurance_policies

vehicle_maintenance

tax_documents

household_expenses

Gute Faustregel
Neue Tabelle nur dann, wenn die Domain mehr ist als nur ein Dokumenttyp.

Also nicht:

“Tabelle für PDFs vom Arbeitgeber”

“Tabelle für Briefe”

“Tabelle für Scans”

Sondern:

Einkommen

Vertrag

Rechnung

Versicherung

Fahrzeug

Immobilie

Das sind fachliche Objekte.

Sauberes mentales Modell
Nicht „pro Dateityp eine Tabelle“, sondern:

„pro fachlicher Entität eine Tabelle, wenn sie stabil und auswertbar ist“.

Das ist der entscheidende Unterschied.

Meine klare Empfehlung
Für income documents:

ja, eigene Tabelle ist sinnvoll

Für neue Domains allgemein:

nein, nicht automatisch jedes Mal

zuerst generisch erfassen

dann nur häufige, stabile, analytisch wertvolle Domains spezialisieren

Frage 1
Welchen Architekturpfad willst du gedanklich als Nächstes vertiefen?

a) konkretes SQLite-Schema für documents + properties + income_records
b) generische Modellierungsstrategie für viele private Domains
c) Agent-/MCP-Sicht: wie der Agent über generische und domänenspezifische Daten abfragt


Das gefällt mir nicht. Ich möchte keine "Fachlogik" in der Datenstruktur. Diese soll sich komplett außen Daten und Metadaten ergeben. Also ein System dass wenige Basiselemente hat (Notizen/Wissen/Entscheidungen als markdown, evtl. zugehörige Bilder, Dokumente wie PDF mit Chunks, Bilder (Scan), evtl. Excel Dateien). Dazu allgemeine Metadaten und die Möglichkeit ü er Typen weitere Metadatengruppen (income Dokumente, Angebotsdokumente, Bankauszüge, etc.) hinzufügbar. Bei Dokumenten eine Zusammenfassung(?) - manuell oder später LLM generiert. Gerne auch (hierarchische) Labels (ob die manuell oder aus dem Dokument kommen ist erst Mal egal).

Ja. Das ist deutlich sauberer.

Was du beschreibst, ist im Kern kein fachdomänengetriebenes Schema, sondern ein content-zentriertes Wissens-/Dokumentensystem mit generischem Metamodell.

Das halte ich für eine gute Entscheidung, wenn du:

langfristig flexibel bleiben willst

keine Schema-Explosion willst

neue Dokumentarten ohne Migration hinzufügen willst

Fachlogik lieber im Agenten, in Regeln oder in Views haben willst, nicht im Kernschema

Die Konsequenz ist dann:

Nicht income_records, contracts, bank_statements usw. als Tabellen.
Sondern wenige Basiselemente plus ein erweiterbares Metadatenmodell.

Zielbild
Ich würde das System auf 5 Kernobjekte reduzieren:

Items

alles Relevante ist ein Item

z. B. Markdown-Notiz, PDF, Bild, Scan, Excel-Datei

Content Parts

zerlegte Inhalte eines Items

z. B. Markdown-Body, PDF-Chunks, OCR-Text, Bildbeschreibung, Tabellenextrakt

Metadata

generische Schlüssel-Wert-Metadaten

sowohl global als auch typbezogen

Labels

hierarchisch möglich

manuell oder automatisch vergeben

Links

Beziehungen zwischen Items

z. B. „gehört zu“, „bezieht sich auf“, „ist Zusammenfassung von“

Das reicht als Kern.

1. Kernmodell
items
Das ist die zentrale Tabelle.

Ein item ist jede gespeicherte Einheit.

Beispiele:

Markdown-Note

PDF-Dokument

eingescanntes Bild

Foto

Excel-Datei

extrahierte Zusammenfassung

später auch Audio oder Mail

Typische Felder:

id

item_kind

note

document

image

spreadsheet

summary

title

source_path

mime_type

created_at

updated_at

content_hash

language

status

parent_item_id optional

origin

manual

import

generated

archived

Wichtig:
item_kind ist technisch, nicht fachlich.
Also nicht income_document, sondern document.

content_parts
Hier liegt der extrahierte oder originäre Inhalt in Teilen.

Beispiele:

kompletter Markdown-Text

Abschnitt einer Note

PDF-Seitenchunk

OCR-Text aus Scan

Tabellenblatt-Text aus Excel

Bildbeschreibung

LLM-Generated Summary

Felder:

id

item_id

part_kind

markdown_body

text_chunk

ocr_text

caption

summary

table_extract

sequence_no

page_no optional

heading_path optional

content_text

token_count

source_method

manual

parser

ocr

llm

quality_score optional

embedding_ref optional

Damit bekommst du ein einheitliches Retrieval-Modell über alle Medientypen.

metadata_fields
Definiert, welche Metadatenfelder es überhaupt gibt.

Das ist wichtig, wenn du Metadatengruppen / Typen sauber modellieren willst, ohne Fachlogik hart einzubauen.

Felder:

id

key

label

value_type

string

number

date

datetime

boolean

json

applies_to_kind

note / document / image / spreadsheet / any

group_name

general

finance

document_classification

review

is_multivalue

is_system

description

Beispiele:

document_date

issuer

amount_net

period_start

period_end

summary_status

reviewed_by_user

Wichtig:
Hier steckt keine Tabellen-Fachlogik, nur Felddefinition.

item_metadata
Die eigentlichen Werte.

Felder:

id

item_id

field_id

value_text

value_number

value_date

value_datetime

value_bool

value_json

source

manual

extracted

inferred

imported

confidence

created_at

So kannst du pro Item beliebige Metadaten speichern.

label_nodes
Für hierarchische Labels.

Felder:

id

name

full_path

parent_id

description

Beispiele:

finance

finance/income

finance/bank

finance/tax

documents/offers

family/children/school

item_labels
Zuordnung Item ↔ Label.

Felder:

item_id

label_id

source

manual

extracted

inferred

confidence

item_links
Beziehungen zwischen Items.

Felder:

id

from_item_id

to_item_id

link_type

related

attachment

source_of

summary_of

duplicate_of

references

source

confidence

Beispiele:

PDF → generierte Summary

Markdown-Note → zugehöriges PDF

Scan → OCR-Text-Item

Excel-Datei → Auswertungsnotiz

2. Metadatengruppen statt Fachlogik
Das ist der wichtigste Punkt in deinem Ansatz.

Du willst nicht:

neue Tabelle pro Fachdomäne

Du willst:

allgemeines Basisschema

plus konfigurierbare Metadatengruppen

Das ist genau richtig.

Beispiel
Gruppe general
title

created_at

source

language

author

document_date

Gruppe document_classification
document_category

issuer

recipient

period_start

period_end

Gruppe finance_income
gross_amount

net_amount

payment_date

currency

Gruppe finance_bank_statement
account_reference

statement_period

bank_name

Gruppe offers
vendor

offer_number

valid_until

total_amount

Das heißt:
Die Felder sind erweiterbar, aber das Datenmodell bleibt gleich.

3. Wie ich Typen modellieren würde
Du hast eigentlich zwei Ebenen von „Typ“:

A. Technischer Typ
Was ist es physisch?

note

document

image

spreadsheet

Das gehört in items.item_kind.

B. Semantischer Typ / Klassifikation
Was ist es fachlich?

income_document

bank_statement

offer

insurance_letter

Das würde ich nicht als feste Spalte mit Business-Logik hart verdrahten, sondern als Metadatum oder Label abbilden.

Zum Beispiel:

Metadatum document_category = income_document

oder Label finance/income/payslip

Ich würde wahrscheinlich beides erlauben, aber eines als Hauptmechanismus wählen.

Meine Empfehlung:

Klassifikation als Metadatum

Navigation/Organisation über Labels

Also:

document_category = bank_statement

Labels: finance/banking/ing

4. Zusammenfassungen
Ja, Zusammenfassungen sind sinnvoll.

Aber ich würde sie nicht einfach als Textfeld in items speichern, sondern als eigene Content-Part oder als eigenes Item.

Besser:
Zusammenfassung als content_part

Beispiel:

part_kind = summary

source_method = manual | llm

Oder, wenn du Versionierung/Mehrfachfassungen willst:

eigenes summary-Item

verlinkt über summary_of

Warum?
Weil du dann unterscheiden kannst:

Originalinhalt

OCR-Inhalt

extrahierter Text

manuelle Summary

LLM-Summary

Kurzsummary vs Langsummary

Das ist sauberer.

5. Bilder und Dateien
Bilder
Bilder sollten eigene Items sein:

Foto

eingescannter Beleg

Screenshot

Optional mit:

OCR-Text als Content Part

Caption/Beschreibung als Content Part

Labels/Metadaten

PDFs
PDF als Item, mit:

Datei auf Platte

Chunks in content_parts

Summary in content_parts

Klassifikation über Metadaten/Labels

Excel
Excel als Item, mit:

Datei auf Platte

Sheet-Infos als Content Parts oder eigene technische Unterobjekte

optional Text-/Tabellenextrakt

Wichtig:
Datei selbst im Filesystem, Struktur und Retrieval im DB-Index.

6. Physische Speicherung
Filesystem
Source of truth für Binärdateien und Markdown-Dateien.

Zum Beispiel:

kb/
  items/
    notes/
    documents/
    images/
    spreadsheets/
  assets/
  db/
    kb.sqlite
Ich würde die Inhalte auf Platte belassen und in SQLite nur referenzieren.

SQLite
Index, Metadaten, Labels, Links, Chunks, Summaries.

7. Was der Agent daraus macht
Der Agent sollte nicht Fachlogik aus dem Schema ziehen, sondern aus:

item_kind

Metadaten

Labels

Chunks

Links

Summaries

Beispielabfragen
„Zeig mir alle income documents aus 2025“

Filter auf document_category = income_document

plus Datumsfilter

„Welche PDFs betreffen Angebote?“

Label oder Metadatum

„Fasse alle Bankdokumente vom letzten Quartal zusammen“

Labels + Metadaten + Summary/Chunks

„Welche Dokumente haben noch keine Summary?“

fehlender summary-Part oder summary_status

Das ist genau der Vorteil deines Ansatzes:
Logik liegt in Query/Agent/Regeln, nicht im Tabellenschema.

8. Was ich ergänzen würde
Es fehlen noch 3 Dinge, die sehr nützlich sind.

A. metadata_schemas oder metadata_groups
Damit du Metadatensets formal definieren kannst.

Beispiel:

Gruppe income_document_fields

Gruppe offer_document_fields

Gruppe bank_statement_fields

Felder:

id

name

description

applies_to_kind

version

Und dann Zuordnung:

group_fields(group_id, field_id, required, order_no)

So kannst du im UI je nach Klassifikation passende Felder einblenden.

Das ist wahrscheinlich genau das, was du willst.

B. ingestion_runs
Für Nachvollziehbarkeit bei Parser/OCR/LLM.

wann wurde OCR ausgeführt

welches Modell

welche Version

mit welcher Confidence

C. provenance
Für Metadaten und Summaries:

manuell gesetzt?

aus Dateiname?

aus OCR?

aus Parser?

aus LLM extrahiert?

Das ist für Vertrauen und Review extrem wertvoll.

9. Konkrete Empfehlung für dein Modell
Ich würde den Kern so definieren:

Basistabellen
items

content_parts

metadata_fields

metadata_groups

group_fields

item_metadata

label_nodes

item_labels

item_links

Optionale Zusatztabellen
ingestion_runs

embeddings

saved_queries

review_tasks

Mehr würde ich am Anfang nicht bauen.

10. Warum das gut ist
Dieser Ansatz erfüllt genau deine Ziele:

wenige Basiselemente

kein Fachschema pro Domäne

Metadatengruppen erweiterbar

PDFs, Bilder, Markdown, Excel unter einem Dach

Zusammenfassungen möglich

Labels hierarchisch

manuelle und automatische Anreicherung gleichzeitig möglich

Agent kann alles generisch auswerten

11. Meine klare Designentscheidung
Ich würde dein System so modellieren:

Ein einheitliches item-Modell mit technischem Typ, dateibasiertem Inhalt, extrahierten content_parts, flexiblen Metadatenfeldern, konfigurierbaren Metadatengruppen, hierarchischen Labels und generischen Beziehungen.

Das ist für eine persönliche KB deutlich robuster als fachspezifische Tabellen.

12. Was ich nicht tun würde
keine Domänentabellen wie income_records

keine harten Business-Constraints im Kernschema

keine Typenflut auf Tabellenebene

keine Metadaten nur als freies JSON ohne Felddefinition

keine Labels als einzigen Strukturmechanismus ohne formale Metadaten

Denn:

nur JSON wird chaotisch

nur Labels sind zu schwach

nur starre Tabellen sind zu unflexibel

Dein Ansatz ist in der Mitte und genau dort ist er sinnvoll.

Der nächste sinnvolle Schritt wäre jetzt ein konkretes SQLite-Schema für genau dieses generische Modell.


Kannst du Punkt 3 besser einbauen. Kann ich beides individuell eingeben? Item ist (PDF) Dokument ilumd stellt inhaltlich Einkommen dar oder Typ ist scan für eine Rechnung?

Ja — genau so würde ich es bauen:

Du brauchst zwei getrennte Typ-Ebenen, und beide sollten individuell setzbar sein.

Nicht nur möglich, sondern ausdrücklich gewollt.

Die saubere Trennung
1. Technischer Typ
Das beschreibt, was das Ding technisch/physisch ist.

Beispiele:

note

document

image

spreadsheet

audio

Ein PDF wäre also meist:

item_kind = document

Ein JPG-Scan wäre:

item_kind = image

Eine Markdown-Datei:

item_kind = note

2. Inhaltliche Klassifikation
Das beschreibt, was das Ding fachlich bedeutet.

Beispiele:

income_document

invoice

bank_statement

offer

insurance_letter

decision

reference

receipt

Das ist nicht technisch, sondern semantisch.

Genau dein Beispiel
Fall A: PDF mit Einkommensnachweis
Das Objekt ist technisch:

item_kind = document

Inhaltlich:

classification = income_document

Zusätzlich evtl. Labels:

finance

income

work

Also:

item_kind = document
classification = income_document
labels = finance/income
mime_type = application/pdf
Fall B: Scan einer Rechnung als Bild
Das Objekt ist technisch:

item_kind = image

Inhaltlich:

classification = invoice

Optional zusätzlich:

subclassification = supplier_invoice

Also:

item_kind = image
classification = invoice
labels = finance/expenses/invoices
mime_type = image/jpeg
Das ist vollkommen legitim.

Denn ein Scan ist technisch ein Bild, aber semantisch eine Rechnung.

Fall C: PDF-Scan einer Rechnung
Hier wird es interessant:

Die Datei ist technisch:

item_kind = document

Inhaltlich:

classification = invoice

Und zusätzlich kannst du festhalten:

document_form = scanned

oder content_origin = scan

Also:

item_kind = document
classification = invoice
document_form = scanned
mime_type = application/pdf
Das ist oft besser als scan als Haupttyp zu benutzen.

Denn ein gescanntes PDF ist technisch kein Bild mehr, sondern ein Dokument, auch wenn sein Inhalt aus gescannten Seiten besteht.

Meine klare Empfehlung
scan sollte meistens kein Haupttyp sein
scan ist eher eine Eigenschaft der Entstehung oder Struktur, nicht der primäre Typ.

Denn ein Scan kann sein:

Bild

PDF

mehrseitiges Dokument

OCR-bearbeitete Datei

Deshalb würde ich unterscheiden:

Haupttyp
item_kind = image oder document

Zusätzliche Eigenschaft
capture_mode = scan

oder origin_type = scanned

oder is_scanned = true

Das ist sauberer.

Praktisches Modell
Ich würde pro Item genau diese Ebenen erlauben:

A. item_kind
Pflichtfeld, technisch

Beispiele:

note

document

image

spreadsheet

B. classification
Optional, aber sehr wichtig, semantisch

Beispiele:

income_document

invoice

offer

bank_statement

decision_note

C. Zusätzliche beschreibende Metadaten
Optional

Beispiele:

is_scanned = true

source_method = manual_import

summary_status = missing

issuer = Mercedes

document_date = 2026-03-31

D. Labels
Für Navigation, Mehrdeutigkeit und flexible Organisation

Beispiele:

finance/income

finance/tax

household/utilities

work/payroll

Warum beides wichtig ist
Wenn du nur den technischen Typ hast, weißt du:

es ist ein PDF

es ist ein Bild

es ist eine Excel-Datei

Aber du weißt nicht:

Gehaltsabrechnung?

Angebot?

Bankauszug?

Versicherung?

Wenn du nur die fachliche Klassifikation hast, verlierst du:

wie du es verarbeiten musst

ob OCR nötig ist

wie du es rendern kannst

welche Parser greifen

Darum brauchst du beides.

Das Datenmodell dafür
Ich würde das nicht alles in eine einzige freie Metadatenmenge kippen, sondern leicht strukturieren.

In items
Feste Basisspalten:

id

title

item_kind

mime_type

source_path

created_at

updated_at

In item_metadata
Für semantische und zusätzliche Eigenschaften:

classification = income_document

is_scanned = true

document_date = 2026-03-31

issuer = company_x

In item_labels
Für flexible Navigation:

finance/income

documents/payroll

Noch besser: mehrere Klassifikationsebenen erlauben
Manchmal reicht eine einzige classification nicht.

Dann kannst du das so modellieren:

Variante 1: Hauptklassifikation + weitere Metadaten
classification = invoice

invoice_role = supplier_invoice

Variante 2: Klassifikationspfad
classification = finance/invoice/supplier

Variante 3: Hauptklassifikation + Labels
classification = invoice

Labels:

finance

supplier

tax_relevant

Für dein Vorhaben würde ich meist Hauptklassifikation + Labels bevorzugen.

Das ist einfacher und flexibler.

Konkrete Beispiele
Beispiel 1
Gehaltsabrechnung als PDF

title = Gehaltsabrechnung März 2026
item_kind = document
mime_type = application/pdf
classification = income_document
is_scanned = false
labels = finance/income/payroll
Beispiel 2
Foto einer Papierrechnung

title = Rechnung Baumarkt April 2026
item_kind = image
mime_type = image/jpeg
classification = invoice
is_scanned = true
labels = finance/expenses/home
Beispiel 3
Eingescanntes Angebot als PDF

title = Angebot Fensterbauer
item_kind = document
mime_type = application/pdf
classification = offer
is_scanned = true
labels = house/renovation/offers
Beispiel 4
Markdown-Notiz zu einer Finanzentscheidung

title = Entscheidung ETF Struktur
item_kind = note
classification = decision
labels = finance/investing/strategy
Was ich im UI machen würde
Ja, du solltest beides individuell eingeben können.

Im Erfassungsformular:
Technischer Typ
Dropdown:

Note

Dokument

Bild

Spreadsheet

Inhaltliche Klassifikation
Dropdown oder Combo-Box:

Einkommen

Rechnung

Angebot

Bankauszug

Versicherung

Entscheidung

Referenz

Sonstiges

Zusätzliche Eigenschaften
Checkboxen / Felder:

Scan

OCR nötig

Dokumentdatum

Aussteller

Zusammenfassung vorhanden

Labels
Freitext mit Vorschlägen / hierarchische Auswahl

Das wäre sehr brauchbar.

Meine präzise Antwort auf deine Frage
Ja, du solltest beides getrennt und individuell eingeben können:

Was ist das technisch?
z. B. PDF-Dokument, Bild, Markdown-Notiz

Was bedeutet es inhaltlich?
z. B. Einkommensnachweis, Rechnung, Angebot, Bankauszug

Ein Objekt kann also völlig korrekt sein als:

technisch: document

inhaltlich: income_document

oder:

technisch: image

inhaltlich: invoice

und zusätzlich:

is_scanned = true

Mein Designvorschlag in einem Satz
Modelliere jedes Objekt mit einem technischen Basistyp, einer optionalen fachlichen Klassifikation, zusätzlichen generischen Metadaten und hierarchischen Labels.

Das ist die sauberste Version deiner Idee.

Im nächsten Schritt kann ich dir daraus ein konkretes SQLite-Schema mit Beispieltabellen und 10 Beispiel-Items bauen.


Sehr gut. Merke dir den Designansatz. Wie würde ich beispielsweise eine Recherche zu einer Waschmaschine speichern?

Gespeicherte Erinnerung aktualisiert
Ja.

Eine Recherche zu einer Waschmaschine würde ich nicht als ein einziges Item speichern, sondern als kleinen Item-Verbund. Sonst verlierst du später Nachvollziehbarkeit.

Sinnvolle Struktur
1. Zentrales Leit-Item
Ein Haupt-Item als Note.

Technisch:

item_kind = note

Inhaltlich:

classification = research

Titel zum Beispiel:

Waschmaschine Kaufrecherche 2026

Das ist dein Einstiegspunkt. Dort steht:

Ziel

Anforderungen

Kandidaten

Zwischenfazit

finale Entscheidung

offene Fragen

2. Zugehörige Quellen als eigene Items
Zum Beispiel:

Produktdatenblatt als PDF

item_kind = document

classification = product_document

Screenshot / Foto / Shop-Seite

item_kind = image

classification = product_reference

manuell notierte Vergleichsnotiz

item_kind = note

classification = comparison_note

Excel/CSV mit Vergleich

item_kind = spreadsheet

classification = comparison_table

Diese Items verlinkst du mit der Haupt-Recherche.

3. Beziehungen
Zwischen den Items:

Hauptnote → references → Datenblatt

Hauptnote → references → Screenshot

Hauptnote → includes → Vergleichstabelle

Hauptnote → summarizes → einzelne Quellen

So bleibt die Recherche nachvollziehbar.

Wie die Hauptnote aussehen könnte
Beispiel:

---
title: Waschmaschine Kaufrecherche 2026
item_kind: note
classification: research
---

# Ziel
Neue Waschmaschine für Familie finden.

# Anforderungen
- 8–9 kg
- leise
- gute Energieeffizienz
- zuverlässig
- möglichst reparierbar
- Preisbereich bis 700 €

# Kandidaten
- Bosch Modell A
- Samsung Modell B
- Miele Modell C gebraucht / teuer
- Beko Modell D

# Bewertungskriterien
- Lautstärke
- Verbrauch
- Preis
- Reparierbarkeit
- Programme
- Erfahrungsberichte

# Zwischenfazit
Bosch wirkt als beste Mischung aus Preis, Vertrauen und Features.

# Entscheidung
Noch offen.

# Verlinkte Quellen
- Datenblatt Bosch
- Händlerangebot X
- Screenshot Energie-Label
- eigene Vergleichstabelle
Welche Metadaten sinnvoll sind
Für die Haupt-Recherche eher allgemeine Metadaten:

status = open | decided | archived

topic = washing_machine

decision_stage = exploration | shortlist | selected

priority = medium

created_at

updated_at

Optionale Metadatengruppe research:

research_subject = washing_machine

budget_max = 700

decision_deadline = ...

selected_option = ...

comparison_exists = true

Das ist keine harte Fachlogik, sondern nur konfigurierbare Metadaten.

Labels
Zum Beispiel:

household/appliances

shopping/research

shopping/major_purchase

Wenn du willst zusätzlich:

finance

family

home

Labels helfen bei Navigation, nicht bei der eigentlichen Wahrheit.

Wie du einzelne Informationen speichern würdest
Fall A: Produktdatenblatt PDF
item_kind = document

classification = product_document

Labels:

household/appliances

shopping/source

Dazu:

Chunks

Summary

evtl. extrahierte Metadaten:

Marke

Modell

Kapazität

Energieklasse

Lautstärke

Fall B: Screenshot von Shop-Seite
item_kind = image

classification = product_reference

evtl. OCR

Labels:

shopping/price

household/appliances

Fall C: Vergleichstabelle
item_kind = spreadsheet

classification = comparison_table

Fall D: Finale Entscheidung
Entweder in der Hauptnote oder als eigene Note:

item_kind = note

classification = decision

und verlinkt auf die Recherche.

Wie ein Agent das nutzen kann
Der Agent kann später fragen beantworten wie:

„Welche Waschmaschine hatte ich damals favorisiert?“

„Welche Anforderungen waren mir wichtig?“

„Welche Quellen hatte ich dazu?“

„Warum habe ich Bosch statt Samsung gewählt?“

„Welche Recherchen zu Haushaltsgeräten habe ich schon gemacht?“

Dafür braucht er:

Hauptnote

verlinkte Quellen

Summaries

Labels

Metadaten

Meine Empfehlung
Für so eine Recherche würde ich fast immer dieses Muster nutzen:

1 Hauptnote + mehrere Quellen-Items + optionale Vergleichstabelle + optionale Entscheidungsnote

Nicht alles in eine Datei, aber auch nicht jede Kleinigkeit isoliert ohne Bezug.

Konkretes Minimalmodell für dein Beispiel
Hauptitem
item_kind = note

classification = research

Quellen
PDF Datenblatt

Screenshots

Shop-Angebote

Testzusammenfassungen

eigene Tabelle

Links
references

compares

summarizes

decision_for

So bleibt es generisch und trotzdem sehr brauchbar.

Frage 1
Welchen Teil soll ich als Nächstes konkretisieren?

a) ein vollständiges Beispiel mit 5–8 echten Items zur Waschmaschinen-Recherche
b) ein Metadaten-Set für research und decision
c) eine Link-/Beziehungslogik zwischen Hauptnote, Quellen und Entscheidung


Wie würde das konkret außerhalb der Datenbank aussehen? Wo l8egen dann die Angebotsdateien? In einer Standardstruktur? Oder für die Recherche in einem Ordner?

Gute Frage — hier entscheidet sich, ob dein System später wartbar oder chaotisch wird.

Kurzfassung vorweg:

👉 Keine projekt-/recherche-spezifischen Ordner als Source of Truth
👉 Eine stabile, globale Struktur nach technischem Typ
👉 Zusammenhang ausschließlich über DB (Links, Labels, Metadaten)

Alles andere wirkt am Anfang intuitiv („Ordner Waschmaschine/“), bricht aber langfristig.

🔑 Prinzip
Filesystem = dumme, stabile Ablage
Datenbank = Bedeutung, Kontext, Beziehungen

1. Empfohlene Ordnerstruktur (konkret)
Ich würde es so aufbauen:

kb/
  items/
    notes/
    documents/
    images/
    spreadsheets/
  assets/        # optional (z. B. Rohimporte)
  db/
    kb.sqlite
Optional zusätzlich:

  inbox/
für unsortierte neue Dateien.

2. Wie deine Waschmaschinen-Recherche darin liegt
❌ Nicht so (vermeiden)
kb/
  research/
    washing_machine_2026/
      note.md
      angebot1.pdf
      angebot2.pdf
Problem:

Du baust implizite Fachlogik in Ordner

schwierig zu durchsuchen

nicht wiederverwendbar

mehrere Zugehörigkeiten unmöglich

✅ So (empfohlen)
kb/
  items/
    notes/
      2026-04-07_washing-machine-research.md

    documents/
      doc_7f3a91_offer_bosch.pdf
      doc_91ab22_offer_samsung.pdf

    images/
      img_12ac9e_energy_label.jpg

    spreadsheets/
      sheet_aa82f3_washing_machine_comparison.xlsx
👉 Alle Dateien global, nicht pro Projekt gruppiert

3. Wie entsteht der Zusammenhang?
Nicht durch Ordner, sondern durch:

A. Links (item_links)
Research Note → Angebot PDF

Research Note → Vergleichstabelle

Research Note → Bilder

B. Labels
shopping/research

household/appliances

washing_machine

C. Metadaten
research_subject = washing_machine

related_decision = xyz

4. Wie du Dateien benennen solltest
Zwei Optionen:

Option A (empfohlen): stabile IDs
doc_<id>_<kurzbeschreibung>.pdf
Beispiele:

doc_7f3a91_offer_bosch.pdf

doc_91ab22_offer_samsung.pdf

Vorteile:

eindeutig

konfliktfrei

robust bei Umbenennung

DB ist führend

Option B: sprechende Namen (einfacher Start)
2026-04_offer_bosch_series6.pdf
Geht, aber:

kollisionsanfälliger

schwerer zu refactoren

5. Wo landen Angebotsdateien konkret?
👉 Immer hier:

kb/items/documents/
Nicht:

nicht im Research-Ordner

nicht im Projektordner

nicht im thematischen Ordner

Warum?

Weil ein Dokument später:

auch für Steuer relevant sein kann

auch für Garantie relevant sein kann

auch für andere Entscheidungen relevant sein kann

👉 Ein Dokument kann mehrere Kontexte haben → Ordner können das nicht.

6. Wie fühlt sich das praktisch an?
Du arbeitest so:

Beim Import
Datei kommt rein (z. B. Download)

wird verschoben nach:

kb/items/documents/

DB bekommt:

neues Item

Metadaten

optional Klassifikation

du verlinkst sie mit der Research-Note

In der UI / im Tool
Du siehst:

„Waschmaschinen-Recherche“

→ Liste der verlinkten Dokumente

→ Bilder

→ Vergleich

Du merkst nicht, dass die Dateien physisch ganz woanders liegen.

7. Wann sind projektbezogene Ordner trotzdem ok?
Nur als:

👉 temporäre Arbeitsordner

z. B.:

downloads/
washing_machine_temp/
Aber:

danach import → kb/items/...

nicht dauerhaft nutzen

8. Optional: virtuelle Ordner (wichtig!)
Wenn du später UI baust:

👉 zeige virtuelle Ordner

Beispiel:

„Waschmaschine Recherche“

„Finanzen“

„Versicherungen“

Diese entstehen aus:

Labels

Metadaten

Links

Nicht aus dem Filesystem.

9. Erweiterung: Versionierung / Snapshots
Wenn du weiter gehst:

Angebote können sich ändern

Preise ändern sich

Dann kannst du:

mehrere Items für gleiche Quelle

oder Version-Metadaten

Aber das bleibt alles im gleichen Modell.

10. Warum dieser Ansatz langfristig gewinnt
Vorteile
keine Duplikate durch Ordnerstruktur

mehrere Kontexte pro Dokument möglich

saubere Trennung von Inhalt vs Bedeutung

Agent kann alles konsistent abfragen

skalierbar auf viele Domains

keine Migration bei neuen Themen

Nachteile
fühlt sich am Anfang ungewohnt an

man „sieht“ Zusammenhänge nicht im Explorer

erfordert UI oder Tooling

🧠 Die wichtigste mentale Umstellung
Nicht:
👉 „Wo speichere ich diese Datei?“

Sondern:
👉 „Wie verknüpfe ich dieses Item mit anderen?“

Kurzantwort
Angebots-PDFs → immer in kb/items/documents/

keine projektbasierten Ordner

Zusammenhang über:

Links

Metadaten

Labels

UI zeigt dir später die Struktur, nicht das Filesystem

Frage 1
Wie willst du initial arbeiten?

a) komplett über VS Code + Dateien (minimal Tooling)
b) kleines eigenes UI (Form + Editor + Linking)
c) Hybrid: Files + einfache CLI/Tools für Metadaten + später UI


Der Ordner KB/items/documents wächst aber stark an. Wie sollte es weiter unterteilt sein um nicht Ordner 10000 Dateien zu haben?

Gute Beobachtung — das Problem ist real, aber lösbar ohne dein Modell zu zerstören.

Die zentrale Regel bleibt:

👉 Keine fachliche Struktur im Filesystem
👉 Nur technische / skalierungsorientierte Partitionierung

🔑 Ziel
Du willst:

keine 10k Dateien in einem Ordner

keine semantische Logik im Filesystem

stabile Pfade (wichtig für DB)

einfache Generierung ohne komplexe Regeln

1. Best Practice: Hash-/ID-basierte Partitionierung
Das ist der sauberste Ansatz.

Struktur
kb/items/documents/
  7f/
    doc_7f3a91_offer_bosch.pdf
  91/
    doc_91ab22_offer_samsung.pdf
👉 Die ersten 2 Zeichen der ID bestimmen den Ordner.

Warum das gut ist
gleichmäßige Verteilung

keine Fachlogik

deterministisch

skaliert auf Millionen Dateien

sehr einfach zu berechnen

Alternative: 2-Level Partitionierung (bei sehr vielen Dateien)
kb/items/documents/
  7f/
    3a/
      doc_7f3a91_offer_bosch.pdf
👉 erste 2 + nächste 2 Zeichen

2. ID-Generierung
Du brauchst stabile IDs.

Optionen:

UUID (klassisch)

short hash (z. B. SHA1 gekürzt)

ULID (sortierbar nach Zeit → sehr gut)

Ich würde empfehlen:

👉 ULID oder UUID + Kurzform

Beispiel:

7f3a91c2...

3. Dateiname
Ich würde kombinieren:

doc_<id>_<optional_slug>.pdf
Beispiel:

doc_7f3a91_bosch_series6.pdf
Slug ist optional → nur für Menschen.

4. Konkrete Zielstruktur
kb/
  items/
    documents/
      7f/
        doc_7f3a91_bosch_series6.pdf
      91/
        doc_91ab22_samsung_offer.pdf

    images/
      12/
        img_12ac9e_energy_label.jpg

    notes/
      20/
        note_20ff11_washing_machine.md

    spreadsheets/
      aa/
        sheet_aa82f3_comparison.xlsx
👉 jeder Typ eigener Namespace
👉 gleiche Partitionierungslogik

5. Was du NICHT tun solltest
❌ Nach Thema partitionieren
documents/
  finance/
  washing_machine/
→ verletzt dein Designprinzip

❌ Nach Datum partitionieren
documents/
  2026/
  2025/
→ sieht gut aus, ist aber semantische Logik

❌ Hybrid (gefährlich)
documents/
  finance/
    2026/
→ führt schnell zu Chaos

6. Wann Datum trotzdem sinnvoll ist
Nur wenn:

👉 du explizit zeitbasierte Systeme baust (z. B. Logs, Journals)

Für Dokumente:
→ eher nein

7. Bonus: Inbox-Pattern
Sehr praktisch:

kb/inbox/
Neue Dateien landen hier → dann:

ID generieren

verschieben nach partitioniertem Ziel

DB-Eintrag erzeugen

8. Zugriffspfad im Code
Du brauchst eine Funktion wie:

def get_document_path(item_id: str) -> Path:
    prefix = item_id[:2]
    return Path("kb/items/documents") / prefix / f"doc_{item_id}.pdf"
→ deterministisch, kein Lookup nötig

9. Skalierung
Mit 2-stelligem Prefix:

256 Ordner

bei 100k Dateien → ~390 Dateien pro Ordner

Perfekt.

Mit 3-stellig:

4096 Ordner

noch feiner

10. Wichtig: DB bleibt führend
Du suchst nie im Filesystem:

nicht per Explorer

nicht per grep

Immer:

DB → Item → Pfad

🧠 Kurzfassung
Lösung: technische Partitionierung nach ID (z. B. erste 2 Zeichen)

Nicht:

Thema

Projekt

Datum

Meine klare Empfehlung
👉 Nutze 2-stellige Hash/ID-Partitionierung pro Item-Typ

Das ist:

simpel

robust

skalierbar

komplett unabhängig von Fachlogik

Frage 1
Wie willst du IDs generieren?

a) UUID (klassisch, einfach)
b) ULID (sortierbar nach Zeit, sehr gut für dich)
c) kurzer Hash aus Inhalt (content-based)


Ulid klingt spannend 

Ja, ULID passt sehr gut zu deinem Ansatz.

Es hat für deine KB ein paar echte Vorteile gegenüber UUID.

Warum ULID hier gut ist
1. Zeitlich sortierbar
ULIDs enthalten einen Zeitanteil. Dadurch sind neue Items auch ohne extra Logik grob chronologisch sortierbar.

Das ist praktisch für:

Import-Reihenfolge

neueste Dokumente zuerst

Debugging

Filesystem-Ansicht

DB-Indexe

Eine UUID ist zufälliger und dafür schlechter lesbar.

2. Eindeutig genug
Für deine persönliche KB ist die Kollisionswahrscheinlichkeit praktisch kein Thema.

3. Relativ kompakt und gut lesbar
ULIDs sehen zum Beispiel so aus:

01HTQW4K8J7P6M2Y9C3D1F5A8B
Das ist immer noch nicht “schön”, aber besser nutzbar als viele andere Formate.

4. Gute Basis für Dateinamen
Du kannst damit sauber Dateinamen bauen:

doc_01HTQW4K8J7P6M2Y9C3D1F5A8B_bosch_series6.pdf
note_01HTQW7F1M3N8A4X2K9C6D5E1_washing_machine_research.md
img_01HTQW9N4Z6M1B8D3P7F2K5C0_energy_label.jpg
Wie ich ULID bei dir einsetzen würde
Als globale Item-ID
Jedes Item bekommt genau eine ULID.

Beispiele:

Note

PDF

Bild

Spreadsheet

Die ID ist unabhängig vom Dateityp.

Dateiname
Schema:

<prefix>_<ulid>_<slug>.<ext>
Beispiele:

doc_<ulid>_<slug>.pdf

img_<ulid>_<slug>.jpg

note_<ulid>_<slug>.md

sheet_<ulid>_<slug>.xlsx

Der slug ist optional, aber hilfreich.

Wie die Ordnerstruktur dann aussieht
Mit deiner Partitionierungsidee zum Beispiel:

kb/
  items/
    documents/
      01/
        doc_01HTQW4K8J7P6M2Y9C3D1F5A8B_bosch_series6.pdf
      01/
        doc_01HTQW5R3T9N4A7K2M8D6C1F0_samsung_offer.pdf

    notes/
      01/
        note_01HTQW7F1M3N8A4X2K9C6D5E1_washing_machine_research.md
Dabei würde ich nicht nur die ersten 2 Zeichen der ganzen ULID nehmen, weil die bei zeitnah erzeugten IDs zu ähnlich sein können.

Besser:

entweder aus einem Hash über die ULID ableiten

oder ein späteres Segment nutzen

Praktischer
Nimm für die Partitionierung z. B. Zeichen 9–10 oder 11–12 der ULID.

Beispiel:

bucket = ulid[10:12].lower()
Dann verteilen sich Dateien besser.

Wichtiger Punkt: ULID ist ID, nicht Bedeutung
Die ULID soll nur:

eindeutig sein

sortierbar sein

stabil sein

Nicht:

Typ kodieren

Fachlogik enthalten

Datum lesbar ausdrücken

Projekt oder Thema enthalten

Das passt perfekt zu deinem Designprinzip.

Empfehlung für deine KB
Ich würde konkret so vorgehen:

In der DB
items.id = ULID als Text

Im Filesystem
Dateiname mit Präfix + ULID + Slug

In Links
Immer nur die ULID referenzieren

In der UI
Menschen sehen vor allem:

Titel

Typ

Klassifikation

Labels

Die ULID ist eher technische Identität.

Kleines Beispiel
Waschmaschinen-Recherche
id = 01HTQW7F1M3N8A4X2K9C6D5E1

item_kind = note

classification = research

Datei:

kb/items/notes/N8/note_01HTQW7F1M3N8A4X2K9C6D5E1_washing_machine_research.md
Angebots-PDF
id = 01HTQW9N4Z6M1B8D3P7F2K5C0

item_kind = document

classification = offer

Datei:

kb/items/documents/M1/doc_01HTQW9N4Z6M1B8D3P7F2K5C0_bosch_offer.pdf
Meine klare Empfehlung
Ja, nimm ULID als primäre Item-ID.
Für deine KB ist das wahrscheinlich besser als UUID.

Zusätzlich würde ich:

ULID als DB-ID verwenden

Dateinamen daraus ableiten

Partitionierungsordner aus einem mittleren ULID-Segment ableiten

keine Bedeutung in die ID kodieren

Frage 1
Welchen Teil soll ich als Nächstes konkret machen?

a) konkretes Dateinamenschema + Ordnerregel
b) SQLite-Schema mit ULID als Primärschlüssel
c) Python-Beispiel zum Erzeugen von ULIDs und Dateiablage


Wie eäre es mit einem counter? Z.b. 7 mit Ziffern und Buchstaben? Kürzer.

Kurz gesagt: Ja, ein Counter kann funktionieren – aber nur, wenn du ihn sauber implementierst.
Ansonsten handelst du dir genau die Probleme ein, die du mit ULID vermeidest.

Ich gebe dir eine klare Bewertung.

🔍 Option: Counter-basierte IDs (Base36 o.ä.)
Beispiel:

0000001
0000002
0000003
...
oder kompakter (Base36):

00000A
00000B
00000C
...
✅ Vorteile
1. Sehr kurz
Deutlich kompakter als ULID:

ULID: 01HTQW4K8J7P6M2Y9C3D1F5A8B

Counter Base36: 0001Z3

👉 gut für Dateinamen

2. Lesbar & sortierbar
klare Reihenfolge

einfach nachvollziehbar

3. Deterministisch
Keine Zufälligkeit → gut für Debugging

❌ Nachteile (wichtig)
1. Zentraler Zustand notwendig
Du brauchst:

👉 eine zentrale ID-Vergabe

z. B.:

DB-Sequenz

Locking

Single Writer

Sonst bekommst du:

Kollisionen

Race Conditions

2. Schlechter bei verteilten Systemen
ULID kann überall generiert werden.

Counter braucht:

zentrale Instanz

oder Synchronisation

3. Leaks von Reihenfolge
Man sieht sofort:

wie viele Items existieren

Reihenfolge der Erstellung

Für privat meist egal.

4. Refactoring schwieriger
Wenn du später:

Daten importierst

mehrere Quellen zusammenführst

→ Counter kollidiert oder wird unschön

🧠 Für dein Setup entscheidend
Du baust:

lokal

single-user

SQLite

kontrollierter Import

👉 Das ist perfekt für Counter.

🧩 Empfohlene Umsetzung (wenn Counter)
Base36 + feste Länge
Warum:

kompakt

lesbar

sortierbar

Beispiel:

00001A
00001B
00001C
Oder etwas länger:

0000A3F
SQLite Sequenz
Tabelle:

CREATE TABLE id_sequence (
  id INTEGER PRIMARY KEY AUTOINCREMENT
);
Oder einfach:

CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ...
);
Dann:

👉 ID → Base36 encoden

Python Beispiel
def to_base36(num: int) -> str:
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    while num:
        num, i = divmod(num, 36)
        result = chars[i] + result
    return result or "0"

def format_id(num: int) -> str:
    return to_base36(num).rjust(6, "0")
📁 Dateiname
doc_0001A3_bosch_offer.pdf
note_0001A4_washing_machine.md
📂 Ordnerpartitionierung
Du kannst weiterhin:

bucket = id_str[:2]
oder besser:

bucket = id_str[-2:]
🔄 Vergleich zu ULID
Kriterium	ULID	Counter
Komplexität	niedrig	mittel
Lesbarkeit	mittel	hoch
Länge	lang	kurz
verteilt	sehr gut	schlecht
lokal	gut	sehr gut
Debugging	ok	sehr gut
Kollisionen	praktisch keine	möglich (bei Fehlern)
🧠 Meine klare Empfehlung für dich
Basierend auf deinem Setup:

👉 Counter + Base36 ist völlig valide und sogar angenehm

ABER nur wenn:

du immer über deine App gehst

keine parallelen Writer hast

keine externen Imports ohne Mapping machst

⚠️ Wann du NICHT Counter nehmen solltest
mehrere Clients gleichzeitig

Sync / Cloud geplant

Import aus mehreren Quellen

später Multi-User

offline + merge Szenarien

Dann → ULID besser

💡 Hybrid (sehr interessant)
Du kannst auch:

👉 intern Counter
👉 extern ULID (oder umgekehrt)

Oder:

👉 Counter als „Short ID“
👉 ULID als stabile globale ID

Beispiel:

id = 01HTQW...
short_id = 0001A3
🧠 Fazit
Counter ist für dich praktisch und ergonomisch

ULID ist robuster und zukunftssicherer

👉 Für dein aktuelles Ziel:

Counter (Base36, fixed length) ist absolut okay und wahrscheinlich angenehmer.

Frage 1
Wie wichtig ist dir Zukunftssicherheit vs. Einfachheit?

a) maximal einfach & lokal → Counter
b) etwas komplexer, aber robust → ULID
c) beides → Hybrid (ULID + short counter)


Dann bleiben wir bei ulid 

Gute Entscheidung — für dein Setup ist ULID die sauberste, robusteste Basis.
Du vermeidest damit spätere Migrationen und bleibst maximal flexibel.

Ich mache dir jetzt die konkrete, umsetzbare Konvention, damit du nicht jedes Mal neu überlegen musst.

🔑 1. Finales ID-Konzept
ULID als einzige ID
global eindeutig

in DB und Filesystem identisch

keine zweite ID nötig

01HTQW4K8J7P6M2Y9C3D1F5A8B
📁 2. Finales Dateinamenschema
Ich würde das exakt so festlegen:

<prefix>_<ulid>_<slug>.<ext>
Prefix je Typ
note_

doc_

img_

sheet_

Beispiele
doc_01HTQW9N4Z6M1B8D3P7F2K5C0_bosch_offer.pdf
note_01HTQW7F1M3N8A4X2K9C6D5E1_washing_machine_research.md
img_01HTQW9P8C3N7K5A1D6F2M4E_energy_label.jpg
👉 Slug optional, aber sehr hilfreich

📂 3. Ordnerstruktur mit ULID
Wichtig: nicht erste Zeichen nehmen → Zeitcluster

Empfehlung: mittlere Zeichen verwenden
bucket = ulid[10:12].lower()
Ergebnis
kb/
  items/
    documents/
      m1/
        doc_01HTQW9N4Z6M1B8D3P7F2K5C0_bosch_offer.pdf

    notes/
      n8/
        note_01HTQW7F1M3N8A4X2K9C6D5E1_washing_machine.md

    images/
      7k/
        img_01HTQW9P8C3N7K5A1D6F2M4E_energy_label.jpg
👉 gleichmäßige Verteilung
👉 keine Fachlogik

🧠 4. Wo die ULID überall genutzt wird
In der DB
items.id = ULID
In Dateinamen
→ direkt enthalten

In Links
from_item_id → to_item_id
In Markdown (optional)
related: [01HTQW9N4Z6M1B8D3P7F2K5C0]
⚙️ 5. Generierung (Python mit uv)
Du nutzt ja uv, daher:

uv add ulid-py
Beispiel
import ulid

def new_id() -> str:
    return str(ulid.new())
📦 6. Dateiablage-Funktion
Das ist der wichtigste Baustein:

from pathlib import Path
import ulid

BASE = Path("kb/items")

def get_bucket(u: str) -> str:
    return u[10:12].lower()

def store_file(src_path: Path, kind: str, prefix: str, slug: str) -> Path:
    uid = str(ulid.new())
    bucket = get_bucket(uid)

    ext = src_path.suffix.lower()
    filename = f"{prefix}_{uid}_{slug}{ext}"

    target_dir = BASE / kind / bucket
    target_dir.mkdir(parents=True, exist_ok=True)

    target_path = target_dir / filename
    src_path.rename(target_path)

    return uid, target_path
🧩 7. Warum diese Konvention stark ist
Konsistent
alle Typen gleich behandelt

deterministisch
Pfad jederzeit berechenbar

skalierbar
keine Hotspots

unabhängig von Inhalt
keine Fachlogik im Filesystem

agent-friendly
ID ist überall gleich

⚠️ 8. Zwei Dinge, die du unbedingt vermeiden solltest
❌ ULID in Bedeutung umdeuten
Nicht:

Datum rauslesen

Struktur reininterpretieren

❌ mehrere ID-Systeme
Nicht:

DB-ID ≠ File-ID

👉 immer identisch halten

🧠 9. Optional (sehr sinnvoll später)
Short-ID für UI
Du kannst später anzeigen:

...F5A8B
oder:

K8J7P6
Aber intern bleibt die volle ULID.

🧠 Endfazit
Dein System ist jetzt:

content-zentriert

generisch

ohne Fachlogik im Schema

mit stabiler ID-Schicht (ULID)

skalierbar im Filesystem

Das ist ein sehr sauberes Fundament.

Frage 1
Was möchtest du als nächsten Schritt konkret umsetzen?

a) komplettes SQLite-Schema passend zu diesem Modell
b) Ingestion-Pipeline (PDF → Item + Chunks + Metadaten)
c) kleines CLI-Tool zum Anlegen/Verknüpfen von Items


Ich möchte über multiuser nachdenken. Wie sollte man das umsetzen. Beispielsweise gibt es Themen für mich, Themen für meine Frau und Themen für uns beider oder explizit für unseren Sohn.

Dann musst du Multiuser nicht als technische Benutzerverwaltung zuerst, sondern als Sichtbarkeits-, Besitz- und Kontextmodell denken.

Sonst baust du zu früh „Accounts“, obwohl dein eigentliches Problem ist:

wem gehört ein Item

wen betrifft es

wer darf es sehen

wer darf es bearbeiten

in welchem Kontext gilt es

Für deinen Fall würde ich nicht mit klassischem „jeder User hat seine Daten“ starten, sondern mit einem Shared-KB-Modell mit Principals, Spaces und Access Rules.

Die richtige Denkweise
Du hast nicht nur Personen, sondern mehrere Kontexte:

nur du

nur deine Frau

ihr beide gemeinsam

euer Sohn

evtl. ganze Familie

Das sind nicht einfach User, sondern Adressaten- und Verantwortungsräume.

Deshalb würde ich drei Ebenen trennen:

1. Personen
Reale Menschen:

Heiko

Frau

Sohn

2. Gruppen / Haushaltskontexte
Gemeinsame Kontexte:

Paar

Familie

Eltern für Sohn

3. Berechtigungen / Rollen
Wer darf:

sehen

bearbeiten

verwalten

teilen

Mein klarer Vorschlag
Kernidee
Jedes Item bekommt keinen festen Owner nur im Sinne eines einzelnen Users, sondern mehrere zuordenbare Aspekte:

created_by: wer hat es angelegt

owned_by oder responsible_principal: wem gehört/verantwortet das Thema

visibility_scope: wer darf es sehen

subject_principals: wen betrifft das Item inhaltlich

Das ist viel mächtiger.

Beispiel Waschmaschinen-Recherche
angelegt von: Heiko

sichtbar für: Paar

betrifft: Haushalt / beide

bearbeitbar von: Heiko und Frau

Beispiel Gehaltsabrechnung von dir
angelegt von: Heiko

sichtbar für: nur Heiko

betrifft: Heiko

bearbeitbar von: nur Heiko

Beispiel Kinderarzt-Dokument
angelegt von: Frau

sichtbar für: Heiko + Frau

betrifft: Sohn

bearbeitbar von: Heiko + Frau

Genau dafür brauchst du ein separates Modell.

Nicht so modellieren
Schlecht
Ordner heiko/, frau/, sohn/, gemeinsam/

oder feste Tabellenspalte owner_user_id und fertig

Das ist zu grob und wird schnell unbrauchbar.

Denn viele Dinge sind:

von dir erstellt

betreffen euren Sohn

sichtbar für euch beide

Ein einziges owner_user_id reicht dafür nicht.

Besseres Modell
A. principals
Ein Principal ist jede Entität, die Träger von Rechten oder Bezügen sein kann.

Beispiele:

Person: Heiko

Person: Frau

Person: Sohn

Gruppe: Paar

Gruppe: Familie

Gruppe: Eltern-von-Sohn

Also nicht nur Menschen.

Typische Felder:

id

principal_type = person | group | service

name

slug

is_active

B. principal_memberships
Mitgliedschaften in Gruppen.

Beispiele:

Heiko ∈ Paar

Frau ∈ Paar

Heiko ∈ Familie

Frau ∈ Familie

Sohn ∈ Familie

Heiko ∈ Eltern-von-Sohn

Frau ∈ Eltern-von-Sohn

Damit kannst du Gruppen flexibel bauen.

C. items
Wie bisher, aber ergänzt um:

created_by_principal_id

Nur für Historie, nicht für Zugriffslogik.

D. item_acl
Access Control List pro Item.

Zum Beispiel:

item_id

principal_id

permission

view

edit

manage

granted_by

granted_at

Beispiel:
Gehaltsabrechnung:

Heiko → view

Heiko → edit

Frau → nichts

Kinderdokument:

Heiko → view/edit

Frau → view/edit

Sohn → evtl. nichts oder view später

E. item_subjects
Wen betrifft das Item inhaltlich.

Das ist extrem wichtig und etwas anderes als Berechtigung.

Beispiel:

Gehaltsnachweis betrifft Heiko

Waschmaschinen-Recherche betrifft Paar oder Familie

Schulbescheinigung betrifft Sohn

Felder:

item_id

principal_id

relation_type

concerns

owned_by

managed_for

about

So kannst du ausdrücken:

Dokument betrifft Sohn

Eltern verwalten es

nur Eltern dürfen es sehen

Das ist sauber.

Die wichtigste Trennung
Du brauchst mindestens diese 4 Rollenbegriffe:

1. created_by
Wer hat es angelegt?

2. visible_to
Wer darf es sehen?

3. editable_by
Wer darf es ändern?

4. concerns
Wen betrifft der Inhalt?

Diese 4 Dinge sind nicht dasselbe.

Konkrete Beispiele
Fall 1: Dein Einkommensnachweis
created_by = Heiko

visible_to = Heiko

editable_by = Heiko

concerns = Heiko

Fall 2: Gemeinsame Waschmaschinen-Recherche
created_by = Heiko

visible_to = Paar

editable_by = Paar

concerns = Paar oder Familie

Fall 3: Schulunterlagen vom Sohn
created_by = Frau

visible_to = Eltern-von-Sohn

editable_by = Eltern-von-Sohn

concerns = Sohn

Fall 4: Persönliche Gesundheitsnotiz deiner Frau
created_by = Frau

visible_to = Frau

editable_by = Frau

concerns = Frau

Wie das im UI aussehen sollte
Nicht zuerst komplizierte Rollenverwaltung, sondern einfache Auswahlfelder:

Beim Anlegen eines Items:
Sichtbarkeit
nur ich

meine Frau

wir beide

Familie

Eltern für Sohn

benutzerdefiniert

Betrifft
mich

meine Frau

uns beide

unseren Sohn

Familie

Bearbeitung
nur ich

Sichtbarkeitsgruppe darf bearbeiten

benutzerdefiniert

Das reicht für einen guten Start.

Dateisystem-Frage bei Multiuser
Auch hier gilt:

👉 keine fachliche oder personenspezifische Filesystem-Struktur als Hauptmechanismus

Also nicht:

items/documents/heiko/...

items/documents/frau/...

items/documents/sohn/...

Warum nicht?
Weil ein Dokument mehrere Personen betreffen kann.

Das Dateisystem bleibt technisch neutral:

nach item_kind

nach ULID-Bucket

Die Nutzer-/Gruppenlogik bleibt in der DB.

Labels vs Berechtigungen
Ganz wichtig:

family/children/school ist ein Label

„sichtbar für Eltern-von-Sohn“ ist eine Berechtigung

„betrifft Sohn“ ist eine inhaltliche Relation

Diese drei Dinge darfst du nicht vermischen.

Empfehlung für dein Datenmodell
Ich würde dein bisheriges Modell um genau diese Bausteine erweitern:

Neue Tabellen
principals

principal_memberships

item_acl

item_subjects

Optional später:

spaces

space_memberships

Brauchst du zusätzlich „Spaces“?
Ja, wahrscheinlich später sehr sinnvoll.

Ein Space ist ein logischer Arbeitsraum, z. B.:

Heiko privat

Frau privat

Haushalt

Sohn

Familie

Ein Item kann genau einem primären Space zugeordnet sein, zusätzlich aber ACLs haben.

Das ist nützlich für:

Navigation

Default-Filter

Startseiten

getrennte Ansichten

Aber:
Spaces sind UI-/Navigationslogik, nicht die eigentliche Sicherheit.

Ich würde daher:

Rechte über item_acl

Kontext/Navigation über spaces

machen.

Mein pragmatischer Start für Multiuser
Phase 1
Nur diese Konzepte:

principals

principal_memberships

item_acl

item_subjects

Das reicht schon weit.

Phase 2
Zusätzlich spaces:

persönlicher Bereich

gemeinsamer Bereich

Sohn-Bereich

Phase 3
Optional:

Vererbung

Vorlagen

Standardregeln

Freigabe-Workflows

Beispiel-Set für eure Familie
Principals
Heiko

Frau

Sohn

Paar

Familie

Eltern-von-Sohn

Memberships
Heiko → Paar

Frau → Paar

Heiko → Familie

Frau → Familie

Sohn → Familie

Heiko → Eltern-von-Sohn

Frau → Eltern-von-Sohn

Standardregeln
private Finanzdokumente → nur jeweilige Person

Haushaltskäufe → Paar

Kinderdokumente → Eltern-von-Sohn

allgemeine Familienunterlagen → Familie

Das ist sehr nah an deinem realen Use Case.

Meine klare Empfehlung
Für deinen Multiuser-Fall würde ich nicht user-zentriert, sondern principal-zentriert modellieren:

Personen und Gruppen als principals

Berechtigungen pro Item über ACL

inhaltliche Betroffenheit separat speichern

Dateisystem neutral halten

optional Spaces für Navigation

Das ist deutlich sauberer als „mein Ordner / ihr Ordner / Sohn-Ordner“.

Frage 1
Welchen Teil soll ich als Nächstes konkret ausarbeiten?

a) konkretes SQLite-Schema für principals, memberships, acl, subjects
b) einfaches Berechtigungsmodell für den Alltag ohne Overengineering
c) Beispiele mit 15 echten Familien-Items und deren Sichtbarkeitslogik


Nun fasse unsere Erkenntnisse zusammen. Das komplette Schema für alle Tabellen inkl. Dem principal Ansatz. Gib mir die Tabellen für alle Auswahlfelder die Anfang schon bekannt sind (types, categories, labels, ...). The start file system structure including the inbox principle with "project folders".

Hier ist die konsolidierte Zielarchitektur für deine persönliche Knowledge Base — generisch, content-zentriert, ohne Fachlogik im Kernschema, mit ULID, Principal-Ansatz, hierarchischen Labels, Metadatengruppen und Inbox + Projekt-Arbeitsordnern.

1. Designprinzipien
Kernprinzip
Die KB besteht aus wenigen stabilen Basiselementen:

Items als zentrale Einheit

Content Parts für Inhalte und Extrakte

generische Metadaten

konfigurierbare Metadatengruppen

Labels

Links

Principals + ACL für Multiuser

Trennung der Ebenen
Technischer Typ
Was ist das physisch?

note

document

image

spreadsheet

Inhaltliche Klassifikation
Was bedeutet es fachlich?

research

decision

income_document

invoice

offer

bank_statement

school_document

product_document

comparison_table

reference

Zusätzliche Eigenschaften
scanned

ocr_status

summary_status

language

issuer

document_date

etc.

Wichtige Regel
Keine Fachlogik in der Kern-Datenstruktur.
Fachliche Bedeutung entsteht aus:

Kategorien

Metadaten

Labels

Links

Summaries

Agent-/Query-Logik

2. ID-Ansatz
Primärschlüssel
ULID als TEXT

identisch in DB und Dateinamen

Beispiel:

01HTQW4K8J7P6M2Y9C3D1F5A8B
3. Datenmodell – Überblick
Kernobjekte
items

content_parts

item_files

item_links

Metadaten
metadata_groups

metadata_fields

group_fields

item_metadata

Klassifikation / Auswahlwerte
item_kinds

item_categories

content_part_kinds

link_types

label_nodes

Multiuser / Principals
principals

principal_memberships

permissions

item_acl

item_subjects

subject_relation_types

Optionale technische Hilfstabellen
ingestion_runs

saved_queries

4. Komplettes SQLite-Schema
4.1 Auswahlfelder / Stammdaten
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
4.2 Principals / Multiuser
CREATE TABLE principals (
    id TEXT PRIMARY KEY,              -- ULID
    principal_type TEXT NOT NULL,    -- person, group, service
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE principal_memberships (
    principal_id TEXT NOT NULL,
    member_principal_id TEXT NOT NULL,
    role TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (principal_id, member_principal_id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (member_principal_id) REFERENCES principals(id)
);
principal_id ist hier die Gruppe, member_principal_id das Mitglied.

4.3 Items
CREATE TABLE items (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    item_kind TEXT NOT NULL,             -- technical type
    category_key TEXT,                   -- semantic classification
    mime_type TEXT,
    source_path TEXT,                    -- relative file path if applicable
    content_hash TEXT,
    language_code TEXT,
    status TEXT,                         -- draft, active, archived, etc.
    origin TEXT NOT NULL,                -- manual, import, generated
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
4.4 Dateireferenzen
Ein Item kann eine Hauptdatei haben oder mehrere Dateien.

CREATE TABLE item_files (
    id TEXT PRIMARY KEY,                 -- ULID
    item_id TEXT NOT NULL,
    file_role TEXT NOT NULL,             -- primary, attachment, preview, extracted
    relative_path TEXT NOT NULL,
    original_filename TEXT,
    extension TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    checksum_sha256 TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
4.5 Content Parts
CREATE TABLE content_parts (
    id TEXT PRIMARY KEY,                 -- ULID
    item_id TEXT NOT NULL,
    part_kind TEXT NOT NULL,
    sequence_no INTEGER NOT NULL DEFAULT 0,
    page_no INTEGER,
    heading_path TEXT,
    content_text TEXT NOT NULL,
    source_method TEXT NOT NULL,         -- manual, parser, ocr, llm
    quality_score REAL,
    token_count INTEGER,
    language_code TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (part_kind) REFERENCES content_part_kinds(key)
);
4.6 Links zwischen Items
CREATE TABLE item_links (
    id TEXT PRIMARY KEY,                 -- ULID
    from_item_id TEXT NOT NULL,
    to_item_id TEXT NOT NULL,
    link_type TEXT NOT NULL,
    source TEXT NOT NULL,                -- manual, inferred, imported, llm
    confidence REAL,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (from_item_id) REFERENCES items(id),
    FOREIGN KEY (to_item_id) REFERENCES items(id),
    FOREIGN KEY (link_type) REFERENCES link_types(key)
);
4.7 Metadatengruppen und Felder
CREATE TABLE metadata_groups (
    id TEXT PRIMARY KEY,                 -- ULID
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    applies_to_kind TEXT,                -- note/document/image/spreadsheet/any
    version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);

CREATE TABLE metadata_fields (
    id TEXT PRIMARY KEY,                 -- ULID
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL,            -- string, number, date, datetime, boolean, json
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
4.8 Metadatenwerte
CREATE TABLE item_metadata (
    id TEXT PRIMARY KEY,                 -- ULID
    item_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    value_text TEXT,
    value_number REAL,
    value_date TEXT,
    value_datetime TEXT,
    value_bool INTEGER,
    value_json TEXT,
    source TEXT NOT NULL,                -- manual, extracted, inferred, imported
    confidence REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (field_id) REFERENCES metadata_fields(id)
);
Hinweis: genau eine der Value-Spalten sollte pro Datensatz belegt sein.

4.9 Labels
CREATE TABLE label_nodes (
    id TEXT PRIMARY KEY,                 -- ULID
    name TEXT NOT NULL,
    full_path TEXT NOT NULL UNIQUE,      -- finance/income, household/appliances
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
    source TEXT NOT NULL,                -- manual, extracted, inferred
    confidence REAL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, label_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (label_id) REFERENCES label_nodes(id)
);
4.10 ACL / Sichtbarkeit
CREATE TABLE item_acl (
    item_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    permission_key TEXT NOT NULL,        -- view, edit, manage
    granted_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, principal_id, permission_key),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (permission_key) REFERENCES permissions(key),
    FOREIGN KEY (granted_by_principal_id) REFERENCES principals(id)
);
4.11 Wen betrifft ein Item?
CREATE TABLE item_subjects (
    item_id TEXT NOT NULL,
    principal_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,         -- concerns, owned_by, managed_for, about
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, principal_id, relation_type),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (relation_type) REFERENCES subject_relation_types(key)
);
4.12 Ingestion Runs
CREATE TABLE ingestion_runs (
    id TEXT PRIMARY KEY,                 -- ULID
    item_id TEXT NOT NULL,
    run_type TEXT NOT NULL,              -- import, parse, ocr, classify, summarize
    tool_name TEXT,
    tool_version TEXT,
    status TEXT NOT NULL,                -- success, failed, partial
    started_at TEXT NOT NULL,
    finished_at TEXT,
    note TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
4.13 Saved Queries
CREATE TABLE saved_queries (
    id TEXT PRIMARY KEY,                 -- ULID
    title TEXT NOT NULL,
    query_json TEXT NOT NULL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);
5. Inhalte für die Auswahlfelder zum Start
5.1 item_kinds
INSERT INTO item_kinds (key, label, description) VALUES
('note', 'Note', 'Markdown note or knowledge item'),
('document', 'Document', 'PDF or other document file'),
('image', 'Image', 'Image, scan, screenshot, photo'),
('spreadsheet', 'Spreadsheet', 'Spreadsheet file such as xlsx or csv'),
('summary', 'Summary', 'Standalone summary item if needed');
5.2 item_categories
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
('product_document', 'Product Document', 'Datasheet, manual, offer, specification', 'document'),
('contract_document', 'Contract Document', 'Contract or agreement', 'document'),

('scan', 'Scan', 'Scanned image or photo of a document', 'image'),
('screenshot', 'Screenshot', 'Screenshot image', 'image'),
('photo', 'Photo', 'Regular photo', 'image'),
('product_reference', 'Product Reference', 'Image used as reference in research', 'image'),

('comparison_table', 'Comparison Table', 'Spreadsheet used for comparison', 'spreadsheet'),
('data_table', 'Data Table', 'General spreadsheet data', 'spreadsheet');
Wichtig: scan ist hier nur eine mögliche Kategorie für Images, nicht der technische Haupttyp.

5.3 content_part_kinds
INSERT INTO content_part_kinds (key, label, description) VALUES
('markdown_body', 'Markdown Body', 'Main markdown content'),
('text_chunk', 'Text Chunk', 'Extracted text chunk'),
('ocr_text', 'OCR Text', 'OCR extracted text'),
('summary', 'Summary', 'Manual or generated summary'),
('caption', 'Caption', 'Image description or caption'),
('table_extract', 'Table Extract', 'Extracted table text'),
('keywords', 'Keywords', 'Keywords extracted from content');
5.4 link_types
INSERT INTO link_types (key, label, description, symmetric) VALUES
('related', 'Related', 'General relation between items', 1),
('references', 'References', 'Item references another item', 0),
('attachment', 'Attachment', 'Attached file or supporting item', 0),
('summary_of', 'Summary Of', 'This item or content summarizes another item', 0),
('source_of', 'Source Of', 'This item is source for another item', 0),
('includes', 'Includes', 'Parent includes another item', 0),
('decision_for', 'Decision For', 'Decision item belongs to a research item', 0),
('duplicate_of', 'Duplicate Of', 'Potential duplicate relation', 1),
('derived_from', 'Derived From', 'Generated or extracted from another item', 0);
5.5 permissions
INSERT INTO permissions (key, label, description) VALUES
('view', 'View', 'Can view item'),
('edit', 'Edit', 'Can edit item'),
('manage', 'Manage', 'Can manage permissions and metadata');
5.6 subject_relation_types
INSERT INTO subject_relation_types (key, label, description) VALUES
('concerns', 'Concerns', 'The item concerns this principal'),
('owned_by', 'Owned By', 'The item is owned by this principal'),
('managed_for', 'Managed For', 'The item is managed on behalf of this principal'),
('about', 'About', 'The item is about this principal');
6. Metadatengruppen und Felder zum Start
6.1 Metadatengruppen
Empfohlene Gruppen:

general

classification

document_details

review

research

finance_income

finance_bank_statement

offers

Beispiel:

INSERT INTO metadata_groups (id, key, label, description, applies_to_kind, version, is_active, created_at, updated_at) VALUES
('G_GENERAL', 'general', 'General', 'General metadata', NULL, 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_CLASSIFICATION', 'classification', 'Classification', 'Classification and semantic descriptors', NULL, 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_DOCUMENT_DETAILS', 'document_details', 'Document Details', 'General document metadata', 'document', 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_REVIEW', 'review', 'Review', 'Review and quality metadata', NULL, 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_RESEARCH', 'research', 'Research', 'Research-specific metadata', 'note', 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_FINANCE_INCOME', 'finance_income', 'Finance Income', 'Income document metadata', 'document', 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_FINANCE_BANK', 'finance_bank_statement', 'Finance Bank Statement', 'Bank statement metadata', 'document', 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('G_OFFERS', 'offers', 'Offers', 'Offer or quotation metadata', 'document', 1, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z');
Praktisch würde man für diese IDs auch ULIDs verwenden. Oben nur symbolisch.

6.2 Metadatenfelder zum Start
Allgemein
document_date

issuer

recipient

is_scanned

ocr_status

summary_status

reviewed_by_user

language_override

Research
research_subject

decision_stage

budget_max

selected_option

comparison_exists

Finance Income
gross_amount

net_amount

currency

payment_date

period_start

period_end

Bank Statement
bank_name

account_reference

statement_period_start

statement_period_end

Offers
vendor

offer_number

valid_until

total_amount

Beispiel:

INSERT INTO metadata_fields (id, key, label, description, value_type, applies_to_kind, is_multivalue, is_system, is_active, created_at, updated_at) VALUES
('F_DOCUMENT_DATE', 'document_date', 'Document Date', 'Date of the document', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_ISSUER', 'issuer', 'Issuer', 'Issuer or sender', 'string', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_RECIPIENT', 'recipient', 'Recipient', 'Recipient of the document', 'string', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_IS_SCANNED', 'is_scanned', 'Is Scanned', 'Whether the item is scanned', 'boolean', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_OCR_STATUS', 'ocr_status', 'OCR Status', 'OCR processing status', 'string', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_SUMMARY_STATUS', 'summary_status', 'Summary Status', 'Summary presence or processing status', 'string', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_REVIEWED', 'reviewed_by_user', 'Reviewed By User', 'Whether user reviewed the item', 'boolean', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_LANGUAGE_OVERRIDE', 'language_override', 'Language Override', 'Manually set language', 'string', NULL, 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),

('F_RESEARCH_SUBJECT', 'research_subject', 'Research Subject', 'Main subject of research', 'string', 'note', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_DECISION_STAGE', 'decision_stage', 'Decision Stage', 'Stage of decision process', 'string', 'note', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_BUDGET_MAX', 'budget_max', 'Budget Max', 'Maximum budget', 'number', 'note', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_SELECTED_OPTION', 'selected_option', 'Selected Option', 'Chosen option or product', 'string', 'note', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_COMPARISON_EXISTS', 'comparison_exists', 'Comparison Exists', 'Whether a comparison table exists', 'boolean', 'note', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),

('F_GROSS_AMOUNT', 'gross_amount', 'Gross Amount', 'Gross amount', 'number', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_NET_AMOUNT', 'net_amount', 'Net Amount', 'Net amount', 'number', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_CURRENCY', 'currency', 'Currency', 'Currency code', 'string', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_PAYMENT_DATE', 'payment_date', 'Payment Date', 'Payment date', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_PERIOD_START', 'period_start', 'Period Start', 'Start of covered period', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_PERIOD_END', 'period_end', 'Period End', 'End of covered period', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),

('F_BANK_NAME', 'bank_name', 'Bank Name', 'Bank name', 'string', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_ACCOUNT_REFERENCE', 'account_reference', 'Account Reference', 'Bank account reference', 'string', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_STATEMENT_PERIOD_START', 'statement_period_start', 'Statement Period Start', 'Bank statement period start', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_STATEMENT_PERIOD_END', 'statement_period_end', 'Statement Period End', 'Bank statement period end', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),

('F_VENDOR', 'vendor', 'Vendor', 'Vendor or supplier', 'string', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_OFFER_NUMBER', 'offer_number', 'Offer Number', 'Offer number', 'string', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_VALID_UNTIL', 'valid_until', 'Valid Until', 'Offer validity end date', 'date', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z'),
('F_TOTAL_AMOUNT', 'total_amount', 'Total Amount', 'Total amount', 'number', 'document', 0, 0, 1, '2026-04-07T00:00:00Z', '2026-04-07T00:00:00Z');
7. Label-Vorschläge zum Start
Struktur
Hierarchische Labels, klein anfangen:

finance

finance/income

finance/banking

finance/tax

finance/offers

family

family/children

family/children/school

family/children/medical

household

household/appliances

household/contracts

shopping

shopping/research

shopping/major_purchase

work

health

insurance

Wichtig:
Labels sind Navigation und Kontext, nicht Sicherheit und nicht harte Semantik.

8. Principal-Ansatz konkret
Principals zum Start
Heiko

Frau

Sohn

Paar

Familie

Eltern-von-Sohn

Beispiel
Einkommensnachweis von dir
created_by = Heiko

ACL: Heiko view/edit/manage

Subjects: Heiko concerns, Heiko owned_by

Waschmaschinen-Recherche
created_by = Heiko

ACL: Paar view/edit

Subjects: Paar concerns oder Familie concerns

Schulschreiben des Sohns
created_by = Frau

ACL: Eltern-von-Sohn view/edit

Subjects: Sohn concerns

Das ist der richtige Weg.

9. Start-Filesystem-Struktur
Das Filesystem bleibt technisch und neutral.
Bedeutung liegt in DB, nicht im Ordnerbaum.

Zielstruktur
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
      a1/
      b4/
    documents/
      a1/
      b4/
    images/
      a1/
      b4/
    spreadsheets/
      a1/
      b4/
    summaries/
      a1/
      b4/

  exports/
  db/
    kb.sqlite
  logs/
Bedeutung der Ordner
inbox/raw/
Neue, unsortierte Eingänge:

Downloads

Scans

manuell kopierte PDFs

Bilder

Excel-Dateien

inbox/processing/
Dateien, die gerade importiert / geparsed / klassifiziert werden.

inbox/rejected/
Dateien, die nicht importiert wurden oder Fehler erzeugt haben.

workspaces/projects/
Arbeitsordner, nicht Source of Truth.

Zum Beispiel:

kb/workspaces/projects/washing-machine-research/
kb/workspaces/projects/tax-2026/
Hier dürfen temporär liegen:

manuell erstellte Notizen

Entwürfe

Downloads während Recherche

Zwischenstände

Aber:
Nach Import landen echte Items in kb/items/...

workspaces/reviews/
Temporäre Review-Arbeitsverzeichnisse:

OCR prüfen

Metadaten prüfen

Duplikate prüfen

items/...
Der eigentliche, stabile Bestand.

10. Inbox-Prinzip mit Projektordnern
Das ist der saubere Kompromiss.

Regel
Dauerhafter Bestand
Immer unter:

kb/items/...

Temporäre Arbeit
Darf unter:

kb/inbox/...

kb/workspaces/projects/...

liegen.

Beispiel Waschmaschinen-Recherche
Temporär
kb/workspaces/projects/washing-machine-research/
  notes_draft.md
  bosch_offer_download.pdf
  samsung_screenshot.png
  comparison.xlsx
Nach Import
kb/items/notes/m1/note_<ULID>_washing-machine-research.md
kb/items/documents/k8/doc_<ULID>_bosch_offer.pdf
kb/items/images/p4/img_<ULID>_samsung_screenshot.png
kb/items/spreadsheets/r2/sheet_<ULID>_comparison.xlsx
Und die Beziehungen sind dann in der DB.

Das ist genau richtig:

pragmatisches Arbeiten

saubere langfristige Ablage

11. Bucket-Regel im Filesystem
Um 10k Dateien in einem Ordner zu vermeiden:

Dateiname
<prefix>_<ULID>_<slug>.<ext>
Beispiele:

doc_01HTQW9N4Z6M1B8D3P7F2K5C0_bosch_offer.pdf

note_01HTQW7F1M3N8A4X2K9C6D5E1_washing_machine_research.md

Bucket
Nicht die ersten Zeichen der ULID, sondern ein mittleres Segment.

Empfehlung:

Ordnername = ulid[10:12].lower()

Beispiel:

kb/items/documents/m1/doc_<ULID>_bosch_offer.pdf
12. Was in Markdown-Dateien selbst drinstehen sollte
Für Notes als Markdown:

kurzer YAML-Header optional

aber nicht die ganze Wahrheit dort hineinpressen

Empfehlung:
nur leichte, nützliche Infos:

---
id: 01HTQW7F1M3N8A4X2K9C6D5E1
title: Waschmaschine Kaufrecherche 2026
item_kind: note
category: research
---

# Ziel
...

# Anforderungen
...

# Kandidaten
...
Die DB bleibt führend für:

ACL

Labels

zusätzliche Metadaten

Links

Content Parts

Ingestion-Status

13. Startkonfiguration für Auswahlfelder im UI
Pflichtfelder beim Anlegen eines Items
Titel

technischer Typ (item_kind)

Datei oder Textinhalt

optional Kategorie

Sichtbarkeit / ACL-Vorlage

betroffene Principals

Zusätzliche Felder
Labels

Metadatengruppe

Scan ja/nein

Zusammenfassung vorhanden

Dokumentdatum

Aussteller

14. Klare Architekturentscheidung
So sollte dein System arbeiten
Filesystem = physische Ablage

SQLite = Struktur, Metadaten, Beziehungen, Sicherheit

Agent = liest über Tools/API/MCP

Workspaces/Inbox = temporäre Arbeitsräume

items/... = dauerhafter Bestand

So sollte es nicht arbeiten
keine Fachlogik im Kernschema

keine Ordner nach Person/Thema als Hauptmodell

keine Domain-Tabellen pro Use Case

keine reinen JSON-Metadaten ohne Felddefinition

keine Labels als Ersatz für ACL

15. Mein Fazit
Dein Modell ist jetzt konsistent:

wenige Basiselemente

technischer Typ getrennt von inhaltlicher Klassifikation

erweiterbare Metadatengruppen

hierarchische Labels

Summaries als Content Parts

ULID als stabile Identität

Principal-basiertes Multiuser-Modell

Inbox + Projekt-Arbeitsordner

dauerhafter Bestand in technischer, neutraler Filesystem-Struktur

Das ist ein sehr tragfähiges Fundament.

Im nächsten Schritt würde ich daraus entweder ein konkretes schema.sql oder direkt ein Python-Projekt mit SQLite + uv + Import-CLI machen.


Bei den beispielwerten gibt es viele Doppelungen wegen Groß- und Kleinschreibung (Research und  research). Warum das? Möchte ich an der Stelle nicht Möglichkeit einseitig sein?

Ja — da hast du recht. Das sollte einheitlich sein.

Die Doppelung kommt daher, dass ich in den Beispielen zwei verschiedene Ebenen gemischt habe:

technischer Schlüssel: z. B. research

Anzeigetext/Label: z. B. Research

Das ist absichtlich oft so gemacht, aber für dein System würde ich es strenger definieren.

Meine klare Empfehlung
Du solltest an diesen Stellen genau eine kanonische Form haben — und zwar für die Schlüsselwerte.

Regel
1. Interne Schlüssel
Immer:

klein

snake_case

stabil

sprachneutral möglichst Englisch

Beispiele:

research

income_document

bank_statement

comparison_table

Diese Werte gehören in:

item_kinds.key

item_categories.key

content_part_kinds.key

link_types.key

permissions.key

subject_relation_types.key

metadata_groups.key

metadata_fields.key

2. Anzeige-Label
Frei davon getrennt:

Research

Income Document

Bank Statement

Oder später auch lokalisiert:

Deutsch: Recherche

Englisch: Research

Das gehört nur in label oder in eine eigene Übersetzungstabelle.

Warum das wichtig ist
Wenn du nicht strikt trennst, bekommst du später Probleme mit:

Filtern

API-Queries

Migrationen

UI-Lokalisierung

doppelten Einträgen

unsauberen Vergleichen

Also nicht:

mal Research

mal research

mal RESEARCH

Sondern intern genau ein Wert:

research

Die richtige Semantik
Beispiel item_categories
So ist es sauber:

key	label
research	Research
decision	Decision
income_document	Income Document
Der Code und die DB arbeiten mit key.
Die UI zeigt label.

Willst du dort Mehrdeutigkeit oder Einseitigkeit?
Du willst an dieser Stelle eindeutig Einheitlichkeit, nicht Mehrseitigkeit.

Genauer:

Eindeutig sein sollten:
Schlüssel

Referenzen

Fremdschlüsselwerte

Query-Werte

Flexibel sein dürfen:
Anzeige

Sprache

Beschreibung

Sortierung im UI

Noch strenger: ich würde label sogar nicht als technische Wahrheit sehen
Für dein System würde ich intern immer sagen:

key ist Wahrheit

label ist Präsentation

Das ist die saubere Richtung.

Was ich konkret anpassen würde
Für alle Auswahlwert-Tabellen
Immer so:

CREATE TABLE item_categories (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    applies_to_kind TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (applies_to_kind) REFERENCES item_kinds(key)
);
Mit Daten wie:

INSERT INTO item_categories (key, label, description, applies_to_kind) VALUES
('research', 'Research', 'Research note or investigation', 'note'),
('decision', 'Decision', 'Decision note', 'note');
Nicht:

Research als key

gemischte Schreibweisen

UI-Wert direkt als technischer Wert

Noch besser: Normalisierungsregel festlegen
Ich würde explizit definieren:

Schlüsselkonvention
lowercase

snake_case

ASCII

keine Leerzeichen

keine Bindestriche

unveränderlich nach Einführung

Beispiele:

product_document

medical_document

summary_of

Nicht:

Product Document

product-document

productDocument

Für Labels und Übersetzungen
Wenn du später Deutsch/Englisch willst, kannst du das sauber erweitern:

Einfach
Eine Spalte label

Besser später
Eine Tabelle wie:

category_translations
- category_key
- language_code
- label
Aber für den Start reicht:

key

label

Mein Urteil zu deiner Frage
Ja, du hast völlig recht:

An der Stelle willst du keine Mehrdeutigkeit.
Die internen Werte müssen konsequent einheitlich sein.

Die Groß-/Kleinschreibungsdifferenz ist nur dann sinnvoll, wenn sie bewusst als Trennung von:

internem Schlüssel

sichtbarem Label

genutzt wird.

Wenn du willst, kann ich dir als Nächstes die komplette Liste aller Tabellen noch einmal bereinigt und konsequent mit kanonischen key-Werten aufschreiben.


Ich Frage mich, ob wir auch Aufgaben und Termine abbilden können ? Oder wiederkehrende Informationen, die dann später direkt mit einer notification ( natürlich aus einer App heraus, nicht hier besprochenen Datenmodell). Wie müssen wir.das Datenmodell für solche Fälle erweitern?

Ja — das kannst du gut integrieren, ohne das Grundmodell kaputt zu machen.

Die wichtigste Entscheidung ist:

Aufgaben, Termine, Erinnerungen und Wiederholungen sollten nicht als völlig fremdes Subsystem gebaut werden, sondern als weitere inhaltliche Objekte auf Basis desselben Modells.

Aber:
Sie brauchen ein paar zusätzliche Strukturen, weil sie sich von statischen Dokumenten/Notizen unterscheiden.

Kurzfassung
Du brauchst für solche Fälle zusätzlich:

planbare Objekte wie Task und Event

Zeitbezug

Zustand

Wiederholungsregeln

Benachrichtigungsregeln

optional Instanzen/Vorkommen

Das kann man sauber erweitern, ohne Fachlogik in die Kernstruktur zu pressen.

1. Wie ich es konzeptionell einordnen würde
Bisher hast du vor allem:

Note

Document

Image

Spreadsheet

Für Aufgaben und Termine gibt es zwei gute Wege:

Variante A — als weitere item_kinds
Also zusätzlich:

task

event

Das ist mein Favorit.

Warum:

technisch wirklich anders

andere Pflichtfelder

andere Views

andere Logik

trotzdem noch generisch genug

Variante B — als normale note mit Kategorie
Also:

item_kind = note

category = task

Das geht, ist aber auf Dauer schwächer, weil:

Statuslogik unsauber

Fälligkeitstermine nur über Metadaten

Recurrence wird hakelig

Benachrichtigungen brauchen doch eigene Struktur

Meine Empfehlung:
Erweitere item_kind um task und event.

2. Was sich dadurch ändert
Dein Kernmodell bleibt gleich:

items

content_parts

item_metadata

labels

links

principals

acl

Dazu kommen planungsbezogene Erweiterungen.

3. Erweiterung von item_kinds
Neu dazu:

task

event

Beispiel:

INSERT INTO item_kinds (key, label, description) VALUES
('task', 'Task', 'Actionable task or to-do'),
('event', 'Event', 'Scheduled event or appointment');
4. Reicht das allein?
Nicht ganz.

Denn Aufgaben und Termine haben typischerweise:

Tasks
status

due date

priority

completion

recurrence

assignee / responsible principal

Events
start

end

all-day

recurrence

attendees / participants

reminder offset

Das kann man teilweise über Metadaten machen, aber nicht alles sollte nur in EAV/Metadaten landen.

Hier ist ein wichtiger Architekturpunkt:

Mein Vorschlag
Behalte den generischen Kern, aber ergänze wenige generische Zeit-/Workflow-Tabellen.

Nicht fachspezifisch, sondern prozessspezifisch.

5. Neue Tabellen, die ich ergänzen würde
A. item_states
Für den aktuellen Zustand planbarer Items.

CREATE TABLE item_states (
    item_id TEXT PRIMARY KEY,
    workflow_type TEXT NOT NULL,      -- task, event, reminder
    state_key TEXT NOT NULL,          -- open, done, cancelled, scheduled, completed
    started_at TEXT,
    completed_at TEXT,
    cancelled_at TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
Warum?
Weil status in items zu allgemein ist.
item_states ist sauberer für aktive Objekte.

B. datetime_properties
Für strukturierte Zeitangaben pro Item.

CREATE TABLE datetime_properties (
    id TEXT PRIMARY KEY,              -- ULID
    item_id TEXT NOT NULL,
    property_key TEXT NOT NULL,       -- due_at, start_at, end_at, remind_at, created_for_date
    value_datetime TEXT NOT NULL,
    timezone TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
Warum?
Weil Aufgaben und Termine mehrere relevante Zeitpunkte haben können:

due_at

start_at

end_at

remind_at

snoozed_until

Das ist strukturierter als freie Metadaten.

C. recurrence_rules
Für Wiederholungen.

CREATE TABLE recurrence_rules (
    id TEXT PRIMARY KEY,              -- ULID
    item_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,          -- rrule, simple
    rule_text TEXT NOT NULL,          -- e.g. RRULE:FREQ=MONTHLY;BYMONTHDAY=1
    anchor_datetime TEXT,
    timezone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
Das ist sehr wichtig.

Denn “wiederkehrende Information” ist meist entweder:

wiederkehrende Aufgabe

wiederkehrender Termin

wiederkehrende Erinnerung

wiederkehrender Review-Zyklus

D. notifications
Für Benachrichtigungsregeln, nicht für die eigentliche Push-Ausführung.

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,              -- ULID
    item_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,  -- reminder, deadline_warning, review_prompt
    trigger_mode TEXT NOT NULL,       -- absolute, relative, recurrence_instance
    relative_to_key TEXT,             -- due_at, start_at, end_at
    offset_minutes INTEGER,
    trigger_at TEXT,
    channel_key TEXT,                 -- in_app, email, push
    is_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
Wichtig:
Das Modell speichert nur die Regel.
Die App kümmert sich später um Scheduling und Push.

E. item_occurrences
Für konkrete Vorkommen aus Wiederholungsregeln.

CREATE TABLE item_occurrences (
    id TEXT PRIMARY KEY,              -- ULID
    parent_item_id TEXT NOT NULL,
    occurrence_start TEXT,
    occurrence_end TEXT,
    due_at TEXT,
    state_key TEXT,                   -- open, done, skipped, cancelled
    generated_at TEXT NOT NULL,
    source_rule_id TEXT,
    FOREIGN KEY (parent_item_id) REFERENCES items(id),
    FOREIGN KEY (source_rule_id) REFERENCES recurrence_rules(id)
);
Das brauchst du, wenn du so etwas willst wie:

monatliche Erinnerung

einzelne Instanz abhaken

einmal überspringen

kommende Termine anzeigen

Ohne Occurrences wird Wiederholung schnell unbrauchbar.

6. Warum nicht alles nur in item_metadata?
Weil Aufgaben und Termine operativ sind.

Mit nur Metadaten würdest du später sehr hässliche Abfragen bauen:

alle offenen Tasks bis nächste Woche

alle Events morgen

alle wiederkehrenden Aufgaben ohne nächste Instanz

alle Notifications in den nächsten 30 Minuten

Das geht mit EAV, aber schlecht.

Deshalb ist hier eine kleine gezielte Spezialisierung sinnvoll — nicht fachlich, sondern verhaltensbezogen.

Das passt zu deinem Designansatz.

7. Wie Aufgaben konkret modelliert würden
Beispiel: “Stromzählerstand melden”
Item
item_kind = task

category = process oder category = household_task falls du das später willst

Titel: Stromzählerstand melden

item_states
workflow_type = task

state_key = open

datetime_properties
due_at = 2026-05-01T18:00:00+02:00

recurrence_rules
RRULE:FREQ=YEARLY;BYMONTH=5;BYMONTHDAY=1

notifications
relative to due_at

offset -1440 Minuten

item_subjects
concerns = pair oder family

ACL
sichtbar/editierbar für euch beide

8. Wie Termine konkret modelliert würden
Beispiel: “Kinderarzttermin”
Item
item_kind = event

category = medical_document wäre falsch
besser eine eigene Event-Kategorie wie appointment

datetime_properties
start_at

end_at

item_subjects
concerns = son

ACL
sichtbar für Eltern-von-Sohn

notifications
24h vorher

2h vorher

9. Wiederkehrende Informationen
Hier muss man unterscheiden.

Typ 1: Wiederkehrende Aufgabe
Beispiel:

Versicherungsunterlagen prüfen

Auto-Check

Waschmaschine Entkalken

Steuerordner vorbereiten

→ item_kind = task

Typ 2: Wiederkehrender Termin
Beispiel:

Elternabend

Arztkontrolle

Müllabholung, wenn du das überhaupt dort pflegen willst

→ item_kind = event

Typ 3: Wiederkehrender Review-Hinweis zu Wissen
Beispiel:

ETF-Strategie jährlich prüfen

Versicherungstarif in 9 Monaten prüfen

Waschmaschinenentscheidung nach 2 Jahren bewerten

Das ist interessant.

Hier würde ich nicht das Wissens-Item selbst in eine Task verwandeln, sondern:

bestehendes Wissens-Item bleibt wie es ist

dazu ein verlinktes task-Item oder review_task

Beispiel:

Note: ETF Strategie

Task: ETF Strategie Jahresreview

Link: decision_for oder besser neuer Linktyp review_for

Das ist sauberer.

10. Welche Auswahlwert-Tabellen du erweitern solltest
item_kinds
ergänzen um:

task

event

item_categories
ergänzen um ein paar Basiskategorien:

Für task:

task_general

review_task

household_task

admin_task

Für event:

appointment

deadline_event

family_event

school_event

Wichtig: klein, generisch, nicht übertreiben.

neue Tabelle workflow_states
Statt freie state_key-Strings würde ich das sauber normalisieren:

CREATE TABLE workflow_states (
    workflow_type TEXT NOT NULL,
    state_key TEXT NOT NULL,
    label TEXT NOT NULL,
    is_terminal INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (workflow_type, state_key)
);
Beispiele:

task/open

task/in_progress

task/done

task/cancelled

event/scheduled

event/completed

event/cancelled

11. Multiuser dabei
Der Principal-Ansatz passt dafür sehr gut.

Beispiele
Persönliche Aufgabe
visible_to = heiko

concerns = heiko

Gemeinsame Aufgabe
visible_to = pair

concerns = pair

Aufgabe für euren Sohn, verwaltet von euch
visible_to = parents_of_son

concerns = son

managed_for = son

Das funktioniert direkt mit deinem bestehenden Modell.

12. Filesystem-Frage dazu
Tasks und Events brauchen meist keine Datei.

Deshalb:

sie existieren primär in der DB

optional mit Markdown-Content-Parts

optional mit Anhängen über item_files

Beispiel:

Task mit angehängtem PDF

Event mit Einladung als PDF

Review Task mit referenzierter Note

Also:
kein eigener Filesystem-Zwang.

13. Minimal sinnvolle Erweiterung
Wenn du klein starten willst, würde ich nur diese Dinge ergänzen:

Neue item_kinds
task

event

Neue Tabellen
workflow_states

item_states

datetime_properties

recurrence_rules

notifications

Und noch nicht sofort item_occurrences, außer du willst echte Wiederholung sauber umsetzen.

Aber ehrlich:
Wenn du Wiederholung ernst meinst, solltest du item_occurrences direkt vorsehen.

14. Meine klare Empfehlung
Erweitere dein Modell so:

Kern bleibt
items

content_parts

item_metadata

labels

links

principals

acl

Neu für planbare Dinge
task und event als neue item_kinds

workflow_states

item_states

datetime_properties

recurrence_rules

notifications

optional, aber empfohlen: item_occurrences

So bekommst du:

Aufgaben

Termine

Fristen

Reviews

Wiederholungen

Benachrichtigungen

ohne dein generisches Modell zu verraten.

Frage 1
Welchen nächsten Schritt willst du dazu?

a) vollständiges erweitertes Gesamtschema inkl. Task/Event-Tabellen
b) nur die minimale Erweiterung für einen ersten MVP
c) konkrete Beispiele: 10 Tasks/Events/Reviews im Modell durchgespielt


A

Gut. Hier ist das vollständige erweiterte Gesamtschema mit:

generischem Content-Modell

Principal-Ansatz

kanonischen Auswahlwerten

Metadatengruppen

Labels

Aufgaben

Termine

Wiederholungen

Notifications

Ich halte die Schlüsselwerte jetzt konsequent lowercase + snake_case.

1. Architekturentscheidungen
Kern
Das Modell bleibt generisch und content-zentriert.

Zentrale Einheiten:

items

item_files

content_parts

item_metadata

item_links

labels

principals

acl

Erweiterung für planbare Dinge
Für Aufgaben und Termine kommen prozessbezogene, nicht fachbezogene Tabellen dazu:

workflow_states

item_states

datetime_properties

recurrence_rules

notifications

item_occurrences

Wichtige Regel
Keine Fachlogik wie income_records, contract_table, insurance_policy_table im Kern.

Fachlichkeit entsteht aus:

item_kind

category_key

Metadaten

Labels

Links

Summaries

2. Komplettes SQLite-Schema
2.1 Stammdaten / Auswahlwerte
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
2.2 Principals / Multiuser
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
    principal_id TEXT NOT NULL,          -- usually a group
    member_principal_id TEXT NOT NULL,   -- member of that group
    role TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (principal_id, member_principal_id),
    FOREIGN KEY (principal_id) REFERENCES principals(id),
    FOREIGN KEY (member_principal_id) REFERENCES principals(id)
);
2.3 Items
CREATE TABLE items (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    item_kind TEXT NOT NULL,
    category_key TEXT,
    mime_type TEXT,
    source_path TEXT,                     -- optional relative path
    content_hash TEXT,
    language_code TEXT,
    status TEXT,                          -- generic lifecycle, e.g. active, archived
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
2.4 Dateien pro Item
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
2.5 Content Parts
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
2.6 Generische Links zwischen Items
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
2.7 Metadatengruppen und Felddefinitionen
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
2.8 Metadatenwerte
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
Hinweis: Pro Datensatz sollte genau eine Value-Spalte genutzt werden.

2.9 Labels
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
2.10 ACL
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
2.11 Wen betrifft ein Item?
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
2.12 Workflow / Zustand für planbare Items
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
2.13 Strukturierte Zeitangaben
CREATE TABLE datetime_properties (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    property_key TEXT NOT NULL,           -- due_at, start_at, end_at, remind_at, snoozed_until
    value_datetime TEXT NOT NULL,
    timezone TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
2.14 Wiederholungsregeln
CREATE TABLE recurrence_rules (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,              -- rrule, simple
    rule_text TEXT NOT NULL,              -- e.g. RRULE:FREQ=MONTHLY;BYMONTHDAY=1
    anchor_datetime TEXT,
    timezone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
2.15 Notification-Regeln
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,                  -- ULID
    item_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,      -- reminder, deadline_warning, review_prompt
    trigger_mode TEXT NOT NULL,           -- absolute, relative, recurrence_instance
    relative_to_key TEXT,                 -- due_at, start_at, end_at
    offset_minutes INTEGER,
    trigger_at TEXT,
    channel_key TEXT,                     -- in_app, email, push
    is_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
2.16 Konkrete Vorkommen aus Wiederholungen
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
2.17 Ingestion / Processing Runs
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
2.18 Gespeicherte Abfragen
CREATE TABLE saved_queries (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    query_json TEXT NOT NULL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);
3. Kanonische Startwerte
3.1 item_kinds
INSERT INTO item_kinds (key, label, description) VALUES
('note', 'Note', 'Markdown note or knowledge item'),
('document', 'Document', 'PDF or other document file'),
('image', 'Image', 'Image, scan, screenshot, photo'),
('spreadsheet', 'Spreadsheet', 'Spreadsheet file such as xlsx or csv'),
('summary', 'Summary', 'Standalone summary item if needed'),
('task', 'Task', 'Actionable task or to-do'),
('event', 'Event', 'Scheduled event or appointment');
3.2 item_categories
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
3.3 content_part_kinds
INSERT INTO content_part_kinds (key, label, description) VALUES
('markdown_body', 'Markdown Body', 'Main markdown content'),
('text_chunk', 'Text Chunk', 'Extracted text chunk'),
('ocr_text', 'OCR Text', 'OCR extracted text'),
('summary', 'Summary', 'Manual or generated summary'),
('caption', 'Caption', 'Image description or caption'),
('table_extract', 'Table Extract', 'Extracted table text'),
('keywords', 'Keywords', 'Keywords extracted from content');
3.4 link_types
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
3.5 permissions
INSERT INTO permissions (key, label, description) VALUES
('view', 'View', 'Can view item'),
('edit', 'Edit', 'Can edit item'),
('manage', 'Manage', 'Can manage permissions and metadata');
3.6 subject_relation_types
INSERT INTO subject_relation_types (key, label, description) VALUES
('concerns', 'Concerns', 'The item concerns this principal'),
('owned_by', 'Owned By', 'The item is owned by this principal'),
('managed_for', 'Managed For', 'The item is managed on behalf of this principal'),
('about', 'About', 'The item is about this principal');
3.7 workflow_states
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
4. Metadatengruppen
Ich würde zum Start diese Gruppen definieren:

general

classification

document_details

review

research

finance_income

finance_bank_statement

offers

task_details

event_details

Beispielhafte Gruppen-Keys
general
classification
document_details
review
research
finance_income
finance_bank_statement
offers
task_details
event_details
5. Metadatenfelder zum Start
5.1 Allgemein
document_date
issuer
recipient
is_scanned
ocr_status
summary_status
reviewed_by_user
language_override
5.2 Research
research_subject
decision_stage
budget_max
selected_option
comparison_exists
5.3 Finance Income
gross_amount
net_amount
currency
payment_date
period_start
period_end
5.4 Bank Statement
bank_name
account_reference
statement_period_start
statement_period_end
5.5 Offers
vendor
offer_number
valid_until
total_amount
5.6 Task Details
priority
estimated_effort_minutes
is_blocked
blocking_note
5.7 Event Details
all_day
location
attendee_notes
Wichtig: due_at, start_at, end_at gehören nicht in item_metadata, sondern in datetime_properties.

6. Principals zum Start
Für deinen Fall würde ich direkt mit diesen Principals starten:

heiko
wife
son
pair
family
parents_of_son
Bedeutung
heiko = Person

wife = Person

son = Person

pair = Gruppe

family = Gruppe

parents_of_son = Gruppe

Memberships
heiko ∈ pair

wife ∈ pair

heiko ∈ family

wife ∈ family

son ∈ family

heiko ∈ parents_of_son

wife ∈ parents_of_son

7. Beispiele für Modellierung
7.1 Einkommensnachweis von dir
items
item_kind = document

category_key = income_document

ACL
heiko: view, edit, manage

Subjects
heiko: concerns

heiko: owned_by

Metadaten
gross_amount

net_amount

payment_date

7.2 Waschmaschinen-Recherche
items
item_kind = note

category_key = research

ACL
pair: view, edit

Subjects
pair: concerns

Links
zu Angebots-PDFs

zu Vergleichstabelle

zur späteren Entscheidungsnote

7.3 Schultermin für deinen Sohn
items
item_kind = event

category_key = school_event

item_states
workflow_type = event

state_key = scheduled

datetime_properties
start_at

end_at

ACL
parents_of_son: view, edit

Subjects
son: concerns

parents_of_son: managed_for

Notifications
24h vorher

2h vorher

7.4 Wiederkehrende Aufgabe
“Versicherungstarife prüfen”

items
item_kind = task

category_key = review_task

item_states
workflow_type = task

state_key = open

datetime_properties
due_at

recurrence_rules
RRULE:FREQ=YEARLY

notifications
relativ zu due_at, z. B. -10080 Minuten

Links
review_for → auf Versicherungsnotiz oder Vertragsdokument

8. Start-Filesystem-Struktur
Das Filesystem bleibt technisch neutral.

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
9. Inbox-Prinzip mit Projektordnern
Dauerhafter Bestand
Nur unter:

kb/items/...

Temporäre Arbeit
Darf unter:

kb/inbox/...

kb/workspaces/projects/...

kb/workspaces/reviews/...

liegen.

Beispiel
kb/workspaces/projects/washing_machine_research/
  notes_draft.md
  bosch_offer_download.pdf
  samsung_screenshot.png
  comparison.xlsx
Nach Import:

kb/items/notes/m1/note_<ulid>_washing_machine_research.md
kb/items/documents/k8/doc_<ulid>_bosch_offer.pdf
kb/items/images/p4/img_<ulid>_samsung_screenshot.png
kb/items/spreadsheets/r2/sheet_<ulid>_comparison.xlsx
Zusammenhang dann nur über DB.

10. Dateinamenschema
<prefix>_<ulid>_<slug>.<ext>
Beispiele:

note_01HT..._washing_machine_research.md
doc_01HT..._bosch_offer.pdf
img_01HT..._samsung_screenshot.png
sheet_01HT..._comparison.xlsx
Prefixe
note

doc

img

sheet

summary

11. Bucket-Regel
Um große Ordner zu vermeiden:

Bucket nicht aus den ersten Zeichen der ULID

sondern aus einem mittleren Segment

Empfehlung:

bucket = ulid[10:12].lower()
Beispiel:

kb/items/documents/m1/doc_<ulid>_bosch_offer.pdf
12. Saubere Modellgrenzen
In items
Nur generische Identität und Basiseigenschaften.

In item_metadata
Flexible, definierte Fachattribute.

In datetime_properties
Alle strukturierten Zeitpunkte.

In item_states
Workflow-Zustand planbarer Dinge.

In recurrence_rules
Wiederholungslogik.

In notifications
Benachrichtigungsregeln.

In item_occurrences
Konkrete Instanzen wiederkehrender Aufgaben/Termine.

13. Was ich bewusst nicht tun würde
Nicht:

fachliche Extratabellen pro Domain

Ordner nach Personen oder Themen als Hauptstruktur

Aufgaben/Termine nur als freie Metadaten

Rechte über Labels modellieren

Kategorien mit uneinheitlicher Groß-/Kleinschreibung

14. Mein Fazit
Das Modell ist jetzt konsistent und erweiterbar:

ein generischer Kern

saubere Trennung von technischem Typ und inhaltlicher Klassifikation

ULID als stabile Identität

Principal-basierte Rechte und Betroffenheit

Tasks und Events als echte planbare Objekte

Wiederholung und Notifications ohne Bruch im Modell

Inbox + Workspaces für pragmatisches Arbeiten

neutraler, skalierbarer Filesystem-Bestand

Der nächste logische Schritt ist jetzt ein echtes schema.sql, inklusive CREATE INDEX und INSERT-Seed-Datei.


Ich Frage mich was wir noch vergessen haben, was im privaten im weitesten Sinne auch mit Wissen und Informationen zu tun hat. Jetzt sei kreativ und gehe in Gedanken typische tagesabläufe durch. Was fehlt noch - be creativeund mache erst Mal ein Tabelle mit weiteren möglichen Themen.

Gute Frage — genau so findet man die Lücken, bevor man später refactoren muss.

Ich gehe das bewusst entlang eines Tages + Lebensbereiche durch und ergänze Dinge, die typischerweise nicht sofort auffallen, aber später extrem wertvoll sind.

🧠 Ziel dieser Liste
Nicht:

noch mehr Features

Sondern:

blinde Flecken finden

prüfen: passt alles ins Modell?

erkennen, wo evtl. Erweiterungen nötig sind

🧩 Tabelle: Weitere relevante Themen für eine private KB
Bereich	Thema	Konkrete Beispiele	Warum wichtig
🧠 Denken	mentale Modelle	Entscheidungsregeln, Biases, persönliche Prinzipien	verbessert langfristige Entscheidungen
🧠 Reflexion	Journaling / Rückblick	Tagesreflexion, Wochenreview	Lernen aus Verhalten
🧠 Ziele	Ziele & Planung	Jahresziele, persönliche Roadmap	Verbindung von Wissen ↔ Handlung
🧠 Lernen	Lerntracking	was habe ich gelernt, offene Themen	verhindert Wiederlernen
💼 Arbeit	Karrierewissen	Feedback, Entwicklung, Gespräche	langfristige Karriereentscheidungen
💰 Finanzen	Cashflow / Planung	monatliche Ausgabenstruktur	nicht nur Dokumente, sondern Überblick
💰 Finanzen	Investment-Tracking	ETF-Strategie, Performance	Verbindung zu Entscheidungen
💰 Finanzen	Steuerlogik	persönliche Steuerstrategie	komplex, wird oft vergessen
🏠 Haushalt	Inventar	Geräte, Seriennummern, Kaufdatum	wichtig bei Garantie/Versicherung
🏠 Haushalt	Wartung	wann Filter gewechselt, Inspektion	wiederkehrende Tasks
🏠 Haushalt	Verträge	Strom, Internet, Versicherungen	Fristen + Vergleich
👨‍👩‍👧 Familie	Entwicklung Kinder	Meilensteine, Verhalten	langfristige Perspektive
👨‍👩‍👧 Familie	Organisation	Schule, Termine, Aktivitäten	operative Planung
👨‍👩‍👧 Familie	Betreuung	Arzt, Impfungen, Medikamente	kritisch
🧾 Behörden	Prozesse	Anträge, Fristen, Abläufe	schwer zu merken
🧾 Behörden	Dokumentstatus	was fehlt, was eingereicht	Überblick
🧾 Behörden	Kommunikation	Briefe, Antworten	Kontext wichtig
🛒 Konsum	Kaufentscheidungen	warum Produkt gewählt	verhindert Fehlkäufe
🛒 Konsum	Produktbewertungen	eigene Erfahrung	bessere zukünftige Auswahl
🛒 Konsum	Wunschliste	geplante Käufe	Priorisierung
🛠️ Projekte	DIY / Projekte	Bauprojekte, Robotik	langfristige Dokumentation
🛠️ Projekte	Lessons Learned	Fehler, Erkenntnisse	extrem wertvoll
🛠️ Projekte	Ideenpool	Ideen ohne Umsetzung	spätere Nutzung
💻 Tech	Setup-Dokumentation	PC, Tools, Config	spart Zeit
💻 Tech	Troubleshooting	bekannte Probleme	wiederverwendbar
💻 Tech	Automationen	Skripte, Workflows	Effizienz
📚 Wissen	persönliche Zusammenfassungen	Bücher, Artikel	verdichtetes Wissen
📚 Wissen	Quellen	Referenzen, Papers	Nachvollziehbarkeit
📚 Wissen	Konzepte	eigene Erklärungen	tiefes Verständnis
🧠 Entscheidungen	Decision Log	wichtige Entscheidungen	Gold wert
🧠 Entscheidungen	Alternativen	was wurde verworfen	Kontext
🧠 Entscheidungen	Review	war Entscheidung gut?	Lernen
❤️ Gesundheit	Symptome / Verlauf	ohne Diagnose, nur Struktur	Muster erkennen
❤️ Gesundheit	Routinen	Sport, Schlaf	Gewohnheiten
❤️ Gesundheit	Arztkontakte	wann, warum	Verlauf
🚗 Mobilität	Fahrzeughistorie	Wartung, Reparaturen	Kosten + Planung
🚗 Mobilität	Reisen	Planung, Erfahrungen	Wiederverwendung
🧳 Reisen	Trips	Planung + Rückblick	Wissen wieder nutzbar
🧳 Reisen	Dokumente	Tickets, Buchungen	Kontext
🧳 Reisen	Erfahrungen	was gut/schlecht war	Verbesserung
📆 Organisation	Termine	Kalender	operative Steuerung
📆 Organisation	Aufgaben	ToDos	Handlungsebene
📆 Organisation	Routinen	wiederkehrende Dinge	Alltag
🔁 Meta	Reviews	Wochen-/Monatsreview	Steuerung
🔁 Meta	Systempflege	offene Items, Chaos reduzieren	System stabil halten
🔐 Sicherheit	Zugangsdaten-Logik	wo ist was gespeichert	nicht Passwörter selbst
🔐 Sicherheit	wichtige Kontakte	Notfallkontakte	kritisch
📦 Besitz	Wertgegenstände	Liste für Versicherung	selten bedacht
📦 Besitz	Dokumentenstruktur	wo liegt was	Übersicht
🧾 Kommunikation	Gesprächsnotizen	wichtige Gespräche	Kontext
🧾 Kommunikation	Vereinbarungen	Absprachen	verhindert Missverständnisse
🧾 Kommunikation	E-Mails (wichtige)	extrahierte Inhalte	nicht alles speichern
🧠 Was hier interessant ist (Meta-Ebene)
Wenn du das anschaust, siehst du:

1. Drei große Klassen entstehen
A. Statisches Wissen
Notizen

Zusammenfassungen

Dokumente

→ hast du schon gut abgedeckt

B. Operatives Wissen
Tasks

Events

Routinen

Prozesse

→ hast du jetzt ergänzt

C. Zustands- & Verlaufssysteme (hier fehlen oft Dinge!)
Das sind Dinge wie:

Entwicklung (Kind, Gesundheit, Projekte)

Verlauf (Finanzen, Symptome, Wartung)

Entscheidungen + Outcome

Zustand von Dingen (Dokumentstatus, Projektstatus)

👉 Das ist der Bereich, den viele Systeme vergessen

⚠️ Was möglicherweise noch fehlt (wichtig!)
Hier sind die echten “Lücken”, die ich sehe:

1. Zeitliche Verläufe / Tracking
Beispiele:

Einkommen über Zeit

Symptome über Zeit

Gewicht / Fitness

Wartungshistorie

Projektfortschritt

👉 Dein Modell kann das, aber du brauchst evtl.:

Event-/Log-artige Items oder strukturierte Serien

2. Zustände von Dingen
Beispiele:

Dokument: eingereicht / offen / fehlt

Vertrag: aktiv / gekündigt / läuft aus

Projekt: geplant / aktiv / abgeschlossen

👉 Teilweise durch item_states, aber evtl. mehr Nutzung nötig

3. Routinen / Gewohnheiten
Das ist mehr als Tasks:

tägliche Routinen

wöchentliche Abläufe

wiederkehrende Abläufe ohne festen Termin

👉 Kombination aus:

recurrence

optional tracking (erledigt/nicht erledigt)

4. Beziehungen zwischen Dingen höherer Ordnung
Beispiele:

Projekt → mehrere Dokumente + Tasks + Entscheidungen

Entscheidung → basiert auf Research

Task → gehört zu Projekt

Event → gehört zu Kind

👉 hast du über item_links, aber:
→ evtl. brauchst du später Link-Typen sauber gepflegt

5. Kontext / Situation
Beispiele:

warum wurde etwas gemacht

in welchem Kontext entstand eine Entscheidung

👉 oft nur in Text → ok, aber wichtig bewusst zu nutzen

6. Versionierung / Änderungen
Beispiele:

Dokument wurde aktualisiert

Entscheidung wurde angepasst

Angebot wurde ersetzt

👉 aktuell nur indirekt vorhanden

7. “Offene Dinge” / Unsicherheit
Beispiele:

offene Fragen

ungeklärte Themen

Risiken

👉 oft vergessen, aber extrem wertvoll

🧠 Wichtigste Erkenntnis
Dein Modell deckt bereits:

✅ Wissen
✅ Dokumente
✅ Struktur
✅ Beziehungen
✅ Multiuser
✅ Tasks/Events

Die größten zusätzlichen Dimensionen sind:

👉 Zeitverlauf
👉 Zustand
👉 Wiederkehr / Routinen
👉 Entscheidungs-Feedback (war es gut?)

🧠 Meine Einschätzung
Du hast jetzt schon ein System, das:

deutlich über Notion/Obsidian hinausgeht

näher an “Personal Data OS” ist

sehr gut für Agenten geeignet ist

Die restlichen Themen sind keine strukturellen Lücken, sondern:

👉 Nutzungs- und Modellierungsdisziplin

Nächster sinnvoller Schritt
Bevor du weiter Tabellen baust, wäre sinnvoll:

👉 konkrete “Flows” durchspielen

z. B.:

Steuerjahr komplett

Kaufentscheidung

Kinderschule + Arzt + Termine

Projekt (Robotik)

Frage 1
Was willst du als nächsten Deep-Dive?

a) typische Lebens-Workflows komplett modelliert (z. B. Steuerjahr, Kaufentscheidung)
b) Zeitverlauf/Tracking sauber ins Modell integrieren
c) Routinen/Habits + Wiederholungen sauber designen


Viele Zeitverläufe sehe ich aktuell nicht. Aber wenn ich mein Gewicht tracken möchte. Ist das jeden Tag eine neue Notiz? Oder aktualisiere ich eine (MD) Notiz mit Datum und Gewicht? Reicht da schon unser Modell oder brauchen wir da ein paar Anpassungen?

Für so etwas wie Gewichtstracking reicht das aktuelle Modell fast, aber nicht ganz elegant.

Die Kernfrage ist:

Ist ein Gewichtseintrag Wissen/Inhalt oder eine Messung/Zeitreihe?

Und die Antwort ist:

eine Messung/Zeitreihe.

Darum würde ich das nicht als tägliche Markdown-Notiz modellieren und auch nicht als eine ständig anwachsende MD-Notiz mit Datumszeilen.

Warum beides nicht gut ist
Jeden Tag eine neue Notiz
Das ist zu grob und erzeugt zu viel Rauschen:

tausende Mini-Items

schlechte Übersicht

unnötig viel Retrieval-Lärm

semantisch falsch für eine einfache Messung

Eine einzige Markdown-Notiz mit Datum + Gewicht
Das ist besser als viele Notizen, aber auch nicht ideal:

schlecht auswertbar

unpraktisch für Diagramme

schwer filterbar

unklar für Mehrfachwerte pro Tag

später unschön für weitere Felder wie Körperfett, Kommentar, Uhrzeit

Markdown kann hier begleitend helfen, aber nicht als Primärmodell.

Meine klare Empfehlung
Für Gewicht, Blutdruck, Schlafdauer, Schritte, Temperaturen, Verbrauchswerte, Kontostände, Wartungsstände usw. brauchst du eine zusätzliche, generische Tracking-/Observation-Schicht.

Nicht fachspezifisch für Gewicht.
Sondern allgemein für:

Messwerte

Beobachtungen

Zustandsverläufe

Zeitreihen

Das ist eine echte Lücke im bisherigen Modell.

Saubere Erweiterung
Ich würde zwei neue generische Tabellen ergänzen:

1. observation_series
Definiert, welche Zeitreihe es gibt.

Beispiele:

Körpergewicht Heiko

Blutdruck Frau

Raumtemperatur Wohnzimmer

Kontostand Konto X

Benzinpreis Lieblings-Tankstelle

Stromzählerstand Haus

2. observations
Die einzelnen Messpunkte.

Beispiele:

2026-04-07, 82.4 kg

2026-04-08, 82.1 kg

Das ist viel sauberer als Notes.

Vorschlag für das Schema
observation_series
CREATE TABLE observation_series (
    id TEXT PRIMARY KEY,                  -- ULID
    title TEXT NOT NULL,
    series_key TEXT UNIQUE,               -- optional stable key
    metric_key TEXT NOT NULL,             -- weight, blood_pressure_systolic, sleep_hours
    unit TEXT,                            -- kg, mmhg, hours
    value_type TEXT NOT NULL,             -- number, integer, text, boolean, json
    subject_principal_id TEXT,
    created_by_principal_id TEXT,
    item_id TEXT,                         -- optional link to a note/item describing the series
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (subject_principal_id) REFERENCES principals(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
observations
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
Warum das gut zu deinem Design passt
Das ist weiterhin:

generisch

nicht fachlogisch

wenige Basiselemente

flexibel

agent-freundlich

Denn weight ist hier kein Spezialtable, sondern nur ein metric_key.

Also:

metric_key = weight

unit = kg

subject = heiko

Später genauso:

metric_key = sleep_hours

metric_key = body_temperature

metric_key = account_balance

Wie das praktisch aussieht
Serie
Körpergewicht Heiko

metric_key = weight

unit = kg

value_type = number

subject_principal_id = heiko

Messpunkte
2026-04-07 07:15 → 82.4

2026-04-08 07:18 → 82.1

2026-04-09 07:10 → 82.0

Optional mit Notiz:

„viel Salz am Vorabend“

„nach Krankheit“

„nach Sportpause“

Wo Markdown trotzdem sinnvoll ist
Markdown kann ergänzend sehr nützlich sein, aber nicht als Messspeicher.

Zum Beispiel eine Note:

item_kind = note

category = reference oder learning

Titel:

Gewichtstracking Heiko

Inhalt:

Ziel

Interpretation

Regeln zum Messen

Erkenntnisse

Verlinkung auf die Serie

Beispiel:

immer morgens nach dem Aufstehen messen

Wochenmittel statt Tageswert betrachten

Zielbereich 78–80 kg

Das ist genau die richtige Rolle für Markdown:
Kontext, Interpretation, Reflexion
nicht Rohzeitreihe.

Brauchen wir dafür ein Item pro Observation?
Nein.

Und genau das ist wichtig.

Nicht gut
ein Item pro Gewichtswert

Besser
eine Serie

viele Observationen

Das reduziert Rauschen massiv.

Brauchen wir ACL dafür?
Ja, indirekt.

Es gibt zwei gute Varianten.

Variante A
ACL auf der Serie

Dann gelten die Rechte für alle Beobachtungen der Serie.

Das ist mein Favorit.

Dafür ergänzt du in observation_series:

created_by_principal_id

und optional eine kleine observation_series_acl

Oder einfacher:

Serie bekommt ein verlinktes item_id

ACL läuft über das verknüpfte Item

Variante B
Beobachtungen einzeln absichern

Das wäre meist Overkill.

Ich würde für privat klar Serie als Berechtigungseinheit nehmen.

Reicht unser Modell sonst aus?
Fast. Aber ich würde diese 3 Ergänzungen machen:

1. observation_series
für Zeitreihen

2. observations
für Messpunkte

3. optional metric_definitions
wenn du Metriken sauber katalogisieren willst

Beispiel:

CREATE TABLE metric_definitions (
    key TEXT PRIMARY KEY,                -- weight, sleep_hours, body_temperature
    label TEXT NOT NULL,
    default_unit TEXT,
    value_type TEXT NOT NULL,
    description TEXT
);
Das ist optional, aber sauber.

Was du damit noch abdecken kannst
Mit derselben Struktur kannst du später speichern:

Gewicht

Blutdruck

Puls

Schlafdauer

Sporteinheiten

Körpertemperatur

Benzinverbrauch

Stromverbrauch

Wasserzählerstand

Kontostände

Investment-Depotstand

Kindesgröße/Gewicht

Pflanzenbewässerung

Haustiergewicht

Also sehr viel private Realität.

Meine klare Antwort auf dein Beispiel
Gewicht tracken
Nicht:

täglich neue Note

nicht eine große Markdown-Tabelle

Sondern:

eine Observation Series

viele Observations

optional eine begleitende Markdown-Note für Kontext und Erkenntnisse

Fazit
Ja, hier fehlt noch etwas im Modell.

Für statisches Wissen reicht dein bisheriges Modell sehr gut.
Für Zeitreihen/Messwerte würde ich es erweitern um eine generische Observation-Schicht.

Das ist keine Fachlogik, sondern eine saubere neue Basiskomponente.

Als Nächstes würde ich dann das Gesamtschema noch einmal um genau diese Observation-Tabellen ergänzen.


Erstelle die komplette Tabellen Schemas erneut mit allen Anpassungen.

Hier ist das komplette konsolidierte Schema mit allen bisherigen Anpassungen:

generischer, content-zentrierter Kern

technische Typen getrennt von inhaltlicher Klassifikation

ULID als Primärschlüssel

flexible Metadatengruppen

hierarchische Labels

Principal-Ansatz für Multiuser

Tasks / Events / Wiederholungen / Notifications

Observation Series für Zeitreihen wie Gewicht

kanonische key-Werte in lowercase_snake_case

Ich teile es in:

SQL-Schema

Seed-Tabellen für Auswahlwerte

empfohlene Start-Filesystem-Struktur

1. Vollständiges SQL-Schema
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
2. Sinnvolle Indizes
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
3. Seed-Daten für Auswahlwerte
3.1 item_kinds
INSERT INTO item_kinds (key, label, description) VALUES
('note', 'Note', 'Markdown note or knowledge item'),
('document', 'Document', 'PDF or other document file'),
('image', 'Image', 'Image, scan, screenshot, photo'),
('spreadsheet', 'Spreadsheet', 'Spreadsheet file such as xlsx or csv'),
('summary', 'Summary', 'Standalone summary item if needed'),
('task', 'Task', 'Actionable task or to-do'),
('event', 'Event', 'Scheduled event or appointment');
3.2 item_categories
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
3.3 content_part_kinds
INSERT INTO content_part_kinds (key, label, description) VALUES
('markdown_body', 'Markdown Body', 'Main markdown content'),
('text_chunk', 'Text Chunk', 'Extracted text chunk'),
('ocr_text', 'OCR Text', 'OCR extracted text'),
('summary', 'Summary', 'Manual or generated summary'),
('caption', 'Caption', 'Image description or caption'),
('table_extract', 'Table Extract', 'Extracted table text'),
('keywords', 'Keywords', 'Keywords extracted from content');
3.4 link_types
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
3.5 permissions
INSERT INTO permissions (key, label, description) VALUES
('view', 'View', 'Can view item'),
('edit', 'Edit', 'Can edit item'),
('manage', 'Manage', 'Can manage permissions and metadata');
3.6 subject_relation_types
INSERT INTO subject_relation_types (key, label, description) VALUES
('concerns', 'Concerns', 'The item concerns this principal'),
('owned_by', 'Owned By', 'The item is owned by this principal'),
('managed_for', 'Managed For', 'The item is managed on behalf of this principal'),
('about', 'About', 'The item is about this principal');
3.7 workflow_states
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
3.8 metric_definitions
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
4. Metadatengruppen und Felder
4.1 Gruppen
Empfohlene Start-Gruppen:

general

classification

document_details

review

research

finance_income

finance_bank_statement

offers

task_details

event_details

4.2 Wichtige Feld-Keys
Allgemein:

document_date

issuer

recipient

is_scanned

ocr_status

summary_status

reviewed_by_user

language_override

Research:

research_subject

decision_stage

budget_max

selected_option

comparison_exists

Finance:

gross_amount

net_amount

currency

payment_date

period_start

period_end

bank_name

account_reference

statement_period_start

statement_period_end

vendor

offer_number

valid_until

total_amount

Task / Event:

priority

estimated_effort_minutes

is_blocked

blocking_note

all_day

location

attendee_notes

Wichtig:

due_at

start_at

end_at

gehören nicht in item_metadata, sondern in datetime_properties.

5. Principals zum Start
Empfohlen:

heiko

wife

son

pair

family

parents_of_son

Mit Memberships:

heiko ∈ pair

wife ∈ pair

heiko ∈ family

wife ∈ family

son ∈ family

heiko ∈ parents_of_son

wife ∈ parents_of_son

6. Start-Filesystem-Struktur
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
Prinzip
inbox/ = neue, unsortierte Eingänge

workspaces/projects/ = temporäre Projekt-Arbeitsordner

items/ = dauerhafter Bestand

Bedeutung und Zusammenhang kommen aus DB, nicht aus der Ordnerstruktur

Dateinamenschema
<prefix>_<ulid>_<slug>.<ext>
Beispiele:

note_01HT..._washing_machine_research.md

doc_01HT..._bosch_offer.pdf

img_01HT..._energy_label.jpg

Bucket-Regel
Empfohlen:

bucket = ulid[10:12].lower()
Also z. B.:

kb/items/documents/m1/doc_<ulid>_bosch_offer.pdf
7. Wichtige Anmerkung zum Modell
Für Wissensinhalte und Dokumente ist items der zentrale Kern.

Für Zeitreihen/Messwerte wie Gewicht ist das Hauptmodell:

observation_series

observations

und nicht:

eine Note pro Messpunkt

eine riesige Markdown-Datei mit Tabellenzeilen

Markdown kann dort ergänzend eine beschreibende Note sein, aber nicht der Primärspeicher.

8. Kurzfazit
Mit diesem Stand deckt das Modell jetzt ab:

Notizen, Wissen, Entscheidungen

PDFs, Bilder, Scans, Spreadsheets

Metadaten und Metadatengruppen

Zusammenfassungen als Content Parts

Labels

Multiuser über Principals

ACL und Betroffenheit

Aufgaben, Termine, Wiederholungen, Notifications

Zeitreihen wie Gewicht, Schlaf, Kontostände

Das ist jetzt ein tragfähiges Gesamtmodell.

Als nächsten Schritt würde ich daraus ein sauberes schema.sql + seed.sql + Python-Initialisierungsskript mit uv machen.


Wir haben jetzt viele Beispiele und use cases besprochen. Erstelle einen Übersicht mit allen in dieser Session besprochenen use cases (komplette Stories). Ich erinnere mich  nur noch an Notizen, Einkommens und Bankdokumente. Teilweiße noch an Zeitreihen mit Gewichtsmessung.

Guter Zeitpunkt für so eine Konsolidierung — sonst verlierst du schnell den Überblick.

Ich fasse dir alle konkret besprochenen Use Cases als vollständige Stories zusammen (inkl. Kontext, Datenmodell-Nutzung und Ziel). Das hilft dir später beim Testen und Validieren deines Systems.

🧠 Übersicht aller Use Cases (komplette Stories)
Ich gruppiere sie in sinnvolle Cluster:

1. 📚 Wissens- & Notizsystem
1.1 Allgemeine Wissensnotiz
Story:
Du hältst Wissen, Gedanken oder Erklärungen fest.

Beispiel:

„MECE Prinzip“

„Hermes Agents Erklärung“

„GraphRAG Konzept“

Modell:

item_kind = note

category = reference | learning

content_parts = markdown_body

Labels optional (ai, methods, work)

Ziel:

Wissen strukturiert speichern

später wiederfinden

LLM nutzbar machen

1.2 Strukturierte Recherche (z. B. Waschmaschine)
Story:
Du recherchierst ein Thema mit mehreren Quellen und Entscheidungen.

Beispiel:

Waschmaschine Kaufentscheidung

Bestandteile:

Research Note

Angebots-PDFs

Bilder / Screenshots

Vergleichstabelle

finale Entscheidung

Modell:

note (research)

documents (offer)

image (product_reference)

spreadsheet (comparison_table)

note (decision)

item_links verbinden alles

Ziel:

nachvollziehbare Entscheidungen

Wiederverwendung später

1.3 Decision Log
Story:
Du dokumentierst wichtige Entscheidungen inkl. Alternativen.

Beispiel:

warum Produkt X gewählt wurde

warum ETF Strategie gewählt wurde

Modell:

item_kind = note

category = decision

Links zu:

Research

Alternativen

Ergebnissen

Ziel:

Lernen aus Entscheidungen

Kontext erhalten

2. 📄 Dokumentenmanagement (privat)
2.1 Einkommensnachweise (PDF)
Story:
Du speicherst Gehaltsabrechnungen strukturiert.

Modell:

item_kind = document

category = income_document

item_files → PDF

Metadaten:

gross_amount

net_amount

payment_date

ACL:

nur du (heiko)

Ziel:

Wiederfinden

steuerliche Nutzung

Übersicht

2.2 Bankdokumente
Story:
Kontoauszüge und Finanzdokumente verwalten.

Modell:

category = bank_statement

Metadaten:

bank_name

period_start/end

Ziel:

Überblick

Nachvollziehbarkeit

2.3 Angebote (z. B. Kaufentscheidung)
Story:
Mehrere Angebote vergleichen und speichern.

Modell:

category = offer

Metadaten:

vendor

total_amount

valid_until

Verknüpfung:

mit Research Note

2.4 Verträge / Versicherungen
Story:
Langfristige Dokumente mit Fristen.

Modell:

category = contract_document | insurance_document

ggf. verknüpft mit:

Tasks (Review)

Events (Fristen)

2.5 Behördenprozesse
Story:
Dokumente + Status + Kommunikation.

Beispiel:

Antrag eingereicht

Antwort erhalten

Modell:

Dokumente + Notizen + Status

evtl. item_states

3. 👨‍👩‍👧 Multiuser / Familie
3.1 Persönliche Daten
Story:

Einkommensnachweis gehört nur dir

→ ACL: heiko

3.2 Gemeinsame Themen
Story:

Haushaltskäufe

Waschmaschine

→ ACL: pair

3.3 Kind-bezogene Themen
Story:

Schulunterlagen

Arzttermine

Modell:

subjects = son

ACL = parents_of_son

3.4 Rollen-Trennung
Wichtige Dimensionen:

created_by

visible_to

editable_by

concerns

4. 📆 Aufgaben & Termine
4.1 Aufgabe (Task)
Story:

„Stromzählerstand melden“

Modell:

item_kind = task

item_states

datetime_properties (due_at)

recurrence_rules

4.2 Termin (Event)
Story:

Kinderarzttermin

Modell:

item_kind = event

start_at, end_at

Notifications

4.3 Wiederkehrende Aufgaben
Story:

Versicherung jährlich prüfen

Modell:

recurrence_rules

item_occurrences

4.4 Review Tasks (wichtig!)
Story:

„ETF Strategie in 1 Jahr prüfen“

Modell:

Task + Link (review_for) zur Note

4.5 Notifications
Story:

Erinnerung 24h vorher

Reminder vor Frist

5. 📈 Zeitreihen / Tracking (NEU!)
5.1 Gewichtstracking
Story:

tägliches Gewicht messen

Modell:

observation_series

metric = weight

observations

timestamp + value

Wichtig:

NICHT als Notizen

5.2 Weitere Beispiele
Schlaf

Puls

Schritte

Kontostand

Stromverbrauch

5.3 Interpretation als Note
Story:

„Gewichtsentwicklung Analyse“

→ Note + Link zur Serie

6. 🏠 Haushalt / Besitz
6.1 Geräte & Inventar
Story:

Waschmaschine, Seriennummer, Kaufdatum

6.2 Wartung
Story:

Filter wechseln

Inspektion

→ Tasks + ggf. Zeitreihen

7. 🛠️ Projekte & DIY
7.1 Technische Projekte
Story:

Balancing Robot

Softwareprojekte

Modell:

Notes

Dokumente

Bilder

Tasks

7.2 Lessons Learned
Story:

Fehler dokumentieren

7.3 Ideenpool
Story:

Ideen ohne Umsetzung

8. 💻 Tech / Setup
8.1 Setup-Dokumentation
Story:

PC Setup

Tools

8.2 Troubleshooting
Story:

bekannte Probleme + Lösungen

8.3 Automationen
Story:

Scripts

Workflows

9. 🧾 Kommunikation
9.1 Gesprächsnotizen
Story:

wichtige Gespräche

9.2 Vereinbarungen
Story:

Absprachen festhalten

10. 🧠 Meta-Ebene
10.1 Reviews
Story:

Wochenreview

Monatsreview

10.2 Systempflege
Story:

Inbox aufräumen

Items sortieren

🔥 Wichtigste Erkenntnisse aus allen Use Cases
1. Drei große Klassen
A. Wissen
Notes

Dokumente

Research

B. Handlung
Tasks

Events

Reviews

C. Verlauf / Zustand
Zeitreihen (observations)

Status (states)

Entscheidungen + Outcome

👉 Genau diese 3 brauchst du → hast du jetzt.

2. Kritische Erweiterungen (die du gemacht hast)
Diese waren entscheidend:

Principal-Modell (Multiuser)

Tasks/Events

Recurrence

Notifications

Observation Series

Ohne diese wäre dein System:
→ nur ein besseres Notion

Mit diesen:
→ echtes Personal Data OS

3. Was NICHT Teil des Modells ist
UI

Notification Engine

Agentenlogik

Das Modell ist nur:
→ strukturierter Speicher + Beziehungen

🧠 Fazit
Du hast in dieser Session effektiv ein System modelliert, das:

dein gesamtes Privatleben strukturiert abbilden kann

sowohl statisches Wissen als auch dynamische Prozesse umfasst

Multiuser-fähig ist

für Agenten geeignet ist

skalierbar bleibt ohne Fachtabellen

Das ist weit über Standard-Tools hinaus.

Frage 1
Was willst du jetzt als nächsten Schritt?

a) 3–5 dieser Use Cases komplett end-to-end durchmodellieren (inkl. SQL Inserts)
b) daraus eine erste minimal funktionierende App-Architektur (FastAPI + SQLite) ableiten
c) einen Agenten entwerfen, der dieses Modell sinnvoll nutzt (Query + Reasoning)


ich möchte die erkenntnisse dieses chats (nicht den verlauf, das ergebnis und die finalen entscheidungen und inhalte) als markdown datei herunterladen.

ich möchte die erkenntnisse dieses chats (nicht den verlauf, das ergebnis und die finalen entscheidungen und inhalte) als markdown datei herunterladen

ist dieser chat noch aktiv?

Ja, der Chat ist aktiv 👍

Ich habe dir die komprimierten Ergebnisse und finalen Entscheidungen als Markdown-Datei erzeugt.

👉 

Wenn du willst, kann ich als nächsten Schritt:

die Datei deutlich detaillierter machen (inkl. kompletter Tabellen + SQL)

oder sie als „Developer Spec“ aufbereiten (für jemand anderen zum Implementieren)

Sag einfach, in welche Richtung du gehen willst. 



