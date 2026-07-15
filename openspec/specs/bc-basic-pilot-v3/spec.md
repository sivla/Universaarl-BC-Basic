# bc-basic-pilot-v3 Specification

## Purpose

Diese Spezifikation bewahrt den verbindlichen Vertrag der abgeschlossenen synthetischen BC-Basic-Referenzeinfuehrung V3.

## Requirements
### Requirement: Zeitlich glaubwuerdige Einfuehrung
Die Referenzsimulation MUST eine laengere Vorbereitung, genau eine fuenftaegige Einrichtungswoche und anschliessend Cutover, Hypercare, Restart, Monatsabschluss, UStVA-Vorschau und Handover besitzen. Kein Ticket darf vor seinem Worklog, Test, Meeting oder Evidencezeitpunkt geschlossen sein.

#### Scenario: Chronologie besteht
- **WHEN** Projektstory, Tickets, Meetings und Abrechnung validiert werden
- **THEN** sind alle Zeitpunkte monoton, Phasen besitzen Enddaten und die Einrichtungswoche umfasst genau fuenf aufeinanderfolgende Arbeitstage

### Requirement: Glaubwuerdige Rollen und Gespraeche
Der Pilot MUST einen ausdruecklich simulierten Beispielkunden mit benannten Ansprechpartnern, RACI, Verfuegbarkeit, Eskalation und Gateberechtigungen abbilden. Kajetan Kalicki MUST als reale Consultantrolle klar getrennt bleiben. Jedes Ticket MUST auf mindestens ein fachlich passendes Transkript, Deliverable und Evidence-Artefakt verweisen.

#### Scenario: Rollen- und Transkriptgate besteht
- **WHEN** Rollenregister, Transkripte und Ticketreferenzen geprueft werden
- **THEN** existieren keine unbestaetigten Platzhalterrollen und kein Alibi-Meeting

### Requirement: Rechenbare Kernprozesse und Abrechnung
P2P, O2C, Zahlung/Ausgleich, Bankabstimmung, Lager/Inventur, Monatsabschluss und UStVA-Vorschau MUST Belege, Betraege, Konten-/Postenwirkungen, Kontrollsummen, Ausnahme, Korrektur und Retest enthalten. Rechnungen MUST ausschliesslich aus Task-Worklogs abgeleitet werden; Elternwerte duerfen nicht fakturiert werden. Plan und Ist MUST voneinander abweichen und unter 10.000 EUR bleiben.

#### Scenario: Kaufmaennisches Gate besteht
- **WHEN** Worklogs, Wochenrechnungen und Finanz-Evidence abgestimmt werden
- **THEN** stimmen Stunden und Centwerte exakt, ohne Doppelabrechnung

### Requirement: Typisierter portabler V3-Katalog
Der V3-Katalog MUST Angebot/Scope, Projektzustand, Rollen, Meetings/Trainings, Tickets, Rechnungen, Entscheidungen/Risiken/Defects, Spaces, BC-Sitzungen, Tests, Deliverables, Evidence, Hypercare und Handover explizit typisieren. Er MUST `requiresGit=false`, `readOnly=true`, vollstaendige SHA-256-Digests und fail-closed Referenzen besitzen.

#### Scenario: Atomare Aktivierung
- **WHEN** ein neuer V3-Katalog erzeugt wird
- **THEN** wird erst ein vollstaendig validiertes unveraenderliches Release atomar angelegt und danach `current.json` atomar umgeschaltet; V2 bleibt unveraendert
