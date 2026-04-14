# Projekte‑View — Konzept & Umsetzungsplan

Datum: 2026-04-14

Ziel
----
Projekte sind eine zusätzliche Strukturierungsebene neben Kategorie und Label. Sie fassen thematisch zusammen: Notizen, Dokumente, Dateien, Links, Entscheidungen, Messdaten (z.B. CSV), Aufgaben und Metadaten. Das Ziel dieses Dokuments ist ein klares UI/UX‑ und Datenmodell‑Vorschlag sowie ein umsetzbarer Plan (MVP + Erweiterungen). KEINE IMPLEMENTIERUNG — nur Plan.

Beispiele (Anwendungsfälle)
- Autokauf: Angebotsdokumente, Notizen zu Probefahrten, Checklisten, Entscheidungen, Rechnungen.
- Abnehmprojekt: Research‑Notizen, CSV‑Logs mit Gewicht und Messwerten, persönliche Einschätzungen, Rezepte.

Kernanforderungen
- Einheitliche Projektübersicht (Projekt‑Landing) mit Metadaten (Titel, Status, Start/Ende, Owner, Tags).
- Aggregation aller verknüpften Elemente: Notizen, Dateien, Links, Entscheidungen, Tasks, Daten‑Sets.
- Schnelles Verknüpfen/Entfernen von Items zu/von Projekten (einzeln und bulk).
- Suche & Filter innerhalb von Projekten (Typ, Datum, Inhalt, Tags).
- Timeline / Aktivitätsfeed
- Responsive UI und Drag&Drop für schnelle Linkerstellung.

Datenmodell
- lese die Projektdoku zu capabilities. 
- Nutze die capabilities, wenn wichtige inhalte fehlen füge diese als capability, cli und api hinzu

UI‑Vorschlag (Layout)
- Projekte‑Liste (linke Spalte / Grid)
  - Suchfeld, Filter (Status, Tag, Owner), Sortierung (Zuletzt aktualisiert, Name, Deadline)
  - Kartenansicht: Titel, Status, Mini‑Statistiken (Anzahl Notizen/Dateien), letzte Aktivität, Quick‑Actions (öffnen, neues Item)
- Projekt‑Detail (Hauptbereich)
  - Header: Titel (inline edit), Status Dropdown, Tags, Owner, Favorit/Star, Actions: Export, Archive, Share
  - Sekundäre Zeile: Fortschrittsbalken / Meilensteine / kurze Übersicht
  - Tabs / Sections: Overview | Notes | Files | Links | Decisions | Data | Tasks | Timeline

Tab‑Details
- Overview: Key metrics, letzte Aktivitäten, pinnbare Items, next steps
- Notes: Liste mit Suche, Vorschau, Inline‑Edit; Button „Neue Notiz in Projekt“ (automatisch verlinkt)
- Files: Grid/List, Dateivorschau (PDF, Bild), Dateien natürlich so wie alle anderen dateien behandeln, aber beim hochladen gleich in das Projekt verlinken und wichtige Felder befüllen (füge keine extra Konstrukte ein)
- Links: externe Ressourcen mit Metadata (Titel, Favicon, Notizfeld)
- Decisions: strukturierte Entscheidungsobjekte (Titel, Datum, Beteiligte, Begründung, verknüpfte Dateien) --> Decisions sind dateien, mit einem bestimmten label. so bleiben wir im kbase Standard.
- Data: CSV‑Viewer mit Vorschau, einfache Charts einbinden
- Tasks: sind Notizen mit einem bestimmten label (z.B. Task\Task und Task\Todo, Task\done, ...) einfache Kanban/Listansicht --> Kanban ist eine Option für die Anzeige
- Timeline: chronologischer Feed aller Änderungen und Hinzufügungen mit Filtern (Notes, Bildern, Dateien, ...)

Interaktionsprinzipien
- Verknüpfen von Items:
  - Von Item‑Detail: „Zu Projekt hinzufügen“ (Auswahl oder neues Projekt)
  - Von Projekt: „Item hinzufügen“ (Notiz erstellen, Datei hochladen, Link speichern)
  - Bulk: Mehrere Items markieren → Zu Projekt hinzufügen / entfernen
  - Drag&Drop: Item auf Projektkarte ziehen → Verknüpfen
- Backlinks: In jeder Notiz/Datei sichtbare Links zu zugeordneten Projekten
- Pinning & Ordering: wichtige Items oben fixieren / manuelle Reihenfolge

Akzeptanzkriterien (Beispiel)
- Nutzer kann neues Projekt anlegen und Metadaten bearbeiten
- Nutzer verknüpft mindestens eine Notiz und eine Datei mit einem Projekt
- Projektdetail zeigt verknüpfte Items korrekt und filterbar an
- Export erzeugt zip/json mit allen Referenzen