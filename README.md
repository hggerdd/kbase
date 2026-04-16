# kbase

Capability-first Knowledge Base auf Basis von Python, React, Docker Compose und PostgreSQL.  
Der aktuelle Stand ist ein erster `Notes Core` mit persistenter Datenbank, Audit/Provenance, Projekten, Labels, Metadaten, Assets, Links, API und Web-UI.

## Status

Umgesetzt:
- relationales Schema mit Foreign Keys und Indizes
- idempotentes DB-Bootstrap fuer PostgreSQL und SQLite-Testdatenbanken
- Capability Layer fuer den ersten Core
- CLI, FastAPI und React-Frontend
- Docker-Compose-Setups fuer `dev` und `prod`
- Unit-, Integrations- und CLI-Tests

Noch bewusst offen:
- harte ACL-Durchsetzung zur Laufzeit
- OCR, Derivate, Bulk-Import
- Tasks, Events, Measurements
- MCP-/Agent-Adapter

## Projektstruktur

```text
src/kbase/core/                  Domainregeln, Policies, Value Objects
src/kbase/application/           DTOs, Capabilities, Mapper
src/kbase/infrastructure/db/     Session, Bootstrap, UoW, Repositories, SQL
src/kbase/interfaces/cli/        CLI
src/kbase/interfaces/api/        FastAPI
frontend/                        React/Vite-App
scripts/init_db.py               Initialisiert Schema und Seed-Daten
compose.dev.yaml                 Docker-Compose fuer Entwicklung
compose.prod.yaml                Docker-Compose fuer Produktion
kb/                              Host-Verzeichnis fuer Dateien, Inbox, Logs
tests/                           Unit-, Integration- und CLI-Tests
```

## Voraussetzungen

- Docker Desktop oder Docker Engine mit Compose

Optional fuer lokale Testausfuehrung ohne Container:
- Python 3.12+
- Node.js 20+

## Docker Dev

Startet PostgreSQL, API mit Hot Reload und Vite-Dev-Server:

```powershell
docker compose -f compose.dev.yaml up --build
```

Aufrufe:

```text
Frontend: http://127.0.0.1:5173
API:      http://127.0.0.1:8000
Postgres: 127.0.0.1:5432
```

Der Ordner `kb/` bleibt dabei auf dem Host und wird in den API-Container gemountet.  
Dateien unter `kb/items`, `kb/inbox` und `kb/logs` bleiben also lokal erhalten.

Alternativ unter Windows:

```powershell
.\start-lan-dev.bat
```

## Docker Prod

Startet PostgreSQL, API ohne Reload und das gebaute Frontend hinter Nginx:

```powershell
docker compose -f compose.prod.yaml up --build -d
```

Aufrufe:

```text
Frontend: http://127.0.0.1:8080
API:      http://127.0.0.1:8000
Postgres: 127.0.0.1:5432
```

Stoppen:

```powershell
docker compose -f compose.prod.yaml down
```

## Datenbank

Standard-URL ausserhalb von Docker:

```text
postgresql+psycopg://kbase:kbase@127.0.0.1:5432/kbase
```

Schema und Seed-Daten lassen sich auch manuell initialisieren:

```powershell
uv run python scripts/init_db.py
```

Oder explizit mit anderer URL:

```powershell
$env:KBASE_DB_URL = "postgresql+psycopg://kbase:kbase@127.0.0.1:5432/kbase"
uv run python scripts/init_db.py
```

Die Option `--db-path` bleibt nur fuer Legacy-/Testfaelle mit SQLite erhalten.

## Lokale Tests Ohne Docker

```powershell
uv sync --extra dev
uv run --extra dev pytest -q
```

Das Test-Setup verwendet weiterhin temporaere SQLite-Datenbanken, damit die Tests schnell und isoliert bleiben.

## API und Frontend

Im Dev-Setup laufen Frontend und Backend ueber denselben Browser-Origin:
- Vite proxied `/api` und `/health` auf die API.
- In `prod` uebernimmt Nginx dasselbe Routing.
- Das Frontend braucht deshalb keinen fest verdrahteten `:8000`-Host mehr.

## Erster CLI-Workflow

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

```powershell
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/api/notes `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"title\":\"Waschmaschine vergleichen\",\"category_key\":\"research\",\"markdown_body\":\"Bosch vs Siemens\"}"
```

## Relevante Architekturdateien

- [06_target_architecture.md](02_ideas/06_target_architecture.md)
- [07_capability_core_und_persistenz.md](02_ideas/07_capability_core_und_persistenz.md)
- [04_modelling_handbook.md](02_ideas/04_modelling_handbook.md)
