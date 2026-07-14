# BC Basic Referenzsimulation

## ADDED Requirements

### Requirement: Vollständige synthetische Ticketabdeckung

Der Referenzexport MUST exakt die 50 aktiven UABC-Tickets in Phase-Epic-Story-Task-Hierarchie abbilden. Jedes Ticket MUST synthetisch abgeschlossen, mit mindestens einer Meeting-, Evidence- und Deliverable-Referenz sowie zwei erfüllten Akzeptanzkriterien dargestellt werden.

#### Scenario: Ticketlebenszyklus

- **WHEN** der Referenzexport validiert wird
- **THEN** sind alle 50 IDs vorhanden, die synthetischen Statuswerte abgeschlossen und die Live-Statuswerte separat als offen oder historisch ausgewiesen.

### Requirement: Kommerzielle Reconciliation

Die synthetische Abrechnung MUST ausschließlich aus Task-Worklogs mit 120 EUR Stundenpreis abgeleitet werden und exakt 80 Stunden sowie 9.600 EUR ergeben.

#### Scenario: Wochenreconciliation

- **WHEN** alle 19 Tasks aggregiert werden
- **THEN** stimmen Worklogstunden, Phasenrollups, Angebot und Nettoabrechnung ohne Elternabrechnung überein.

### Requirement: Prozess-Playthrough und Abschluss

Jeder Kernprozess MUST Navigation, konkrete Eingabewerte, Vorschau, erzeugte Belege, erwartete Posten, Kontrollen, Defect, Korrektur und Retest referenzieren. Die synthetischen Gates MUST abgeschlossen sein, während echte Live-Gates MUST pending bleiben.

#### Scenario: GO_SIMULATION

- **WHEN** UAT, Cutover, Hypercare, Monatsabschluss und UStVA-Vorschau geprüft werden
- **THEN** lautet die interne Entscheidung `GO_SIMULATION`, ohne reale Kunden-, Steuer- oder Produktivfreigabe zu behaupten.
