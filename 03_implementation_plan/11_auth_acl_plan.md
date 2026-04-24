# Auth- und ACL-Plan

## Zweck

Dieses Dokument konkretisiert `SEC-001` und schliesst direkt an `SEC-002` an.

Ziel ist ein kleines, belastbares Sicherheitsmodell fuer lokale Nutzung und LAN-Zugriff, das nicht mehr auf einem frei setzbaren Actor-Header basiert, sondern auf echten Benutzern, Sessions und spaeter durchsetzbaren ACL-Regeln.

## Ausgangslage

Aktuell gilt:

- die API uebernimmt den Actor aus `x-kbase-actor`
- ohne Header faellt die API auf `heiko` zurueck
- das Frontend setzt denselben Actor implizit
- `principals`, `principal_memberships` und `item_acl` existieren bereits im Datenmodell
- Laufzeitpruefungen fuer ACL sind noch nicht aktiv

Damit ist die Datenstruktur fuer Nutzer und Berechtigungen vorbereitet, die Trust Boundary ist aber noch nicht sauber.

## Zielbild

### Grundsatz

Der Browser, die CLI und andere Clients liefern keinen frei gewaehlteten Actor mehr.

Stattdessen gilt:

- ein Benutzer meldet sich am System an
- das Backend validiert die Authentifizierung
- das Backend leitet daraus genau einen `principal_id` fuer den Request ab
- dieser Principal wird als `ActorContext` in den Capability-Layer gegeben
- ACL-Pruefungen arbeiten gegen denselben Principal und seine Gruppenmitgliedschaften

### Minimales Nutzer-Modell

Fuer den ersten echten Auth-Schritt unterscheiden wir:

- `users`
  - interaktive Personen mit Login
- `principals`
  - fachliche Subjects fuer Ownership, Audit und ACL
- `service principals`
  - spaeter fuer Automatisierung oder API-Tokens

Fuer den MVP darf ein Benutzer genau einem persoenlichen Principal zugeordnet sein.

Beispiel:

- Benutzer `heiko` authentifiziert sich
- Backend mappt auf Principal `heiko`
- ACL nutzt zusaetzlich Gruppen wie `family` oder `parents_of_son`

## Gewaehlter Auth-Mechanismus

Fuer die aktuelle lokale/LAN-Nutzung ist das Zielmodell:

- Browser und Web-UI: Login mit Session-Cookie
- CLI und technische Clients: persoenliches API-Token

Bewusst nicht als Primarmechanismus fuer diesen Schritt:

- frei gesetzter Actor-Header
- anonyme Requests
- Reverse-Proxy-Auth als einzige Loesung

### Warum Session + Token

Session-Cookies passen zum Browser besser als API-Keys im Frontend:

- kein frei lesbarer User-Header im Client-Code
- serverseitig kontrollierte Session-Lebensdauer
- spaeter mit Logout, Idle-Timeout und CSRF-Schutz erweiterbar

API-Tokens passen besser zu CLI und Automatisierung:

- kein Browser-Login noetig
- klare Widerrufbarkeit pro Benutzer
- dieselbe Principal-Zuordnung wie bei Sessions

## Trust Boundary

### Browser

Der Browser ist nicht vertrauenswuerdig fuer Identitaetsableitung.

Er darf:

- Credentials senden
- Session-Status anzeigen
- Requests mit Cookie oder Bearer-Token absenden

Er darf nicht:

- `principal_id` selbst bestimmen
- ACL-Entscheidungen lokal treffen

### Backend

Das Backend ist die einzige vertrauenswuerdige Instanz fuer:

- Login-Pruefung
- Session-Validierung
- Token-Validierung
- Aufloesung von Benutzer auf Principal
- ACL-Entscheidungen

### LAN

Das LAN wird nicht als sicherer Identitaetsraum behandelt.

Das bedeutet:

- LAN-Zugriff ist erlaubt, aber nicht implizit vertraut
- auch interne Clients brauchen gueltige Authentifizierung
- CORS und Cookie-Konfiguration muessen den erlaubten Ursprung explizit benennen

## Datenmodellrichtung

Die vorhandenen `principals` bleiben der Kern fuer Ownership, Audit und ACL.

Neu benoetigt werden konzeptionell:

- `users`
  - `id`
  - `username`
  - `password_hash` oder spaeter externer Identity-Provider-Key
  - `principal_id`
  - `is_active`
- `user_sessions`
  - `id`
  - `user_id`
  - `created_at`
  - `expires_at`
  - `last_seen_at`
  - `revoked_at`
- `api_tokens`
  - `id`
  - `user_id`
  - `token_hash`
  - `label`
  - `created_at`
  - `last_used_at`
  - `revoked_at`

Wichtig:

