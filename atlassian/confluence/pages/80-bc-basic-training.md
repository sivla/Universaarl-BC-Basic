---
id: UABC-HYPERCARE
title: Operatortraining und Hypercare
parent: UABC-PROJECT
owners: [P-002, P-005, P-011, P-019]
status: Synthetisch abgeschlossen
jiraRefs: [UABC-33, UABC-34, UABC-35]
referenceIds: [UABC-REQ-BCB-007, UABC-REQ-BCB-010]
lastReviewed: 2026-09-03
---

# Operatortraining und Hypercare

Diese bestehende Story-Seite übersetzt den BC-Playthrough in tägliche Benutzerarbeit. Die Referenzsimulation ist abgeschlossen; ein echter Kunde wiederholt die Übungen mit eigenen Benutzern und Berechtigungen in seiner rücksetzbaren Sandbox.

## Lernfolge

Vormachen → begleitet durchführen → ohne Hilfe durchführen → Fehler diagnostizieren und retesten → korrekt eskalieren. Bestanden ist eine Rolle erst, wenn positiver Fall, Fehlerdiagnose und Retest ohne Hilfe gelingen.

| Rolle | Ohne-Hilfe-Nachweis | Pflichtkontrollen | Grenze |
|---|---|---|---|
| Administration `P-004` | Gesellschaft, Rolle, Datum, Nummernserie und Periode | Zielkontext und Zugriff | keine fachliche Buchung |
| Finance `P-005` | Zahlung/Bank, Abstimmung, Abschluss und VAT-Vorschau | Betrag, VAT, offene Posten, Bankdifferenz, Periode | keine Steuerentscheidung/Übermittlung |
| Handel `P-011` | P2P und O2C bis Ausgleich | Status, Menge, Preis, VAT, Partnerposten | kein eigenmächtiges Setup |
| Lager `P-019` | Bestand, Inventur, Differenz und Entries | Lagerort, Menge, Item/Value Entries, Wert | keine Bewertungsparameter |

`P-016` sichert Datenqualität; `P-001` entscheidet UAT, Cutover und Handover. Beide erhalten kein künstliches Endanwendertraining.

## Eskalation und Smoke-Test

Es gibt genau vier Ausgänge: selbst korrigieren, Key User, Consultant/Support und sofortiger Buchungsstopp. Am ersten Arbeitstag und zu jedem Hypercare-Tagesstart werden Zielkontext, Pflichtarbeitsliste, Testbeleg, Navigate/Find Entries und Supportweg geprüft. Bei unklarer Buchungs-, VAT-, Bestands- oder Datenschutzwirkung gilt sofortiger Buchungsstopp.

Ein Supportticket enthält Rolle, Umgebung, Version, Zeitpunkt, Seite/Aktion, Belegnummer, letzten erfolgreichen Schritt, Soll/Ist, Fehlertext, Kontrollwerte, sichere Evidence, Reproduktionsweg, Rücksetzpunkt, Auswirkung und Eskalationsausgang.

<!-- story-metadata {"id":"PAGE-UABC-170","parent":"PAGE-UABC-000","version":3,"status":"published"} -->
