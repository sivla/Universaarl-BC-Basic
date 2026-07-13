# Aenderungsvorschlag

## Why

Der zuvor offene Country/Region-Defect wurde in Playthru behoben und die freigegebenen Firmendaten wurden gespeichert. Ohne einen getrennten Ausfuehrungsnachweis bliebe die Projektquelle hinter dem belegten Sandboxzustand zurueck oder koennte Paketwirkung erfinden.

## Aenderungsumfang

- Vorzustand, Country/Region-Seed, gespeicherte Firmendaten und Retest werden versioniert.
- Technischer Mandant, rechtlicher Firmenname und Legacy-Mandant werden eindeutig getrennt.
- Bewusste Leerwerte, Actortrennung und die Nullwirkung aller drei Paketgerueste werden fail-closed validiert.
- Kunden-, Consultant-, Jira-, Deliverable-, Katalog- und Snapshotreferenzen werden konsistent aktualisiert.

## Nicht-Ziele

Keine Paketmatrix, keine Paket-Tabellen, kein Import, keine Buchung, keine weitere Browseraktion, keine Screenshoterfindung, kein Live-Atlassian und kein Push.

## Freigabepruefpunkt

Ein Commit ist erst zulaessig, wenn Ausfuehrungsnachweis, Negativtests, OpenSpec, Deutsch, Katalog, Snapshot und Gesamtcheck gruen sind.
