---
id: UABC-CONSULTINGHANDOVER
title: 06 Dokumentation und Uebergabe
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 6
storyPageId: PAGE-UABC-260
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

# 06 Dokumentation und Uebergabe

## Ziel der Uebergabe

Der Betrieb muss Tages-, Wochen- und Monatsaufgaben ausfuehren, Kontrollen erklaeren, Stoerungen reproduzierbar melden und Verantwortungsgrenzen kennen. Die Uebergabe beginnt deshalb vor dem Cutover und endet erst nach erfuelltem Hypercare-Exit.

## Uebergabepaket

- freigegebener Scope, Solution Design und Konfigurationsnachweis;
- Datenmapping, letzte Kontrollsummen und bekannte Datenrestriktionen;
- UAT-, Trainings- und Kompetenznachweise;
- Cutover-, Fallback- und Restart-Protokoll;
- Rollen-/SoD-Matrix und bestaetigte Supportkontakte;
- offene P3-/Supportpunkte mit Owner, Prioritaet und Zieltermin;
- neun Kundendeliverables mit Version, Ticketbezug, Evidence und Abnahme.

## Hypercare-Exit

Der Consultant prueft null offene P1/P2, stabile Kernprozesse, abgestimmte Nebenbuecher, geklaerte Supportwege und einen bestandenen Operator-Smoke-Test. Jeder Hypercaretag enthaelt Status, Tickets, Diagnose, Fix, Retest und Entscheidung fuer den Folgetag.

## Supportannahme

Ein Supportticket nennt Umgebung und Gesellschaft ohne Secrets, Rolle, Arbeitsdatum, Seite/Aktion, Belegreferenz, erwartetes und beobachtetes Ergebnis, Auswirkung sowie bereits versuchte Schritte. Vier Ausgaenge sind erlaubt: selbst korrigieren, Key User, Consultant/Support oder sofortiger Buchungsstopp.

## Abschlusskontrolle

Projektleitung gleicht Scope, Stunden, Kosten, Deliverables, Entscheidungen und Restpunkte ab. Synthetische Abnahme wird als Simulation ausgewiesen. Reale Servicezeiten, Ansprechpartner, Berechtigungen und Produktionsannahme werden je Kundenprojekt bestaetigt.

## Lernkreislauf

Kundenspezifische Erkenntnisse verbleiben im Kundenprojekt. Wiederverwendbare, anonymisierte Befunde werden als `blueprint-candidate` vorgeschlagen und benoetigen Produktreview; sie veraendern Spectra oder andere Projekte nicht automatisch.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-260","title":"06 Dokumentation und Uebergabe","parent":null,"version":2,"status":"published"} -->
