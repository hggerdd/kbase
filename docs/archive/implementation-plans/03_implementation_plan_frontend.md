# Frontend Implementation Plan

## Status

- Abgearbeitet am 2026-04-14
- umgesetzt in Frontend-Logik und Regressionstests

## Zielbild

Die Web-App soll von Anfang an als grober Produkt-Rahmen gedacht werden und nicht nur als einzelne Notes-Seite.

Geplante Hauptnavigation:

- `Home`
- `Notes`
- `Projects`
- `Imports`

Desktop:

- Navigation als Tabs oben

Mobile / schmale hohe Screens:

- Navigation fixiert an der Unterseite
- immer sichtbar
- unabhaengig von der Seitenlaenge

Wichtig:

Die App soll schon jetzt so aufgebaut werden, dass spaeter Multiuser- und Auth-Betrieb sauber eingebaut werden kann.

## Grundprinzip

Die Frontend-App darf keine eigene Fachlogik duplizieren.

Sie ist:

- ein Client ueber dem Capability-Layer
- modular aufgebaut
- auf spaetere Authentifizierung und Rollen vorbereitet
- auf mehrere Oberflaechenbereiche ausgelegt

## Zielstruktur im Frontend

Empfohlene Frontend-Struktur:

```text
frontend/src/
  app/
    AppShell.jsx
    AppRouter.jsx
    navigation/
      TopTabs.jsx
      BottomNav.jsx
      nav-config.js
  pages/
    home/
      HomePage.jsx
      home.css
    notes/
      NotesPage.jsx
      components/
        NotesList.jsx
        NoteEditor.jsx
        NoteMetaPanel.jsx
        AttachmentPanel.jsx
    projects/
      ProjectsPage.jsx
      components/
        ProjectsList.jsx
        ProjectOverview.jsx
    imports/
      ImportsPage.jsx
      components/
        InboxList.jsx
        ImportPreview.jsx
  features/
    notes/
      api.js
      hooks.js
      state.js
    projects/
      api.js
      hooks.js
      state.js
    imports/
      api.js
      hooks.js
      state.js
    auth/
      api.js
      session.js
      actor-context.js
  shared/
    api/
      client.js
      config.js
    ui/
      PageHeader.jsx
      Panel.jsx
      EmptyState.jsx
      SearchBox.jsx
      StatCard.jsx
      LoadingState.jsx
      ErrorState.jsx
    layout/
      ResponsiveContainer.jsx
      TabLayout.jsx
  styles/
    tokens.css
    globals.css
    layout.css
```

## Layout- und Navigationsidee

### Desktop

- oben eine feste App-Bar
- darin:
  - Brand
  - globale Suche
  - Tabs: `Home`, `Notes`, `Projects`, `Imports`
  - spaeter User-Menue

### Mobile

- die obere Bar wird reduziert
- Hauptnavigation wird nach unten verlagert
- Bottom Navigation bleibt `position: fixed`
- Seiteninhalt bekommt unten genug Padding, damit nichts hinter der Navigation verschwindet

### Navigationsregeln

- Navigation ist nicht nur visuell, sondern strukturell zentral
- jede Hauptseite ist ein eigener Page-Entry
- Notes bleibt nur ein Bereich innerhalb einer groesseren App

## Inhalte der Hauptbereiche

### 1. Home

Home ist kein Dashboard fuer alles, sondern eine kompakte Arbeitsstartseite.

Geplant:

- globales Suchfeld
- letzte 5 von mir bearbeitete Items
- letzte 5 von mir bearbeitete Assets
- optional spaeter:
  - zuletzt offene Projects
  - offene Imports / Inbox-Hinweise
  - kuerzliche Aktivitaet

Home soll schnell sein und nur die wichtigsten Einstiege zeigen.

### 2. Notes

Hier lebt die aktuelle Notes-App weiter.

Geplant:

- Notizliste
- Suche
- Detailansicht
- Rich-Text-Editor mit Speicherung als Markdown
- Label-Bearbeitung
- Attachments
- spaeter:
  - Klassifikation
  - Metadaten
  - Historie / Provenance tiefer
  - Teilen mit anderen usern
  - notizen zu tasks erweitern mit due dates
  - Verlinkung zu anderen Items (Notizen, Dokumenten (bilder, pdf, csv, zeitreihen))

