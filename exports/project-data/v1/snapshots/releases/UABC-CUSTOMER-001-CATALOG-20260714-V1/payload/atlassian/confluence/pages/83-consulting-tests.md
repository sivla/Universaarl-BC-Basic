---
id: UABC-CONSULTINGTESTS
title: 04 Tests, UAT und Evidence
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 4
storyPageId: PAGE-UABC-250
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

# 04 Tests, UAT und Evidence

## Teststeuerung

Tests beweisen einen fachlichen Prozess und seine Kontrollen, nicht nur einen Seitenaufruf. Jeder Fall nennt Rolle, Vorbedingung, Eingabedaten, BC-Seite und Aktion, erwartete Belege und Entries, Kontrollsumme, Fehlerfall, Korrektur, Retest und Evidence.

## Teststufen

- **Setup-Pruefung:** feldnahe Kontrolle jeder freigegebenen Konfiguration.
- **SIT:** durchgaengige P2P-, O2C-, Cash-/Bank-, Lager- und Abschlussketten.
- **UAT:** sieben priorisierte Fachbereichsfaelle mit selbststaendiger Bedienung.
- **Operator-Smoke-Test:** erste Tagesaufgaben, Abstimmung und Supportdiagnose.
- **Cutover-/Restart-Probe:** Datenfreeze, Kontrollsummen, Fallback und Wiederanlauf.

## Defect und Retest

Eine Abweichung erhaelt Symptom, Reproduktionsschritte, Auswirkung, Prioritaet, Ursache, Fix, Retest und Evidence. P1/P2 blockieren das naechste Gate. Ein Ticket ist erst geschlossen, wenn Akzeptanzkriterien und Retest belegt sind; technische Logs ohne fachliche Auswertung reichen nicht.

## Evidence-Regel

Evidence zeigt Eingabe, beobachtetes Ergebnis, Soll/Ist-Vergleich, Zeitpunkt und verantwortliche synthetische oder reale Rolle. Repository-Simulation, Sandbox-Ausfuehrung und Produktion werden getrennt gekennzeichnet. Offizielle Dokumentation stuetzt das erwartete Standardverhalten, beweist aber keine Ausfuehrung.

## Zukuenftiger Sandbox-Playthrough

Schreibaktionen sind nur fuer eine positiv gebundene Playthrough-Sandbox und Pilotgesellschaft zulaessig. Vor jedem Write muessen Environment, Company, BC-Version, Lokalisierung, Benutzerrolle, Arbeitsdatum, Resetpunkt und erlaubter Scope exakt bekannt sein.

Unknown oder Abweichung stoppt vor dem Write. Produktion sowie ELSTER-, Bank-, Mail- und andere externe Uebermittlungen bleiben verboten.

## UAT-Abnahme

Der Key User erklaert Kontrolle und Ergebnis, fuehrt den positiven Fall ohne Hilfe aus, diagnostiziert einen Fehler und eskaliert korrekt. Die Simulation darf dieses Gate synthetisch abschliessen; ein echtes Projekt wiederholt es mit dem benannten Benutzer und dessen Sandboxberechtigung.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-250","title":"04 Tests, UAT und Evidence","parent":null,"version":2,"status":"published"} -->
