# Design

- `evidence/simulation/project-story.json` bleibt die kanonische Ticket- und Projektstory.
- `project/bc-basic/pilot-v3.yaml` beschreibt Kalender, simulierten Kunden, RACI, Gates, Meetings, Abrechnung und die expliziten Twin-Domaenen.
- `scripts/realize-bc-basic-pilot-v3.mjs` materialisiert Story, Jira-Projektion, Meetingtranskripte, Rechnungen und die rechenbare Prozess-Evidence deterministisch.
- `scripts/validate-bc-basic-pilot-v3.mjs` prueft Chronologie, Rollen, Beschreibungsinhalt, Transkripte, Task-only-Abrechnung, Finanzkontrollen und Wahrheitsgrenze fail-closed.
- `scripts/generate-twin-catalog-v3.mjs` baut zuerst ein Staging-Release, validiert Digests und Referenzen, benennt es atomar um und schaltet danach `current.json` atomar. Ein bestehendes V3-Final wird niemals ueberschrieben.
- Alte Jira-/Confluence-Dateien duerfen als eindeutig historische Provenienz im Repository bleiben, gehoeren aber nicht mehr zum aktiven V3-Katalogvertrag.
