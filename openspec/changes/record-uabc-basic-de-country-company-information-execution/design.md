# Design

## Wahrheitsmodell

Die historische Setup-Baseline bleibt unveraendert. Ein neuer Evidence-Record beschreibt ausschliesslich den spaeter belegten Seed- und Firmendatenlauf. Die kanonische Pilotbaseline zeigt den aktuellen Zustand und verweist auf beide Nachweise.

## Identitaet

- `UABC-BASIC-DE` ist der technische Mandant des BC-Basic-Piloten.
- `UNIVERSAARL-DE` bleibt unveraenderter Legacy-Mandant.
- `Universaarl GmbH` ist der rechtliche Firmenname in Firmendaten und der beobachtete Anzeigename; dieser Lauf behauptet keine Anzeigenamensaenderung.

## Sicherheitsgrenze

Nur Country/Region und die aufgelisteten Firmendaten gelten als ausgefuehrt. Paketgerueste bleiben bei null Tabellen, Datensaetzen und Fehlern. Auth-, URL-, Session- und Telemetriedaten werden nicht gespeichert.
