---
id: UABC-ARCHIVE
title: 99 Archiv
parent: null
owners:
  - P-002
status: published
version: 3
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 5
storyPageId: PAGE-UABC-190
purpose: Diese Seite fuehrt konkrete Universaarl-Projektwahrheit.
audience:
  - Kunde
  - Projektleitung
  - Key User
  - Consultant
jiraRefs:
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
---

# 99 Archiv

## Archivregel

Diese Seite verzeichnet abgeloeste Kundenprojektinhalte. Ein Archiveintrag benoetigt Archivdatum, Grund, fruehere ID beziehungsweise Pfad und eine aktive Nachfolgeseite. Inhalte werden nicht geloescht, um Entscheidungen, Ticketbezug und Auditspur zu erhalten.

## Aktueller Bestand

Der fruehere flache Projektseitenbaum wurde am 12. Juli 2026 in die Drei-Space-Navigation ueberfuehrt. Die 19 bestehenden Dokument-IDs und Quellpfade blieben erhalten. Titel und Parents werden durch die Migrationsmatrix im Drei-Space-Vertrag nachgewiesen.

Neun ergaenzte Rootseiten schliessen Produkt- und Consulting-Luecken, ohne die Kundenstory zu ersetzen.

### UABC-HIST-REFSIM-001 – abgelöste Repository-Referenzsimulation

- **Klassifikation:** `historical-reference-simulation`, `currentAuthority=false`.
- **Historische Version:** Angebotsversion 3 vom 29.05.2026, Status `synthetic-closed`.
- **Archivdatum:** 13.07.2026.
- **Archivgrund:** Der tatsächliche Playthru-Pilot wurde auf die CRONUS-Demo-Ausgangsbasis rebaselined. Alte Abschluss-, Worklog-, Cutover-, Hypercare- und Handoverwerte dürfen keine aktuelle Erfüllung bilden.
- **Historische Provenienz:** `evidence/simulation/project-completion.yaml`, `evidence/simulation/billing-reconciliation.yaml`, `UABC-DEC-BCB-008` und Git-Historie vor dem Pilot-Rebaseline.
- **Ausschluss:** Historische Ticket-, Stunden-, Kosten-, Defect- und Statuswerte speisen weder aktives Jira-Materialisat noch Rollups, Snapshotstatus oder Twin-Ticketlisten.
- **Aktive Nachfolger:** `UABC-BCBSTORY`, `UABC-BCBDELIVERABLES`, `UABC-WALKTHROUGH` und `UABC-BCBHCSTORY`.

Aktive Nachfolger:

- Projektverlauf und Status: `UABC-BCBSTORY`;
- kundenspezifische BC-Ausgestaltung: `UABC-BCBDELIVERABLES`;
- Schulung und Bedienung: `UABC-HYPERCARE`;
- Produktstandard: `UABC-BCBPROJECT`;
- interne Durchfuehrungsmethode: `UABC-BLUEPRINT`.

## Nicht im Archiv

Aktuelle Evidence, offene Entscheidungen und Supportrestpunkte bleiben an ihrer fuehrenden Seite. Das Archiv ist weder zweite Projektstory noch Ablage fuer Secrets oder Live-Systemexporte.

## Referenzen

- Drei-Space-Vertrag: `project/bc-basic/confluence-three-space-v1.yaml`
- Projektstory: `evidence/simulation/project-story.json`

<!-- story-metadata {"id":"PAGE-UABC-190","title":"99 Archiv","parent":null,"version":3,"status":"published"} -->
