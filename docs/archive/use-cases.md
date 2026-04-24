# Use Cases

Status: product/use-case background. This file is intentionally broader than
the current implementation. Prefer `README.md` and `todo.md` for implemented
scope and active backlog.

Diese Datei enthält eine strukturierte Übersicht wichtiger Anwendungsfälle für ein Wissens-, Notiz- und Dokumentenmanagementsystem.

## Übersicht

Die Use Cases sind in drei Cluster unterteilt:

- 📚 Wissens- & Notizsystem
- 📄 Dokumentenmanagement (privat)
- 👨‍👩‍👧 Multiuser / Familie

## 1. 📚 Wissens- & Notizsystem

### 1.1 Allgemeine Wissensnotiz

**Story:**
Du hältst Wissen, Gedanken oder Erklärungen fest.

**Beispiele:**
- MECE Prinzip
- Hermes Agents Erklärung
- GraphRAG Konzept

**Modell:**
- `item_kind = note`
- `category = reference | learning`
- `content_parts = markdown_body`
- Labels optional: `ai`, `methods`, `work`

**Ziel:**
- Wissen strukturiert speichern
- später wiederfinden
- LLM nutzbar machen

### 1.2 Strukturierte Recherche (z. B. Waschmaschine)

**Story:**
Du recherchierst ein Thema mit mehreren Quellen und Entscheidungsfaktoren.

**Beispiel:**
- Waschmaschine Kaufentscheidung

**Bestandteile:**
- Research Note
- Angebots-PDFs
- Bilder / Screenshots
- Vergleichstabelle
- finale Entscheidung

**Modell:**
- `note (research)`
- `document (offer)`
- `image (product_reference)`
- `spreadsheet (comparison_table)`
- `note (decision)`
- `item_links` verbinden alles

**Ziel:**
- nachvollziehbare Entscheidungen
- Wiederverwendung später

### 1.3 Decision Log

**Story:**
Du dokumentierst wichtige Entscheidungen inklusive Alternativen.

**Beispiele:**
- warum Produkt X gewählt wurde
- warum ETF-Strategie gewählt wurde

**Modell:**
- `item_kind = note`
- `category = decision`
- Links zu:
  - Research
  - Alternativen
  - Ergebnissen

**Ziel:**
- Lernen aus Entscheidungen
- Kontext erhalten
## 2. 📄 Dokumentenmanagement (privat)

### 2.1 Einkommensnachweise (PDF)

**Story:**
Du speicherst Gehaltsabrechnungen strukturiert.

**Modell:**
- `item_kind = document`
- `category = income_document`
- `item_files` → PDF
- Metadaten:
  - `gross_amount`
  - `net_amount`
  - `payment_date`

**ACL:**
- nur du (`heiko`)

**Ziel:**
- Wiederfinden
- steuerliche Nutzung
- Übersicht

### 2.2 Bankdokumente

**Story:**
Kontoauszüge und Finanzdokumente verwalten.

**Modell:**
- `category = bank_statement`
- Metadaten:
  - `bank_name`
  - `period_start`
  - `period_end`

**Ziel:**
- Überblick
- Nachvollziehbarkeit

### 2.3 Angebote (z. B. Kaufentscheidung)

**Story:**
Mehrere Angebote vergleichen und speichern.

**Modell:**
- `category = offer`
- Metadaten:
  - `vendor`
  - `total_amount`
  - `valid_until`

**Verknüpfung:**
- mit Research Note

### 2.4 Verträge / Versicherungen

**Story:**
Langfristige Dokumente mit Fristen verwalten.

**Modell:**
- `category = contract_document | insurance_document`
- ggf. verknüpft mit:
  - Tasks (`Review`)
  - Events (`Fristen`)

### 2.5 Behördenprozesse

**Story:**
Dokumente, Status und Kommunikation für amtliche Verfahren sammeln.

**Beispiele:**
- Antrag eingereicht
- Antwort erhalten

**Modell:**
- Dokumente + Notizen + Status
- evtl. `item_states`
## 3. 👨‍👩‍👧 Multiuser / Familie

### 3.1 Persönliche Daten

