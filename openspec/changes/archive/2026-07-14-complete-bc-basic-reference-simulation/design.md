# Design

Die reale Projektstory bleibt Source of Truth für den offenen, schreibgesperrten Pilotzustand. `project/bc-basic/reference-simulation.yaml` ist die source-driven Definition der synthetischen Referenzprojektion. `scripts/generate-reference-simulation.mjs` liest diese Quelle, die aktive Story und die bereits versionierten historischen Playthrough-/Ledger-Evidenzen und erzeugt `exports/project-data/v1/reference-simulation.json`.

Jeder Exportdatensatz enthält `liveStatus`, `simulationStatus`, Tickettyp, Phase, Parent, Meeting-Referenz, Evidence, Deliverable, Akzeptanzstatus, synthetische Abschlussdaten und die aus dem Task-Estimate abgeleiteten Worklogstunden. Dadurch werden die zwei Wahrheiten nicht vermischt: synthetische Abnahme ist vollständig, echte Ausführung bleibt pending.

Die sieben Prozessfälle referenzieren die vorhandenen P2P-, O2C-, Lager-, Zahlung-, Bankabstimmungs-, Monatsabschluss- und UStVA-Evidenzen. Jede Kette nennt Navigation, Aktion, Feldwerte, Vorschau, erzeugte Belege, erwartete Posten, Kontrolle, Defect, Korrektur und Retest.
