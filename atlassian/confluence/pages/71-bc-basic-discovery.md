---
id: UABC-BCBDISCOVERY
title: Discovery und Fit-to-Standard
parent: UABC-BCBPROJECT
owners: [P-002, P-005, P-011, P-016, P-019]
status: Synthetisch abgenommen
jiraRefs: [UABC-19, UABC-22, UABC-23, UABC-24, UABC-25, UABC-26]
referenceIds: [UABC-REQ-BCB-002, UABC-REQ-BCB-003, UABC-REQ-BCB-005, UABC-REQ-BCB-006, UABC-REQ-BCB-009]
lastReviewed: 2026-08-21
---

# Discovery und Fit-to-Standard

Diese Seite ist das kundenverwendbare Ergebnis der repositorybasierten Discovery. Alle Aussagen beziehen sich auf die synthetische Gesellschaft `UABC-BASIC-DE`. Die Entscheidungen sind innerhalb der Simulation verbindlich und wurden in `UABC-MTG-001` synthetisch abgenommen. Vor einer echten Einführung werden Unternehmensparameter, Steuer-/Rechtsfragen und die Ausführung in einer realen BC-Sandbox erneut bestätigt.

## Unternehmens- und Betriebsmodell

| Bereich | Synthetische Vorgabe | Planungsrelevanz |
|---|---|---|
| Gesellschaft | Eine deutsche Handelsgesellschaft, Basiswährung EUR, Geschäftsjahr Kalenderjahr | Keine Konsolidierung, Intercompany- oder Fremdwährungsbewertung |
| Standorte | Verwaltung und Buchhaltung am Hauptsitz; ein Lagerort `HAUPT` ohne Lagerplätze | Einfacher Wareneingang, Versand und Inventur; kein erweitertes Lager |
| Rollen | Sponsor `P-001`, Consultant/PM `P-002`, Finance `P-005`, Einkauf/Verkauf `P-011`, Daten `P-016`, Lager `P-019` | Funktionstrennung zwischen Einrichtung, Buchung, Zahlung und Kontrolle wird im Rollendesign berücksichtigt |
| Volumen | monatlich ca. 35 Einkaufsrechnungen, 55 Verkaufsrechnungen, 40 Zahlungseingänge, 30 Zahlungsausgänge und 150 Lagerbewegungen; 12 aktive Artikel, 20 Debitoren, 12 Kreditoren | Standardbelege und manuelle Abstimmung sind ausreichend; keine Stapel-/EDI-Integration erforderlich |
| Belege | Angebot, Verkaufsauftrag, Lieferung, Rechnung, Gutschrift; Einkaufsbestellung, Wareneingang, Rechnung, Gutschrift; Zahlungs- und Artikelbuchblätter | Durchgängige Belegketten und Navigate/Find Entries sind Abnahmekriterium |
| Zahlung/Bank | SEPA-Überweisung als fachliches Zielbild, synthetisches Bankkonto, manuelle Kontoauszugsprobe, Zahlungsbedingungen 14/30 Tage | Kein echter Zahlungsdateiexport, Bankfeed oder Onlinebanking |
| Mahnwesen | Eine Mahnstufe nach Fälligkeit plus interne Prüfung; keine Gebühren, Zinsen oder E-Mail-Zustellung in der Simulation | Mahnvorschlag wird fachlich geprüft, aber nicht extern versendet |
| Lager | Einfache Handelsware, Basiseinheit Stück, gleitender Durchschnitt, kein Tracking | Zugang, Abgang, Inventur und Wertabgleich müssen zusammenpassen |
| Abschluss | Monatlicher Nebenbuch-/Sachbuchabgleich, Bank, Lager und UStVA-Vorschau | Keine ELSTER-Übermittlung und keine steuerliche Beratung |

## Workshopplan und Ergebnisse

Die sechs Module werden in der Reihenfolge Finance, Einkauf, Verkauf/Forderungen, Zahlung/Bank, Lager und Monatsabschluss moderiert. Pro Modul werden Ist-Ablauf, Ausnahme, Kontrollpunkt, Datenbedarf, BC-Standard und Entscheidung protokolliert.

