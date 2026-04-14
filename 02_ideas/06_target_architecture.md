# Target Architecture Proposal

## Ziel

Dieses Dokument beschreibt eine konkrete Zielarchitektur fuer die Knowledge Base mit Python und `uv` als gesetztem Stack. Es geht nicht um das Endprodukt im Detail, sondern um eine belastbare technische Richtung, die:

- das grosse Zielbild nicht verbaut
- frueh agentenfaehig ist
- mit einer CLI starten kann
- spaeter Web-App, MCP und Automationen sauber traegt

## Architekturprinzipien

### 1. Domain-first statt UI-first

Die zentrale Architektur darf nicht vom ersten UI-Client abhaengen. Die Domain und ihre Capabilities muessen zuerst stabil sein.

Konsequenz:

- zuerst Domainmodell und Capability Layer
- dann CLI als erster Client
- danach HTTP API und React-Frontend

### 2. Capability-first statt CRUD-first

Externe und interne Clients arbeiten nicht direkt gegen Tabellen oder generische Repositories, sondern gegen fachliche Operationen.

Beispiele:

- `create_note`
- `register_asset`
- `attach_asset_to_item`
- `assign_labels`
- `search_content`
- `get_item`

### 3. Ein zentrales Backend

Es gibt genau ein fachliches Backend.

Clients:

- CLI
- Web-App
- MCP / Agenten
- spaetere Automationen

greifen alle auf dieselbe Capability-Schicht zu.

### 4. Modularer Monolith als Startpunkt

Fuer diese Art System ist ein modularer Monolith die richtige Wahl.

Warum:

- weniger Betriebsaufwand
- lokale Entwicklung einfach
- SQLite-Start moeglich
- spaeter trennbar, wenn noetig
- fachliche Konsistenz bleibt hoch

Microservices wuerden hier frueh nur Reibung erzeugen.

### 5. Kanonische und abgeleitete Daten trennen

Die Architektur muss von Anfang an unterscheiden:

- Originalquellen
- benutzerbestaetigte strukturierte Daten
- extrahierte Daten
- generierte Daten

Diese Trennung ist fuer Agenten, Audit und spaetere Automatisierung essenziell.

## Empfohlene High-Level-Architektur

```text
Clients
  - CLI
  - React Web App
  - MCP Server / Agent Tools
  - Batch / Automation Jobs
        |
Interface Layer
  - CLI Commands
  - HTTP API (FastAPI)
  - MCP Adapter
        |
Application Layer
  - Capability Services
  - Authorization checks
  - Validation
  - Transactions
  - Audit / Provenance recording
        |
Domain Core
  - Entities
  - Value objects
  - modelling rules
  - domain policies
        |
Infrastructure
  - SQLite / later Postgres option
  - FTS search
  - Filesystem asset store
  - background jobs
```

## Technologievorschlag

### Sprache und Runtime

- Python 3.12+
- `uv` fuer Projektmanagement, virtuelle Umgebung, Locking und Commands

### Backend

- FastAPI
- Pydantic v2
- SQLAlchemy 2.x
- Alembic fuer Migrationen

### CLI

- Typer

Warum Typer:

- passt sehr gut zu FastAPI/Pydantic
- gute Developer Experience
- sauber typisierte Commands
- spaeter leicht fuer interne Operations nutzbar

### Datenbank

Start:

- SQLite

Spaeter optional:

- Postgres

Wichtige Regel:

- das Domain- und Capability-Design darf nicht SQLite-spezifisch gedacht werden
- die erste Implementierung darf aber bewusst SQLite-optimiert sein

### Suche

Start:

- SQLite FTS5

Spaeter:

- zusaetzlicher semantischer Suchindex

### Hintergrundjobs

Start:

- einfacher interner Job Runner oder tabellenbasierte Job Queue

Spaeter:

- dedizierter Worker, falls OCR, Import und Derivate wachsen

### Frontend

Spaeterer erster UI-Client:

- React
- TypeScript
- Vite

Ist aber fuer die Architektur nicht der Startpunkt.

## Empfohlene Code-Struktur

```text
kbase/
  pyproject.toml
  uv.lock

  src/kbase/
    core/
      entities/
      value_objects/
      policies/
      rules/

    application/
      capabilities/
      dto/
      services/
      transactions/

    infrastructure/
      db/
        models/
        repositories/
        migrations/
      search/
      assets/
      jobs/

    interfaces/
      cli/
      api/
      mcp/

    audit/
    auth/
    config/

  tests/
    unit/
    integration/
    contract/

  kb/
    inbox/
    workspaces/
    items/
    db/
    logs/
```

## Warum die CLI zuerst sinnvoll ist

