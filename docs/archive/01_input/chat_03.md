


Ich möchte für den usecase und die Daten Bank Schema aus dem Chat "markdown Vs Datenbank kbase" eine applikation.langfristig soll die App Notizen. Bilder, Dateien, Projekte, wissen, Termine. Prozesse etc. Dokumentieren und durchsuchbar machen. Versuche die wichtigsten Anforderungen abzuleiten, damit wir später eine Architektur ableiten können

Ja. Ich leite die Anforderungen so ab, dass sie später tragfähig für Architektur, Datenmodell und UI sind.

Zielbild der App
Die Anwendung soll langfristig ein persönliches Wissens- und Organisationssystem werden, das sehr unterschiedliche Inhalte in einem gemeinsamen Kernmodell verwalten kann: Notizen, Dokumente, Bilder, Dateien, Projekte, Termine, Aufgaben, Prozesse, Zeitreihen und daraus abgeleitete Zusammenfassungen.
Wichtig ist dabei: content-zentriert statt fachlogik-zentriert. Also kein starres Spezialmodell pro Use Case, sondern wenige starke Basiselemente, die sich flexibel kombinieren lassen.

1. Zentrale Produktanforderung
Die App soll es ermöglichen, private und persönliche Informationen so zu erfassen, zu strukturieren, zu verknüpfen, wiederzufinden und weiterzuverarbeiten, dass daraus ein langfristig nutzbares persönliches Wissenssystem entsteht.

Dafür muss sie:

heterogene Inhalte speichern können

Inhalte logisch gruppieren und verknüpfen können

strukturierte und unstrukturierte Informationen gleichzeitig unterstützen

Inhalte über Zeit nachvollziehbar machen

Suche, Filter, Navigation und Zusammenfassungen ermöglichen

später Automatisierung, Erinnerungen und Workflows unterstützen

2. Wichtigste fachliche Anforderungen
2.1 Einheitliches Inhaltsmodell
Die App braucht ein Kernmodell, das wenige allgemeine Objekte kennt, z. B.:

Inhaltseinheit / Item

Inhaltsteile / Content Parts

Dateien / Assets

Beziehungen / Links

Labels / Klassifikationen

Metadaten

Zeitbezug

Damit sollen sehr viele Dinge abbildbar sein, ohne dass für jeden Fall ein neues Spezialobjekt nötig ist.

Beispiele:

eine Notiz

ein PDF-Dokument

ein eingescanntes Schreiben

ein Bild

ein Projekt

ein Termin

ein Prozess

eine Gewichtsmessung

eine Zusammenfassung mehrerer Dokumente

2.2 Trennung von technischem Typ und fachlicher Bedeutung
Ein Inhalt sollte nicht nur als „PDF“ oder „Bild“ betrachtet werden, sondern zusätzlich fachlich klassifizierbar sein.

Beispiel:

technischer Typ: document/pdf

fachliche Klasse: bank, steuer, versicherung, gesundheit, projekt, gewicht, reise

Das ist wichtig, weil sonst Dateiformat und Bedeutung vermischt werden.

2.3 Flexible Metadaten
Das System darf nicht verlangen, dass alle Inhalte dieselben Felder haben.
Stattdessen braucht es:

allgemeine Standard-Metadaten

optionale Metadatengruppen

erweiterbare Fachmetadaten pro Use Case

Beispiele:

Dokument: Aussteller, Datum, Betrag

Termin: Start, Ende, Ort

Bild: Aufnahmedatum, Personen, Kontext

Messwert: Wert, Einheit, Messzeitpunkt

Projekt: Status, Verantwortlichkeiten, Ziel

2.4 Beziehungen zwischen Inhalten
Inhalte müssen miteinander verknüpfbar sein.

Beispiele:

ein Projekt enthält Notizen, Dokumente, Bilder und Termine

ein Bankdokument gehört zu einem Konto

eine Zusammenfassung referenziert mehrere Quelldokumente

ein Prozess verweist auf Checklisten und Formulare

ein Messwert gehört zu einer Messreihe

ein Termin gehört zu einem Projekt oder Ereignis

Die App braucht deshalb ein explizites Beziehungsmodell.

2.5 Zeitbezug als Kernfunktion
Zeit ist für viele private Informationen zentral und darf kein Nebengedanke sein.

Die App muss mindestens unterstützen:

Erstellungsdatum

Ereignisdatum

Gültigkeitszeitraum

Fälligkeit

Wiederholung

Historie / Versionen

Zeitreihen

Beispiele:

Rechnungsdatum

Terminzeitpunkt

Erinnerungsdatum

Gewichtsverlauf

Verlauf eines Projekts

wann ein Dokument gültig war

3. Inhaltliche Use-Case-Anforderungen
3.1 Notizen und Wissen
Die App muss klassische Notizen und Wissenseinträge unterstützen:

freie Texte

strukturierte Texte

Markdown oder Rich Text

Anhänge

Verlinkungen

Zusammenfassungen

Tags / Labels

Querverweise

Zusätzlich wichtig:

Notizen dürfen allein stehen oder Teil eines Projekts/Themas sein

eine Zusammenfassung soll selbst wieder ein eigenständiger Inhalt sein

3.2 Dokumente und Dateien
Die App muss Dokumente und Dateien verwalten können:

PDF, Bilder, Office-Dateien, Scans, sonstige Anhänge

Vorschau / Preview

OCR bzw. extrahierbarer Text später möglich

Metadaten und Klassifikation

Zuordnung zu Themen, Projekten oder Entitäten

Wichtig:
Datei und Inhalt müssen getrennt gedacht werden.
Eine Datei ist ein Asset. Der fachliche Datensatz ist das eigentliche Inhaltselement.

3.3 Bilder
Bilder sind nicht nur Dateien, sondern oft Wissensobjekte.

Die App sollte Bilder unterstützen mit:

Beschreibung

Kontext

Datum/Zeit

Zuordnung zu Personen/Orten/Projekten

optional mehreren Varianten oder Ableitungen

3.4 Projekte und Themenräume
Die App braucht eine Möglichkeit, Inhalte logisch zu bündeln:

Projekt

Thema

Lebensbereich

Vorgang

Fall

Ein Projekt ist dabei eher ein Container bzw. Kontextobjekt:

enthält Inhalte

hat eigene Metadaten

hat Status / Zeitbezug

hat Beziehungen zu anderen Objekten

3.5 Termine, Aufgaben und wiederkehrende Dinge
Auch wenn der Fokus nicht nur auf Kalender liegt, muss das Modell das tragen können.

Benötigt werden:

Termin mit Start/Ende

Aufgabe mit Fälligkeit

Wiederholung / recurrence

Status

Erinnerung / Notification-fähige Struktur

Verknüpfung mit Projekten, Dokumenten, Personen, Prozessen

3.6 Prozesse und wiederholbare Abläufe
Private Wissensorganisation enthält auch Prozesse, z. B.:

jährliche Steuer

Versicherungswechsel

Fahrzeugwartung

Reisevorbereitung

Dokumentenscan-Workflow

Haushaltsabläufe

Die App sollte daher Prozesse als eigenständige Objekte oder strukturierte Inhalte unterstützen:

Schritte

Reihenfolge

Zustände

referenzierte Dokumente/Vorlagen

wiederkehrende Ausführung

3.7 Zeitreihen und Messwerte
Das war im Chat ein wichtiger Punkt.
Ein täglicher Gewichtseintrag sollte nicht als Sonderfall behandelt werden.

Die App muss deshalb sowohl können:

einzelne Messwerte speichern

Messwerte zu einer Serie gruppieren

Verläufe und Trends unterstützen

Messungen mit Datum, Wert, Einheit und Kontext speichern

Wichtig:
Nicht alles sollte als „eine Notiz, die man täglich editiert“ modelliert werden.
Für Zeitreihen braucht es ein sauberes Ereignis-/Messmodell.

4. Such- und Wiederfindungsanforderungen
Das ist einer der wichtigsten Punkte überhaupt.

Die App muss Inhalte wiederfindbar machen über:

Volltextsuche

Filter nach Typ, Label, Datum, Projekt, Quelle etc.

strukturierte Suche auf Metadaten

Navigation über Verknüpfungen

Hierarchien und Themenräume

spätere semantische Suche

Wichtig:
Suche muss übergreifend funktionieren, nicht pro Modultyp getrennt.

Beispiele:

alle Dokumente von Bank X aus 2025

alle Inhalte zum Projekt Hauskauf

alle Notizen mit Bezug zu Versicherung

alle Messwerte im März

alle Termine und Dokumente zu einem Ereignis

5. Anforderungen an Klassifikation und Ordnung
5.1 Labels statt starrer Ordnerlogik
Ordner allein reichen nicht.
Benötigt werden:

hierarchische Labels

Mehrfachzuordnung

fachliche Kategorien

freie Schlagwörter

systemische Kategorien

Beispiel:
Ein Dokument kann gleichzeitig sein:

finanzen

bank

kredit

wohnung

2026

5.2 Zusammenfassungen als eigene Inhalte
Wichtiger Punkt aus euren bisherigen Überlegungen:
Zusammenfassungen dürfen nicht nur ein Feld in einem Objekt sein.

Sie sollten als eigener Inhalt existieren können:

mit Verweis auf Quellen

mit eigener Version

mit eigener fachlicher Einordnung

manuell oder automatisch erstellt

Das ist später für KI, Auswertungen und Wissensverdichtung wichtig.

6. Änderbarkeit und Langfristigkeit
Weil die App langfristig wachsen soll, muss das Modell:

schema-flexibel sein

neue Inhaltstypen ohne Datenbruch erlauben

neue Metadatenfelder erlauben

versionierbar sein

migrationsfähig sein

nicht zu früh fachlich fest verdrahtet werden

Das ist einer der wichtigsten Architekturtreiber.

7. Nicht-funktionale Anforderungen
7.1 Skalierbarkeit im persönlichen Rahmen
Die App sollte langfristig viele Inhalte aushalten:

viele Notizen

viele Dateien

viele Bilder

lange Historien

größere Dokumentenmengen

Nicht zwingend Enterprise-Skalierung, aber klar oberhalb eines simplen Notiztools.

7.2 Gute Durchsuchbarkeit und Performance
Die App muss schnell sein bei:

Volltextsuche

Filterung

Anzeigen von Beziehungen

Laden von Projekten/Themen

Vorschau von Dateien/Bildern

7.3 Datenintegrität und Nachvollziehbarkeit
Wichtig für private Langzeitnutzung:

eindeutige IDs

Änderungshistorie

keine stillen Datenverluste

nachvollziehbare Beziehungen

Import/Export-Möglichkeiten

Backup-Fähigkeit

7.4 Offline-/lokale Nutzbarkeit
Da es um private Wissensorganisation geht, sollte die Architektur mindestens lokal oder self-hosted gut funktionieren.
Das hat Auswirkungen auf:

Datenbankwahl

Dateiablage

Suchindex

Sync-Optionen später

8. Daraus abgeleitete Kernmodule der App
Wenn man die Anforderungen verdichtet, ergeben sich grob diese Kernbereiche:

Content Management
Verwaltung aller Inhaltseinheiten

Asset Management
Dateien, Bilder, Dokumente, Vorschauen

Metadata & Classification
Typen, Labels, Kategorien, Metadatengruppen

Relationship Graph
Verknüpfungen zwischen Inhalten

Temporal Layer
Termine, Fälligkeiten, Wiederholungen, Historien, Messreihen

Search & Retrieval
Volltext, Filter, strukturierte Suche, später semantisch

Project / Context Layer
Projekte, Themenräume, Vorgänge, Lebensbereiche

Workflow / Process Layer
Prozesse, Checklisten, wiederkehrende Abläufe

9. Architekturtreibende Kernentscheidungen
Diese Anforderungen führen ziemlich klar zu ein paar Architekturprinzipien:

9.1 Entity-zentrierter Kern
Ein generischer Kern mit stabilen Basisobjekten ist sinnvoller als viele hartcodierte Spezialtabellen.

9.2 Dateien getrennt vom inhaltlichen Objekt
Asset und Inhalt dürfen nicht dasselbe sein.

9.3 Erweiterbare Metadaten
Sonst wird das System bei neuen Use Cases sofort unflexibel.

9.4 Beziehungen als First-Class Concept
Verknüpfungen dürfen kein nachträglicher Hack sein.

9.5 Zeit als eigener Modellaspekt
Nicht nur created_at, sondern echte zeitliche Semantik.

9.6 Suche nicht nachträglich denken
Suchbarkeit muss früh ins Design.

10. Konkrete, priorisierte Anforderungen für die nächste Phase
Für die Architekturableitung würde ich diese Anforderungen als die wichtigsten priorisieren:

Priorität A — unverzichtbar
generisches Kernmodell für Inhalte

Trennung von Inhalt, Datei und Klassifikation

flexible Metadaten

Beziehungen zwischen Inhalten

Volltextsuche + strukturierte Filter

Zeitbezug für Inhalte

Projekte/Themen als Container-Kontext

stabile IDs und Änderbarkeit

Priorität B — sehr wichtig
Zusammenfassungen als eigene Inhalte

Zeitreihen / Messwerte

Aufgaben / Termine / Wiederholungen

Versionierung / Historie

Import von Dateien und Dokumenten

Vorschau / Anzeige von Assets

Priorität C — später ausbaubar
Automationen / Notifications

semantische Suche / KI

Workflow-Engine

OCR / Extraktion / automatische Klassifikation

Sync / Mehrgerätebetrieb

11. Eine präzise Produktdefinition in einem Satz
Die App ist ein persönliches, generisches Wissens- und Dokumentationssystem, das heterogene Inhalte mit flexiblem Metamodell, Beziehungen, Zeitbezug und starker Suchbarkeit verwaltet.

12. Mein Fazit
Aus euren bisherigen Überlegungen ergibt sich sehr klar:

Der richtige Weg ist nicht ein klassisches Notiztool mit ein paar Anhängen und auch nicht ein starres Dokumentenmanagement mit Spezialtabellen für jeden Fall.

Der richtige Weg ist ein generischer Content-Kern mit:

wenigen stabilen Basiselementen

flexiblen Metadaten

starken Beziehungen

eingebautem Zeitmodell

übergreifender Suche

Darauf kann man später Projekte, Prozesse, Termine, Messreihen, Zusammenfassungen und KI-Funktionen sauber aufsetzen.

Als nächsten sinnvollen Schritt kann ich daraus ein sauber priorisiertes Anforderungen-Dokument mit Muss/Soll/Kann sowie ersten Architekturtreibern ableiten.


Wichtig die Daten und das wissen muss für Agenten gut zu greifbar sein (lesend und schreibend). Am besten über cli und Skill. Zur mit auch über MCP.

Ja, das ist ein zentraler Zusatzpunkt und ändert die Anforderungen spürbar.

Wenn die Datenbasis später nicht nur für Menschen, sondern auch für Agenten sehr gut nutzbar sein soll, dann reicht ein „schönes UI mit Datenbank dahinter“ nicht. Dann muss die App von Anfang an als agentenfähiges Wissenssystem gedacht werden.

Ergänzte Leitidee
Die Anwendung soll nicht nur Informationen für den Nutzer speichern und durchsuchbar machen, sondern diese Informationen auch für Agenten robust, strukturiert, sicher und automatisierbar zugänglich machen — lesend und schreibend.

Das heißt praktisch:

Menschen arbeiten über UI

Agenten arbeiten über CLI, Skills, APIs und später MCP

beide greifen auf dasselbe konsistente Kernmodell zu

Zusätzliche Kernanforderung: Agent-First-Zugänglichkeit
1. Agenten müssen First-Class Consumer und Producer sein
Das System darf Agentenzugriff nicht als späteren Zusatz betrachten.
Es muss so entworfen werden, dass Agenten:

Inhalte lesen

Inhalte erstellen

Inhalte ändern

Inhalte verknüpfen

Inhalte klassifizieren

Zusammenfassungen erzeugen

Prozesse anstoßen

strukturierte Abfragen ausführen

können, ohne fragile UI-Automation oder inoffizielle Workarounds.

2. Einheitliche maschinenlesbare Schnittstellen
Die Wissensbasis braucht klar definierte, stabile Interfaces.

Mindestens sinnvoll sind:

CLI

Skill-basierte Zugriffsschicht

API

MCP-Adapter später oder früh

Das ist wichtig, weil unterschiedliche Agentensysteme unterschiedlich integriert werden:

lokale Skripte über CLI

Coding-/Task-Agenten über Skills

IDE-/Tool-Agenten über MCP

interne Services über API

Daraus abgeleitete Anforderungen
3. Stabiles kanonisches Datenmodell
Für Agenten ist ein sauberes internes Kernmodell noch wichtiger als für Menschen.

Agenten brauchen:

eindeutige IDs

klar definierte Objekttypen

stabile Feldnamen

explizite Beziehungen

vorhersehbare Antwortformate

maschinenfreundliche Zeitangaben

versionierbare Datenstrukturen

Wichtig:
Agenten kommen mit inkonsistenten Sonderfällen deutlich schlechter klar als Menschen.
Darum muss das System intern ein kanonisches Modell haben, auch wenn die UI später bequemer abstrahiert.

4. CRUD allein reicht nicht
Für Agenten braucht man nicht nur „create/read/update/delete“, sondern fachlich sinnvolle Operationen.

Beispiele für gute Agenten-Operationen:

create_note

create_document_record

attach_asset

link_items

search_content

filter_by_metadata

append_measurement

create_summary_from_sources

create_project

add_item_to_project

schedule_event

record_process_execution

Das ist besser als ein rein generisches SQL-artiges Interface, weil Agenten damit zuverlässiger arbeiten.

5. CLI als primäre Automationsoberfläche
Die CLI ist für Agenten und lokale Automatisierung extrem wertvoll.
Sie sollte nicht nur Admin-Zubehör sein, sondern eine offizielle Oberfläche.

Die CLI sollte können:

Inhalte anlegen

Inhalte suchen

Inhalte lesen

Metadaten ändern

Beziehungen setzen

Dateien importieren

Inhalte exportieren

Batch-Operationen ausführen

strukturierte Ausgabe liefern

Wichtig:
Die Ausgabeformate müssen agentenfreundlich sein, insbesondere:

JSON

NDJSON für Streams / Listen

klare Exit Codes

maschinenlesbare Fehler

Also eher:

kbase item get --id note_123 --json
kbase search --query "versicherung haus" --type note --json
kbase link --from item_1 --to item_2 --relation related_to
und nicht menschenzentrierte, schwer parsebare Textausgaben als Primärformat.

6. Skills als kontrollierte Fähigkeitsoberfläche
Wenn du „über CLI und Skill“ sagst, dann sollte die Architektur eine Skill-Schicht vorsehen.

Die Idee:
Nicht jeder Agent bekommt direkten Rohzugriff auf Datenbanktabellen, sondern nutzt klar definierte Fähigkeiten.

Beispiele für Skills:

Suche

Lesen

Schreiben

Klassifizieren

Verlinken

Zusammenfassen

Prozessausführung

Termin-/Task-Anlage

Messwert-Erfassung

Vorteile:

stabilere Integration

weniger Coupling zur internen DB

bessere Validierung

klarere Rechtevergabe

einfachere MCP-Abbildung später

7. MCP-Fähigkeit als Architekturtreiber
Wenn MCP später relevant sein soll, dann sollte man jetzt schon so modellieren, dass sich die Funktionen gut als MCP-Tools anbieten.

Das heißt:

kleine, klar umrissene Operationen

saubere Input-/Output-Schemata

deklarative Toolbeschreibung

strukturierte Fehler

idempotente Operationen, wo möglich

Ressourcenmodell für lesbare Objekte

Sehr wahrscheinlich wird später sinnvoll sein:

Inhalte als MCP Resources

Operationen als MCP Tools

eventuell Suchräume / Sammlungen ebenfalls als Resources

Erweiterte nicht-funktionale Anforderungen
8. Agentensichere Schreiboperationen
Wenn Agenten schreiben dürfen, braucht es Schutzmechanismen.

Wichtige Anforderungen:

Validierung vor Persistenz

nachvollziehbare Änderungsprotokolle

Versionierung

Herkunft / Provenance

optionale Draft-/Review-Mechanik

Konflikterkennung

idempotente oder transaktionssichere Operationen

Denn sonst erzeugen Agenten schnell inkonsistente Daten.

9. Provenance und Urheberschaft
Bei agentischem Schreiben muss nachvollziehbar sein:

wer oder was hat etwas erzeugt

wann

auf Basis welcher Quellen

manuell oder automatisch

welcher Agent / Skill / Workflow war beteiligt

Diese Metadaten sind extrem wichtig.
Gerade bei Zusammenfassungen, Klassifikationen, Extraktionen und automatischen Verknüpfungen.

Beispiel:

created_by: user / agent / import

agent_name

workflow_id

source_items

confidence

generation_method

10. Rechte- und Sicherheitsmodell
Selbst in einer Single-User-App ist das für Agenten wichtig.

Nicht jeder Agent sollte alles dürfen.

Sinnvolle Rechteebenen:

read-only

write-content

write-links

write-metadata

execute-process

import-assets

admin/schema-level operations

So kann ein Suchagent lesen, aber nicht schreiben.
Ein Erfassungsagent darf neue Notizen anlegen, aber keine bestehenden Kernobjekte löschen.

11. Deterministische, gut dokumentierte Ausgabeformate
Für Agenten sind schwammige Antworten schlecht.

Deshalb müssen CLI, Skills und MCP-Tools:

konsistente JSON-Schemas liefern

Pflichtfelder klar definieren

Null-/Leerfall eindeutig behandeln

Fehlercodes standardisieren

Paginierung und Limits sauber definieren

12. Suche muss agentisch nutzbar sein
Nicht nur Menschen suchen anders als Agenten. Auch Agenten brauchen mehrere Suchmodi.

Die Suchschnittstelle sollte unterstützen:

Volltext

Filter auf Metadaten

Typfilter

Datumsfilter

Beziehungsnavigation

exakte ID-Lookups

Auflistung verwandter Objekte

später semantische Suche

Wichtig:
Die Suche darf nicht nur UI-orientiert sein, sondern muss maschinenlesbar rückgabefähig sein.

Ergänzte Architekturtreiber
Durch Agentenfähigkeit kommen weitere starke Architekturtreiber dazu:

A. API-First oder Capability-First statt UI-First
Die UI ist nur ein Client unter mehreren.

B. Kanonisches Domain-Modell
Alle Interfaces greifen auf denselben Kern zu.

C. Service-/Tool-Schicht über der Datenbank
Agenten sollten nicht direkt gegen Tabellen arbeiten.

D. Ereignis- und Änderungsprotokoll
Wichtig für Nachvollziehbarkeit und spätere Automatisierung.

E. Strikte Schemas für Ein- und Ausgabe
Insbesondere für Skills und MCP.

F. Trennung zwischen Rohdaten, fachlichen Objekten und abgeleiteten Artefakten
Sehr wichtig für agentisch erzeugte Inhalte.

Ergänzte Muss-Anforderungen
Ich würde die priorisierte Liste jetzt so erweitern:

Priorität A
generisches Kernmodell für Inhalte

Trennung von Inhalt, Asset, Klassifikation und Beziehungen

flexible Metadaten

starke Suchfunktion

Zeitmodell

Projekte/Kontexte

agentenfreundliche, stabile programmatische Schnittstellen

CLI mit JSON-Ausgabe

Skill-Schicht für fachliche Operationen

schreibender und lesender Zugriff für Agenten

Provenance / Änderungsnachvollziehbarkeit

Priorität B
MCP-kompatible Tool-/Ressourcenstruktur

Rechte-/Berechtigungsmodell für Agenten

Draft/Review-Mechanik für automatische Änderungen

Event-/Änderungslog

Batch-Import und Batch-Update

Zusammenfassungen und Ableitungen als explizite Objekte

Priorität C
semantische Suche

automatische Extraktion / Klassifikation

agentische Workflow-Orchestrierung

abonnierbare Events / Trigger

Präzisierte Produktdefinition
Die App ist ein persönliches Wissens-, Dokumentations- und Organisationssystem mit agentenfähigem Kernmodell, das Inhalte für Menschen und Agenten gleichermaßen strukturiert verwaltbar, durchsuchbar und veränderbar macht.

Praktische Konsequenz für die spätere Architektur
Das hat eine sehr klare Folge:

Die Architektur sollte wahrscheinlich nicht direkt lauten:

Frontend

Backend

Datenbank

Sondern eher:

Domain Core

Persistence Layer

