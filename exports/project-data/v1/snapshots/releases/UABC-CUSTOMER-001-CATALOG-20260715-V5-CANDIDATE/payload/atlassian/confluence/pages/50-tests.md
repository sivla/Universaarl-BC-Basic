---
id: UABC-TESTS
title: 03.1 Test und Abnahme
parent: UABC-BCBSTORY
owners:
  - P-002
  - P-005
  - P-011
  - P-019
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 9
storyPageId: PAGE-UABC-060
purpose: Beschreibt die noch auszuführende Test-, UAT- und Abnahmestrecke des
  aktuellen Piloten.
audience:
  - Key User
  - Projektleitung
  - Consultant
jiraRefs:
  - UABC-46
  - UABC-47
  - UABC-48
  - UABC-49
referenceIds:
  - UABC-REQ-BCB-007
  - UABC-REQ-BCB-008
  - UABC-REQ-BCB-009
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
version: 5
---

# 03.1 Test und Abnahme

## Aktueller Stand

Der aktuelle Playthru-Pilot beginnt auf einer unveränderten Standard-CRONUS-Demo-Baseline. `pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending`. Wave 0, Setup, Prozessproben, UAT, Cutover und Hypercare sind noch nicht ausgeführt. `GO_SIMULATION` ist für den aktuellen Pilot nicht erreicht.

Planwerte und Referenzdaten sind keine Ausführungsevidence. Eine technische Firmenbezeichnung oder URL belegt weder die BC-Basic-Einrichtung noch einen bestandenen Test.

## Noch auszuführende Teststrecke

1. **Wave-0-Preflight:** interne Company-ID, technischer Name, Name, Display Name, Standard-CRONUS-Provenienz, Zielentscheidung und Reset-/Neuaufsetzentscheidung lesen und belegen.
2. **Setup-Readback:** ausschließlich separat autorisierte Änderungen je Feld gegen den Sollvertrag lesen; bei Abweichung gilt der zugeordnete Stopcode.
3. **Prozessprobe:** Einkauf, Verkauf, Lager und Finance erst nach abgeschlossenem Setup-Gate mit kontrollierten Testdaten ausführen.
4. **UAT:** Die zugeordnete Fachrolle führt den Fall selbst aus und erklärt Ergebnis, Kontrollwerte und Eskalationsgrenze.
5. **Cutover-Gate:** kein offener P1/P2, vollständige aktuelle Evidence, belastbarer Resetpunkt und ausdrückliche Simulationsentscheidung.

## Abnahmeregeln

- Ein Fall bleibt `planned`, bis Startzustand, Schritte, Sollwerte, Readback, Fehlerweg, Resetreferenz und Rollenabnahme aus dem aktuellen Lauf belegt sind.
- P1 oder P2 stoppt das Gate; ein Retest zählt erst nach dokumentierter Korrektur und neuer Evidence.
- Steuer-, Bank- oder Produktivübermittlungen sind ausgeschlossen.
- Es wird keine reale Kundenfreigabe behauptet. Eine spätere Abnahme ist als belegte Simulationsabnahme zu kennzeichnen.

## Historische Referenz

Der frühere, vollständig repositorybasierte Referenzlauf bleibt ausschließlich als `historical-reference-simulation` mit `currentAuthority=false` im [Archiv](99-archive.md) nachvollziehbar. Dessen internes `GO_SIMULATION` trägt weder Ticketstatus noch Iststunden, Readiness oder Abnahme des aktuellen Piloten.

## Referenzen

- [Aktive Projektstory](bc-basic-project-story.md)
- [Setup-Wave-1-Laufplan](../../../evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml)
- [UAT-Katalog](../../../project/bc-basic/uat-catalog.yaml)
- [Projektarchiv](99-archive.md)

<!-- story-metadata {"id":"PAGE-UABC-060","title":"03.1 Test und Abnahme","parent":"PAGE-UABC-150","version":5,"status":"published"} -->
