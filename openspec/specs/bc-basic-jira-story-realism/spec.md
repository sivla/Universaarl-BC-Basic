# bc-basic-jira-story-realism Specification

## Purpose

Diese Spezifikation stellt sicher, dass die kanonische BC-Basic-Jira-Projektstory typgerecht, menschenlesbar, rollenbezogen, chronologisch und ausschliesslich ueber Task-Worklogs abrechenbar bleibt.
## Requirements
### Requirement: Typgerechte kundenlesbare Tickets

Das System MUST jedes kanonische Ticket ohne weitere Quelldatei mit Zweck, Arbeit, Entscheidung beziehungsweise Ergebnis und Abschluss bereitstellen. Phase, Epic, Story und Task MUESSEN ihren jeweiligen Mindestvertrag erfuellen.

#### Scenario: Ein Consultant liest UABC-4

- **WHEN** UABC-4 im Jira- oder Twin-Detail geoeffnet wird
- **THEN** sind fachlicher Umfang, Ergebnis, Nichtumfang, Abhaengigkeiten, Definition of Done, Stories, Entscheidungen, Seiten und Deliverables sichtbar

### Requirement: Aufloesbare Akteure und Rollen

Das System MUST jede Aktion einer bekannten Person oder technischen Akteuridentitaet und der ausgeuebten Rolle zuordnen. Unbelegte reale Namen, Freigaben oder Supportannahmen sind verboten.

#### Scenario: Projektverantwortlicher ist noch nicht namentlich bestaetigt

- **WHEN** kein ausdruecklich bestaetigter Anzeigename vorliegt
- **THEN** wird die stabile Person-ID mit `Anzeigename zu bestaetigen` und den aktiven Projektrollen ausgegeben

### Requirement: Ausschliesslich Task-basierte Abrechnung

Das System MUST fakturierbare Worklogs ausschliesslich auf Tasks fuehren. Gesamt- und Phasenwerte MUESSEN weiterhin exakt 80 Stunden, 9.600 EUR und 22/40/18 betragen.

#### Scenario: Elternrollup wird angezeigt

- **WHEN** Phase, Epic oder Story Plan- und Istwerte zeigt
- **THEN** sind diese als nicht fakturierbares Task-Rollup gekennzeichnet und erzeugen keine Rechnungszeile

### Requirement: Ehrliche Projektchronologie

Das System MUST Statushistorien, Kommentare, Worklogs, Meetings und Entscheidungen innerhalb der fuehrenden April-/Mai-Referenzsimulation chronologisch und rollenbezogen halten. Simulierte Gates duerfen nicht als reale Kundenhandlung erscheinen.

#### Scenario: Zahlungsreferenz wird korrigiert

- **WHEN** UABC-29 und UABC-47 geprueft werden
- **THEN** sind Symptom, Ursache, Fix, Retest, Evidence und synthetischer Abschluss vollstaendig nachvollziehbar

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