Search Layer

Capability/Skill Layer

CLI

API

MCP Adapter

UI

Das ist deutlich tragfähiger.

Was wir damit gewonnen haben
Mit diesem Zusatz ist die App nicht nur eine persönliche Wissensdatenbank, sondern eine operable Knowledge Base, auf die Agenten strukturiert zugreifen können.

Das ist langfristig wertvoll für:

automatische Erfassung

Import aus Dokumenten

Zusammenfassungen

Wissensverknüpfung

Prozessunterstützung

persönliche Automatisierung

lokale AI-Agenten

Als nächstes würde ich daraus am sinnvollsten ein formalisiertes Anforderungsdokument in Kategorien wie Domain, Search, Agent Access, Security, Temporal, UX, Integration ableiten.


Starte

Gut. Ich erstelle jetzt ein formalisiertes, architektur-taugliches Anforderungsdokument, strukturiert nach klaren Domänen. Fokus: präzise, vollständig, ohne Redundanz.

1. System Scope & Zieldefinition
Ziel
Ein persönliches, agentenfähiges Wissens- und Dokumentationssystem zur Verwaltung, Verknüpfung und Auswertung heterogener Inhalte.

Systemgrenzen
Das System umfasst:

Speicherung und Verwaltung von Inhalten (Notes, Dokumente, Assets, Events, Prozesse)

Strukturierung über Metadaten, Labels und Beziehungen

Suche und Retrieval

Agentenzugriff (lesen + schreiben)

CLI / API / Skill / MCP Zugriff

Nicht Teil (initial):

externe Sync-Infrastruktur (Cloud-first)

komplexe Multi-User-Kollaboration

2. Domain Model Anforderungen
2.1 Core Entities
Das System muss mindestens folgende generische Entitäten unterstützen:

Item (zentrale Einheit)
eindeutige ID

Typ (technisch)

Klassifikation (fachlich)

Titel

Status

Zeitinformationen

Referenzen auf Content Parts

Referenzen auf Assets

Beziehungen zu anderen Items

Content Part
gehört zu genau einem Item

Typ (text, markdown, structured, summary, etc.)

versionierbar

optional strukturierter Inhalt

Asset
Datei (PDF, Bild, etc.)

physischer Speicher getrennt vom Item

Metadaten (Größe, Typ, Hash, etc.)

Relation
von Item → Item

Typ (z. B. belongs_to, references, derived_from)

optional Gewichtung / Semantik

Label
hierarchisch

mehrfach zuweisbar

Metadata
key-value

optional gruppiert

schema-erweiterbar

2.2 Typ- und Klassifikationsmodell
technischer Typ (z. B. note, document, event, measurement)

fachliche Klassifikation (z. B. bank, health, project)

Mehrfachklassifikation erlaubt

2.3 Zeitmodell
Das System muss mehrere Zeitdimensionen unterstützen:

created_at

updated_at

event_time

valid_from / valid_to

due_date

recurrence

timeline grouping

2.4 Versionierung
Content Parts versionierbar

Änderungen nachvollziehbar

optional Snapshot pro Item

3. Content & Use Case Anforderungen
3.1 Notizen & Wissen
Freitext + strukturierter Inhalt

Verlinkung zwischen Notizen

Zusammenfassungen als eigene Items

3.2 Dokumente
Asset + Metadaten + Klassifikation

Verknüpfung zu Projekten/Themen

OCR optional (später)

3.3 Bilder
Beschreibung + Kontext

Zeitbezug

Verknüpfung zu Items

3.4 Projekte / Kontexte
Container für Items

Status + Zeitbezug

keine harte Hierarchie notwendig

3.5 Termine & Aufgaben
Start/Ende

Fälligkeit

Status

Wiederholung

Verknüpfung zu Items

3.6 Prozesse
strukturierte Schritte

referenzierte Items

wiederholbare Ausführung

3.7 Zeitreihen / Messwerte
Einzelmessung als Item

Gruppierung zu Serie

numerische Werte + Einheit

Zeitstempel Pflicht

4. Search & Retrieval Anforderungen
4.1 Volltextsuche
über Content Parts

über extrahierte Inhalte (später)

4.2 Strukturierte Suche
Filter nach:

Typ

Klassifikation

Labels

Zeit

Metadaten

4.3 Beziehungsnavigation
Nachbarschaftssuche

Graph Traversal (mindestens 1–2 Hops)

4.4 Ergebnisformat
maschinenlesbar (JSON)

deterministisch

paginierbar

5. Agent Access Anforderungen
5.1 Grundprinzip
Alle Funktionen müssen programmatisch zugänglich sein, nicht nur über UI.

5.2 CLI Anforderungen
Die CLI muss unterstützen:

Lesen
get item

search

list

Schreiben
create item

update item

attach asset

link items

Erweiterte Operationen
append measurement

create summary

assign label

Ausgabe
JSON (Default für Agenten)

klare Fehlercodes

keine rein menschenoptimierten Formate als Default

5.3 Skill Layer
Das System muss eine abstrakte Fähigkeitsschicht haben:

Eigenschaften
klar definierte Inputs/Outputs

validierte Operationen

keine direkte DB-Kopplung

Beispiel-Skills
search_content

create_note

link_items

classify_item

create_summary

record_measurement

schedule_event

5.4 API Anforderungen
REST oder RPC

JSON Schema definiert

stabil versioniert

identisch zum Skill Layer (keine Doppel-Logik)

5.5 MCP Readiness
Das System muss so strukturiert sein, dass:

Items als Resources darstellbar sind

Operationen als Tools verfügbar sind

Schema klar definierbar ist

6. Write Safety & Provenance
6.1 Änderungsnachverfolgung
Jede Änderung muss speichern:

timestamp

actor (user / agent)

source (CLI / API / MCP / UI)

operation type

6.2 Provenance
Für automatisch erzeugte Inhalte:

source_items

agent_name

workflow_id

generation_type

confidence (optional)

6.3 Validierung
Pflichtfelder je Operation

Typvalidierung

Referenzvalidierung

6.4 Konfliktmanagement
last-write-wins minimal

optional Version Check (optimistic locking)

7. Security & Permissions
Auch Single-User benötigt strukturelle Trennung:

Rollen (intern)
read-only agent

write agent

admin agent

Operation-Level Kontrolle
read

write content

write relations

write metadata

delete (optional restriktiv)

8. Storage Anforderungen
8.1 Datenbank
relationale DB (z. B. SQLite/Postgres)

flexible Metadatenstruktur

8.2 Assets
Filesystem oder Object Storage

referenziert über DB

8.3 Suchindex
Volltextindex erforderlich

später erweiterbar (BM25, Vektor)

9. Performance Anforderungen
schnelle Suche (< 200 ms lokal)

effiziente Filterung

skalierbar auf große Mengen (Dokumente + Notizen + Bilder)

10. Extensibility Anforderungen
neue Item-Typen ohne Migration möglich

neue Metadaten ohne Schema-Bruch

neue Skills ohne Core-Änderung

neue Agenten ohne harte Kopplung

11. Observability
Logging aller Operationen

Fehlerprotokolle

optional Audit Log

12. Priorisierung (konkret)
Phase 1 (MVP)
Core Entities

CRUD + Relations

CLI (JSON)

Basic Search

Assets

Metadaten

Zeitfelder

Phase 2
Skill Layer

API

Provenance

Projekte

einfache Prozesse

Messwerte

Phase 3
MCP Adapter

semantische Suche

Automationen

Agent Workflows

Fazit (präzise)
Das System ist kein Notiztool und kein DMS.
Es ist ein agentenfähiges, generisches Wissenssystem mit strukturiertem Kernmodell und programmatischer Zugriffsschicht.

Nächster sinnvoller Schritt
Jetzt gibt es zwei sinnvolle Richtungen:

Konkretes Datenbankschema (SQL + Tabellen)

Systemarchitektur (Services, Module, Interfaces)

Frage (einzeln, wie gewünscht)
Was willst du als nächsten Schritt vertiefen?

a) Datenbankschema (Tabellen, Keys, Beziehungen)
b) Systemarchitektur (Module, Schichten, Schnittstellen)
c) CLI + Skill Design konkret (Commands, JSON Schemas)


B

Gut. Dann gehen wir auf die Systemarchitektur.

Ich leite eine Architektur ab, die zu deinen Anforderungen passt: generisches Kernmodell, starke Suchbarkeit, agentischer Zugriff, lokale Nutzbarkeit, später MCP, CLI und Skills.

1. Architekturprinzipien
Die Architektur sollte von Anfang an diese Prinzipien einhalten:

1.1 Domain-first statt UI-first
Die App ist nicht „Frontend mit Backend“, sondern ein Domain-System mit mehreren Zugängen:

UI für Menschen

CLI für Power-User und Agenten

Skills/API für Agenten und Automatisierung

MCP später als weiterer Adapter

1.2 Ein Kernmodell, mehrere Adapter
Alle Zugriffskanäle müssen gegen dieselbe fachliche Logik arbeiten.
Es darf keine getrennte Business-Logik geben für:

UI

CLI

API

MCP

Sonst driftet das Verhalten auseinander.

1.3 Capability-Schicht über der Datenbank
Agenten und UI dürfen nicht direkt auf Tabellenlogik aufbauen.
Zwischen Persistenz und Nutzung braucht es eine stabile Capability-/Application-Schicht.

1.4 Assets und Content getrennt
Dateien sind nicht die eigentlichen Wissensobjekte.
Darum getrennte Behandlung von:

fachlichem Item

Content Part

Asset

extrahiertem/abgeleitetem Inhalt

1.5 Event- und Provenance-fähig
Schreibende Agenten machen Nachvollziehbarkeit Pflicht.
Jede relevante Operation sollte als Ereignis bzw. Audit-Record nachvollziehbar sein.

2. Empfohlene High-Level-Architektur
Ich würde die Architektur in diese Schichten schneiden:

Clients

Interface Adapter

Application / Capability Layer

Domain Core

Infrastructure Layer

Storage & Indexes

Das konkretisiert sich so:

[ UI ]        [ CLI ]        [ MCP Adapter ]        [ External API Clients ]
   \             |                 |                         /
    \            |                 |                        /
     -------- [ Interface Adapter Layer / Transport ] -----
                           |
                           v
              [ Application / Capability Layer ]
                           |
                           v
                     [ Domain Core ]
                           |
          -----------------------------------------
          |                  |                    |
          v                  v                    v
 [ Persistence Layer ] [ Search Layer ] [ Asset/Blob Layer ]
          |                  |                    |
          v                  v                    v
     [ SQL DB ]       [ FTS / Vector ]      [ File Storage ]
3. Schichten im Detail
3.1 Clients
Das sind die eigentlichen Nutzer des Systems.

Menschliche Clients
Web UI

später evtl. Desktop UI

Programmatische Clients
CLI

Agenten

Automationen

MCP-Clients

externe Skripte

Wichtig:
Keiner dieser Clients soll Sonderwissen über die Datenbank brauchen.

3.2 Interface Adapter Layer
Diese Schicht übersetzt Eingaben aus verschiedenen Welten in interne Aufrufe.

Beispiele:

HTTP/JSON Adapter

CLI Command Handler

MCP Tool/Resource Adapter

Import Adapter für Dateien oder Scanner

Diese Schicht macht nur:

Transport

Parsing

Auth/Context

Fehler-Mapping

Request/Response-Schema

Nicht hier hinein gehört:

Fachlogik

Suchlogik

Beziehungsregeln

Validierungslogik der Domäne

3.3 Application / Capability Layer
Das ist die wichtigste Schicht für dein Zielbild.

Hier liegen die offiziellen Fähigkeiten des Systems.
Also nicht rohe DB-Operationen, sondern fachlich sinnvolle Aktionen.

Beispiele:

create_note

create_document

attach_asset

link_items

assign_labels

search_content

create_project

record_measurement

schedule_event

create_summary_from_sources

record_process_execution

Diese Schicht ist der richtige Ort für:

Inputvalidierung auf Use-Case-Ebene

Transaktionssteuerung

Aufruf mehrerer Repositories

Audit/Provenance-Erfassung

Veröffentlichung interner Domain Events

Schreibregeln und fachliche Konsistenz

Diese Schicht ist zugleich die natürliche Basis für:

CLI

API

Skills

MCP Tools

Das ist architektonisch sehr stark, weil du nur eine Stelle pflegst.

3.4 Domain Core
Hier liegt die eigentliche Fachsprache und das Kernmodell.

Typische Bestandteile:

Entities

Value Objects

Relation-Typen

Metadata-Strukturen

Zeitmodelle

Regeln über erlaubte Zustände

Domänenservices

Beispiele:

Item

ContentPart

AssetRef

Relation

LabelAssignment

TimeContext

Provenance

MeasurementValue

Diese Schicht sollte keine HTTP-, CLI-, SQL- oder MCP-Konzepte kennen.

Das Ziel ist:

testbar

langlebig

stabil

unabhängig von Transport und DB

3.5 Persistence Layer
Hier wird die Domäne auf die Datenbank gemappt.

Typische Bestandteile:

Repositories

Query Services

Mapper

Unit of Work / Transaction-Handling

Beispiele:

ItemRepository

RelationRepository

AssetRepository

SearchProjectionRepository

AuditRepository

Wichtig:
Diese Schicht sollte keine Business-Entscheidungen treffen wie
„wenn Measurement dann automatisch Serie erstellen“.
Das gehört nach oben in die Capability Layer.

3.6 Search Layer
Suche ist so wichtig, dass sie architektonisch sichtbar sein sollte und nicht als Nebenfunktion in SQL verschwindet.

Diese Schicht kapselt:

Volltextsuche

Filterlogik

kombinierte Retrieval-Strategien

später semantische Suche

Query-Expansion oder Ranking

Der Search Layer sollte intern ein eigenes Query-Modell haben, z. B.:

Textquery

Typfilter

Labelfilter

Metadatenfilter

Zeitfilter

Relation Constraints

Später kann dieselbe Schicht unterschiedliche Backends bedienen:

SQLite FTS

Postgres Full Text

BM25 Index

Vector Index

Damit bleibt die obere Architektur stabil.

3.7 Asset / Blob Layer
Für Dateien, Bilder, PDFs und Binärdaten braucht es eine eigene technische Abstraktion.

Aufgaben:

Datei speichern

Hash berechnen

MIME-Type

Varianten / Previews

Pfad oder Objekt-Storage-Schlüssel verwalten

Wichtig:
Die Business-Schicht arbeitet idealerweise mit AssetRef, nicht mit Dateipfaden.

4. Empfohlene interne Module
Ich würde die Anwendung grob in diese Module schneiden:

4.1 core
Enthält Domain-Modell und Grundtypen.

Beispiel:

entities

value objects

enums

domain services

validation rules

4.2 application
Use Cases / Capabilities.

Beispiel:

note service

document service

relation service

project service

measurement service

summary service

process service

4.3 persistence
SQL-Repositories und Mapper.

4.4 search
Suchabstraktion und Suchimplementierung.

4.5 assets
Dateiverwaltung, Hashing, Preview-Erzeugung später.

4.6 interfaces/api
HTTP-Endpunkte.

4.7 interfaces/cli
CLI Commands.

4.8 interfaces/mcp
MCP-Ressourcen und Tools.

4.9 audit
Änderungsprotokoll, Provenance, Operation Logs.

4.10 automation
Später für Trigger, Workflows, Jobs.

5. Zentrale Architekturentscheidung: Capability Layer als Dreh- und Angelpunkt
Für dein Ziel mit Agenten ist das der wichtigste Punkt.

Die Kernidee:

Die UI ruft keine Repositories direkt auf

Die CLI ruft keine Repositories direkt auf

MCP ruft keine Repositories direkt auf

Alles ruft Capabilities auf

Also z. B.:

CLI -> create_note capability
API -> create_note capability
MCP -> create_note capability
UI  -> create_note capability
Dadurch bekommst du:

konsistentes Verhalten

konsistente Validierung

gleiche Audit-Informationen

weniger Duplikate

saubere MCP-Abbildung

robuste Testbarkeit

6. Datenflussbeispiele
6.1 Beispiel: Notiz anlegen
CLI/API/UI/MCP
  -> Input Adapter
  -> create_note capability
  -> Domain validation
  -> ItemRepository.save()
  -> ContentPartRepository.save()
  -> AuditRepository.append()
  -> Response DTO / JSON
6.2 Beispiel: Asset an Dokument hängen
Client
  -> attach_asset capability
  -> Asset layer stores file
  -> Asset metadata created
  -> Item updated with asset reference
  -> Audit log written
6.3 Beispiel: Suche
Client
  -> search_content capability
  -> Search query object
  -> Search layer executes retrieval
  -> optional hydration from repositories
  -> result DTO
6.4 Beispiel: Agent erzeugt Zusammenfassung
Agent via CLI/API/MCP
  -> create_summary_from_sources capability
  -> fetch source items
  -> validate sources
  -> create summary item + content part
  -> set derived_from relations
  -> store provenance
  -> return created summary
7. Schnittstellenstrategie
7.1 CLI
Die CLI sollte dünn sein.
Sie ist nur ein Adapter auf die Capability Layer.

Gut:

stabil

scriptbar

JSON-first

für Agenten direkt nutzbar

Schlecht wäre:

CLI mit eigener Business-Logik

CLI mit direktem SQL-Zugriff

7.2 HTTP API
Für UI und externe Integrationen.

Empfehlung:

Ressourcenorientiert für einfache CRUD-Fälle

Capability-Endpunkte für komplexere Fachoperationen

Also nicht nur:

POST /items

sondern zusätzlich auch:

POST /capabilities/create-summary

POST /capabilities/link-items

POST /capabilities/record-measurement

7.3 MCP
MCP würde ich als Adapter auf genau dieselben Capabilities bauen.

Beispiel:

Resource: item/{id}

Resource: project/{id}

Tool: search_content

Tool: create_note

Tool: link_items

Tool: record_measurement

8. Sucharchitektur
Suche ist ein eigener Architekturstrang.

8.1 Warum getrennt?
Weil Suche später fast sicher anders wächst als der Rest:

erst SQL/FTS

später bessere Rankinglogik

später kombinierte Suche

später Vektor / semantisch

Wenn Suche direkt in Repository-Methoden einbetoniert wird, wird das später mühsam.

8.2 Empfohlener Aufbau
SearchQuery als internes Objekt

SearchService als Capability-nahe Abstraktion

austauschbarer Search Backend Adapter

Beispiel intern:

text

types

labels

metadata constraints

time range

relation scope

sort mode

pagination

9. Schreibsicherheit, Audit, Provenance
Mit Agenten ist das kein optionales Extra.

9.1 Audit Log
Für jede Änderung speichern:

Operation

Actor

Kanal

Timestamp

Zielobjekte

Ergebnisstatus

9.2 Provenance
Für abgeleitete Inhalte zusätzlich:

Quellobjekte

Agent/Workflow

Methode

Confidence optional

9.3 Idempotenz
Einige Capabilities sollten idempotent entworfen werden, z. B.:

Label zuweisen

Relation setzen

Asset registrieren über Hash

Messwert importieren mit externer ID

Das macht Agenten robuster.

10. Lokale und langfristige Betriebsfähigkeit
Da du lokal, CLI-nah und agentenorientiert denkst, würde ich das System so planen:

Anfang
lokale App

lokale SQL-DB

lokales Filesystem für Assets

lokale CLI

lokaler API-Service

später
optional self-hosted Service

Postgres statt SQLite

separates Search Backend

separate Worker für Extraktion / OCR / AI

Deshalb sollte man technisch früh auf Ports/Adapter achten, auch wenn anfangs alles in einem Prozess läuft.

11. Empfohlene Deployment-Entwicklung
Phase 1: Modularer Monolith
Ganz klar der beste Start.

Warum:

geringe Komplexität

schneller iterierbar

gleiche Codebasis

gute Testbarkeit

saubere Grenzen trotzdem möglich

Enthält:

API

CLI

Domain

Persistence

Search

Assets

Audit

alles in einem Projekt, aber sauber modularisiert.

Phase 2: Interne Entkopplung
Wenn nötig:

Search separat

Worker separat

MCP separat

Automationen separat

Phase 3: Teilweise Services
Nur wenn echter Druck entsteht:

extraktion/ocr service

vector/index service

automation engine

Früh auf Microservices zu gehen wäre hier fast sicher falsch.

12. Architekturentscheidung pro Thema
12.1 Modularer Monolith oder Microservices?
Modularer Monolith.
Alles andere wäre zu früh und würde deine eigentliche Produktarbeit bremsen.

12.2 DB-zentriert oder Domain-zentriert?
Domain-zentriert.
Die DB ist Implementierungsdetail, nicht die Architektur.

12.3 CRUD API oder Capabilities?
CRUD plus Capabilities, aber Capabilities als eigentliche Kernlogik.

12.4 UI-first oder CLI/API-first?
Capability-first mit mehreren Adaptern.

12.5 Direkte Tabellen für Agenten?
Nein.
Agenten auf Skills/Capabilities, nicht auf Rohschema.

13. Konkreter Zielaufbau des Codes
Ein sinnvoller Projektzuschnitt wäre etwa so:

app/
  core/
    entities/
    value_objects/
    rules/
    events/

  application/
    capabilities/
    dto/
    services/

  persistence/
    repositories/
    mappers/
    models/
    transactions/

  search/
    queries/
    services/
    backends/

  assets/
    storage/
    hashing/
    preview/

  audit/
    models/
    service/

  interfaces/
    api/
    cli/
    mcp/

  automation/
    jobs/
    triggers/

  config/
  tests/
Das ist kein Selbstzweck.
Es erzwingt einfach saubere Grenzen.

14. Meine klare Empfehlung
Die richtige Zielarchitektur ist:

Ein modularer Monolith mit klarer Capability-Schicht, generischem Domain Core und mehreren Adaptern für UI, CLI, API und später MCP.
Das passt sehr gut zu:

deinem generischen Wissensmodell

agentischem Lesen und Schreiben

späterer Erweiterbarkeit

lokaler/self-hosted Nutzung

sauberer Suchintegration

kontrollierter Komplexität

15. Was als nächstes am meisten Wert bringt
Nach der Systemarchitektur ist der nächste logische Schritt nicht das Frontend, sondern eine dieser beiden Ebenen:

a) Konkrete Modul- und Service-Schnittstellen
Also z. B.:

welche Capabilities genau?

welche Inputs/Outputs?

welche DTOs?

welche Commands/Queries?

b) Datenbankschema passend zu dieser Architektur
Also:

Tabellen

IDs

Relations

Metadata-Strategie

Audit-/Provenance-Tabellen

Frage
Was vertiefen wir als Nächstes?

a) Capabilities und interne Service-Schnittstellen
b) Datenbankschema passend zur Architektur
c) API- und CLI-Design auf Basis der Architektur


A

Gut. Dann definieren wir jetzt die Capabilities und internen Service-Schnittstellen.
Das ist der richtige nächste Schritt, weil damit später CLI, API, MCP und UI sauber auf demselben Kern aufsetzen können.

1. Ziel der Capability-Schicht
Die Capability-Schicht ist die offizielle fachliche Bedienoberfläche des Systems.
Sie kapselt nicht nur CRUD, sondern fachlich sinnvolle Operationen auf der Knowledge Base.

Sie soll:

für Agenten gut greifbar sein

stabil und schema-klar sein

unabhängig von UI und DB funktionieren

Validierung, Transaktionen und Audit bündeln

sich gut auf CLI, API und MCP abbilden lassen

2. Schnittstellenprinzipien
2.1 Command/Query-Trennung
Ich würde die Fähigkeiten in zwei Gruppen schneiden:

Commands verändern Zustand

Queries lesen und liefern Sichtmodelle zurück

Das macht Agentennutzung robuster und vermeidet unscharfe Operationen.

2.2 Capability statt generisches Repository-API
Also nicht:

save_item

update_row

patch_entity

sondern:

create_note

attach_asset

link_items

record_measurement

create_summary_from_sources

2.3 Strikte I/O-Schemata
Jede Capability braucht:

klaren Input DTO

klaren Output DTO

definierte Fehler

definierte Seiteneffekte

definierte Audit-/Provenance-Regeln

2.4 Idempotenz, wo sinnvoll
Einige Operationen sollten doppelte Aufrufe sicher abfangen können.

Beispiele:

Label zuweisen

Relation setzen

Asset registrieren

Import mit externer Referenz

3. Capability-Gruppen
Ich würde die Fähigkeiten in diese Gruppen schneiden:

Item Lifecycle

Content Management

