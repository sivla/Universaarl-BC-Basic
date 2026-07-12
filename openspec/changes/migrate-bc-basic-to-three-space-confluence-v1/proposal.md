# Aenderungsvorschlag

## Metadaten

- Change: `migrate-bc-basic-to-three-space-confluence-v1`
- Projekt: `UABC-BC-BASIC-001`
- Modus: lokale, synthetische und source-driven Confluence-Simulation

## Problem und Zweck

Die bestehende Navigation trennt drei Spaces, enthaelt aber mehrere reine Meta-Seiten und noch keine vollstaendige Objekt- und Materialisierungswahrheit. Kundenwahrheit, verkaufbares Produkt und interne Durchfuehrungsmethode muessen konkreten Nutzwert liefern, ohne Inhalte zu verlieren oder doppelte fuehrende Wahrheiten zu erzeugen.

## Ergebnisse

Exakt drei Spaces besitzen eine source-driven, nutzwertgefuehrte Navigation. Die vorhandenen 28 Seiten bleiben ueber stabile IDs, Matrix, Redirects und Inhaltsdigests nachvollziehbar; Zaehlsichten werden aus der Quelle abgeleitet und sind kein Produktziel. Produkt- und Consulting-Inhalte bleiben Pilot-Arbeitsstand und koennen nur als `blueprint-candidate` an Spectra herangetragen werden.

## Umfang

Der Change aktualisiert lokale Confluence-Seiten, Ergebnisobjektklassifikation, trockene Atlassian-Materialisierung, Dokumentkatalog, Branch-Index, Navigation, Redirects, Project Story, Referenzgraph, Twinexport, Deliverables, Evidence, Snapshotvertrag, Generatoren und Validatoren.

## Nicht-Ziele

Keine Live-Atlassian-, Rovo-, Business-Central-, Continia-, Remote-, Push-, Merge-, Tag-, Release- oder Spectra-Uebernahme. Keine Secrets und keine erfundene Freigabe. Die autorisierte spaetere Playthrough-Sandbox wird nur fail-closed vorbereitet und in diesem Change nicht aufgerufen.

## Risiken und Kontrollen

Inhaltsverlust, Cross-Space-Parents, doppelte fuehrende Inhalte, Alt-Ticket-IDs und unzulaessige Ausfuehrungsbehauptungen werden fail-closed validiert. Bytegleicher Doppelbuild, Matrixabdeckung, Deutschpruefung und commitgebundener Snapshot sichern die Projektion.

## Freigabe

Der lokale Commit ist erst erlaubt, wenn die automatisierte Policy-Evidence `UABC-VER-BCB-THREE-SPACE-001` bestanden ist. Reale Kunden- oder Produktfreigaben bleiben davon unberuehrt.
