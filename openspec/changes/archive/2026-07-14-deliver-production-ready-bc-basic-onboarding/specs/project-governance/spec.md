# project-governance Delta

## ADDED Requirements

### Requirement: Readiness wird dreistufig und fail-closed bewertet

Das System MUST Plattform-, Onboarding- und reale Kunden-Go-live-Bereitschaft getrennt bewerten.

#### Scenario: Synthetische Evidence liegt vor

- **WHEN** die Referenzsimulation vollständig ist, aber aktuelle reale Tenant-, Daten-, UAT-, Cutover-, Abschluss- oder Steuerevidence fehlt
- **THEN** MUST `customerGoLiveReady=PENDING` bleiben
- **AND** `platformReady` und `onboardingReady` dürfen unabhängig davon `READY` sein

### Requirement: Abrechnung entsteht ausschließlich aus Task-Worklogs

Das System MUST Wochenabrechnung, Iststunden und Istbetrag ausschließlich aus eindeutigen, abrechenbaren Task-Worklogs ableiten.

#### Scenario: Elternobjekt enthält ein Worklog

- **WHEN** Phase, Epic, Story oder Fehler ein direktes Worklog oder eine Rechnungszeile besitzt
- **THEN** MUST die Validierung scheitern

### Requirement: Reale Delivery-Gates bleiben beweispflichtig

Das System MUST Daten-, Security-, UAT-, Cutover-, Restore-, Abschluss- und VAT-Gates mit aktueller realer Evidence belegen.

#### Scenario: UStVA-Vorschau ist synthetisch abgestimmt

- **WHEN** nur die Referenzsimulation vorliegt
- **THEN** MUST externe Übermittlung gesperrt bleiben
- **AND** Kunden- und Steuerfreigabe MUST offen bleiben
