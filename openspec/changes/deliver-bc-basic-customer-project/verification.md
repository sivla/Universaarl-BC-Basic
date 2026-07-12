# Verifikation

## Kurzkontext

Diese Seite fasst die fachliche und technische Verifikation der synthetischen BC-Basic-Referenzsimulation zusammen. Sie beantwortet zuerst, was fachlich belegt ist, und nennt technische Einzelpruefungen erst danach.

Die Evidence stammt ausschliesslich aus versionierten Repository-Artefakten. Es wurden keine reale Business-Central-Instanz, keine echten Kundenpersonen, keine Bank- oder Steueruebermittlung und kein Produktivsystem verwendet.

## Status

| Bereich | Ergebnis | Bedeutung |
| --- | --- | --- |
| BC-Basic-Standardprodukt | `V1_STANDARDPRODUCT_READY` | Das wiederverwendbare Paket ist anhand des synthetischen Referenzfalls vollstaendig durchgespielt. |
| Referenzsimulation | bestanden | Dreizehn Phasen, UAT, Schulung, Cutover, `GO_SIMULATION`, drei Hypercaretage und Handover sind synthetisch abgeschlossen. |
| Spectra-Bindung | `BOUND` | Spectra `0.10.0-alpha.1` ist ueber Tag, Commit, Manifest, 110 Blobs und Digest nachgewiesen. |
| Twin-Uebergabe | commitgebunden | Der Twin liest nur Index, Katalog und positivgelistete Blobs eines validierten Branch-Commits. |
| Reale Kundeninstanz | nicht ausgefuehrt | Tenant-, Steuer-, Bank-, Berechtigungs- und Echtdatenwerte bleiben Parameter eines spaeteren Kundenprojekts. |

## Prüfbarer Umfang

Die Verifikation deckt folgende zusammenhaengende Bereiche ab:

- Angebot, Scope, Rollen, Entscheidungen, 80 Stunden und 9.600 EUR synthetischer Ist-Aufwand,
- Unternehmensmodell, Datenpaket, Konfiguration und Berechtigungsbaseline,
- Purchase-to-Pay, Order-to-Cash, Zahlung und Bankabstimmung,
- Lager, Inventur, Monatsabschluss und synthetische UStVA-Vorschau,
- sieben UAT-Faelle, vier Operatorpfade, Defects und Retests,
- Cutover, Restart, Hypercare, Supportuebergabe und Abschluss,
- Dokumentkatalog, Confluence-Informationsarchitektur und lesender Twin-Vertrag.

## Fachliche Ergebnisse

### Unternehmen, Daten und Einrichtung

Der Referenzfall verwendet die synthetische Gesellschaft `UABC-BASIC-DE`, den Lagerort `HAUPT`, den Artikel `A-1000`, die Buchungsgruppen `INLAND`, `HANDEL` und `MWST19`, die Dimensionen `KOSTENSTELLE` und `GESCHAEFT` sowie FIFO.

Elf synthetische Kontenrollen und sechs Buchungsmatrizen lösen die verwendeten Buchungsketten auf.

Datenlieferung, Mapping, Qualitaetskontrolle, Importreihenfolge und Abstimmung sind als wiederverwendbarer Projektweg dokumentiert. Echte Kundenwerte muessen im Setup-/UAT-Entry-Gate bestaetigt werden.

### Einkauf, Verkauf und Nebenbücher

Der fokussierte Playthrough umfasst sieben Bedienfaelle, 16 Dokumente und 35 Entries. Die kanonische O2C-Kette verwendet zehn Einheiten zu 79 EUR:

- Netto: 790,00 EUR
- Umsatzsteuer: 150,10 EUR
- Brutto: 940,10 EUR

Neue P2P- und O2C-Posten sind ausgeglichen. Die offenen Eroeffnungsposten bleiben mit 940,10 EUR Debitor und 499,80 EUR Kreditor sichtbar. Auftraege werden klar von gebuchten Belegen getrennt.

### Abschluss und Kontrollen

Die abgestimmten synthetischen Schlusswerte lauten:

| Kontrolle | Ergebnis |
| --- | ---: |
| Bank | 5.440,30 EUR |
| Lager | 99 Stueck / 4.158,00 EUR |
| Umsatzsteuer-Zahllast | 70,30 EUR |
| Schlussbilanz | 11.080,20 EUR je Seite |

Monatsabschluss und UStVA sind fachliche Simulationen ohne reale Steuerberatung oder Uebermittlung.

### UAT, Befähigung und Übergabe

Sieben UAT-Fälle und vier rollenbezogene Operatorpfade besitzen positiven Fall, Fehler, Korrektur, Retest und synthetische Abnahme. Am Ende der Hypercare sind keine P1- oder P2-Simulationsdefects offen.

Die reale Ausführung durch Kundenbenutzer in deren Sandbox bleibt ein späterer Projektschritt, nicht ein Mangel der abgeschlossenen Referenzsimulation.

### Confluence und Dokumentnavigation

Die 19 bestehenden Confluence-Seiten sind ohne ID- oder Pfadmigration in drei getrennte Wissensraeume geordnet:

