# Angebot UABC-BCB-001 – BC Basic Fast-Track

## Aktueller Pilot-Rebaseline-Stand

Der aktive Angebotsstand `pilot-rebaseline-2026-07-13` ist **geplant und nicht als Kundenauftrag angenommen**. Der Plan umfasst 80 Stunden zu 120 EUR, insgesamt 9.600 EUR netto. Das aktuelle Ist beträgt 2,25 Stunden und 270 EUR und wird ausschließlich aus zwei aktiven Task-Worklogs abgeleitet: blockierter W0-01-Versuch sowie CORE-FINANCE-Repositoryvorbereitung ohne BC-Aktion. Es gibt keinen geschlossenen Ist-Abgleich, keine Unterschrift, keine Rechnung, keine Zahlung und keine reale Kundenfreigabe.

`UABC-BASIC-DE` ist derzeit eine Microsoft-CRONUS-Demo-Ausgangsbasis. Pilotkonfiguration, Migration, Prozessläufe, Training, UAT, Cutover, Hypercare und Handover stehen aus. Vor jedem Schreibschritt müssen Wave-0, Zielentscheidung und Resetpunkt belegt sein; `writesAuthorized=false` bleibt unverändert.

## Kundennutzen und geplanter Leistungsumfang

Das Angebot beschreibt einen standardnahen BC-Basic-Einführungsweg für eine Gesellschaft und einen einfachen Lagerort:

- Projektstart, drei Fit-to-Standard-Workshops und ein prüfbares Solution Design;
- Finance-Grundeinrichtung, Konten-/Buchungsmatrix, VAT, Dimensionen und Perioden;
- Einkauf, Verkauf, Zahlung/Ausgleich, einfache Mahnung und kontrollierte Bankabstimmung;
- einfache Artikel- und Lagerführung ohne Lagerplätze, Chargen oder Seriennummern;
- kontrollierte Datenvorlagen, Migrationswellen, Probeladung und Abstimmung;
- UAT-Pflichtfälle, rollenbezogene Schulung und Befähigungsnachweis;
- Mock-Cutover, Simulationsabnahme, Hypercare und Supportübergabe.

Diese Punkte sind Leistungsversprechen und noch keine ausgeführten Lieferergebnisse. Standard geht vor Sonderlösung; Abweichungen benötigen Nutzen, Aufwand, Prüfung und Change-Entscheidung.

## Nichtleistungen und Grenzen

Nicht enthalten sind Produktion, Service, Projekte, Anlagenbuchhaltung, Intercompany, Konsolidierung, erweitertes Lager, Erweiterungsentwicklung, Dataverse, E-Rechnung, produktive Bankanbindung, Zahlungsdateiübertragung, E-Mail-Versand, ELSTER-Übermittlung, Steuer- oder Rechtsberatung sowie ein historischer Vollimport gebuchter Bewegungen. Kundenspezifische Reports, Dokumentlayouts und Integrationen benötigen einen Change.

## Rollen und minimale Mitwirkung

- `P-PILOT-LEAD-001` verantwortet vendorseitig Projektleitung, Lead Consulting und Solution Architecture.
- `P-001` steht für die noch zu besetzende Sponsor-/Entscheiderrolle.
- `P-005` steht für Finance, VAT und Monatsabschluss.
- `P-011` steht für Einkauf, Verkauf, Forderungen und Verbindlichkeiten.
- `P-016` steht für Datenlieferung und Datenqualität.
- `P-019` steht für Artikel, Lager und Inventur.

Die Kundenrollen bleiben als Actor-Refs typisiert; reale Personennamen und eine Kundenannahme werden nicht erfunden.

## Kürzester realistischer Einführungsweg

**Angebotsplanung → Kundenvorbereitung → Discovery → Wave-0/Resetpunkt → Setup/Migration → UAT/Training → Mock-Cutover → Hypercare/Handover**

Jeder Übergang benötigt die im Projektvertrag benannte Evidence. Ein offenes Gate bleibt offen und darf nicht durch historische Simulationsevidence erfüllt werden.

## Stunden und Preis – Plan

| Phase | Planstunden | Plankosten netto | Geplantes Kundenergebnis |
|---|---:|---:|---|
| Auftrag und Scope | 6 | 720 EUR | Rollen, Termine und Produktgrenze |
| Discovery und Daten | 18 | 2.160 EUR | Entscheidungen, Solution Design und Datenbereitschaft |
| Setup und Prozesse | 28 | 3.360 EUR | Konfiguration, Migration und E2E-Kontrollen |
| UAT, Training und Cutover | 16 | 1.920 EUR | Simulationsabnahme, Befähigung und Cutover-Gate |
| Hypercare und Handover | 12 | 1.440 EUR | Stabilisierung und Supportübergabe |
| **Gesamtplan** | **80** | **9.600 EUR** | **vollständiges BC-Basic-Paket** |

**Aktuelles Ist:** 2,25 Stunden, 270 EUR, zwei Task-Worklogs auf `UABC-39` und `UABC-40`; keine BC-Aktion, Rechnung oder Zahlung.

## Versionen und Nachweisgrenze

- **Aktiver Pilot-Rebaseline-Stand, 13.07.2026:** `planned-not-accepted`; Plan 80 Stunden/9.600 EUR, Ist 2,25 Stunden/270 EUR aus zwei aktiven Task-Worklogs.
- **Historische Referenzsimulation, Version 3 vom 29.05.2026:** `synthetic-closed`, abgelöst und ausschließlich Historienprovenienz; sie speist keine aktuellen Ticket-, Worklog- oder Kostenrollups.
- **Historische 68-Stunden-Kalkulation:** abgelöste Planungsbaseline, kein parallel wählbares Angebot.

Referenzen: `evidence/simulation/project-story.json`, `evidence/simulation/project-reconciliation.json`, `atlassian/confluence/pages/99-archive.md`. Spectra- und Twin-Provenienz sind technische Integritätsnachweise und keine zusätzliche Kundenleistung.
