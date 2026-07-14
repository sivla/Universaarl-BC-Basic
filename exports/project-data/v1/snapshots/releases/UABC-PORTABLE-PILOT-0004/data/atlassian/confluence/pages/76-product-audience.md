---
id: UABC-PRODUCTAUDIENCE
title: 01 Zielgruppe und Einsatzfaelle
parent: null
owners:
  - P-002
status: published
version: 2
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 1
storyPageId: PAGE-UABC-200
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

# 01 Zielgruppe und Einsatzfaelle

## Geeignete Zielkunden

BC Basic richtet sich an kleine und mittlere Handels- oder Dienstleistungsunternehmen. Eine einzelne Gesellschaft soll Finanzbuchhaltung, Einkauf, Verkauf, Zahlung, einfaches Lager und Monatsabschluss im Business-Central-Standard abbilden.

Das Paket passt, wenn wenige Key User Entscheidungen zeitnah treffen, die Datenmenge ueberschaubar ist und Standard vor Sonderloesung gilt.

## Typische Einsatzfaelle

- Finanzbuchhaltung mit Debitoren, Kreditoren, Bankabstimmung und VAT-/USt-Vorschau;
- Einkauf vom Auftrag bis Rechnung, Zahlung und Ausgleich;
- Verkauf vom Auftrag bis Rechnung, Zahlungseingang und Ausgleich;
- ein oder wenige Lagerorte mit Bestand, Inventur und Bewertung;
- strukturierte Datenuebernahme in drei Wellen sowie rollenbezogene UAT und Schulung.

Der Referenzfall zeigt eine synthetische Gesellschaft mit diesen Prozessen. Er ist ein fachlicher Nachweis des Vorgehens, aber keine Behauptung ueber einen realen Tenant.

## Wann das Paket nicht passt

Produktion, Service, Projekte, komplexes Warehouse Management, Intercompany und Konsolidierung gehoeren nicht in die Standardbaseline. Das gilt auch fuer kundenspezifische AL-Entwicklung oder umfangreiche Integrationen.

Rechts- und Steuerberatung sowie produktive Bank-, E-Mail- oder ELSTER-Uebermittlung sind ebenfalls ausgeschlossen. Solche Anforderungen werden vor Beauftragung als Option, Change oder Out-of-Scope eingeordnet.

## Qualifizierungsfragen

1. Reicht der beschriebene Prozessstandard fuer mindestens 80 Prozent der Geschaeftsfaelle?
2. Sind Sponsor, Prozessowner, Datenowner und Key User verfuegbar?
3. Koennen Konten, VAT-/USt-Logik, Bankverfahren und Rollen vor Setup bestaetigt werden?
4. Ist eine getrennte Sandbox mit ruecksetzbarem Teststand vorhanden?
5. Gibt es Sonderloesungen, deren Nutzen und Aufwand vor Projektstart entschieden werden muessen?

Ein Nein beendet nicht automatisch das Vorhaben, macht aber eine Fit-to-Standard-Entscheidung vor dem Angebot erforderlich.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-200","title":"01 Zielgruppe und Einsatzfaelle","parent":null,"version":2,"status":"published"} -->
