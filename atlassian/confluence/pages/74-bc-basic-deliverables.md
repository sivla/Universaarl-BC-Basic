---
id: UABC-BCBDELIVERABLES
title: 02 Projektauftrag und Scope
parent: UABC-PROJECT
owners: [P-001, P-002, P-016]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 2
storyPageId: PAGE-UABC-130
purpose: Fasst Auftrag, Leistungsgrenze, kommerzielle Linie und neun Lieferobjekte zusammen.
audience: [Kunde, Vertrieb, Projektleitung]
jiraRefs: [UABC-22, UABC-26, UABC-38]
referenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-002, UABC-REQ-BCB-004, UABC-REQ-BCB-010, UABC-REQ-BCB-011]
lastReviewed: 2026-09-03
---

# 02 Projektauftrag und Scope

## Projektauftrag

Diese Seite erklärt das beauftragbare BC-Basic-Paket aus Kundensicht. Das kanonische Lieferregister bleibt `project/bc-basic/deliverables.yaml`; hier werden Leistungsversprechen, Abnahme und reale Parameter verständlich zusammengeführt.

## Kommerzielle Baseline und Status

Das aktuelle Standardangebot und der synthetische Ist-Abgleich umfassen jeweils 80 Stunden zu 120 EUR, also 9.600 EUR netto.
Die frühere Kalkulation mit 68 Stunden und 11.050 EUR ist als historische Baseline dokumentiert und nicht mehr das aktuelle Angebot.

`project-plan.yaml` bewahrt diese historische 18/40/10-Stunden-Phasenplanung als wiederverwendbare Vorlage. Die aktuelle 80-Stunden-Linie wird ausschließlich durch Angebotsversionen und die 17 Ticket-Worklogs belegt; beide Sichten werden nicht addiert.

Die Simulation ist vollständig abgeschlossen. Sie erzeugt weder Rechnung noch Zahlung noch Anspruch auf produktive Leistung.

## Umfang, Lieferobjekte und Abnahme

### Leistungsumfang

Im Scope liegen Projektstart, drei fokussierte Discovery-Workshops, Fit-to-Standard, Finanz- und Prozessdesign und kontrollierte Datenmigration.
Hinzu kommen Basiseinrichtung, sieben UAT-Fälle, vier Rollenpfade, Mock-Cutover, Restart, drei Hypercaretage und Handover.

Die operative Einführung folgt dem kürzesten Standardweg:

1. Angebot und Kundenvorbereitung.
2. Discovery und notwendige Entscheidungen.
3. Setup und drei Migrationswellen.
4. Prozessprüfung, UAT und Befähigung.
5. Mock-Cutover, Go-live-Rehearsal und Hypercare.
6. Abschluss und Supportübergabe.

### Leistungsgrenzen

Nicht enthalten sind AL-Entwicklung, individuelle Reports oder Layouts, Integrationen, Dataverse, produktive Bankanbindung, erweitertes Lager, Produktion, Projekte, Service, Konsolidierung, historischer Vollimport und E-Rechnung.

Steuer- und Rechtsberatung, GoBD-Garantie, Lizenzen, Tenantkosten, reale UStVA- oder Bankübermittlung und produktiver Betrieb sind ebenfalls ausgeschlossen. Abweichungen werden als Parameter, Change oder Out-of-Scope entschieden.

### Neun Lieferobjekte

#### Auftrag, Discovery und Daten

- **`UABC-DEL-BCB-001` – Projektauftrag:** Scope, Rollen, Fast-Track und Gates sind simuliert abgenommen. Reale Namen, Termine und Vertragsentscheidung bleiben Kundenparameter. Owner: `P-002`.
- **`UABC-DEL-BCB-002` – Fit-to-Standard:** Prozesse und sieben Entscheidungsbereiche sind entschieden. Reale Konten-, Steuer-, Bank- und Lagerwerte müssen bestätigt werden. Owner: `P-002`.
- **`UABC-DEL-BCB-003` – Datenpaket:** acht Vorlagenpaare und zehn Migrationsobjekte sind in drei Wellen geprüft. Reale Quellen, Mengen und Salden bleiben Kundenparameter. Owner: `P-016`.

