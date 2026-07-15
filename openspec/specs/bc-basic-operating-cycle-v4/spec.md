# bc-basic-operating-cycle-v4 Specification

## Purpose
Definiert den lueckenlosen, rechnerisch abgestimmten und portablen synthetischen BC-Basic-Betriebszyklus von Cutover bis Supportuebergabe auf unveraenderlicher V3-Baseline.

## Requirements
### Requirement: Unveraenderliche V3-Baseline und genau eine V4-Wahrheit
Das Projekt MUST V3-Release, Manifest- und Payload-Digest, bestehende `UABC-*`-IDs, 78 fakturierte Stunden und 9.360 EUR netto unveraendert erhalten. V4 MUST bis zur vollstaendigen Katalogvalidierung innerhalb genau eines aktiven OpenSpec-Changes bleiben und darf keine parallele Jira-, Confluence-, Evidence- oder Katalogwahrheit erzeugen.

#### Scenario: V4 beginnt ohne V3-Mutation
- **WHEN** UABC-M1 validiert wird
- **THEN** stimmen alle festgehaltenen V3-Digests und IDs vor und nach der Aenderung ueberein, der aktuelle Katalog zeigt weiter auf V3 und genau ein V4-Change ist aktiv

### Requirement: Lueckenloser Betriebskalender und Anfangssalden
V4 MUST jeden Kalendertag vom Cutover am 11. Mai 2026 bis zur Supportuebergabe am 1. Juni 2026 mit Zustand, Verantwortung, Aktivitaet oder ausdruecklichem Ruhetag und Tageskontrolle fuehren. Bank, Bestand, Debitoren, Kreditoren, VAT und Sachbuch MUST mit den in `design.md` festgelegten Anfangssalden starten. Der am Pfingstmontag liegende V3-Restarttermin MUST historisch erhalten und als Vorbereitungstag auf den operativen Restart am 26. Mai abgebildet werden.

#### Scenario: Kalender und Salden sind eindeutig
- **WHEN** Kalender, Tagesrecords und Rechenketten geprueft werden
- **THEN** fehlt kein Kalendertag, jeder Tag besitzt einen Owner und die Endwerte 5.440,30 EUR Bank, 49 STK beziehungsweise 2.058,00 EUR Bestand sowie 11.080,20 EUR Soll und Haben sind aus den Anfangswerten ableitbar

### Requirement: Verknuepfte Tagesprozesse und Kontrollen
Jeder operative V4-Tag MUST Eingaben, Belege, Ledgerwirkungen, Kontrollsummen, Defects, Entscheidungen, Korrekturen, Retests und bidirektionale Referenzen zu Ticket, Meeting, Prozess, Test und Evidence enthalten. P2P, O2C, Zahlung, Bank und Lager MUST eine zusammenhaengende Beleg- und Saldenkette bilden. Tage ohne Buchung MUST den unveraenderten Zustand und die Erreichbarkeit ausdruecklich belegen.

#### Scenario: Tagesabschluss besteht
- **WHEN** ein V4-Tag geschlossen wird
- **THEN** sind alle Pflichtreferenzen vorhanden, jede finanzielle Differenz ist null und kein Ticket wird vor seiner Evidence geschlossen

### Requirement: Einheitliche Defect- und Stopplogik
V4 MUST ausschliesslich die bestehenden Defectklassen P1, P2 und P3 mit Owner, Reaktionsfrist, Gatewirkung und Retest verwenden. Jede finanzielle Kontrolldifferenz ungleich null MUST mindestens P2 sein. P1 und P2 MUST den betroffenen Tagesabschluss und alle abhaengigen Gates blockieren.

#### Scenario: Defect bleibt ehrlich offen
- **WHEN** Owner, Frist, Korrektur oder identischer Retest fehlen
- **THEN** bleibt der Defect offen und kein abhaengiges Gate darf als bestanden oder gruen dargestellt werden

### Requirement: Abschluss, UStVA-Vorschau und Supportuebergabe
Der erste Monatsabschluss MUST Bank, Debitoren, Kreditoren, Lager, VAT und Sachbuch rechnerisch abstimmen. Die UStVA-Vorschau MUST 150,10 EUR Umsatzsteuer, 79,80 EUR Vorsteuer und 70,30 EUR Zahllast ausweisen, ohne Test-, Produktiv- oder ELSTER-Uebermittlung zu behaupten. Hypercare-Exit, Restart, Handover und Katalogaktivierung MUST die in `design.md` genannten Gates bestehen.

#### Scenario: Handover ist synthetisch abgeschlossen
- **WHEN** V4 zur Katalogaktivierung vorgelegt wird
- **THEN** sind alle Tage und Gates belegt, kein P1/P2 ist offen, Support und Handbuecher lesen dieselben Records und reale Kunden-, Tenant-, Bank-, Steuer- oder Produktivfreigaben bleiben ausdruecklich offen

### Requirement: Keine Doppelabrechnung und Deckel unter 10.000 EUR
V4 MUST bestehende V3-Leistungen und deren detailliertere Evidence als bereits abgerechnet behandeln. Neue Abrechnung MUST ausschliesslich aus neuen Task-Worklogs entstehen und darf hoechstens 5 Stunden beziehungsweise 600 EUR netto betragen. Der kumulierte Betrag MUST unter 10.000 EUR netto bleiben; Elternrollups und Generator-/Validatorlaeufe duerfen nicht fakturiert werden.

#### Scenario: Budgetgate besteht
- **WHEN** V3- und V4-Worklogs sowie Rechnungsprojektionen aggregiert werden
- **THEN** wird keine Leistung doppelt gezaehlt, jede neue Zeile besitzt genau ein Task-Worklog und der kumulierte Betrag betraegt hoechstens 9.960 EUR netto

### Requirement: Portabler read-only V4-Katalog
Nach Abschluss der Materialisierung MUST genau ein unveraenderlicher V4-Katalog mit atomarem `current.json`-Zeiger, vollstaendigen SHA-256-Digests, `readOnly=true` und `requiresGit=false` erzeugt werden. Bis alle Fach-, Referenz-, Budget-, Sprach- und Integritaetsgates bestanden sind, MUST `current.json` auf dem unveraenderten V3-Release verbleiben.

#### Scenario: Aktivierung erfolgt fail-closed
- **WHEN** ein V4-Artefakt, eine Referenz, ein Digest oder ein Gate fehlt oder abweicht
- **THEN** wird kein V4-Release aktiviert und Project Twin liest weiterhin den letzten gueltigen V3-Katalog
