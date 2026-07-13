# BC-Basic-Pilot-Setup-Baseline Specification

## Purpose

Diese Spezifikation bindet reale Playthru-Pilotbeobachtungen ohne Secrets, trennt technische Bedienhandlung von fachlicher Verantwortung und verhindert, dass Gesellschafts-, Firmendaten- oder Paketgerueste als weitergehende Einrichtung, Datenmigration oder Buchung ausgegeben werden.

## Requirements

### Requirement: Reale Pilotbeobachtung bleibt begrenzt

Das System MUST Gesellschaftserstellung, Versionen, Country/Region-, Firmendaten- und Paketstatus getrennt von noch nicht ausgefuehrtem Finanzsetup und Datenwirkung dokumentieren.

#### Scenario: Leeres Paketgeruest

- **WHEN** ein Paket 0 Tabellen und 0 Datensaetze besitzt
- **THEN** darf weder Setup-, Import-, Buchungs- noch Datenwirkung behauptet werden

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

### Requirement: Firmenstammdaten bleiben synthetisch

Das System MUST ausschliesslich die freigegebenen synthetischen Firmenwerte speichern und Steuer-, Telefon- und Bankkennungen bewusst leer halten, solange keine valide Regel und Pruefung vorliegt.

#### Scenario: Leere Zahlungsinformationen

- **WHEN** Bank- und Zahlungsfelder leer bleiben
- **THEN** muss die Option fuer leere Zahlungsinformationen sichtbar bestaetigt sein

### Requirement: Akteurswahrheit ist aufloesbar

Das System MUST Codex-/Browserautomation und Kajetan Kalickis fachliche Verantwortung getrennt ausweisen.

#### Scenario: Automation bedient Business Central

- **WHEN** die Browserautomation eine autorisierte Aktion ausfuehrt
- **THEN** wird die technische Bedienung nicht als manueller Klick des menschlichen Verantwortlichen ausgegeben

### Requirement: Paketwellen bleiben fail-closed

Das System MUST alle drei Paketgerueste bis zu einem getrennten Tabellen-/Feldreview bei null Tabellen, Datensaetzen und Fehlern halten und gebuchte Ledger-Tabellen ausschliessen.

#### Scenario: Firmendaten wurden gespeichert

- **WHEN** Country/Region und Company Information ausgefuehrt wurden
- **THEN** darf daraus keine Paket-, Import-, Buchungs- oder Geschaeftsdatenwirkung abgeleitet werden
