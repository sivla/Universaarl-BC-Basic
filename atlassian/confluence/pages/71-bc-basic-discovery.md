---
id: UABC-BCBDISCOVERY
title: 03 Prozesse und Fit-to-Standard
parent: UABC-PROJECT
owners: [P-002, P-005, P-011, P-016, P-019]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 3
storyPageId: PAGE-UABC-100
purpose: Dokumentiert Anforderungen, Standardabbildung, Fit/Gap und die notwendigen Kundenentscheidungen.
audience: [Projektleitung, Fachbereich, Solution Architect]
jiraRefs: [UABC-23, UABC-24, UABC-25, UABC-26]
referenceIds: [UABC-REQ-BCB-002, UABC-REQ-BCB-003, UABC-REQ-BCB-005, UABC-REQ-BCB-006, UABC-REQ-BCB-009]
lastReviewed: 2026-09-03
---

# 03 Prozesse und Fit-to-Standard

## Discovery-Ziel

Diese Seite verdichtet Discovery und Fit-to-Standard für `UABC-BASIC-DE`. Sie verbindet Geschäftsanforderungen mit dem BC-Standard und benennt bewusst, was ein echter Kunde noch fachlich, steuerlich oder in seiner Sandbox bestätigen muss.

## Fit-to-Standard-Entscheidung

Die drei fokussierten Workshops und sieben Entscheidungsbereiche sind als `GO_DISCOVERY_SIMULATION` abgeschlossen. Die Kernprozesse passen in BC Basic; kein V1-blockierender kundenspezifischer Gap blieb in der Referenzsimulation offen.

## Workshop-Ergebnisse und Prozessdesign

### Workshop 1 – Finance, VAT und Kontrollen

**Vorbereitung:** Kontenstruktur, Perioden, Steuerfälle, Zahlungsbedingungen, Dimensionen und Abschlussanforderungen bereitstellen.

**Teilnehmerrollen:** Finance Key User, Sponsor, Consultant und Datenverantwortung.

**Entscheidungsoutput:** SKR04-orientierte Kontenrollen, Buchungsgruppen `INLAND` und `HANDEL`, VAT-Gruppe `MWST19`, Dimensionen `KOSTENSTELLE` und `GESCHAEFT`, Kalenderjahr und Monatsabschlusskontrollen.

**Done:** Jede verwendete Buchungskombination löst auf; Konten-, VAT- und UStVA-Zuordnung bleiben für ein reales Projekt als fachlicher Bestätigungspunkt markiert.

### Workshop 2 – Einkauf, Verkauf, Cash und Lager

**Vorbereitung:** Belegarten, Mengen, Preise, Freigaben, Zahlung, Mahnung, Bankabstimmung, Lagerbewegungen und Ausnahmen beschreiben.

**Teilnehmerrollen:** Handel Key User, Lager Key User, Finance und Consultant.

**Entscheidungsoutput:** Standardbestellung und -auftrag, getrennte Wareneingangs-/Liefer- und Rechnungsbuchung, einfache Zahlungsanwendung, eine Mahnstufe ohne Gebühren sowie Lagerort `HAUPT` mit FIFO.

**Done:** P2P, O2C, Cash/Bank und Lager besitzen je positiven Fall, Abweichung, Korrektur, Retest und Kontrollsumme.

### Workshop 3 – Daten, UAT und Cutover

**Vorbereitung:** acht Vorlagenpaare, Quellen, Volumina, Owner, Qualitätsregeln, UAT-Rollen, Freeze und Rücksetzweg prüfen.

**Teilnehmerrollen:** Datenverantwortung, Finance, Handel, Lager, Sponsor und Consultant.

**Entscheidungsoutput:** drei Migrationswellen, zehn Objekte, sieben UAT-Fälle, vier Trainingspfade, Mock-Cutover, Restart und Hypercare-Exit.

**Done:** Das Entry-Gate für Setup und UAT ist fachlich passierbar; reale Tenant-, Benutzer- und Kundendaten bleiben sichtbar zu bestätigen.

### Fit-to-Standard nach Prozess

#### Finance und Monatsabschluss

- **Anforderung:** schlanke Buchhaltung mit Haupt-/Nebenbuchabgleich, Periodenkontrolle und VAT-Vorschau.
- **BC-Standard:** `General Ledger Setup`, `Accounting Periods`, `Posting Groups`, `VAT Entries` und Standardauswertungen.
- **Entscheidung:** Fit. Standardkontenrollen und sechs Buchungsmatrizen reichen für die Referenzfälle.
- **Grenze:** Kontonummern, Steuerkennzeichen und UStVA-Zuordnung benötigen Kunden- und Steuerreview. Owner: `P-005`.

