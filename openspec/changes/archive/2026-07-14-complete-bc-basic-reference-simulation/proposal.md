# Vorschlag: Vollständige synthetische BC-Basic-Referenzsimulation

## Warum

Der aktuelle Kundenpilot bleibt wegen fehlender echter Tenant-, Kunden-, Steuer- und Produktivfreigaben ehrlich offen. Die vorhandene historische Simulation enthält jedoch bereits die fachlichen Prozess-, Ledger-, UAT-, Cutover- und Hypercare-Nachweise. Es fehlt eine aktuelle, source-driven Referenzprojektion, die den vollständigen Lebenszyklus der 50 UABC-Tickets, die kommerzielle 80-Stunden-Basis und die klare Trennung zwischen synthetischer Abnahme und echtem Go-live maschinenlesbar verbindet.

## Was sich ändert

- Ein kanonischer Referenzsimulationsvertrag beschreibt Angebot, Phasen, Ticketabdeckung, Playthroughs, Gates und Übergabe.
- Ein deterministischer Generator erzeugt den 50-Ticket-/80-Stunden-Referenzexport aus der bestehenden Projektstory und den versionierten historischen Evidenzen.
- Ein fail-closed Validator und Negativtests prüfen Ticketdeckung, Worklog-/Budgetsumme, Playthrough-Kette, synthetische Gate-Abnahme und offene Live-Gates.
- Der reale Pilot bleibt schreibgesperrt; keine echte Kundenfreigabe, BC-Ausführung, Steuerübermittlung oder Continia-Einrichtung wird behauptet.

## Nicht-Ziele

- kein Live-BC-, Atlassian-, Tenant- oder Steuerzugriff;
- keine produktive Go-live-Freigabe;
- keine Continia-Ausführung;
- kein Push, Merge, Tag oder Release.
