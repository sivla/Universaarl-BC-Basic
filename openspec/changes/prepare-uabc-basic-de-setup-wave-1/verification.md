# Verification

Status: Repository-Rebaseline und alle vereinbarten Repository-Gates bestanden. Es gab in diesem Reparaturblock keinen BC-Zugriff und keine BC-Schreibaktion.

## Aktuelle Projektwahrheit

- `UABC-BASIC-DE` ist strukturiert als `baselineKind=standard-cronus-demo`, `pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending` erfasst. Technischer Firmenname und URL gelten ausdrücklich nicht als Einrichtungsnachweis.
- Wave 0 muss vor jeder Pilotbehauptung interne Company-ID, Name und Anzeigename, Standard-CRONUS-Provenienz, Resetpunkt sowie die begründete Entscheidung „kontrolliert weiterverwenden“ oder „neu anlegen/kopieren“ belegen.
- Plan bleibt 80 Stunden und 9.600 EUR; Iststunden und Istkosten werden ausschließlich aus aktiven Task-Worklogs abgeleitet und betragen aktuell 0 Stunden beziehungsweise 0 EUR.
- Der aktuelle Backlog besitzt genau `UABC-1`, `UABC-2` und `UABC-3` als Phase-Roots. Seine übrige fachliche Menge ist dynamisch; eine feste Gesamtzahl oder eine feste letzte Ticket-ID ist kein Vertrag.
- Der abgelöste Repository-Referenzlauf bleibt ausschließlich als `historical-reference-simulation` mit `currentAuthority=false` nachvollziehbar. Sein internes `GO_SIMULATION` speist keinen aktuellen Status, Rollup, Worklog oder Freigabenachweis.
- `writesAuthorized=false`; RUN-06 bis RUN-22 bleiben NO-GO. Die drei Setup-Pakete bleiben im aktuellen Readback bei 0 Tabellen, 0 Datensätzen und 0 Fehlern.

## Gate-Erhaltung

| Bisherige Gate-Kategorie | Dynamisierte aktuelle Prüfung | Negativnachweis |
| --- | --- | --- |
| Feld- und Shape-Allowlisten | Pflichtfelder, erlaubte Felder und Metadaten bleiben typbezogen fail-closed | fehlendes beziehungsweise unerlaubtes Feld |
| Legacy-/ID-Regeln | eindeutige `UABC-*`-IDs; keine TKT-/PHASE-Wiederbelegung | verbotene Legacy-ID und doppelte ID |
| Phasen und Hierarchie | exakt drei Roots `UABC-1/2/3`; `Phase→Epic→Story/Bug→Task` | falsche Roots, ungültiger Parent, unbekannter Parent und Zyklus |
| Seiten, Spaces und Dokumentmetadaten | existierende Seiten-/Space-/Dokumentreferenzen und Parentbeziehungen | unbekannte oder typfalsche Referenz |
| Status-, Zeit- und Historienlogik | offene Zukunftsgates ohne zukünftigen Erledigt-Zeitpunkt oder Erfolgsclaim | future-dated completion und erledigtes Future-Gate |
| Akteure und Rollen | alle Assignees und Verantwortungen müssen auf typisierte Actors zeigen | untypisierter beziehungsweise unbekannter Actor |
| Worklogs und Billing | ausschließlich Tasks sind billable und dürfen Worklogs tragen; Summen werden abgeleitet | billable Non-Task, Worklog auf Non-Task und falsche Istsumme |
| Kommentare, Evidence und Provenienz | nur aktuelle, existierende Referenzen dürfen aktive Erfüllung stützen | unbekannte Referenz und historische Evidence im aktiven Lauf |
| Relationen und Inversen | bekannte Ziele, zulässige Relationstypen und vollständige Inversen bleiben erhalten | unbekanntes Ziel und fehlende Inversrelation |
| Timeline und Hypercare | strukturell referenziert und als offene Zukunftsarbeit vorhanden, ohne feste Mengen | fehlender offener Future-Gate-Nachweis |
| Ticketrealismus und Sprache | ticketspezifische Beschreibung und mindestens zwei konkrete Akzeptanzkriterien; keine Geldbeträge in Ticket-Summarys | Einwortbeschreibung, globale Kriterienvorlage, Mojibake, Erfolgsphrase im offenen Ticket und Geld-Summary |
| CRONUS-/Pilot-Trennung | exakte `standard-cronus-demo`-Baseline und separate Soll-/Applied-/Readback-Zustände | bloße Umbenennung beziehungsweise `cronus-demo` als eingerichteter Pilot |
| Aktive/Historien-Trennung | aktive Validatoren prüfen den offenen Pilot; Historienmodus prüft den abgelösten Referenzlauf ohne Rollupbeitrag | Statusleckage aus historischem `GO_SIMULATION` |
| Generator-/Export-Provenienz | genau eine kanonische aktive Projektstory; Jira, Index, Snapshot und Twin sind deterministische Ableitungen | Self-Reference, falscher dynamischer Count und stale Digest |