**Fast-Track:** Der Kunde liefert vorab nur Organisationssteckbrief, Konten-/Steuervorgaben, je einen Beleg- und Partner-/Artikelbeispielsatz, Bank-/Zahlungsanforderungen, Anfangssalden sowie Rollenliste. Danach genuegen drei fokussierte Termine: (1) Scope und Finance/VAT, (2) P2P/O2C/Bank/Lager, (3) Datenabnahme, UAT und Cutover-GO. Zwingend zu entscheiden sind Konten/VAT, Dimensionen, Beleg- und Freigabelogik, Zahlungs-/Mahnverfahren, Lagerverfahren, Migrationssalden und Rollen/SoD. Der kuerzeste realistische Weg lautet: Vorbereitung → drei Workshops → Standardentscheidung → drei Datenwellen/Setup → UAT → Mock-Cutover → GO.

| Modul / Rollen | Leitfragen | Synthetisches Ergebnis | Noch real zu bestätigen |
|---|---|---|---|
| Finance – `P-005`, `P-002` | Welche Konten, Buchungsgruppen, Dimensionen und Periodensperren werden benötigt? | SKR04-basierter reduzierter Kontenplan; Buchungsmatrix Inland/19 %, Kostenstelle und Geschäftsbereich; Monatsperioden | Kontennummern, Steuerkennzeichen und steuerliche Würdigung |
| Einkauf – `P-011`, `P-005` | Bestellungspflicht, Wareneingang, Rechnungsprüfung, Abweichungen? | Bestellung → Wareneingang → Rechnung; externe Belegnummer eindeutig; Mengen-/Preisabweichung wird vor Buchung geklärt | Freigabegrenzen und Vertretungsregel |
| Verkauf/Forderungen – `P-011`, `P-005` | Angebot/Auftrag, Lieferung, Preis, Kreditlimit, Mahnung? | Auftrag → Lieferung → Rechnung; Preis aus Preisliste; überfällige Posten in einer Mahnstufe | Kreditlimit und rechtliche Mahntexte |
| Zahlung/Bank – `P-005` | Zahlungsweg, Anwendung, Kontoauszug, Differenzen? | Zahlungsbuchblätter und manuelle Bankabstimmung; Gebühren separat; kein automatischer Bankfeed | Bankformat, Zeichnungsrechte und produktive Bankanbindung |
| Lager – `P-019`, `P-011` | Lagerorte, Einheiten, Negativbestand, Inventur? | Ein Lagerort `HAUPT`, Stück, Negativbestand nicht vorgesehen, periodische Inventur | Zählrhythmus und reale Anfangsbestände |
| Monatsabschluss – `P-005`, `P-001` | Welche Abstimmungen und welcher Abschlusskalender? | Sachkonto, Debitor, Kreditor, Bank, Lager und VAT werden vor Periodensperre abgestimmt | Steuerliche Freigabe und realer Abschlusskalender |

## Fit-to-Standard-Entscheidungen

| Prozess | Ist-Anforderung | BC-Standardabbildung | Bewertung / Option | Empfehlung und simulierte Entscheidung | Auswirkung / Owner |
|---|---|---|---|---|---|
| Record-to-Report | Belegorientierte Finanzbuchhaltung mit Kostenstellenauswertung | Sachkonten, Buchungsgruppen, Dimensionen, Buchungszeiträume | **Fit**; kundeneigener Kontenplan wird parametrisiert | Standard verwenden, keine Erweiterung | Setup/UAT: `P-005` |
| Purchase-to-Pay | Bestellung, Wareneingang, Rechnung, Zahlung und Ausgleich | Purchase Order/Invoice, Vendor Ledger, Payment Journal | **Fit**; Freigabeworkflow nicht im Basic-Scope | Manuelle organisatorische Freigabe vor Buchung | Prozess: `P-011`, Kontrolle: `P-005` |
| Order-to-Cash | Angebot/Auftrag, Lieferung, Rechnung, Zahlung, Mahnung | Sales Quote/Order, Customer Ledger, Cash Receipt Journal, Reminders | **Fit mit Parameterisierung**; keine externe Zustellung | Eine Mahnstufe ohne Gebühren/Zinsen simulieren | Prozess: `P-011` |
| Cash/Bank | Zahlungen anwenden und Kontoauszug abstimmen | Payment/Cash Receipt Journal, Bank Acc. Reconciliation | **Fit**; Bankfeed und Zahlungsdatei sind außerhalb Scope | Synthetischen Kontoauszug manuell abbilden | `P-005` |
| Inventory | Ein Lager, Zu-/Abgang, Inventur, Bewertung | Location, Item Journal, Physical Inventory Journal, Item/Value Entries | **Fit**; kein erweitertes Lager/Tracking | `HAUPT`, Stück, einfache Inventur | `P-019` |
| Period Close/VAT | Nebenbücher abstimmen, Periode schließen, UStVA-Vorschau | Trial Balance, Ledger Entries, Accounting Periods, VAT Entries/Statement | **Fit mit lokaler Prüfung** | Standardberichte nutzen; keine Übermittlung | `P-005`, steuerliche Prüfung extern |

