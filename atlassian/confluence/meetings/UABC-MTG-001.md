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

## Ziel, Ablauf und Rollen

Das eine Meeting-Artefakt protokolliert drei fokussierte Workshopteile der synthetischen Discovery. Es erzeugt keine zusätzliche Sitzung, kein zusätzliches Ticket und keine weiteren Stunden.

`P-002` moderiert und dokumentiert. `P-001` entscheidet Scope und Gates, `P-005` verantwortet Finance, VAT und Bank, `P-011` Einkauf und Verkauf, `P-016` Daten und `P-019` Lager.

## Workshop 1 – Unternehmen, Finance und VAT

**Simulationsdatum:** 2026-08-17

**Vorbereitung:** Betriebsmodell, Kontenstruktur, Perioden, Steuerfälle und Dimensionen.

**Ergebnisse:**

- eine EUR-Handelsgesellschaft mit Hauptsitz und Lagerort `HAUPT`;
- reduzierter SKR04-orientierter Kontenplan;
- Buchungsgruppen `INLAND`, `HANDEL` und `MWST19`;
- Dimensionen `KOSTENSTELLE` und `GESCHAEFT`;
- Fit-to-Standard ohne Produktion, Projekte oder Service.

**Entscheidungsgrenze:** Die Simulation bindet Struktur und Kontrolllogik. Reale Konten, VAT-Matrix und UStVA-Kennzeichen benötigen im Kundenprojekt fachliche und steuerliche Bestätigung.

## Workshop 2 – P2P, O2C, Cash und Lager

**Simulationsdatum:** 2026-08-19

**Vorbereitung:** Belegarten, Zahlungsbedingungen, Mahnweg, Bankabstimmung, Artikel und Lagerverfahren.

**Ergebnisse:**

- getrennte Bestellung, Wareneingang und Einkaufsrechnung;
- getrennte Verkaufsbestellung, Lieferung und Rechnung;
- 14/30-Tage-Zahlungslogik, belegbezogener Ausgleich und eine Mahnstufe;
- manuelle synthetische Kontoauszugsprobe ohne Bankfeed oder Zahlungsexport;
- ein Lagerort, Einheit `STK`, Bewertungsmethode FIFO und einfache Inventur;
- keine Plätze, Chargen, Seriennummern oder Negativbestände als Sollprozess.

**Entscheidungsgrenze:** Preis- und Mengenabweichungen werden vor Rechnung geklärt. Individuelle Workflows und externe Integrationen bleiben außerhalb des Standards.

## Workshop 3 – Daten, UAT und Cutover

**Simulationsdatum:** 2026-08-21

**Vorbereitung:** Datenquellen, Zielvolumina, Migrationswellen, Rollen, sieben UAT-Fälle und Cutoverkriterien.

**Ergebnisse:**

- Setup, Stammdaten und Eröffnung/offene Posten werden in drei Wellen migriert;
- historische Bewegungsdaten werden nicht voll importiert;
- jeder UAT-Fall besitzt Rolle, Daten, Kontrolle, Fehler und Retest;
- Discovery ist bei dokumentiertem Fit/Gap, Owner, Datenobjekt, Abgrenzung und UAT-Bezug abgeschlossen;
- gemeinsame Entscheidung `GO_DISCOVERY_SIMULATION`.

Die Workshopzeiten sind Moderationsblöcke innerhalb der bereits gebuchten Ticket-Worklogs und erzeugen keine Zusatzstunden.

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