Asset Management

Relations & Graph

Labels & Classification

Metadata

Search & Retrieval

Projects & Contexts

Temporal / Events / Tasks

Measurements / Time Series

Summaries / Derived Content

Processes

Audit / Provenance / History

Bulk / Import / Export

4. Gemeinsame Basistypen
Bevor wir die Fähigkeiten einzeln definieren, brauchen wir ein paar gemeinsame interne DTOs.

4.1 Basisidentität
ItemId
AssetId
RelationId
LabelId
OperationId
Empfehlung:

als String nach außen

intern typisiert

stabil, nicht DB-row-id direkt

4.2 Actor Context
Jede schreibende Operation sollte einen Kontext mitbekommen:

ActorContext
- actor_type           (user | agent | system | import)
- actor_id             (optional)
- channel              (ui | cli | api | mcp | job)
- agent_name           (optional)
- workflow_id          (optional)
- request_id           (optional)
4.3 Provenance Input
Für abgeleitete oder agentisch erzeugte Inhalte:

ProvenanceInput
- source_item_ids[]
- source_asset_ids[]
- method               (manual | extracted | generated | imported | transformed)
- confidence           (optional)
- notes                (optional)
4.4 Time Context
TimeContextInput
- event_time
- start_time
- end_time
- due_date
- valid_from
- valid_to
- recurrence_rule
- timezone
4.5 Metadata Patch
MetadataPatch
- set:   map<string, value>
- remove: string[]
5. Item Lifecycle Capabilities
Das ist die Basis für alle Inhalte.

5.1 create_item
Generische Basiscapability für alle Items.
Wird oft intern genutzt, aber kann auch extern angeboten werden.

Input
CreateItemCommand
- technical_type
- title
- classification_keys[]
- status                (optional)
- labels[]              (optional)
- metadata              (optional)
- time_context          (optional)
- initial_content_parts[] (optional)
- provenance            (optional)
- actor_context
Output
CreateItemResult
- item_id
- created_at
- version
Regeln
technical_type ist Pflicht

keine Asset-Speicherung hier

Content Parts optional

Audit-Eintrag Pflicht

5.2 update_item_core
Für Kernattribute des Items.

Input
UpdateItemCoreCommand
- item_id
- title                 (optional)
- status                (optional)
- classification_keys   (optional replace/merge semantics klar definieren)
- time_context_patch    (optional)
- actor_context
- expected_version      (optional)
Output
UpdateItemCoreResult
- item_id
- version
- updated_at
Regeln
keine stillen Nebenänderungen

optimistic locking optional über expected_version

5.3 archive_item
Soft delete / Archivierung statt physischem Löschen.

Input
ArchiveItemCommand
- item_id
- reason                (optional)
- actor_context
Output
ArchiveItemResult
- item_id
- archived_at
Empfehlung
Kein echtes delete_item als Default-Capability für Agenten.

6. Content Management Capabilities
Content Parts sind zentral, weil ein Item mehrere inhaltliche Teile haben kann.

6.1 add_content_part
Input
AddContentPartCommand
- item_id
- content_type          (plain_text | markdown | structured_json | summary | checklist | ...)
- body
- structure             (optional)
- role                  (primary | appendix | summary | extracted | transcript)
- provenance            (optional)
- actor_context
Output
AddContentPartResult
- item_id
- content_part_id
- version
6.2 replace_content_part
Für komplette Ersetzung eines Parts.

Input
ReplaceContentPartCommand
- item_id
- content_part_id
- new_body
- new_structure         (optional)
- actor_context
- expected_version      (optional)
Output
ReplaceContentPartResult
- content_part_id
- version
6.3 append_to_content_part
Nützlich für Agenten, die ergänzen statt ersetzen.

Input
AppendToContentPartCommand
- item_id
- content_part_id
- append_mode           (plain_append | markdown_section | structured_merge)
- body_fragment
- actor_context
Output
AppendToContentPartResult
- content_part_id
- version
7. Asset Management Capabilities
7.1 register_asset
Technische Registrierung einer Datei.

Input
RegisterAssetCommand
- file_reference        (path | upload_ref | stream_ref)
- original_filename
- media_type            (optional)
- sha256                (optional, sonst berechnen)
- actor_context
Output
RegisterAssetResult
- asset_id
- media_type
- size_bytes
- sha256
Regeln
dedup optional über Hash

noch nicht automatisch an ein Item gebunden

7.2 attach_asset_to_item
Input
AttachAssetToItemCommand
- item_id
- asset_id
- role                  (primary | attachment | preview | source | evidence)
- caption               (optional)
- actor_context
Output
AttachAssetToItemResult
- item_id
- asset_link_id
7.3 create_document_from_asset
Wichtige fachliche Capability, gerade für Agenten/Import.

Input
CreateDocumentFromAssetCommand
- asset_id
- title                 (optional)
- classification_keys[]
- labels[]              (optional)
- metadata              (optional)
- time_context          (optional)
- actor_context
Output
CreateDocumentFromAssetResult
- item_id
- asset_id
8. Relations & Graph Capabilities
8.1 link_items
Input
LinkItemsCommand
- from_item_id
- to_item_id
- relation_type         (references | belongs_to | derived_from | related_to | part_of | supports | ...)
- directionality        (directed | undirected)
- metadata              (optional)
- actor_context
Output
LinkItemsResult
- relation_id
Regeln
idempotent sinnvoll

Duplikate vermeiden

relation_type streng validieren

8.2 unlink_items
Input
UnlinkItemsCommand
- relation_id           (oder fachlicher Schlüssel)
- actor_context
Output
UnlinkItemsResult
- relation_id
- removed_at
8.3 list_related_items
Query-nahe Capability.

Input
ListRelatedItemsQuery
- item_id
- relation_types[]      (optional)
- direction             (incoming | outgoing | both)
- depth                 (default 1, max 2 initial)
- include_archived      (default false)
Output
ListRelatedItemsResult
- root_item_id
- edges[]
- items[]
9. Labels & Classification Capabilities
9.1 assign_labels
Input
AssignLabelsCommand
- item_id
- labels[]
- mode                  (add | replace)
- actor_context
Output
AssignLabelsResult
- item_id
- labels[]
9.2 classify_item
Input
ClassifyItemCommand
- item_id
- classification_keys[]
- mode                  (add | replace)
- actor_context
Output
ClassifyItemResult
- item_id
- classification_keys[]
9.3 create_label
Input
CreateLabelCommand
- key
- display_name
- parent_label_id       (optional)
- actor_context
Output
CreateLabelResult
- label_id
10. Metadata Capabilities
10.1 patch_item_metadata
Input
PatchItemMetadataCommand
- item_id
- metadata_patch
- actor_context
- expected_version      (optional)
Output
PatchItemMetadataResult
- item_id
- version
Regeln
nur definierte Value-Typen zulassen

nested metadata nur kontrolliert

10.2 get_item_metadata_schema
Optional, aber hilfreich für Agenten.

Input
GetItemMetadataSchemaQuery
- technical_type        (optional)
- classification_keys[] (optional)
Output
GetItemMetadataSchemaResult
- fields[]
- constraints[]
Sehr nützlich für Skill/MCP-Agenten.

11. Search & Retrieval Capabilities
Das ist eine Hauptschnittstelle für Agenten.

11.1 search_content
Input
SearchContentQuery
- text                  (optional)
- technical_types[]     (optional)
- classification_keys[] (optional)
- labels[]              (optional)
- metadata_filters[]    (optional)
- time_filters[]        (optional)
- relation_scope        (optional)
- sort                  (relevance | updated_at | created_at | event_time)
- page
- page_size
- include_snippets      (bool)
- include_content_parts (bool, default false)
Output
SearchContentResult
- total_count
- items[]
- snippets[]
- page
- page_size
- next_page_token       (optional)
11.2 get_item
Input
GetItemQuery
- item_id
- include_content_parts
- include_assets
- include_relations
- include_metadata
- include_history       (optional)
Output
GetItemResult
- item
- content_parts[]
- assets[]
- relations[]
- metadata
- version
11.3 list_items
Für deterministische Listen ohne Suchranking.

Input
ListItemsQuery
- technical_type        (optional)
- classification_keys[] (optional)
- labels[]              (optional)
- status                (optional)
- order_by
- page
- page_size
Output
ListItemsResult
- items[]
- total_count
12. Project & Context Capabilities
Projekte sind Kontexte und Container, keine harte Sonderwelt.

12.1 create_project
Spezialisierte Capability auf Basis von create_item.

Input
CreateProjectCommand
- title
- classification_keys[] (optional)
- labels[]              (optional)
- metadata              (optional)
- time_context          (optional)
- actor_context
Output
CreateProjectResult
- project_item_id
12.2 add_item_to_project
Input
AddItemToProjectCommand
- project_item_id
- item_id
- membership_role       (member | deliverable | note | evidence | event | process)
- actor_context
Output
AddItemToProjectResult
- relation_id
Intern vermutlich nur link_items mit spezieller Relation.

12.3 list_project_items
Input
ListProjectItemsQuery
- project_item_id
- membership_roles[]    (optional)
- technical_types[]     (optional)
Output
ListProjectItemsResult
- project_item
- items[]
- relations[]
13. Temporal / Event / Task Capabilities
13.1 schedule_event
Input
ScheduleEventCommand
- title
- start_time
- end_time              (optional)
- timezone              (optional)
- labels[]              (optional)
- classification_keys[] (optional)
- metadata              (optional)
- actor_context
Output
ScheduleEventResult
- item_id
13.2 create_task
Input
CreateTaskCommand
- title
- due_date              (optional)
- status                (optional default open)
- priority              (optional)
- labels[]              (optional)
- metadata              (optional)
- actor_context
Output
CreateTaskResult
- item_id
13.3 complete_task
Input
CompleteTaskCommand
- item_id
- completed_at          (optional, default now)
- actor_context
Output
CompleteTaskResult
- item_id
- status
14. Measurement / Time Series Capabilities
Das ist wichtig, weil du Zeitreihen explizit erwähnt hattest.

14.1 create_measurement_series
Input
CreateMeasurementSeriesCommand
- title
- metric_key            (e.g. weight, blood_pressure, savings_rate)
- unit
- labels[]              (optional)
- metadata              (optional)
- actor_context
Output
CreateMeasurementSeriesResult
- series_item_id
14.2 record_measurement
Input
RecordMeasurementCommand
- series_item_id        (optional, wenn nicht vorhanden ggf. direkt als standalone mit linkbarer Struktur)
- value_numeric
- value_text            (optional)
- unit                  (optional)
- measured_at
- metadata              (optional)
- actor_context
- provenance            (optional)
Output
RecordMeasurementResult
- measurement_item_id
- series_item_id        (optional)
Regeln
Measurement selbst als Item

Serie ebenfalls als Item

Verknüpfung über Relation

14.3 list_measurements
Input
ListMeasurementsQuery
- series_item_id
- from_time             (optional)
- to_time               (optional)
- order                 (asc | desc)
- page
- page_size
Output
ListMeasurementsResult
- series_item_id
- measurements[]
15. Summary & Derived Content Capabilities
Für agentisches Arbeiten extrem wichtig.

15.1 create_summary_from_sources
Input
CreateSummaryFromSourcesCommand
- source_item_ids[]
- title                 (optional)
- summary_body
- summary_type          (manual | agent_generated | extractive | abstractive)
- attach_to_item_id     (optional)
- labels[]              (optional)
- classification_keys[] (optional)
- actor_context
- provenance            (required for non-manual)
Output
CreateSummaryFromSourcesResult
- summary_item_id
- linked_source_count
Regeln
Summary ist eigenes Item

derived_from-Relationen Pflicht

provenance Pflicht bei agent/generated

15.2 create_extracted_content
Für OCR/Parsing/Import später.

Input
CreateExtractedContentCommand
- source_asset_id       (optional)
- source_item_id        (optional)
- extracted_body
- extraction_type       (ocr | text_parse | metadata_extract | transcript)
- actor_context
- provenance
Output
CreateExtractedContentResult
- target_item_id
- content_part_id
16. Process Capabilities
16.1 create_process
Input
CreateProcessCommand
- title
- steps[]               (ordered structured payload)
- labels[]              (optional)
- metadata              (optional)
- actor_context
Output
CreateProcessResult
- process_item_id
16.2 record_process_execution
Input
RecordProcessExecutionCommand
- process_item_id
- started_at            (optional)
- finished_at           (optional)
- status
- notes                 (optional)
- output_item_ids[]     (optional)
- actor_context
Output
RecordProcessExecutionResult
- execution_item_id
17. Audit / Provenance / History Capabilities
Nicht jede Audit-Funktion muss als öffentliche Capability existieren, aber lesend schon.

17.1 get_item_history
Input
GetItemHistoryQuery
- item_id
- page
- page_size
Output
GetItemHistoryResult
- item_id
- events[]
17.2 get_item_provenance
Input
GetItemProvenanceQuery
- item_id
Output
GetItemProvenanceResult
- item_id
- provenance_records[]
- source_links[]
18. Bulk / Import / Export Capabilities
Gerade für Agenten und Automatisierung wichtig.

18.1 bulk_create_items
Input
BulkCreateItemsCommand
- items[]
- actor_context
- on_error              (fail_fast | continue)
Output
BulkCreateItemsResult
- created[]
- failed[]
- summary
18.2 import_document_batch
Input
ImportDocumentBatchCommand
- file_refs[]
- default_classification_keys[] (optional)
- default_labels[]      (optional)
- actor_context
Output
ImportDocumentBatchResult
- imported_documents[]
- failed[]
19. Welche Capabilities wirklich öffentlich sein sollten
Nicht alles muss 1:1 nach außen.

Öffentlich für CLI/API/MCP sinnvoll
create_note

create_project

create_task

schedule_event

record_measurement

search_content

get_item

list_related_items

attach_asset_to_item

create_document_from_asset

link_items

assign_labels

patch_item_metadata

create_summary_from_sources

get_item_history

Eher intern oder advanced
create_item

replace_content_part

low-level content patching

rohe metadata schema internals

komplexe bulk primitives

20. Meine Empfehlung zur Form der Services im Code
Im Code würde ich das nicht als eine riesige Klasse bauen.

Sinnvoller ist eine Gruppierung nach Domäne:

ItemCommandService
ItemQueryService

ContentCommandService
AssetCommandService

RelationCommandService
RelationQueryService

SearchQueryService

ProjectCommandService
ProjectQueryService

TaskCommandService
EventCommandService

MeasurementCommandService
MeasurementQueryService

SummaryCommandService

ProcessCommandService

HistoryQueryService
Oder noch klarer als einzelne Use-Case-Handler pro Capability.

Für Agenten/MCP ist das oft sogar besser, weil jede Capability klein und explizit bleibt.

21. Wichtigste Designentscheidung für später
Ich würde nach außen spezialisierte Capabilities anbieten und intern optional eine generische create_item-Basis behalten.

Also:

außen: create_note, create_task, record_measurement

innen: create_item + Regeln + Mapper

Das ist für Agenten deutlich robuster und klarer.

22. Empfohlener MVP-Schnitt der Capability-Schicht
Für den ersten echten Bau würde ich diese Capabilities zuerst implementieren:

Lesen
get_item

search_content

list_items

list_related_items

Schreiben
create_note

create_project

register_asset

create_document_from_asset

attach_asset_to_item

link_items

assign_labels

patch_item_metadata

Zeit / Organisation
create_task

schedule_event

Wissen / Ableitungen
create_summary_from_sources

Zeitreihe
create_measurement_series

record_measurement

list_measurements

Nachvollziehbarkeit
get_item_history

get_item_provenance

Damit hättest du schon einen sehr tragfähigen Kern.

23. Klare Bewertung
Die Capability-Schicht sollte bei deinem System das eigentliche Produkt-API sein.
Nicht die Datenbank und nicht die UI.

Wenn wir das sauber definieren, ergeben sich daraus fast automatisch:

CLI Commands

API Endpunkte

MCP Tools

Tests

Berechtigungen

Audit-Struktur

Frage
Was vertiefen wir jetzt?

a) die konkrete Liste der MVP-Capabilities mit Priorität und Scope
b) das API-/CLI-Mapping dieser Capabilities
c) die internen DTOs und Fehlerobjekte als sauberes Schema


A 

Gut. Dann schneiden wir jetzt die MVP-Capabilities so zu, dass sie in einer ersten Version wirklich baubar sind und trotzdem die spätere Zielarchitektur nicht verbiegen.

Ich teile das in drei Ebenen:

MVP v1: unverzichtbar

MVP v1.1: direkt danach

später: bewusst nicht im ersten Wurf

1. Ziel des MVP
Der MVP soll bereits diese Kernaufgabe erfüllen:

Eine persönliche Knowledge Base, in der Inhalte, Dateien und einfache Kontexte angelegt, verknüpft, gesucht und für Agenten lesend und schreibend nutzbar gemacht werden.

Das bedeutet für v1:

einheitliche Items

Textinhalt

Dateien/Assets

Labels/Klassifikation

Metadaten

Beziehungen

Suche

Audit/History-Grundlage

CLI-/API-taugliche Operationen

Nicht Ziel von v1:

perfekte Kalenderlogik

komplexe Workflows

automatische Extraktion/OCR

semantische Suche

komplizierte Berechtigungsmodelle

Multi-User

2. Auswahlkriterien für MVP-Capabilities
Eine Capability kommt in v1, wenn sie mindestens eines davon erfüllt:

Sie ist notwendig, um das Kernobjektmodell praktisch nutzbar zu machen.

Sie ist grundlegend für Agentenzugriff.

Viele spätere Features bauen direkt darauf auf.

Sie lässt sich stabil definieren, ohne spätere Architektur zu verbauen.

3. MVP v1 – unverzichtbare Capabilities
3.1 Lesen / Retrieval
Diese vier sind absolut zentral.

get_item
Lädt ein einzelnes Item mit optionalen Erweiterungen.

Warum v1:
Ohne diese Capability gibt es keine stabile programmatische Leseschnittstelle.

Muss können:

Item laden

optional Content Parts

optional Assets

optional Relations

optional Metadata

Status: Pflicht

search_content
Übergreifende Suche über Text + strukturierte Filter.

Warum v1:
Suche ist einer der Hauptgründe für die App. Ohne sie ist es nur Ablage.

Muss können:

Textsuche

Typfilter

Klassifikationsfilter

Labelfilter

einfache Zeitfilter

Paginierung

Status: Pflicht

list_items
Deterministische Listen ohne Ranking.

Warum v1:
Viele Agenten- und UI-Flows brauchen nicht „Suche“, sondern einfache Listen.

Muss können:

Filter nach Typ

Filter nach Status

Paginierung

Sortierung

Status: Pflicht

list_related_items
Zeigt direkte Beziehungen eines Items.

Warum v1:
Beziehungen sind Kernbestandteil des Modells. Wenn sie nicht lesbar sind, sind sie praktisch wertlos.

Muss können:

incoming/outgoing/both

Filter nach Relationstyp

depth=1 im MVP reicht

Status: Pflicht

3.2 Item-Erstellung und Kernpflege
create_note
Spezialisierte Erstellung eines textbasierten Items.

Warum v1:
Notizen/Wissen sind der primäre Start-Use-Case.
Agenten und Nutzer brauchen eine einfache, stabile Erfassungsoperation.

Muss können:

Titel

Markdown/Text-Content

Labels

Klassifikation

Metadaten

Zeitkontext optional

Status: Pflicht

update_item_core
Pflegt Titel, Status, Klassifikation, Basiszeitfelder.

Warum v1:
Es muss eine saubere Möglichkeit geben, Kernattribute zu ändern, ohne Content, Assets und Metadaten zu vermischen.

Muss können:

title

status

Klassifikation

Time Context Patch

optimistic locking optional

Status: Pflicht

archive_item
Soft Delete / Archivierung.

Warum v1:
Agenten sollen nicht leicht physisch löschen. Archivierung ist die sichere Standardoperation.

Muss können:

archived status setzen

Grund optional

Audit

Status: Pflicht

3.3 Content
add_content_part
Fügt einem Item einen Inhaltsteil hinzu.

Warum v1:
Auch wenn create_note den ersten Content direkt mitgeben kann, braucht das System eine generische Content-Erweiterung.

Muss können:

content_type

body

role

provenance optional

Status: Pflicht

replace_content_part
Kompletter Ersatz eines bestehenden Inhaltsteils.

Warum v1:
Spätestens für Agentenbearbeitung und UI-Speichern notwendig.

Muss können:

target content part

kompletter Ersatz

version bump

Status: Pflicht

3.4 Assets / Dokumente
register_asset
Registriert eine Datei technisch.

Warum v1:
Dateien müssen sauber vom Item getrennt sein.

Muss können:

Datei referenzieren/speichern

Hash

MIME-Type

Größe

Status: Pflicht

attach_asset_to_item
Hängt eine registrierte Datei an ein Item.

Warum v1:
Sonst bleibt Asset Management technisch isoliert und fachlich unbrauchbar.

Muss können:

asset link

role

caption optional

Status: Pflicht

create_document_from_asset
Erzeugt aus einer Datei ein fachliches Dokument-Item.

Warum v1:
Das ist die wichtigste Brücke zwischen Asset und Wissensobjekt.

Muss können:

aus asset ein document item erstellen

Labels/Klassifikation/Metadata mitgeben

Asset direkt verknüpfen

Status: Pflicht

3.5 Beziehungen / Graph
link_items
Verknüpft zwei Items fachlich.

Warum v1:
Ohne das keine Projekte, keine Quellenbezüge, keine Summary-Herkunft, keine Kontexte.

Muss können:

relation_type

Richtung

Idempotenz gegen Dubletten

Status: Pflicht

unlink_items
Löst eine Beziehung.

Warum v1:
Wenn man verknüpfen kann, muss man auch sauber korrigieren können.

Status: Pflicht

3.6 Labels / Klassifikation / Metadaten
assign_labels
Weist Labels zu oder ersetzt sie.

Warum v1:
Labels sind ein Grundpfeiler der Ordnung.

Status: Pflicht

classify_item
Setzt fachliche Klassifikationen.

Warum v1:
Du willst ausdrücklich Trennung von technischem Typ und fachlicher Bedeutung.

Status: Pflicht

patch_item_metadata
Ändert flexible Metadaten.

Warum v1:
Ohne diese Capability wäre das Metadatenmodell praktisch nur Theorie.

Muss können:

set keys

remove keys

klar definierte Value-Typen

Status: Pflicht

3.7 Projekte / Kontexte
create_project
Erzeugt einen Projekt-/Kontextcontainer.

Warum v1:
Projekte gehören zu deinem Zielbild und sind architektonisch leicht auf dem Core-Modell aufsetzbar.

Status: Pflicht

add_item_to_project
Ordnet ein Item einem Projekt zu.

Warum v1:
Ein Projekt ohne Mitglieder ist nur ein Etikett.

Status: Pflicht

list_project_items
Liest Inhalte eines Projekts.

Warum v1:
Praktisch für UI, CLI und Agenten.

Status: Pflicht

3.8 Nachvollziehbarkeit
get_item_history
Liefert Änderungsverlauf.

Warum v1:
Sobald Agenten schreiben, brauchst du minimale Nachvollziehbarkeit direkt von Anfang an.

Status: Pflicht

get_item_provenance
Liefert Herkunftsbezüge.

Warum v1:
Gerade für abgeleitete Inhalte und agentisches Schreiben wichtig.
Man kann es zunächst einfach halten.

Status: Pflicht

4. MVP v1 – Ergebnis als klare Liste
Das ist meine empfohlene harte v1-Liste:

Lesen
get_item

search_content

list_items

list_related_items

Item / Content
create_note

update_item_core

archive_item

add_content_part

replace_content_part

Assets / Dokumente
register_asset

attach_asset_to_item

create_document_from_asset

Graph / Struktur
link_items

unlink_items

Ordnung
assign_labels

classify_item

patch_item_metadata

Kontext
create_project

add_item_to_project

list_project_items

Nachvollziehbarkeit
get_item_history

get_item_provenance

Das sind 20 Capabilities.
Das ist für einen MVP schon ordentlich, aber noch realistisch, wenn die Implementierung modular und der Monolith sauber bleibt.

5. MVP v1.1 – direkt danach
Diese Fähigkeiten sind wertvoll, aber nicht zwingend für den ersten Kern.

5.1 Zusammenfassungen
create_summary_from_sources
Warum nicht direkt v1:
Sehr sinnvoll, aber erst stark, wenn Basisobjekte, Beziehungen und Provenance sauber stehen.

