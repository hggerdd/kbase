# Projekte‑View — Wireframe

Datum: 2026-04-14

Kurzbeschreibung
-----------------
Dieses Wireframe visualisiert den vorgeschlagenen Projekte‑View: links die Projektliste, rechts das Projekt‑Detail mit Header, Tabs und dem dynamischen Content‑Bereich. Ziel ist ein klares, leicht navigierbares Layout für schnelles Verknüpfen, Überprüfen und Managen von Items.

Mermaid Wireframe
-----------------
```mermaid
flowchart LR
  subgraph Left[Projekte]
    direction TB
    PList[Projekte‑Liste\n(Suche, Filter, Sort)]
    PCard1[Projekt‑Karte\nTitel, Status, Mini‑Stats]
    PCard2[Projekt‑Karte\nTitel, Status, Mini‑Stats]
  end

  subgraph Right[Projekt‑Detail]
    direction TB
    Header[Header: Titel • Status • Tags • Aktionen]
    MetaRow[Meta: Owner • Start/Ende • Fortschritt]
    Tabs[Tabs: Overview | Notes | Files | Data | Timeline]
    Content[Content (je Tab)\n- Listen & Vorschau\n- Drag&Drop Upload\n- CSV Viewer / Charts\n- Timeline Feed]
    Quick[Quick Actions\n(New Note, Upload, Bulk Link, Export)]
  end

  Left --> Right
  Header --> Tabs --> Content
  Header --> Quick

  %% Tab detail examples (visual mapping)
  subgraph TabDetails[ ]
    direction TB
    Overview[Overview: Metriken, Pinned Items]
    Notes[Notes: Liste, Inline‑Edit, Preview]
    Files[Files: Grid, Previews, Versionen]
    Data[Data: CSV Import, Mapping, Mini‑Charts]
    Timeline[Timeline: Aktivitäts‑Feed]
  end

  Content --> Overview
  Content --> Notes
  Content --> Files
  Content --> Data
  Content --> Timeline

``` 

Anmerkungen
-----------
- Mobile: Sidebar wird zu einer collapsible Liste, Tabs bleiben oberhalb des Contents.
- Accessibility: Keyboard‑Navigation für Listen, ARIA‑Labels für Uploads.
- Interaktionen: Drag&Drop zum Verknüpfen, Bulk‑Actions in Projektliste und Item‑Views.
