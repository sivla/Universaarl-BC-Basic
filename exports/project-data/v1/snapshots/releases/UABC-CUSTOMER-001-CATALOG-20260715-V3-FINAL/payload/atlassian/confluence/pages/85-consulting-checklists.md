---
id: UABC-CONSULTINGCHECKLISTS
title: 07 Checklisten, Vorlagen und Fehlerbilder
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 7
storyPageId: PAGE-UABC-270
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

# 07 Checklisten, Vorlagen und Fehlerbilder

## Projektstart

- Scope, Nicht-Scope, Budget, Rollen und Entscheidungsweg bestaetigt;
- drei Workshops terminiert und Vorbereitungsauftrag versendet;
- Datenowner, Vorlagen, Liefertermine und Sandboxvoraussetzungen geklaert;
- Risiken, Abhaengigkeiten und Change-Regel sichtbar.

## Setup und Daten

- Finance- und VAT-Basis vor Stammdaten eingerichtet;
- Buchungsgruppen, Dimensionen, Nummernserien und Perioden geprueft;
- drei Datenwellen mit Pflichtfeldern, Referenzen und Kontrollsummen;
- Fehlerliste korrigiert und Wiederholung differenzfrei;
- Resetpunkt und Wiederanlauf vor Prozessbuchungen belegt.

## Tests und Befaehigung

- positiver End-to-End-Fall und negativer Retest je Kernprozess;
- sieben UAT-Faelle mit fachlicher Evidence;
- vier Rollenpfade mit Ohne-Hilfe-Nachweis;
- keine offenen P1/P2 vor GO;
- Supportticket enthaelt vollstaendiges Diagnosepaket.

## Cutover und Hypercare

- Freeze, finale Datenkontrolle, Rollen, Zeitplan und Fallback bestaetigt;
- Mock-Cutover und Restart bestanden;
- Tagesstatus, Incidenttriage, Fix und Retest gefuehrt;
- Monatsabschluss-/VAT-Vorschau abgestimmt, keine externe Uebermittlung;
- Supportuebergabe und Restpunkte angenommen.

## Typische Antipatterns

- Setup beginnen, obwohl Konten-, Steuer- oder Datenowner fehlen;
- Sonderloesung zusagen, bevor der BC-Standard demonstriert wurde;
- Test als bestanden markieren, obwohl nur das erwartete Ergebnis dokumentiert ist;
- Eltern-Tickets oder interne Technik als Kundenleistung abrechnen;
- Screenshots ohne Beleg-, Entry- und Kontrollsummenbezug sammeln;
- produktive oder externe Aktion aus einer Simulation ableiten.

## Eskalation

Der Consultant stoppt bei unbekannter Zielumgebung, fehlender Ruecksetzbarkeit, ungeklärter steuerlicher Wirkung, unzulaessiger Rollenverbindung oder nicht abgestimmter Summe. Die Abweichung wird mit Owner und naechster Entscheidung dokumentiert; sie wird nicht durch Annahmen geschlossen.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-270","title":"07 Checklisten, Vorlagen und Fehlerbilder","parent":null,"version":2,"status":"published"} -->
