# Design

## Wahrheitsgrenzen

- Kunden-Space: konkrete Universaarl-Projektwahrheit.
- Produkt-Space: was BC Basic als Pilotprodukt verkauft und liefert.
- Consulting-Space: wie Consultants die Leistung reproduzierbar durchfuehren.
- Wiederverwendbare Erkenntnisse bleiben `blueprint-candidate`; keine automatische Spectra-Uebernahme.

## Struktur

Die Navigation wird ausschliesslich aus dem Branch-Index erzeugt. Die vorhandenen 28 Seiten bleiben erhalten und werden nach Nutzwert statt Sollzahl gefuehrt. Sechs historische Kunden-Unterseiten bleiben als Kinder ihrer fachlich fuehrenden Rootseiten erhalten. Root- und Seitenzahlen sind abgeleitete Kontrollwerte, keine Begruendung fuer neue Seiten.

## Ergebnisobjekte

Der Ergebnisobjektkatalog trennt `customer-deliverable`, `project-document`, `blank-template`, `evidence` und `technical-source`. Nur Kundendeliverables besitzen Abnahme und lesbaren Ergebnispfad; technische Quellen duerfen keine Kundenergebnisse vortaeuschen.

## Atlassian-Materialisierung

Eine source-driven Matrix projiziert jede der 28 Seiten und jedes der 50 Tickets genau einmal. Der lokale Dry-run entscheidet deterministisch `create`, `update`, `skip` oder `conflict`, fuehrt aber keine Mutation aus. Externe IDs bleiben null, bis Zielbereiche und Authentisierung getrennt freigegeben sind.

## Spaeterer Sandbox-Playthrough

Die dedizierte Playthrough-Sandbox und Pilotgesellschaft duerfen in einem Folgeblock beschriebenen Schreibszenarien ausfuehren. Vor jedem Write werden Environment, Company, BC-Version, Lokalisierung, Benutzerrolle, Arbeitsdatum, Resetpunkt und Scope fail-closed gebunden. Die bestehende Referenzsimulation bleibt unveraendert; dieser Change startet keine Live-Ausfuehrung.

## Migration

Jede der 19 bisherigen Seiten behält `documentId`, `storyPageId` und Quellpfad. Die versionierte Matrix bindet alten Titel, alten Parent, neuen Titel, neuen Parent, Inhaltsdigest vor und nach der Strukturmigration sowie den Migrationsgrund. Neue Seiten werden getrennt als `new-required-root` gekennzeichnet.

## Fail-closed-Pruefung

Der Validator prueft Space-Menge, Roottitel und Reihenfolge, Parentgrenzen, eindeutige IDs, Inhaltsrollen, Matrixabdeckung, Redirects, aktive UABC-Referenzen, Continia-Wahrheitsgrenze und lokale Pilot-/Freigabesemantik.
