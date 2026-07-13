# bc-basic-jira-story-realism Delta

## ADDED Requirements

### Requirement: Vollstaendige eindeutige Boardstatus-Zuordnung

Das System MUST jeden in der aktiven kanonischen Projektstory verwendeten Ticketstatus genau einer sichtbaren Spalte des Producer-Jira-Boards zuordnen. Fehlende, doppelte oder unbekannte Statuszuordnungen MUESSEN fail-closed scheitern. Consumer duerfen keine eigene Ersatzzuordnung erfinden.

#### Scenario: Blockierte Phase bleibt im Board sichtbar

- **GIVEN** die aktive Projektstory enthaelt Tickets mit dem Status `blocked`
- **WHEN** der Jira-Boardvertrag deterministisch erzeugt wird
- **THEN** ordnet die Spalte `In Bearbeitung` `blocked` genau einmal zu
- **AND** beide aktuell blockierten Tickets sind durch diese Producerzuordnung sichtbar

#### Scenario: Widerspruechliche Statuspartition wird abgelehnt

- **WHEN** ein aktiver Status keiner Spalte oder mehreren Spalten zugeordnet ist oder ein unbekannter aktiver Status vorliegt
- **THEN** scheitert der Producer-Validator fail-closed mit einem Boardstatusfehler