#### Purchase-to-Pay

- **Anforderung:** Bestellung, Wareneingang, Rechnung, Fälligkeit, Zahlung und Ausgleich mit Abweichungsprüfung.
- **BC-Standard:** Purchase Order, Posted Purchase Receipt, Posted Purchase Invoice und Payment Journal.
- **Entscheidung:** Fit. Teilwareneingang, doppelte externe Belegnummer und Gutschrift bleiben Standardvarianten.
- **Grenze:** Freigabegrenzen und Zahlungsdatei sind Kundenparameter. Owner: `P-011` und `P-005`.

#### Order-to-Cash und Mahnung

- **Anforderung:** Auftrag, Lieferung, Rechnung, Zahlung, Ausgleich sowie eine einfache Mahnstufe.
- **BC-Standard:** Sales Order, Posted Sales Shipment, Posted Sales Invoice, Cash Receipt Journal und Reminders.
- **Entscheidung:** Fit. Die Mahnprobe erzeugt weder Gebühren noch Zinsen noch externe E-Mail.
- **Grenze:** Kreditlimit, Mahntext und Zustellweg sind Kundenparameter. Owner: `P-011`.

#### Cash und Bank

- **Anforderung:** Zahlungen anwenden, synthetischen Kontoauszug abstimmen und Differenzen erklären.
- **BC-Standard:** Payment Journal, Cash Receipt Journal, Payment Reconciliation Journal und Bank Acc. Reconciliation.
- **Entscheidung:** Fit für manuelle Zuordnung und Abstimmung; produktive Bankanbindung ist nicht enthalten.
- **Grenze:** Bankformat, Berechtigung und Freigabeweg werden in der Kundensandbox bestätigt. Owner: `P-005`.

#### Lager und Inventur

- **Anforderung:** ein Lagerort, Zugänge, Abgänge, Inventur und Wertabgleich ohne Tracking.
- **BC-Standard:** Item Journals, Item Ledger Entries, Value Entries und Physical Inventory.
- **Entscheidung:** Fit mit `HAUPT`, Einheit `STK`, FIFO und verbotener negativer Sollmenge.
- **Grenze:** weitere Lagerorte, Lagerplätze, Varianten, Serien oder Chargen sind Change oder Out-of-Scope. Owner: `P-019`.

### Sieben notwendige Entscheidungsbereiche

1. Gesellschaft, Scope und kommerzielle Baseline – Owner `P-001`.
2. Konten, Buchungsgruppen, VAT und Perioden – Owner `P-005`.
3. Dimensionen, Nummernserien und Standardreporting – Owner `P-005`.
4. Einkaufs-, Verkaufs- und Lagervarianten – Owner `P-011` und `P-019`.
5. Zahlung, Mahnung und Bankabstimmung – Owner `P-005`.
6. Datenquellen, Migration und Abstimmwerte – Owner `P-016`.
7. Rollen, UAT, Cutover, Restart und Supportstart – Owner `P-001` und `P-002`.

## Kundenentscheidungen und Bestätigungspunkte

- Die sieben Bereiche sind für die Referenzsimulation synthetisch entschieden und blockieren sie nicht.
- Ein echter Kunde bestätigt Werte, Personen, Freigaben, steuerliche Behandlung, Bankverfahren und Tenantverhalten vor dem Setup.
- Eine Abweichung wird als **Standard übernehmen**, **parametrisieren**, **Change** oder **Out-of-Scope** behandelt. Nicht belegte Wünsche werden nicht still in den Standard aufgenommen.

## Referenzen

- [Entscheidungsdetails und Owner](../../../project/bc-basic/decision-register.yaml)
- [Workshopverlauf und Actions](../meetings/UABC-MTG-001.md)
- [Use Cases und BC-Schritte](../../../project/bc-basic/bc-playthrough-catalog.yaml)
- [Daten- und Migrationsumfang](../../../project/bc-basic/data-package.yaml)
- [UAT- und Trainingsverknüpfung](../../../project/bc-basic/uat-training-run.yaml)

<!-- story-metadata {"id":"PAGE-UABC-100","title":"03 Prozesse und Fit-to-Standard","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
