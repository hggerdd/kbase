# Architecture Review

## Zweck

Dieses Dokument bewertet den aktuellen Stand der Knowledge-Base-Idee nicht nur als Sammlung von Anforderungen, sondern als Architektur. Fokus sind Struktur, Konsistenz, Generalisierbarkeit und Agentenfaehigkeit.

## Gesamturteil

Der aktuelle Entwurf ist stark und ueberdurchschnittlich tragfaehig. Die Grundrichtung ist richtig:

- Markdown und Dateien bleiben lesbare, portable Quellen.
- SQLite dient als strukturierter Index-, Query- und Beziehungs-Layer.
- `items` bildet einen generischen Kern statt vieler Fachtabellen.
- Aufgaben, Termine und Zeitreihen werden nicht in das Notizmodell gepresst.
- Agentenzugriff wird nicht nachtraeglich, sondern architektonisch mitgedacht.

Fuer eine allgemeine Knowledge Base ist das eine gute Struktur. Fuer eine agentenfaehige Knowledge Base ist sie sehr vielversprechend, solange die noch offenen Modell- und Interface-Regeln jetzt sauber festgezogen werden.

## Staerken

### 1. Richtige Grundtrennung von Inhalt und Struktur

Die wichtigste Entscheidung ist bereits richtig:

- Inhalt und Originaldateien bleiben im Filesystem
- Struktur, Metadaten, Beziehungen und Suche liegen in SQLite

Das ist langfristig robuster als ein reines Markdown-System und praktikabler als ein DB-only-System.

### 2. Guter generischer Kern

`items` als zentrales Objekt ist eine starke Entscheidung, weil sie:

- viele Domänen tragen kann
- die Komplexitaet begrenzt
- spaetere Use Cases nicht sofort in Spezialmodelle zwingt

Das ist fuer eine allgemeine KB deutlich besser als viele voneinander getrennte Mini-Modelle.

### 3. Gute Trennung zwischen Wissen, Handlung und Verlauf

Die Aufteilung in:

- Wissen
- Handlung
- Zustand/Verlauf

ist inhaltlich und technisch sinnvoll. Sie verhindert, dass Notes alles tragen muessen.

### 4. Agentenfaehigkeit wird frueh richtig gedacht

Der wichtigste spaetere Fortschritt ist die Einsicht:

- nicht Tabellen direkt fuer Agents oeffnen
- sondern einen Capability Layer dazwischen setzen

Das ist die entscheidende Voraussetzung dafuer, dass Copilot, Codex, Claude Code oder MCP-basierte Agenten spaeter stabil und kontrollierbar mit dem System arbeiten koennen.

### 5. Das Modelling Handbook ist ein echter Architekturgewinn

Das Handbook hebt den Entwurf von einer Ideensammlung auf eine regelbasierte Architektur. Das ist wichtig, weil sonst:

- Menschen inkonsistent modellieren
- Importer unterschiedlich arbeiten
- Agents gleiche Dinge unterschiedlich interpretieren

## Risiken

### 1. Zu viele Ziele gleichzeitig

Der Entwurf will derzeit gleichzeitig sein:

- allgemeine Knowledge Base
- Personal Data OS
- Notes-App
- Dokumentensystem
- Aufgaben- und Terminmodell
- Zeitreihensystem
- agentische Plattform

Das ist als Langfristziel in Ordnung, aber fuer Architektur und MVP gefaehrlich. Wenn keine harte Priorisierung erfolgt, wird jede Schicht zu breit.

### 2. Mehrere konkurrierende Mechanismen fuer Ordnung und Kontext

Aktuell existieren mehrere Mittel zur Strukturierung:

- `category_key`
- Labels
- Links
- Projekte/Kontexte
- spaetere Sekundaerklassifikation

Alle sind sinnvoll, aber nur wenn ihre Rollen hart getrennt werden. Sonst entsteht schleichende Inkonsistenz.

### 3. Asset-Modell noch nicht final genug

Fuer den Start reicht `item_files`, fuer den Endausbau ist das Modell noch zu grob.

Offen ist insbesondere die klare Trennung von:

- Originalquelle
- Attachment
- Preview
- OCR-Ergebnis
- abgeleitetem Asset

Gerade fuer OCR, mobile Capture und Agenten ist das relevant.

### 4. Provenance, Audit und Versionierung sind erkannt, aber noch nicht eingebaut

Diese drei Themen sind fuer agentische Systeme zentral:

- Wer hat etwas geaendert?
- Woher stammt ein Wert?
- Welche Version ist aktuell?

Wenn diese Aspekte zu spaet kommen, wird spaetere Nachruestung teuer.

### 5. Gefahr eines zu breiten MVP

Die spaeteren Chats enthalten bereits:

- Capability-Layer
- API-Design
- CLI
- MCP
- React-Frontend
- mobile Capture
- OCR
- Projekte
- Zeitreihen

Das ist als Zielbild gut, aber als gleichzeitiger MVP zu gross.

## Konsistenzbewertung

### Fachlich

Fachlich ist das Modell weitgehend konsistent. Die Regeln aus dem Handbook verbessern den Stand deutlich.

Offene Punkte:

- wann etwas nur Label ist und wann eigenes Kontextobjekt
- wie Mehrfachklassifikation spaeter genau aussehen soll
- wie Projekte technisch angebunden werden sollen

### Technisch

Technisch ist die Richtung konsistent:

- Domain Core
- Capability Layer
- Interface Adapter
- Persistence/Search/Assets

Das ist eine saubere Struktur fuer einen modularen Monolithen.

### Agentenorientiert

