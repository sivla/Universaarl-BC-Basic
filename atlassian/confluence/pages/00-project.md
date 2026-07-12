---
id: UABC-PROJECT
title: 00 Hilfe und Projektumgebung
parent: null
owners:
  - P-002
  - P-005
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 0
storyPageId: PAGE-UABC-000
purpose: Zentraler Einstieg in Projektumgebung, Supportweg und Wahrheitsgrenzen.
audience:
  - Projektleitung
  - Key User
  - Support
jiraRefs:
  - UABC-32
  - UABC-33
  - UABC-47
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-001
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-010
  - UABC-REQ-BCB-011
lastReviewed: 2026-09-03
version: 5
---

# 00 Hilfe und Projektumgebung

## Zweck und Schnellzugriff

Diese Seite ist der Einstieg in die kundenbezogene Projektwahrheit für die synthetische Gesellschaft `UABC-BASIC-DE`.
Sie führt zu Projektstatus, Supportweg und Betriebsinformationen, ohne Produktwissen oder interne Consultant-Anweisungen zu duplizieren.

## Aktueller Betriebs- und Supportstatus

Die Referenzsimulation ist als `V1_STANDARDPRODUCT_READY` und `GO_SIMULATION` abgeschlossen. Sie belegt einen vollständigen Dateiplaythrough, aber keinen Zugriff auf eine reale Business-Central-Instanz und keinen produktiven Betrieb.

Der Kundenprojekt-Space enthält ausschließlich synthetische Projekt- und Evidence-Daten. Zugangsdaten, reale Personen-, Bank- oder Steuerdaten und externe Freigaben sind nicht enthalten.

## Projektumgebung

| Bereich | Referenzsimulation | Reale Kundeninstanz |
|---|---|---|
| Gesellschaft | `UABC-BASIC-DE`, Universaarl GmbH | vor Projektstart eindeutig benennen |
| Umgebung | repositorybasierter Playthrough | rücksetzbare BC-Sandbox bestätigen |
| Lager | `HAUPT`, keine Lagerplätze | Code und Betriebsmodell bestätigen |
| Daten | ausschließlich synthetisch | freigegebene Kundenvorlagen verwenden |
| Externe Dienste | keine Bank-, E-Mail- oder ELSTER-Übermittlung | separat entscheiden und testen |

## Rollen und Verantwortung

- **Sponsor (`P-001`)** entscheidet Scope-, UAT-, Cutover- und Abschlussgates; die Rolle bucht nicht operativ.
- **Projektleitung und Consultant (`P-002`)** steuern Termine, Entscheidungen, Evidence und Eskalationen.
- **Finance Key User (`P-005`)** verantwortet Finanzkontrollen, Bankabstimmung, Abschluss und VAT-Vorschau.
- **Handel Key User (`P-011`)** verantwortet Einkauf, Verkauf, offene Posten und Prozessabnahme.
- **Datenverantwortung (`P-016`)** prüft Vorlagen, Mapping, Qualität und Abstimmwerte.
- **Lager Key User (`P-019`)** verantwortet Bestand, Inventur und Lagerkontrollen.

## Support- und Eskalationsweg

| Ausgang | Wann anwenden | Erwartete Reaktion |
|---|---|---|
| selbst korrigieren | reversibler Eingabefehler ohne Buchungswirkung | Wert korrigieren und Kontrolle wiederholen |
| Key User | Prozess- oder Stammdatenfrage | fachlich prüfen und dokumentieren |
| Consultant/Support | Setup-, Rollen- oder reproduzierbarer Systembefund | Diagnosepaket übernehmen und Retest steuern |
| sofortiger Buchungsstopp | falsche Gesellschaft oder unklare Finanz-, VAT-, Bestands- oder Datenschutzwirkung | nicht buchen, Zustand sichern, eskalieren |

Ein Supportfall nennt mindestens Rolle, Umgebung, Zeitpunkt, Seite und Aktion, Belegnummer, Soll/Ist, Fehlertext, Kontrollwerte, letzten erfolgreichen Schritt, Reproduktionsweg und sichere Evidence.

## Supportstart und Übergabe

Der Supportstart setzt das abgeschlossene Handover, benannte Ansprechpartner, einen getesteten Eskalationsweg und den Operator-Smoke-Test voraus.
Servicezeiten, reale Kontakte und Tenantdaten werden im echten Projekt bestätigt und nicht aus der Simulation abgeleitet.

## Bekannte Einschränkungen und erste Diagnosefragen

- **Synthetisch entschieden:** Rollenmodell, vierstufige Eskalation, Supportdiagnose und Trennung zwischen Simulation und produktiver Nutzung.
- **Vor einem realen Projekt zu bestätigen:** benannte Personen, Servicezeiten, Lizenz, Tenant, Sandbox, Zugriff, Datenschutzweg und Wiederherstellungspunkt.
- **Wahrheitsgrenze:** Die fehlende reale Instanz blockiert die abgeschlossene Simulation nicht; sie bleibt ein Entry-Kriterium für eine spätere Kundeninstanz.

## Referenzen

- [Projekt- und Phasenmodell](../../../project/bc-basic/project-plan.yaml)
- [Rollen, Training und Operator-Smoke-Test](../../../project/bc-basic/training-plan.yaml)
- [Hypercare-Exit und Handover](../../../evidence/simulation/project-completion.yaml)
- [Lesender Twin-Vertrag](../../../exports/project-data/v1/index.yaml)

<!-- story-metadata {"id":"PAGE-UABC-000","title":"00 Hilfe und Projektumgebung","parent":null,"version":5,"status":"published"} -->
