---
id: UABC-HYPERCARE
title: 04 Handbuecher
parent: null
owners:
  - P-002
  - P-005
  - P-011
  - P-019
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 4
storyPageId: PAGE-UABC-170
purpose: Plant die spätere Befähigung operativer Rollen für Alltag, Kontrolle,
  Fehlerdiagnose und Eskalation.
audience:
  - Key User
  - Endanwender
  - Trainer
  - Support
jiraRefs:
  - UABC-45
  - UABC-46
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-007
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
version: 5
---

# 04 Handbuecher

## Aktueller Stand

Training und Kompetenznachweise sind im aktuellen Pilot nicht ausgeführt. Die Standard-CRONUS-Demo-Baseline ist nicht pilotisch eingerichtet; deshalb können weder Rollenpfade noch Prozess- oder Supportkompetenz als bestanden gelten.

Teilnehmer, Berechtigungen, Seiten, Testdaten und Resetpunkt sind vor der Durchführung aktuell zu belegen.

## Geplante Lernfolge

1. Zielgesellschaft, Benutzerrolle, Arbeitsdatum und Sicherheitsgrenze lesen.
2. Der Trainer zeigt einen freigegebenen positiven Fall und den zugehörigen Kontrollpunkt.
3. Die Rolle führt denselben Fall begleitet und anschließend ohne Hilfe aus.
4. Die Rolle diagnostiziert einen kontrollierten Fehler, wählt den richtigen Stop- oder Eskalationsweg und führt erst nach Korrektur einen Retest aus.
5. Teilnahme, Ergebnis, offene Fragen und Kompetenzentscheidung werden je Rolle als aktuelle Evidence dokumentiert.

## Rollenpfade

- **Administration:** Zielkontext, Navigation, Nummernserien, Perioden und Berechtigungsgrenzen.
- **Finance:** Journale, Nebenbuchabstimmung, Monatsabschlussprobe und UStVA-Vorschau ohne Übermittlung.
- **Einkauf und Verkauf:** Belegketten, Mengen, Preise, Abweichungen und Postenkontrolle.
- **Lager:** Artikel, Lagerort, Mengen-, Inventur- und Wertkontrolle.

## Eskalation und Abnahme

Reversible Eingabefehler vor Buchung dürfen innerhalb der eigenen Rolle korrigiert werden. Prozessfragen gehen an den Key User; Setup-, Berechtigungs- oder wiederholte Systembefunde an Consultant/Support. Falsche Gesellschaft oder unklare Finanz-, VAT-, Bestands- oder Datenschutzwirkung erzwingt sofortigen Stopp.

Ein Rollenpfad gilt erst mit aktueller Teilnahme, selbstständiger Ausführung, erklärtem Kontrollwert, dokumentiertem Fehlerweg und bestandenem Retest als abgenommen. Planungsdokumente und historische Simulationsevidence ersetzen diese Nachweise nicht.

## Historische Referenz

Die früheren synthetischen Rollenpfade sind ausschließlich als `historical-reference-simulation` mit `currentAuthority=false` im [Archiv](99-archive.md) erhalten. Sie speisen keine aktuelle Kompetenz-, UAT- oder Handover-Aussage.

## Referenzen

- [Aktueller Schulungsplan](../../../project/bc-basic/training-plan.yaml)
- [Aktueller UAT-Katalog](../../../project/bc-basic/uat-catalog.yaml)
- [Aktuelle Test- und Abnahmestrecke](50-tests.md)
- [Aktueller Handover-Plan](../../../docs/handover/bc-basic-handover.md)

<!-- story-metadata {"id":"PAGE-UABC-170","title":"04 Handbuecher","parent":null,"version":5,"status":"published"} -->
