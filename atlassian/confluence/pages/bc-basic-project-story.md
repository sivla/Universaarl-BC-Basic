---
id: UABC-BCBSTORY
title: 03 Projekte
parent: null
owners:
  - P-001
  - P-002
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 3
storyPageId: PAGE-UABC-150
purpose: Führt Status, Zeitstrahl, Entscheidungen, Risiken, Budget und
  offene Projektgates zusammen.
audience:
  - Steering
  - Projektleitung
  - Kunde
  - Kontrollzentrum
jiraRefs:
  - UABC-32
  - UABC-33
  - UABC-46
  - UABC-47
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-001
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-004
  - UABC-REQ-BCB-005
  - UABC-REQ-BCB-010
  - UABC-REQ-BCB-011
lastReviewed: 2026-07-13
version: 7
---

# 03 Projekte

## Managementsicht

Diese Seite ist die Managementsicht auf den neu gestarteten Playthru-Pilot. Sie verbindet Angebot, Phasen, Tickets, Entscheidungen, Risiken und Evidence, ohne die fachlichen Detailseiten zu duplizieren. Die frühere Referenzsimulation ist nur historische Provenienz und kein aktiver Projektstand.

## Projektstatus und Wahrheitsgrenze

Der aktuelle Lauf steht auf `current-pilot-planning`. `UABC-BASIC-DE` ist eine CRONUS-Demo-Ausgangsbasis; ein eingerichteter Kundenpilot ist nicht belegt.

`pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending` bleiben verbindlich, bis Wave-0, Resetpunkt, kontrollierte Zielentscheidung und spätere Soll-/Ist-Readbacks belegt sind.

Die Zielstrategie ist `blocked-pending-wave0-and-reset-evidence`; es ist noch keine Option ausgewählt. `W0-01-read-company-identity` ist der nächste ausführbare, ausschließlich lesende BC-Schritt.

## Projektverlauf, Steuerung und Ticketwahrheit

### Projektkennzahlen

| Kennzahl | Aktueller Stand | Aussage |
|---|---|---|
| Angebotsplan | 80 Stunden und 9.600 EUR netto | Planwert, nicht Ist oder Kundenabnahme |
| Ist | 0 Stunden und 0 EUR | ausschließlich aus aktiven Task-Worklogs abgeleitet |
| Tickets | dynamisch aus `project-story.json` | genau UABC-1/2/3 sind Phase-Roots; keine feste Gesamtzahl |
| Setup | unveränderte Standard-CRONUS-Demo-Baseline | Pilotaufbau, Wave-0 und Resetentscheidung stehen aus |
| BC-Schreibfreigabe | gesperrt | `writesAuthorized=false`; RUN-06 bis RUN-22 bleiben NO-GO |
| Zukunftsgates | offen | Migration, Prozesse, Training, UAT, Cutover, Hypercare, Retro und Supportübergabe sind nicht ausgeführt |

### Zeitstrahl und Gates

#### Angebot und Projektstart

Der Angebotsplan umfasst 80 Stunden zu 9.600 EUR. Ein Kundenabschluss oder eine reale Beauftragung wird daraus nicht abgeleitet. Scope, Rollen, Mitwirkung, Change-Regel und Wahrheitsgrenze werden im Projektstart prüfbar festgehalten.

#### Discovery und Design

Discovery und Design strukturieren Finance/VAT, Dimensionen, Einkauf, Verkauf, Lager, Daten, Rollen, Cutover und Support. Nur repositorybelegte Vorbereitung darf als erledigt gelten; fachliche Entscheidungen bleiben bis zur jeweiligen Evidence offen.

#### Einrichtung und Migration

Vor jeder Basiskonfiguration muss Wave-0 interne Company-ID, technischen Namen, Name, Display Name, CRONUS-Provenienz, Resetpunkt und die Entscheidung zwischen kontrollierter Weiterverwendung und Neuanlage beziehungsweise Kopie belegen. Setup und Migration sind noch nicht ausgeführt.

#### Prozesse, UAT und Training

P2P, O2C, Lager, Monatsabschluss, VAT-Vorschau, Training und UAT sind als offene Arbeit geplant. Ein bestandener Prozess, Ledger-Readback, Retest oder Schulungsnachweis wird erst nach tatsächlicher Ausführung und gültiger aktueller Evidence ausgewiesen.

#### Cutover und simulierter Go-live

Cutover und eine spätere Simulationsabnahme besitzen Entry-, Exit-, Rollback- und Restartkriterien. Sie bleiben offen; es gibt weder einen Produktivstart noch eine reale Kundenfreigabe.

#### Hypercare und Abschluss

Hypercare-Szenarien, Retro, Restpunkte, Handover und Supportstart sind zukünftige Arbeit. Ein Defect entsteht erst aus einer realen Beobachtung; Fix und Retest dürfen nicht vorweggenommen werden. Die spätere Übergabe setzt belegten Cutover, Hypercare-Abschluss und Simulationsabnahme voraus.

