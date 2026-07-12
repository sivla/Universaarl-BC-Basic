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
  Projektabschluss zusammen.
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
lastReviewed: 2026-09-03
version: 5
---

# 03 Projekte

## Managementsicht

Diese Seite ist die Managementsicht auf die vollständige synthetische Projektstory. Sie verbindet Angebot, Phasen, Tickets, Entscheidungen, Risiken, Evidence, Hypercare und Handover, ohne die fachlichen Detailseiten zu duplizieren.

## Projektstatus und Abschlussaussage

Das Projekt ist als `V1_STANDARDPRODUCT_READY` und `GO_SIMULATION` abgeschlossen. Alle 13 Simulationsphasen, neun Lieferobjekte und internen Prozessgates sind bestanden; reale Produktivnutzung wird ausdrücklich nicht behauptet.

## Projektverlauf, Steuerung und Ticketwahrheit

### Projektkennzahlen

| Kennzahl | Abgeschlossener Stand | Aussage |
|---|---|---|
| Angebot | drei Versionen | aktuell 80 Stunden und 9.600 EUR netto |
| Tickets | 17 abgeschlossen | mit Historie, Worklog und Abschlusskommentar |
| Worklogs | 17 Einträge, 80 Stunden | synthetischer Angebots-/Ist-Abgleich geschlossen |
| Projektstory | 15 Ereignisse | vom Angebot bis Hypercare-Exit |
| Hypercare | drei Tage | P1 = 0 und P2 = 0 am Exit |
| Relationen | 252 native Kanten | Projektstory referenziell verbunden |

### Zeitstrahl und Gates

#### Angebot und Projektstart

Das Angebot wurde als 80-Stunden-Paket zu 9.600 EUR synthetisch beauftragt. Scope, Rollen, Mitwirkung, Change-Regel und Wahrheitsgrenze wurden im Projektstart festgehalten.

#### Discovery und Design

Drei Workshops führten zu `GO_DISCOVERY_SIMULATION`. Sieben Entscheidungsbereiche decken Finance/VAT, Dimensionen, Prozesse, Cash/Bank, Daten, Rollen und Cutover ab.

#### Einrichtung und Migration

Die Basiskonfiguration wurde in Abhängigkeitsreihenfolge vorbereitet. Acht Vorlagenpaare und zehn Migrationsobjekte liefen in drei Wellen mit Fehlerkorrektur, Wiederholung und Abstimmung.

#### Prozesse, UAT und Training

P2P, O2C, Cash/Bank, Lager, Monatsabschluss und VAT-Vorschau wurden mit konsistenten Belegen und Ledger Entries durchgespielt. Sieben UAT-Fälle und vier Operatorpfade wurden synthetisch bestanden.

#### Cutover und simulierter Go-live

Mock-Cutover, `GO_SIMULATION`, Rollback- und Restartweg wurden anhand definierter Entry-/Exit-Kriterien entschieden. Der simulierte Go-live war eine Repository-Generalprobe und kein Produktivstart.

#### Hypercare und Abschluss

Drei Hypercaretage behandelten Zahlungsausgleich, Inventurdifferenz und VAT-Wahrheitsgrenze. Alle Defects wurden korrigiert und retestet; das Projekt ging mit null offenen P1/P2 in Handover und Supportstart.

### Kaufmännische Steuerung

Die historische Baseline von 68 Stunden zu 162,50 EUR ergab 11.050 EUR. Sie wurde durch das aktuelle Standardangebot mit 80 Stunden zu 120 EUR und 9.600 EUR ersetzt. Angebot und synthetisches Ist sind ohne Abweichung geschlossen.

Die 18/40/10-Stunden-Werte in `project-plan.yaml` bleiben deshalb ausdrücklich die historische Planvorlage. Die aktuelle 80-Stunden-Verteilung stammt aus den Angebotsversionen und den 17 Ticket-Worklogs; sie wird nicht mit der Vorlage zusammengerechnet.

Die Werte sind eine Simulationsrechnung. Sie belegen keine reale Rechnung, Zahlung, Freigabe oder produktive Leistung.

### Entscheidungen, Risiken und Maßnahmen

Entscheidungen besitzen Owner, Alternativen, Auswirkung und Evidence.
Risiken werden nicht durch einen grünen Simulationsstatus verborgen: Kundenparameter, Steuer-/Rechtsreview, Tenant, reale Daten, Rollen und Sandboxverhalten bleiben Entry-Punkte.

Meetings führen zu Ticket oder Entscheidung. Ein Ticket ist nur abgeschlossen, wenn Akzeptanzkriterien, Evidence, Test beziehungsweise Retest und Abschlusskommentar vorliegen.

### Ticketwahrheit und Zählregel

Die 17 Records in `bc-basic-story-tickets.yaml` bilden den kanonischen kundenlesbaren Projektverlauf. Nur diese Menge zählt in Angebot, Worklogs, 80-Stunden-Ist, Timeline, Status und Abschlusskennzahlen.

Weitere 38 ältere Issues aus Projekt-, Blueprint-, Umgebungs- und Walkthrough-Planung bleiben als interne historische Traceability erhalten.
Sie erklären Vorbereitung und Herkunft einzelner Anforderungen, sind aber kein zweites Kundenbacklog.
Sie werden nicht zu den 48 kundenlesbaren Tickets oder den 19 abrechenbaren Task-Worklogs addiert.

Der Twin erhält für jedes sichtbare Ticket den expliziten kanonischen Typ, die Parent-Beziehung, die Sichtbarkeitsrolle und den Zählbereich. Typen werden weder aus Ticket-Key noch Titel oder Großschreibung erraten.

### Spectra und Twin

Spectra `0.10.0-alpha.1` ist unveränderlich gebunden. BC Basic bleibt fachliche Source of Truth; der Twin liest ausschließlich positivgelistete Artefakte aus einem validierten Commit und besitzt kein Schreibrecht.

Die aktuelle Space-Struktur ordnet Kundendokumentation, Standardprodukt und internes Consultant-Handbuch getrennt. Externe Confluence-URLs, Page-IDs oder Space-Keys werden ohne belegte Quelle nicht erfunden.

## Reale Entry-Parameter und verbleibende Grenzen

- **Synthetisch abgeschlossen:** Scope, Budgetabgleich, Discovery, Setup, Migration, UAT, Training, Cutover, Go-live-Rehearsal, Hypercare, Restart und Handover.
- **Entry-Gate einer realen Instanz:** Gesellschaft, Lizenz, Tenant, Konten/VAT, Daten, Benutzer/Rollen, Bank, Sandbox, Support und rechtlich/steuerliche Bestätigung.
- Diese Parameter sind keine offenen Defects der Referenzsimulation. Sie werden im nächsten Kundenprojekt bewusst neu entschieden und belegt.

## Referenzen

- [Maschinenlesbare Story](../../../evidence/simulation/project-story.json)
- [Narrative Chronik](../../../docs/reports/bc-basic-project-chronicle.md)
- [Entscheidungsregister](../../../project/bc-basic/decision-register.yaml)
- [Historische Planvorlage und Projektsteuerung](../../../project/bc-basic/project-plan.yaml)
- [Jira-ähnliche Projektwelt](../../jira/issues/bc-basic-project.yaml)
- [Abschlussstatus](../../../evidence/simulation/project-completion.yaml)
- [Aktueller Angebots-/Ist-Abgleich](../../../evidence/simulation/project-reconciliation.json)
- [Twin-Allowlist](../../../exports/project-data/v1/index.yaml)

<!-- story-metadata {"id":"PAGE-UABC-150","title":"03 Projekte","parent":null,"version":5,"status":"published"} -->
