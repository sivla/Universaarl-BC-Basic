# BC-Basic-Pilot-Setup-Baseline

## MODIFIED Requirements

### Requirement: Country/Region-Defect besitzt Ausfuehrungsretest

Das System MUST Vorzustand, Seed, gespeicherte Firmendaten, Readback und Retest getrennt von der historischen Baseline dokumentieren.

#### Scenario: DE wurde erfolgreich geseedet

- **WHEN** Country/Region DE angelegt und erneut gelesen wurde
- **THEN** darf der Defect nur mit Fix-, Readback- und Retestevidence geschlossen werden

### Requirement: Mandanten- und Firmenidentitaet bleiben eindeutig

Das System MUST technischen Pilotmandanten, Legacy-Mandanten und rechtlichen Firmennamen getrennt ausweisen.

#### Scenario: Gleicher sichtbarer Firmenname

- **WHEN** Pilot und Legacy denselben sichtbaren Firmennamen tragen
- **THEN** erfolgt die Unterscheidung ueber technische Mandanten-ID und Projektrolle, nicht ueber eine erfundene Anzeigenamensaenderung

### Requirement: Paketgerueste bleiben wirkungslos

Das System MUST fuer alle drei Paketgerueste null Tabellen, Datensaetze und Fehler sowie keine Import- oder Buchungswirkung belegen.

#### Scenario: Firmendaten wurden gespeichert

- **WHEN** Country/Region und Company Information ausgefuehrt wurden
- **THEN** darf daraus keine Paket-, Import-, Buchungs- oder Geschaeftsdatenwirkung abgeleitet werden
