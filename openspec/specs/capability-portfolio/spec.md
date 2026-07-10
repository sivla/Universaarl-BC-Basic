# capability-portfolio Specification

## Purpose
Definiert das hierarchische BC-Capability-Portfolio, seine Prozessketten, Abhaengigkeiten, Reportinglogik und rollenbasierte Einfuehrung.
## Requirements
### Requirement: UABC-REQ-CAP-001 Vollstaendige Capability-Zuordnung
Jede geplante BC-Domaene MUST in einem strukturierten hierarchischen Katalog in Unterfaehigkeiten zerlegt werden. Jede Unterfaehigkeit MUST Status, Geschaeftszweck, Universaarl-Gesellschaft, Standort, Rolle, Quelle, Begruendung, Welle und reservierte Scenario-ID ausweisen; fachlich zwingende Reihenfolgen MUST als Abhaengigkeiten benannt werden. Eine optionale Evidence-ID MUST auf das Verification-Register zeigen; bei `approved` ist bestandene Evidence verpflichtend.

#### Scenario: UABC-SCN-CAP-001 Capability-Matrix validieren
- **GIVEN** der strukturierte Capability-Katalog `UABC-CAP-CATALOG-001`
- **WHEN** alle Pflichtspalten auf leere oder generische Werte geprueft werden
- **THEN** ist jede Unterfaehigkeit einem glaubwuerdigen Universaarl-Geschaeftsfall, einer Quelle und einem geplanten Nachweis zugeordnet

### Requirement: UABC-REQ-CAP-002 End-to-End-Prozessketten
Das Zielbild MUST mindestens Record-to-Report, Procure-to-Pay, Order-to-Cash, Plan/Make-to-Stock, Project-to-Cash, Service-to-Cash, Acquire-to-Retire und Intercompany-to-Consolidate als Ende-zu-Ende-Ketten enthalten.

#### Scenario: UABC-SCN-CAP-002 Prozessabdeckung reviewen
- **GIVEN** Prozess- und Capability-Matrix
- **WHEN** jede Ende-zu-Ende-Kette von Stammdaten bis Buchungs-/Reportingwirkung verfolgt wird
- **THEN** sind Prozessowner, Systemgrenzen, Kontrollen und spaetere Nachweise benannt

### Requirement: UABC-REQ-CAP-003 Reportingfaehiges Dimensionsmodell
Das Dimensionsmodell MUST konzernweit vergleichbare Managementauswertungen ermoeglichen, ohne rechtliche Gesellschaft, Lagerlogik oder operative Projektobjekte zu duplizieren.

#### Scenario: UABC-SCN-RPT-001 Management-GuV schneiden
- **GIVEN** gebuchte synthetische Testtransaktionen in spaeteren Changes
- **WHEN** Ergebnis nach Kostenstelle, Geschaeftsbereich und Produktlinie analysiert wird
- **THEN** stimmen Dimensionswerte mit den Verantwortlichkeiten ueberein und lassen sich zur Gesellschaft zurueckverfolgen

### Requirement: UABC-REQ-CAP-004 Kontrollierte Intercompany- und Konsolidierungsarchitektur
Intercompany-Austausch und finanzielle Konsolidierung MUST als getrennte, aufeinander abgestimmte Prozesse mit Mapping, Abstimmung und Eliminierung modelliert werden. IC-Partner-/Konten-/Dimensionsmapping und die UAS-zu-UAD-Grundroute MUST vor davon abhaengigen Trade-/Operations-Szenarien liegen; vollstaendige Gruppenabstimmung und Konsolidierung bleiben ein spaeteres Gate.

#### Scenario: UABC-SCN-IC-001 Konzerninterne Leistung abstimmen
- **GIVEN** eine konzerninterne Lieferung oder Serviceleistung zwischen zwei operativen BC-Unternehmen
- **WHEN** beide Seiten gebucht, abgestimmt und konsolidiert werden
- **THEN** stimmen Partnerbezug und Betrag ueberein und die Eliminierung ist im Konsolidierungsunternehmen nachvollziehbar

### Requirement: UABC-REQ-CAP-005 Rollenbasierte Einfuehrung
Migration, Testing, UAT, Training, Adoption, Cutover und Hypercare MUST als projektbegleitende Workstreams von Strategie und Ownership bis Ausfuehrung und Support geplant werden. Training, UAT und spaetere Klickanleitungen MUST an realen Rollen, Prozesszielen, Unternehmen und nachgewiesenen UI-Szenarien ausgerichtet werden; Trainingskoordination MUST fachliche UAT-Abnahme durch die jeweiligen Business Owner nicht ersetzen.

#### Scenario: UABC-SCN-TRN-001 Trainingsfreigabe pruefen
- **GIVEN** ein spaeter verifiziertes Prozessszenario
- **WHEN** ein Trainingsmodul zur Freigabe vorgelegt wird
- **THEN** referenziert es Rolle, Lernziel, BC-Version, Lokalisierung, Unternehmen, Scenario-ID und Evidence-Kette