Der automatisierte Vergleich der produktiven Fehlerpfade ergab für `validate-project-story.mjs` 58 bisherige und 69 aktuelle Fehlerpfade sowie für `validate-jira-story-realism.mjs` 21 bisherige und 30 aktuelle Fehlerpfade. Kein bisheriger Fehlerpfad wurde ersatzlos entfernt; historisch falsche Festmengen und Abschlusszwänge wurden durch die in der Tabelle genannten semantischen Gates ersetzt.

## Bereits ausgeführte fokussierte Nachweise

- Projektstory-Validator: 50 tatsächlich vorhandene aktive Tickets, 0 Iststunden, 0 EUR Istkosten; Plan 80 Stunden und 9.600 EUR.
- Jira-Realismusvalidator: 50 tatsächlich vorhandene aktive Tickets, 11 typisierte Akteure, 0 Task-Worklogs, 0 Iststunden und 0 EUR Istkosten.
- Aktiver Ticketvertrag: produktive und current-facing Flächen ohne Fixcount-, Istabschluss-, Mojibake- oder Statusleckage; npm-Erreichbarkeit vollständig.
- Aktive Pilotsimulation und aktiver BC-Playthrough: Standard-CRONUS-Demo-Baseline, offene Wave-0-/Setup-/Prozess-/UAT-/Hypercare-Gates, Ist 0/0 und `writesAuthorized=false`.
- Historische Referenzsimulation und historischer BC-Playthrough: intern konsistent, `currentAuthority=false`, kein aktueller Rollupbeitrag.
- Setup-Wave-1-Validatoren und fokussierte Governance-, Story-, Jira- und Spectra-Tests: erfolgreich.
- OpenSpec-Schema und OpenSpec strict: erfolgreich.

## Abschließende Gates

- Zwölf abgeleitete Artefakte wurden einschließlich Jira-Materialisat, Index, Setup-Projektion, Twin-Map, Adapter-Provenienz, Referenzgraphen, Spectra-Konformität und Dokumentkatalog zweimal bytegleich erzeugt.
- Der fokussierte kombinierte Setup-/Governance-/Story-/Jira-/Spectra-Testblock bestand mit 198 von 198 Tests; die anschließende Story-/Jira-Nachprüfung der ticketspezifischen Abnahmekriterien bestand mit 93 von 93 Tests.
- Der Sprachtest bestand mit 19 von 19 Tests; `check-german.mjs` lieferte den sechsfeldrigen deutschen Standardpayload ohne Verletzung.
- Die direkte Projektstory-Prüfung meldete 50 tatsächlich vorhandene aktive Tickets, Plan 80 Stunden/9.600 EUR sowie Ist 0 Stunden/0 EUR. Die direkte Jira-Prüfung meldete 11 typisierte Akteure und 0 Task-Worklogs.
- OpenSpec-Schema, OpenSpec strict mit 10 von 10 Items, Referenzen und Diff-Checks bestanden.
- Genau ein vollständiger `npm test` lief 146,5 Sekunden und endete mit Exit 0. Er prüfte zusätzlich den commitgebundenen Snapshot- und Dokumentkatalogvertrag, 165 Governance-Tests, den deterministischen Walkthrough sowie zwei Playwright-Ansichten.
- Die gezielte Diff-Review bestätigte die einzige aktive kanonische Story, die dynamische Materialisierung, den Erhalt aller bisherigen Validator-Fehlerpfade, die Stichproben `UABC-1`, `UABC-21`, `UABC-32`, `UABC-39`, `UABC-47` und `UABC-50` sowie die aktive/historische Wahrheitsgrenze.
- `REVIEW.md` war vor dem Amend in Arbeitskopie und HEAD leer. Nach dem abschließenden Amend werden Commit, Baum, Snapshot-/Katalogbindung, `REVIEW.md` und sauberer Status erneut nur lesend geprüft.

Offen bleiben ausschließlich die fachlichen Live-Gates: Wave-0-, Reset- und Zielentscheidung, alle Setup-/Prozess-/UAT-/Cutover-/Hypercare-/Handover-Ausführungen sowie eine separate Schreibfreigabe. `writesAuthorized=false` und RUN-06 bis RUN-22 NO-GO bleiben unverändert.
