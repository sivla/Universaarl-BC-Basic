---
id: UABC-BCBDELIVERABLES
title: Lieferergebnisse und Handbuecher
parent: UABC-BCBPROJECT
owners: [P-002, P-016]
status: Geplant
jiraRefs: [UABC-25, UABC-29, UABC-33, UABC-34, UABC-36, UABC-37, UABC-38]
referenceIds: [UABC-REQ-BCB-006, UABC-REQ-BCB-007, UABC-REQ-BCB-010, UABC-REQ-BCB-011]
lastReviewed: 2026-07-11
---

# Lieferergebnisse und Handbuecher

Das maschinenlesbare Lieferregister liegt unter `project/bc-basic/deliverables.yaml`. Es enthaelt neun Lieferergebnisse mit Phase, Eigentuemer, Jira-Bezug, Quellpfaden, Planstatus und leerem Abschlussnachweis. Vorlagen und Plaene behaupten keine Ausfuehrung.

## Datenanforderungen

`project/bc-basic/data-package.yaml` beschreibt acht synthetische Datenobjekte und den Konfigurationspaketplan. Jedes Objekt verweist auf eine getrennte Blankovorlage mit Struktur, Feldbeschreibung und Wertregeln sowie auf eine vollstaendig synthetische Beispieldatei. `project/bc-basic/data-readiness-check.yaml` prueft Vollstaendigkeit, Eindeutigkeit, Buchungsgruppenabhaengigkeiten, Summen, synthetische Klassifikation und offene Freigaben. Konfigurationspakete bleiben Dienstleisterwerkzeug; ihre Erstellung und Pflege ist kein Schulungsinhalt.

## UAT-Grundlage

`project/bc-basic/uat-catalog.yaml` enthaelt genau sieben geplante Pflichtfaelle fuer Navigation und Look-and-Feel, Einkauf, Verkauf, einfachen Bestand, Finance und Abstimmung, Monatsabschlussprobe sowie UStVA-Vorschau ohne Uebermittlung. Die Faelle sind nicht ausgefuehrt und besitzen keinen Abnahme- oder Erfolgsnachweis.

## Schulungsartefakte

`project/bc-basic/training-plan.yaml` trennt Lernziel, Agenda, Uebung und Planungsbezug von spaeterem Ausfuehrungstranskript, Anwesenheit, Uebungsergebnis, offenen Fragen und Kompetenzpruefung. Die Ausfuehrungsfelder bleiben leer.

## Dokumentation und Schulungsunterlagen

- Einsteigerunterlage: `docs/guides/beginner/business-central-basic.md`.
- Beratungs- und Ausfuehrungsunterlage: `docs/runbooks/business-central-basic.md`.

Beide Dokumente sind strukturierte Lieferentwuerfe mit Quellen-, Versions-, Szenario- und Nachweisbezug. Erst `UABC-38` darf sie nach echter Pruefung als uebergeben kennzeichnen.

## Projekt-Twin

Der Projekt-Twin liest ausschliesslich `exports/project-data/v1/index.yaml`. Von dort aus darf er nur positivgelistete relative Quellpfade und bei gemeinsam genutzten Dateien nur den deklarierten Selektor aufloesen. Links oder Verweise innerhalb einer Quelle erweitern den Leseumfang nicht. Fehlende Werte bleiben leer; eine zweite Datenquelle oder erfundene Ersatzwerte sind verboten.

<!-- story-metadata {"id":"PAGE-UABC-130","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
