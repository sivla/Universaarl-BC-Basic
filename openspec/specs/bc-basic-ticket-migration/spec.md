# bc-basic-ticket-migration Specification

## Purpose

Definiert die fail-closed Provenienz der abgeschlossenen Ticketmigration und den dynamischen, kundenlesbaren aktiven Ticketvertrag.

## Requirements

### Requirement: Dynamischer aktiver Nummernkreis

Der aktive Kundenkatalog MUST seine Menge aus `evidence/simulation/project-story.json` ableiten. `UABC-1`, `UABC-2` und `UABC-3` MUST die drei Phasen in dieser Reihenfolge sein; für die Gesamtmenge oder die letzte ID gilt kein fester Sollwert.

#### Scenario: Doppel-ID oder Alt-ID

- **GIVEN** der aktive Story- und Exportkatalog wird erzeugt
- **WHEN** IDs und Präfixe validiert werden
- **THEN** werden Doppel-IDs, alte aktive Präfixformen und Abweichungen von den drei Phase-Roots fail-closed abgelehnt, ohne fortlaufende IDs oder eine feste Gesamtmenge zu verlangen

### Requirement: Strikte fachliche Hierarchie

Jedes Epic MUST genau einer Phase, jede Story oder jeder Bug genau einem Epic und jeder Task genau einer Story oder einem Bug angehören.

#### Scenario: Falscher Parent

- **GIVEN** ein Ticket verweist auf eine unzulässige Parent-Art
- **WHEN** der Storyvalidator läuft
- **THEN** wird der Bestand mit einem Parent-Typ-Befund abgelehnt

### Requirement: Abrechnung ausschließlich über Tasks

Nur Tasks MAY `billable: true` und Worklogs besitzen. Die Angebotsplanung MAY 80 Stunden und 9.600 EUR bei 120 EUR/h betragen; Iststunden und Istkosten MUST ausschließlich aus den vorhandenen aktiven Task-Worklogs abgeleitet werden und dürfen beim neu gestarteten Piloten 0 sein.

#### Scenario: Eltern-Worklog oder falsche Istsumme

- **GIVEN** ein Elternobjekt besitzt ein Worklog oder die ausgewiesene Istsumme weicht von den Task-Worklogs ab
- **WHEN** Billing- und Storyprüfungen laufen
- **THEN** wird die Abweichung fail-closed abgelehnt

### Requirement: Provenienz ohne parallele Ticketwahrheit

Die 86 Quellidentitäten MUST in der versionierten historischen Migrationsmatrix genau ein damaliges Ziel oder einen begründeten Nicht-Ticket-Pfad besitzen. Historische Jira-Quellen dürfen nicht als aktive Ticketansicht oder als aktive Mengen-/Istwahrheit exportiert werden.

#### Scenario: Historisches Ticket im Kundenboard

- **GIVEN** ein historischer Datensatz wird in die aktive View aufgenommen
- **WHEN** der Exportvalidator läuft
- **THEN** wird die zweite Ticketwahrheit abgelehnt

### Requirement: Inhaltlich gedeckte Transkripte

Jeder Task MUST mindestens ein fachlich passendes Transkript aus `UABC-MTG-001`, `UABC-MTG-002` oder `UABC-MTG-003` referenzieren. Die drei Transkripte müssen Discovery, Setup/UAT/Schulung sowie Go-live/Hypercare/Handover inhaltlich abdecken.

#### Scenario: Generischer oder fehlender Transkriptbezug

- **GIVEN** ein Task verweist auf kein passendes oder nicht existentes Transkript
- **WHEN** die Story- und Dokumentprüfungen laufen
- **THEN** wird die Referenz als unvollständig abgelehnt
