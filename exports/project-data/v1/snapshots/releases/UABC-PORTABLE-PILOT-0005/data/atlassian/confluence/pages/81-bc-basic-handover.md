---
id: UABC-TRAINING
storyPageId: PAGE-UABC-180
title: 04 Lieferobjekte und Abnahme
parent: null
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 4
purpose: Verbindlicher Umfang von Lieferobjekten, Qualitätssicherung und Befähigung
audience: Vertrieb, Projektleitung, Consultant, Key User und Support
owners:
  - P-002
version: 4
status: published
jiraRefs:
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-010
  - UABC-REQ-BCB-011
lastReviewed: 2026-09-03
---

# 04 Lieferobjekte und Abnahme

## Liefer- und Qualitätsversprechen

Das Produkt liefert nicht nur Einstellungen, sondern einen nachweisbaren Weg von der Projektvorbereitung bis zur selbstständigen täglichen Nutzung.

Die konkreten Kundendokumente und Testergebnisse entstehen ausschließlich in der jeweiligen Kundeninstanz.

## Abnahmelogik

Lieferobjekte, Tests und Training bilden eine gemeinsame Abnahmekette. Ein Ergebnis gilt erst als abgeschlossen, wenn Akzeptanzkriterium, Evidence, Abweichungsbehandlung und verantwortliche Rolle zusammenpassen.

## Lieferpaket, Tests und Standardtraining

### Standardlieferpaket

Das Basispaket umfasst neun fachliche Ergebnisgruppen:

1. Projektauftrag, Scope und Entscheidungspfad.
2. Fit-to-Standard-Prozess- und Solution-Blueprint.
3. Dateninventar, Mapping, Qualitätsregeln und Migrationswellen.
4. dokumentierte Standardkonfiguration samt Berechtigungsproben.
5. durchgängige Prozess- und Buchungstests.
6. UAT-Paket mit Defect-, Korrektur- und Retestnachweis.
7. rollenbezogenes Training und Kompetenznachweis.
8. Cutover-, Restart- und Hypercare-Runbook.
9. Betriebsübergabe, Supportweg und Abschlussbericht.

### Standardtests

Die Testfolge verläuft von Setup- und Datenprüfung über positive und negative Prozessfälle bis zu UAT und Operator-Smoke-Test. Jeder Kernfall dokumentiert:

- Rolle, Vorbedingungen und synthetische oder freigegebene Eingabedaten;
- erwartete BC-Seite, Aktion und Validierung;
- erwartete Beleg-, Sachkonto-, Nebenbuch-, VAT- und Lagerwirkung;
- Kontrollsumme, Abweichung, Korrektur und Retest;
- Entscheidung über Weitergabe, Blockade oder Abnahme.

P1- und P2-Defects müssen vor dem Cutover-Gate geschlossen oder durch eine ausdrücklich akzeptierte, sichere Behandlung abgedeckt sein.

### Standardtraining

Die operative Befähigung folgt je Rolle derselben Lernfolge:

1. Consultant zeigt den vollständigen Standardfall.
2. Teilnehmer führt ihn begleitet aus.
3. Teilnehmer wiederholt ihn ohne Hilfe.
4. Teilnehmer diagnostiziert einen realistischen Fehler.
5. Teilnehmer korrigiert selbst oder eskaliert über den vereinbarten Supportweg.

Der Kompetenznachweis bewertet Belegstatus, Menge, Betrag, VAT/USt, offene Posten, Bankabstimmung, Bestand und Periodenstatus rollenbezogen.

Governance-Rollen erhalten Entscheidungs- und Kontrollbriefings, aber kein künstliches Endanwendertraining.

### Kundenstart

Vor einer realen Durchführung werden Teilnehmer, Sandboxzugang, Berechtigungen, Resetfähigkeit, Kundendaten und Termine bestätigt.

Eine Referenzsimulation belegt die Wiederholbarkeit des Pakets. Sie ersetzt weder reale Benutzerhandlungen noch Kundenabnahmen.

## Kundenprojektparameter und Pflegegrenze

- Der Kunde benennt Key User, Vertretungen und Supportkontakte vor Trainingsstart.
- UAT und Training verwenden dieselben freigegebenen Prozesse und Datenstände.
- Nicht bestandene Kompetenz- oder UAT-Fälle werden erneut trainiert und getestet; sie werden nicht durch Dokumentation als bestanden erklärt.

## Referenzen

- [BC Basic Standardprodukt](70-bc-basic-project.md)
- [Prozess- und Konfigurationsstandard](31-processes.md)
- [Cutover, Hypercare, Betrieb und Erweiterungsgrenzen](73-bc-basic-hypercare.md)
- [Consultant: Projektsteuerung bis Abschluss](75-bc-basic-meetings-decisions.md)

<!-- story-metadata {"id":"PAGE-UABC-180","title":"04 Lieferobjekte und Abnahme","parent":null,"version":4,"status":"published"} -->
