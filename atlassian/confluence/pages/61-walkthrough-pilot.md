---
id: UABC-WALKTHROUGH
title: 03.2 Cutover und Go-live
parent: UABC-BCBSTORY
owners:
  - P-001
  - P-002
  - P-005
  - P-016
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 10
storyPageId: PAGE-UABC-080
purpose: Plant Mock-Cutover, Simulationsabnahme, Rollback und Wiederanlauf,
  ohne ein erreichtes GO oder einen Produktivstart zu behaupten.
audience:
  - Steering
  - Projektleitung
  - Key User
  - Support
jiraRefs:
  - UABC-46
  - UABC-47
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-008
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
version: 5
---

# 03.2 Cutover und Go-live

## Aktueller Status

Cutover und Simulationsabnahme sind **nicht erreicht**. `UABC-BASIC-DE` ist eine CRONUS-Demo-Ausgangsbasis; Setup, Daten, Prozesse, UAT und Training stehen aus. Ein Produktivstart ist nicht Bestandteil dieses Piloten.

## Eintrittskriterien

- Wave-0 belegt interne Company-ID, Namen, CRONUS-Provenienz, Zielentscheidung und Resetpunkt.
- Setup-, Stamm- und Eröffnungswelle sind autorisiert, ausgeführt und abgestimmt.
- UAT-Fälle und Rollenpfade sind mit aktueller Evidence bestanden.
- P1 = 0 und P2 = 0; Owner, Zeitplan, Freeze und Supportweg sind belegt.
- Rollback und Wiederanlauf besitzen einen konkret geprüften Ausgangspunkt.

Keines dieser Gates wird durch die abgelöste Referenzsimulation automatisch erfüllt.

## Geplante Generalprobe

1. Freeze und zulässige Änderungen bestätigen.
2. Umgebung, Company-ID, technischen Namen, Rolle, Sprache und Arbeitsdatum lesen.
3. Resetpunkt und freigegebene Kontrollsummen prüfen.
4. Setup-, Stamm- und Eröffnungswelle abstimmen.
5. P2P, O2C, Lager, Monatsabschluss und VAT-Vorschau mit Soll-/Ist-Readback prüfen.
6. Offene Defects, Rollen, Restart und Supportfähigkeit bewerten.
7. Eine belegte Simulationsabnahme entscheiden; ohne Evidence bleibt das Gate NO-GO.
8. Ergebnis, Abweichungen und nächsten Schritt versioniert sichern.

## Abbruch, Rollback und Wiederanlauf

Abbruch gilt bei falscher Gesellschaft, fehlender Rücksetzbarkeit, unklarer Finanz-/VAT-/Bestandswirkung, unstimmigen Kontrollsummen oder offenem P1/P2. Es erfolgt keine weitere Aktion. Rollback und Wiederanlauf dürfen erst nach konkret belegtem Resetpunkt ausgeführt werden.

## Gate-Ergebnis

Aktuell gilt `NO_GO_SIMULATION`: `writesAuthorized=false`, RUN-06 bis RUN-22 bleiben gesperrt und die drei Setup-Pakete stehen bei 0/0/0. Es existiert weder eine Steering-Freigabe noch eine Kundenabnahme.

## Referenzen

- [Aktuelle Projektstory](../../../evidence/simulation/project-story.json)
- [Setup-Wave-Run-Plan](../../../evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml)
- [Handover-Plan](../../../docs/handover/bc-basic-handover.md)
- [Historische Referenzsimulation](99-archive.md)

<!-- story-metadata {"id":"PAGE-UABC-080","title":"03.2 Cutover und Go-live","parent":"PAGE-UABC-150","version":5,"status":"published"} -->
