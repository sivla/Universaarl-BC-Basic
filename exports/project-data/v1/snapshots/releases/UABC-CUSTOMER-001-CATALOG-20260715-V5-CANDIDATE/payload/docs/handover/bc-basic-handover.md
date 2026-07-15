# Handover-Plan UABC-BCB-001

Status: **offen geplant**. Der aktuelle Playthru-Pilot besitzt noch kein abgeschlossenes Handover, keine Supportannahme und keine reale Kundenabnahme. `UABC-BASIC-DE` ist eine CRONUS-Demo-Ausgangsbasis; Setup, Prozesse, UAT, Cutover und Hypercare stehen aus.

**Page-ID:** PAGE-UABC-180 · **Version:** 3 · **Status:** published · **Datum:** 13.07.2026

## Eintritt in die spätere Übergabe

Handover darf erst beginnen, wenn folgende Nachweise tatsächlich vorliegen:

- Wave-0, Pilot-Zielentscheidung und Resetpunkt sind belegt;
- freigegebene Setup- und Datenwellen besitzen differenzfreie Readbacks;
- Prozessprüfungen, Training und UAT sind ausgeführt und ohne ungeklärten P1/P2-Befund;
- Mock-Cutover, Wiederanlauf und Simulationsabnahme sind belegt;
- Hypercare ist ausgeführt, Defects sind real beobachtet und Retests dokumentiert.

## Geplantes Übergabepaket

Das spätere Paket umfasst Rollen- und Eskalationsweg, Operator-Smoke-Test, Supportticket-Pflichtfelder, offene Restpunkte, Kontrollsummen, Runbook, Restartweg, Servicezeiten und Verantwortungen. Es bleibt bis zur Erfüllung der Eintrittskriterien ein Plan.

Der Operator-Smoke-Test `UABC-SMOKE-BCB-OPERATOR-001` soll am ersten Arbeitstag und während Hypercare wiederholt werden. Support darf einen Fall nur mit Rolle, Umgebung, Version, Seite/Aktion, letztem erfolgreichen Schritt, Fehlertext, Soll/Ist, sicherer Evidence, Reproduktionsweg, Resetpunkt, Auswirkung und Eskalationsausgang übernehmen.

## Kundenbefähigung

Reale Benutzerbefähigung ist offen. Rollenübungen, UAT-Fälle, Navigation, Fehlerweg, Beleg-/Entry-Ketten und Kompetenzcheck müssen durch die jeweils typisierte Kundenrolle belegt werden. Historische Simulationsevidence erfüllt diese Bedingung nicht.

## Provenienz und Grenzen

`evidence/simulation/project-reconciliation.json`, `evidence/simulation/adapter-provenance.json` und `exports/project-data/v1/twin-export-map.json` belegen Plan/Ist-Trennung und read-only Exportherkunft. Sie sind kein Handoverabschluss. Der historische Referenzabschluss ist im Archiveintrag `UABC-HIST-REFSIM-001` abgelöst dokumentiert.

Es wird keine produktive Leistung, Rechnung, Buchung, Zahlung, Kundenfreigabe oder Supportannahme behauptet.