Status: v1.1

5.2 Aufgaben und Termine
create_task
complete_task
schedule_event
Warum nicht direkt v1:
Nützlich, aber dein Kern ist Knowledge Base und nicht Task App.
Die Architektur muss es tragen, aber die Capability kann knapp danach kommen.

Status: v1.1

5.3 Messwerte / Zeitreihen
create_measurement_series
record_measurement
list_measurements
Warum nicht direkt v1:
Fachlich wichtig, aber für den ersten tragfähigen Core nicht zwingend.
Kann sauber auf dem Item-/Relation-/Metadata-Modell aufsetzen.

Status: v1.1

5.4 Low-Level Content-Editing
append_to_content_part
Warum nicht direkt v1:
Kann man anfangs durch get + replace abbilden.

Status: v1.1

5.5 Label-Verwaltung
create_label
Warum nicht direkt v1:
Man kann anfangs Labels auch implizit oder aus Seed-Daten führen.

Status: v1.1

6. Später – bewusst nicht im MVP
Diese Dinge würde ich explizit nicht in den ersten Wurf nehmen.

6.1 Automatische Extraktion
create_extracted_content

OCR

Parser

Dokumentklassifikation automatisch

Grund:
Hoher Aufwand, viele Fehlerquellen, kein Core-MVP.

6.2 Prozessmanagement
create_process

record_process_execution

Grund:
Wertvoll, aber erst wenn die Basismodelle sauber stehen.

6.3 Bulk-Operationen
bulk_create_items

import_document_batch

Grund:
Sehr nützlich, aber zuerst sollten Einzelfälle gut sein.

6.4 komplexes Rechte-/Rollenmodell
Grund:
Für Single-User mit Agenten reicht anfangs einfacher Actor Context plus minimale Schreibregeln.

6.5 semantische Suche / Vektor
Grund:
Nicht nötig für ersten Nutzwert.

6.6 komplexe MCP-spezifische Fähigkeiten
Grund:
Wenn die Capabilities sauber sind, ist MCP später ein Adapterproblem.

7. Bewertung der MVP-Größe
Die Menge ist groß genug, um echten Nutzwert zu liefern, aber noch klein genug, um nicht in Feature-Zersplitterung zu enden.

Warum diese Auswahl gut ist:

Sie deckt Note + Dokument + Projekt als erste starke Use Cases ab.

Sie ist bereits agententauglich.

Sie zwingt zu einem sauberen Kernmodell.

Sie macht Suche und Beziehungen von Anfang an real.

Sie hält Zeitreihen, Tasks, Prozesse und KI-Funktionen offen, ohne sie vorzeitig fest zu verdrahten.

8. Reihenfolge innerhalb von v1
Ich würde die 20 Capabilities intern nochmal in Bau-Reihenfolge schneiden.

Block 1 – Kern zuerst
create_note

get_item

update_item_core

add_content_part

replace_content_part

list_items

Block 2 – Ordnung und Suche
assign_labels

classify_item

patch_item_metadata

search_content

Block 3 – Beziehungen und Kontexte
link_items

unlink_items

list_related_items

create_project

add_item_to_project

list_project_items

Block 4 – Assets und Dokumente
register_asset

attach_asset_to_item

create_document_from_asset

Block 5 – Nachvollziehbarkeit
archive_item

get_item_history

get_item_provenance

Praktisch würde ich archive_item schon früher mitziehen, technisch gehört es aber zum Kernblock.

9. Was damit im MVP bereits möglich ist
Mit nur dieser v1-Liste kannst du schon:

Notizen anlegen und strukturieren

Dokumente aus Dateien erzeugen

Inhalte labeln und klassifizieren

Metadaten pflegen

Dinge miteinander verknüpfen

Projekte als Kontexte aufbauen

gezielt suchen

Historie und Herkunft nachvollziehen

Agenten über CLI/API stabil schreiben und lesen lassen

Das ist bereits ein ernstzunehmender Kern.

10. Meine klare Empfehlung
Für den ersten echten Bau würde ich genau diese harte Grenze setzen:

v1 = Knowledge Base Core
Nicht Kalender-App, nicht Workflow-Engine, nicht OCR-System, nicht AI-Produkt.

Also Fokus auf:

Items

Content

Assets

Relations

Metadata

Search

Projects

Audit/Provenance

Wenn das sitzt, kommt der Rest sauber obendrauf.

Frage
Was soll ich als Nächstes ausarbeiten?

a) die genaue Implementierungsreihenfolge für v1 in Arbeitspaketen
b) das API-/CLI-Mapping der v1-Capabilities
c) die Datenbanktabellen, die genau zu diesem MVP passen


Ich möchte nun unsere Ausarbeitung zu den capabilities in einer markdowndatei. Lese den Chat erneut und bringe eine kurze Beschreibung der Idee der Abstraktion mit capabilities in die Datei sowie ALLE capabilities mit kurzer Beschreibung (keine Auszüge oder Beispiele - sondern Alle möglixhe capabilities I'm Endausbau). Dann gehe in einem extra Kapitel auf die MVP V1 und MVP v1.1 capabilities genauer ein.

Hier ist die konsolidierte Markdown-Datei auf Basis der gesamten bisherigen Ausarbeitung:

# Capability-Based Architecture – Knowledge Base System

## 1. Grundidee der Capability-Abstraktion

Die Anwendung basiert auf einem **Capability-zentrierten Architekturansatz**.

Statt direkt auf Datenbankoperationen (CRUD) oder technische Strukturen zuzugreifen, werden alle Funktionen des Systems über **fachlich definierte Capabilities** bereitgestellt.

### Ziele dieser Abstraktion

- Einheitliche Schnittstelle für **UI, CLI, API, MCP und Agenten**
- Trennung von:
  - Datenmodell (Domain)
  - Persistenz (DB)
  - Nutzung (Capabilities)
- Stabilität gegenüber Änderungen im Datenbankschema
- Klare, explizite und agentenfreundliche Operationen
- Bessere Validierung, Auditierbarkeit und Erweiterbarkeit

### Prinzipien

- Jede Capability ist eine **fachlich sinnvolle Operation**
- Keine direkte DB-Manipulation durch Clients oder Agenten
- Strikte Input-/Output-Schemata
- Klare Trennung von:
  - Commands (write)
  - Queries (read)
- Capabilities sind die **einzige offizielle API des Systems**

---

# 2. Vollständige Capability-Liste (Endausbau)

## 2.1 Item Lifecycle

- create_item  
- update_item_core  
- archive_item  
- restore_item  
- delete_item (restriktiv, optional)

---

## 2.2 Content Management

- add_content_part  
- replace_content_part  
- append_to_content_part  
- remove_content_part  
- reorder_content_parts  

---

## 2.3 Asset Management

- register_asset  
- attach_asset_to_item  
- detach_asset_from_item  
- create_document_from_asset  
- generate_asset_preview  
- replace_asset  

---

## 2.4 Relations & Graph

- link_items  
- unlink_items  
- update_relation  
- list_related_items  
- find_path_between_items  
- cluster_related_items  

---

## 2.5 Labels & Classification

- assign_labels  
- remove_labels  
- classify_item  
- create_label  
- update_label  
- delete_label  
- merge_labels  

---

## 2.6 Metadata

- patch_item_metadata  
- replace_item_metadata  
- remove_metadata_keys  
- get_item_metadata_schema  
- validate_metadata  

---

## 2.7 Search & Retrieval

- search_content  
- get_item  
- list_items  
- search_by_metadata  
- search_by_relation  
- search_by_time  
- search_similar_content (semantisch)  
- get_item_snapshot  

---

## 2.8 Projects & Contexts

- create_project  
- update_project  
- archive_project  
- add_item_to_project  
- remove_item_from_project  
- list_project_items  
- summarize_project  

---

## 2.9 Temporal / Events / Tasks

- schedule_event  
- update_event  
- cancel_event  
- create_task  
- update_task  
- complete_task  
- reopen_task  
- set_task_priority  
- assign_task  

---

## 2.10 Measurements / Time Series

- create_measurement_series  
- update_measurement_series  
- record_measurement  
- update_measurement  
- delete_measurement  
- list_measurements  
- aggregate_measurements  

---

## 2.11 Summaries & Derived Content

- create_summary_from_sources  
- update_summary  
- regenerate_summary  
- link_summary_to_sources  
- create_extracted_content  
- merge_summaries  

---

## 2.12 Processes

- create_process  
- update_process  
- delete_process  
- record_process_execution  
- update_process_execution  
- link_process_to_items  

---

## 2.13 Audit / Provenance / History

- get_item_history  
- get_item_provenance  
- list_audit_events  
- trace_data_lineage  
- compare_item_versions  

---

## 2.14 Bulk / Import / Export

- bulk_create_items  
- bulk_update_items  
- bulk_link_items  
- import_document_batch  
- export_items  
- sync_external_source  

---

# 3. MVP Definition

## 3.1 Ziel von MVP v1

Ein stabiler, agentenfähiger Knowledge Base Core mit:

- Items
- Content
- Assets
- Beziehungen
- Labels/Klassifikation
- Metadaten
- Suche
- Projekte
- Audit/Provenance

Keine erweiterten Features wie:
- Prozesse
- OCR
- semantische Suche
- komplexe Automationen

---

# 4. MVP v1 Capabilities (Detail)

## 4.1 Lesen

### get_item
Lädt ein vollständiges Item mit optionalen Erweiterungen wie Content, Assets und Relationen.

### search_content
Zentrale Suchfunktion über Inhalte, Metadaten und Struktur.

### list_items
Deterministische Listen ohne Ranking, für strukturierte Navigation.

### list_related_items
Ermittelt direkte Beziehungen eines Items.

---

## 4.2 Item & Content

### create_note
Erstellt ein textbasiertes Wissensobjekt mit optionalen Metadaten und Klassifikation.

### update_item_core
Ändert grundlegende Eigenschaften eines Items (Titel, Status, Klassifikation).

### archive_item
Archiviert ein Item ohne physisches Löschen.

### add_content_part
Fügt neuen Inhalt zu einem Item hinzu.

### replace_content_part
Ersetzt bestehenden Inhalt vollständig.

---

## 4.3 Assets

### register_asset
Registriert eine Datei im System (technisch).

### attach_asset_to_item
Verknüpft eine Datei mit einem Item.

### create_document_from_asset
Erstellt ein Dokumenten-Item basierend auf einer Datei.

---

## 4.4 Beziehungen

### link_items
Verknüpft zwei Items semantisch.

### unlink_items
Entfernt eine bestehende Beziehung.

---

## 4.5 Strukturierung

### assign_labels
Weist Labels zu oder ersetzt sie.

### classify_item
Setzt fachliche Klassifikation unabhängig vom technischen Typ.

### patch_item_metadata
Erlaubt flexible Erweiterung und Änderung von Metadaten.

---

## 4.6 Projekte

### create_project
Erstellt einen Kontextcontainer für Items.

### add_item_to_project
Ordnet ein Item einem Projekt zu.

### list_project_items
Listet alle Inhalte eines Projekts.

---

## 4.7 Nachvollziehbarkeit

### get_item_history
Zeigt alle Änderungen eines Items.

### get_item_provenance
Zeigt Herkunft und Ableitungen eines Items.

---

# 5. MVP v1.1 Capabilities (Detail)

## 5.1 Summaries

### create_summary_from_sources
Erstellt ein neues Item als Zusammenfassung basierend auf anderen Items.

---

## 5.2 Tasks & Events

### create_task
Erstellt eine Aufgabe mit Status und Fälligkeit.

### complete_task
Markiert eine Aufgabe als abgeschlossen.

### schedule_event
Erstellt ein zeitgebundenes Ereignis.

---

## 5.3 Measurements

### create_measurement_series
Definiert eine Zeitreihe.

### record_measurement
Fügt einen Messwert hinzu.

### list_measurements
Listet Messwerte einer Serie.

---

## 5.4 Content Erweiterung

### append_to_content_part
Ergänzt bestehenden Inhalt inkrementell.

---

## 5.5 Labelsystem

### create_label
Erstellt neue Labels inkl. Hierarchie.

---

# 6. Zusammenfassung

Die Capability-Schicht ist das zentrale API des Systems und bildet:

- die Grundlage für Agentenintegration
- die Basis für CLI, API und MCP
- die Stabilität gegenüber zukünftigen Erweiterungen

Der MVP v1 konzentriert sich bewusst auf einen stabilen Core, auf dem alle weiteren Funktionen sauber aufbauen können.
Wenn du willst, kann ich als nächsten Schritt:

a) daraus direkt API + CLI Specs (OpenAPI + CLI Commands) ableiten
b) oder die konkreten Python Service Interfaces (uv-ready) generieren
c) oder das Datenbankschema exakt passend zu diesen Capabilities bauen


A

Gut. Dann leite ich aus den MVP-v1 Capabilities eine konkrete API (OpenAPI-fähig) und eine CLI-Spezifikation ab. Fokus: konsistent, agentenfähig, direkt implementierbar.

1. API Design Prinzipien
JSON-first (kein HTML)

deterministische Responses

klare Trennung:

/items (einfach)

