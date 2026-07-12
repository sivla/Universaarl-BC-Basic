---
id: UABC-PRODUCTAPPROACH
title: 03 Phasen und Vorgehensmodell
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 3
storyPageId: PAGE-UABC-210
purpose: Diese Seite beschreibt, was als BC-Basic-Pilotprodukt verkauft und
  geliefert wird.
audience:
  - Vertrieb
  - Projektleitung
  - Consultant
  - Solution Architect
jiraRefs:
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
---

# 03 Phasen und Vorgehensmodell

## Vorgehensprinzip

BC Basic folgt einem festen Fast-Track: Kundenvorbereitung, drei fokussierte Workshops, Standarddesign, Setup und Migration, UAT und Befaehigung sowie kontrollierter Go-live mit Hypercare.

Jede Phase besitzt ein Entry- und Exit-Gate. Offene Steuer-, Rollen- oder Datenentscheidungen werden nicht durch technische Aktivitaet verdeckt.

## Phase 1 – Vorbereitung und Datenbereitschaft

**Ergebnis:** bestaetigter Scope, Fit-to-Standard-Entscheidungen, Datenowner, Datenlieferplan und Setup-Entry-Gate.

Der Kunde liefert Organisation, Prozessvarianten, Konten-/Steuerannahmen, Bankverfahren, Rollen und Beispieldaten. Drei Workshops entscheiden Finance und Scope, Handel und Lager sowie Daten, UAT und Cutover. Nur entscheidungsreife Abweichungen gelangen als Change in die Planung.

## Phase 2 – Einrichtung, Tests und Schulung

**Ergebnis:** reproduzierbare Standardkonfiguration, drei abgestimmte Datenwellen, durchlaufene Kernprozesse, sieben UAT-Faelle und vier befaehigte Rollenpfade.

Die Reihenfolge ist Finance-Basis, Buchungsmatrizen und VAT, Nummernserien und Dimensionen, Stammdaten, offene Posten, Prozesse und Abstimmung. Jede Konfiguration besitzt einen feldnahen Pruefschritt. Fehler werden korrigiert und als Retest belegt.

## Phase 3 – Go-live, Hypercare und Abschluss

**Ergebnis:** Mock-Cutover, GO-Entscheidung, Restart-Probe, drei Hypercaretage, Monatsabschluss-/VAT-Vorschau und Supportuebergabe.

Die Referenzsimulation schliesst alle synthetischen Gates. Ein reales Kundenprojekt wiederholt sie mit bestaetigten Tenant-, Daten-, Rollen- und Steuerparametern.

## Gate-Regel

Ein Gate ist nur bestanden, wenn Owner, Kriterien, Entscheidung und Evidence vorhanden sind. Simulierte Abnahmen werden als Simulation gekennzeichnet. Reale Sandbox-Ausfuehrung beginnt erst nach fail-closed Zielbindung und ausdruecklicher Projektfreigabe; Produktion und externe Uebermittlungen bleiben ausgeschlossen.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-210","title":"03 Phasen und Vorgehensmodell","parent":null,"version":2,"status":"published"} -->
