---
id: UABC-BCBPROJECT
title: BC Basic V1 Standardprodukt
parent: UABC-PROJECT
owners: [P-001, P-002]
status: V1 kundenbereit
jiraRefs: [UABC-18, UABC-19, UABC-20, UABC-21]
referenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-002, UABC-REQ-BCB-004]
lastReviewed: 2026-09-03
---

# BC Basic V1 Standardprodukt

BC Basic V1 ist ein wiederverwendbares, standardnahes Einführungspaket für eine Gesellschaft und einen einfachen Lagerort. Die Universaarl-Referenzsimulation ist vollständig von Angebot bis Hypercare durchgespielt und mit `V1_STANDARDPRODUCT_READY` abgenommen. Sie ist keine reale Kundenlieferung oder BC-Ausführung.

## Drei Wahrheiten

- **Wiederverwendbare Vorlage:** Pläne, Datenvorlagen, UAT- und Trainingskataloge bleiben für jede neue Kundeninstanz zunächst `planned` und werden kundenspezifisch parametrisiert.
- **Referenzsimulation:** 80 Stunden/9.600 EUR, Prozesse, Daten, Konfiguration, UAT, Training, Cutover, Restart, Hypercare und neun Deliverables sind synthetisch abgeschlossen.
- **Reale Kundeninstanz:** Tenant, Benutzer, Lizenzen, Konten, Steuerwerte, reale Daten, Sandboxbuchungen und Freigaben werden über `UABC-GATE-BCB-PHASE2-001` neu bestätigt.

## Leistungsweg und Scope

**Angebot → Kundenvorbereitung → drei Workshops → Setup/Migration → UAT → Mock-Cutover → Go-live/Hypercare.** Enthalten sind Finance, P2P, O2C, Zahlung/Bank, Mahnung, einfacher Bestand, Monatsabschluss/VAT-Vorschau, Rollen/SoD, Training, Support und Handover. Erweiterungen, Integrationen, E-Rechnung, erweitertes Lager, Produktion, Projekte, Service, Anlagen, Intercompany, produktive Bank-/ELSTER-Übermittlung sowie Steuer-/Rechtsberatung sind ausgeschlossen oder Change.

## V1-Ergebnis

- Produktangebot: 80 Stunden zu 120 EUR = 9.600 EUR netto.
- sieben Entscheidungsbereiche, acht Datenvorlagen, drei Migrationswellen;
- reproduzierbare Konfiguration mit SoD- und Berechtigungsproben;
- sieben UAT-Fälle, vier Operatorpfade, P1/P2 am Exit = 0;
- Cutover, Restart, drei Hypercaretage und neun Lieferobjekte synthetisch bestanden;
- Spectra 0.10 gebunden, Branchvertrag und Twin-Allowlist validiert.

Der historische 68-Stunden-/11.050-EUR-Plan bleibt nachvollziehbare Baseline, ist aber kein aktuelles Angebot. Kundenspezifische Parameter sind keine V1-Produktlücke, sondern Eingangswerte der realen Kundeninstanz.

<!-- story-metadata {"id":"PAGE-UABC-090","parent":"PAGE-UABC-000","version":2,"status":"published"} -->
