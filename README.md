# kbase

Capability-first Knowledge Base auf Basis von Python, `uv` und SQLite.  
Der aktuelle Stand ist ein erster `Notes Core` mit persistenter Datenbank, Audit/Provenance, Projekten, Labels, Metadaten, Assets, Links und einer CLI als erstem Client.

## Status

Umgesetzt:
- relationales SQLite-Schema mit Foreign Keys und Indizes
- Seeds fuer Referenzdaten, Principals und Memberships
- Capability Layer fuer den ersten Core
- CLI fuer die wichtigsten Flows
- Unit-, Integrations- und CLI-Tests

Noch bewusst offen:
- harte ACL-Durchsetzung zur Laufzeit
- FastAPI-Endpoints
- OCR, Derivate, Bulk-Import
- Tasks, Events, Measurements
- MCP-/Agent-Adapter

## Projektstruktur

```text
src/kbase/core/                  Domainregeln, Policies, Value Objects
src/kbase/application/           DTOs, Capabilities, Mapper
src/kbase/infrastructure/db/     Session, UoW, Repositories, SQL
src/kbase/interfaces/cli/        CLI
scripts/init_db.py               Erstellt die SQLite-Datenbank
kb/db/kbase.sqlite               Standard-Datenbank
tests/                           Unit-, Integration- und CLI-Tests
02_ideas/                        Architektur- und Modellierungsdokumente
```

## Voraussetzungen

- Python 3.12+
- `uv`

## Setup

```powershell
uv sync --extra dev
uv run python scripts/init_db.py
```

Optional kann eine andere DB-Datei fuer die CLI oder Tests genutzt werden:

```powershell
$env:KBASE_DB_URL = "sqlite:///C:/ttt/kbase/kb/db/kbase.sqlite"
```

## Wichtige Befehle

Hilfe:

```powershell
uv run python -m kbase.interfaces.cli.main --help
```

Datenbank initialisieren:

```powershell
uv run python scripts/init_db.py
```

Tests:

```powershell
uv run --extra dev pytest -q
```

API starten:

```powershell
uv run uvicorn kbase.interfaces.api.main:app --reload
```

Frontend starten:

```powershell
cd frontend
npm install
npm run dev
```

## Erster CLI-Workflow

### 1. Projekt anlegen

```powershell
uv run python -m kbase.interfaces.cli.main project create `
  --title "Haushalt 2026" `
  --description "Kontext fuer Haushaltsentscheidungen" `
  --json
```

### 2. Note anlegen

```powershell
uv run python -m kbase.interfaces.cli.main note create `
  --title "Waschmaschine vergleichen" `
  --category research `
  --body "Bosch vs Siemens" `
  --label household/appliances `
  --metadata-json "{\"research_subject\":\"washing machine\"}" `
  --json
```

### 3. Note in Projekt aufnehmen

```powershell
uv run python -m kbase.interfaces.cli.main project add-item `
  --project-id <PROJECT_ID> `
  --item-id <ITEM_ID> `
  --json
```

### 4. Inhalt ersetzen

```powershell
uv run python -m kbase.interfaces.cli.main content replace `
  <ITEM_ID> `
  --body "# Vergleich`n- Bosch`n- Siemens" `
  --json
```

### 5. Note abrufen

```powershell
uv run python -m kbase.interfaces.cli.main item get <ITEM_ID> --json
```

### 6. Inhalt suchen

```powershell
uv run python -m kbase.interfaces.cli.main search content `
  --query Bosch `
  --label household/appliances `
  --json
```

## Workflow-Kurzform

Der erste zusammengesetzte Workflow ist bereits als eigener CLI-Befehl vorhanden.  
Er legt optional ein Projekt an und erstellt danach direkt eine Note darin.

```powershell
uv run python -m kbase.interfaces.cli.main workflow notes-core `
  --project-title "Haushalt 2026" `
  --title "Waschmaschine vergleichen" `
  --category research `
  --body "Bosch vs Siemens" `
  --label household/appliances `
  --json
```

## API-Schnellstart

Health:

```powershell
curl http://127.0.0.1:8000/health
```

Note anlegen:

```powershell
curl -X POST http://127.0.0.1:8000/api/notes `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"title\":\"Waschmaschine vergleichen\",\"category_key\":\"research\",\"markdown_body\":\"Bosch vs Siemens\"}"
```

Item abrufen:

```powershell
curl -H "x-kbase-actor: heiko" http://127.0.0.1:8000/api/items/<ITEM_ID>
```

Suche:

```powershell
curl -G http://127.0.0.1:8000/api/search/content `
  -H "x-kbase-actor: heiko" `
  --data-urlencode "query=Bosch"
```

## Web App

Es gibt jetzt eine einfache React-App unter [frontend](frontend).

Merkmale:
- crypto-inspiriertes Dashboard-Design
- Notizliste mit Suche
- Detailansicht mit Historie und Labels
- Note erstellen
- bestehende Note aktualisieren
- direkter Zugriff auf dieselben FastAPI-Capabilities

Lokale Entwicklungsumgebung:

1. Backend starten:

```powershell
uv run uvicorn kbase.interfaces.api.main:app --reload
```

2. Frontend starten:

```powershell
cd frontend
npm install
npm run dev
```

3. Browser:

```text
http://127.0.0.1:5173
```

## Wichtigste CLI-Befehle

```powershell
uv run python -m kbase.interfaces.cli.main note create --title "..." --category research --body "..." --json
uv run python -m kbase.interfaces.cli.main item get <ITEM_ID> --json
uv run python -m kbase.interfaces.cli.main item list --item-kind note --json
uv run python -m kbase.interfaces.cli.main item update <ITEM_ID> --title "..." --status active --json
uv run python -m kbase.interfaces.cli.main content replace <ITEM_ID> --body "..." --json
uv run python -m kbase.interfaces.cli.main search content --query "..." --json
uv run python -m kbase.interfaces.cli.main label assign <ITEM_ID> --label a/b --label c/d
uv run python -m kbase.interfaces.cli.main classify set <ITEM_ID> --category decision --secondary learning --json
uv run python -m kbase.interfaces.cli.main metadata patch <ITEM_ID> --set-json "{\"description\":\"...\"}"
uv run python -m kbase.interfaces.cli.main asset register --storage-path kb/items/files/demo.pdf --asset-kind source_file --json
uv run python -m kbase.interfaces.cli.main asset attach <ITEM_ID> <ASSET_ID> --role attachment --json
uv run python -m kbase.interfaces.cli.main link add --from-item-id <A> --to-item-id <B> --link-type related --json
uv run python -m kbase.interfaces.cli.main project create --title "..." --json
uv run python -m kbase.interfaces.cli.main project add-item --project-id <PROJECT_ID> --item-id <ITEM_ID> --json
uv run python -m kbase.interfaces.cli.main project list-items <PROJECT_ID> --json
uv run python -m kbase.interfaces.cli.main history show <ITEM_ID> --json
uv run python -m kbase.interfaces.cli.main provenance show <ITEM_ID> --json
uv run python -m kbase.interfaces.cli.main workflow notes-core --title "..." --category research --body "..." --json
```

## Relevante Architekturdateien

- [06_target_architecture.md](02_ideas/06_target_architecture.md)
- [07_capability_core_und_persistenz.md](02_ideas/07_capability_core_und_persistenz.md)
- [04_modelling_handbook.md](02_ideas/04_modelling_handbook.md)
