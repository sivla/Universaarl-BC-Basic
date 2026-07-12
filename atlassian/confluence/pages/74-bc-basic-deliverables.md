---
id: UABC-BCBDELIVERABLES
title: V1-Liefer- und Abnahmeübersicht
parent: UABC-BCBPROJECT
owners: [P-002, P-016]
status: Synthetisch abgeschlossen
jiraRefs: [UABC-25, UABC-29, UABC-33, UABC-34, UABC-36, UABC-37, UABC-38]
referenceIds: [UABC-REQ-BCB-006, UABC-REQ-BCB-007, UABC-REQ-BCB-010, UABC-REQ-BCB-011]
lastReviewed: 2026-09-03
---

# V1-Liefer- und Abnahmeübersicht

Das kanonische Register bleibt `project/bc-basic/deliverables.yaml`. Die folgende Kundensicht verbindet Versprechen, Referenzergebnis und reale Parametrisierung, ohne eine zweite Wahrheit zu erzeugen.

| Lieferobjekt | Versprechen und synthetisches Ergebnis | Abnahmekriterium / Evidence | Realer Parameter | Owner |
|---|---|---|---|---|
| `UABC-DEL-BCB-001` | Projektauftrag, Scope, Fast-Track und Abnahmeplan abgeschlossen | Angebot, Projektplan, `project-completion.yaml` | Personen, Termine, Vertragsfreigabe | `P-002` |
| `UABC-DEL-BCB-002` | Discovery, Fit/Gap und sieben Entscheidungen abgeschlossen | Discovery, Entscheidungsregister, `GO_DISCOVERY_SIMULATION` | Konten, Steuer-, Bank-, Freigabe- und Lagerentscheidungen | `P-002` |
| `UABC-DEL-BCB-003` | acht Vorlagen, zehn Objekte und drei Migrationswellen geprüft | Datenbereitschaft, Summen-/Referenzkontrollen | Quellsysteme, Mengen, reale Salden und Owner | `P-016` |
| `UABC-DEL-BCB-004` | Standardkonfiguration und SoD-Baseline synthetisch geprüft | Setupfolge, Preview Posting, Berechtigungsproben | Tenantfelder, Apps, Permission Sets, echte Benutzer | `P-002` |
| `UABC-DEL-BCB-005` | vier Rollenpfade mit Fall, Fehler, Retest und Kompetenzpass | Trainingsplan und Operator-Smoke-Test | Teilnehmer, Berechtigungen, reale Übungsergebnisse | `P-002` |
| `UABC-DEL-BCB-006` | sieben UAT-Pflichtfälle und Defect-/Retestweg bestanden | UAT-Run, Evidence vollständig, P1/P2 = 0 | echte Key User, Seiten und Sandboxbuchungen | `P-002` |
| `UABC-DEL-BCB-007` | Cutover, Restart und drei Hypercaretage abgeschlossen | `project-completion.yaml`, tägliches GO, Exit | Freezezeit, Restorepunkt, Supportkontakte | `P-005` |
| `UABC-DEL-BCB-008` | VAT-/UStVA-Vorschau abgestimmt, nicht übermittelt | VAT 70,30 EUR, Nichtübermittlung belegt | Steuerkennzeichen, Konten, Steuerberaterbestätigung | `P-005` |
| `UABC-DEL-BCB-009` | Dokumentation, Supportdiagnose und Twin-Übergabe vollständig | Handover, Branch-Index, Snapshotvalidator | Betreiber, SLA, Tenant-/Produktionsannahme | `P-002` |

## Messbare V1-Abnahme

`V1_STANDARDPRODUCT_READY` gilt, weil 80 Stunden/9.600 EUR abgeglichen, sieben Entscheidungen bearbeitet, acht Vorlagen und drei Wellen vorhanden, Buchungs-/Abstimmkontrollen ohne unerklärte Differenz, sieben UAT-Fälle und vier Operatorpfade vollständig, P1/P2 = 0, Cutover/Restart/Hypercare bestanden, neun Deliverables synthetisch abgeschlossen sowie Spectra-0.10-, Snapshot- und Twin-Vertrag validiert sind.

Für einen echten Kunden wird dieselbe Matrix neu befüllt. Das Entry-Gate bleibt geschlossen, bis reale Entscheidungen, Daten, Rollen und Sandboxvoraussetzungen nachgewiesen sind.

<!-- story-metadata {"id":"PAGE-UABC-130","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
