---
id: UABC-WALKTHROUGH
title: 08 Cutover und Go-live
parent: UABC-PROJECT
owners: [P-001, P-002, P-005, P-016]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 8
storyPageId: PAGE-UABC-080
purpose: Beschreibt Mock-Cutover, GO_SIMULATION, simulierten Go-live, Rollback und Wiederanlauf.
audience: [Steering, Projektleitung, Key User, Support]
jiraRefs: [UABC-46, UABC-47, UABC-50]
referenceIds: [UABC-REQ-BCB-002, UABC-REQ-BCB-008, UABC-REQ-BCB-010]
lastReviewed: 2026-09-03
---

# 08 Cutover und Go-live

## Ziel und Eingangskriterien

Der Cutover ist als repositorybasierte Generalprobe vom Datenfreeze bis zum Supportstart durchgespielt.
Er verwendet ausschließlich synthetische Daten und Belege und wird deshalb als simulierter Go-live, niemals als Produktivstart, bezeichnet.

## Cutover- und GO-Entscheidung

Mock-Cutover, `GO_SIMULATION`, simulierter Go-live und Wiederanlauf sind synthetisch bestanden. P1/P2 waren am Gate geschlossen, Kontrollen differenzfrei und der Rollbackweg nachvollziehbar.

## Eintrittskriterien

- Scope und sieben Kundenentscheidungsbereiche sind synthetisch bestätigt.
- Setup-, Stamm- und Eröffnungswelle sind vollständig und abgestimmt.
- Sieben UAT-Fälle und vier Rollenpfade sind bestanden.
- P1 = 0 und P2 = 0; Evidence, Owner, Zeitplan und Kommunikationsweg sind vorhanden.
- Freeze, Rücksetzpunkt, Abbruchkriterien und Supportweg sind erklärt.

## Operative Generalprobe

1. **Freeze erklären:** ab dem vereinbarten Zeitpunkt keine unkontrollierten Daten- oder Setupänderungen.
2. **Zielkontext prüfen:** Gesellschaft, Umgebung, Rolle, Sprache, Datum und erlaubte Operation bestätigen.
3. **Datenstand sichern:** freigegebene Vorlagen, Kontrollsummen und reproduzierbaren Ausgangspunkt festhalten.
4. **Finale Wellen prüfen:** Setup, Stammdaten, Eröffnungswerte und offene Posten in Reihenfolge abstimmen.
5. **Smoke-Test ausführen:** P2P, O2C, Cash/Bank, Lager, Monatsabschluss und VAT-Vorschau mit Referenzbelegen prüfen.
6. **Gate entscheiden:** Steering bewertet Kontrollen, offene Defects, Rollen, Restart und Supportstart.
7. **Go-live-Rehearsal durchführen:** Tagesstart, operative Fälle, Tageskontrolle und Übergabe an Hypercare simulieren.
8. **Evidence sichern:** Ergebnis, Abweichungen, Entscheidung und nächster Schritt versioniert referenzieren.

## Abbruch und Rollback

Abbruch gilt bei falscher Gesellschaft, fehlender Rücksetzbarkeit, unklarer Finanz-/VAT-/Bestandswirkung, unstimmigen Kontrollsummen oder offenem P1/P2. Der Zustand wird gesichert; es erfolgt keine weitere Buchungssimulation.

Der Rollback stellt den dokumentierten synthetischen Ausgangsstand wieder her, prüft IDs, Mengen, Salden und Referenzen und wiederholt den betroffenen Smoke-Test.
Eine reale BC-Sicherung oder Wiederherstellung wird nicht behauptet.

## Gate-Ergebnis und Wiederanlauf

Die synthetische Steering-Rolle entschied `GO_SIMULATION`. Maßgeblich waren differenzfreie Hauptbuchsummen, abgestimmte Nebenbücher, Bank und Lager, VAT-Zahllast 70,30 EUR, vollständige Evidence und null offene P1/P2.

Der simulierte Go-live erzeugte Tages- und Hypercare-Evidence, aber weder Produktivbuchungen noch externe Kommunikation, Bankdateien, E-Mails oder Steuerübermittlung.

## Reale Cutover-Parameter und Grenzen

- **Synthetisch entschieden:** Reihenfolge, Rollen, Entry/Exit, Abbruch, Rollback, Restart und `GO_SIMULATION`.
- **Im echten Projekt zu bestätigen:** Freezezeit, Produktionsgesellschaft, reale Migration, Restorepunkt, Benutzerrechte, Verantwortliche, Kommunikationskanäle und Supportzeiten.
- Ein reales Go-live ist außerhalb der Referenzsimulation und wird nicht aus ihrem grünen Status abgeleitet.

## Referenzen

- [Cutover- und Abschlussstatus](../../../evidence/simulation/project-completion.yaml)
- [UAT- und Trainingsgate](../../../project/bc-basic/uat-training-run.yaml)
- [Operativer Smoke-Test](../../../project/bc-basic/training-plan.yaml)
- [Wiederanlauf und Handover](../../../docs/handover/bc-basic-handover.md)
- [Chronologische Story](../../../docs/reports/bc-basic-project-chronicle.md)

<!-- story-metadata {"id":"PAGE-UABC-080","title":"08 Cutover und Go-live","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
