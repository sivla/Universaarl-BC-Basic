# Proposal: Sandbox Setup Wave 1 vorbereiten

## Problem

Die drei in `UABC-BASIC-DE` vorhandenen Konfigurationspakete besitzen weiterhin null Tabellen, null Datensaetze und null Fehler. Technischer Gesellschaftsname, URL und sichtbarer Firmenname belegen jedoch keinen eingerichteten Piloten: Der aktuelle Inhalt ist eine unveränderte Microsoft-Standard-CRONUS-Demo-Ausgangsbasis. Ohne Wave-0-Readback, feldnahe Matrix und fail-closed Zielentscheidung waere ein Pilotaufbau weder wahrheitsgetreu noch sicher.

## Ziel

Dieser Change bindet eine pruefbare Tabellen-/Feldmatrix, einen konkreten Wave-0-, Apply-, Readback- und Rollbackplan sowie einen spaeter ausfuehrbaren Kontrollzentrum-Lauf fuer `Playthru / UABC-BASIC-DE`. Er trennt strukturiert `standard-cronus-demo`-Baseline, Pilot-Soll und tatsaechlich gelesene Abweichung. `UABC-01-CORE-FINANCE` bleibt nur planseitig `prepared-for-controlled-live-run`, `UABC-02-TRADE-MASTER` bleibt `prepared-not-executed`, `UABC-03-OPENING-DATA` bleibt `designed-not-executed`.

## Wahrheitsgrenze

- Kein Live-BC-Write in diesem Change.
- Keine Tabellen wurden den drei Paketgeruesten hinzugefuegt; alle drei bleiben bei `0/0/0`.
- Keine Paketanwendung, kein Import, keine Buchung und keine externe Uebermittlung.
- `pilotConfigured=false`, `writesApplied=false`, `readbackStatus=pending`; der sichtbare Firmenname ist kein Einrichtungsnachweis.
- Der aktive Jira-/Twin-Stand ist eine dynamische Materialisierung der einzigen kanonischen Projektstory. Historische Simulation, Planbudget und aktuelles Task-Worklog-Ist bleiben getrennt.
- Gebuchte Posten-, Ledger- und Posted-Document-Tabellen sowie Continia sind ausgeschlossen.
- Fruehere Country-/Company-Evidence bleibt als historische Provenienz erhalten, ist aber keine aktuelle Readiness-Wahrheit.

## Ergebnis

Ein Consultant kann die erste Welle nach sicherer Runtime-Bindung ohne erneute Designrunde feldnah anlegen, validieren, stoppen oder zuruecksetzen. Der spaetere Live-Nachweis bleibt ein eigener Ausfuehrungsblock.
