# Design

- Die kanonische Quelle bleibt `evidence/simulation/project-story.json`.
- `scripts/redact-ticket-quality-v2.mjs` erzeugt deterministisch kurze Summaries und ticketbezogene Pflichtabschnitte.
- `scripts/generate-jira-story-v2.mjs` materialisiert daraus die sichtbare Jira-Projektion.
- `scripts/validate-ticket-quality-v2.mjs` prüft Länge, Eindeutigkeit, Substanz, Referenzen, Hierarchie und Abrechnung fail-closed.
- V1 bleibt unverändert; der neue Release wird als unveränderlicher V2-Bruder erzeugt und erst nach Validierung über `current.json` aktiviert.
