---
id: UABC-CONSULTINGDESIGN
title: 02 Loesungsdesign und Projektplanung
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 2
storyPageId: PAGE-UABC-240
purpose: Diese Seite beschreibt, wie Consultants die Leistung reproduzierbar
  durchfuehren.
audience:
  - Consultant
  - Solution Architect
  - Support
jiraRefs:
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
---

# 02 Loesungsdesign und Projektplanung

## Arbeitsauftrag

Der Consultant ueberfuehrt bestaetigte Discovery-Ergebnisse in ein umsetzbares Standarddesign.
Kundenspezifische Werte werden im Kunden-Space entschieden; diese Seite beschreibt die Methode und kopiert keine Kundenwahrheit.

## Designfolge

1. Scope, Nicht-Scope, Gesellschaft, Region und Arbeitsdatum bestaetigen.
2. Kontenplan, Buchungsgruppen und VAT-/USt-Matrix entwerfen.
3. Dimensionen, Nummernserien, Zahlungsbedingungen und Zahlungsmethoden festlegen.
4. Debitoren-, Kreditoren-, Artikel-, Bank- und Lagerparameter zuordnen.
5. Rollen, Funktionstrennung und zu pruefende Berechtigungsfunktionen bestimmen.
6. Drei Datenwellen, Prozesspruefungen, UAT und Cutover in Abhaengigkeitsreihenfolge planen.

## Entscheidungsregel

Jede Anforderung wird als Standard uebernehmen, kundenspezifisch parametrisieren, Change oder Out-of-Scope entschieden.
Eine Designentscheidung nennt Owner, Alternativen, Begruendung, Folgen fuer Daten, Setup und UAT sowie den echten Bestaetigungsbedarf.

Produktbehauptungen erhalten eine offizielle Microsoft-Learn-Quelle. Die Quelle belegt Standardverhalten, nicht die Ausfuehrung.

## Design-Review

Vor Setup pruefen Solution Architect und Prozessowner:

- vollstaendige Buchungsmatrizen ohne ungeklaerte Kombination;
- konsistente VAT-/USt-Annahmen und markierte Steuerfragen;
- eindeutige Dimensionen und Nummernserien;
- Datenmapping, Kontrollsummen und Resetstrategie;
- Rollen-/SoD-Matrix ohne unzulaessige Kombination;
- Referenzen von jeder Entscheidung zu Prozess, Task und UAT.

Das Exit-Kriterium lautet: notwendige Werte sind entschieden oder als bewusst blockierender Kundenparameter sichtbar; kein offener P1-Designfehler wird ins Setup verschoben.

## Projektplanung

Aufwand wird ausschliesslich auf abrechenbaren Tasks geplant und gebucht.
Phase, Epic und Story zeigen Rollups, erzeugen aber keine Rechnungszeile.
Abhaengigkeiten folgen der Reihenfolge Entscheidung, Daten, Setup, Prozesspruefung, UAT, Schulung und Cutover.

## Pilot-Setup-Handlung

Der Consultant bereitet Zielgesellschaft, drei Paketgerueste und Abhaengigkeiten vor.
Er konfiguriert erst nach bestandenem Vorpruefungsgate, prueft jeden Abschnitt feldnah, dokumentiert Defects und Retests und uebergibt nur einen differenzfreien Stand an UAT.
Kajetan Kalicki verantwortet PM, fachliches Review und Architekturentscheidung.
Codex-/Browserautomation bleibt ein eigener technischer Bedienakteur.

Aktuell gilt: Country/Region `DE` und Company Information sind im technischen Pilotmandanten `UABC-BASIC-DE` gespeichert und retest-gruen. `UNIVERSAARL-DE` bleibt Legacy; Universaarl GmbH ist der rechtliche Firmenname. Die drei Paketgerueste besitzen weiterhin `0` Tabellen und keine Daten- oder Buchungswirkung.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-240","title":"02 Loesungsdesign und Projektplanung","parent":null,"version":2,"status":"published"} -->
