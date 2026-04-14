# TODO

## Label-Management als echte Fachfunktion

Aktuell koennen Labels:

- global gelesen werden
- an Items angehaengt werden
- an Items komplett ersetzt werden

Was noch fehlt, ist eine echte Verwaltung der Label-Entitaeten selbst.

## Zielbild

Labels sollten nicht nur implizit beim Zuweisen an ein Item entstehen, sondern auch explizit verwaltet werden koennen.

Dafuer braucht es eine eigene Label-Management-Schicht mit klaren Regeln.

## Fachliche Idee

### 1. Labels als eigenstaendige Struktur behandeln

Ein Label ist nicht nur ein freier String, sondern ein Knoten in einer Hierarchie:

- `finance`
- `finance/investing`
- `finance/investing/etf`

Die Verwaltung sollte auf `full_path` und der Parent-Child-Struktur aufbauen.

### 2. Gewuenschte Operationen

Es sollten eigene Capabilities geben fuer:

- `create_label`
- `rename_label`
- `deactivate_label` oder `delete_label`
- optional spaeter: `merge_labels`

### 3. Delete nicht sofort physisch

Ein hartes Loeschen ist riskant, weil Labels bereits mit vielen Items verknuepft sein koennen.

Deshalb ist fuer den ersten sinnvollen Schritt wahrscheinlich besser:

- `deactivate_label`

statt:

- physisch loeschen

Vorteile:

- bestehende Referenzen bleiben nachvollziehbar
- UI kann inaktive Labels ausblenden
- spaeteres Restore bleibt moeglich

### 4. Rename sauber definieren

Beim Umbenennen eines Labels muss klar geregelt werden, ob:

- nur der Zielknoten umbenannt wird
- oder die ganze Subtree-Struktur mitgezogen wird

Beispiel:

- alt: `finance/investing`
- neu: `finance/assets`

Dann muss entschieden werden, ob auch automatisch:

- `finance/investing/etf`

zu:

- `finance/assets/etf`

wird.

Fuer eine hierarchische Labelstruktur ist diese Propagation in der Regel sinnvoll.

### 5. Auswirkungen auf bestehende Item-Zuordnungen

Wenn ein Label umbenannt wird, muessen auch alle `item_labels` konsistent bleiben.

Das kann technisch auf zwei Arten gedacht werden:

- Label-ID bleibt stabil, nur `full_path` aendert sich
- Unterknoten werden ebenfalls angepasst

Das waere die bevorzugte Richtung, weil Item-Zuordnungen dann nicht neu geschrieben werden muessen, sondern nur die Knotendaten.

### 6. Vorschlaege fuer Modellregeln

- `full_path` bleibt global eindeutig
- jedes Segment darf nur einen Parent haben
- Rename darf keine Kollision mit bestehendem `full_path` erzeugen
- Delete/Deactivate darf bei aktiven Referenzen nicht unkontrolliert zu Inkonsistenz fuehren
- Capabilities muessen Hierarchie und Referenzen atomar veraendern

## Technische Richtung

### Neue oder erweiterte Capabilities

Geplante Capabilities:

- `create_label`
- `list_labels` ist bereits vorhanden
- `rename_label`
- `deactivate_label`
- optional spaeter: `reactivate_label`

### API

Wichtiger Hinweis:

Wenn diese Capabilities eingefuehrt werden, muessen sie nicht nur intern existieren, sondern auch auf die HTTP-API gegeben werden.

Geplante API-Endpunkte koennten sein:

- `POST /api/labels`
- `GET /api/labels`
- `PATCH /api/labels/{label_id}` oder `PATCH /api/labels/by-path/{full_path}`
- `DELETE /api/labels/{label_id}` oder besser `POST /api/labels/{label_id}/deactivate`

### CLI

Wichtiger Hinweis:

Die neuen Label-Capabilities muessen auch in die CLI gespiegelt werden.

Beispiele:

- `kbase label create`
- `kbase label list`
- `kbase label rename`
- `kbase label deactivate`

Die Zielarchitektur bleibt nur dann konsistent, wenn Capability Layer, API und CLI denselben Fachkern nutzen.

## Frontend-Auswirkung

Wenn Label-Management eingefuehrt wird, sollte das Frontend spaeter auch eine kleine Verwaltungsoberflaeche bekommen:

- existierende Labels durchsuchen
- neue Labels anlegen
- Labels umbenennen
- Labels deaktivieren

Das ist aber nachgelagert. Der erste Schritt ist die saubere Capability-/API-/CLI-Schicht.

## Offene Entscheidungen

Noch zu klaeren:

- soll `delete` ueberhaupt erlaubt sein oder nur `deactivate`
- wie wird Rename von Subtrees genau behandelt
- soll global ueber `id` oder ueber `full_path` adressiert werden
- wie werden inaktive Labels in Suche, Frontend und Zuordnung behandelt

## Empfohlene Reihenfolge

1. Fachregeln fuer Label-Lifecycle festziehen
2. Capability-Design definieren
3. Repository-Operationen sauber entwerfen
4. API-Endpunkte darauf setzen
5. CLI-Befehle darauf setzen
6. danach Frontend-Management ergaenzen


# prüfen wo dateien landen
wenn ich eine datei hochlade von einer notiz aus, dann ist diese unterhalb der files mit der id der notiz gespeichert. ist dies sinnvoll? aus einer datei kann auch wieder etwas entstehen und eine datei ist ebenfalls ein item. lese die dateien unter 02_ideas und prüfe, ob das aktuelle verhalten so geplant war.


## datein sind items
Dateien müssen alle neben dem speicherort metainformationen haben (was ist im modell schon drin). Wichtig es kann neben dem Namen einen Titel haben, labels, categories, summaries (evtl. irgendwann autogeneriert durch pdf summary, png beschreibung, etc.). Dateien können mit anderen items verknüpft sein (erbt dann evtl. Metadaten oder verweist auf diese).

## prüfe die aktuelle implementierung gegen das konzept
- passt das so
- sind wir nicht zu stringent unterwegs und verlieren flexibilität (siehe zuordnung files zu notes)