Agentenorientiert ist der Entwurf gut vorbereitet, aber noch nicht fertig.

Was schon richtig ist:

- capability-basiert statt tabellenbasiert
- kanonische und abgeleitete Daten unterscheiden
- Retrieval-Pakete statt nur Low-Level-Reads

Was noch konkretisiert werden muss:

- minimale oeffentliche Capability-Menge
- Schreibregeln und Freigabemodi
- Provenance- und Audit-Daten im echten Modell

## Eignung fuer eine allgemeine Knowledge Base

Ja, der Entwurf ist fuer eine allgemeine Knowledge Base gut strukturiert.

Warum:

- er ist nicht auf ein einzelnes Tool oder eine einzelne Domäne fixiert
- er trennt Inhalt von Darstellung und Zugriff
- er ist offen fuer Notizen, Dokumente, Bilder, Tasks, Events und Zeitreihen
- er bleibt trotzdem ueberschaubar genug, um lokal betrieben zu werden

Die Idee ist deshalb nicht nur fuer private Notizen geeignet, sondern fuer ein allgemeines persoenliches Wissens- und Organisationssystem.

## Eignung fuer Agenten

Ja, mit einer wichtigen Bedingung:

Nicht das Datenmodell allein macht das System agentenfaehig, sondern die Kombination aus:

- Modellierungsregeln
- Capability Layer
- Retrieval-Paketen
- Provenance
- kontrollierten Schreibpfaden

Genau an dieser Stelle ist der Entwurf stark, aber noch nicht ganz abgeschlossen.

## Offene Architekturentscheidungen

Diese Punkte sollten vor einer groesseren Implementierung verbindlich entschieden werden:

### 1. Was ist im MVP wirklich drin?

Empfehlung:

- Notes
- Dokumente/Assets
- Labels/Kategorien
- Links
- Projekte/Kontexte
- Search
- minimaler Capability Layer
- Audit/Provenance in Basisform

Nicht im ersten MVP:

- vollwertige Tasks/Events
- Zeitreihen-UI
- OCR-Automatisierung
- semantische Suche
- komplexes Rechte-/Rollenmodell

### 2. Wie wird Projekt/Context technisch modelliert?

Zu entscheiden:

- eigener `item_kind = project`
- oder Kontext nur ueber Membership/Links

Empfehlung:

- fuer den Start ein eigener `project`-Typ ist sinnvoller, weil Kontextobjekte dann klare Identitaet und Metadaten bekommen

### 3. Wie sieht das Asset-Zielmodell aus?

Zu entscheiden:

- bleibt `item_files` vorerst einfach
- oder wird frueh ein staerkeres Asset-Modell eingefuehrt

Empfehlung:

- fuer MVP einfach starten
- aber Source, Preview und Derivate im Modell bereits mitdenken

### 4. Wie weit geht Rechte/ACL im MVP?

Empfehlung:

- internes Datenmodell vorbereiten
- UI und Runtime im MVP aber einfacher halten

### 5. Welche Capabilities sind oeffentlich?

Empfehlung:

- nur ein kleiner stabiler Read-/Write-Kern
- keine direkte Exponierung innerer Repository-Logik

## Konkrete Verbesserungen

### 1. Capability-MVP vor SQL finalisieren

Das ist die wichtigste Empfehlung.

Vor `schema.sql` sollten feststehen:

- die oeffentlichen Read-Capabilities
- die erlaubten Write-Capabilities
- die DTOs fuer diese Operationen

### 2. Audit und Provenance in den Kern ziehen

Minimal noetig:

- Actor
- Zeit
- Quelle
- Operation
- alte/neue Version referenzierbar

### 3. Gruppierungslogik hart normieren

Verbindlich festhalten:

- wann `project`
- wann Label
- wann Link
- wann `category_key`

### 4. Asset-Lebenszyklus definieren

Mindestens konzeptionell:

- upload
- registration
- attachment/link
- derivation
- preview
- OCR/extraction

### 5. V1 bewusst notes-first halten

Die spaetere Produktvision ist gut, aber die erste echte Anwendung sollte klar bleiben:

- Notes Workspace
- Linked Resources
- Search
- Projekte/Kontexte

Alles andere erst danach.

## Priorisierte Empfehlungen

### Prioritaet A

- Capability-MVP definieren
- Provenance/Audit minimal aufnehmen
- Gruppierungsregeln normieren

### Prioritaet B

- `schema.sql` und `seed.sql`
- FastAPI-Grundgeruest
- Notes-first React-Client

### Prioritaet C

- Tasks/Events
- Zeitreihen
- OCR und Asset-Intelligence
- MCP-Ausbau

## Empfohlene naechste Schritte

1. `04_modelling_handbook.md` als verbindliche Regelbasis finalisieren.
2. Daraus ein `capability_mvp.md` ableiten.
3. Danach `schema.sql` und `seed.sql` erzeugen.
4. Parallel dazu ein minimales Audit-/Provenance-Modell festziehen.
5. Erst dann den Notes-first Vertical Slice implementieren.

## Schlussbewertung

Die Idee ist sinnvoll, gut strukturiert und fuer eine allgemeine Knowledge Base tragfaehig. Sie ist zudem ungewoehnlich gut fuer agentische Nutzung vorbereitet. Die groesste verbleibende Aufgabe ist nicht, noch mehr Features zu erfinden, sondern die vorhandenen Konzepte in einen kleinen, harten, konsistenten Kern zu ueberfuehren.

Wenn das gelingt, ist der Entwurf nicht nur ein gutes Dokumentationsmodell, sondern eine solide Grundlage fuer ein echtes agentenfaehiges Wissenssystem.
