# Loesungsdesign: BC Basic Einrichtung

## Kanonisches Modell

`project-story.json` ist die fachliche Quelle. Aktive Tickets werden als Phase, Epic, Story oder Task geführt; jede Ebene hat genau einen zulässigen Parent (außer Phase). Aufgaben tragen Worklogs, Billing und Deliverables. Phasen- und Elternwerte sind Rollups.

## Provenienz

`project/bc-basic/ticket-migration.yaml` hält die versionierte Alt-zu-Neu-Matrix für alle 86 Quellidentitäten. Historische Jira-Dateien werden nicht als aktiver Ticketkatalog exportiert.

## Fail-closed

Validatoren lehnen Lücken, alte Präfixe im aktiven Bestand, falsche Parenttypen, Eltern-Worklogs, Doppelzählung, nicht belegte Transkripte, synthetische Freigaben als reale Nachweise und Snapshotquellen ohne Validierung ab.
