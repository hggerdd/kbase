# API Doku

Diese Datei beschreibt den aktuellen HTTP-Zugriff auf `kbase`.

Die API nutzt dieselben Capabilities wie die CLI.  
Es gibt keine separate Fachlogik im API-Layer.

## Starten

```powershell
uv run uvicorn kbase.interfaces.api.main:app --reload
```

Standard-Adresse:

```text
http://127.0.0.1:8000
```

## Grundprinzip

- Alle Requests laufen gegen dieselben Application-Capabilities wie die CLI.
- Der Actor wird über HTTP-Header übergeben.
- Fehler aus den Capabilities werden als `400 Bad Request` zurückgegeben.
- Antworten sind JSON.

## Header

Pflicht in der Praxis:

```text
x-kbase-actor: heiko
```

Optional:

```text
x-kbase-request-id: req-123
```

## Schnellstart

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
curl -H "x-kbase-actor: heiko" `
  http://127.0.0.1:8000/api/items/<ITEM_ID>
```

Suche:

```powershell
curl -G http://127.0.0.1:8000/api/search/content `
  -H "x-kbase-actor: heiko" `
  --data-urlencode "query=Bosch"
```

## Endpunkte

### Health

`GET /health`

Beispiel:

```powershell
curl http://127.0.0.1:8000/health
```

### Note erstellen

`POST /api/notes`

Request:

```json
{
  "title": "Waschmaschine vergleichen",
  "category_key": "research",
  "status": "active",
  "language_code": "de",
  "markdown_body": "Bosch vs Siemens",
  "parent_item_id": null,
  "project_ids": [],
  "label_paths": ["household/appliances"],
  "metadata": {
    "research_subject": "washing machine"
  }
}
```

Beispiel:

```powershell
curl -X POST http://127.0.0.1:8000/api/notes `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"title\":\"Waschmaschine vergleichen\",\"category_key\":\"research\",\"markdown_body\":\"Bosch vs Siemens\",\"label_paths\":[\"household/appliances\"],\"metadata\":{\"research_subject\":\"washing machine\"}}"
```

### Item abrufen

`GET /api/items/{item_id}`

Beispiel:

```powershell
curl -H "x-kbase-actor: heiko" `
  http://127.0.0.1:8000/api/items/<ITEM_ID>
```

### Items auflisten

`GET /api/items`

Query-Parameter:

- `item_kind`
- `category_key`
- `include_archived`
- `limit`
- `offset`

Beispiel:

```powershell
curl -G http://127.0.0.1:8000/api/items `
  -H "x-kbase-actor: heiko" `
  --data-urlencode "item_kind=note" `
  --data-urlencode "category_key=research"
```

### Item aktualisieren

`PATCH /api/items/{item_id}`

Request:

```json
{
  "title": "Neue Ueberschrift",
  "status": "active",
  "language_code": "de",
  "is_archived": false
}
```

Beispiel:

```powershell
curl -X PATCH http://127.0.0.1:8000/api/items/<ITEM_ID> `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"title\":\"Neue Ueberschrift\",\"status\":\"active\"}"
```

### Content ersetzen

`PUT /api/items/{item_id}/content`

Request:

```json
{
  "part_kind": "markdown_body",
  "content_text": "# Vergleich\n- Bosch\n- Siemens",
  "content_format": "markdown",
  "change_reason": "rewrite"
}
```

Beispiel:

```powershell
curl -X PUT http://127.0.0.1:8000/api/items/<ITEM_ID>/content `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"content_text\":\"# Vergleich\n- Bosch\n- Siemens\",\"change_reason\":\"rewrite\"}"
```

### Content-Suche

`GET /api/search/content`

Query-Parameter:

- `query`
- `item_kinds`
- `category_keys`
- `label_paths`
- `statuses`
- `created_by_principal_ids`
- `project_id`
- `include_archived`
- `limit`
- `offset`

Beispiel:

```powershell
curl -G http://127.0.0.1:8000/api/search/content `
  -H "x-kbase-actor: heiko" `
  --data-urlencode "query=Bosch" `
  --data-urlencode "label_paths=household/appliances"