- `principals` und `principal_memberships` bleiben fachlich unabhaengig vom Login-Mechanismus
- `item_acl` referenziert weiterhin Principals oder Gruppen, nicht Benutzerkonten
- ein spaeterer externer Auth-Provider darf nur die Authentifizierung ersetzen, nicht das Principal-/ACL-Modell

## Request-Flows

### Browser-Login

1. `POST /api/auth/login` mit Benutzername und Passwort
2. Backend prueft Credentials
3. Backend erstellt Session
4. Backend setzt signierten, `HttpOnly` Session-Cookie
5. Weitere Requests laufen mit Cookie
6. Backend loest daraus `principal_id` auf

### Session-Read

`GET /api/auth/session` liefert:

- `user_id`
- `username`
- `principal_id`
- `principal_type`
- direkte Gruppen oder abgeleitete Rollen fuer die UI

Die UI nutzt diesen Endpunkt fuer:

- Header-Anzeige
- Settings
- spaetere Account-Wechsel nur ueber echten Login, nicht ueber Actor-Switch

### CLI / API-Client

1. Benutzer erzeugt persoenliches Token
2. Client sendet `Authorization: Bearer <token>`
3. Backend validiert das Token
4. Backend leitet `principal_id` ab

## Verbindung zu ACL

`SEC-001` und `SEC-002` muessen als zusammenhaengender Pfad umgesetzt werden.

Die Reihenfolge:

1. Backend leitet den Actor nur noch aus Session oder Token ab
2. Capability-Layer erhaelt immer einen authentifizierten Principal
3. zentrale ACL-Pruefung bestimmt `read`, `write`, `manage`
4. API-Endpunkte geben bei fehlender Authentifizierung `401`
5. API-Endpunkte geben bei fehlender Berechtigung `403`

### Regelbasis fuer den Start

Fuer den ersten ACL-Schritt reichen drei Berechtigungen:

- `read`
- `write`
- `manage`

Zusatzregeln:

- Ersteller erhalten initial mindestens `manage` auf eigene neue Items
- Gruppenrechte werden ueber `principal_memberships` aufgeloest
- ohne passende Regel ist Zugriff verboten

## Auswirkungen auf die Interfaces

### API

Zu ergaenzen:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- optional spaeter `POST /api/auth/tokens`

Zu entfernen oder zu deprecaten:

- impliziter Fallback auf `heiko`
- frei gesetzter `x-kbase-actor` als offizieller Mechanismus

### Frontend

Das Frontend braucht:

- `auth/session` nicht mehr als statischen Actor-Kontext, sondern als echten Session-Store
- Login-Seite oder Login-Dialog
- Session-Initialisierung beim App-Start
- `401`-Handling mit Rueckleitung zum Login
- Anzeige des angemeldeten Benutzers statt des frei gewaehlten Actors

### CLI

Die CLI braucht:

- `auth login` oder `auth token create` je nach Einfuehrungsreihenfolge
- lokales Speichern eines Tokens ausserhalb des Repos
- Wegfall des Defaults `--actor heiko`

Falls `--actor` kurzfristig bestehen bleibt, dann nur noch fuer Testmodus oder Admin-Seeding, nicht fuer normale Produktion/LAN-Nutzung.

## Migrationsstrategie

### Phase 1

- Spezifikation verabschieden
- `x-kbase-actor` als deprecated markieren
- Auth-Endpunkte und Session-Layer einfuehren
- Fallback auf `heiko` entfernen

### Phase 2

- Frontend auf Session-Endpunkt umstellen
- CLI auf Token-Fluss umstellen
- `401` und `403` sauber unterscheiden

### Phase 3

- zentrale ACL-Pruefung fuer kritische Endpunkte aktivieren
- Tests fuer erlaubte und verbotene Faelle ergaenzen

## Akzeptanz fuer `SEC-001`

`SEC-001` ist erst abgeschlossen, wenn:

- ein dokumentiertes Nutzer-/Session-Konzept vorliegt
- der Actor nicht mehr aus frei setzbaren Clientdaten stammt
- der Default `heiko` entfernt ist
- Browser-Requests ohne Login `401` liefern
- CLI/API-Clients einen definierten Token-Pfad haben
- README, API-Doku und Frontend-Doku auf dasselbe Modell verweisen

## Offene Entscheidungen

- ob Passwort-Login lokal ausreicht oder spaeter Reverse-Proxy-SSO optional dazu kommt
- wie Session-Timeout und "remember me" fuer LAN-Nutzung aussehen sollen
- ob Benutzerwechsel in einer gemeinsamen Haushaltsinstanz nur ueber Logout/Login oder zusaetzlich ueber "Switch User" im geschuetzten Kontext erfolgen darf
- wie Admin-Bootstrapping des ersten Benutzers umgesetzt wird