Die CLI ist der beste erste Client, weil sie:

- die Capabilities direkt testet
- ohne UI-Komplexitaet auskommt
- fuer Import und Automationen spaeter sowieso gebraucht wird
- die Domain frueh stabilisiert

Wichtiger Punkt:

Die CLI soll dieselben Services aufrufen, die spaeter auch HTTP API und MCP verwenden.

Keine Sonderlogik in der CLI.

## Empfohlene erste Interface-Schichten

### 1. Domain Core

Hier leben:

- Modellregeln
- Entitaeten
- Policies
- Validierungsregeln mit fachlicher Bedeutung

### 2. Application / Capability Layer

Hier leben:

- Use Cases
- Input-/Output-Datenstrukturen
- Berechtigungspruefungen
- Audit/Provenance-Aufzeichnung
- Transaktionsgrenzen

### 3. Infrastructure

Hier leben:

- SQLAlchemy-Modelle
- Repositories
- Filesystem-Assetstore
- FTS-Index
- Job-Queue

### 4. Interfaces

Hier leben:

- CLI Commands
- FastAPI-Routes
- MCP Tool-Adapter

## Transaktions- und Konsistenzmodell

Wichtige Regel:

- eine Capability ist die kleinste fachliche Schreibtransaktion

Beispiel:

`create_note` sollte in einer Transaktion mindestens anlegen:

- `items`
- initiale `content_parts`
- Audit-Eintrag
- optional Default-Metadaten

`attach_asset_to_item` sollte in einer Transaktion mindestens schreiben:

- Asset-Registrierung oder Referenz
- Verknuepfung
- Audit-Eintrag

## Multiuser- und Mehrfachnutzung

Das System soll lokal klein starten, aber nicht in eine rein singlenutzerhafte Struktur laufen.

Deshalb von Anfang an:

- `principals`
- ACL-/Sichtbarkeitsmodell im Domainmodell
- Actor Context in jeder schreibenden Capability
- Audit fuer jeden Write

Fuer den MVP darf die Runtime-Sicht vereinfacht sein, aber nicht das Modell.

## Persistenzstrategie auf hoher Ebene

Die Persistenz besteht aus drei klar getrennten Bereichen:

### 1. Relationale Kernpersistenz

Fuer:

- Items
- Metadaten
- Links
- Projekte
- ACL
- Audit
- Provenance
- Aufgaben/Events
- Zeitreihen

### 2. Dateibasierter Asset Store

Fuer:

- PDFs
- Bilder
- Scans
- Preview-Dateien
- spaetere OCR-Derivate

### 3. Suchschicht

Fuer:

- Volltext
- spaetere semantische Suche
- Retrieval-Pakete

Diese drei Bereiche duerfen nicht vermischt werden.

## API- und Client-Strategie

### CLI zuerst

Erster Client:

- fuer schnelles Testen
- fuer Import
- fuer spaetere Batch-Operationen

### HTTP API danach

FastAPI exponiert dieselben Capabilities mit stabilen DTOs.

### MCP spaeter

MCP wird als Adapter auf bestehende Capabilities gebaut, nicht als eigene Fachlogik.

## Technische Empfehlungen fuer `uv`

Empfohlene Grundkommandos spaeter:

```text
uv sync
uv run alembic upgrade head
uv run python -m kbase.interfaces.cli --help
uv run uvicorn kbase.interfaces.api.main:app --reload
```

Empfohlene Abhaengigkeiten:

```text
fastapi
uvicorn
sqlalchemy
alembic
pydantic
typer
structlog
python-multipart
```

Optional spaeter:

```text
orjson
httpx
pytest
pytest-asyncio
rapidfuzz
```

## Architekturentscheidungen fuer jetzt

Diese Punkte wuerde ich sofort festziehen:

1. modularer Monolith
2. Capability Layer als Kern
3. CLI als erster Client
4. FastAPI als zentrales Backend
5. SQLite + Filesystem + FTS5 als Start
6. Audit/Provenance von Anfang an einplanen

## Was jetzt noch nicht entschieden werden muss

- Postgres als Betriebsdatenbank
- semantische Suche
- OCR-Worker-Architektur
- WebSocket/Realtime
- vollstaendige Multi-Tenant-Architektur
- Microservices

## Empfehlung

Der richtige Start ist:

1. Zielarchitektur und Schichten festziehen
2. Capability-MVP definieren
3. Persistenzmodell fuer Kern, Audit und Assets festlegen
4. CLI als ersten echten Client implementieren
5. danach HTTP API und spaeter React-App

Das minimiert spaetere Architekturbrueche und laesst das grosse Zielbild offen.
