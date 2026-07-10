# Walkthrough Package authoring

1. Kopiere das Blanko und ersetze jeden `REPLACE-ME`-Wert. Das Blanko selbst ist niemals Evidence.
2. Verwende ausschliesslich stabile Requirement-, Scenario-, Jira-, Verification- und Run-IDs.
3. Jeder Schritt muss auf einen wirklich vorhandenen Screenshot verweisen. Beschreibe sichtbaren Zustand und tatsaechliche Benutzeraktion; erfinde keine Zwischenaktion.
4. Halte `beginner`, `consultant` und `evidence-review` als Darstellungen desselben Manifests. Dupliziere den Ablauf nicht.
5. Markiere Simulation, Unknowns, Sicherheitsgrenzen und unvollstaendige Teilnachweise sichtbar.
6. Lege Rohvideo, Trace, Auth und Tempdateien nie in das Paket. Der Generator referenziert nur ihre Run-/Evidence-Provenienz.
7. Fuehre `npm run artifacts:walkthrough` aus. Der Build validiert Quellen, Reihenfolge, Datenschutzmuster und erzeugt die kuratierten Ausgaben.

Freigabe entsteht weder durch das Blanko noch durch einen erfolgreichen Build. Sie folgt ausschliesslich dem aktiven OpenSpec-Policy-Gate.
