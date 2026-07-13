---
id: UABC-BCBDELIVERABLES
title: 02 Business Central
parent: null
owners:
  - P-001
  - P-002
  - P-016
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 2
storyPageId: PAGE-UABC-130
purpose: Trennt Angebotsplan, aktuelles Ist und offene Lieferobjekte des
  laufenden Piloten.
audience:
  - Kunde
  - Vertrieb
  - Projektleitung
jiraRefs:
  - UABC-32
  - UABC-33
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-001
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-004
  - UABC-REQ-BCB-010
  - UABC-REQ-BCB-011
lastReviewed: 2026-07-13
version: 6
---

# 02 Business Central

## Projektauftrag

Diese Seite beschreibt das geplante BC-Basic-Paket. Das kanonische Lieferregister bleibt `project/bc-basic/deliverables.yaml`. Ein Leistungsversprechen ist kein ausgeführtes Lieferergebnis.

## Plan, Ist und Pilotstatus

| Sicht | Stand | Wahrheitsgrenze |
|---|---|---|
| Angebotsplan | 80 Stunden, 9.600 EUR netto | `planned-not-accepted`; keine Kundenannahme |
| Aktuelles Ist | 0 Stunden, 0 EUR | ausschließlich aus aktiven Task-Worklogs |
| BC-Ausgangsbasis | CRONUS-Demo | `pilotConfigured=false`, `writesApplied=false`, Readback offen |
| Setup-Pakete | 0 Tabellen / 0 Datensätze / 0 Fehler | keine Setup- oder Datenwirkung |

Die historische 68-Stunden-Kalkulation und die abgelöste Referenzsimulation bleiben Provenienz. Sie werden nicht mit dem aktiven Plan oder Ist zusammengerechnet.

## Geplanter Leistungsumfang

Der Standardweg umfasst Projektstart, Discovery, Finance- und Prozessdesign, Wave-0, Basiseinrichtung, kontrollierte Datenmigration, Prozessprüfung, UAT, Training, Mock-Cutover, Hypercare und Handover. Alle operativen Ergebnisse sind im aktuellen Pilot noch offen.

Nicht enthalten sind AL-Entwicklung, individuelle Reports oder Layouts, Integrationen, Dataverse, produktive Bankanbindung, erweitertes Lager, Produktion, Projekte, Service, Konsolidierung, historischer Vollimport, E-Rechnung sowie Bank-, E-Mail- oder Steuerübermittlung.

## Lieferobjekte und aktueller Zustand

### Auftrag, Discovery und Daten

- **`UABC-DEL-BCB-001` – Projektauftrag:** Plan, Scope, Rollen, Phasen und Change-Regel werden nachvollziehbar verknüpft. Kundenannahme und reale Termine sind offen.
- **`UABC-DEL-BCB-002` – Fit-to-Standard:** Finance, Einkauf, Verkauf, Lager und Abweichungen werden fachlich entschieden; offene Werte bleiben sichtbar.
- **`UABC-DEL-BCB-003` – Datenpaket:** Quellen, Pflichtfelder, Owner, Referenzen und Kontrollsummen werden vorbereitet; kein Import ist ausgeführt.

### Einrichtung, Befähigung und UAT

- **`UABC-DEL-BCB-004` – Standardkonfiguration:** Wave-0, Setupfolge und Readbacks stehen aus; CRONUS-Standarddaten gelten nicht als eingerichteter Pilot.
- **`UABC-DEL-BCB-005` – Training:** Rollenpfade und Fehlerfälle sind geplant; Teilnahme und Kompetenz sind nicht belegt.
- **`UABC-DEL-BCB-006` – UAT:** Pflichtfälle, Evidence und Defect-/Retest-Regel sind geplant; kein Fall ist im aktuellen Pilot bestanden.

### Betrieb und Abschluss

- **`UABC-DEL-BCB-007` – Cutover und Hypercare:** Entry-/Exit-, Rollback- und Restartkriterien sind geplant; Cutover und Hypercare sind nicht gestartet.
- **`UABC-DEL-BCB-008` – Monatsabschluss und VAT:** Sollwerte und Nichtübermittlungsgrenze werden vorbereitet; Abschluss und VAT-Readback sind offen.
- **`UABC-DEL-BCB-009` – Dokumentation und Handover:** Projekt- und Supportdokumentation werden aufgebaut; Supportannahme und Simulationsabnahme stehen aus.

## Messbare spätere Abnahme

Eine Simulationsabnahme erfordert ausgeführte und differenzfreie Setup-, Daten-, Prozess-, UAT-, Cutover-, Hypercare- und Handover-Nachweise sowie keine ungeklärten P1/P2-Befunde. Spectra-, Snapshot- und Twin-Integrität sind zusätzliche technische Gates. Aktuell sind diese fachlichen Exit-Kriterien nicht erfüllt.

## Annahmen und Change-Regel

- Der 80-Stunden-/9.600-EUR-Wert ist ein Plan, kein Istabschluss.
- Gesellschaft, Konten, Steuerlogik, Daten, Rollen, Resetpunkt, Sandbox und Termine werden vor Ausführung belegt.
- Ein Wunsch außerhalb der Standardbaseline benötigt Auswirkung, Aufwand, Entscheidung und Change-Freigabe; Schweigen erweitert den Scope nicht.

## Referenzen

- [Aktiver Angebotsstand](../../../docs/offers/bc-basic-offer.md)
- [Kanonische Projektstory](../../../evidence/simulation/project-story.json)
- [Lieferregister](../../../project/bc-basic/deliverables.yaml)
- [Plan-/Ist-Abgleich](../../../evidence/simulation/project-reconciliation.json)
- [Historische Referenzsimulation](99-archive.md)

<!-- story-metadata {"id":"PAGE-UABC-130","title":"02 Business Central","parent":null,"version":6,"status":"published"} -->
