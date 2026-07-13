# Design: Sandbox Setup Wave 1

## Reihenfolge

1. Zielbindung und Resetpunkt pruefen.
2. Bereits ausgefuehrte Country-/Company-Baseline read-only bestaetigen.
3. CORE-FINANCE-Tabellen in der Matrixreihenfolge aufnehmen; Feldliste vor jedem Tabellen-Add pruefen.
4. Paket pruefen, ohne es anzuwenden.
5. Erst nach separater authentisierter Laufentscheidung freigegebene Setupzeilen anwenden und jede Wirkung read-back pruefen.
6. Paket `UABC-02-TRADE-MASTER` erst nach bestandenem CORE-Abschluss vorbereiten; Paket `UABC-03-OPENING-DATA` weder importieren noch anwenden.

## Matrixvertrag

Jeder Eintrag nennt Paket, Tabelle, belastbare Tabellen-ID oder `sandbox-confirmation-required`, Felder, Include-/Exclude-Entscheidung, Abhaengigkeit, Reihenfolge, Mandant, Quelle, Validierung, Wirkung, Ausschlussgrund, Owner und Evidence. Unbestaetigte Feld-IDs werden nicht erfunden. Singleton-Setup und komplexe UI-Logik duerfen als manueller Schritt klassifiziert werden.

## Sicherheitsvertrag

Der Live-Lauf stoppt vor dem ersten Write bei falschem Environment, falscher Gesellschaft, abweichender BC-Version/Lokalisierung/Rolle, fehlendem Resetpunkt, nicht leerem Paketgeruest, unbekannter Tabellen-ID, Schemaabweichung oder fehlender direkter Berechtigung. Teilanwendungen werden nicht blind wiederholt. Die Ausgangs- und Nachkontrolle erfolgt ueber BC-Seiten sowie Paketfehler/Datensatzzaehler, nicht ueber importierte Ledger-Tabellen.

## Rollback

Vor dem ersten Apply wird ein eindeutiger Resetpunkt dokumentiert. Vorbereitete, noch nicht angewandte Paketzeilen koennen aus dem Paket entfernt werden. Nach einem Teil-Apply wird nicht massenhaft geloescht: Abbruch, Readback der betroffenen Setupcodes, kontrollierte Ruecknahme nur der im Lauf erzeugten synthetischen Codes oder Reset der eindeutig markierten Pilotgesellschaft. Altgesellschaften bleiben unveraendert.
