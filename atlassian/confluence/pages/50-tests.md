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
purpose: Fasst Teststrategie, sieben UAT-Fälle, Defectweg, Kontrollen und
  Abnahme zusammen.
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
lastReviewed: 2026-09-03
version: 5
---

# 03.1 Test und Abnahme

## Prüfzweck und Umfang

Die Teststrecke verbindet Setupprüfung, End-to-End-Playthrough, Defects, Retests und fachliche UAT. Jeder Fall nennt Rolle, Vorbedingung, Testdaten, erwartete Belege und Posten, Kontrollwerte, Evidence und Abbruchkriterium.

## Ergebnis und Gate-Entscheidung

Sieben UAT-Pflichtfälle sind in der Referenzsimulation synthetisch ausgeführt und abgenommen. Alle eingebrachten P1/P2-Befunde wurden korrigiert und retestet; am Simulations-GO sind P1 = 0 und P2 = 0 offen.

## Fälle, Kriterien, Abweichungen und Retests

### Teststufen

1. **Preflight:** Zielkontext, Datenqualität, Rollen, Setup und Rücksetzbarkeit.
2. **Prozessprüfung:** positive Belegkette plus Fehlerfall und Retest.
3. **Abstimmung:** Hauptbuch, Nebenbücher, Bank, VAT, Menge und Lagerwert.
4. **UAT:** Fachrolle führt ohne Hilfe aus und erklärt Ergebnis sowie Eskalationsgrenze.
5. **Cutover-Gate:** keine offenen P1/P2, Evidence vollständig, Restart geprüft.

### Sieben UAT-Pflichtfälle

- **`UABC-UAT-BCB-001` – Grundeinrichtung:** Zielgesellschaft, Periode, Nummernserie, Rolle und Buchungsgruppen sind konsistent.
- **`UABC-UAT-BCB-002` – P2P:** Bestellung über zehn Stück, Wareneingang und Rechnung 499,80 EUR werden als eine nachvollziehbare Beleg- und Buchungskette abgestimmt.
- **`UABC-UAT-BCB-003` – O2C:** Auftrag über zehn Stück, Lieferung und Rechnung 940,10 EUR werden mit Bestand, Forderung, Umsatz und Wareneinsatz abgestimmt.
- **`UABC-UAT-BCB-004` – Lager:** Ausgangsbestand von 100 Stück zu 4.200,00 EUR wird am Lagerort `HAUPT` gegen die freigegebene Datenvorlage geprüft.
- **`UABC-UAT-BCB-005` – Finance und Abstimmung:** Eröffnungsjournal sowie offene Debitoren- und Kreditorenposten werden gegen die Sammelkontenrollen abgestimmt.
- **`UABC-UAT-BCB-006` – Monatsabschluss:** Haupt- und Nebenbücher, Bank und Lager sind abgestimmt; Soll und Haben betragen je 11.080,20 EUR.
- **`UABC-UAT-BCB-007` – VAT-Vorschau:** 150,10 EUR Umsatzsteuer minus 79,80 EUR Vorsteuer ergibt 70,30 EUR Zahllast; keine Übermittlung erfolgt.

### Defect- und Retestweg

Ein Befund enthält Priorität, Auswirkung, Reproduktionsschritte, sichere Evidence, Ursache, Korrektur, Owner und Retest.
P1 stoppt das Gate sofort; P2 muss vor GO geschlossen sein. P3 kann nur mit dokumentierter Auswirkung in den Support-Backlog übergehen.

Die Simulation enthielt unter anderem eine fehlende VAT-Gruppe, einen Zahlungseingang ohne Ausgleichsreferenz und eine Lagerortabweichung. Jeder Fehler wurde korrigiert und mit denselben Kontrollwerten erneut geprüft.

Zahlung, Mahnprobe, Inventurdifferenz und Bankschlusssaldo sind ergänzende End-to-End- beziehungsweise Hypercare-Evidence. Sie erweitern nicht nachträglich die Akzeptanzschritte der sieben kanonischen UAT-Fälle.

### Fachliche Abnahme

Bestanden ist ein Fall nur, wenn die Fachrolle den positiven Ablauf ohne Hilfe ausführt, einen Fehler diagnostiziert, den Retest nachvollzieht und Belegstatus, Betrag, VAT, offene Posten oder Lagerwirkung erklären kann.

Der synthetische Sign-off ist ein vollständiges Prozessgate innerhalb der Simulation. Er ist keine reale Kundenabnahme und keine Evidence einer tatsächlichen BC-Buchung.

## Reale UAT-Wiederholung und Grenzen

- **Synthetisch bestanden:** sieben UAT-Fälle, Defect-Triage, Retests, Kontrollsummen und `GO_SIMULATION`.
- **Im echten Projekt zu wiederholen:** Benutzerrechte, Seitenverfügbarkeit, Posting Preview, tatsächliche Systemposten, Screenshots, Reset und Key-User-Sign-off.
- Reale Steuer-, Bank- oder Produktivübermittlung bleibt auch im echten UAT außerhalb des Testumfangs.

## Referenzen

- [UAT-Katalog und Abbruchkriterien](../../../project/bc-basic/uat-catalog.yaml)
- [Ausführungs- und Trainingslauf](../../../project/bc-basic/uat-training-run.yaml)
- [Beleg- und Postenkontrollen](../../../evidence/simulation/bc-playthrough-ledger.yaml)
- [P2P-/O2C-Defects und Retests](../../../evidence/simulation/phase-2-p2p-o2c.yaml)
- [Cash-, Lager- und Abschluss-Retests](../../../evidence/simulation/phase-3-cash-inventory-close.yaml)
- [Gesamtstatus](../../../evidence/simulation/project-completion.yaml)

<!-- story-metadata {"id":"PAGE-UABC-060","title":"03.1 Test und Abnahme","parent":"PAGE-UABC-150","version":5,"status":"published"} -->