### 3. Projects

Projects bekommt eine eigene Seite statt nur punktueller Projektzuordnung.
Projekte sind eigene Strukturierungselemente. Zum Beispiel werden unterhalb eines Projektes viele Notizen, Dokumente, Bilder, Links, etc. gespeichert. Ein Projekt hat einen Status (kann als fertig archiviert werden).

Geplant:

- Liste aller Projects
- Suche / Filter
- Project-Detailansicht
- zugeordnete Items
- spaeter:
  - Projektstatus
  - letzte Aktivitaet
  - Project-spezifische Suche

### 4. Imports

Imports dient als kontrollierter Eingang fuer neue Dateien.

Geplant:

- Inbox-Ansicht fuer neue Dateien
- Import-Vorschau
- Import nach Regeln vieler Dateien (z.B. Ordner enthält 100 Datien "Einkommensnachweis" --> wie sollen diese in die Struktur mit Label, categorie, Beschriebung und zusammenfassung geladen werden).
- Auswahl: zu bestehendem Item haengen oder neues Item erzeugen
- spaeter:
  - OCR-Status
  - automatische Klassifizierung
  - Batch-Import

## Multiuser- und Auth-Vorbereitung

Die App muss jetzt noch keine Auth voll implementieren, aber die Struktur dafuer muss vorbereitet sein.

### Frontend-seitig vorbereiten

- zentrales `auth/session`-Modul
- kein hart codierter Actor in den Fachkomponenten
- Actor-Kontext nur aus einer Session-/Context-Schicht beziehen
- API-Client muss Header zentral setzen
- spaeter austauschbar:
  - `x-kbase-actor`
  - Bearer Token
  - Session Cookie

### Ziel fuer Auth

Spaetere Integration sollte moeglich sein fuer:

- Single User lokal
- mehrere Nutzer im Familien-/Teamkontext
- Rollen / Memberships
- spaeter evtl. externe Identity Provider

## Modulare Frontend-Architektur

Die Seiten sollten nicht als eine grosse Datei wachsen.

### Regeln

- Page-Komponenten nur fuer Seitenkomposition
- Feature-Ordner kapseln API + Hooks + Feature-Logik
- Shared-Komponenten bleiben fachlich neutral
- gemeinsamer API-Client nur an einer Stelle
- kein Wildwuchs von `fetch` direkt in beliebigen Komponenten

### State-Strategie

Fuer den naechsten Schritt reicht lokaler React-State plus Feature-Hooks.

Noch nicht zwingend noetig:

- Redux
- Zustand
- React Query

Aber die Struktur soll offen bleiben, spaeter auf Query-/Cache-Layer umzusteigen.

## Benoetigte Capabilities vor Frontend-Ausbau

Nicht alles fuer alle Tabs existiert heute schon. Vor einer sauberen Umsetzung muessen bestimmte Capabilities vorhanden sein.

### Bereits weitgehend vorhanden

Fuer `Notes`:

- `create_note`
- `get_item`
- `list_items`
- `replace_content_part`
- `search_content`
- `assign_labels`
- `replace_labels`
- `list_labels`
- `register_asset`
- `attach_asset_to_item`
- `get_item_history`
- `get_item_provenance`

Fuer `Projects` teilweise:

- `create_project`
- `add_item_to_project`
- `list_project_items`

### Vorher noch sinnvoll zu implementieren

#### Home

Noetige oder sehr hilfreiche Capabilities:

- `list_recent_items`
- `list_recent_assets`
- optional: `list_recent_projects`

Aktuell koennte man das teilweise ueber vorhandene Listen zusammensetzen, aber als echte Home-Seite waeren eigene Read-Capabilities besser.

#### Projects

Noetige Capabilities:

- `list_projects`
- `get_project`
- optional: `search_projects`

Aktuell fehlt insbesondere eine saubere Projektliste als eigener Read-Use-Case.

#### Imports

Noetige Capabilities:

- `list_inbox_files`
- `preview_import_candidate`
- `import_file_as_item`
- `attach_inbox_file_to_item`
- optional spaeter:
  - `run_import_analysis`
  - `extract_document_content`

