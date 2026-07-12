---
id: UABC-COMPANY
title: 01 Unternehmen
parent: UABC-PROJECT
owners: [P-001, P-005, P-011, P-019]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 1
storyPageId: PAGE-UABC-010
purpose: Beschreibt das synthetische Unternehmen, seine Rollen, Volumina und Wertströme.
audience: [Sponsor, Projektleitung, Fachbereich]
jiraRefs: [UABC-22, UABC-23, UABC-24, UABC-25]
referenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-003, UABC-REQ-BCB-006, UABC-REQ-BCB-009]
lastReviewed: 2026-09-03
---

# 01 Unternehmen

## Unternehmensprofil

Der Referenzfall bildet eine kleine deutsche Handelsgesellschaft ab.
Das Unternehmensmodell ist absichtlich schlank, damit Finance, Einkauf, Verkauf, Zahlung, Lager und Monatsabschluss ohne kundenspezifische Erweiterung Ende zu Ende demonstriert werden können.

## Betriebsmodell und Gültigkeit

Das Betriebsmodell ist synthetisch abgestimmt und durchgängig mit den Daten-, Prozess- und Buchungsnachweisen verbunden. Es ist ein realistisches Standardmuster, keine Aussage über eine reale Universaarl-Gesellschaft.

## Organisation, Wertströme und Volumina

### Geschäftsmodell und Organisation

`UABC-BASIC-DE` handelt technische Standardartikel in Euro. Verwaltung und Buchhaltung arbeiten am Hauptsitz; Waren werden über den einfachen Lagerort `HAUPT` ohne Lagerplätze, Chargen oder Seriennummern geführt.

| Merkmal | Synthetische Ausprägung | Projektwirkung |
|---|---|---|
| Gesellschaft | eine deutsche Handelsgesellschaft | keine Konsolidierung oder Intercompany-Prozesse |
| Geschäftsjahr | Kalenderjahr, Basiswährung EUR | einfacher Monats- und Periodenabschluss |
| Stammdatenziel | 20 Debitoren, 12 Kreditoren, 12 Artikel | schlanke, kontrollierbare Migration |
| Monatsvolumen | 55 Verkaufs- und 35 Einkaufsrechnungen | BC-Standardbelege ohne EDI reichen aus |
| Zahlungen | 40 Eingänge und 30 Ausgänge | manuelle Abstimmung als Standardweg |
| Lagerbewegungen | etwa 150 pro Monat | Basislager ohne erweitertes Warehouse |

### Wertströme

1. **Purchase-to-Pay:** Bestellung, Wareneingang, Eingangsrechnung, Zahlung und Kreditorenausgleich.
2. **Order-to-Cash:** Verkaufsauftrag, Lieferung, Ausgangsrechnung, Mahnprobe, Zahlung und Debitorenausgleich.
3. **Cash und Bank:** synthetischer Kontoauszug, Zuordnung, Differenzbehandlung und Abstimmung.
4. **Lager:** Zugang, Abgang, Zählung, Inventurdifferenz und Wertabgleich.
5. **Finance:** Nebenbuchkontrollen, Hauptbuch, VAT-Vorschau und Periodenprüfung.

### Referenzgeschäftsfälle und Kontrollwerte

- Der Einkaufsfall umfasst zehn Stück zu 42,00 EUR: 420,00 EUR netto, 79,80 EUR Vorsteuer und 499,80 EUR brutto.
- Der Verkaufsfall umfasst zehn Stück zu 79,00 EUR: 790,00 EUR netto, 150,10 EUR Umsatzsteuer und 940,10 EUR brutto.
- Der Endbestand beträgt nach Zugang, Abgang und Inventurdifferenz 99 Stück beziehungsweise 4.158,00 EUR.
- Der synthetische Bankschlusssaldo beträgt 5.440,30 EUR; die VAT-Zahllast der Prozessfälle beträgt 70,30 EUR.

### Verantwortungsmodell

Finance kontrolliert Haupt- und Nebenbücher, Handel verantwortet Belege und Partnerposten, Lager kontrolliert Mengen und Werte.
Die Datenrolle liefert und bereinigt Vorlagen. Sponsor und Projektleitung entscheiden Gates, ohne operative Aufgaben in Personalunion zu übernehmen.

## Kundenspezifisch zu bestätigen

- **Synthetisch entschieden:** eine Gesellschaft, ein Lagerort, EUR, Kalenderjahr, FIFO, einfache Zahlungs- und Mahnlogik sowie Standardreporting.
- **Kundenspezifisch zu bestätigen:** reales Geschäftsmodell, Volumina, Standorte, Rollen, Freigabegrenzen, Bankverfahren, Reporting und gesetzliche Anforderungen.
- Erweiterte Lagerlogik, Fremdwährung, Produktion, Projekte, Service, Konsolidierung und Integrationen bleiben außerhalb des BC-Basic-Standards.

## Referenzen

- [Synthetische Gesellschaftsbaseline](../../../project/bc-basic/customer-templates/example/company-setup.example.yaml)
- [Volumina, Migrationsobjekte und Datenregeln](../../../project/bc-basic/data-package.yaml)
- [Beleg- und Postenketten](../../../evidence/simulation/bc-playthrough-ledger.yaml)
- Der Prozessumfang ist mit den Tickets `UABC-23` und `UABC-24` verbunden.

<!-- story-metadata {"id":"PAGE-UABC-010","title":"01 Unternehmen","parent":"PAGE-UABC-000","version":4,"status":"published"} -->
