---
id: UABC-PRODUCTOFFER
title: 05 Angebot, Aufwand und Voraussetzungen
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 5
storyPageId: PAGE-UABC-220
purpose: Diese Seite beschreibt, was als BC-Basic-Pilotprodukt verkauft und
  geliefert wird.
audience:
  - Vertrieb
  - Projektleitung
  - Consultant
  - Solution Architect
jiraRefs:
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
---

# 05 Angebot, Aufwand und Voraussetzungen

## Kommerzielle Baseline

Das synthetische Referenzangebot umfasst 80 Stunden zu 120 EUR und damit 9.600 EUR netto.
Davon entfallen 22 Stunden auf Vorbereitung und Datenbereitschaft, 40 Stunden auf Einrichtung, Tests und Schulung sowie 18 Stunden auf Go-live, Hypercare und Abschluss.

Diese Linie ist Referenz. Fuer einen echten Kunden wird sie mit Namen, Terminen, Lizenzen und Steuerparametern neu angeboten.

## Enthaltene Leistung

- Projektstart, Scope und drei Entscheidungsworkshops;
- Fit-to-Standard fuer Finance, Einkauf, Verkauf, Zahlung, Bank, Lager und Abschluss;
- Standardkonfiguration und drei Migrationswellen;
- Prozesspruefung, UAT, rollenbezogene Schulung und Kompetenznachweis;
- Mock-Cutover, Restart, Go-live-Begleitung, Hypercare und Handover;
- neun lesbare Lieferobjekte mit Ticket-, Evidence- und Abnahmebezug.

## Voraussetzungen und Mitwirkung

Der Kunde stellt Sponsor, Prozessowner, Datenowner und Key User. Er stellt ausserdem eine geeignete Lizenz- und Sandboxbasis sowie termingerecht bereinigte Daten bereit.

Konten, VAT-/USt-Logik, Bankverfahren, Benutzerrollen und rechtliche Anforderungen werden durch die zustaendigen Kundenrollen bestaetigt.
Fehlende Voraussetzungen verschieben das betroffene Gate, nicht stillschweigend den Scope.

## Nicht enthalten

Nicht enthalten sind individuelle Entwicklung, komplexe Integrationen, erweiterte Lagerlogistik, Produktion, Service und Projekte.
Ebenfalls ausgeschlossen sind Intercompany, historische Vollmigration, produktive Bank-/ELSTER-Uebermittlung sowie Rechts- oder Steuerberatung.
Lizenzen, Tenantkosten und Drittanbieterprodukte werden separat ausgewiesen.

## Abnahme und Change-Regel

Jedes Lieferobjekt besitzt ein messbares Kriterium und einen Owner. Ein Wunsch ausserhalb der Baseline wird als Parametrisierung, Change oder Out-of-Scope klassifiziert.

Ein Change benoetigt Beschreibung, Nutzen, Aufwand, Terminwirkung und Entscheidung vor Umsetzung.
Die Referenzsimulation erzeugt keine Rechnung, Zahlung oder produktive Leistungsbehauptung.

## Standardgrenze fuer Mandantenanlage und Konfigurationspakete

Das Produkt umfasst die kontrollierte Anlage genau einer leeren Sandboxgesellschaft und drei abhaengige Konfigurationspaketwellen.
Die Uebergabe an Setup, Daten und UAT wird dokumentiert.
Ein leeres Paketgeruest ist noch kein Lieferergebnis; Tabellen, Felder, Daten und Buchungswirkung entstehen erst nach fachlichem Review und bestandenem Ausfuehrungsgate.

Firmenkopie, Produktivdaten, weitere Gesellschaften und gebuchte historische Ledger-Tabellen sind nicht Bestandteil der Standardbaseline.
Das gilt ebenso fuer echte Steuer-/Bankkennungen und produktiven Betrieb.
Eine Kopie ist kein Backup und wird nur als eigener Change mit Quelle, Ziel, Sperrfenster, Datenschutz, Nachpruefung und Rollback bewertet.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-220","title":"05 Angebot, Aufwand und Voraussetzungen","parent":null,"version":2,"status":"published"} -->
