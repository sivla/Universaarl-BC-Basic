---
id: UABC-BCBDISCOVERY
title: 02.2 Prozesse und Fit-to-Standard
parent: UABC-BCBDELIVERABLES
owners:
  - P-002
  - P-005
  - P-011
  - P-016
  - P-019
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 7
storyPageId: PAGE-UABC-100
purpose: Plant Anforderungen, Standardabbildung, Fit/Gap und die noch offenen
  Kundenentscheidungen.
audience:
  - Projektleitung
  - Fachbereich
  - Solution Architect
jiraRefs:
  - UABC-34
  - UABC-35
  - UABC-36
  - UABC-37
  - UABC-38
  - UABC-33
referenceIds:
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-003
  - UABC-REQ-BCB-005
  - UABC-REQ-BCB-006
  - UABC-REQ-BCB-009
lastReviewed: 2026-07-13
version: 4
---

# 02.2 Prozesse und Fit-to-Standard

## Aktueller Stand

Discovery und Fit-to-Standard sind im laufenden Pilot noch nicht fachlich abgenommen. Die Gesellschaft `UABC-BASIC-DE` enthält eine unveränderte Microsoft-Standard-CRONUS-Demo-Baseline; technischer Name und URL belegen keine Kundenkonfiguration.

Wave 0 muss Company-ID, Namen, Standard-CRONUS-Provenienz, Resetpunkt und Zielentscheidung liefern, bevor ein Setup- oder Prozessfit als angewendet gelten darf.

## Geplante Workshops

### Finance, VAT und Kontrollen

Zu entscheiden sind Kontenrollen, Buchungsgruppen, VAT-Matrix, Dimensionen, Perioden, Zahlungsbedingungen und Abschlusskontrollen. Steuerkennzeichen bleiben bis zur fachlichen und steuerlichen Bestätigung offen. Das Ergebnis wird in Posting-Matrix, Solution Blueprint und Entscheidungsregister dokumentiert.

### Einkauf, Verkauf, Cash und Lager

Zu beschreiben sind Bestellung, Wareneingang, Rechnung, Auftrag, Lieferung, Zahlung, Ausgleich, Korrektur, Lagerbewegung, Inventur und Ausnahmewege. Jede Abweichung benötigt Owner, Sollzustand und Entscheidung.

Konten-, Beleg- oder Lagerwirkungen gelten erst nach einem später ausgeführten und gelesenen Prozesslauf als belegt.

### Daten, Rollen und Abnahme

Für jede Datenwelle werden Quelle, Owner, Pflichtfelder, Referenzregeln und Kontrollsummen festgelegt. Rollen, Funktionstrennung, UAT, Training, Cutover und Supportübergabe bleiben geplant. Eine historische Simulationsfreigabe ersetzt weder Kundenentscheidung noch Sandbox-Readback.

## Gate

Der Discovery-Exit bleibt offen, bis die Workshopentscheidungen, Steuerfragen, Datenowner und Wave-0-Zielentscheidung mit aktueller Evidence belegt sind. Ohne diese Nachweise bleiben Setup-Writes, Prozessläufe und `GO_SIMULATION` gesperrt.

## Historische Referenz

Der frühere repositorybasierte Discovery-Lauf ist ausschließlich als `historical-reference-simulation` mit `currentAuthority=false` im [Archiv](99-archive.md) nachvollziehbar. Er trägt nicht zu aktuellem Status, Iststunden oder Readiness bei.

## Referenzen

- [Aktuelles Entscheidungsregister](../../../project/bc-basic/decision-register.yaml)
- [Aktuelle Projektstory](bc-basic-project-story.md)
- [Setup-Wave-1-Laufplan](../../../evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml)
- [Archiv](99-archive.md)

<!-- story-metadata {"id":"PAGE-UABC-100","title":"02.2 Prozesse und Fit-to-Standard","parent":"PAGE-UABC-130","version":4,"status":"published"} -->