```

### Labels zuweisen

`POST /api/items/{item_id}/labels`

Request:

```json
{
  "label_paths": ["household/appliances", "research/demo"]
}
```

Beispiel:

```powershell
curl -X POST http://127.0.0.1:8000/api/items/<ITEM_ID>/labels `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"label_paths\":[\"household/appliances\",\"research/demo\"]}"
```

### Klassifikation setzen

`POST /api/items/{item_id}/classification`

Request:

```json
{
  "primary_category_key": "decision",
  "secondary_category_keys": ["learning"]
}
```

Beispiel:

```powershell
curl -X POST http://127.0.0.1:8000/api/items/<ITEM_ID>/classification `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"primary_category_key\":\"decision\",\"secondary_category_keys\":[\"learning\"]}"
```

### Metadata patchen

`PATCH /api/items/{item_id}/metadata`

Request:

```json
{
  "set_fields": {
    "description": "Kurzbeschreibung"
  },
  "unset_fields": ["research_subject"]
}
```

Beispiel:

```powershell
curl -X PATCH http://127.0.0.1:8000/api/items/<ITEM_ID>/metadata `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"set_fields\":{\"description\":\"Kurzbeschreibung\"},\"unset_fields\":[\"research_subject\"]}"
```

### Asset registrieren

`POST /api/assets`

Request:

```json
{
  "storage_path": "kb/items/files/demo.pdf",
  "asset_kind": "source_file",
  "original_filename": "demo.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 12345
}
```

Beispiel:

```powershell
curl -X POST http://127.0.0.1:8000/api/assets `
  -H "Content-Type: application/json" `
  -H "x-kbase-actor: heiko" `
  -d "{\"storage_path\":\"kb/items/files/demo.pdf\",\"asset_kind\":\"source_file\",\"original_filename\":\"demo.pdf\",\"mime_type\":\"application/pdf\"}"
```

### Asset an Item haengen

`POST /api/items/{item_id}/assets`

Request:

```json
{
  "asset_id": "<ASSET_ID>",
  "relationship_role": "attachment",
  "caption": "Angebot PDF",
  "sort_order": 0
}
```

### Datei direkt zu einer Note hochladen

`POST /api/items/{item_id}/attachments/upload`

Dieser Endpunkt speichert die Datei auf dem Server, registriert sie als Asset und verknuepft sie sofort mit dem Item.

Beispiel:

```powershell
curl -X POST http://127.0.0.1:8000/api/items/<ITEM_ID>/attachments/upload `
  -H "x-kbase-actor: heiko" `
  -F "file=@C:\temp\angebot.pdf" `
  -F "relationship_role=attachment"
```

### Link zwischen Items erstellen

`POST /api/links`

Request:

```json
{
  "from_item_id": "<ITEM_A>",
  "to_item_id": "<ITEM_B>",
  "link_type": "related",
  "note": "steht in Bezug"
}
```

### Zugehoerige Links abrufen

`GET /api/items/{item_id}/links`

### Projekt erstellen

`POST /api/projects`

Request:

```json
{
  "title": "Haushalt 2026",
  "category_key": "project_general",
  "description": "Kontext fuer Haushaltsentscheidungen",
  "status": "active"
}
```

### Item zu Projekt hinzufuegen

`POST /api/projects/{project_id}/items`

Request:

```json
{
  "item_id": "<ITEM_ID>",
  "role": "context",
  "sort_order": 0
}
```

### Projekt-Items auflisten

`GET /api/projects/{project_id}/items`

### Historie eines Items

`GET /api/items/{item_id}/history`

### Provenance eines Items

`GET /api/items/{item_id}/provenance`

## Typischer Ablauf

1. `POST /api/projects`
2. `POST /api/notes`
3. `POST /api/projects/{project_id}/items`
4. `PATCH /api/items/{item_id}/metadata`
5. `GET /api/search/content`
6. `GET /api/items/{item_id}`
7. `GET /api/items/{item_id}/history`

## Actor-Kontext

Der wichtigste Header ist:

```text
x-kbase-actor: heiko
```

Ohne expliziten Header nutzt die API derzeit standardmaessig `heiko`.

## Fehlerverhalten

- Fachliche Validierungsfehler werden als `400` zurueckgegeben.
- Erfolgreiche Antworten liefern `200`.

Beispiel fuer einen Fehler:

```json
{
  "detail": "Category 'project_general' is not valid for notes"
}
```

## OpenAPI

FastAPI stellt automatisch Swagger UI und OpenAPI bereit:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/openapi.json`
