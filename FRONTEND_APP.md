# Frontend App

Diese Datei dokumentiert die React-Web-App fuer `kbase`.

Die App ist aktuell ein einfacher, aber bewusst gestalteter Startpunkt fuer eine browserbasierte Notiz-App.  
Sie nutzt das FastAPI-Backend und greift damit indirekt auf dieselben Capabilities zu wie die CLI.

## Ziel

Die Frontend-App soll:

- Notes schnell auffindbar machen
- das Erstellen und Bearbeiten von Notes ermoeglichen
- spaeter als Basis fuer weitere Oberflaechen dienen
- von Anfang an sauber auf dem Capability-Layer aufbauen

## Aktueller Stand

Umgesetzt:

- React-App mit Vite
- Verbindung zum FastAPI-Backend
- Liste von Notes
- Suchfunktion
- Detailansicht einer Note
- Note erstellen
- Note bearbeiten und speichern
- Anzeige von Labels
- Anzeige der letzten History-Eintraege
- responsives Layout fuer Desktop und Mobile

Noch nicht umgesetzt:

- echte Markdown-Preview
- Projektverwaltung im Frontend
- Metadata-Editor
- Label-Editor
- Archivieren / Loeschen
- Asset-Upload
- Authentifizierung / Session-Konzept

Zielbild fuer die naechste Security-Stufe:

- Benutzer melden sich an der App an
- das Backend fuehrt die Session
- ACL basiert auf `principals` und Gruppen, nicht auf einem frei waehlenbaren Actor im Browser
- Referenz: [11_auth_acl_plan.md](03_implementation_plan/11_auth_acl_plan.md)

## Ordnerstruktur

```text
frontend/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    api.js
    styles.css
```

## Technische Basis

- React 18
- Vite
- plain CSS
- direkter HTTP-Zugriff per `fetch`

Es wurde bewusst kein UI-Framework eingebaut, damit die visuelle Richtung klar und leicht kontrollierbar bleibt.

## Designrichtung

Die App ist visuell an modernen Crypto-/Trading-Apps orientiert:

- dunkler Hintergrund
- kontrastreiche Akzentfarben
- Glasflaechen / Panels
- Dashboard-Atmosphaere
- kompakte, signalartige Informationsdarstellung

Die Gestaltung ist absichtlich nicht wie eine klassische "schlichte Notiz-App", sondern eher wie ein Analyse-Workspace.

## Starten

### Backend

```powershell
uv run uvicorn kbase.interfaces.api.main:app --reload
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Aufruf im Browser

```text
http://127.0.0.1:5173
```

## Konfiguration

Die API-Basisadresse kann ueber Umgebungsvariablen gesetzt werden.

Der aktuell noch vorhandene Standard-Actor ist nur ein Uebergangsmechanismus vor `SEC-001`.

In [api.js](/c:/ttt/kbase/frontend/src/api.js):

- `VITE_API_BASE_URL`
- `VITE_KBASE_ACTOR`

Beispiel:

```powershell
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
$env:VITE_KBASE_ACTOR = "heiko"
npm run dev
```

Ohne explizite Werte nutzt die App:

- API: `http://127.0.0.1:8000`
- Actor: `heiko`

Geplante Richtung:

- `VITE_KBASE_ACTOR` faellt spaeter weg
- die App liest stattdessen `GET /api/auth/session`
- der angemeldete Benutzer bestimmt den Principal serverseitig

## Lokales Netzwerk

Fuer LAN-Zugriff muessen Frontend-Host, Backend-Host und CORS zusammenpassen.

Beispiel mit einer Rechner-IP `192.168.178.50`:

### Backend im LAN starten

```powershell
$env:KBASE_CORS_ORIGINS = "http://192.168.178.50:5173,http://127.0.0.1:5173"
uv run uvicorn kbase.interfaces.api.main:app --host 0.0.0.0 --port 8000
```

### Frontend im LAN starten

```powershell
cd frontend
$env:VITE_DEV_HOST = "0.0.0.0"
$env:VITE_API_BASE_URL = "http://192.168.178.50:8000"
npm run dev
```

Danach ist das Frontend im lokalen Netzwerk unter `http://192.168.178.50:5173` erreichbar.

## Datenfluss

Der Datenfluss ist einfach gehalten:

1. React-Komponente startet
2. Frontend laedt Notes vom FastAPI-Backend
3. Backend ruft die bestehenden Application-Capabilities auf
4. SQLite liefert die strukturierten Daten
5. Frontend zeigt Liste und Detailansicht an

