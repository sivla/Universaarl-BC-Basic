# Walkthrough Package authoring

1. Kopiere das Blanko und ersetze jeden Platzhalter. Danach muss die Kopie `npm run validate:walkthrough-manifest -- <datei>` bestehen. Blanko, Beispiel und erzeugte Darstellung sind laut `evidenceSemantics` abgeleitete Lern-/Darstellungsartefakte und selbst keine fachliche Evidence. Referenzierte Source-Evidence bleibt echte Provenienz.
2. Verwende ausschliesslich stabile Requirement-, Scenario-, Jira-, Verification- und Run-IDs.
3. Jeder Schritt muss auf einen wirklich vorhandenen Screenshot verweisen. Beschreibe sichtbaren Zustand und tatsaechliche Benutzeraktion; erfinde keine Zwischenaktion.
4. Halte `beginner`, `consultant` und `evidence-review` als Darstellungen desselben Manifests. Dupliziere den Ablauf nicht.
5. Markiere Simulation, Unknowns, Sicherheitsgrenzen und unvollstaendige Teilnachweise sichtbar.
6. Lege Rohvideo, Trace, Auth und Tempdateien nie in das Paket. Der Generator referenziert nur ihre Run-/Evidence-Provenienz.
7. `npm run validate:walkthrough-manifest -- <datei>` prueft nur den generischen Draft-2020-12-Vertrag. `npm run build:walkthrough:baseline` baut ausschliesslich den fest definierten Baseline-Piloten `UABC-WT-ENV-001` und prueft zusaetzlich dessen sieben `ENV-*`-Schritte, `run-1`/`run-2`, Evidence und Medienregeln.

Freigabe entsteht weder durch das Blanko noch durch einen erfolgreichen Build. Sie folgt ausschliesslich dem aktiven OpenSpec-Policy-Gate.