Nicht in BC Basic aufgenommen werden Produktion, Service, Projekte, Anlagenbuchhaltung, Intercompany, Konsolidierung, E-Rechnung, kundenspezifische Erweiterungen und produktive Integrationen. Ein solcher Bedarf löst einen Change aus.

## Solution Design

- **Konten und Buchungsmatrix:** reduzierter SKR04-orientierter Kontenplan; Geschäftsgruppen `INLAND`, Produktgruppen `HANDEL` und `DIENST`, VAT-Gruppen `DE`/`VAT19`/`VAT0`. Kontonummern und VAT-Kombinationen bleiben vor realem Einsatz steuerlich zu bestätigen.
- **Dimensionen:** globale Dimensionen `KOSTENSTELLE` und `GESCHAEFTSBEREICH`; Pflicht auf GuV-Belegen, Defaultwerte auf Partnern/Artikeln, Abweichung vor Buchung korrigieren.
- **Nummernserien:** getrennte synthetische Präfixe für Bestellung, Einkaufsrechnung, Auftrag, Lieferung, Verkaufsrechnung, Zahlung, Mahnung und Korrektur. Manuelle Nummern nur für kontrollierte Eröffnung.
- **Zahlung/Mahnung:** `14T` und `30T`, Zahlungsart Überweisung; offene Posten per Belegbezug anwenden; eine Mahnstufe ohne externe Zustellung.
- **Bank:** ein synthetisches EUR-Bankkonto, manuelle Abstimmung; keine reale IBAN, kein Bankfeed, kein Zahlungsverkehr.
- **Lager:** `HAUPT`, Basiseinheit `STK`, gleitender Durchschnitt, kein Lagerplatz, keine Charge/Serie, kein Negativbestand als Sollprozess.
- **Rollen/SoD:** `P-002` richtet ein, `P-011` erfasst Handelsbelege, `P-019` bestätigt Mengen, `P-005` bucht und stimmt ab, `P-001` entscheidet Gates. Zahlungsvorbereitung und Zahlungskontrolle werden getrennt.
- **Reporting:** Standardlisten, Navigate/Find Entries, Trial Balance, Aging, Inventory Valuation und VAT-Vorschau. Kundenspezifische Berichte, BI und Schnittstellen sind nicht enthalten.

## Datenmigration und Abstimmung

Der verbindliche Objekt-, Quellen-, Mengen-, Bereinigungs- und Abstimmplan steht in `project/bc-basic/data-package.yaml` unter `migrationDiscovery`. Drei Wellen werden verwendet: Setup, Stammdaten, Eröffnung/offene Posten. Kein Objekt gelangt in die nächste Welle, bevor Pflichtfelder, Referenzen, Dubletten, Summen und synthetische Kennzeichnung bestanden sind.

## Akzeptanz und Ticketstory

- `UABC-22`: Scope, Rollen, Phasen und kaufmännischer Rahmen sind innerhalb der bestehenden 80-Stunden-/9.600-EUR-Story abgeglichen.
- `UABC-23`: Finanz-/VAT-Design ist synthetisch entschieden; reale steuerliche Bestätigung ist als Wahrheitsgrenze benannt.
- `UABC-24`: P2P, O2C, Cash/Bank, Lager und Abschluss sind standardnah entschieden und mit Ausnahmen abgegrenzt.
- `UABC-25`: Migrationsobjekte, Wellen, Owner, Qualitäts- und Abstimmkriterien sind vollständig zugeordnet.
- `UABC-26`: Lösungsdesign führt direkt zu UAT, Cutover und Abnahme; kein zusätzlicher Worklog entsteht.

Abnahmeentscheidung: **GO_DISCOVERY_SIMULATION**. Der Consultant kann damit einen echten Kundenworkshop vorbereiten und die Entscheidungen führen. Vor realem Projektstart werden kundenspezifische Parameter, Steuer/Recht, Lizenz und Sandboxverhalten validiert; diese Punkte sind keine Blocker der abgeschlossenen Simulation.

<!-- story-metadata {"id":"PAGE-UABC-100","parent":"PAGE-UABC-000","version":2,"status":"published"} -->
