# Config Page Implementation Plan

## Ziel

Es soll ein eigener Konfigurationsbereich in der App entstehen, in dem fachliche Referenzstrukturen verwaltet werden koennen.

Der wichtigste erste Fokus:

- Kategorien anlegen
- Kategorien aendern
- Kategorien deaktivieren oder loeschen
- Labels anlegen
- Labels umbenennen
- Labels deaktivieren

Spaeter kann derselbe Bereich auch weitere Konfigurationen aufnehmen, zum Beispiel:

- Item-Kinds oder erlaubte Zuordnungen
- Statuswerte
- Import-Regeln
- Principals / Actor-Kontexte
- projektbezogene Konfigurationswerte

## Grundidee

Die Config Page ist kein rein technischer Admin-Screen, sondern eine fachliche Verwaltungsoberflaeche fuer Stammdaten und kontrollierte Taxonomien.

Wichtig:

- auch Konfiguration laeuft ueber Capabilities
- API, CLI und Frontend sind nur Adapter
- keine direkte Datenbankmanipulation aus UI oder CLI

## Zielbild in der App

Die App bekommt einen zusaetzlichen Hauptbereich:

- `Config`

Dort sollen einzelne Konfigurationsmodule liegen.

Erste Module:

- `Categories`
- `Labels`

Spaeter moeglich:

- `Statuses`
- `Imports`
- `Session / Principals`
- `Reference Data`

## Produktanforderungen

### Die Config Page soll koennen

- bestehende Kategorien durchsuchen
- neue Kategorien anlegen
- Kategorien umbenennen oder inhaltlich anpassen
- Kategorien deaktivieren statt sofort hart zu loeschen
- bestehende Labels durchsuchen
- neue Labels anlegen
- Labels umbenennen
- Labels deaktivieren
- klare Warnungen zeigen, wenn Strukturen bereits in Benutzung sind

### Die Config Page soll nicht tun

- unkontrolliert technische Tabellen editieren
- Fachregeln im Frontend nachbauen
- referenzierte Werte physisch loeschen, ohne Auswirkungen zu beruecksichtigen

## Fachliche Objekte im Konfigurationsbereich

## 1. Categories

### Ziel

Kategorien sollen als eigenstaendige, verwaltbare Referenzdaten sichtbar werden.

### Erwartete Operationen

- `create_category`
- `list_categories`
- `update_category`
- `deactivate_category`
- optional spaeter `reactivate_category`

### Moegliche Felder

- `key`
- `display_name`
- `description`
- `item_kind_scope` oder erlaubte Zielobjekte
- `is_active`
- optionale Sortierung
- optionale Farbe / UI-Metadaten spaeter

### Wichtige Regeln

- `key` muss eindeutig bleiben
- Kategorien duerfen nicht stillschweigend verschwinden, wenn sie in Nutzung sind
- Deactivate ist fuer den ersten Schritt besser als hartes Delete

## 2. Labels

### Ziel

Labels sind hierarchische Taxonomie-Knoten und muessen als solche verwaltet werden koennen.

### Erwartete Operationen

- `create_label`
- `list_labels`
- `rename_label`
- `deactivate_label`
- optional `reactivate_label`

### Wichtige Regeln

- `full_path` global eindeutig
- Rename muss mit Unterknoten sauber definiert sein
- Inaktive Labels duerfen nicht standardmaessig fuer neue Zuweisungen auftauchen

## 3. Weitere spaetere Konfigurationsobjekte

Noch nicht zwingend Teil des ersten Schritts, aber die Architektur soll offen dafuer bleiben:

- Statusdefinitionen
- Import-Regeln
- Projekttypen
- Klassifikationsmappings
- Dateityp-Regeln

## Capabilities

## A. Kategorien

### Neu einzufuehren

- `create_category`
- `list_categories`
- `update_category`
- `deactivate_category`

### Rueckgabemodell

Ein `CategoryData` oder `CategorySummary` sollte mindestens enthalten:

- `id` oder stabiler technischer Identifier
- `key`
- `display_name`
- `description`
- `is_active`
- optionale Scopes
- `created_at`
- `updated_at`

### Fachliche Pruefungen

- Kollision auf `key`
- Ungueltige Scopes
- Deactivate nur kontrolliert
- Update darf keine stillen Inkonsistenzen erzeugen

## B. Labels

### Neu einzufuehren

- `create_label`
- `rename_label`
- `deactivate_label`
- optional `reactivate_label`

### Fachliche Pruefungen

- keine Pfadkollision
- keine ungueltigen Parent-Child-Beziehungen
- klare Regel fuer Subtree-Rename

## C. Optionale gemeinsame Konfigurations-Capabilities

Falls spaeter sinnvoll:

- `list_reference_data`
- `get_config_overview`

Das ist fuer den ersten Schritt aber nicht noetig. Besser erst klare Einzelfunktionen bauen.

## Datenmodell

## A. Kategorien

Es muss geprueft werden, wie Kategorien aktuell modelliert sind.

