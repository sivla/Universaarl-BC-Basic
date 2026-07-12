---
id: UABC-BCBSTORY
title: BC Basic Projektstory
parent: UABC-PROJECT
owners: [P-002]
status: Abgeschlossen
jiraRefs: [UABC-18, UABC-21]
referenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-002]
lastReviewed: 2026-09-03
---

# BC Basic Projektstory – Seitenbaum-Inhalte

**Seitenkennung:** PAGE-UABC-000 · **Elternseite:** – · **Version:** 3 · **Status:** published · **Autorrolle:** P-002 · **Zeit:** 2026-08-20 bis 2026-09-03

Diese Seite ist die synthetische Projekt-Home. Von der Angebotsbaseline führt der Seitenbaum über Scope, Discovery, Setup, Datenmigration, P2P, O2C, Cash, Lager, Abschluss, UAT, Training und Cutover bis zu drei Hypercaretagen und Handover. Jede Station verweist auf Ticket, BC-Sitzung und Evidence im Storyvertrag.

Die neunzehn Unterseiten sind vollständig im Storyvertrag referenziert. Die Inhalte werden durch die bestehenden Discovery-, Einrichtungs-, Test- und Lieferseiten ergänzt; technische Seiten- und Ticketantworten sind synthetische Projektdaten.

## Abschlusskontrolle mit Spectra 0.10

Der Abschluss verbindet die Angebotsstände mit `evidence/simulation/project-reconciliation.json`: historische Baseline 68 Stunden/11.050 EUR, synthetisches Angebot und Ist jeweils 80 Stunden/9.600 EUR. Die Abweichung ist als Fortschreibung des vollständigen Playthrough-Scopes begründet; eine reale Rechnung oder produktive Leistung wird nicht behauptet.

`evidence/simulation/adapter-provenance.json` bindet den einzigen Branch-Index read-only an `exports/project-data/v1/twin-export-map.json`. Source-Hash vor und nach der Projektion sind identisch, die Mappingversion ist fest, und weder Twin noch Adapter besitzen Schreib- oder Überschreibrecht. BC Basic bleibt die alleinige fachliche Source of Truth.

Der 0.10-Lieferstand ergaenzt `evidence/simulation/reference-graph-coverage.json`. Die abgeleiteten Dateien `exports/project-data/v1/reference-graph-native.json`, `exports/project-data/v1/reference-graph-mapping.json` und `exports/project-data/v1/reference-graph-portable.json` erklaeren alle 252 nativen Relationen gegen 190 portable Kanten. Der Nachweis behauptet weder eine 1:1-Abbildung noch eine vollstaendige portable Repraesentation.

## Projektsteuerung und Kundentermine

| Schritt | Ergebnis | Federfuehrung | Termin der Simulation | Entscheidung |
| --- | --- | --- | --- | --- |
| Auftrag und Discovery | Scope, Prozesse, Rollen, Datenowner | P-002 mit P-005/P-011/P-016/P-019 | 03.08.-21.08.2026 | Fit-to-Standard und Datenbereitschaft |
| Loesungsdesign und Einrichtung | Setupentscheidungen und Probeladung | P-002/P-005 | 24.08.-26.08.2026 | Finanz-, Steuer- und Migrationsfreigabe der Simulation |
| Fachbereichstest und Training | sieben UAT-Faelle und vier Rollen | P-005/P-011/P-019 | 27.08.2026 | synthetischer UAT-Sign-off |
| Cutover-Probe | Datenfreeze, Kontrolle, Rueckfall und Wiederanlauf | P-002/P-016 | 28.08.2026 | `GO_SIMULATION` |
| Go-live und Hypercare | Tagesstatus, Defects, Retests, Abschluss | P-002/P-005 | 31.08.-03.09.2026 | Hypercare-Exit und Handover |

Die Termine und Rollen sind synthetisch. Ein echtes Projekt ersetzt sie durch benannte Personen, Kalendertermine, Eskalationsweg und unterschriftsfaehige Entscheidungen.

## Fit-to-Standard, Loesungsarchitektur und Prozesslandkarte

Standard bleibt die Vorgabe. Erweiterungen und Integrationen werden nur nach einem belegten Gap und einer eigenen Scope-/Kostenentscheidung zugelassen. Der aktuelle Gap-Stand ist: keine Produktentwicklung erforderlich; kundenspezifisch zu parametrisieren sind Finanz-/Steuerdesign, Dokumente, Berechtigungen, Daten und Betriebsverfahren. Produktion, Service, Projekte, Anlagen, Intercompany und erweiterte Lagerlogistik sind bewusst ausserhalb des Pakets.