Es gibt keine Frontend-eigene Fachlogik fuer Notes.  
Die App ist ein Client ueber dem bestehenden Capability-Layer.

## Aktuelle API-Nutzung

Die App nutzt aktuell diese Endpunkte:

- `GET /api/items?item_kind=note&limit=100`
- `GET /api/search/content`
- `GET /api/items/{item_id}`
- `GET /api/items/{item_id}/history`
- `POST /api/notes`
- `PATCH /api/items/{item_id}`
- `PUT /api/items/{item_id}/content`

## Hauptdateien

### Einstieg

[main.jsx](/c:/ttt/kbase/frontend/src/main.jsx)

Initialisiert React und bindet die App in `#root` ein.

### Hauptoberflaeche

[App.jsx](/c:/ttt/kbase/frontend/src/App.jsx)

Enthaelt:

- Dashboard-Layout
- Note-Liste
- Suchformular
- Erstellformular
- Editor fuer die ausgewaehlte Note
- Laden und Speichern

### API-Client

[api.js](/c:/ttt/kbase/frontend/src/api.js)

Enthaelt die HTTP-Funktionen fuer:

- Notes laden
- Note laden
- Note erstellen
- Note aktualisieren
- Content ersetzen
- Historie laden

### Styling

[styles.css](/c:/ttt/kbase/frontend/src/styles.css)

Definiert:

- Farben
- Panels
- Hero-Bereich
- Stats
- Listenlayout
- Editorlayout
- Responsive-Verhalten

## Basisfunktionen

### 1. Note-Liste

Die linke Spalte zeigt Notes als Feed.

Angezeigt werden:

- Titel
- Kategorie
- Status
- Aenderungsdatum

### 2. Suche

Die Suche nutzt `GET /api/search/content`.

Wenn ein Suchbegriff eingegeben wird, wird die Note-Liste neu geladen.

### 3. Detailansicht

Die Mitte zeigt die aktive Note:

- Titel
- Kategorie
- Status
- Markdown-Inhalt
- Labels
- letzte History-Eintraege

### 4. Note erstellen

Die rechte Spalte dient als Create-Panel.

Felder:

- Titel
- Kategorie
- Labels als kommaseparierte Liste
- Body

### 5. Note bearbeiten

Eine aktive Note kann geaendert werden:

- Titel
- Kategorie
- Status
- Markdown-Inhalt

Speichern passiert in zwei Schritten:

1. `PATCH /api/items/{item_id}`
2. `PUT /api/items/{item_id}/content`

## Wichtige Annahmen

- Es gibt aktuell keinen Login.
- Der Actor wird aktuell ueber `x-kbase-actor` fest gesetzt.
- Nur `note`-Items sind aktuell im Frontend sichtbar.
- Die App arbeitet noch ohne Router.
- Die App ist ein MVP und kein vollstaendiger PKM-Client.

Fuer `SEC-001` wird diese Annahme ersetzt durch:

- Benutzer-Login im Frontend
- Session-Cookie oder spaeter Token fuer nicht-browserbasierte Clients
- keine freie Actor-Wahl mehr im Browser
- dieselbe Principal-Ableitung fuer Frontend, API und spaetere ACL-Pruefungen

## CORS

Ohne weitere Konfiguration sind diese Entwicklungs-Origins freigegeben:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Fuer LAN-Zugriff kann die Liste ueber `KBASE_CORS_ORIGINS` als komma-separierte Origin-Liste erweitert oder ersetzt werden.

## Naechste sinnvolle Schritte

1. Markdown-Preview neben dem Editor
2. Projektzuordnung im Frontend
3. Label- und Metadata-Bearbeitung
4. Archivieren / Restore
5. Asset-Upload
6. sauberer API-Statusbereich fuer Lade- und Fehlerzustaende
7. Routing fuer Listen-, Detail- und Projektansichten
8. Authentifizierung und Multiuser-Kontext gemaess [11_auth_acl_plan.md](03_implementation_plan/11_auth_acl_plan.md)

## Gesamtbewertung

Die App ist bewusst klein gestartet, aber sie ist technisch korrekt an den Capability-Layer gekoppelt und damit ein guter erster Web-Client.

Wichtig ist:  
Die Frontend-App ist nicht "parallel logisch" zum Backend gebaut, sondern nur eine weitere Oberflaeche ueber denselben Kern. Genau das ist fuer die Zielarchitektur der richtige Start.
