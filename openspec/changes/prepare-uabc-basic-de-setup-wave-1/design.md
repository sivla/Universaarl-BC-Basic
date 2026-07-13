# Design: Sandbox Setup Wave 1

## Reihenfolge

1. Wave 0 liest interne Company-ID, technischen Namen, Name, Display Name, unveränderte Standard-CRONUS-Demodaten und Abgrenzung zu Referenzgesellschaften.
2. Auf dieser Evidence wird zwischen kontrollierter Weiterverwendung der aktuellen Standard-CRONUS-Demo-Ausgangsbasis und sauberer Neuanlage oder Kopie entschieden; zugleich wird ein eindeutiger Resetpunkt dokumentiert. Technischer Firmenname und URL sind kein Einrichtungsnachweis.
3. CORE-FINANCE-Tabellen in der Matrixreihenfolge aufnehmen; Feldliste vor jedem Tabellen-Add pruefen.
4. Paket pruefen, ohne es anzuwenden.
5. Erst nach separater authentisierter Laufentscheidung freigegebene Setupzeilen anwenden und jede Wirkung read-back pruefen.
6. Paket `UABC-02-TRADE-MASTER` erst nach bestandenem CORE-Abschluss vorbereiten; Paket `UABC-03-OPENING-DATA` weder importieren noch anwenden.

## Matrixvertrag

Jeder Eintrag nennt Paket, Tabelle, belastbare Tabellen-ID oder `sandbox-confirmation-required`, Felder, Include-/Exclude-Entscheidung, Abhaengigkeit, Reihenfolge, Mandant, Quelle, Validierung, Wirkung, Ausschlussgrund, Owner und Evidence. Unbestaetigte Feld-IDs werden nicht erfunden. Singleton-Setup und komplexe UI-Logik duerfen als manueller Schritt klassifiziert werden.

## Sicherheitsvertrag

Der Live-Lauf stoppt vor dem ersten Write bei fehlendem Wave-0-Readback, unbekannter Standard-CRONUS-Provenienz, fehlender Zielentscheidung, falschem Environment, falscher Gesellschaft, abweichender BC-Version/Lokalisierung/Rolle, fehlendem Resetpunkt, nicht leerem Paketgeruest, unbekannter Tabellen-ID, Schemaabweichung oder fehlender direkter Berechtigung. Eine blosse Umbenennung darf nie `pilotConfigured=true` setzen. Teilanwendungen werden nicht blind wiederholt. Die Ausgangs- und Nachkontrolle erfolgt ueber BC-Seiten sowie Paketfehler/Datensatzzaehler, nicht ueber importierte Ledger-Tabellen.

## Projektstory- und Twin-Vertrag

`evidence/simulation/project-story.json` bleibt die einzige aktive Ticketquelle. Jira, Spectra-0.10, Index und Twin werden deterministisch daraus erzeugt. Die Ticketmenge ist dynamisch; nur `UABC-1`, `UABC-2` und `UABC-3` sind feste Phase-Roots. Plan 80 Stunden/9.600 EUR bleibt im Angebots-/Billingvertrag, aktuelles Ist wird ausschliesslich aus Task-Worklogs abgeleitet. Twin-Ticketlisten enthalten keine Geldfelder oder Geldbetraege.

## Rollback

Vor dem ersten Apply wird ein eindeutiger Resetpunkt dokumentiert. Vorbereitete, noch nicht angewandte Paketzeilen koennen aus dem Paket entfernt werden. Nach einem Teil-Apply wird nicht massenhaft geloescht: Abbruch, Readback der betroffenen Setupcodes, kontrollierte Ruecknahme nur der im Lauf erzeugten synthetischen Codes oder Reset der eindeutig markierten Pilotgesellschaft. Altgesellschaften bleiben unveraendert.
