# bc-basic-three-space-confluence Specification

## Purpose

Diese Spezifikation definiert die verlustfreie, source-driven Trennung der Universaarl-Projektdokumentation in Kundenprojekt, BC-Basic-Produktbuch und internes Consulting-Handbuch.
## Requirements
### Requirement: Exakte Drei-Space- und 6-8-8-Rootstruktur

Das System MUST exakt die drei festgelegten Spaces und darin exakt 6, 8 und 8 geordnete Rootseiten source-driven bereitstellen.

#### Scenario: Kanonische Navigation

- **WHEN** Index, Katalog und Navigation validiert werden
- **THEN** stimmen Space, Roottitel, Reihenfolge und Home-Dokument exakt mit dem Vertrag ueberein

### Requirement: Verlustfreie Seitenmigration

Das System MUST jede der 19 Altseiten ueber stabile IDs, Digest und eindeutige Nachfolgeseite nachweisen.

#### Scenario: Alte Kundenroots

- **WHEN** eine bisherige Kundenseite 05 bis 10 aufgeloest wird
- **THEN** bleibt sie als Kind unter 02, 03 oder 04 erhalten und ist kein zusaetzlicher Root

### Requirement: Eindeutige Inhaltsgrenzen

Das System MUST Kundenwahrheit, Produktversprechen und Consultant-Anleitung trennen und bei Querverweisen Links statt kopierter fuehrender Inhalte verwenden.

#### Scenario: Wiederverwendbare Erkenntnis

- **WHEN** eine Erkenntnis produktuebergreifend nutzbar erscheint
- **THEN** bleibt sie `blueprint-candidate` und wird nicht automatisch Spectra zugerechnet

### Requirement: Ehrliche lokale Simulation

Das System MUST Live-Atlassian-, Live-BC-, Continia-Ausfuehrungs- und erfundene Freigabe- oder Spectra-Behauptungen ablehnen.

#### Scenario: Continia Banking

- **WHEN** Continia Banking oder Finance genannt wird
- **THEN** ist es ausschliesslich eine spaetere Produktoption ohne Stunden, Ausfuehrung oder Evidence
