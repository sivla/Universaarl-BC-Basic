# Aenderungsvorschlag

## Why

Die neue Playthru-Pilotgesellschaft und drei Konfigurationspaketgerueste sind real beobachtet, aber noch nicht als ehrliche, wiederholbare Projektbaseline gebunden. Ohne diese Trennung koennten leere Gerueste als ausgefuehrtes Setup oder eine technische Automation als menschliche Entscheidung erscheinen.

## Aenderungsumfang

- Die reale Beobachtung wird ohne Auth-, URL-, Session- oder Telemetriedaten versioniert.
- Firmenzielwerte, offener Country/Region-Defect, drei Paketwellen und Abhaengigkeiten werden fail-closed festgelegt.
- Vorhandene Kunden-, Produkt-, Consulting-, Daten-, Entscheidungs- und Exportflaechen verweisen auf dieselbe Baseline.
- Validatoren blockieren falsche Versionen, Wirkung ohne Tabellen, unerlaubte IDs, falsche Reihenfolge, Actorverwechslung und Ledger-Tabellen.

## Nicht-Ziele

Keine weitere BC-Schreibaktion, keine Tabellenaufnahme, kein Paketimport, keine Datenmigration, kein Live-Atlassian und kein Push.

## Freigabepruefpunkt

Ein Commit ist erst zulaessig, wenn die Baseline, Negativmatrix, OpenSpec, Deutsch, Katalog, Snapshot und Gesamtcheck gruen sind.
