# BC Basic Einrichtung Lieferfaehigkeit

## ADDED Requirements

### Requirement: Lückenloser aktiver Nummernkreis
Der aktive Kundenkatalog MUST exakt die IDs `UABC-1` bis `UABC-50` enthalten. `UABC-1`, `UABC-2` und `UABC-3` MUST die drei Phasen in dieser Reihenfolge sein.

#### Scenario: Keine Lücke oder Alt-ID
- **GIVEN** der aktive Story- und Exportkatalog wird erzeugt
- **WHEN** IDs und Präfixe validiert werden
- **THEN** wird jede Lücke, Doppel-ID oder alte aktive Präfixform fail-closed abgelehnt

### Requirement: Strikte fachliche Hierarchie
Jedes Epic MUST genau einer Phase, jede Story genau einem Epic und jeder Task genau einer Story angehören. Aktive Bugs und Subtasks sind unzulässig.

#### Scenario: Falscher Parent
- **GIVEN** ein Ticket verweist auf eine unzulässige Parent-Art
- **WHEN** der Storyvalidator läuft
- **THEN** wird der Bestand mit einem Parent-Typ-Befund abgelehnt

### Requirement: Abrechnung ausschließlich über Tasks
Nur Tasks MAY `billable: true` und Worklogs besitzen. Die Task-Worklogs MUST 80 Stunden und 9.600 EUR bei 120 EUR/h sowie 22/40/18 Stunden je Phase ergeben.

#### Scenario: Eltern-Worklog oder Doppelzählung
- **GIVEN** ein Elternobjekt besitzt ein Worklog oder ein Task wird doppelt gezählt
- **WHEN** Billing- und Storyprüfungen laufen
- **THEN** wird die Abweichung fail-closed abgelehnt

### Requirement: Provenienz ohne parallele Ticketwahrheit
Die 86 Quellidentitäten MUST in einer versionierten Migrationsmatrix genau ein aktives Ziel oder einen begründeten Nicht-Ticket-Pfad besitzen. Historische Jira-Quellen dürfen nicht als aktive Ticketansicht exportiert werden.

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