### Kaufmännische Steuerung

Der aktive Plan beträgt 80 Stunden und 9.600 EUR. Aktuelles Ist sind 0 Stunden und 0 EUR, dynamisch aus den vorhandenen aktiven Task-Worklogs abgeleitet. Plan und Ist werden nicht gleichgesetzt.

Die frühere Kalkulation und abgeschlossene Referenzsimulation bleiben historische Provenienz; sie belegen keine aktuelle Rechnung, Zahlung, Freigabe oder produktive Leistung.

### Entscheidungen, Risiken und Maßnahmen

Entscheidungen besitzen Owner, Alternativen, Auswirkung und Evidence. Risiken werden nicht durch einen historischen Simulationsstatus verborgen: CRONUS-Ausgangsdaten, Kundenparameter, Steuer-/Rechtsreview, reale Daten, Rollen und Sandboxverhalten bleiben Entry-Punkte.

Meetings führen zu Ticket oder Entscheidung. Ein Ticket ist nur abgeschlossen, wenn Akzeptanzkriterien, Evidence, Test beziehungsweise Retest und Abschlusskommentar vorliegen.

### Ticketwahrheit und Zählregel

`evidence/simulation/project-story.json` ist die einzige aktive kanonische Projektstory. `bc-basic-story-tickets.yaml` ist ausschließlich ihr deterministisches Jira-Materialisat.

Ticketgesamtzahl, Typmengen, Statussummen, Iststunden und Istkosten werden aus der aktiven Quelle abgeleitet und nicht auf eine historische Sollmenge festgesetzt.

UABC-1, UABC-2 und UABC-3 sind die drei Phase-Roots. Die Hierarchie lautet Phase → Epic → Story/Bug → Task. Ausschließlich Tasks dürfen abrechenbar sein oder Worklogs besitzen.

Historische Abschlussdaten verbleiben in Git-Historie beziehungsweise klar gekennzeichneter Provenienz und fließen nicht in aktive Rollups oder Materialisierung ein.

Der Twin erhält für jedes sichtbare Ticket den expliziten kanonischen Typ, die Parent-Beziehung, die Sichtbarkeitsrolle und den Zählbereich. Typen werden weder aus Ticket-Key noch Titel oder Großschreibung erraten.

### Spectra und Twin

Spectra `0.10.0-alpha.1` ist unveränderlich gebunden. BC Basic bleibt fachliche Source of Truth; der Twin liest ausschließlich positivgelistete Artefakte aus einem validierten Commit und besitzt kein Schreibrecht.

Die aktuelle Space-Struktur ordnet Kundendokumentation, Standardprodukt und internes Consultant-Handbuch getrennt. Externe Confluence-URLs, Page-IDs oder Space-Keys werden ohne belegte Quelle nicht erfunden.

## Reale Entry-Parameter und verbleibende Grenzen

- **Belegt:** repositorybasierte Vorbereitung und read-only beobachtete Standard-CRONUS-Demo-Ausgangsbasis.
- **In Bearbeitung beziehungsweise blockiert:** Phase 1 sowie die abhängigen Phase-Roots, Wave-0, Ziel- und Resetentscheidung.
- **Offen:** Setup, Datenmigration, Prozessläufe, Training, UAT, Cutover, Hypercare, Retro, Simulationsabnahme und Supportübergabe.
- **Nicht autorisiert:** BC-Schreibschritte RUN-06 bis RUN-22 sowie jede Produktiv- oder Kundenabnahmebehauptung.

## Referenzen

- [Maschinenlesbare Story](../../../evidence/simulation/project-story.json)
- [Narrative Chronik](../../../docs/reports/bc-basic-project-chronicle.md)
- [Entscheidungsregister](../../../project/bc-basic/decision-register.yaml)
- [Aktueller Projektplan](../../../project/bc-basic/project-plan.yaml)
- [Historische Jira-Referenzsimulation](../../jira/issues/bc-basic-project.yaml)
- [Historischer Abschlussstatus ohne aktuellen Rollupbeitrag](../../../evidence/simulation/project-completion.yaml)
- [Aktueller Angebots-/Ist-Abgleich](../../../evidence/simulation/project-reconciliation.json)
- [Twin-Allowlist](../../../exports/project-data/v1/index.yaml)
- [Adapter-Provenienz](../../../evidence/simulation/adapter-provenance.json)
- [Twin-Exportmap](../../../exports/project-data/v1/twin-export-map.json)
- [Referenzgraph-Abdeckung](../../../evidence/simulation/reference-graph-coverage.json)
- [Nativer Referenzgraph](../../../exports/project-data/v1/reference-graph-native.json)
- [Referenzgraph-Mapping](../../../exports/project-data/v1/reference-graph-mapping.json)
- [Portabler Referenzgraph](../../../exports/project-data/v1/reference-graph-portable.json)

<!-- story-metadata {"id":"PAGE-UABC-150","title":"03 Projekte","parent":null,"version":7,"status":"published"} -->
