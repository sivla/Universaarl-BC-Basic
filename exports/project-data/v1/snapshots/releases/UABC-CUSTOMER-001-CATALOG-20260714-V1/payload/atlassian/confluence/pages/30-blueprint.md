---
id: UABC-BLUEPRINT
storyPageId: PAGE-UABC-030
title: 00 Durchfuehrungsueberblick
parent: null
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 0
purpose: Interne Durchführungshilfe für ein lean wiederholbares BC-Basic-Projekt
audience: Consultant, Projektleitung und Solution Architecture
owners:
  - P-002
version: 5
status: published
jiraRefs:
  - UABC-1
  - UABC-2
  - UABC-3
  - UABC-4
  - UABC-10
referenceIds:
  - UABC-ARCH-ENTERPRISE-001
  - UABC-CAP-CATALOG-001
  - UABC-REQ-CAP-001
lastReviewed: 2026-07-12
---

# 00 Durchfuehrungsueberblick

## Einsatz des Handbuchs

Dieses interne Handbuch führt Consultants durch ein BC-Basic-Projekt. Es enthält Methode und Qualitätsregeln, aber keine Kundenevidence, Zugangsdaten oder kopierten Kundenentscheidungen.

Kundenspezifische Ergebnisse werden ausschließlich im Kundenprojekt-Space dokumentiert.

## Fast-Track und Verantwortungsgrenze

Der Fast-Track ist einsatzbereit: Angebot klären, Kundenvorbereitung organisieren, drei Workshops moderieren, Standard konfigurieren, Daten migrieren, UAT und Befähigung steuern sowie Cutover und Hypercare kontrolliert abschließen.

## Arbeitsfolge

1. **Projektstart:** Scope, Annahmen, Mitwirkung, Rollen, Termine und Change-Regel erklären.
2. **Discovery:** Fragen vorab senden und drei fokussierte Entscheidungsworkshops durchführen.
3. **Solution Design:** Fit-to-Standard bevorzugen und jede Abweichung mit Nutzen und Auswirkung dokumentieren.
4. **Einrichtung und Daten:** Abhängige Setup-Bereiche in Reihenfolge konfigurieren und drei Datenwellen abstimmen.
5. **Test und Befähigung:** positive und negative E2E-Fälle, UAT, Training und Operator-Smoke-Test durchführen.
6. **Cutover und Betrieb:** Generalprobe, GO-/NO-GO, Restart, Hypercare und Handover steuern.

## Rollen des Consultants

Der Consultant moderiert Entscheidungen, übersetzt Anforderungen in BC-Standard, dokumentiert Systemwirkungen und macht Risiken sichtbar. Er ersetzt weder Sponsor, Fachbereich, Steuerberatung noch technische Tenant-Administration.

## Qualitätsprinzipien

- Standard vor Sonderlösung und Konfiguration vor Extension.
- Keine Buchung ohne bekannte Beleg-, Konten-, VAT- und Nebenbuchwirkung.
- Keine Datenwelle ohne Mapping, Qualitätsregel und Kontrollsumme.
- Kein Done ohne Evidence, Akzeptanz und bei Defects einen bestandenen Retest.
- Keine produktive Aussage aus Simulation, Dokumentation oder nicht bestätigter Sandboxbeobachtung.
- Keine Geheimnisse oder Zugangsdaten in Projektartefakten.

## Eskalation

Sichere Bedienfehler können nach dokumentiertem Standard korrigiert werden. Prozess- und Stammdatenfragen gehen an den Key User.

Konfigurations- und Produktfragen gehen an Consultant oder Support. Unklare Buchungs-, Steuer-, Sicherheits- oder Datenintegritätswirkung führt zum sofortigen Stopp.

## Interne Pflege und Wiederverwendung

- Projektabhängige Rollen, Tenant-Funktionen, Lokalisierung und Datenquellen werden beim Start bestätigt.
- Ein Gap wird erst nach dokumentiertem Standardvergleich und Auswirkungsanalyse aufgenommen.
- Interne Methode und Kundenprojektwahrheit bleiben getrennt; Verweise ersetzen keine Evidence.

## Referenzen

- [Discovery, Workshops und Fit-to-Standard](20-discovery.md)
- [Umgebung, Einrichtung, Daten und Testdurchführung](60-environment-baseline.md)
- [Projektsteuerung, Training, Cutover, Hypercare und Abschluss](75-bc-basic-meetings-decisions.md)
- [BC Basic Standardprodukt](70-bc-basic-project.md)

<!-- story-metadata {"id":"PAGE-UABC-030","title":"00 Durchfuehrungsueberblick","parent":null,"version":5,"status":"published"} -->
