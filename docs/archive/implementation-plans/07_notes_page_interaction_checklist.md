# Notes Page Interaction Checklist

## Status

- Abgearbeitet am 2026-04-14
- umgesetzt in Frontend-Logik und Regressionstests

## Ziel

Die Notes-Seite muss sich fuer den Nutzer deterministisch und stabil verhalten.

Es darf keine unerwarteten Zwischenzustaende geben wie:

- Body verschwindet bei erneutem Klick
- Felder zeigen alten Inhalt einer anderen Notiz
- Labels oder History passen nicht zur aktuell ausgewaehlten Notiz
- wiederholtes Oeffnen derselben Notiz fuehrt zu inkonsistentem Zustand

## Nutzeraktionen auf der Notes-Seite

### Auswahl und Navigation

1. Notiz aus der Liste auswaehlen
2. dieselbe Notiz erneut anklicken
3. schnell zwischen zwei Notizen wechseln
4. Notiz aus einer gefilterten Ansicht auswaehlen
5. Notiz ueber Suche finden und oeffnen

### Lesen

6. Titel sehen
7. Kategorie sehen
8. Status sehen
9. Body sehen
10. Labels sehen
11. verknuepfte Dateien / Related Items sehen
12. History sehen

### Bearbeiten

13. Titel aendern
14. Kategorie aendern
15. Status aendern
16. Body aendern
17. Labels hinzufuegen
18. Labels ueber vorhandene Vorschlaege setzen
19. Speichern

### Erzeugen

20. neue Notiz im Modal anlegen
21. nach erfolgreichem Erzeugen neue Notiz direkt sehen

### Datei-Interaktion

22. Datei an bestehende Notiz haengen
23. nach Upload die aktualisierte Notiz wieder sehen

## Erwartete Zustandsregeln

### Auswahl derselben Notiz

- erneuter Klick auf dieselbe Notiz darf den Editor nicht leeren
- stattdessen darf optional ein Refresh laufen
- sichtbare Felder muessen konsistent bleiben

### Wechsel auf andere Notiz

- vorherige Notiz darf nicht als aktueller Inhalt der neuen Notiz erscheinen
- solange Detaildaten noch laden, muss der Zustand klar sein
- nach dem Laden muessen alle Felder aus derselben Quelle stammen

### Nach Save

- die aktuell angezeigte Notiz muss den gespeicherten Stand zeigen
- Labels, Body und History muessen wieder zur selben Notiz passen

### Nach Upload

- dieselbe Notiz bleibt ausgewaehlt
- Related Items / Dateien werden aktualisiert

## Aktuell festgestellter Fehler

Beim erneuten Klick auf dieselbe Notiz wurde lokal:

- `history` geleert
- `editor` auf Summary-/Leerwerte gesetzt

Gleichzeitig wurde aber kein erneuter Reload ausgeloest, weil `selectedId` unveraendert blieb.

Dadurch verschwand insbesondere der Body.

## Umsetzungsregel

Die Auswahl-Logik fuer Notizen muss als kleine, testbare Zustandslogik formuliert werden:

- gleicher Eintrag: kein lokales Reset, optional Reload
- anderer Eintrag: kontrollierter Wechsel in einen klaren Loading-/Placeholder-Zustand
- Detail-Payload ersetzt danach den gesamten Editorzustand

## Minimale Regressionstests

Mindestens abzusichern:

1. gleiche Notiz erneut auswaehlen -> kein Reset
2. andere Notiz auswaehlen -> Placeholder fuer neue Notiz, alter Detailinhalt wird nicht behalten
3. Detail-Payload -> Editor wird vollstaendig aus Payload aufgebaut
4. Label-Kombination dedupliziert korrekt
