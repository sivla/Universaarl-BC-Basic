# Aenderungsvorschlag

## Metadaten

- Change: `migrate-bc-basic-to-three-space-confluence-v1`
- Projekt: `UABC-BC-BASIC-001`
- Modus: lokale, synthetische und source-driven Confluence-Simulation

## Problem und Zweck

Die bestehende Navigation verteilt 19 Seiten auf drei Spaces, bildet aber die verbindliche 6/8/8-Rootstruktur noch nicht ab. Kundenwahrheit, Produktbeschreibung und interne Durchfuehrungsanleitung muessen eindeutig getrennt sein, ohne Inhalte zu verlieren oder doppelte fuehrende Wahrheiten zu erzeugen.

## Ergebnisse

Exakt drei Spaces besitzen 6, 8 und 8 Rootseiten. Die bisherigen 19 Seiten bleiben ueber stabile IDs, eine Alt-zu-Neu-Matrix, Redirects und Inhaltsdigests nachvollziehbar. Ehemalige Kundenroots 05 bis 10 werden Kinder von 02, 03 oder 04. Produkt- und Consulting-Inhalte bleiben Pilot-Arbeitsstand und koennen nur als `blueprint-candidate` an Spectra herangetragen werden.

## Umfang

Der Change aktualisiert lokale Confluence-Seiten, Dokumentkatalog, Branch-Index, Navigation, Redirects, Project Story, Referenzgraph, Twinexport, Meetings, Deliverables, Evidence, Snapshotvertrag, Generatoren und Validatoren.

## Nicht-Ziele

Keine Live-Atlassian-, Rovo-, Business-Central-, Continia-, Remote-, Push-, Merge-, Tag-, Release- oder Spectra-Uebernahme. Keine Secrets und keine erfundene Freigabe.

## Risiken und Kontrollen

Inhaltsverlust, Cross-Space-Parents, doppelte fuehrende Inhalte, Alt-Ticket-IDs und unzulaessige Ausfuehrungsbehauptungen werden fail-closed validiert. Bytegleicher Doppelbuild, Matrixabdeckung, Deutschpruefung und commitgebundener Snapshot sichern die Projektion.

## Freigabe

Der lokale Commit ist erst erlaubt, wenn die automatisierte Policy-Evidence `UABC-VER-BCB-THREE-SPACE-001` bestanden ist. Reale Kunden- oder Produktfreigaben bleiben davon unberuehrt.
