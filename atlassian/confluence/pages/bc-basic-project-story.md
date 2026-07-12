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

## Abschlusskontrolle mit Spectra 0.9

Der Abschluss verbindet die Angebotsstände mit `evidence/simulation/project-reconciliation.json`: historische Baseline 68 Stunden/11.050 EUR, synthetisches Angebot und Ist jeweils 80 Stunden/9.600 EUR. Die Abweichung ist als Fortschreibung des vollständigen Playthrough-Scopes begründet; eine reale Rechnung oder produktive Leistung wird nicht behauptet.

`evidence/simulation/adapter-provenance.json` bindet den einzigen Branch-Index read-only an `exports/project-data/v1/twin-export-map.json`. Source-Hash vor und nach der Projektion sind identisch, die Mappingversion ist fest, und weder Twin noch Adapter besitzen Schreib- oder Überschreibrecht. BC Basic bleibt die alleinige fachliche Source of Truth.

<!-- story-metadata {"id":"PAGE-UABC-150","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
