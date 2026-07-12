# Angebot UABC-BCB-001 – synthetische BC-Basic-Einführung

**Baseline 1.0 (20.08.2026):** Universaarl wird in einer ausschließlich synthetischen Playthrough-Welt von Discovery bis Hypercare geführt. Im Scope liegen Finance-Setup, Stammdaten, P2P, O2C, Cash, Lager, UAT, Training, Cutover, `GO_SIMULATION` und Handover. Produktivbetrieb, echte Personen, Bank- und Steuerübermittlung bleiben ausgeschlossen.

**Fortschreibung 1.1 (21.08.2026):** Hypercare, Restart und der repositorybasierte BC-Playthrough wurden als verbindliche Lieferbestandteile ergänzt.

**Abschlussstand 2.0 (03.09.2026):** 80 synthetische Stunden und 9.600 EUR netto sind vollständig als Story-Worklogs abgeglichen. Alle Projektgates sind synthetisch abgeschlossen; offene Punkte sind ausschließlich ein optionaler realer BC-Lauf außerhalb dieses Scopes.

## Leistungsumfang und Kundennutzen

Geliefert wird ein kundengeeignetes BC-Basic-Einfuehrungspaket fuer eine Gesellschaft und einen einfachen Lagerort: Projektsteuerung, Fit-to-Standard-Workshops, Finance-Grundeinrichtung, Einkauf, Verkauf, Zahlung und Abstimmung, Mahnwesen ohne Gebuehr oder Versand, einfacher Bestand, Monatsabschluss- und UStVA-Vorschau, Datenvorlagen, Probeladung, UAT, rollenbezogene Schulung, Cutover-Probe, simulierter Go-live, Hypercare und Supportuebergabe. Das Paket liefert Entscheidungen, Arbeitsablaeufe, Testdaten, Kontrollen und wiederholbare Nachweise; es ersetzt keine Kundenmitwirkung.

## Nichtleistungen und Grenzen

Nicht enthalten sind Produktion, Service, Projekte, Anlagenbuchhaltung, Intercompany, Konzernkonsolidierung, erweiterte Lagerlogistik, Erweiterungsentwicklung, Dataverse, E-Rechnung, produktive Bankanbindung, Zahlungsdateiuebertragung, E-Mail-Versand, ELSTER-Uebermittlung, Steuer- oder Rechtsberatung sowie ein historischer Vollimport gebuchter Bewegungen. Eine aktive BC-Instanz, reale Kundenpersonen und produktive Buchungen wurden nicht verwendet.

## Annahmen und Mitwirkung

Vor einem echten Kundenprojekt sind Gesellschaft, Lizenz, Kontenplan, Buchungs- und MwSt.-Matrizen, Nummernserien, Dimensionen, Zahlungsbedingungen, Mahnregeln, Bankformat, Lagerort, Berechtigungsrollen, Dokumentlayouts, Datenverantwortliche, Workshoptermine, UAT-Abnehmer und Cutovertermin kundenspezifisch zu parametrisieren. Der Kunde liefert freigegebene Daten und Entscheider; Finanz-, Steuer- und Rechtsfragen werden durch die jeweils verantwortlichen Stellen entschieden. Echte Sandboxkonfiguration, Import, Buchung, Berechtigungsprobe und Ruecksetzung benoetigen einen separaten Systemnachweis.

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

## Spectra-0.10-Lieferstand

Spectra 0.10 fuegt ohne Stunden- oder Kostenaenderung den Coverage-Nachweis `evidence/simulation/reference-graph-coverage.json` hinzu. Die zugehoerigen read-only Projektionen `exports/project-data/v1/reference-graph-native.json`, `exports/project-data/v1/reference-graph-mapping.json` und `exports/project-data/v1/reference-graph-portable.json` sind technische Abschlussartefakte und keine zusaetzliche abrechenbare Leistung. Reconciliation, Adapter-Provenienz und Twin-Exportmap bleiben unter `evidence/simulation/project-reconciliation.json`, `evidence/simulation/adapter-provenance.json` und `exports/project-data/v1/twin-export-map.json` gebunden.

## Versionierter Baseline-Angebot-Ist-Abgleich

Die historische Kalkulationsbaseline betrug 68 Stunden zu 162,50 EUR und damit 11.050 EUR netto. Das synthetisch beauftragte Angebot sowie der Ist-Abschluss verwenden 80 Stunden zu 120 EUR und damit jeweils 9.600 EUR netto. Die Abweichung von +12 Stunden, -42,50 EUR Stundensatz und -1.450 EUR Gesamtwert entstand durch die Fortschreibung zum vollständigen Playthrough mit UAT, Cutover, Hypercare und Handover; Angebot und Ist weisen danach keine Differenz auf.

Der Spectra-0.10-konforme Datensatz liegt unter `evidence/simulation/project-reconciliation.json`. Er ist ausschließlich synthetische Sandbox-Evidence und weder Rechnung noch Buchung, Zahlung oder Nachweis produktiver Leistung. Die zugehörige read-only Exportprovenienz liegt unter `evidence/simulation/adapter-provenance.json`; die daraus deterministisch abgeleitete Allowlistdarstellung liegt unter `exports/project-data/v1/twin-export-map.json`.
