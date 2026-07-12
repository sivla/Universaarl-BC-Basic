# Design

## Wahrheitsgrenzen

- Kunden-Space: konkrete Universaarl-Projektwahrheit.
- Produkt-Space: was BC Basic als Pilotprodukt verkauft und liefert.
- Consulting-Space: wie Consultants die Leistung reproduzierbar durchfuehren.
- Wiederverwendbare Erkenntnisse bleiben `blueprint-candidate`; keine automatische Spectra-Uebernahme.

## Struktur

Die Navigation wird ausschliesslich aus dem Branch-Index erzeugt. Exakt 22 Rootseiten verteilen sich auf 6/8/8. Sechs historische Kunden-Unterseiten bleiben als Kinder unter den Rootseiten 02, 03 und 04 erhalten. Neun neue Rootseiten erhalten eigenstaendigen dauerhaften Inhalt. Insgesamt entstehen 28 strukturierte Confluence-Seiten.

## Migration

Jede der 19 bisherigen Seiten behält `documentId`, `storyPageId` und Quellpfad. Die versionierte Matrix bindet alten Titel, alten Parent, neuen Titel, neuen Parent, Inhaltsdigest vor und nach der Strukturmigration sowie den Migrationsgrund. Neue Seiten werden getrennt als `new-required-root` gekennzeichnet.

## Fail-closed-Pruefung

Der Validator prueft Space-Menge, Roottitel und Reihenfolge, Parentgrenzen, eindeutige IDs, Inhaltsrollen, Matrixabdeckung, Redirects, aktive UABC-Referenzen, Continia-Wahrheitsgrenze und lokale Pilot-/Freigabesemantik.
