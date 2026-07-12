# Design

## Kanonische Quelle

`evidence/simulation/project-story.json` bleibt die einzige aktive Ticket-, Kommentar-, Worklog- und Zeitwahrheit. Jira-YAML, Twinexport und Referenzgraph sind deterministische Projektionen.

## Typgerechte Inhalte

Phasen beschreiben Ziele, Gates, Zeitraum und Statusgrund. Epics beschreiben fachlichen Umfang, Ergebnis, Nichtumfang, Abhaengigkeiten und Definition of Done. Stories erklaeren Businessnutzen, Kontext, Akzeptanz und fachlichen Abschluss. Tasks dokumentieren konkrete Ausfuehrung, Worklog, Evidence, Meeting, Deliverable und Closing.

## Akteursmodell

Zulaessige `actorType` sind `human`, `simulated-customer-role`, `codex-spectra`, `playwright` und `system-automation`. Jede Aktion nennt eine ausgeuebte Rolle. Der reale Pilot-Projektverantwortliche wird ohne Namensinferenz als `Anzeigename zu bestaetigen` mit den Rollen Projektleitung, Lead BC Consultant und Solution Architect gefuehrt. Synthetische Kundenrollen bleiben explizit simuliert.

## Wahrheitsgrenze

Automation darf keine menschliche Entscheidung oder Abnahme behaupten. Training, UAT, Steuerpruefung und Supportannahme bleiben synthetisch oder als echte spaetere Bestaetigung offen gekennzeichnet.

## Determinismus

Ein versionierter Enrichment-Generator wendet eine vollstaendige 50-Ticket-Inhaltsmatrix idempotent an. Validatoren blockieren generische Texte, unbekannte Akteure, fehlende Rollen, Elternworklogs, nicht chronologische Verlaeufe und unlesbare Deliverables.
