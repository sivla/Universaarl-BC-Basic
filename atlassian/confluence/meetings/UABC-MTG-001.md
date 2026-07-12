---
id: UABC-MTG-001
title: Synthetischer Discovery- und Fit-to-Standard-Workshop
date: 2026-08-21
status: simulated-complete
projectId: UABC-BC-BASIC-001
participantRefs: [P-001, P-002, P-005, P-011, P-016, P-019]
ticketRefs: [UABC-22, UABC-23, UABC-24, UABC-25, UABC-26]
evidenceClaimed: false
---

# Synthetischer Discovery- und Fit-to-Standard-Workshop

> Repositorybasierte Simulation, keine reale Kundenbesprechung und keine reale BC-Ausführung. Die Rollen entscheiden innerhalb der konsistenten Projektwelt; steuerliche, rechtliche und reale Sandbox-Nachweise werden dadurch nicht ersetzt.

## Ziel, Agenda und Rollen

Ziel ist ein entscheidungsfähiger BC-Basic-Blueprint. `P-002` moderiert und dokumentiert, `P-001` entscheidet Scope/Gates, `P-005` verantwortet Finance/VAT/Bank, `P-011` Einkauf/Verkauf, `P-016` Daten und `P-019` Lager. Agenda: Betriebsmodell (30 min), Finance/VAT (60 min), P2P/O2C (60 min), Cash/Bank/Lager (45 min), Migration/Qualität (45 min), Entscheidungen/UAT/Cutover (30 min). Diese Zeiten sind Moderationsblöcke innerhalb der bereits gebuchten Ticket-Worklogs und erzeugen keine Zusatzstunden.

## Fragen, Antworten und Entscheidungen

1. **Welches Betriebsmodell muss BC abbilden?** Eine EUR-Handelsgesellschaft, ein Hauptsitz, ein Lager `HAUPT`, monatliche Standardbelege und keine Produktion/Projekte/Services. Entscheidung: Fit-to-Standard ohne Erweiterung.
2. **Wie wird Finance strukturiert?** Reduzierter SKR04-orientierter Plan, Inland-/Handels-Buchungsmatrix, Dimensionen Kostenstelle/Geschäftsbereich und Monatsperioden. Entscheidung: synthetisch verbindlich; echte Konten/VAT-Matrix steuerlich bestätigen.
3. **Wie laufen Einkauf und Verkauf?** Durchgängige Bestell-/Auftragsketten mit getrenntem Wareneingang/Lieferung und Rechnung. Preis-/Mengenabweichungen werden vor Rechnung geklärt. Entscheidung: Standardbelege, kein Workflow-Customizing.
4. **Wie werden Forderungen, Zahlungen und Bank behandelt?** 14/30 Tage, Überweisung, belegbezogener Ausgleich, manuelle Kontoauszugsprobe und eine Mahnstufe. Entscheidung: kein Bankfeed, kein echter Zahlungsexport, keine Mahnzustellung.
5. **Welches Lagerverfahren genügt?** Ein Lagerort, Stück, gleitender Durchschnitt, einfache Inventur. Entscheidung: keine Plätze, Charge/Serie oder Negativbestand als Sollprozess.
6. **Was wird migriert?** Setup, Stammdaten und kontrollierte Eröffnung/offene Posten in drei Wellen. Entscheidung: kein historischer Bewegungsdatenvollimport.
7. **Wann ist Discovery abgenommen?** Wenn Fit/Gap, Owner, Datenobjekte, Abgrenzungen und UAT-Bezug dokumentiert sind. Ergebnis: `GO_DISCOVERY_SIMULATION`.

## Offene reale Bestätigungen

- Kundenspezifische Konten, VAT-/UStVA-Kennzeichen und steuerliche Würdigung.
- Reale Belegvolumina, Bankformat, Zeichnungsrechte, Kreditlimit, Mahntexte und Freigabegrenzen.
- Produktive Rollen/Lizenzen, reale Datenquellen sowie Sandbox-Setup und tatsächliches Standardverhalten.

Diese Bestätigungen sind vor einem echten Projekt zu parametrisieren oder nachzuweisen. Sie bleiben keine offenen Gates der vollständig abgeschlossenen Simulation.

## Actions und Abnahme

| Ticket | Ergebnis | Owner | Nachweis |
|---|---|---|---|
| `UABC-22` | Scope, Rollen und Rahmen erklärt | `P-002` | Discovery-Seite und Angebot |
| `UABC-23` | Finance-/VAT-Design entschieden | `P-005` | Entscheidungsregister und Blueprint |
| `UABC-24` | E2E-Fit/Gap entschieden | `P-011`, `P-019` | Prozesslandkarte und Playthrough |
| `UABC-25` | Migrationswellen und Abstimmung festgelegt | `P-016` | Datenpaket |
| `UABC-26` | UAT-/Cutover-Verwendung bestätigt | `P-001` | UAT-Katalog und Projektstory |

Synthetische Gate-Entscheidung am 2026-08-21: **GO_DISCOVERY_SIMULATION**. Alle fünf Actions sind innerhalb der Simulation angenommen; keine reale Unterschrift oder externe Freigabe wird behauptet.
