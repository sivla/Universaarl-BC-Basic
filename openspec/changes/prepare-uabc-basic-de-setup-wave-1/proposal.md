# Proposal: Sandbox Setup Wave 1 vorbereiten

## Problem

Die drei in `UABC-BASIC-DE` vorhandenen Konfigurationspakete besitzen weiterhin null Tabellen, null Datensaetze und null Fehler. Ohne eine feldnahe, abhaengige und fail-closed gepruefte Paketmatrix waere ein Live-Aufbau weder reproduzierbar noch sicher. Die aktuelle Projektbrowser-Runtime ist nicht authentisiert; deshalb darf dieser Change keine Ausfuehrung behaupten.

## Ziel

Dieser Change bindet eine pruefbare Tabellen-/Feldmatrix, einen konkreten Preflight-, Apply-, Readback- und Rollbackplan sowie einen spaeter ausfuehrbaren Kontrollzentrum-Lauf fuer `Playthru / UABC-BASIC-DE`. `UABC-01-CORE-FINANCE` wird `prepared-for-controlled-live-run`, `UABC-02-TRADE-MASTER` bleibt `prepared-not-executed`, `UABC-03-OPENING-DATA` bleibt `designed-not-executed`.

## Wahrheitsgrenze

- Kein Live-BC-Write in diesem Change.
- Keine Tabellen wurden den drei Paketgeruesten hinzugefuegt; alle drei bleiben bei `0/0/0`.
- Keine Paketanwendung, kein Import, keine Buchung und keine externe Uebermittlung.
- Gebuchte Posten-, Ledger- und Posted-Document-Tabellen sowie Continia sind ausgeschlossen.
- Die fruehere Country-/Company-Evidence wird nicht umgedeutet oder veraendert.

## Ergebnis

Ein Consultant kann die erste Welle nach sicherer Runtime-Bindung ohne erneute Designrunde feldnah anlegen, validieren, stoppen oder zuruecksetzen. Der spaetere Live-Nachweis bleibt ein eigener Ausfuehrungsblock.
