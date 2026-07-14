# Aufgaben

- [x] Referenzsimulationsquelle mit Angebot, drei Phasen, Ticketabdeckung und Wahrheitsgrenzen definieren. Nachweis: `project/bc-basic/reference-simulation.yaml`, `evidence/simulation/project-story.json`, `evidence/simulation/adapter-provenance.json`.
- [x] 50-Ticket-/80-Stunden-Export deterministisch aus Story und versionierter Evidence erzeugen. Nachweis: `exports/project-data/v1/reference-simulation.json`, `evidence/verification-register.yaml`; 50 Tickets, 19 Tasks, 80 Stunden und 9.600 EUR.
- [x] P2P, O2C, Lager, Zahlung/Bank, Monatsabschluss und UStVA-Playthroughs vollstaendig referenzieren. Nachweis: `evidence/simulation/bc-playthroughs.yaml` und sieben validierte Playthrough-Ketten.
- [x] UAT, Schulung, Cutover-Rehearsal, GO_SIMULATION, Hypercare, Restart und Supportuebergabe verbinden. Nachweis: `evidence/simulation/reference-simulation.yaml` und `evidence/verification-register.yaml`; reale Live-Gates bleiben `PENDING`.
- [x] Fail-closed Validator und Negativmatrix ausfuehren. Nachweis: `scripts/validate-reference-simulation.mjs`, `tests/governance/reference-simulation.test.mjs`; direkte Fachpruefung bestanden.
- [x] OpenSpec strict, Deutsch, Referenzen und direkte Fachgates ausfuehren. Nachweis: OpenSpec strict 10/10, Deutsch-/UTF-8-Pruefung, Referenz- und Readiness-Pruefungen bestanden.
- [x] Einen kohaerenten lokalen Commit mit leerer REVIEW.md erstellen. Nachweis: Adoptionscommit `e5b53a3b629b1cae59d3162a3bfd71bb39becd2b`, REVIEW in Arbeitskopie und HEAD leer.
- [x] Den modernen Twin-Snapshot als sauberen, validierten Branch-Commit commitgebunden pruefen. Nachweis: moderner Branch-/Indexvertrag mit 179 Artefakten; kein Legacy-Manifest als normativer Vertrag und keine externe Live-Ausfuehrung behauptet.
