# BC-Basic-Ticketqualität

## ADDED Requirements

### Requirement: Realistische Ticketoberfläche
Die Umsetzung MUST jede der 50 bestehenden UABC-IDs in der vereinbarten Phase/Epic/Story/Task-Hierarchie erhalten. Summaries MUST eindeutig, scanbar und höchstens sieben Wörter lang sein. Beschreibungen MUST die zehn Pflichtabschnitte und ticketbezogene Evidence-, Deliverable-, Seiten- und Transkript-Referenzen enthalten.

#### Scenario: Qualitätsgate besteht
- **WHEN** die kanonische Projektstory und Jira-Projektion geprüft werden
- **THEN** bestehen 50 eindeutige Summaries und 50 projektspezifische Beschreibungen

### Requirement: Synthetische Abnahme bleibt ehrlich
Die Simulation MUST synthetisch abgeschlossen bleiben; acht reale Kundengates MUST offen bleiben. Die Summe der 19 Task-Worklogs MUST 80 Stunden und 9.600 EUR bleiben.

#### Scenario: Keine Realclaim-Aufwertung
- **WHEN** die V2-Ticketqualität validiert wird
- **THEN** bleiben Status, Budget und die Grenze zu echten Kundensystemen fail-closed
