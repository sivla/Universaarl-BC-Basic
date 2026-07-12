# Angebot UABC-BCB-001 – synthetische BC-Basic-Einführung

**Baseline 1.0 (20.08.2026):** Universaarl wird in einer ausschließlich synthetischen Playthrough-Welt von Discovery bis Hypercare geführt. Im Scope liegen Finance-Setup, Stammdaten, P2P, O2C, Cash, Lager, UAT, Training, Cutover, `GO_SIMULATION` und Handover. Produktivbetrieb, echte Personen, Bank- und Steuerübermittlung bleiben ausgeschlossen.

**Fortschreibung 1.1 (21.08.2026):** Hypercare, Restart und der repositorybasierte BC-Playthrough wurden als verbindliche Lieferbestandteile ergänzt.

**Abschlussstand 2.0 (03.09.2026):** 80 synthetische Stunden und 9.600 EUR netto sind vollständig als Story-Worklogs abgeglichen. Alle Projektgates sind synthetisch abgeschlossen; offene Punkte sind ausschließlich ein optionaler realer BC-Lauf außerhalb dieses Scopes.

## Phasen und Kosten

| Phase | Stunden | Kosten netto | Ergebnis |
|---|---:|---:|---|
| Auftrag/Scope | 6 | 720 EUR | Scope und Rollen |
| Discovery/Daten | 18 | 2.160 EUR | Anforderungen und Datenbereitschaft |
| Setup/Prozesse | 28 | 3.360 EUR | Setup, Playthrough und Kontrollen |
| UAT/Training/Cutover | 16 | 1.920 EUR | UAT-Sign-off und `GO_SIMULATION` |
| Hypercare/Handover | 12 | 1.440 EUR | Exit und Supportübergabe |
| **Gesamt** | **80** | **9.600 EUR** | **synthetisch abgeschlossen** |

Rollen sind Sponsor P-002, Finance P-005, Handel P-011, Daten P-016 und Lager P-019. Abnahmegates sind Datenbereitschaft, Setup, SIT, UAT, Cutover-GO, Hypercare-Exit und Handover. Änderungen werden als Ticket mit Scope-, Kosten- und Evidence-Auswirkung geführt. Es gibt keine echte Unterschrift.

Referenz: `evidence/simulation/project-story.json` (`OFR-UABC-BCB-001`).

## Versionierter Baseline-Angebot-Ist-Abgleich

Die historische Kalkulationsbaseline betrug 68 Stunden zu 162,50 EUR und damit 11.050 EUR netto. Das synthetisch beauftragte Angebot sowie der Ist-Abschluss verwenden 80 Stunden zu 120 EUR und damit jeweils 9.600 EUR netto. Die Abweichung von +12 Stunden, -42,50 EUR Stundensatz und -1.450 EUR Gesamtwert entstand durch die Fortschreibung zum vollständigen Playthrough mit UAT, Cutover, Hypercare und Handover; Angebot und Ist weisen danach keine Differenz auf.

Der Spectra-0.9-konforme Datensatz liegt unter `evidence/simulation/project-reconciliation.json`. Er ist ausschließlich synthetische Sandbox-Evidence und weder Rechnung noch Buchung, Zahlung oder Nachweis produktiver Leistung. Die zugehörige read-only Exportprovenienz liegt unter `evidence/simulation/adapter-provenance.json`; die daraus deterministisch abgeleitete Allowlistdarstellung liegt unter `exports/project-data/v1/twin-export-map.json`.
