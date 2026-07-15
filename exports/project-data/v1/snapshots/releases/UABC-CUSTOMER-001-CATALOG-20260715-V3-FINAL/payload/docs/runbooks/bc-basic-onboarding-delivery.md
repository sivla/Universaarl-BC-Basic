# BC Basic – Onboarding- und Delivery-Runbook

## Zweck und Status

Dieses Runbook führt Projektleitung, Lead Consultant und Solution Architect durch ein leanes BC-Basic-Projekt. Die Plattform und das Onboarding-Paket sind vorbereitet. Ein konkreter Kunde ist erst go-live-bereit, wenn die realen Gates in `governance/production-readiness.json` belegt sind. Die vorhandene Universaarl-Geschichte ist eine sichtbar synthetische Referenzsimulation, keine Produktiv- oder Kundenfreigabe.

## Phase 1 – Vorbereitung und Discovery (22 Stunden)

1. Anfrage qualifizieren: Gesellschaft, Benutzer, Kernprozesse, Datenvolumen, Zieltermin, Integrationen und Ausschlüsse.
2. Angebot und Projektauftrag erklären: 80 Stunden zu 120 EUR, 9.600 EUR netto, T&M wöchentlich ausschließlich aus genehmigten Task-Worklogs. Erweiterungen und externe Kosten sind nicht enthalten.
3. Die sanitisierte Vorlage `project/bc-basic/customer-templates/blank/onboarding-intake.blank.yaml` geschützt an den Kunden geben. Ausgefüllte Daten niemals in das öffentliche Repository übernehmen.
4. Drei fokussierte Workshops durchführen: Discovery/Fit-to-Standard, Finance/Setup/Daten, Prozesse/UAT/Training. Agenda, Teilnehmer, Entscheidungen, offene Punkte und Folgeaufgaben im passenden Transkript dokumentieren.
5. Entry-Gate prüfen: Scope, Owner, Datenweg, Security, Sandbox, Lizenzen, sieben Kernentscheidungen und UAT-Termine sind bestätigt.

## Phase 2 – Einrichtungs- und Umsetzungswoche (40 Stunden)

### Tag 1 – Zielbindung und Grundeinrichtung

- Environment, Company, Version, Locale, Arbeitsdatum, Resetpunkt und erlaubte Writes prüfen.
- Sicherheitsgruppen, Permission Sets, Least Privilege, Admin-/Consultant-/Fachanwendertrennung und Notfallzugang festlegen.
- Company/General Ledger Setup, Perioden, Nummernserien und Dimensionen gemäß freigegebener Entscheidung konfigurieren und read-back prüfen.

### Tag 2 – Finance, VAT und Buchungsmatrix

- Kontenplan, allgemeine Buchungsmatrix, Debitoren-, Kreditoren- und Lagerbuchungsgruppen sowie MwSt.-Buchungsmatrix konfigurieren.
- Jede Kombination über feldnahe Kontrolle und Posting Preview prüfen. Steuerkennzeichen bleiben bis zur Bestätigung durch Kunde und Steuerberatung offen.

### Tag 3 – Stammdaten und Migration

- SETUP und MASTER über freigegebene Konfigurationspakete laden; technische Validierung, Fehlerliste, Korrektur und Reimport dokumentieren.
- Offene Posten und Lageranfangsbestände nicht als Ledger-Tabellen importieren, sondern kontrolliert buchen. Summen vorher/nachher abstimmen.
- Kundenlieferungen nach Abnahme und vereinbarter Frist kontrolliert löschen.

### Tag 4 – Prozesse und SIT

- P2P, O2C, Zahlung/Bank und Lager jeweils mit Normalfall, Fehlerfall, Korrektur und Retest ausführen.
- Posting Preview, gebuchte Belege sowie G/L-, Debitoren-, Kreditoren-, VAT-, Bank-, Item- und Value-Entries nachverfolgen.

### Tag 5 – UAT und Befähigung

- Sieben UAT-Fälle mit echten Key Usern durchführen; Teilnehmer, Defects, Retests und Entscheidung dokumentieren.
- Rollenfolge: vormachen, begleitet ausführen, ohne Hilfe ausführen, Fehler diagnostizieren, richtig eskalieren.
- Kein synthetisches Sign-off ersetzt eine reale Kundenabnahme.

## Phase 3 – Go-live, Hypercare und erster Abschluss (18 Stunden)

1. Mock-Cutover durchführen: Freeze, finale Datenkontrolle, Berechtigungen, offene Belege, Lager, Restorepunkt und Kommunikation.
2. GO/NO-GO nur aus realen Kriterien entscheiden. Bei unbekannter Zielbindung, P1/P2, unklarer Datenabstimmung oder fehlendem Restorepunkt gilt NO-GO.
3. Produktionsumschaltung mit Readback und dokumentiertem Fallback ausführen.
4. Hypercare täglich führen: Status, Tickets, Priorität, Diagnose, Fix, Retest, Folgetagsentscheidung. Exit nur ohne offene P1/P2.
5. Restore-Probe ausführen und danach Company, Rollen, Extensions, Job Queues, E-Mail-Konfiguration ohne Versand, Integrationen und Ledger-Integrität prüfen.
6. Ersten Monatsabschluss durchführen: Sachkonto, Debitoren, Kreditoren, Bank und Lager abstimmen; offene Differenzen mit Owner führen.
7. VAT-/UStVA-Vorschau erzeugen und fachlich abstimmen. Keine Übermittlung ohne ausdrückliche Kunden- und Steuerfreigabe; ELSTER, Bank und E-Mail bleiben außerhalb der Automation.
8. Retro und Supportübergabe mit Betriebsowner, Eskalationsweg, Restpunkten und Lösch-/Aufbewahrungsnachweisen abschließen.

## Wissensräume

- **Kundenprojekt:** konkrete Entscheidungen, Termine, Evidence und Abweichungen.
- **BC Basic Produkt:** Zielgruppe, Scope, Leistung, Voraussetzungen, Ausschlüsse und FAQ.
- **BC Basic Consulting-Handbuch:** Methode, Fragen, Einrichtung, Migration, Tests, Training, Cutover, Hypercare und Support.

Ein Inhalt besitzt genau einen führenden Raum; andere Seiten verlinken statt zu kopieren.

## Stopbedingungen

- Zielumgebung oder Gesellschaft unbekannt/falsch;
- echte Daten im öffentlichen Repository oder ungeschützte Übertragung;
- fehlende Freigabe für Write, Posting, Cutover oder Übermittlung;
- unaufgelöste Buchungsmatrix, Steuerkennzeichen, P1/P2 oder Abstimmabweichung;
- Restorepunkt oder Rückfallweg fehlt;
- Continia-, ELSTER-, Bank-, E-Mail- oder sonstige externe Aktion im Pilot.

## Quellen

Die erwarteten Standardwege werden durch das offizielle Quellenregister und die in `governance/production-readiness.json` aufgeführten Microsoft-Learn-Quellen gestützt. Quellen belegen Standardverhalten, niemals die tatsächliche Ausführung.