- **Finance und Abschluss:** Kontenplan, Buchungsgruppen, MwSt.-Matrix, Perioden, Dimensionen, Sach-/Nebenbuchabgleich und UStVA-Vorschau.
- **Purchase-to-Pay:** Kreditor, Bestellung, Wareneingang, Rechnung, Zahlung, Ausgleich und Abweichungsbehandlung.
- **Order-to-Cash:** Debitor, Auftrag, Lieferung, Rechnung, Mahnung ohne Gebuehr oder externen Versand, Zahlung, Ausgleich und Gutschrift.
- **Zahlung und Abstimmung:** Zahlungsjournale, synthetischer Kontoauszug, automatisches/manuelles Matching, Bankgebuehr und Endsaldo.
- **Inventory:** Artikel, Einheit, Lagerort, Zugang, Abgang, Inventur, Differenz und Wertabgleich.
- **Monatsabschluss und VAT:** offene Belege, Nebenbuchkontrollen, Lagerwert, Steuerposten und Vorschau ohne Uebermittlung.

Die Durchlaeufe stehen in `project/bc-basic/bc-playthrough-catalog.yaml`; Beleg-, Konten-, MwSt.-, Bank- und Lagerwirkung stehen in `evidence/simulation/bc-playthrough-ledger.yaml`. Defects, Korrekturen und Retests sind Teil derselben Kette.

## Daten, Einrichtung, Berechtigungen und Betrieb

Die Migration erfolgt in vier Wellen: Grundeinrichtung und Dimensionen; Konten/Buchungsgruppen/MwSt.; Debitoren/Kreditoren/Artikel/Preise; Lagerbestand, offene Posten und Eroeffnungssalden. Jede Welle verlangt Pflichtfeld-, Dubletten-, Referenz-, Mengen- und Summenkontrolle sowie Ruecksetzung vor Wiederholung. Historische gebuchte Bewegungen werden nicht vollstaendig migriert.

Einzurichten und im echten System nachzuweisen sind Kontenplan, allgemeine und steuerliche Buchungsmatrizen, Debitoren-/Kreditoren-/Lagerbuchungsgruppen, Nummernserien, zwei Dimensionen, Zahlungsbedingungen und -formen, Bankkonto, Mahnbedingungen, Lagerort, Artikel/Einheiten, Buchungsperioden und erlaubte Buchungsdaten. Die synthetischen Rollen trennen Administration, Finance, Handel, Daten und Lager. Kritische Kombinationen aus Einrichtung, Stammdatenpflege, Buchung, Zahlung und Freigabe sind vor dem Echtstart durch eine SoD-Pruefung zu begrenzen.

Direkte Integrationen sind nicht Teil des Pakets. Standardberichte, Saldenlisten, Debitoren-/Kreditorenposten, Bankabstimmung, Lagerbewertung und MwSt.-Vorschau sind enthalten. Kundenlayouts, E-Mail, Bankdateien, E-Rechnung, BI-Ausgaben oder Drittanbindungen erfordern eine eigene Anforderung und Entscheidung.

## Vier klare Reifestufen

1. **Kundengeeignetes wiederverwendbares Paket:** Scope, Prozessmuster, Datenvorlagen, Setupentscheidungen, UAT, Training, Cutover, Hypercare und Supportmodell sind vorhanden.
2. **Vor Projektstart zu parametrisieren:** Personen, Termine, Lizenz, Konten, Steuerlogik, Nummernserien, Dimensionen, Zahlungs-/Mahnregeln, Bankformat, Dokumente, Daten und Berechtigungen.
3. **Im echten BC-Sandboxsystem auszufuehren und nachzuweisen:** Einrichtung, Import, Vorschau/Buchung, Ledgerkontrolle, Berechtigungsprobe, UAT, Mock-Cutover, Ruecksetzung und Wiederanlauf.
4. **Kunden-, steuer- oder rechtsseitig zu entscheiden:** Scopefreigabe, Datenverantwortung, Steuerkennzeichen, Aufbewahrung, Zahlungs-/Mahnpolitik, produktiver Cutover und externe Uebermittlungen.

## Wichtigste fachliche Restluecken vor realer Nutzung

- reale Gesellschaft, Lizenz und benannte Prozessverantwortliche;
- freigegebener Kontenplan, Buchungs-/MwSt.-Matrix und UStVA-Zuordnung;
- reale Datenprofile, Datenqualitaet, Migrationsvolumen und Abstimmwerte;
- Berechtigungsrollen, SoD-Konflikte und Benutzerzuordnung;
- Bank-, Zahlungs-, Mahn-, Dokument- und Reportinganforderungen;
- echte Sandboxausfuehrung mit Screenshots/Systemposten, Ruecksetzung und Fachbereichsabnahme;
- produktiver Cutover-, Support-, Datenschutz-, Steuer- und Rechtsentscheid.

<!-- story-metadata {"id":"PAGE-UABC-150","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
