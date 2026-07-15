# BC Basic V4 – Supportübergabe

## Übergabestatus

- Projekt: `UABC-CUSTOMER-001`
- Zeitraum: 2026-05-11 bis 2026-06-01
- Status: abgeschlossen-synthetisch
- Supportannahme: bestanden-synthetisch
- Reale Kundenabnahme: nicht behauptet
- Letzte bekannte gute Hypercare-Baseline: `UABC-V4-DAY-012`

## Betriebswerte

Bank 5440,30 EUR, Lager 49 Stück/2058,00 EUR, Debitoren 0,00 EUR, Kreditoren 0,00 EUR, Trial Balance 11080,20 EUR beidseitig, UStVA-Vorschau 70,30 EUR ohne Übermittlung.

## Incidentüberblick

5 P2-Ausnahmen sind mit Ursache, Korrektur, identischem Retest und Entscheidung synthetisch geschlossen. Offene P1: 0. Offene P2: 0. Die vollständigen Details stehen in `evidence/simulation/operating-cycle-v4.json`.

## Annahmecheckliste

- [x] HND-01: Hypercareprotokoll uebergeben
- [x] HND-02: Restartnachweis uebergeben
- [x] HND-03: Monatsabschluss und UStVA-Vorschau uebergeben
- [x] HND-04: Reale Gates weiterhin offen ausgewiesen

## Supportweg

P1 stoppt den Betriebspfad sofort und eskaliert an Projektleitung und Sponsorrolle. P2 blockiert den betroffenen Kernprozess bis Korrektur und identischem Retest. P3 wird im naechsten Daily bewertet. Jede Anfrage nennt Kunde, Projekt, Gesellschaft, Rolle, Datum, Beleg, erwartetes und beobachtetes Ergebnis sowie Evidence-Referenz.

## Offene reale Gates

- REAL-GATE-01: Reale Zielgesellschaft und Lizenzen bestaetigen – **offen**
- REAL-GATE-02: Reale Finanz- und Steuerkonzeption freigeben – **offen**
- REAL-GATE-03: Reale Kundenstamm- und Eroeffnungsdaten abnehmen – **offen**
- REAL-GATE-04: Reale Rollen und Berechtigungen pruefen – **offen**
- REAL-GATE-05: Reale UAT durch Kundenrollen abnehmen – **offen**
- REAL-GATE-06: Reales Cutover-GO erteilen – **offen**
- REAL-GATE-07: Produktivstart und Hypercare real bestaetigen – **offen**
- REAL-GATE-08: UStVA pruefen und externe Uebermittlung separat autorisieren – **offen**

## Katalogzugriff

Project Twin liest ausschließlich den relativen Zeiger `exports/project-data/v1/snapshots/current.json`. Der Katalog ist portabel, nur lesend und benötigt kein Git. Ein Rückschreibpfad ist nicht vorhanden.
