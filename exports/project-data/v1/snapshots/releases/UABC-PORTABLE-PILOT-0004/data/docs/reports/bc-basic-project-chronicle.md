# Projektchronik UABC-BCB-001 – aktueller Pilot

## Stand 13.07.2026

Der Playthru-Pilot ist neu rebaselined. Laut Nutzerinformation ist der ausgewählte Mandant `UABC-BASIC-DE` inhaltlich eine Standard-CRONUS-Demo-Ausgangsbasis; zwei eigene W0-01-Browserversuche endeten vor jedem DOM-, Feld- und Screenshot-Readback. Ein eingerichteter BC-Basic-Pilot ist nicht belegt. Die aktive Angebotsplanung umfasst 80 Stunden und 9.600 EUR. Drei Task-Worklogs belegen 2,50 Stunden und 300 EUR für die beiden blockierten Versuche sowie die CORE-FINANCE-Repositoryvorbereitung; es gab keine BC-Aktion.

Phase UABC-1 ist in Bearbeitung. UABC-2 und UABC-3 sind wegen ihrer fachlichen Vorgängerabhängigkeit blockiert; Setup, Datenmigration, Prozesse, Training, UAT, Cutover, Hypercare, Retro und Supportübergabe bleiben angelegt. Die drei Setup-Pakete stehen bei 0 Tabellen, 0 Datensätzen und 0 Fehlern. `writesAuthorized=false`; RUN-06 bis RUN-22 bleiben NO-GO.

Vor dem ersten Schreib-Lauf muss Wave-0 interne Company-ID, technischen Namen, Name, Display Name und CRONUS-Provenienz belegen. Zusätzlich sind ein konkreter Resetpunkt und die evidenzbasierte Entscheidung zwischen kontrollierter Weiterverwendung und Neuanlage beziehungsweise Kopie erforderlich. Erst spätere Readbacks dürfen angewendete Pilotabweichungen bestätigen.

## Historische Referenz

Die frühere vollständig abgeschlossene Repository-Referenzsimulation ist seit dem 13.07.2026 abgelöst. Ihr Status `synthetic-closed`, die historische Angebotsversion 3 vom 29.05.2026 und ihre Simulations-Worklogs bleiben ausschließlich als Historienprovenienz erhalten. Sie zählen nicht zum aktuellen Backlog, Ist, Statusrollup oder Jira-Materialisierungsset. Der Archiveintrag `UABC-HIST-REFSIM-001` in `atlassian/confluence/pages/99-archive.md` verweist auf die historischen Nachweise und die aktuelle Nachfolgeseite.

Die deterministische read-only Projektion wird weiterhin über `evidence/simulation/adapter-provenance.json` und `exports/project-data/v1/twin-export-map.json` belegt. Sie transportiert den aktuellen Pilotstand und erzeugt keine BC-Schreibaktion, Rechnung, Zahlung oder Kundenfreigabe.
