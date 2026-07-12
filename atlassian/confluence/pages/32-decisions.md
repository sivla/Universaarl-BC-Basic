---
id: UABC-DECISIONS
title: 05 Datenmigration
parent: UABC-PROJECT
owners: [P-002, P-005, P-016, P-019]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 5
storyPageId: PAGE-UABC-050
purpose: Beschreibt Datenlieferung, Migrationswellen, Qualitätsregeln und Abstimmung.
audience: [Datenverantwortung, Finance, Consultant]
jiraRefs: [UABC-38, UABC-41]
referenceIds: [UABC-REQ-BCB-006, UABC-REQ-BCB-008]
lastReviewed: 2026-09-03
---

# 05 Datenmigration

## Migrationsziel und Lieferumfang

Die Migration verwendet acht Blanko-/Beispielpaare und zehn Migrationsobjekte. Kundinnen und Kunden liefern und prüfen kontrollierte Vorlagen; Konfigurationspakete bleiben ein Consultant-Werkzeug und keine zusätzliche Kundenpflicht.

## Probelauf und Abstimmstatus

Alle drei Wellen wurden mit den vollständig ausgearbeiteten synthetischen Referenzsätzen geladen, korrigiert, wiederholt und abgestimmt.

Im Playthrough sind je ein Debitor, Kreditor und Artikel Ende zu Ende belegt. Die Zielvolumina von 20 Debitoren, 12 Kreditoren und 12 Artikeln sind ein Kundenparameter, kein behaupteter Vollimport.

## Migrationswellen, Qualität und Wiederholung

### Welle 1 – Setup

Die erste Welle umfasst Gesellschaft, Finanzsetup und Dimensionen:

- eine Gesellschaft `UABC-BASIC-DE` mit DE, EUR, Kalenderjahr und Lagerort `HAUPT`;
- 11 Kontenrollen und sechs Buchungsmatrizen;
- zwei Dimensionen mit fünf Werten;
- Nummernserien, Zahlungsbedingungen und weitere referenzierte Setup-Codes.

**Exit:** Jeder verwendete Code löst auf, Buchungsmatrizen besitzen Soll-/Habenkonten und alle GuV-relevanten Belege können gültige Dimensionen tragen.

### Welle 2 – Stammdaten

Die zweite Welle umfasst als wiederverwendbare Zielstruktur bis zu 20 Debitoren, 12 Kreditoren, 12 Artikel, Preise, Einheiten und ein synthetisches EUR-Bankkonto.

Die ausgeführte Referenzsimulation verwendet davon je einen vollständigen Debitoren-, Kreditoren- und Artikelsatz. Reale Mengen werden erst im Kundenprojekt bestätigt.

**Exit:** Nummern sind eindeutig, Pflichtfelder gefüllt, Buchungsgruppen vorhanden, Preis liegt über Kosten, Artikel verwenden `STK`, `HAUPT` und FIFO. Reale IBAN, Kontakte und Zugangsdaten sind verboten.

### Welle 3 – Eröffnung

Die dritte Welle umfasst Sachkontoeröffnung, offene Debitoren-/Kreditorenposten und Anfangsbestand:

- Eröffnungsjournal `SYN-EROEFF-001`: Soll und Haben jeweils 10.140,10 EUR.
- Offener Debitorenposten `SYN-AR-001`: 940,10 EUR.
- Offener Kreditorenposten `SYN-AP-001`: 499,80 EUR.
- Anfangsbestand `SYN-OPEN-001`: 100 Stück zu 42,00 EUR, also 4.200,00 EUR.

**Exit:** Hauptbuch und Nebenbücher stimmen, Bestand entspricht Menge mal Einstandspreis und jeder Beleg trägt synthetische Kennzeichnung und freigegebene Dimensionen.

### Zehn Migrationsobjekte

1. Gesellschaft.
2. Finanzsetup und Kontenrollen.
3. Dimensionen und Werte.
4. Debitoren.
5. Kreditoren.
6. Artikel, Einheiten und Preise.
7. Bankstamm ohne reale Bankverbindung.
8. Sachkontoeröffnung.
9. Offene Debitoren- und Kreditorenposten.
10. Lageranfangsbestand.

### Qualitäts- und Wiederholungsregel

Vor jedem Lauf werden Pflichtfelder, Eindeutigkeit, Wertelisten, Referenzen, synthetische Kennzeichnung und Kontrollsummen geprüft.
Ein Fehler stoppt die betroffene Welle; fehlende Gegenbuchungen oder unbekannte Codes werden nicht mit Ersatzwerten kaschiert.

Nach einer Korrektur wird das Paket aus der freigegebenen Vorlage neu erzeugt.
Bereits vorhandene IDs werden geprüft, ein unklarer Teilimport wird analysiert und nicht blind überschrieben.
Für jeden manuellen Schritt sind Ziel, Prüfschritt und Rücksetzweg dokumentiert.

## Freigabepunkt und Kundenparameter

- **Synthetisch entschieden:** drei Wellen, zehn Objekte, acht Vorlagenpaare, Owner, Qualitätsregeln und Abstimmwerte.
- **Kundenseitig zu bestätigen:** Quellsysteme, Extraktionsowner, reale Mengen, Dublettenregeln, Konten/VAT-Codes, Stichtag, Salden und offene Posten.
- **In der Sandbox zu belegen:** tatsächliche Importfelder, Paketverhalten, Systemposten, Fehlerbereinigung und Rücksetzung.
- Historische Bewegungsdaten und unkontrollierte Vollimporte bleiben außerhalb des BC-Basic-Scopes.

## Referenzen

- [Kanonisches Datenpaket](../../../project/bc-basic/data-package.yaml)
- [Datenbereitschaft und Gate](../../../project/bc-basic/data-readiness-check.yaml)
- [Blanko- und Beispielvorlagen](../../../project/bc-basic/customer-templates/)
- [Eröffnungs- und Schlusskontrollen](../../../evidence/simulation/bc-playthrough-ledger.yaml)
- Fachliche Verantwortung: Tickets `UABC-38` und `UABC-41`.

<!-- story-metadata {"id":"PAGE-UABC-050","title":"05 Datenmigration","parent":"PAGE-UABC-000","version":4,"status":"published"} -->