Wenn Kategorien bisher nur implizit als freie Keys benutzt werden, braucht es ein echtes Referenzmodell.

Moegliche Richtung:

- neue Tabelle `categories`

Mit Feldern wie:

- `id`
- `key`
- `display_name`
- `description`
- `is_active`
- `scope_kind`
- `created_at`
- `updated_at`

### Wichtige Designfrage

Soll `category_key` in Items weiterhin als String gespeichert werden oder auf eine echte Referenz umgestellt werden?

Empfehlung fuer den naechsten Schritt:

- kurzfristig `key` als stabilen String beibehalten
- aber Referenzdaten in eigener Tabelle verwalten

Das reduziert Migrationsaufwand und erlaubt trotzdem echte Verwaltung.

## B. Labels

Fuer Labels ist voraussichtlich eine Erweiterung bestehender Tabellen ausreichend.

Sinnvoll:

- `is_active`
- evtl. zusaetzliche Audit- oder Verwaltungsfelder

## C. Migration

Falls Kategorien bislang frei verwendet wurden:

- vorhandene genutzte `category_key`-Werte in Referenzdaten ueberfuehren
- Seeds fuer Standardkategorien definieren
- dokumentieren, welche Kategorien systemseitig mitgeliefert werden

## API

## A. Kategorien-Endpunkte

Empfohlene Endpunkte:

- `GET /api/config/categories`
- `POST /api/config/categories`
- `PATCH /api/config/categories/{category_id}`
- `POST /api/config/categories/{category_id}/deactivate`

Optional spaeter:

- `POST /api/config/categories/{category_id}/reactivate`

## B. Labels-Endpunkte

Empfohlene Endpunkte:

- `GET /api/config/labels`
- `POST /api/config/labels`
- `PATCH /api/config/labels/{label_id}`
- `POST /api/config/labels/{label_id}/deactivate`

### Hinweis

Technisch koennte man Labels auch weiter unter `/api/labels` belassen.

Fuer die Config Page ist aber ein gruppierter `config`-Namensraum attraktiv, weil damit klarer wird:

- dies sind Verwaltungsendpunkte
- nicht nur normale Nutzungsendpunkte

Empfehlung:

- entweder konsequent `/api/config/...`
- oder, wenn bestehende API-Struktur bevorzugt wird, sauber dokumentieren, welche Label-Endpunkte Verwaltungsfaelle sind

## C. API-Response-Modelle

Noetig:

- `CategoryData`
- `ListCategoriesResult`
- `CreateCategoryRequest`
- `UpdateCategoryRequest`
- `RenameLabelRequest` oder allgemeiner `UpdateLabelRequest`

## CLI

## A. Kategorien-Befehle

Einzufuehren:

- `kbase config category list`
- `kbase config category create`
- `kbase config category update`
- `kbase config category deactivate`

Alternativ kuerzer:

- `kbase category list`
- `kbase category create`
- `kbase category update`
- `kbase category deactivate`

Empfehlung:

- wenn ein echter Config-Bereich als Produktziel gesetzt wird, ist `config` als Namespace konsistent

## B. Label-Befehle

- `kbase config label list`
- `kbase config label create`
- `kbase config label rename`
- `kbase config label deactivate`

## C. CLI-Anforderungen

- JSON-Ausgabe fuer alle Verwaltungsbefehle
- klare Fehlermeldungen bei Kollisionen
- keine direkte DB- oder Seed-Manipulation

## Frontend-App

## A. Navigation

Die Hauptnavigation wird erweitert um:

- `Config`

Desktop:

- zusaetzlicher Tab oben

Mobile:

- zusaetzlicher Eintrag in der Bottom Navigation

## B. Seitenstruktur

Empfohlene Struktur:

```text
frontend/src/
  pages/
    config/
      ConfigPage.jsx
      components/
        ConfigSectionNav.jsx
        CategoriesPanel.jsx
        CategoryForm.jsx
        LabelsPanel.jsx
        LabelForm.jsx
```

## C. Aufbau der Seite

Die Config Page sollte nicht wie ein rohes CRUD-Formular aussehen, sondern wie ein strukturierter Verwaltungsbereich.

Empfohlene Abschnitte:

- Intro / Erklaerung
- Modulnavigation
- Kategorien-Modul
- Labels-Modul

### Kategorien-Modul

Soll enthalten:

- Liste aller Kategorien
- Suche oder Filter
- Statusanzeige aktiv/inaktiv
- Formular fuer neue Kategorie
- Edit-Funktion
- Deactivate-Aktion

### Labels-Modul

Soll enthalten:

- Labelsuche
- Anzeige als Liste oder Baum
- Formular fuer neues Label
- Rename-Funktion
- Deactivate-Aktion

## D. UX-Regeln

- destruktive Aktionen immer bestaetigen
- bei Deactivate klar sagen, was das fuer bestehende Referenzen bedeutet
- bei Kollisionen konkrete Fehlermeldung zeigen
- aktive und inaktive Eintraege visuell unterscheiden