Imports ist ohne diese Capabilities nur ein Platzhalter.

#### Auth / Multiuser

Noetige oder spaeter notwendige Capabilities / Endpunkte:

- `get_current_session`
- `list_available_principals`
- `switch_actor_context` oder spaeter echter Login

## API-Voraussetzungen

Wenn diese Frontend-Struktur umgesetzt wird, muessen die benoetigten Capabilities sauber auf die API gegeben werden.

Insbesondere noch noetig oder sinnvoll:

- `GET /api/home/recent-items`
- `GET /api/home/recent-assets`
- `GET /api/projects`
- `GET /api/projects/{project_id}`
- `GET /api/imports/inbox`
- `POST /api/imports/preview`
- `POST /api/imports/import-as-item`
- `POST /api/imports/attach-to-item`
- spaeter Auth-Endpunkte

## Umsetzungsphasen

### Phase 1: App Shell

Ziel:

- globale Navigationsstruktur
- Top Tabs auf Desktop
- Bottom Navigation auf Mobile
- Routing oder tab-basierte Seitenumschaltung

Noch ohne volle Inhalte.

### Phase 2: Home + Notes Migration

Ziel:

- Notes in eigenen `NotesPage`-Bereich verschieben
- Home als eigene Startseite bauen
- globale Suche oben integrieren

### Phase 3: Projects Seite

Ziel:

- Projects-Liste
- Project-Detailansicht
- verknuepfte Items

Abhaengig von neuen Project-Read-Capabilities.

### Phase 4: Imports Seite

Ziel:

- Inbox
- Import-Vorschau
- Import-Entscheidung

Stark abhaengig von neuen Import-Capabilities.

### Phase 5: Auth-Vorbereitung / Session Layer

Ziel:

- Actor-/Session-Kontext aus zentralem Provider
- keine hart verdrahtete User-Annahme mehr im UI

## Responsive Verhaltensregeln

### Desktop

- Tabs oben
- mehrspaltige Layouts moeglich
- Home und Projects mit Karten/Grid

### Tablet

- obere Navigation bleibt moeglich
- Inhalte reduzieren sich auf 1-2 Spalten

### Mobile

- Bottom Navigation fest sichtbar
- Seiteninhalte scrollen unterhalb einer fixen unteren Leiste
- Inhalt muss unten Padding erhalten
- keine Seitenelemente duerfen unter der Nav verborgen sein

## Technische Entscheidungen

### Routing

Empfehlung:

- React Router einfuehren

Gruende:

- klarere Seitentrennung
- direkte Links
- bessere Skalierung fuer Home / Notes / Projects / Imports

### API-Client

Ein zentraler Client sollte:

- Basis-URL verwalten
- Actor-/Session-Header setzen
- Fehler normalisieren
- spaeter Auth integrieren

### UI-System

Empfehlung:

- bestehende helle visuelle Richtung behalten
- Shared-UI-Komponenten systematisch extrahieren
- Design Tokens frueh zentralisieren

## Prioritaet

Die wichtigste Frontend-Reihenfolge ist:

1. App Shell und Navigation
2. Notes sauber modularisieren
3. Home als kompakte Arbeitsstartseite
4. dann erst Projects
5. Imports erst nach passenden Capabilities

## Nicht jetzt implementieren

Noch nicht Teil dieses Schritts:

- vollständige Auth
- Imports-Logik
- Project-Management in voller Tiefe
- komplexe Home-Analytics
- globale Zustandssynchronisation ueber mehrere Browser-Sessions

## Zusammenfassung

Die App sollte jetzt von einer einzelnen Notes-Ansicht zu einer echten Multi-Bereich-App wachsen.

Die richtige Richtung ist:

- Shell zuerst
- Features modular schneiden
- Multiuser/Auth vorbereiten
- Frontend nicht vor die fehlenden Capabilities bauen

Besonders wichtig:

Vor `Projects`, `Imports` und einem starken `Home` muessen die passenden Read-/Import-Capabilities sauber implementiert und danach auf die API gegeben werden. Erst darauf sollte die UI-Schicht aufsetzen.