#### Einrichtung, Befähigung und UAT

- **`UABC-DEL-BCB-004` – Standardkonfiguration:** Setupfolge, Buchungsmatrizen und SoD-Baseline sind synthetisch geprüft. Tenantfelder, Apps und Permission Sets werden in der Kundensandbox bestätigt. Owner: `P-002`.
- **`UABC-DEL-BCB-005` – Training:** vier Rollenpfade enthalten positiven Fall, Fehler, Retest und Kompetenzregel. Reale Benutzer absolvieren diese Übungen mit ihren Berechtigungen. Owner: `P-002`.
- **`UABC-DEL-BCB-006` – UAT:** sieben Pflichtfälle sind synthetisch bestanden, Evidence ist vollständig und P1/P2 sind geschlossen. Reale Key User wiederholen die Fälle in der Sandbox. Owner: `P-002`.

#### Betrieb und Abschluss

- **`UABC-DEL-BCB-007` – Cutover und Hypercare:** Generalprobe, Restart und drei Hypercaretage sind abgeschlossen. Reale Freezezeit, Restorepunkt und Kontakte werden neu bestätigt. Owner: `P-005`.
- **`UABC-DEL-BCB-008` – Monatsabschluss und VAT:** Die Vorschau weist 70,30 EUR Zahllast aus und wurde nicht übermittelt. Steuerkennzeichen und UStVA-Zuordnung benötigen fachliche Bestätigung. Owner: `P-005`.
- **`UABC-DEL-BCB-009` – Dokumentation und Handover:** Supportdiagnose, Projektdokumentation und Twin-Ausgabe sind vollständig. Betreiber, Servicezeiten und Produktionsannahme bleiben reale Parameter. Owner: `P-002`.

### Messbare Abnahme

`V1_STANDARDPRODUCT_READY` setzt 80 Stunden und 9.600 EUR, sieben Entscheidungen, acht Vorlagenpaare, drei Migrationswellen, sieben UAT-Fälle, vier Operatorpfade, neun Lieferobjekte und null offene P1/P2 voraus.

Zusätzlich müssen Buchungs- und Abstimmkontrollen differenzfrei, Cutover und Restart bestanden und drei Hypercaretage abgeschlossen sein.
Spectra-, Snapshot- und Twin-Vertrag müssen ebenfalls validiert sein. Diese Kriterien sind für die Referenzsimulation erfüllt.

## Annahmen, Mitwirkung und Change-Regel

- Das 80-Stunden-Angebot zu 9.600 EUR ist die aktuelle kommerzielle Produktbaseline; die 68-Stunden-Kalkulation bleibt historische Evidence.
- Reale Gesellschaft, Konten, Steuerlogik, Daten, Rollen, Sandbox und Termine werden vor dem Setup als Entry-Gate bestätigt.
- Ein Kundenwunsch außerhalb der Standardbaseline benötigt Auswirkung, Aufwand, Entscheidung und Change-Freigabe; Schweigen erweitert den Scope nicht.

## Referenzen

- [Angebot und Versionsverlauf](../../../docs/offers/bc-basic-offer.md)
- [Historische 68-Stunden-Planvorlage und Entry-Kriterien](../../../project/bc-basic/project-plan.yaml)
- [Lieferregister und Evidence](../../../project/bc-basic/deliverables.yaml)
- [Aktueller 80-Stunden-Angebots-/Ist-Abgleich](../../../evidence/simulation/project-reconciliation.json)
- [Synthetische Abrechnungskontrolle](../../../evidence/simulation/billing-reconciliation.yaml)

<!-- story-metadata {"id":"PAGE-UABC-130","title":"02 Projektauftrag und Scope","parent":"PAGE-UABC-000","version":4,"status":"published"} -->