## E. Session-/Rollenperspektive

Auch wenn Auth noch nicht voll implementiert ist, sollte die Seite schon so gebaut werden, dass spaeter nur berechtigte Nutzer Konfigurationsaenderungen machen duerfen.

Das bedeutet:

- Config Page als eigener Bereich
- Zugriff spaeter ueber Session-/Role-Layer einschrankenbar
- keine Logik in Fachkomponenten hart verdrahten

## Teststrategie

## A. Capability-Tests

Fuer Kategorien:

- Kategorie anlegen
- Duplikat verhindern
- Kategorie aktualisieren
- Kategorie deaktivieren

Fuer Labels:

- Label anlegen
- Rename
- Rename mit Subtree
- Deactivate
- Kollisionen

## B. Integrations-Tests

- neue Referenzdaten im DB-Schema
- Migration bestehender Kategorien
- Zusammenspiel mit Items, die Kategorien oder Labels bereits nutzen

## C. API-Tests

- `GET/POST/PATCH` fuer Kategorien
- `GET/POST/PATCH` fuer Labels
- Fehlerrueckgaben
- Actor-Kontext

## D. CLI-Tests

- neue `config`-Commands
- JSON-Ausgaben
- Fehlermeldungen

## E. Frontend-Tests

Sinnvoll:

- Config Page rendert Modulbereiche
- Kategorienliste laedt
- Formular sendet neue Kategorie
- Label-Rename-Flow
- Empty-State und Error-State

## Dokumentation

Zu aktualisieren:

- `README.md`
- `API_DOKU.md`
- `FRONTEND_APP.md`
- Architektur- und Implementierungsplaene

Zu dokumentieren:

- welche Konfigurationsobjekte existieren
- welche Felder veraenderbar sind
- welche Deactivate-Regeln gelten
- wie sich Kategorien und Labels auf bestehende Items auswirken

## Reihenfolge der Umsetzung

## Phase 1: Kategorien als echte Referenzdaten

1. Datenmodell fuer Kategorien pruefen und erweitern
2. `list/create/update/deactivate_category` implementieren
3. API-Endpunkte bauen
4. CLI-Befehle bauen
5. Tests schreiben

## Phase 2: Label-Management vervollstaendigen

1. `create/rename/deactivate_label` implementieren
2. API-Endpunkte bauen
3. CLI-Befehle bauen
4. Tests schreiben

## Phase 3: Config Page im Frontend

1. Navigation um `Config` erweitern
2. `ConfigPage` als neue Hauptseite bauen
3. Kategorien-Modul anschliessen
4. Labels-Modul anschliessen
5. Error-/Confirm-/Empty-States sauber machen

## Phase 4: Konsolidierung

1. Dokumentation aktualisieren
2. Seeds und Migrationspfad beschreiben
3. spaetere Rollen-/Rechteintegration vorbereiten

## Wichtige Entscheidungen

Noch zu klaeren:

- sollen Kategorien harte Referenzdaten mit eigener Tabelle werden
- soll `category_key` in Items langfristig ein freier Key bleiben oder spaeter referenziert werden
- sollen Label- und Kategorien-Endpunkte unter `/api/config/*` gruppiert werden
- ob es hartes Delete ueberhaupt geben soll oder nur `deactivate`

## Risiken

### 1. Kategorien nur als UI-CRUD ohne Fachmodell

Dann bleibt die Struktur inkonsistent und andere Clients koennen die Regeln nicht verlaesslich nutzen.

### 2. Label-Rename ohne klare Tree-Regeln

Das fuehrt schnell zu taxonomischer Inkonsistenz.

### 3. Config Page wird zu breit

Wenn zu viele Objekte gleichzeitig aufgenommen werden, wird der erste Schritt zu gross. Deshalb zuerst nur `Categories` und `Labels`.

### 4. Rollenmodell wird spaeter schwer nachruestbar

Wenn die Config Page jetzt schon wie ein allgemeiner Bereich fuer alle Nutzer gebaut wird, wird der spaetere Schutz teurer.

## Definition of Done

Der erste Config-Page-Schritt ist abgeschlossen, wenn:

- Kategorien als verwaltbare Referenzdaten existieren
- Labels verwaltbar sind
- API und CLI dieselben Faelle abbilden
- die Frontend-App einen `Config`-Bereich besitzt
- Kategorien und Labels dort angelegt, geaendert und deaktiviert werden koennen
- Tests fuer Capability, API, CLI und Frontend vorhanden sind
- die Dokumentation den neuen Verwaltungsbereich beschreibt

## Zusammenfassung

Die Config Page ist der richtige Ort, um aus lose verwendeten Referenzwerten echte, verwaltbare Fachstrukturen zu machen.

Der erste sinnvolle Scope ist:

- `Categories`
- `Labels`

Diese sollten zuerst fachlich sauber als Capabilities modelliert und danach ueber API, CLI und Frontend als echter Konfigurationsbereich verfuegbar gemacht werden.