**Story:**
Sensible Daten wie Einkommensnachweise sollen nur einem Benutzer gehören.

**ACL:**
- `heiko`

### 3.2 Gemeinsame Themen

**Story:**
Themen wie Haushaltskäufe werden gemeinsam verwaltet.

**ACL:**
- `pair`

### 3.3 Kind-bezogene Themen

**Story:**
Schulunterlagen und Arzttermine für das Kind organisieren.

**Modell:**
- `subjects = son`
- `ACL = parents_of_son`

### 3.4 Rollen-Trennung

**Wichtige Dimensionen:**
- `created_by`
- `visible_to`
- `editable_by`
- `concerns`
## 4. 📆 Aufgaben & Termine

### 4.1 Aufgabe (Task)

**Story:**
Stromzählerstand melden.

**Modell:**
- `item_kind = task`
- `item_states`
- `datetime_properties (due_at)`
- `recurrence_rules`

### 4.2 Termin (Event)

**Story:**
Kinderarzttermin.

**Modell:**
- `item_kind = event`
- `start_at`, `end_at`
- Notifications

### 4.3 Wiederkehrende Aufgaben

**Story:**
Versicherung jährlich prüfen.

**Modell:**
- `recurrence_rules`
- `item_occurrences`

### 4.4 Review Tasks (wichtig!)

**Story:**
ETF-Strategie in einem Jahr prüfen.

**Modell:**
- Task + Link (`review_for`) zur Note

### 4.5 Notifications

**Story:**
Erinnerungen z. B. 24 Stunden vorher oder vor Fristen.

---

## 5. 📈 Zeitreihen / Tracking (NEU!)

### 5.1 Gewichtstracking

**Story:**
Tägliches Gewicht messen.

**Modell:**
- `observation_series`
- `metric = weight`
- `observations`
- `timestamp + value`

**Wichtig:**
- NICHT als Notizen speichern

### 5.2 Weitere Beispiele

- Schlaf
- Puls
- Schritte
- Kontostand
- Stromverbrauch

### 5.3 Interpretation als Note

**Story:**
Gewichtsentwicklung analysieren.

**Modell:**
- Note + Link zur Serie

---

## 6. 🏠 Haushalt / Besitz

### 6.1 Geräte & Inventar

**Story:**
Waschmaschine, Seriennummer, Kaufdatum dokumentieren.

### 6.2 Wartung

**Story:**
Filter wechseln, Inspektionen planen.

**Modell:**
- Tasks
- ggf. Zeitreihen

---

## 7. 🛠️ Projekte & DIY

### 7.1 Technische Projekte

**Story:**
Balancing Robot oder Softwareprojekte dokumentieren.

**Modell:**
- Notes
- Dokumente
- Bilder
- Tasks

### 7.2 Lessons Learned

**Story:**
Fehler und Erkenntnisse dokumentieren.

### 7.3 Ideenpool

**Story:**
Ideen sammeln, ohne sie sofort umzusetzen.

---

## 8. 💻 Tech / Setup

### 8.1 Setup-Dokumentation

**Story:**
PC-Setup und verwendete Tools dokumentieren.

### 8.2 Troubleshooting

**Story:**
Bekannte Probleme und Lösungen sammeln.

### 8.3 Automationen

**Story:**
Automatisierungen, Scripts und Workflows abbilden.

**Beispiele:**
- Scripts
- Workflows

---

## 9. 🧾 Kommunikation

### 9.1 Gesprächsnotizen

**Story:**
Wichtige Gespräche dokumentieren.

### 9.2 Vereinbarungen

**Story:**
Absprachen und Vereinbarungen festhalten.

---

## 10. 🧠 Meta-Ebene

### 10.1 Reviews

**Story:**
Wochenreview und Monatsreview durchführen.

### 10.2 Systempflege

**Story:**
Inbox aufräumen und Items sortieren.

---

## 🔥 Wichtigste Erkenntnisse

### 1. Drei große Klassen

A. Wissen
- Notes
- Dokumente
- Research

B. Handlung
- Tasks
- Events
- Reviews

C. Verlauf / Zustand
- Zeitreihen (observations)
- Status (states)
- Entscheidungen + Outcome
