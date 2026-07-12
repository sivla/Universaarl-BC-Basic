---
id: UABC-BCBHYPERCARE
storyPageId: PAGE-UABC-120
title: 03 Cutover, Hypercare, Betrieb und Erweiterungsgrenzen
parent: UABC-BCBPROJECT
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 3
purpose: Wiederverwendbarer Übergang vom abgenommenen Projekt in einen stabilen Betrieb
audience: Projektleitung, Consultant, Key User und Support
owners: [P-002]
version: 4
status: published
jiraRefs: [UABC-21, UABC-47, UABC-48, UABC-49, UABC-50]
referenceIds: [UABC-REQ-BCB-002, UABC-REQ-BCB-009, UABC-REQ-BCB-010]
lastReviewed: 2026-07-12
---

# 03 Cutover, Hypercare, Betrieb und Erweiterungsgrenzen

## Betriebsmodell und Geltungsbereich

Diese Seite beschreibt den wiederverwendbaren Betriebsübergang. Kundenbezogene Tagesstände, Incidents, Freigaben und Buchungsevidence bleiben im Kundenprojekt-Space und werden hier nicht dupliziert.

## Übergangs- und Supportstandard

Der Standard verbindet Mock-Cutover, Go-live-Entscheidung, Restartprobe, begrenzte Hypercare und Supportübergabe zu einer durchgängigen Kontrollstrecke.

Ein Go-live erfolgt nur mit bestätigten Entry-Kriterien und einem ausführbaren Fallback.

## Cutover, Hypercare und Betriebsübergabe

### Cutoverstandard

Der Cutoverplan enthält Reihenfolge, Owner, Zeitfenster, Abhängigkeiten und Abbruchkriterien. Pflichtbestandteile sind:

- Datenfreeze und finaler Daten-/Saldenabgleich;
- Konfigurations-, Rollen- und Periodenkontrolle;
- offene Posten, Bank, Bestand und VAT-/USt-Abstimmung;
- UAT-Exit und geschlossene P1-/P2-Defects;
- Kommunikationspunkte, GO-/NO-GO-Entscheidung und Fallback.

Ein Mock-Cutover wiederholt den gesamten Ablauf einschließlich Zeitmessung, Korrektur und Restart, bevor ein realer Cutover freigegeben wird.

### Hypercarestandard

Die Hypercare ist zeitlich begrenzt und arbeitet mit einem täglichen Rhythmus:

1. System-, Prozess- und Ticketstatus prüfen.
2. P1, P2 und P3 anhand Wirkung und Dringlichkeit priorisieren.
3. Diagnose über Belege, Posten, Berechtigungen und Kontrollen durchführen.
4. Korrektur und Retest belegen.
5. GO oder NO-GO für den Folgetag entscheiden.

Am Exit sind P1 und P2 geschlossen. Verbleibende P3-Themen werden transparent als Support-Backlog übergeben.

### Restart und Wiederanlauf

Die Restartprobe beginnt an einem benannten Sicherungs- oder Referenzpunkt. Sie stellt Datenstand, Konfiguration und offene Arbeit reproduzierbar wieder her.

Danach folgen Smoke-Test, Integritätskontrollen und die dokumentierte Wiederanlaufentscheidung.

### Betriebs- und Supportmodell

Anwender korrigieren sichere Bedienfehler selbst. Key User übernehmen Prozess- und Stammdatenfragen.

Consultant oder Support bearbeitet Konfigurations-, Berechtigungs- und Produktfragen. Bei unklarer Integritäts-, Steuer-, Sicherheits- oder Buchungswirkung gilt sofortiger Buchungsstopp.

### Erweiterungsgrenzen

Nach dem vereinbarten Hypercarefenster werden neue Funktionen, zusätzliche Gesellschaften, Integrationen und tiefere Prozessvarianten neu bewertet.

Sie werden als Supportbedarf, Change oder eigenständiges Projekt eingeordnet und verlängern den Basisscope nicht stillschweigend.

## Erweiterungsgrenzen und Projektparameter

- Cutoverfenster, Sicherungspunkt und Supportzeiten werden je Kundenprojekt bestätigt.
- Produktive Bank-, Steuer- und externe Kommunikationswege benötigen separate fachliche und technische Freigaben.
- Support-Backlog und Projektdefects werden am Hypercare-Exit eindeutig getrennt.

## Referenzen

- [BC Basic Standardprodukt](70-bc-basic-project.md)
- [Lieferpaket, Tests und Standardtraining](81-bc-basic-handover.md)
- [Consultant: Projektsteuerung bis Abschluss](75-bc-basic-meetings-decisions.md)

<!-- story-metadata {"id":"PAGE-UABC-120","parent":"PAGE-UABC-090","version":4,"status":"published"} -->