- Kundenprojekt: konkrete Projektwahrheit von Support und Unternehmen bis Hypercare und Projektsteuerung,
- BC-Basic-Standardprodukt: wiederverwendbare Leistung, Prozessstandard, Lieferpaket und Grenzen,
- Consultant-Handbuch: interne Durchfuehrung von Discovery bis Abschluss.

Der Dokumentkatalog fuehrt Space, Typ, Parent, Reihenfolge und stabile Story-Seiten-ID. Drei source-driven Module und 22 explizite Navigationsknoten liefern Gruppen, Seitenreihenfolge und Ausgangszustand. Der Twin leitet keine Struktur aus IDs oder Pfaden ab.

Die Redirect-Matrix erhaelt alle bisherigen Referenzen. Externe Confluence-URL, Page-ID und Space-Key bleiben ohne echte Quelle leer.

Der Ticketkatalog trennt 17 kundenlesbare Storytickets von 38 historischen Planungs- und Traceability-Issues.
Die 48 kundenlesbaren Tickets bestehen aus drei Phase-Tickets, acht fachlichen Epics, 17 Stories, einem Bug und 19 Tasks.
Ausschliesslich die 19 Task-Worklogs zählen 80 Stunden und 9.600 EUR.
Zusammen mit 38 internen Traceability-Issues liefern alle 86 Records Lowercase-Typ, Parent, Sichtbarkeitsrolle und Zählbereich explizit.
Der Twin leitet nichts aus Key oder Titel ab.

Board und kompakte Liste enthalten die 48 Kundentickets jeweils genau einmal und gliedern sie in drei Phase-Tickets und acht fachliche Epics. Vier Boardspalten, sechs View-Gruppen, Filter, sichtbare Felder und Expand-Zustaende stammen aus dem Producervertrag.

Die sechs Tickettypen besitzen deutsche Labels sowie geschlossene Icon- und Farbtoken. Externe Icon-URLs oder eingebettete HTML-/SVG-Fragmente sind nicht zugelassen.

## Offene Abweichungen und Wahrheitsgrenzen

Die folgenden Punkte sind bewusst keine offenen Simulationsdefects:

- Keine reale BC-Oberflaeche oder Buchung wurde ausgefuehrt.
- Tenant, Lizenz, produktive Berechtigungen und Reset muessen kundenspezifisch bestaetigt werden.
- Konten, UStVA-Kennzeichen und steuerliche Behandlung benoetigen im echten Projekt Kunden- und Steuerberaterentscheidung.
- Bank, E-Mail, ELSTER und andere externe Uebermittlungen liegen ausserhalb des Standardumfangs.
- Das historische Snapshotmanifest ist nicht der laufende Branchvertrag. Massgeblich sind Branch-Index, Dokumentkatalog und die commitgebundenen Blobs.

## Evidence und Referenzen

- Projektstory: `evidence/simulation/project-story.json`
- Playthrough-Ledger: `evidence/simulation/bc-playthrough-ledger.yaml`
- Cash-, Lager- und Abschlussnachweis: `evidence/simulation/phase-3-cash-inventory-close.yaml`
- Demo-Readiness: `evidence/simulation/demo-readiness.yaml`
- Spectra-Releasebeleg: `evidence/spectra-release-0.10.0-alpha.1.yaml`
- Branch-Index: `exports/project-data/v1/index.yaml`
- Dokumentkatalog: `exports/project-data/v1/document-catalog.json`
- Verifikationsregister: `evidence/verification-register.yaml`

## Technische Prüfungen

Die Abschlusspruefung umfasst:

1. OpenSpec-Schema und strikte OpenSpec-Validierung,
2. Story-, Playthrough-, Simulation-, Referenz- und Deutschpruefung,
3. Spectra-0.10-Bindung, Reconciliation, Adapter-Provenienz und Graph-Coverage,
4. Dokumentkatalog mit Blob-, Hash-, Hierarchie-, Referenz- und Space-Pruefung,
5. isolierte Negativfaelle fuer manipulierte oder unlesbare Dokument- und Seitenstrukturen,
6. Branch-/Snapshotvertrag, `git diff --check` und leere `REVIEW.md` in Arbeitskopie und Commit.

Die fokussierten Negativ- und Positivsuiten bestehen mit 32 Dokumentkatalog-, 37 Projektstory- und 39 Spectra-/Ticketexport-Fällen.
Zehn repräsentative Dokumente wurden zusätzlich lokal als HTML gerendert und mit Chromium bei 1.440 × 900 Pixeln ohne horizontales Scrollen, gequetschte Tabellen, Encodingfehler oder unaufgelöste Links geprüft.

Ein technischer Erfolg darf keine reale Kunden-, BC-, Steuer- oder Produktivfreigabe ersetzen.

## Freigabe

`GO_SIMULATION` und `V1_STANDARDPRODUCT_READY` gelten ausschliesslich fuer die repositorybasierte synthetische Referenzsimulation.
Der Stand ist fuer einen commitgebundenen, ausschliesslich lesenden Twin-Konsum vorbereitet.
Ein reales Kundenprojekt startet separat mit dem dokumentierten Setup-/UAT-Entry-Gate.