/capabilities/* (fachlich)

Versioniert: /api/v1/...

Fehler standardisiert

Idempotenz wo sinnvoll

2. OpenAPI-nahe Struktur (vereinfacht, aber implementierbar)
2.1 Basisstruktur
openapi: 3.1.0
info:
  title: Knowledge Base API
  version: 1.0.0

servers:
  - url: /api/v1

components:
  schemas:
3. Core Schemas
3.1 Item
Item:
  type: object
  properties:
    id: { type: string }
    technical_type: { type: string }
    title: { type: string }
    status: { type: string }
    classification_keys:
      type: array
      items: { type: string }
    labels:
      type: array
      items: { type: string }
    metadata:
      type: object
      additionalProperties: true
    created_at: { type: string, format: date-time }
    updated_at: { type: string, format: date-time }
    version: { type: integer }
3.2 ContentPart
ContentPart:
  type: object
  properties:
    id: { type: string }
    content_type: { type: string }
    role: { type: string }
    body: { type: string }
    version: { type: integer }
3.3 Asset
Asset:
  type: object
  properties:
    id: { type: string }
    filename: { type: string }
    media_type: { type: string }
    size_bytes: { type: integer }
    sha256: { type: string }
3.4 Error
Error:
  type: object
  properties:
    code: { type: string }
    message: { type: string }
    details: { type: object }
4. API Endpoints (MVP v1)
4.1 Reading
GET /items/{id}
get:
  summary: Get item
  parameters:
    - in: path
      name: id
      required: true
      schema: { type: string }
    - in: query
      name: include
      schema:
        type: array
        items:
          enum: [content, assets, relations, metadata]
  responses:
    200:
      content:
        application/json:
          schema:
            type: object
            properties:
              item: { $ref: '#/components/schemas/Item' }
              content_parts:
                type: array
                items: { $ref: '#/components/schemas/ContentPart' }
              assets:
                type: array
                items: { $ref: '#/components/schemas/Asset' }
POST /capabilities/search_content
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          text: { type: string }
          technical_types:
            type: array
            items: { type: string }
          labels:
            type: array
            items: { type: string }
          page: { type: integer }
          page_size: { type: integer }

responses:
  200:
    content:
      application/json:
        schema:
          type: object
          properties:
            total_count: { type: integer }
            items:
              type: array
              items: { $ref: '#/components/schemas/Item' }
POST /capabilities/list_items
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          technical_type: { type: string }
          page: { type: integer }
          page_size: { type: integer }
POST /capabilities/list_related_items
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          item_id: { type: string }
          relation_types:
            type: array
            items: { type: string }
4.2 Item & Content
POST /capabilities/create_note
requestBody:
  content:
    application/json:
      schema:
        type: object
        required: [title, body]
        properties:
          title: { type: string }
          body: { type: string }
          labels:
            type: array
            items: { type: string }
          classification_keys:
            type: array
            items: { type: string }

responses:
  200:
    schema:
      type: object
      properties:
        item_id: { type: string }
POST /capabilities/update_item_core
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          item_id: { type: string }
          title: { type: string }
          status: { type: string }
POST /capabilities/archive_item
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          item_id: { type: string }
POST /capabilities/add_content_part
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          item_id: { type: string }
          content_type: { type: string }
          body: { type: string }
POST /capabilities/replace_content_part
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          content_part_id: { type: string }
          body: { type: string }
4.3 Assets
POST /capabilities/register_asset
(multipart upload empfohlen)

requestBody:
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          file:
            type: string
            format: binary
POST /capabilities/attach_asset_to_item
requestBody:
  schema:
    type: object
    properties:
      item_id: { type: string }
      asset_id: { type: string }
POST /capabilities/create_document_from_asset
requestBody:
  schema:
    type: object
    properties:
      asset_id: { type: string }
      title: { type: string }
4.4 Relations
POST /capabilities/link_items
requestBody:
  schema:
    type: object
    properties:
      from_item_id: { type: string }
      to_item_id: { type: string }
      relation_type: { type: string }
POST /capabilities/unlink_items
requestBody:
  schema:
    type: object
    properties:
      relation_id: { type: string }
4.5 Structure
POST /capabilities/assign_labels
requestBody:
  schema:
    type: object
    properties:
      item_id: { type: string }
      labels:
        type: array
        items: { type: string }
POST /capabilities/classify_item
requestBody:
  schema:
    type: object
    properties:
      item_id: { type: string }
      classification_keys:
        type: array
        items: { type: string }
POST /capabilities/patch_item_metadata
requestBody:
  schema:
    type: object
    properties:
      item_id: { type: string }
      set:
        type: object
      remove:
        type: array
        items: { type: string }
4.6 Projects
POST /capabilities/create_project
requestBody:
  schema:
    type: object
    properties:
      title: { type: string }
POST /capabilities/add_item_to_project
requestBody:
  schema:
    type: object
    properties:
      project_item_id: { type: string }
      item_id: { type: string }
POST /capabilities/list_project_items
requestBody:
  schema:
    type: object
    properties:
      project_item_id: { type: string }
4.7 Audit
POST /capabilities/get_item_history
requestBody:
  schema:
    type: object
    properties:
      item_id: { type: string }
POST /capabilities/get_item_provenance
requestBody:
  schema:
    type: object
    properties:
      item_id: { type: string }
5. CLI Design
5.1 Prinzipien
JSON-first Output (--json default für Agenten)

deterministische Struktur

keine versteckte Logik

1:1 Mapping auf Capabilities

5.2 CLI Namespace
kbase <domain> <action>
5.3 CLI Commands (MVP v1)
Reading
kbase item get <item_id> --include content,assets,relations --json

kbase search --text "versicherung" --type note --json

kbase item list --type project --json

kbase item related <item_id> --json
Item / Content
kbase note create --title "..." --body "..." --json

kbase item update <item_id> --title "..." --status active --json

kbase item archive <item_id> --json

kbase content add <item_id> --type markdown --file note.md --json

kbase content replace <content_part_id> --file new.md --json
Assets
kbase asset register ./file.pdf --json

kbase asset attach <asset_id> --to <item_id> --json

kbase document create-from-asset <asset_id> --title "..." --json
Relations
kbase link <from_id> <to_id> --type references --json

kbase unlink <relation_id> --json
Structure
kbase label assign <item_id> tag1 tag2 --json

kbase classify <item_id> finance bank --json

kbase metadata patch <item_id> --set amount=100 --remove old_field --json
Projects
kbase project create --title "Hauskauf" --json

kbase project add <project_id> <item_id> --json

kbase project list-items <project_id> --json
Audit
kbase history <item_id> --json

kbase provenance <item_id> --json
6. Bewertung
Dieses Setup liefert:

vollständige Agentenfähigkeit (CLI + API identisch)

klare Erweiterbarkeit Richtung MCP

saubere Trennung von Domain und Transport

direkte Umsetzbarkeit mit FastAPI + uv + Python Services

7. Nächster sinnvoller Schritt
Jetzt ergibt sich logisch:

a) Python Service Interfaces + uv Projektstruktur (direkt implementierbar)
b) Datenbankschema exakt passend zu diesen Endpoints
c) erste End-to-End Implementation (FastAPI + CLI + SQLite)


Hier ist das Datenbank Schema das wir in einem anderen Chat erarbeitet haben:

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

Passt das zu dem aktuellen Ansatz?


Nachgedacht für 10s
Ja — grundsätzlich passt es gut, aber nicht 1:1 zu dem aktuellen Ansatz.

Mein Urteil in einem Satz:

Das Schema passt fachlich sehr gut zu einer generischen Knowledge Base, ist aber an ein paar Stellen stärker datenbank- und feature-getrieben als capability- und domain-getrieben.

Was gut passt
1. Generischer Core
items, content_parts, item_links, item_metadata, item_labels treffen den Kern des aktuellen Ansatzes sehr gut.

Das unterstützt genau die Richtung:

generische Inhaltseinheit

getrennte Inhaltsteile

flexible Metadaten

explizite Beziehungen

Labels als eigenes Modell

2. Trennung von Struktur und Inhalt
Die Trennung zwischen:

items

content_parts

item_files

passt gut zur Idee, dass ein Wissensobjekt nicht nur „eine Datei“ ist.

3. Stammdaten für Typen und Relationen
item_kinds, content_part_kinds, link_types, workflow_states, metric_definitions passen gut zu einem kontrollierten, agentenfreundlichen System mit validierbaren Capabilities.

4. Metadatenmodell
Das Metadatenmodell mit:

metadata_groups

metadata_fields

group_fields

item_metadata

passt sehr gut zur Idee von flexiblen, erweiterbaren Metadaten.

5. Labels als Hierarchie
label_nodes + item_labels passt sehr gut zum gewünschten hierarchischen Label-Ansatz.

6. Zeitbezug
Mit

datetime_properties

recurrence_rules

item_occurrences

ist Zeit klar als eigener Modellaspekt abgebildet. Das passt inhaltlich gut.

Wo es nicht ganz zum aktuellen Ansatz passt
1. Asset-Modell ist noch nicht sauber genug getrennt
Der größte Punkt ist item_files.

Aktuell ist item_files direkt an item_id gebunden.
Damit ist eine Datei immer schon an ein Item gekoppelt.

Das passt nicht ideal zur Capability-Idee:

register_asset

attach_asset_to_item

create_document_from_asset

Denn dafür brauchst du eigentlich ein eigenständiges Asset als First-Class Entity.

Problem
Mit item_files kannst du technisch nicht sauber modellieren:

Datei erst registrieren

später an ein oder mehrere Items anhängen

dieselbe Datei mehrfach referenzieren

Datei unabhängig vom fachlichen Item verwalten

Empfehlung
Statt nur item_files besser:

assets

item_asset_links

Also z. B.:

assets
id

relative_path

original_filename

mime_type

size_bytes

checksum_sha256

created_at

item_asset_links
id

item_id

asset_id

role

caption

created_at

Dann passt es exakt zu den Capabilities.

2. Klassifikation ist aktuell zu eng
Im aktuellen Architekturansatz wollten wir klar trennen zwischen:

technischem Typ

fachlicher Klassifikation

Im Schema gibt es:

item_kind

category_key

Das ist schon nah dran, aber category_key ist nur ein einzelner Wert.

Problem
Wir hatten Mehrfachklassifikation vorgesehen, z. B.:

finanzen

bank

kredit

wohnung

Mit nur category_key geht das nicht sauber.

Empfehlung
category_key entweder nur als primäre Hauptkategorie behalten oder ersetzen durch:

item_classifications

item_id

category_key

source

confidence

created_at

Dann passt es viel besser zu classify_item.

3. Provenance und Audit sind noch nicht ausreichend als eigener Bereich modelliert
Für den aktuellen Ansatz mit Agenten ist das ein zentraler Punkt.

Es gibt schon gute Ansätze:

origin in items

source_method in content_parts

source und confidence in mehreren Tabellen

ingestion_runs

Das ist gut, aber noch nicht genug für die gewünschte Capability-Schicht.

Es fehlt vor allem
eine einheitliche Änderungs- und Provenance-Historie.

Für Capabilities wie:

get_item_history

get_item_provenance

brauchst du eigentlich explizit:

wer hat was geändert

über welchen Kanal

durch welche Operation

auf Basis welcher Quellobjekte

mit welchem Workflow / Agenten

Empfehlung
Zusätzliche Tabellen:

audit_events
id

item_id

operation_key

actor_type

actor_principal_id

channel

agent_name

workflow_id

request_id

event_payload_json

created_at

item_provenance
id

target_item_id

source_item_id

source_asset_id

method

confidence

note

created_at

Dann wird der Agentenansatz viel sauberer.

4. Versionierung von Content fehlt
content_parts hat created_at und updated_at, aber keine echte Versionierung.

Für Capabilities wie:

replace_content_part

später History / Compare / Restore

reicht updated_at nicht.

Empfehlung
Entweder:

Variante A: aktuelle Tabelle erweitern
version

is_current

und zusätzlich:

content_part_versions
id

content_part_id

version

content_text

structure_json

created_at

created_by_principal_id

Oder allgemeiner eine History-Tabelle.

5. content_parts ist textzentriert, aber noch etwas zu eng
Aktuell gibt es:

content_text

heading_path

token_count

etc.

Das ist für Text sehr gut.

Aber die Capability-Idee wollte auch ermöglichen:

markdown

structured_json

summary

checklist

extracted content

transcript

Mit nur content_text wird das schnell eng.

Empfehlung
content_parts ergänzen um etwas wie:

content_json

render_format

part_role

Dann bleibt der Ansatz offen.

6. Observation-Modell ist fachlich gut, aber architektonisch leicht außerhalb des Item-Kerns
observation_series und observations sind sauber modelliert.
Das ist fachlich stark.

Aber: In unserem aktuellen Ansatz hatten wir bewusst die Idee, dass Messreihen und Messwerte auch als Items modellierbar sein sollen, damit sie dieselben Mechanismen nutzen:

Links

Labels

Suche

Projekte

Provenance

Im aktuellen Schema ist das nur teilweise so, weil observation_series.item_id optional ist.

Bewertung
Das ist kein harter Fehler, aber eine Architekturentscheidung.

Optionen
Option 1: so lassen
Gut, wenn du Zeitreihen als eigenen fachlichen Subbereich behandeln willst.

Option 2: stärker integrieren
Messreihe = Item

Messwert = Item

numerische Daten zusätzlich in Observation-Tabellen oder Metadata

Für die Capability-Philosophie wäre Option 2 konsistenter, aber auch schwerer.

Meine Einschätzung:
Für jetzt ist dein Modell okay, solange du bewusst sagst:
Zeitreihen sind ein spezialisierter Subdomain-Bereich.

7. Multiuser / ACL ist für den Endausbau passend, für MVP aber schwergewichtig
Die Tabellen

principals

principal_memberships

item_acl

observation_series_acl

item_subjects

passen gut zum Endausbau und zu Agenten/Rechten.

Aber für den aktuellen MVP-Ansatz sind sie eher vorauseilend komplex.

Meine Bewertung
für Endausbau: gut

für MVP v1: wahrscheinlich zu viel

Ich würde sie nicht verwerfen, aber im ersten Umsetzungsschnitt möglicherweise nur minimal nutzen.

8. Tasks / Events / Notifications sind schon weiter als der aktuelle MVP
Die Tabellen für:

item_states

datetime_properties

recurrence_rules

notifications

item_occurrences

passen gut zum langfristigen Ziel.

Aber sie liegen eher auf dem Niveau von v1.1 bis später, nicht auf dem harten Core-v1.

Das ist okay, solange ihr wisst:
Das ist schon Ausbau, nicht nur MVP-Kern.

9. Saved Queries passt gut
saved_queries passt sehr gut zum aktuellen Ansatz.

Gerade für:

CLI

Agenten

wiederholbare Suchen

spätere MCP-Ressourcen

ist das sinnvoll.

Gesamteinschätzung
Was ich sagen würde:
Ja, das Schema passt insgesamt gut zum aktuellen Ansatz — etwa zu 80–85 %.

Die Grundrichtung stimmt klar:

generischer Kern

Inhalte, Metadaten, Labels, Links

Zeitmodell

spätere Erweiterbarkeit

agentische Nutzbarkeit

Die wichtigsten Abweichungen sind:
kein sauberes eigenständiges Asset-Modell

Klassifikation nur einfach statt mehrfach

Audit/Provenance nicht stark genug als eigener Bereich

keine echte Content-Versionierung

Content Parts noch etwas zu textlastig

Meine konkrete Empfehlung
Ich würde das Schema nicht verwerfen, sondern gezielt anpassen.

Die 5 wichtigsten Änderungen
1. item_files aufspalten
in:

assets

item_asset_links

2. Mehrfachklassifikation einführen
zusätzlich zu category_key oder statt dessen:

item_classifications

3. Audit- und Provenance-Tabellen ergänzen
für echte Capability-/Agenten-Nachvollziehbarkeit

4. Versionierung für content_parts
einbauen

5. content_parts um strukturierte Inhalte erweitern
z. B. content_json, part_role, render_format

Mein Fazit
Das Schema ist eine gute Basis und kompatibel mit dem aktuellen Architekturansatz, aber noch nicht ganz auf Capability-First und Agent-First geschärft.

Die Architekturidee ist:

Domain Core

Capability Layer

mehrere Adapter

Dazu muss das Schema vor allem bei Assets, Provenance, Versionierung und Mehrfachklassifikation noch etwas nachgezogen werden.

Als nächsten sinnvollen Schritt würde ich dir das Schema gezielt refactoren und eine v2-SQL-Version daraus bauen, die exakt auf unseren aktuellen Ansatz passt.


Passe das Schema an. Plane es gleich für den weiteren Ausbau, auch wenn einige Tabellen/Konzepte erst später verwendet werden. Binde auch das Zugriffskonzept mit ein. Auch im MVP möchte ich für mich und meine Frau unterschiedliche.inhalte.sichtbar haben. Erstelle das komplette neue Schema ohne viel Diskussion und Begründungen.

Hier ist das angepasste, konsistente Schema (v2) – ausgerichtet auf:

Capability-first Architektur

Agentenfähigkeit (Audit, Provenance)

saubere Asset-Trennung

Mehrfachklassifikation

Multi-User / ACL von Anfang an

Erweiterbarkeit (Zeit, Prozesse, Observations, etc.)

Keine Kommentare zur Herleitung – nur das Zielschema.

PRAGMA foreign_keys = ON;

-- =========================================================
-- 1) STAMMDATEN / ENUMS
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
    value_type TEXT NOT NULL,
    description TEXT
);

-- =========================================================
-- 2) PRINCIPALS / USERS / GROUPS
-- =========================================================

CREATE TABLE principals (
    id TEXT PRIMARY KEY,
    principal_type TEXT NOT NULL,        -- person, group, service
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

-- =========================================================
-- 3) CORE ITEMS
-- =========================================================

CREATE TABLE items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    item_kind TEXT NOT NULL,
    primary_category_key TEXT,
    status TEXT,
    origin TEXT NOT NULL,                -- manual, import, generated
    language_code TEXT,
    created_by_principal_id TEXT,
    parent_item_id TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (item_kind) REFERENCES item_kinds(key),
    FOREIGN KEY (primary_category_key) REFERENCES item_categories(key),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    FOREIGN KEY (parent_item_id) REFERENCES items(id)
);

-- Mehrfachklassifikation

CREATE TABLE item_classifications (
    item_id TEXT NOT NULL,
    category_key TEXT NOT NULL,
    source TEXT NOT NULL,                -- manual, inferred, imported
    confidence REAL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, category_key),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (category_key) REFERENCES item_categories(key)
);

-- =========================================================
-- 4) ASSETS (NEU)
-- =========================================================

CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    relative_path TEXT NOT NULL,
    original_filename TEXT,
    extension TEXT,
    mime_type TEXT,
    size_bytes INTEGER,
    checksum_sha256 TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE item_asset_links (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    role TEXT NOT NULL,                  -- primary, attachment, preview, source
    caption TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- =========================================================
-- 5) CONTENT PARTS (ERWEITERT + VERSIONIERUNG)
-- =========================================================

CREATE TABLE content_parts (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    part_kind TEXT NOT NULL,
    part_role TEXT,                      -- primary, summary, extracted, appendix
    sequence_no INTEGER NOT NULL DEFAULT 0,
    page_no INTEGER,
    heading_path TEXT,
    content_text TEXT,
    content_json TEXT,
    render_format TEXT,                  -- markdown, plain, json
    source_method TEXT NOT NULL,
    quality_score REAL,
    token_count INTEGER,
    language_code TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_current INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (part_kind) REFERENCES content_part_kinds(key)
);

CREATE TABLE content_part_versions (
    id TEXT PRIMARY KEY,
    content_part_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    content_text TEXT,
    content_json TEXT,
    created_at TEXT NOT NULL,
    created_by_principal_id TEXT,
    FOREIGN KEY (content_part_id) REFERENCES content_parts(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);

-- =========================================================
-- 6) RELATIONS / GRAPH
-- =========================================================

CREATE TABLE item_links (
    id TEXT PRIMARY KEY,
    from_item_id TEXT NOT NULL,
    to_item_id TEXT NOT NULL,
    link_type TEXT NOT NULL,
    source TEXT NOT NULL,
    confidence REAL,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (from_item_id) REFERENCES items(id),
    FOREIGN KEY (to_item_id) REFERENCES items(id),
    FOREIGN KEY (link_type) REFERENCES link_types(key)
);

-- =========================================================
-- 7) METADATA (UNVERÄNDERT MIT KLEINEN ERWEITERUNGEN)
-- =========================================================

CREATE TABLE metadata_groups (
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL,
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
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    value_text TEXT,
    value_number REAL,
    value_date TEXT,
    value_datetime TEXT,
    value_bool INTEGER,
    value_json TEXT,
    source TEXT NOT NULL,
    confidence REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (field_id) REFERENCES metadata_fields(id)
);

-- =========================================================
-- 8) LABELS
-- =========================================================

CREATE TABLE label_nodes (
    id TEXT PRIMARY KEY,
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
    source TEXT NOT NULL,
    confidence REAL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (item_id, label_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (label_id) REFERENCES label_nodes(id)
);

-- =========================================================
-- 9) ACL / ZUGRIFF
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

-- =========================================================
-- 10) AUDIT / PROVENANCE (NEU)
-- =========================================================

CREATE TABLE audit_events (
    id TEXT PRIMARY KEY,
    item_id TEXT,
    operation_key TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    actor_principal_id TEXT,
    channel TEXT,
    agent_name TEXT,
    workflow_id TEXT,
    request_id TEXT,
    payload_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (actor_principal_id) REFERENCES principals(id)
);

CREATE TABLE item_provenance (
    id TEXT PRIMARY KEY,
    target_item_id TEXT NOT NULL,
    source_item_id TEXT,
    source_asset_id TEXT,
    method TEXT NOT NULL,
    confidence REAL,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (target_item_id) REFERENCES items(id),
    FOREIGN KEY (source_item_id) REFERENCES items(id),
    FOREIGN KEY (source_asset_id) REFERENCES assets(id)
);

-- =========================================================
-- 11) TEMPORAL / TASK / EVENT
-- =========================================================

CREATE TABLE item_states (
    item_id TEXT PRIMARY KEY,
    workflow_type TEXT NOT NULL,
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
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    property_key TEXT NOT NULL,
    value_datetime TEXT NOT NULL,
    timezone TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE recurrence_rules (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    rule_text TEXT NOT NULL,
    anchor_datetime TEXT,
    timezone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- =========================================================
-- 12) OBSERVATIONS / ZEITREIHEN
-- =========================================================

CREATE TABLE observation_series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    unit TEXT,
    value_type TEXT NOT NULL,
    subject_principal_id TEXT,
    created_by_principal_id TEXT,
    item_id TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (metric_key) REFERENCES metric_definitions(key),
    FOREIGN KEY (subject_principal_id) REFERENCES principals(id),
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE observations (
    id TEXT PRIMARY KEY,
    series_id TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    value_number REAL,
    value_text TEXT,
    value_bool INTEGER,
    value_json TEXT,
    note TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (series_id) REFERENCES observation_series(id)
);

-- =========================================================
-- 13) INGESTION / PROCESSING
-- =========================================================

CREATE TABLE ingestion_runs (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    run_type TEXT NOT NULL,
    tool_name TEXT,
    tool_version TEXT,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    note TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE saved_queries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    query_json TEXT NOT NULL,
    created_by_principal_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by_principal_id) REFERENCES principals(id)
);
Kurzfazit (ohne Diskussion)
Dieses Schema ist jetzt:

konsistent mit den Capabilities

agentenfähig (Audit + Provenance)

sauber getrennt (Assets vs Items)

multi-user ready (ACL)

erweiterbar (Zeit, Prozesse, Observations)

stabil für MVP und Endausbau

Nächster sinnvoller Schritt
a) Repository + Service Layer (Python, uv-ready)
b) konkrete Migration vom alten Schema
c) erste End-to-End Implementierung (FastAPI + CLI + SQLite)


Erstelle noch die wichtigsten Indizes, damit die Datenbank von Anfang an möglichst effizient arbeitet. 

Hier sind die zentralen Indizes für dein Schema – fokussiert auf:

schnelle Suche (Items, Content, Labels)

effiziente Relations

ACL / Multiuser

Metadatenfilter

Zeitbasierte Queries

Agentische Workloads

-- =========================================================
-- 1) ITEMS
-- =========================================================

CREATE INDEX idx_items_kind ON items(item_kind);
CREATE INDEX idx_items_primary_category ON items(primary_category_key);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_at ON items(created_at);
CREATE INDEX idx_items_updated_at ON items(updated_at);
CREATE INDEX idx_items_archived ON items(is_archived);
CREATE INDEX idx_items_parent ON items(parent_item_id);
CREATE INDEX idx_items_created_by ON items(created_by_principal_id);

-- Kombiniert für typische Filter
CREATE INDEX idx_items_kind_status_archived 
ON items(item_kind, status, is_archived);

-- =========================================================
-- 2) ITEM CLASSIFICATIONS
-- =========================================================

CREATE INDEX idx_item_classifications_item 
ON item_classifications(item_id);

CREATE INDEX idx_item_classifications_category 
ON item_classifications(category_key);

CREATE INDEX idx_item_classifications_category_item 
ON item_classifications(category_key, item_id);

-- =========================================================
-- 3) CONTENT PARTS
-- =========================================================

CREATE INDEX idx_content_parts_item 
ON content_parts(item_id);

CREATE INDEX idx_content_parts_item_seq 
ON content_parts(item_id, sequence_no);

CREATE INDEX idx_content_parts_part_kind 
ON content_parts(part_kind);

CREATE INDEX idx_content_parts_role 
ON content_parts(part_role);

CREATE INDEX idx_content_parts_current 
ON content_parts(is_current);

-- Optional für spätere Textsuche (SQLite FTS separat sinnvoll)
-- CREATE VIRTUAL TABLE content_parts_fts USING fts5(content_text);

-- =========================================================
-- 4) CONTENT VERSIONING
-- =========================================================

CREATE INDEX idx_content_part_versions_part 
ON content_part_versions(content_part_id);

CREATE INDEX idx_content_part_versions_version 
ON content_part_versions(content_part_id, version);

-- =========================================================
-- 5) ASSETS
-- =========================================================

CREATE INDEX idx_assets_checksum 
ON assets(checksum_sha256);

CREATE INDEX idx_assets_mime_type 
ON assets(mime_type);

CREATE INDEX idx_assets_created_at 
ON assets(created_at);

-- =========================================================
-- 6) ITEM-ASSET LINKS
-- =========================================================

CREATE INDEX idx_item_asset_links_item 
ON item_asset_links(item_id);

CREATE INDEX idx_item_asset_links_asset 
ON item_asset_links(asset_id);

CREATE INDEX idx_item_asset_links_role 
ON item_asset_links(role);

-- =========================================================
-- 7) RELATIONS / GRAPH
-- =========================================================

CREATE INDEX idx_item_links_from 
ON item_links(from_item_id);

CREATE INDEX idx_item_links_to 
ON item_links(to_item_id);

CREATE INDEX idx_item_links_type 
ON item_links(link_type);

CREATE INDEX idx_item_links_from_type 
ON item_links(from_item_id, link_type);

CREATE INDEX idx_item_links_to_type 
ON item_links(to_item_id, link_type);

-- =========================================================
-- 8) METADATA
-- =========================================================

CREATE INDEX idx_item_metadata_item 
ON item_metadata(item_id);

CREATE INDEX idx_item_metadata_field 
ON item_metadata(field_id);

CREATE INDEX idx_item_metadata_item_field 
ON item_metadata(item_id, field_id);

-- Wertbasierte Indizes (wichtig für Filter)
CREATE INDEX idx_item_metadata_value_text 
ON item_metadata(value_text);

CREATE INDEX idx_item_metadata_value_number 
ON item_metadata(value_number);

CREATE INDEX idx_item_metadata_value_date 
ON item_metadata(value_date);

CREATE INDEX idx_item_metadata_value_datetime 
ON item_metadata(value_datetime);

-- =========================================================
-- 9) LABELS
-- =========================================================

CREATE INDEX idx_item_labels_item 
ON item_labels(item_id);

CREATE INDEX idx_item_labels_label 
ON item_labels(label_id);

CREATE INDEX idx_item_labels_label_item 
ON item_labels(label_id, item_id);

CREATE INDEX idx_label_nodes_parent 
ON label_nodes(parent_id);

CREATE INDEX idx_label_nodes_full_path 
ON label_nodes(full_path);

-- =========================================================
-- 10) ACL
-- =========================================================

CREATE INDEX idx_item_acl_item 
ON item_acl(item_id);

CREATE INDEX idx_item_acl_principal 
ON item_acl(principal_id);

CREATE INDEX idx_item_acl_principal_permission 
ON item_acl(principal_id, permission_key);

-- Wichtig für Zugriff + Filter
CREATE INDEX idx_item_acl_item_principal 
ON item_acl(item_id, principal_id);

-- =========================================================
-- 11) AUDIT
-- =========================================================

CREATE INDEX idx_audit_events_item 
ON audit_events(item_id);

CREATE INDEX idx_audit_events_actor 
ON audit_events(actor_principal_id);

CREATE INDEX idx_audit_events_operation 
ON audit_events(operation_key);

CREATE INDEX idx_audit_events_created_at 
ON audit_events(created_at);

-- =========================================================
-- 12) PROVENANCE
-- =========================================================

CREATE INDEX idx_item_provenance_target 
ON item_provenance(target_item_id);

CREATE INDEX idx_item_provenance_source_item 
ON item_provenance(source_item_id);

CREATE INDEX idx_item_provenance_source_asset 
ON item_provenance(source_asset_id);

-- =========================================================
-- 13) TEMPORAL
-- =========================================================

CREATE INDEX idx_datetime_properties_item 
ON datetime_properties(item_id);

CREATE INDEX idx_datetime_properties_key 
ON datetime_properties(property_key);

CREATE INDEX idx_datetime_properties_value 
ON datetime_properties(value_datetime);

CREATE INDEX idx_datetime_properties_item_key 
ON datetime_properties(item_id, property_key);

-- =========================================================
-- 14) ITEM STATES
-- =========================================================

CREATE INDEX idx_item_states_workflow 
ON item_states(workflow_type);

CREATE INDEX idx_item_states_state 
ON item_states(state_key);

CREATE INDEX idx_item_states_updated_at 
ON item_states(updated_at);

-- =========================================================
-- 15) RECURRENCE
-- =========================================================

CREATE INDEX idx_recurrence_rules_item 
ON recurrence_rules(item_id);

CREATE INDEX idx_recurrence_rules_active 
ON recurrence_rules(is_active);

-- =========================================================
-- 16) OBSERVATIONS
-- =========================================================

CREATE INDEX idx_observation_series_metric 
ON observation_series(metric_key);

CREATE INDEX idx_observation_series_item 
ON observation_series(item_id);

CREATE INDEX idx_observations_series 
ON observations(series_id);

CREATE INDEX idx_observations_time 
ON observations(observed_at);

CREATE INDEX idx_observations_series_time 
ON observations(series_id, observed_at);

-- =========================================================
-- 17) INGESTION
-- =========================================================

CREATE INDEX idx_ingestion_runs_item 
ON ingestion_runs(item_id);

CREATE INDEX idx_ingestion_runs_type 
ON ingestion_runs(run_type);

CREATE INDEX idx_ingestion_runs_status 
ON ingestion_runs(status);

CREATE INDEX idx_ingestion_runs_started 
ON ingestion_runs(started_at);

-- =========================================================
-- 18) SAVED QUERIES
-- =========================================================

CREATE INDEX idx_saved_queries_created_by 
ON saved_queries(created_by_principal_id);

CREATE INDEX idx_saved_queries_created_at 
ON saved_queries(created_at);
Kurzbewertung der Index-Strategie
Dieses Setup deckt ab:

🔍 Suche & Filter
Items nach Typ, Status, Labels, Kategorien

Metadatenfilter performant

Zeitfilter performant

🔗 Graph / Relations
schnelle traversal (from/to + type)

👤 Multiuser / ACL
schnelle Zugriffskontrolle pro User

🧠 Agenten-Workloads
stabile lookups über IDs

gute Bulk-Operation Performance

Audit/Provenance effizient lesbar

⏱ Zeit & Serien
Zeitreihen performant (series_id + time)

Events/Tasks effizient filterbar

Eine wichtige Ergänzung (sehr empfohlen)
Für echte Suche solltest du später zusätzlich:

SQLite FTS5
CREATE VIRTUAL TABLE content_parts_fts 
USING fts5(content_text, content='content_parts', content_rowid='rowid');
Das ist entscheidend für:

search_content

Agenten-Retrieval

schnelle Volltextsuche

Fazit
Die Indizes sind:

nicht überoptimiert

aber vollständig für deinen Use Case

kompatibel mit MVP und späterem Ausbau

gut für lokale SQLite + später Postgres migrierbar

Nächster sinnvoller Schritt
a) konkrete SQL Queries für search_content + ACL integriert
b) Repository Layer (Python, direkt nutzbar mit uv)
c) erstes Setup (FastAPI + CLI + DB init)


A

Gut. Dann definieren wir jetzt die konkreten SQL-Queries für search_content, inkl. ACL, Filter, Pagination und erweiterbarer Struktur.

Ich gebe dir:

Basis-Query (ohne Volltext)

Erweiterung mit Volltext (FTS)

Filter (Labels, Metadata, Zeit)

ACL integriert

Final zusammengesetzte Query

Performance-Hinweise

1. Ziel der Query
search_content muss können:

Textsuche (optional)

Filter:

item_kind

classification

labels

metadata

Zeit

ACL berücksichtigen

Pagination

Sortierung

2. Basis-Query (ohne Volltext)
SELECT
    i.id,
    i.title,
    i.item_kind,
    i.status,
    i.created_at,
    i.updated_at
FROM items i

-- ACL (wichtig!)
JOIN item_acl acl
    ON acl.item_id = i.id
   AND acl.principal_id = :principal_id

WHERE
    i.is_archived = 0
3. Filter: item_kind / status
AND (:item_kind IS NULL OR i.item_kind = :item_kind)
AND (:status IS NULL OR i.status = :status)
4. Filter: Klassifikation
AND (
    :category_key IS NULL OR
    EXISTS (
        SELECT 1
        FROM item_classifications ic
        WHERE ic.item_id = i.id
          AND ic.category_key = :category_key
    )
)
5. Filter: Labels
AND (
    :label_id IS NULL OR
    EXISTS (
        SELECT 1
        FROM item_labels il
        WHERE il.item_id = i.id
          AND il.label_id = :label_id
    )
)
Für mehrere Labels (AND-Semantik):

AND (
    :label_count = 0 OR
    (
        SELECT COUNT(*)
        FROM item_labels il
        WHERE il.item_id = i.id
          AND il.label_id IN (:label_ids)
    ) = :label_count
)
6. Filter: Metadata
Beispiel (numeric):

AND (
    :amount_min IS NULL OR
    EXISTS (
        SELECT 1
        FROM item_metadata im
        JOIN metadata_fields mf ON mf.id = im.field_id
        WHERE im.item_id = i.id
          AND mf.key = 'amount'
          AND im.value_number >= :amount_min
    )
)
7. Filter: Zeit
AND (
    :from_date IS NULL OR i.created_at >= :from_date
)
AND (
    :to_date IS NULL OR i.created_at <= :to_date
)
Oder über datetime_properties:

AND (
    :due_before IS NULL OR
    EXISTS (
        SELECT 1
        FROM datetime_properties dp
        WHERE dp.item_id = i.id
          AND dp.property_key = 'due_at'
          AND dp.value_datetime <= :due_before
    )
)
8. Volltextsuche (FTS5)
JOIN content_parts_fts fts
    ON fts.rowid = (
        SELECT rowid FROM content_parts cp
        WHERE cp.id = fts.rowid
    )

WHERE fts.content_text MATCH :query
Besser (direkt über item_id):

AND (
    :query IS NULL OR
    EXISTS (
        SELECT 1
        FROM content_parts_fts fts
        JOIN content_parts cp ON cp.rowid = fts.rowid
        WHERE cp.item_id = i.id
          AND fts.content_text MATCH :query
    )
)
9. Sortierung
ORDER BY
    CASE WHEN :sort = 'updated_at' THEN i.updated_at END DESC,
    CASE WHEN :sort = 'created_at' THEN i.created_at END DESC,
    i.id
10. Pagination
LIMIT :limit
OFFSET :offset
11. Finale Query (kombiniert)
SELECT
    i.id,
    i.title,
    i.item_kind,
    i.status,
    i.created_at,
    i.updated_at
FROM items i

JOIN item_acl acl
    ON acl.item_id = i.id
   AND acl.principal_id = :principal_id

WHERE
    i.is_archived = 0

    -- type / status
    AND (:item_kind IS NULL OR i.item_kind = :item_kind)
    AND (:status IS NULL OR i.status = :status)

    -- classification
    AND (
        :category_key IS NULL OR
        EXISTS (
            SELECT 1 FROM item_classifications ic
            WHERE ic.item_id = i.id
              AND ic.category_key = :category_key
        )
    )

    -- labels
    AND (
        :label_count = 0 OR
        (
            SELECT COUNT(*) FROM item_labels il
            WHERE il.item_id = i.id
              AND il.label_id IN (:label_ids)
        ) = :label_count
    )

    -- metadata example
    AND (
        :amount_min IS NULL OR
        EXISTS (
            SELECT 1
            FROM item_metadata im
            JOIN metadata_fields mf ON mf.id = im.field_id
            WHERE im.item_id = i.id
              AND mf.key = 'amount'
              AND im.value_number >= :amount_min
        )
    )

    -- time
    AND (:from_date IS NULL OR i.created_at >= :from_date)
    AND (:to_date IS NULL OR i.created_at <= :to_date)

    -- fulltext
    AND (
        :query IS NULL OR
        EXISTS (
            SELECT 1
            FROM content_parts_fts fts
            JOIN content_parts cp ON cp.rowid = fts.rowid
            WHERE cp.item_id = i.id
              AND fts.content_text MATCH :query
        )
    )

ORDER BY
    CASE WHEN :sort = 'updated_at' THEN i.updated_at END DESC,
    CASE WHEN :sort = 'created_at' THEN i.created_at END DESC,
    i.id

LIMIT :limit
OFFSET :offset;
12. Wichtige Performance-Hinweise
12.1 ACL ist der wichtigste Filter
→ muss früh im Query sein (JOIN wie oben)

12.2 EXISTS statt JOIN für Filter
→ verhindert Row Explosion

12.3 Label AND-Filter ist teuer
→ später optimierbar mit:

Materialized Views

Bitsets

Precomputed tables

12.4 Metadata Queries skalieren schlecht
→ später evtl:

Index pro Field

JSON-Index

Search Projection

12.5 FTS unbedingt nutzen
→ sonst wird Suche sehr langsam

13. Erweiterung später (Roadmap)
Diese Query ist bewusst:

korrekt

flexibel

nicht maximal optimiert

Später kannst du ergänzen:

Ranking (BM25)

Facets (counts)

Hybrid Search (vector + bm25)

Precomputed Search Table

Fazit
Das ist eine:

vollständige search_content SQL Grundlage

kompatibel mit deinem Schema

direkt nutzbar im Repository Layer

agentenfähig

erweiterbar

Nächster sinnvoller Schritt
a) Python Repository + Query Builder (uv-ready)
b) Mapping dieser Query in FastAPI Endpoint
c) CLI Integration (kbase search)


A (Ergebnis mit minimalen erläuterungen)

Hier ist ein minimaler, direkt nutzbarer Repository + Query Builder (Python, uv-ready) für search_content.

1) Projektsetup (uv)
uv init kbase
cd kbase
uv add pydantic sqlite-utils
2) search_repository.py
from dataclasses import dataclass, field
from typing import Optional, List, Any, Dict
import sqlite3


# =========================
# Query DTO
# =========================

@dataclass
class SearchQuery:
    principal_id: str

    text: Optional[str] = None
    item_kind: Optional[str] = None
    status: Optional[str] = None

    category_key: Optional[str] = None

    label_ids: List[str] = field(default_factory=list)

    amount_min: Optional[float] = None

    from_date: Optional[str] = None
    to_date: Optional[str] = None

    sort: str = "updated_at"
    limit: int = 50
    offset: int = 0


# =========================
# Result DTO
# =========================

@dataclass
class SearchResultItem:
    id: str
    title: str
    item_kind: str
    status: Optional[str]
    created_at: str
    updated_at: str


# =========================
# Query Builder
# =========================

class SearchQueryBuilder:

    def build(self, q: SearchQuery) -> tuple[str, Dict[str, Any]]:
        where = []
        params: Dict[str, Any] = {}

        # ACL + base
        base = """
        SELECT
            i.id,
            i.title,
            i.item_kind,
            i.status,
            i.created_at,
            i.updated_at
        FROM items i
        JOIN item_acl acl
            ON acl.item_id = i.id
           AND acl.principal_id = :principal_id
        """
        params["principal_id"] = q.principal_id

        where.append("i.is_archived = 0")

        # type/status
        if q.item_kind:
            where.append("i.item_kind = :item_kind")
            params["item_kind"] = q.item_kind

        if q.status:
            where.append("i.status = :status")
            params["status"] = q.status

        # classification
        if q.category_key:
            where.append("""
            EXISTS (
                SELECT 1 FROM item_classifications ic
                WHERE ic.item_id = i.id
                  AND ic.category_key = :category_key
            )
            """)
            params["category_key"] = q.category_key

        # labels (AND semantics)
        if q.label_ids:
            where.append(f"""
            (
                SELECT COUNT(*) FROM item_labels il
                WHERE il.item_id = i.id
                  AND il.label_id IN ({",".join([f":label_{i}" for i in range(len(q.label_ids))])})
            ) = {len(q.label_ids)}
            """)
            for i, lid in enumerate(q.label_ids):
                params[f"label_{i}"] = lid

        # metadata example
        if q.amount_min is not None:
            where.append("""
            EXISTS (
                SELECT 1
                FROM item_metadata im
                JOIN metadata_fields mf ON mf.id = im.field_id
                WHERE im.item_id = i.id
                  AND mf.key = 'amount'
                  AND im.value_number >= :amount_min
            )
            """)
            params["amount_min"] = q.amount_min

        # time
        if q.from_date:
            where.append("i.created_at >= :from_date")
            params["from_date"] = q.from_date

        if q.to_date:
            where.append("i.created_at <= :to_date")
            params["to_date"] = q.to_date

        # fulltext
        if q.text:
            where.append("""
            EXISTS (
                SELECT 1
                FROM content_parts_fts fts
                JOIN content_parts cp ON cp.rowid = fts.rowid
                WHERE cp.item_id = i.id
                  AND fts.content_text MATCH :query
            )
            """)
            params["query"] = q.text

        # WHERE clause
        where_sql = " WHERE " + "\n AND ".join(where)

        # sorting
        order_sql = """
        ORDER BY
            CASE WHEN :sort = 'updated_at' THEN i.updated_at END DESC,
            CASE WHEN :sort = 'created_at' THEN i.created_at END DESC,
            i.id
        """
        params["sort"] = q.sort

        # pagination
        limit_sql = " LIMIT :limit OFFSET :offset"
        params["limit"] = q.limit
        params["offset"] = q.offset

        sql = base + where_sql + order_sql + limit_sql
        return sql, params


# =========================
# Repository
# =========================

class SearchRepository:

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn
        self.builder = SearchQueryBuilder()

    def search(self, query: SearchQuery) -> List[SearchResultItem]:
        sql, params = self.builder.build(query)

        cur = self.conn.execute(sql, params)
        rows = cur.fetchall()

        return [
            SearchResultItem(
                id=row[0],
                title=row[1],
                item_kind=row[2],
                status=row[3],
                created_at=row[4],
                updated_at=row[5],
            )
            for row in rows
        ]
3) Minimal Usage
import sqlite3
from search_repository import SearchRepository, SearchQuery

conn = sqlite3.connect("kbase.db")

repo = SearchRepository(conn)

query = SearchQuery(
    principal_id="user_1",
    text="versicherung",
    item_kind="note",
    limit=10
)

results = repo.search(query)

for r in results:
    print(r)
4) Optional: FTS Setup (einmalig)
CREATE VIRTUAL TABLE content_parts_fts 
USING fts5(content_text, content='content_parts', content_rowid='rowid');
Ergebnis
direkt nutzbar

sauber getrennt (DTO / Builder / Repo)

kompatibel mit deinem Schema

CLI/API ready

erweiterbar ohne Refactor

Nächster Schritt
a) FastAPI Endpoint darauf aufbauen
b) CLI (kbase search) anbinden
c) weitere Capabilities als Repositories ergänzen


Bei queries bitte immer Security, Hacker etc. mitdenken (z.B. SQL injection, prompt injection, etc.)

Ab jetzt gilt: Queries sind immer sicherheitsgehärtet.
Hier ist die überarbeitete Version des Repositories, mit Fokus auf:

SQL Injection Schutz

sichere Parameterbindung

Whitelisting (Sort / Felder)

Input-Sanitizing (FTS / Query)

DoS-Schutz (Limits)

1. Sicherheitsprinzipien (kurz)
keine String-Konkatenation für SQL

nur parametrisierte Queries

Whitelist statt freie Strings

FTS-Query sanitizen

Limits erzwingen

ACL immer im Query

2. Sichere Implementierung
from dataclasses import dataclass, field
from typing import Optional, List, Any, Dict
import sqlite3
import re


# =========================
# CONFIG / SECURITY LIMITS
# =========================

MAX_LIMIT = 100
DEFAULT_LIMIT = 50

ALLOWED_SORT_FIELDS = {"updated_at", "created_at"}


# =========================
# DTO
# =========================

@dataclass
class SearchQuery:
    principal_id: str

    text: Optional[str] = None
    item_kind: Optional[str] = None
    status: Optional[str] = None

    category_key: Optional[str] = None
    label_ids: List[str] = field(default_factory=list)

    amount_min: Optional[float] = None

    from_date: Optional[str] = None
    to_date: Optional[str] = None

    sort: str = "updated_at"
    limit: int = DEFAULT_LIMIT
    offset: int = 0


@dataclass
class SearchResultItem:
    id: str
    title: str
    item_kind: str
    status: Optional[str]
    created_at: str
    updated_at: str


# =========================
# SECURITY HELPERS
# =========================

def sanitize_fts_query(text: str) -> str:
    """
    Entfernt gefährliche Zeichen für FTS / verhindert Injection / DoS
    """
    if not text:
        return text

    # Nur einfache Tokens erlauben
    text = re.sub(r"[^\w\s\-]", " ", text)

    # Mehrfachspaces entfernen
    text = re.sub(r"\s+", " ", text).strip()

    # Länge begrenzen (DoS Schutz)
    return text[:200]


def validate_sort(sort: str) -> str:
    if sort not in ALLOWED_SORT_FIELDS:
        return "updated_at"
    return sort


def clamp_limit(limit: int) -> int:
    if limit <= 0:
        return DEFAULT_LIMIT
    return min(limit, MAX_LIMIT)


# =========================
# QUERY BUILDER
# =========================

class SearchQueryBuilder:

    def build(self, q: SearchQuery) -> tuple[str, Dict[str, Any]]:

        where = []
        params: Dict[str, Any] = {}

        # ACL (immer Pflicht)
        base = """
        SELECT
            i.id,
            i.title,
            i.item_kind,
            i.status,
            i.created_at,
            i.updated_at
        FROM items i
        JOIN item_acl acl
            ON acl.item_id = i.id
           AND acl.principal_id = :principal_id
        """

        params["principal_id"] = q.principal_id

        where.append("i.is_archived = 0")

        # =========================
        # TYPE / STATUS
        # =========================

        if q.item_kind:
            where.append("i.item_kind = :item_kind")
            params["item_kind"] = q.item_kind

        if q.status:
            where.append("i.status = :status")
            params["status"] = q.status

        # =========================
        # CLASSIFICATION
        # =========================

        if q.category_key:
            where.append("""
            EXISTS (
                SELECT 1 FROM item_classifications ic
                WHERE ic.item_id = i.id
                  AND ic.category_key = :category_key
            )
            """)
            params["category_key"] = q.category_key

        # =========================
        # LABELS (safe parameter binding)
        # =========================

        if q.label_ids:
            placeholders = []
            for idx, lid in enumerate(q.label_ids):
                key = f"label_{idx}"
                placeholders.append(f":{key}")
                params[key] = lid

            where.append(f"""
            (
                SELECT COUNT(*) FROM item_labels il
                WHERE il.item_id = i.id
                  AND il.label_id IN ({",".join(placeholders)})
            ) = {len(q.label_ids)}
            """)

        # =========================
        # METADATA
        # =========================

        if q.amount_min is not None:
            where.append("""
            EXISTS (
                SELECT 1
                FROM item_metadata im
                JOIN metadata_fields mf ON mf.id = im.field_id
                WHERE im.item_id = i.id
                  AND mf.key = 'amount'
                  AND im.value_number >= :amount_min
            )
            """)
            params["amount_min"] = float(q.amount_min)

        # =========================
        # TIME FILTER
        # =========================

        if q.from_date:
            where.append("i.created_at >= :from_date")
            params["from_date"] = q.from_date

        if q.to_date:
            where.append("i.created_at <= :to_date")
            params["to_date"] = q.to_date

        # =========================
        # FULLTEXT (SANITIZED)
        # =========================

        if q.text:
            safe_query = sanitize_fts_query(q.text)

            if safe_query:
                where.append("""
                EXISTS (
                    SELECT 1
                    FROM content_parts_fts fts
                    JOIN content_parts cp ON cp.rowid = fts.rowid
                    WHERE cp.item_id = i.id
                      AND fts.content_text MATCH :query
                )
                """)
                params["query"] = safe_query

        # =========================
        # FINAL SQL
        # =========================

        where_sql = " WHERE " + "\n AND ".join(where)

        sort = validate_sort(q.sort)

        order_sql = f"""
        ORDER BY i.{sort} DESC, i.id
        """

        limit = clamp_limit(q.limit)

        params["limit"] = limit
        params["offset"] = max(0, q.offset)

        sql = base + where_sql + order_sql + " LIMIT :limit OFFSET :offset"

        return sql, params


# =========================
# REPOSITORY
# =========================

class SearchRepository:

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn
        self.builder = SearchQueryBuilder()

    def search(self, query: SearchQuery) -> List[SearchResultItem]:
        sql, params = self.builder.build(query)

        cur = self.conn.execute(sql, params)
        rows = cur.fetchall()

        return [
            SearchResultItem(
                id=row[0],
                title=row[1],
                item_kind=row[2],
                status=row[3],
                created_at=row[4],
                updated_at=row[5],
            )
            for row in rows
        ]
3. Was jetzt abgesichert ist
SQL Injection
ausschließlich Parameterbindung

keine direkten Werte im SQL

FTS Injection / Query Abuse
Query sanitizing

Sonderzeichen entfernt

Länge begrenzt

DoS / Abuse
max LIMIT enforced

OFFSET begrenzt

Query-Länge begrenzt

Unauthorized Access
ACL Join verpflichtend

Query Integrity
sort field whitelist

typed parameters

4. Was du später noch ergänzen solltest
Rate Limiting (API/CLI)

Query Cost Guard (z. B. max joins / filters)

Prepared Statement Cache

Logging für suspicious queries

Feature Flags für teure Filter

Nächster Schritt
a) FastAPI Endpoint (inkl. Security Layer)
b) CLI Integration (kbase search)
c) weitere Capabilities als sichere Repositories


A - ist das, das mapping von capabilities auf die DB?

Kurz: Ja — aber nur teilweise.
Das ist das Mapping einer einzelnen Capability (search_content) auf die DB, nicht das vollständige Capability→DB Mapping.

Jetzt bekommst du das saubere, vollständige Muster, wie Capabilities systematisch auf DB + Repository abgebildet werden (inkl. Security).

1. Ziel: sauberes Capability → DB Mapping
Architekturfluss:

CLI / API / MCP
        ↓
Capability Layer (Use Case)
        ↓
Repository Layer
        ↓
SQL / DB
Wichtig:

Capabilities kennen kein SQL

Repositories kennen keine Business-Logik

Security sitzt in beiden (Input + Query)

2. Beispiel: vollständiges Mapping für eine Capability
Capability
create_note

Flow
create_note()
  → validate input
  → create item
  → create content_part
  → assign labels
  → audit event
2.1 Capability Layer
class CreateNoteService:

    def __init__(self, repo, content_repo, label_repo, audit_repo):
        self.repo = repo
        self.content_repo = content_repo
        self.label_repo = label_repo
        self.audit_repo = audit_repo

    def execute(self, cmd):
        item_id = self.repo.create_item(
            title=cmd.title,
            item_kind="note",
            principal_id=cmd.principal_id
        )

        self.content_repo.add_content_part(
            item_id=item_id,
            body=cmd.body,
            content_type="markdown"
        )

        if cmd.labels:
            self.label_repo.assign_labels(item_id, cmd.labels)

        self.audit_repo.log(
            operation="create_note",
            item_id=item_id,
            actor=cmd.principal_id
        )

        return item_id
2.2 Repository Layer
class ItemRepository:

    def create_item(self, title: str, item_kind: str, principal_id: str):
        sql = """
        INSERT INTO items (id, title, item_kind, origin, created_by_principal_id, created_at, updated_at)
        VALUES (:id, :title, :kind, 'manual', :principal, datetime('now'), datetime('now'))
        """

        item_id = generate_ulid()

        self.conn.execute(sql, {
            "id": item_id,
            "title": title,
            "kind": item_kind,
            "principal": principal_id
        })

        return item_id
3. Mapping-Prinzip (wichtig)
Eine Capability = mehrere DB-Operationen
Beispiel:

Capability	Tabellen
create_note	items, content_parts, item_labels, audit_events
link_items	item_links
register_asset	assets
attach_asset	item_asset_links
patch_metadata	item_metadata
search_content	items + viele joins
4. Vollständige Mapping-Übersicht (MVP v1)
4.1 Lesen
Capability	DB
get_item	items, content_parts, item_asset_links, item_links, item_metadata
search_content	items + ACL + FTS + filters
list_items	items
list_related_items	item_links
4.2 Content
Capability	DB
create_note	items, content_parts, audit_events
update_item_core	items
archive_item	items
add_content_part	content_parts
replace_content_part	content_parts + versions
4.3 Assets
Capability	DB
register_asset	assets
attach_asset_to_item	item_asset_links
create_document_from_asset	items + item_asset_links
4.4 Structure
Capability	DB
assign_labels	item_labels
classify_item	item_classifications
patch_item_metadata	item_metadata
4.5 Relations
Capability	DB
link_items	item_links
unlink_items	item_links
4.6 Projects
Capability	DB
create_project	items
add_item_to_project	item_links
list_project_items	item_links + items
4.7 Audit
Capability	DB
get_item_history	audit_events
get_item_provenance	item_provenance
5. Sicherheitsmodell im Mapping
5.1 Write Operations
Immer:

Capability:
  validate input
  check permission (optional early)
  call repository
  write audit
5.2 Read Operations
Immer:

JOIN item_acl ON ...
→ niemals vergessen

6. Was dein aktueller Code ist
Dein aktuelles SearchRepository ist:

✔ Repository Layer
✔ mit Query Builder
✔ mit Security
✔ für eine Capability

7. Was noch fehlt für vollständiges Mapping
Du brauchst:

7.1 Für jede Capability:
Service (Use Case)

Repository Calls

7.2 Struktur:
application/
  create_note_service.py
  link_items_service.py
  search_service.py

persistence/
  item_repository.py
  content_repository.py
  relation_repository.py
  metadata_repository.py
  search_repository.py
8. Wichtigste Regel (entscheidend)
👉 Nie Capabilities direkt auf SQL mappen

Immer:

Capability → Repository → SQL
Sonst bekommst du:

Inkonsistenzen

Security Bugs

schwer testbaren Code

MCP / Agent Probleme

9. Fazit
Dein Code ist korrekt für eine einzelne Capability

Das vollständige Mapping ist:

1 Capability = Orchestrierung mehrerer Repositories

Repositories = SQL

Das ist exakt der richtige Weg für:

Agenten

CLI

MCP

Erweiterbarkeit

Nächster Schritt (sehr sinnvoll)
a) vollständiges Create/Update Capability Set als Code
b) FastAPI Layer auf Capabilities
c) CLI (kbase) direkt auf Capabilities mappen


Als Zwischenschritt möchte ich nochmal die komplette Dateistruktur für die core Applikation. Wie strukturieren wir das. Jede capability einendateinin einem capability Ordner? Dazu jeweils ein reppitory in einem repo Ordner? Wo sind die DB Code?

Ja. Für dein Vorhaben würde ich nicht „pro Capability genau eine Repository-Datei“ erzwingen.
Besser ist:

Capabilities fein schneiden

Repositories nach Aggregat/DB-Verantwortung schneiden

DB-Code klar trennen in Schema/Migrations, Session/Connection, Repositories, Query Builder

Die sauberste Struktur für die Core-Applikation als modularer Monolith wäre so:

kbase/
├─ pyproject.toml
├─ README.md
├─ .env
├─ .gitignore
│
├─ src/
│  └─ kbase/
│     ├─ __init__.py
│     │
│     ├─ app/
│     │  ├─ __init__.py
│     │  ├─ config.py
│     │  ├─ logging.py
│     │  └─ bootstrap.py
│     │
│     ├─ domain/
│     │  ├─ __init__.py
│     │  ├─ common/
│     │  │  ├─ __init__.py
│     │  │  ├─ ids.py
│     │  │  ├─ enums.py
│     │  │  ├─ errors.py
│     │  │  ├─ types.py
│     │  │  └─ validators.py
│     │  │
│     │  ├─ items/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  ├─ value_objects.py
│     │  │  ├─ rules.py
│     │  │  └─ constants.py
│     │  │
│     │  ├─ assets/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  ├─ value_objects.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ content/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  ├─ value_objects.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ relations/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ metadata/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  ├─ value_objects.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ labels/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ acl/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  ├─ permissions.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ audit/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  └─ value_objects.py
│     │  │
│     │  ├─ provenance/
│     │  │  ├─ __init__.py
│     │  │  ├─ entities.py
│     │  │  └─ value_objects.py
│     │  │
│     │  ├─ projects/
│     │  │  ├─ __init__.py
│     │  │  └─ rules.py
│     │  │
│     │  ├─ temporal/
│     │  │  ├─ __init__.py
│     │  │  ├─ value_objects.py
│     │  │  └─ rules.py
│     │  │
│     │  └─ search/
│     │     ├─ __init__.py
│     │     ├─ query_models.py
│     │     └─ rules.py
│     │
│     ├─ application/
│     │  ├─ __init__.py
│     │  ├─ common/
│     │  │  ├─ __init__.py
│     │  │  ├─ actor_context.py
│     │  │  ├─ pagination.py
│     │  │  ├─ result_types.py
│     │  │  ├─ transactions.py
│     │  │  └─ security.py
│     │  │
│     │  ├─ dto/
│     │  │  ├─ __init__.py
│     │  │  ├─ items.py
│     │  │  ├─ assets.py
│     │  │  ├─ content.py
│     │  │  ├─ relations.py
│     │  │  ├─ labels.py
│     │  │  ├─ metadata.py
│     │  │  ├─ projects.py
│     │  │  ├─ audit.py
│     │  │  └─ search.py
│     │  │
│     │  ├─ ports/
│     │  │  ├─ __init__.py
│     │  │  ├─ repositories.py
│     │  │  ├─ unit_of_work.py
│     │  │  ├─ asset_storage.py
│     │  │  ├─ search_backend.py
│     │  │  └─ id_generator.py
│     │  │
│     │  ├─ capabilities/
│     │  │  ├─ __init__.py
│     │  │  │
│     │  │  ├─ items/
│     │  │  │  ├─ __init__.py
│     │  │  │  ├─ create_note.py
│     │  │  │  ├─ update_item_core.py
│     │  │  │  ├─ archive_item.py
│     │  │  │  ├─ get_item.py
│     │  │  │  └─ list_items.py
│     │  │  │
│     │  │  ├─ content/
│     │  │  │  ├─ __init__.py
│     │  │  │  ├─ add_content_part.py
│     │  │  │  └─ replace_content_part.py
│     │  │  │
│     │  │  ├─ assets/
│     │  │  │  ├─ __init__.py
│     │  │  │  ├─ register_asset.py
│     │  │  │  ├─ attach_asset_to_item.py
│     │  │  │  └─ create_document_from_asset.py
│     │  │  │
│     │  │  ├─ relations/
│     │  │  │  ├─ __init__.py
│     │  │  │  ├─ link_items.py
│     │  │  │  ├─ unlink_items.py
│     │  │  │  └─ list_related_items.py
│     │  │  │
│     │  │  ├─ labels/
│     │  │  │  ├─ __init__.py
│     │  │  │  ├─ assign_labels.py
│     │  │  │  └─ classify_item.py
│     │  │  │
│     │  │  ├─ metadata/
│     │  │  │  ├─ __init__.py
│     │  │  │  └─ patch_item_metadata.py
│     │  │  │
│     │  │  ├─ projects/
│     │  │  │  ├─ __init__.py
│     │  │  │  ├─ create_project.py
│     │  │  │  ├─ add_item_to_project.py
│     │  │  │  └─ list_project_items.py
│     │  │  │
│     │  │  ├─ search/
│     │  │  │  ├─ __init__.py
│     │  │  │  └─ search_content.py
│     │  │  │
│     │  │  └─ audit/
│     │  │     ├─ __init__.py
│     │  │     ├─ get_item_history.py
│     │  │     └─ get_item_provenance.py
│     │  │
│     │  └─ services/
│     │     ├─ __init__.py
│     │     ├─ acl_service.py
│     │     ├─ audit_service.py
│     │     └─ provenance_service.py
│     │
│     ├─ infrastructure/
│     │  ├─ __init__.py
│     │  │
│     │  ├─ db/
│     │  │  ├─ __init__.py
│     │  │  ├─ connection.py
│     │  │  ├─ pragmas.py
│     │  │  ├─ row_mapping.py
│     │  │  ├─ transaction.py
│     │  │  └─ sqlite_helpers.py
│     │  │
│     │  ├─ repositories/
│     │  │  ├─ __init__.py
│     │  │  ├─ item_repository.py
│     │  │  ├─ content_repository.py
│     │  │  ├─ asset_repository.py
│     │  │  ├─ relation_repository.py
│     │  │  ├─ label_repository.py
│     │  │  ├─ metadata_repository.py
│     │  │  ├─ acl_repository.py
│     │  │  ├─ audit_repository.py
│     │  │  ├─ provenance_repository.py
│     │  │  ├─ project_repository.py
│     │  │  └─ search_repository.py
│     │  │
│     │  ├─ query_builders/
│     │  │  ├─ __init__.py
│     │  │  ├─ search_content_query_builder.py
│     │  │  ├─ list_items_query_builder.py
│     │  │  └─ related_items_query_builder.py
│     │  │
│     │  ├─ storage/
│     │  │  ├─ __init__.py
│     │  │  ├─ filesystem_asset_storage.py
│     │  │  └─ path_resolver.py
│     │  │
│     │  ├─ ids/
│     │  │  ├─ __init__.py
│     │  │  └─ ulid_generator.py
│     │  │
│     │  └─ search/
│     │     ├─ __init__.py
│     │     ├─ fts.py
│     │     └─ sanitization.py
│     │
│     ├─ interfaces/
│     │  ├─ __init__.py
│     │  │
│     │  ├─ api/
│     │  │  ├─ __init__.py
│     │  │  ├─ app.py
│     │  │  ├─ dependencies.py
│     │  │  ├─ error_handlers.py
│     │  │  └─ routes/
│     │  │     ├─ __init__.py
│     │  │     ├─ items.py
│     │  │     ├─ content.py
│     │  │     ├─ assets.py
│     │  │     ├─ relations.py
│     │  │     ├─ labels.py
│     │  │     ├─ metadata.py
│     │  │     ├─ projects.py
│     │  │     ├─ search.py
│     │  │     └─ audit.py
│     │  │
│     │  ├─ cli/
│     │  │  ├─ __init__.py
│     │  │  ├─ app.py
│     │  │  ├─ common.py
│     │  │  └─ commands/
│     │  │     ├─ __init__.py
│     │  │     ├─ items.py
│     │  │     ├─ content.py
│     │  │     ├─ assets.py
│     │  │     ├─ relations.py
│     │  │     ├─ labels.py
│     │  │     ├─ metadata.py
│     │  │     ├─ projects.py
│     │  │     ├─ search.py
│     │  │     └─ audit.py
│     │  │
│     │  └─ mcp/
│     │     ├─ __init__.py
│     │     ├─ server.py
│     │     ├─ resources.py
│     │     └─ tools.py
│     │
│     └─ db/
│        ├─ schema/
│        │  ├─ 0001_initial.sql
│        │  ├─ 0002_indexes.sql
│        │  ├─ 0003_fts.sql
│        │  └─ seed/
│        │     ├─ item_kinds.sql
│        │     ├─ item_categories.sql
│        │     ├─ content_part_kinds.sql
│        │     ├─ link_types.sql
│        │     ├─ permissions.sql
│        │     └─ workflow_states.sql
│        │
│        ├─ migrations/
│        │  ├─ runner.py
│        │  ├─ state.py
│        │  └─ files/
│        │     ├─ 0004_add_x.sql
│        │     └─ 0005_change_y.sql
│        │
│        └─ fixtures/
│           ├─ demo_principals.sql
│           └─ demo_labels.sql
│
├─ tests/
│  ├─ unit/
│  │  ├─ domain/
│  │  ├─ application/
│  │  └─ infrastructure/
│  ├─ integration/
│  │  ├─ repositories/
│  │  ├─ api/
│  │  └─ cli/
│  └─ e2e/
│     └─ workflows/
│
└─ scripts/
   ├─ init_db.py
   ├─ seed_db.py
   └─ reindex_fts.py
Klare Regeln dazu
1. Jede Capability eine Datei?
Ja, für die eigentlichen Use Cases: meist ja.

Das ist bei dir sinnvoll, weil:

Capabilities explizit bleiben

MCP/CLI/API gut darauf mappen

Tests pro Capability leicht werden

Agentenlogik sauber isoliert bleibt

Also z. B.:

application/capabilities/items/create_note.py

application/capabilities/search/search_content.py

Das ist besser als eine große item_service.py mit 30 Methoden.

2. Repository pro Capability?
Nein. Repository pro Persistenz-Verantwortung.

Also eher:

item_repository.py

content_repository.py

asset_repository.py

relation_repository.py

und nicht:

create_note_repository.py

archive_item_repository.py

Warum:
Eine Capability nutzt oft mehrere Tabellen und damit mehrere Repositories.

Beispiel create_note:

item_repository

content_repository

acl_repository

audit_repository

3. Wo ist der DB-Code?
DB-Code ist auf drei Orte verteilt:

a) Schema / Migrationen
src/kbase/db/schema/
src/kbase/db/migrations/
Hier liegen:

CREATE TABLE

CREATE INDEX

Seed-Daten

Migrationen

b) Low-level SQLite Code
src/kbase/infrastructure/db/
Hier liegen:

Connection-Erzeugung

PRAGMA

Transaktionen

Row Mapping

SQLite Helper

c) Fachnahe SQL Queries
src/kbase/infrastructure/repositories/
src/kbase/infrastructure/query_builders/
Hier liegen:

INSERT / UPDATE / SELECT

komplexe Query Builder

ACL-integrierte Suchen

4. Wo sitzt Security?
Nicht an nur einer Stelle.

In application/
Actor Context

Capability-Level Validation

Permission Checks

In infrastructure/query_builders/
parametrisierte SQLs

Whitelisting

FTS Sanitizing

Limit Guards

In repositories/
kein unsicherer SQL-Zusammenbau

ACL nie vergessen

5. Wo kommt die ACL-Logik hin?
Aufteilen:

Fachliche Berechtigungsentscheidung
application/services/acl_service.py
SQL-seitige Sichtbarkeit
infrastructure/repositories/
infrastructure/query_builders/
Also:

„darf der Actor schreiben?“ → Application Service

„welche Items sieht der Actor?“ → Query/Repository

6. Wo kommen DTOs hin?
In:

application/dto/
Dort liegen:

Command DTOs

Query DTOs

Result DTOs

Nicht in interfaces/, weil CLI und API dieselben DTOs nutzen sollen.

7. Wo kommen Pydantic Models hin?
Zwei sinnvolle Ebenen:

Interne DTOs
application/dto/

API Request/Response Modelle
interfaces/api/routes/... oder interfaces/api/schemas/

Also nicht alles vermischen.

8. Wie würde ein typischer Capability-Flow aussehen?
Beispiel create_note.py:

application/capabilities/items/create_note.py
  -> validiert Command
  -> nutzt UnitOfWork
  -> ruft item_repository.create()
  -> ruft content_repository.add()
  -> ruft acl_repository.grant_owner_access()
  -> ruft audit_repository.add_event()
  -> gibt Result DTO zurück
9. Minimalere Variante, falls du kleiner starten willst
Wenn dir die Struktur oben anfangs zu groß ist, nimm diese abgespeckte Startstruktur:

src/kbase/
├─ app/
├─ domain/
├─ application/
│  ├─ dto/
│  ├─ ports/
│  └─ capabilities/
├─ infrastructure/
│  ├─ db/
│  ├─ repositories/
│  ├─ query_builders/
│  └─ storage/
├─ interfaces/
│  ├─ api/
│  └─ cli/
└─ db/
   ├─ schema/
   └─ migrations/
Das reicht für MVP vollkommen.

10. Meine klare Empfehlung
Für dein System würde ich genau dieses Prinzip nehmen:

Capabilities
eine Datei pro Capability

Repositories
eine Datei pro fachlich-technischem Persistenzbereich

DB-Code
Schema/Migration getrennt

Connection/Transaction getrennt

komplexe SQL in Query Buildern

Das ist sauber, agentenfähig und später sehr gut wartbar.

Frage
Welche Ebene soll ich als Nächstes konkret ausarbeiten?

a) die minimal sinnvolle Startstruktur für MVP v1
b) die Dateistruktur mit konkreten Dateiinhalten für 3 Beispiel-Capabilities
c) die Repository-Schnittstellen und Unit-of-Work Struktur

Aufgeteilt ab 


Wo würde ich jetzt eine Frontend-Applikation bauen? Beispielsweise eine Web App (react?). Reicht da eine reine Frontend ja App die diese API nutzt oder brauche ich eine weitere Applikation - Backend in Python für das Frontend? Was ist empfehlenswert?

Empfehlung: eine React-Web-App als eigener Client plus das bestehende Python-Backend als zentrales Backend.

Also nicht:

React-App direkt auf SQLite oder Filesystem

React-App mit eigenem zweiten „Frontend-Backend“, wenn das nur ein dünner Proxy wäre

Sondern:

Frontend-App: React

Core-Backend: Python

gleiche Capabilities/API für UI, CLI, MCP, Agenten

Kurzantwort auf deine Kernfrage
Reicht eine reine Frontend-App, die die API nutzt?
Ja — wenn dein Python-System bereits eine HTTP-API bereitstellt.

Dann ist die Web-App einfach ein weiterer Client auf dieselbe Capability-Schicht.

Brauchst du zusätzlich noch ein separates Backend nur für das Frontend?
In der Regel nein.

Ein zusätzliches „Backend for Frontend“ brauchst du erst, wenn du sehr spezielle Frontend-Anforderungen hast, z. B.:

komplizierte Session-/SSO-Logik

serverseitiges UI-Rendering

Aggregation vieler externer Backends

Edge Rendering / CDN-spezifische Optimierungen

stark getrennte Teams oder Deployments

Für dein System wäre das am Anfang eher unnötige Komplexität.

Die sinnvolle Zielarchitektur
React Web App
    ↓ HTTP/JSON
Python API
    ↓
Capability Layer
    ↓
Repositories / DB / Assets / Search
Dazu parallel:

CLI  ───────┐
MCP  ───────┼──> gleiche Capability Layer
Agents ─────┘
Das ist der wichtigste Punkt:
Die Web-App soll kein Sonderweg sein.

Was ich dir konkret empfehle
1. Ein Python-Backend für alles
Das Python-Backend bleibt die zentrale Anwendung und enthält:

Domain

Capabilities

Repositories

DB

Asset-Zugriff

ACL

Audit

Search

Darauf setzt du:

REST/JSON API

CLI

MCP

auf.

2. Eine separate React-App als Frontend
Die React-App ist ein eigener Client, idealerweise in einem separaten Ordner oder Repo.

Zum Beispiel:

kbase/
  backend/
  frontend/
oder monorepo:

kbase/
  src/kbase/...        # Python backend
  web/                 # React frontend
Warum das die beste Variante ist
Vorteil 1: eine Wahrheit
Nur ein Backend kennt:

Berechtigungen

Validierung

Audit

Provenance

Geschäftslogik

Die Web-App macht keine Business-Logik nach.

Vorteil 2: gleiche API für Menschen und Agenten
Das ist exakt dein Zielbild.

Vorteil 3: weniger Coupling
Das Frontend kann sich ändern, ohne dass der Core leidet.

Vorteil 4: lokal und self-hosted sauber
Python-Backend + React-Frontend ist für lokale und self-hosted Nutzung gut beherrschbar.

Wann eine reine Frontend-App problematisch wäre
Eine reine Browser-App ohne richtiges Backend wäre bei dir unklug, weil du brauchst:

SQLite / DB-Zugriff

Filesystem / Asset-Verwaltung

ACL

sichere Queries

Audit Events

Agenten/CLI/MCP Integration

konsistente Capability Layer

Das alles im Browser oder in einem „frontend only“-Ansatz zu erzwingen wäre architektonisch falsch.

Ob React sinnvoll ist
Ja, React ist eine sehr gute Wahl für diese Art Anwendung.

Warum:

komponentenstark

gutes Ökosystem

stark für komplexe UIs

gut für Such-, Detail-, Editor-, Graph-, Projekt-Ansichten

leicht mit FastAPI/JSON kombinierbar

Ich würde für das Frontend grob nehmen:

React

TypeScript

Vite

TanStack Query

TanStack Router oder React Router

Zustand nur falls wirklich nötig

shadcn/ui oder ähnliche UI-Basis

später evtl. React Flow für Graph-/Relation-Ansichten

Empfohlene Gesamtstruktur
kbase/
├─ backend/
│  ├─ src/kbase/...
│  └─ pyproject.toml
│
└─ frontend/
   ├─ package.json
   ├─ src/
   │  ├─ app/
   │  ├─ pages/
   │  ├─ features/
   │  ├─ components/
   │  ├─ api/
   │  └─ hooks/
   └─ vite.config.ts
Wie das Frontend intern aufbauen sollte
Nicht nach Seitenchaos, sondern eher feature-orientiert:

frontend/src/
├─ app/
├─ api/
│  ├─ client.ts
│  ├─ items.ts
│  ├─ search.ts
│  ├─ projects.ts
│  └─ assets.ts
├─ features/
│  ├─ items/
│  ├─ search/
│  ├─ projects/
│  ├─ labels/
│  └─ audit/
├─ components/
├─ pages/
└─ lib/
Wichtig:
Die Frontend-API-Calls sollten direkt auf deine Capabilities/API gemappt sein, nicht wild verteilt.

API-Design für das Frontend
Für die Web-App reicht in der Regel dein normales Python-API.

Also etwa:

GET /api/v1/items/{id}

POST /api/v1/capabilities/search_content

POST /api/v1/capabilities/create_note

POST /api/v1/capabilities/link_items

Das Frontend ruft genau das auf.

Auth und Sichtbarkeit für dich und deine Frau
Auch für die Web-App spricht das für ein echtes Backend.

Denn Sichtbarkeit pro Person braucht:

Nutzeridentität

ACL-Prüfung

Query-Filterung

saubere Serverentscheidung

Das willst du nicht nur clientseitig lösen.

Was ich nicht empfehlen würde
Nicht ideal:
React-App + separates Node-Backend nur fürs Frontend + Python-Core dahinter

Das wäre für jetzt zu viel.

Ebenfalls nicht ideal:
React-App mit direktem DB/File-Zugriff

React-App mit doppelter Business-Logik

Python-Backend nur als dünner SQL-Proxy ohne Capability Layer

Meine klare Empfehlung
Jetzt bauen:
Ein Python-Backend mit HTTP-API und eine separate React-Frontend-App, die diese API nutzt.

Das ist die richtige Balance aus:

sauberer Architektur

wenig Komplexität

Agentenfähigkeit

guter UI-Entwicklung

späterer Erweiterbarkeit

Praktisch bedeutet das
Backend
FastAPI

Capability-Endpunkte

SQLite zuerst

Asset Storage lokal

ACL/Audit im Backend

Frontend
React + TypeScript + Vite

ruft nur API auf

keine Business-Logik-Duplikate

Meine Empfehlung zur Reihenfolge
Python-Backend sauber mit 5–8 Kern-Capabilities

dann React-Frontend auf dieselbe API

später CLI und MCP ergänzen oder parallel aufbauen

Frage
Welche Frontend-Strategie willst du als Nächstes konkretisieren?

a) Ordnerstruktur und Architektur der React-App
b) API-Schnittstelle zwischen React und FastAPI
c) welche Screens/Views das erste Web-Frontend haben sollte


Angenommen ichöchte jetzt eine Web App erstellen die auf dem PC Browser und dem mobile Phone gut aussieht. Markdown Editor, Auswahl (drop down) für categories und oder Label und evtl. Auf assets verweisen (Images). Vllt. Mit der möglichkeit Fotos aufzunehmen und diese dann serverseitig zu bearbeiten (entzerren, OCR etc). Wie würde ich vorgehen?

Ich würde es klar als responsive Web-App mit Python-Backend bauen, nicht als mobile App zuerst.

Für deinen Use Case ist der richtige Weg:

Zielarchitektur
Responsive React Web App
    ↓
FastAPI Backend
    ↓
Capabilities / Services
    ↓
SQLite + Asset Storage + OCR/Image Processing
Damit bekommst du:

eine UI, die im PC-Browser gut funktioniert

eine UI, die auf dem Smartphone brauchbar wie eine App wirkt

zentrale Serverlogik für

Rechte

Labels / Kategorien

Datei-Upload

Bildverarbeitung

OCR

spätere Agentenfähigkeit

Warum das für deinen Fall passt
Du brauchst in einer Anwendung gleichzeitig:

Formulare und strukturierte Dateneingabe

Markdown-Erfassung

Asset-Upload

Bildvorschau

mobile Kameraaufnahme

serverseitige Dokumentverarbeitung

später Suche, Projekte, Verknüpfungen, ACL

Das spricht sehr klar für:

Frontend
React + TypeScript

Vite

responsive UI

optional später PWA

Backend
FastAPI

Asset Upload Endpoints

Processing Jobs / Pipelines

OCR / Entzerrung / Extraktion serverseitig

Wie ich konkret vorgehen würde
1. Erst den Kern-Workflow definieren
Du solltest nicht „die ganze App“ auf einmal bauen, sondern zuerst den wichtigsten Nutzerfluss sauber machen.

Für deinen Fall wäre das als erster echter Flow:

Flow 1: Notiz / Dokument erfassen
Item anlegen

Titel eingeben

Kategorie auswählen

Labels auswählen

Markdown-Inhalt schreiben

Bild oder PDF anhängen

optional mit Kamera aufnehmen

Backend verarbeitet Asset

Ergebnis wird am Item sichtbar

Wenn dieser Flow gut ist, steht das Fundament.

2. Frontend als responsive Web-App bauen
Ich würde die UI so entwerfen, dass sie auf Desktop und Mobile nicht identisch, aber aus denselben Komponenten gebaut ist.

Desktop
zweispaltig oder dreispaltig

Such-/Listenbereich links

Detailansicht rechts

Editor mit Metadatenpanel

Mobile
stapelnde Views

Bottom Navigation oder kompakte Top Navigation

Formulare full-width

Kamera-/Upload-Aktionen prominent

Editor ohne überladene Sidebars

Wichtig:
Nicht einfach nur „alles zusammenschrumpfen“.
Du brauchst responsive Layout-Regeln.

3. Frontend-Aufbau
Ich würde im Frontend diese Hauptbereiche schneiden:

web/
  src/
    app/
    pages/
    features/
      items/
      editor/
      assets/
      search/
      labels/
      categories/
      capture/
    components/
      forms/
      layout/
      markdown/
      upload/
      mobile/
    api/
    hooks/
    lib/
4. Editor-Entscheidung
Du hast zwei realistische Optionen.

Option A: echter Markdown-Editor
Gut, wenn du Markdown wirklich als primäres Format willst.

Typisch:

linke/rechte Ansicht oder edit/preview Toggle

Toolbar für Überschrift, Liste, Link, Bild

speichert Markdown direkt

Vorteil:

einfach

klar

langlebig

gut für Wissenssystem

Nachteil:

weniger WYSIWYG

Option B: Rich-Text-Editor mit Markdown-Export
Nur sinnvoll, wenn du stärker visuell arbeiten willst.

Für deinen aktuellen Ansatz würde ich eher sagen:

Empfehlung:
Markdown als Kernformat, aber mit bequemer Toolbar und Preview.

Das ist langfristig robuster.

5. Kategorien und Labels in der UI
Die solltest du unterschiedlich behandeln.

Kategorien
eher kontrolliert

Dropdown oder Combobox

meist eine Primärkategorie

optional zusätzliche Klassifikationen später

Labels
Multi-Select

Suche im Labelbaum

Chips/Badges in der UI

hierarchische Auswahl später

Also nicht alles als ein gemeinsames Dropdown.

6. Assets und Bilder
Für Bilder und andere Dateien brauchst du im Frontend drei Dinge:

a) Upload-Komponente
drag & drop auf Desktop

Dateiauswahl

Mehrfachauswahl optional

b) Mobile Kameraaufnahme
auf Mobile per Dateiinput mit Kamera-Capture

alternativ direkt Bilddatei aus Galerie

c) Asset-Vorschau
Thumbnail für Bilder

PDF-Icon/Preview später

Status „hochgeladen / verarbeitet / OCR fertig“

7. Kameraaufnahme auf Mobile
Das ist als Web-App gut machbar.

Praktisch läuft es meist so:

Nutzer klickt „Foto aufnehmen“

Browser öffnet Kamera oder Auswahl

Bild wird als Datei an Backend geschickt

Backend speichert Original

Backend erzeugt bearbeitete Variante(n)

Wichtig:
Für echtes zuverlässiges „Dokument scannen“ im Browser ist die UX oft okay, aber die eigentliche Bildverbesserung würde ich serverseitig machen.

8. Serverseitige Bildverarbeitung
Das sollte als eigener Processing-Flow laufen.

Pipeline pro Bild / Dokument
Originalbild speichern

Asset registrieren

Vorschaubild erzeugen

Kanten / Dokumentbereich erkennen

Perspektive entzerren

Kontrast / Binarisierung optional

OCR ausführen

extrahierten Text speichern

Verarbeitungsstatus ans Item hängen

Dafür brauchst du im Backend getrennte Schritte:

Upload

Processing Trigger

Job Status

Ergebnis speichern

9. Entzerren und OCR architektonisch
Ich würde das nicht direkt im Request-Handler komplett blockierend machen, sobald es mehr als trivial wird.

Sondern so:

Erst einfach
Upload

synchron kleine Bildverarbeitung

OCR optional synchron bei kleinen Dateien

Dann sauber ausbauen
Processing Job anlegen

Worker verarbeitet

Frontend pollt Status oder bekommt Update

Für den MVP kannst du klein anfangen, aber die Struktur sollte schon dafür offen sein.

10. Backend-Struktur für diesen Flow
Zusätzlich zu deinem Core brauchst du im Backend ungefähr diese Bereiche:

application/capabilities/assets/
  register_asset.py
  attach_asset_to_item.py
  create_document_from_asset.py

application/capabilities/processing/
  process_uploaded_image.py
  run_ocr.py
  create_extracted_content.py

infrastructure/storage/
infrastructure/image_processing/
infrastructure/ocr/
11. Welche UI-Screens ich zuerst bauen würde
Nicht zu viele. Diese 6 reichen für einen starken ersten Wurf:

1. Inbox / Liste
alle Items

Filter

Suche

mobile gut nutzbar

2. Item Detail
Titel

Kategorie

Labels

Content

Assets

History später

3. Create/Edit Screen
Markdown Editor

Kategorie-Dropdown

Label-Multi-Select

Asset Upload

4. Capture Screen
Foto aufnehmen / hochladen

Vorschau

optional Dokumentmodus

5. Search View
globale Suche

Filter

mobile vereinfachte Filter

6. Asset Preview
Bild/PDF ansehen

verarbeitete Varianten anzeigen

12. UI/UX-Empfehlung für mobile + desktop
Ich würde bewusst auf diese Regeln gehen:

Layout
mobile-first, aber desktop bewusst aufwerten

max-width für Lesbarkeit

Drawer/Sheet statt dauerhafter Sidebar auf Mobile

Desktop mit Split View

Navigation
Mobile: Bottom Nav oder kompakter Header

Desktop: Sidebar oder Topbar + Split Layout

Formulare
große Touch Targets

keine überfrachteten Masken

Abschnitte statt Monsterformular

Editor
Mobile: Edit/Preview Toggle

Desktop: gern Split View

13. Technische Empfehlung Frontend
Für deinen Fall würde ich nehmen:

Frontend Stack
React

TypeScript

Vite

TanStack Query

React Router oder TanStack Router

Tailwind

shadcn/ui

react-hook-form

zod

Markdown Editor Komponente oder eigener Wrapper

Das ist sehr pragmatisch und stark.

14. Technische Empfehlung Backend
Backend Stack
FastAPI

Pydantic

SQLite am Anfang

lokales Filesystem für Assets

Pillow / OpenCV für Bildverarbeitung

OCR später über separate Komponente

klarer Capability Layer

15. Wie ich die Umsetzung phasen würde
Phase 1 – Kern nutzbar machen
Login / Nutzerkontext einfach

Item-Liste

Item-Detail

Create/Edit

Markdown

Kategorie + Labels

Bild-/Datei-Upload

Asset Preview

Phase 2 – Mobile Capture gut machen
Kameraaufnahme

Upload direkt vom Handy

Bildvorschau

mobile optimierte Eingabemaske

Phase 3 – Processing integrieren
serverseitige Entzerrung

OCR

extrahierten Text als Content Part speichern

Verarbeitungsstatus im UI

Phase 4 – echte Knowledge-Features
Verlinkungen

Projekte

Suche mit Filtern

History / Provenance

später Agentenfeatures im UI sichtbar machen

16. Was ich konkret nicht tun würde
Nicht empfehlenswert
zuerst Native App bauen

UI ohne echte API direkt an DB hängen

Bildverarbeitung komplett im Browser erzwingen

Editor, Upload, Search, Projects, OCR alles gleichzeitig bauen

zweite Sonder-Backend-Schicht nur fürs Frontend einführen

17. Mein konkreter Vorschlag für den Start
Wenn du heute startest, würde ich zuerst genau diesen Vertical Slice bauen:

Erster vollständiger Slice
React-Seite „Neues Item“

Felder:

Titel

Kategorie

Labels

Markdown

Bild anhängen / Foto aufnehmen

Submit an FastAPI

Backend:

Item anlegen

Content speichern

Asset speichern

Asset verknüpfen

Danach Detailseite anzeigen

Wenn dieser eine Slice gut funktioniert, kannst du den Rest sehr sauber erweitern.

18. Klare Empfehlung
Ja, baue eine responsive React-Web-App und nutze dein Python-Backend als einziges zentrales Backend.
Mobile Capture, Bild-Upload, Entzerrung und OCR gehören in denselben Produktfluss, aber die Verarbeitung selbst sollte serverseitig im Backend stattfinden.

Als nächsten sinnvollen Schritt würde ich daraus eine konkrete Frontend-Architektur mit Seiten, Komponenten, API-Calls und mobile/desktop Layoutregeln ableiten.


Aber ist das alles das selbe fastapi? Muss ich alles was für die App ist dann dort einbinden oder ist die App mit ihrem Backend komplett umabhängig und spricht die fastapi App meines kbase an?

Empfehlung: eine gemeinsame FastAPI-Anwendung als zentrales Backend.

Also:

kbase-Backend = FastAPI

Web-App = separater Frontend-Client

die Web-App spricht dieses eine FastAPI-Backend an

Das bedeutet konkret
Die React-Web-App ist nicht „mit eigenem Backend komplett unabhängig“, wenn sie auf dieselbe Knowledge Base zugreifen soll.
Sie ist ein Client auf dein zentrales kbase-Backend.

Architektur:

React Web App
    ↓
FastAPI (kbase backend)
    ↓
Capabilities / DB / Assets / OCR / ACL
Parallel dazu können auch zugreifen:

CLI
MCP
andere Agenten
alle auf dieselbe FastAPI bzw. dieselbe Capability-Schicht.

Was in FastAPI rein gehört
Alles, was zur zentralen Produktlogik gehört:

Auth / Nutzerkontext

ACL / Sichtbarkeit

Items

Kategorien

Labels

Suche

Markdown-Inhalte

Asset-Upload

Bildverarbeitung

OCR

Audit / Provenance

Projekte

spätere Agenten-Endpunkte

Also ja: alles, was fachlich zum Produkt gehört, gehört in dieses Backend.

Was nicht ins Frontend-Backend gehört
Du solltest nicht zusätzlich ein zweites App-Backend bauen, das dann nochmal:

eigene Business-Logik

eigene ACL-Logik

eigene DB-Zugriffe

eigene Validierung

enthält. Das würde die Architektur unnötig verdoppeln.

Wann ein separates Frontend-Backend sinnvoll wäre
Nur wenn du später wirklich einen starken Grund hast, zum Beispiel:

SSR mit Next.js als echte Produktanforderung

spezielle BFF-Optimierungen

mehrere unterschiedliche Backends, die zusammengeführt werden

öffentliches API und internes UI-API klar trennen

Teams / Deployments bewusst entkoppeln

Für deinen aktuellen Ansatz ist das nicht empfehlenswert.

Die richtige Trennung
1. Zentrales Backend
Dein kbase-FastAPI bleibt die Quelle der Wahrheit.

2. Separates Frontend-Projekt
Die Web-App ist trotzdem ein eigenes Projekt bzw. eigener Build:

kbase/
  backend/   # FastAPI
  frontend/  # React
Das heißt:

getrennte Codebasen

getrennte Builds

getrennte Verantwortungen

Aber nicht getrennte Business-Backends.

Praktisch heißt das
Backend
FastAPI liefert:

JSON API

Upload-Endpunkte

vielleicht später Auth-Cookies oder Tokens

statische Asset-URLs oder Download-Endpunkte

Frontend
React liefert:

Seiten

Formulare

Editor

Upload UI

mobile/desktop Layout

und ruft nur die API auf.

Beispiel
React
ruft auf:

POST /api/v1/capabilities/create_note

POST /api/v1/capabilities/register_asset

POST /api/v1/capabilities/attach_asset_to_item

POST /api/v1/capabilities/search_content

FastAPI
macht dann:

Validierung

ACL

DB

Dateiablage

OCR/Processing

Audit

Für mobile Fotoaufnahme und OCR
Auch das gehört ins gleiche zentrale Backend.

Warum:

Assets müssen zentral gespeichert werden

OCR/Entzerrung ist Serverlogik

Ergebnisse landen in derselben DB

Rechte/Sichtbarkeit müssen gleich behandelt werden

Deployment-Sicht
Das ergibt typischerweise:

Entwicklung
React Dev Server

FastAPI lokal separat

Produktion
entweder:

React statisch gebaut und durch Reverse Proxy ausgeliefert

FastAPI separat unter /api

oder:

FastAPI liefert zusätzlich das statische Frontend aus

Beides geht. Fachlich bleibt es aber:

ein zentrales Backend

ein separater Frontend-Client

Meine klare Empfehlung
So bauen:
eine FastAPI-App als zentrales kbase-Backend

eine React-App als eigenständiges Frontend-Projekt

Frontend spricht nur die FastAPI des kbase an

Nicht so bauen:
React-App mit eigenem zweiten Fach-Backend

getrennte Business-Logik für UI und Agenten

Entscheidender Satz
Die Web-App ist unabhängig als Frontend-Projekt, aber nicht unabhängig als fachliches Backend-System.
Sie nutzt das zentrale FastAPI-Backend deiner kbase.

Frage
Was willst du als Nächstes konkret sehen?

a) empfohlene Gesamtstruktur für backend/ und frontend/ zusammen
b) konkreter API-Flow für „Item erstellen + Bild hochladen + OCR starten“
c) wie Development und Deployment lokal praktisch aussehen sollten


Dann lass uns jetzt eine gute notizapp auf Basis unsere kbase API planen. Ich möchte:
- rich Text mit markdown Speicherung
- für PC und Phone individuelle fokussierte Ansichten
- alle wichtigen metainformationen sollen eingebbar sein (welche sind das insgesamt?)
- wichtige Felder vorausgefüllt (Ersteller, Datum)
- ich möchte categories/Labels aus dem vorhandenen Pool einfach hinzufügen (Suchfunktion)
- fehlende einträge sollen durch ein modales menü einfach hinzugefügt werden können
- ich möchte assets (Dateien, Bilder, andere Notizen) verlinken können (diese werden dann angezeigt)
- ich möchte spontan im der Notiz assets hinzufügen (live Foto, Upload Datei (Foto, PDF, ...))
- User Verwaltung (User Image)
- Anzeige und suche und Filter nach Notizen
- die App soll so modular sein, dass nitizenznur der Startpunkt sind
- später kommen hinzu Dateien laden und verwalten, Zeitreihen (mein Gewichtstracking), spezielle Seiten für Finanzen (zb. Upload und Verarbeitung von Kontoauszügen oder Einkommensnachweisen), ... Es muss also eine gute Navigation möglich sein.

Ja. Ich würde das als modulare KBase-Web-App mit einem starken „Notes“-Vertical-Slice planen, aber die Informationsarchitektur von Anfang an so anlegen, dass später Dateien, Finanzen, Zeitreihen und Spezialseiten sauber dazukommen.

1. Produktidee der ersten App
Die erste App ist nicht nur eine Notizseite, sondern ein Note Workspace auf Basis deiner KBase-API.

Die Notiz ist dabei der erste sichtbare Einstieg in einen allgemeineren Content-Kern:

Notizen sind Items

Rich Text wird als Markdown gespeichert

Metadaten, Labels, Kategorien, Assets und Links sind First-Class

dieselben Muster können später für Dokumente, Finanzobjekte, Zeitreihen, Projekte usw. genutzt werden

Das ist wichtig, damit du später nicht alles neu bauen musst.

2. Leitprinzipien für die UI
2.1 Mobile und Desktop bewusst unterschiedlich
Nicht nur responsive zusammenschrumpfen, sondern zwei fokussierte Modi:

Desktop
gute Übersicht

Split View

paralleles Arbeiten mit Liste, Editor, Metadaten, verlinkten Assets

Mobile
eine Hauptaufgabe pro Screen

große Touch-Flächen

schneller Capture-Flow

weniger gleichzeitige Panels

Bottom Navigation oder kompakte Navigation

2.2 Notiz zuerst, KBase im Hintergrund
Der Nutzer soll zunächst „eine gute Notizapp“ erleben.
Die generische KBase-Struktur darf intern da sein, aber nicht überall UI-Komplexität erzeugen.

2.3 Metadata leichtgewichtig, aber vollständig
Alle wichtigen Metainformationen sollen verfügbar sein, aber nur ein kleiner Teil ständig sichtbar sein.
Der Rest gehört in einen einklappbaren oder sekundären Bereich.

2.4 Alles verlinkbar
Die Notiz soll nicht isoliert sein. Sie kann verlinken auf:

Bilder

PDFs

andere Dateien

andere Notizen

später Projekte, Finanzobjekte, Zeitreihen

3. Informationsarchitektur der App
Ich würde die App von Anfang an in Arbeitsbereiche aufteilen, auch wenn zunächst nur wenige voll ausgebaut sind.

Primäre Navigation
1. Home / Inbox
Schneller Einstieg, zuletzt bearbeitete Inhalte, neue Notiz, letzter Upload, offene Dinge.

2. Notes
Liste, Suche, Filter, Editor, Detailansicht.

3. Assets
Später Vollbereich für Dateien/Bilder, initial nur einfach.

4. Search
Globale Suche über Inhalte und Metadaten.

5. Bereiche / Domains
Später:

Finanzen

Zeitreihen

Projekte

Dokumente

6. Profil / Settings
User, Bild, Präferenzen.

Für Mobile würde ich die Primärnavigation kleiner halten:

Home

Notes

Capture

Search

More

4. Kernmodule der Notes-App
4.1 Notes List
Eine gute Liste mit Suche, Filtern und klaren Metadaten.

4.2 Note Editor / Detail
Der wichtigste Screen.

4.3 Asset Picker / Uploader
Dateien, Bilder, Live-Foto, verlinkte Objekte.

4.4 Metadata Panel
Kategorien, Labels, Datum, Ersteller, Status etc.

4.5 Search & Filter
Global und notes-spezifisch.

4.6 User / Identity
Nutzerprofil mit Bild und klarer Sichtbarkeit.

5. Welche Metainformationen für Notizen insgesamt sinnvoll sind
Du fragst explizit: welche sind das insgesamt?

Ich würde zwischen Pflicht / häufig / erweitert / systemisch unterscheiden.

5.1 Pflicht bzw. fast immer sichtbar
Diese Felder würde ich im Notes-MVP direkt unterstützen:

Titel

Ersteller

Erstellungsdatum

Änderungsdatum

Hauptkategorie

Labels

Status

Sprache optional

Archiviert ja/nein

5.2 Häufig sinnvoll
Diese Felder würde ich im Metadatenbereich direkt verfügbar machen:

zusätzliche Klassifikationen

Beschreibung / Kurzsummary

Bezug / Kontext

Quelle / Herkunft

Wichtigkeit / Priorität

Sichtbarkeit / ACL

Projektzuordnung

Datum des eigentlichen Ereignisses

Referenznummer / externe ID

Ort optional

5.3 Erweiterte Felder
Nicht immer sichtbar, aber generisch vorgesehen:

Gültig von / bis

Workflow-Status

Bearbeitungsnotizen

Confidence / Herkunft bei generierten Inhalten

verknüpfte Personen / Subjects

Custom Metadata Fields aus dem KBase-Modell

5.4 Systemisch, automatisch gesetzt
Diese Felder sind normalerweise nicht manuell zu pflegen:

item_id

created_by

created_at

updated_at

version

origin

audit/provenance

5.5 Empfehlung für die UI
Im ersten Notes-Screen würde ich sichtbar machen:

Primär
Titel

Kategorie

Labels

Ersteller

erstellt am

zuletzt geändert

Status

Sekundär im „Mehr Metadaten“-Panel
Ereignisdatum

zusätzliche Klassifikation

Projekt

Referenzen

Sichtbarkeit

benutzerdefinierte Metadaten

6. Default-Werte / Vorausfüllung
Das sollte sehr konsequent passieren.

Automatisch vorausgefüllt
Ersteller = aktueller Nutzer

Erstellungsdatum = jetzt

Änderungsdatum = jetzt

Origin = manual

Status = active oder draft

Sprache = aus User/Browser oder letzter Auswahl

ACL = private oder user/group default

Standardkategorie optional aus letztem Kontext

Optional kontextbasiert vorausfüllen
letzte verwendete Kategorie

zuletzt genutzte Labels

aktuelles Projekt

letzter Upload-Kontext

Das ist sehr wertvoll für den Alltag.

7. Rich Text mit Markdown-Speicherung
Ich würde klar unterscheiden zwischen:

Editor-Erlebnis

Persistenzformat

Empfehlung
Rich-Text-/komfortable Editor-UI, aber Speicherung als Markdown

Das ist genau dein Wunsch und sinnvoll.

Praktisch heißt das
Der Editor bietet:

fett

kursiv

Überschriften

Listen

Checklisten optional

Links

Inline-Bilder/Verweise

Code optional

Zitate

Gespeichert wird:

Markdown im Content Part

Gute Konsequenz
robust

gut versionierbar

agentenfähig

leicht suchbar

exportierbar

8. Kategorien und Labels UX
Du willst:

aus vorhandenem Pool suchen

fehlende Einträge schnell hinzufügen

Das ist genau richtig.

8.1 Kategorien
Ich würde Kategorien eher kontrollierter behandeln.

UI
Suchbare Combobox

Primärkategorie einzeln auswählbar

optionale Zusatzklassifikationen in erweitertem Bereich

Fehlender Eintrag
„Neu erstellen“ im Modal

nur wenn Benutzer das darf

nach Erstellung direkt ausgewählt

8.2 Labels
Labels sind freier und häufiger.

UI
Multi-Select mit Suche

Chips/Badges

Vorschläge aus zuletzt/genutzt/häufig

Hierarchie später sichtbar

Fehlender Eintrag
„Neues Label erstellen“ direkt aus dem Suchfeld oder Modal

nach Erstellung direkt anhängen

Das sollte sehr flüssig sein.

9. Assets und Verlinkungen
Du möchtest verlinken können auf:

Dateien

Bilder

andere Notizen

Das sollte im UI in einem gemeinsamen Konzept laufen: Linked Resources.

9.1 Typen
Attached assets

Linked notes

Linked items allgemein

später strukturierte Objekte wie Projekte oder Finanzdokumente

9.2 Darstellung in der Notiz
Unter oder neben dem Editor ein Bereich:

Bilder als Thumbnail

PDFs/Dateien als Cards

Notizen als kleine Link-Cards

sortiert nach Typ oder Reihenfolge

9.3 Aktionen
verlinken aus bestehendem Bestand

neu hochladen

Foto aufnehmen

Notiz verlinken

entfernen

öffnen

10. Spontan Assets hinzufügen
Das ist ein zentraler UX-Punkt.
Der Nutzer darf nicht aus dem Editor-Kontext fallen.

Aktionen direkt im Note Editor
Foto aufnehmen

Datei hochladen

vorhandenes Asset verlinken

vorhandene Notiz verlinken

Desktop
Drag & Drop

Dateidialog

Asset Picker Modal

Mobile
großer „+“-Button

Auswahl:

Foto aufnehmen

Bild wählen

Datei hochladen

vorhandene Notiz verlinken

Serverseitig
Nach Upload:

Asset registrieren

mit Note verknüpfen

Vorschaubild erzeugen

später OCR/Entzerrung anstoßen

11. User-Verwaltung
Für den Anfang sollte sie einfach, aber sauber sein.

Userprofil
Name

Bild / Avatar

Rolle oder Gruppenzugehörigkeit optional

Standard-Sichtbarkeit

Standardkategorie optional

Sprache/UI-Präferenz später

In der UI sichtbar
Avatar in Topbar / Profil

Ersteller an Notizen

Filter „meine / unsere / alle sichtbaren“

12. Anzeige, Suche und Filter nach Notizen
Das ist ein eigener starker Bereich.

Notes List sollte unterstützen
Volltextsuche

Filter nach Kategorie

Filter nach Label

Filter nach Ersteller

Filter nach Datum

Filter nach Status

Filter nach verknüpften Assets

Sortierung nach geändert / erstellt / Titel

Desktop Darstellung
linke Liste

rechte Detail-/Editoransicht

Mobile Darstellung
Liste als Hauptscreen

Tap öffnet Detail

Filter in Bottom Sheet oder Modal

13. Navigation für den späteren Ausbau
Weil Notes nur der Startpunkt sind, muss die Navigation domänenfähig sein.

Ich würde nicht nur nach Technik navigieren, sondern nach Arbeitsbereichen.

Empfohlene Hauptnavigation
Home
Schneller Einstieg, zuletzt bearbeitet, neue Aktionen.

Notes
Notizen und editorzentrierte Arbeit.

Library
Assets, Dateien, Bilder, PDFs, später Dokumente.

Search
Globale Suche über alles.

Domains
Ein Einstiegspunkt für später:

Finanzen

Health / Measurements

Projekte

Dokumente

Profile / Settings
Wichtig
Die Navigation darf später wachsen, ohne dass Notes komplett umgebaut werden müssen.

14. Desktop- und Mobile-Ansichten konkret
Desktop Hauptlayout
Ich würde drei Spalten bevorzugen, aber flexibel:

Links
Navigation + Filter

Mitte
Liste der Notes oder Search Results

Rechts
Detail / Editor / Metadata / Linked Assets

Für kleinere Desktop-Breiten:

2-Spalten Layout

Mobile Hauptlayout
obere kompakte Leiste

Bottom Navigation

ein Fokus pro Screen

Editor fullscreen

Metadaten in Sheet/Accordion

Assets in horizontaler Vorschau oder eigener Sektion

15. Konkrete Screens für Version 1
Ich würde diese Screens planen:

1. Home
neue Notiz

zuletzt bearbeitet

letzte Uploads

Schnellfilter

2. Notes List
Suche

Filter

Ergebnisliste

3. Note Detail / Editor
Titel

Rich Text Editor

Kategorie

Labels

Metadaten

Linked Resources

Asset Upload / Capture

4. Search
globale Suche

Filter

Ergebnisse nach Typ

5. Asset Picker / Upload Modal
Upload

Kamera

bestehende Assets

andere Notizen verlinken

6. Profile / Users
Nutzerprofil

Avatar

Sichtbarkeit / Defaults

16. Technische Frontend-Architektur
Stack
React

TypeScript

Vite

Tailwind

shadcn/ui

TanStack Query

React Router oder TanStack Router

react-hook-form

zod

Feature-Struktur
frontend/src/
  app/
  pages/
  features/
    notes/
    editor/
    metadata/
    labels/
    categories/
    assets/
    capture/
    search/
    users/
    navigation/
  components/
  api/
  lib/
17. Wichtige Frontend-Komponenten
Notes
NoteList

NoteCard

NoteEditorShell

NoteMetadataPanel

NoteLinkedResourcesPanel

Metadata
CategorySelect

LabelMultiSelect

MetadataFieldRenderer

CreateCategoryModal

CreateLabelModal

Assets
AssetUploader

AssetPickerModal

AssetCard

LinkedNoteCard

ImagePreview

Mobile
MobileBottomNav

FilterSheet

CaptureActionSheet

18. API-seitige Funktionen, die die App braucht
Für die Web-App brauchst du mindestens diese Endpunkte/Capabilities gut verfügbar:

Lesen
get_item

list_items

search_content

list_related_items

Schreiben
create_note

update_item_core

replace_content_part

assign_labels

classify_item

patch_item_metadata

link_items

unlink_items

Assets
register_asset

attach_asset_to_item

create_document_from_asset

Lookup / Pool
Zusätzlich praktisch:

Kategorien suchen/listen

Labels suchen/listen

User/Principals listen

Assets suchen/listen

Später
OCR/Processing starten

Jobstatus lesen

19. Roadmap für den Bau
Phase 1 — Notes Core
Notes List

Note Editor

Markdown-Persistenz

Kategorie + Labels

Standard-Metadaten

verlinkte Notizen

Upload Datei/Bild

User/Avatar minimal

Phase 2 — Mobile Capture
Live Foto

mobile optimierte Erfassung

schnelle Asset-Verknüpfung

Phase 3 — Asset Intelligence
serverseitige Entzerrung

OCR

extrahierter Text sichtbar

Vorschläge für Labels/Kategorie

Phase 4 — KBase-Ausbau
Assets Bereich

Zeitreihen

Finanzen

Spezialseiten

stärkere globale Navigation

20. Was ich als wichtigste Metafelder für v1 wirklich aktiv im UI führen würde
Wenn ich hart priorisieren müsste, dann diese:

Titel

Kategorie

Labels

Ersteller

Erstellungsdatum

Letzte Änderung

Status

zusätzliche Beschreibung optional

Ereignisdatum optional

Sichtbarkeit / Owner / Shared with

Linked resources

Das reicht für einen sehr starken Start, ohne die UI zu überladen.

21. Meine klare Empfehlung
Baue die erste App als Notes-first KBase Workspace mit:

komfortablem Rich Text Editor, Speicherung als Markdown

suchbarer Kategorie- und Label-Auswahl mit Inline-Erstellung

starkem Linked-Resources-Bereich

spontanem Upload/Capture direkt aus der Notiz

getrennter Desktop- und Mobile-Fokus-UX

Navigation, die später Domains wie Finanzen und Zeitreihen aufnehmen kann

Als nächsten sinnvollen Schritt würde ich daraus eine konkrete Screen- und Komponentenstruktur inkl. Navigation und Desktop/Mobile-Layouts ableiten.



