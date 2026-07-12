---
id: UABC-BCBPROJECT
storyPageId: PAGE-UABC-090
title: 00 BC Basic Standardprodukt
parent: null
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 0
purpose: Einstieg und Leistungsrahmen des wiederverwendbaren BC-Basic-Standardprodukts
audience: Vertrieb, Projektleitung, Consultant und Solution Architecture
owners: [P-002]
version: 3
status: published
jiraRefs: [UABC-18, UABC-19, UABC-20, UABC-21]
referenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-002, UABC-REQ-BCB-004]
lastReviewed: 2026-09-03
---

# 00 BC Basic Standardprodukt

## Produktnutzen und Zielgruppe

Dieses Produktbuch beschreibt das wiederverwendbare BC-Basic-Paket unabhängig von einer einzelnen Kundeninstanz. Projektspezifische Entscheidungen, Stammdaten und Evidence verbleiben im jeweiligen Kundenprojekt-Space.

## Leistungsversprechen und Reifegrad

Das Standardprodukt folgt einem schlanken Einführungsweg: vorbereiten, drei fokussierte Workshops durchführen, Standard konfigurieren, Daten migrieren und UAT abschließen.

Cutover und Hypercare stabilisieren anschließend den Betrieb. Der Produktstandard ist veröffentlicht; reale Tenant-, Steuer- und Kundendaten werden je Projekt parametrisiert.

## Leistungsumfang

BC Basic befähigt eine Gesellschaft mit überschaubarem Finance-, Handels- und Lagerumfang zur sicheren Nutzung der BC-Standardprozesse. Im Kern enthalten sind:

- Finanzbuchhaltung, Debitoren, Kreditoren und Periodenabschluss;
- Purchase-to-Pay und Order-to-Cash;
- Zahlung, Ausgleich und Bankabstimmung;
- einfacher Bestand mit einem oder wenigen Lagerorten;
- Rollen- und Funktionstrennung, Datenmigration, UAT und Training;
- Mock-Cutover, Go-live-Begleitung, Hypercare und Betriebsübergabe.

## Voraussetzungen

Vor dem Setup müssen Sponsor und Prozessverantwortliche benannt, eine geeignete BC-Sandbox verfügbar und die minimalen Datenlieferungen terminiert sein.

Konten, VAT-/USt-Logik, Bankverfahren, Benutzerrollen und rechtliche Anforderungen werden vom Kunden beziehungsweise dessen fachlich zuständigen Stellen bestätigt.

## Standardvorgehen

1. Angebot und Projektgrenzen bestätigen.
2. Kundenvorbereitung und drei Entscheidungsworkshops durchführen.
3. Standardkonfiguration und Datenwellen vorbereiten.
4. Prozesse, Kontrollen und UAT in der Sandbox nachweisen.
5. Rollen praktisch befähigen und den Mock-Cutover durchführen.
6. Go-live und Hypercare nach vereinbarten Exit-Kriterien begleiten.

## Erweiterungsgrenzen

Erweiterte Lagerlogistik, Produktion, Service, Projekte, Intercompany, kundenspezifische Extensions und komplexe Integrationen gehören nicht automatisch zum Basispaket.

Das gilt auch für produktive Bank- oder Steuerübermittlung sowie Rechts- und Steuerberatung. Abweichungen werden als Parametrisierung, Change oder Out-of-Scope eingeordnet.

## Produktpflege und projektbezogene Parameter

- Der Produktstandard folgt „Standard vor Sonderlösung“; Abweichungen benötigen einen belegten Geschäftsnutzen.
- Preise, Zeitrahmen und konkrete Liefertermine werden im Kundenangebot versioniert und nicht aus einem Referenzprojekt übernommen.
- Tenant-Berechtigungen, Lokalisierungsfunktionen und gesetzliche Einstellungen bleiben je Kundeninstanz zu bestätigen.

## Referenzen

- [Prozess- und Konfigurationsstandard](31-processes.md)
- [Lieferpaket, Tests und Standardtraining](81-bc-basic-handover.md)
- [Cutover, Hypercare, Betrieb und Erweiterungsgrenzen](73-bc-basic-hypercare.md)
- [Internes Consultant-Handbuch](30-blueprint.md)

<!-- story-metadata {"id":"PAGE-UABC-090","parent":null,"version":3,"status":"published"} -->
