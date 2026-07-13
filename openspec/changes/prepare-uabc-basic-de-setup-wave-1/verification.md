# Verification

Status: Repository-Rebaseline und die fokussierten W0-01-Gates bestanden. Der angemeldete Browser-Tab war als Ziel sichtbar; die Sicherheitsrichtlinie blockierte vor DOM-, Screenshot- und BC-Feldzugriff. Es gab keine BC-Schreibaktion.

## Aktuelle Projektwahrheit

- `UABC-BASIC-DE` ist strukturiert als `baselineKind=standard-cronus-demo`, `pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending` erfasst. Technischer Firmenname und URL gelten ausdrücklich nicht als Einrichtungsnachweis.
- Wave 0 muss vor jeder Pilotbehauptung interne Company-ID, Name und Anzeigename, Standard-CRONUS-Provenienz, Resetpunkt sowie die begründete Entscheidung „kontrolliert weiterverwenden“ oder „neu anlegen/kopieren“ belegen.
- Plan bleibt 80 Stunden und 9.600 EUR; Iststunden und Istkosten werden ausschließlich aus aktiven Task-Worklogs abgeleitet und betragen aktuell 0,25 Stunden beziehungsweise 30 EUR für den dokumentierten blockierten W0-01-Versuch.
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

- Projektstory-Validator: 50 tatsächlich vorhandene aktive Tickets, 0,25 Iststunden, 30 EUR Istkosten; Plan 80 Stunden und 9.600 EUR.
- Jira-Realismusvalidator: 50 tatsächlich vorhandene aktive Tickets, 11 typisierte Akteure, ein Task-Worklog, 0,25 Iststunden und 30 EUR Istkosten.
- Aktiver Ticketvertrag: produktive und current-facing Flächen ohne Fixcount-, Istabschluss-, Mojibake- oder Statusleckage; npm-Erreichbarkeit vollständig.
- Aktive Pilotsimulation und aktiver BC-Playthrough: Standard-CRONUS-Demo-Baseline, W0-01 vor DOM-Readback blockiert, offene Setup-/Prozess-/UAT-/Hypercare-Gates, Ist 0,25/30 und `writesAuthorized=false`.
- Historische Referenzsimulation und historischer BC-Playthrough: intern konsistent, `currentAuthority=false`, kein aktueller Rollupbeitrag.
- Setup-Wave-1-Validatoren und fokussierte Governance-, Story-, Jira- und Spectra-Tests: erfolgreich.
- OpenSpec-Schema und OpenSpec strict: erfolgreich.

## Abschließende Gates

- Zwölf abgeleitete Artefakte wurden einschließlich Jira-Materialisat, Index, Setup-Projektion, Twin-Map, Adapter-Provenienz, Referenzgraphen, Spectra-Konformität und Dokumentkatalog zweimal bytegleich erzeugt.
- Der fokussierte kombinierte Setup-/Governance-/Story-/Jira-/Spectra-Testblock bestand mit 174 von 174 Tests.
- Der Sprachtest bestand mit 19 von 19 Tests; `check-german.mjs` lieferte den sechsfeldrigen deutschen Standardpayload ohne Verletzung.
- Die direkte Projektstory-Prüfung meldete 50 tatsächlich vorhandene aktive Tickets, Plan 80 Stunden/9.600 EUR sowie Ist 0,25 Stunden/30 EUR. Die direkte Jira-Prüfung meldete 11 typisierte Akteure und einen Task-Worklog.
- OpenSpec-Schema, OpenSpec strict mit 10 von 10 Items, Referenzen und Diff-Checks bestanden.
- Der abschließende vollständige `npm test` lief 145 Sekunden und endete mit Exit 0. Er prüfte zusätzlich den commitgebundenen Snapshot- und Dokumentkatalogvertrag, 175 Governance-Tests, den deterministischen Walkthrough sowie zwei Playwright-Ansichten.
- Die gezielte Diff-Review bestätigte die einzige aktive kanonische Story, die dynamische Materialisierung, den Erhalt aller bisherigen Validator-Fehlerpfade, die Stichproben `UABC-1`, `UABC-21`, `UABC-32`, `UABC-39`, `UABC-47` und `UABC-50` sowie die aktive/historische Wahrheitsgrenze.
- `REVIEW.md` war vor dem Amend in Arbeitskopie und HEAD leer. Commit, Baum, Snapshot-/Katalogbindung, `REVIEW.md` und sauberer Status werden nach dem abschließenden Amend erneut nur lesend geprüft.

Offen bleiben ausschließlich die fachlichen Live-Gates: Wave-0-, Reset- und Zielentscheidung, alle Setup-/Prozess-/UAT-/Cutover-/Hypercare-/Handover-Ausführungen sowie eine separate Schreibfreigabe. `writesAuthorized=false` und RUN-06 bis RUN-22 NO-GO bleiben unverändert.

## Jira-Boardstatus-Folgeprüfung

- Der Producer-Boardvertrag ordnet `created` der Spalte `Angelegt`, `in-progress` und `blocked` der Spalte `In Bearbeitung`, `tested` der Spalte `Getestet` sowie `done` und `closed` der Spalte `Erledigt` zu.
- Im aktuellen Materialisat sind 46 Tickets mit `created`, ein Ticket mit `in-progress` und drei Tickets mit `blocked` jeweils genau einer sichtbaren Spalte zugeordnet. Der zusätzliche Blocker ist `UABC-39` nach dem realen, vor DOM-Readback blockierten W0-01-Versuch.
- Fehlendes oder doppelt zugeordnetes `blocked` sowie ein unbekannter aktiver Status scheitern fail-closed mit `TICKET_BOARD_STATUS`.
- Jira-Materialisat, Story, Index, Twin-Map, Adapter-Provenienz, Konformitätsevidence, Reconciliation und Referenzgraphen blieben in zwei Generatorläufen über elf Artefakte bytegleich.
- Der fokussierte Spectra-0.10-Test bestand mit 23 von 23 Tests; OpenSpec-Schema und OpenSpec strict bestanden mit 10 von 10 Items. Projektstory, Jira-Realismus, aktiver Ticketvertrag, Referenzen und Deutschprüfung bestanden ebenfalls.
- Genau ein vollständiger `npm test` lief 130,4 Sekunden und endete mit Exit 0. Die gezielte Diff-Review blieb ohne Befund; `REVIEW.md` war in Arbeitskopie und HEAD leer.
- Der Indexdigest `4804f1b0fcac789ba396d206bb80caec9bf6d5c64c1da3faf8832f36d9ab640f`, der Twin-Map-Digest `cf71fc5c57773bfea08caa0c5f852cb1170a68b1201e8bddc6e2d3bd43ff6c19` und die Adapter-Provenienz blieben unverändert. Der aus der geänderten Boardprojektion abgeleitete Konformitätsdigest lautet `35cb1de6d7347d0729036f5d134290c05f0d4605b3d9c7b905b02bb23bef05b4`.
- Es gab keine BC-, Browser-, Authentifizierungs- oder Push-Aktion.

## CRONUS-Rebaseline und Zielmandanten-Gate

- Kanonischer Iststand ist `Playthru` / `UABC-BASIC-DE` mit `baselineKind=standard-cronus-demo`, `baselineProvenance=microsoft-standard-cronus-demo-data`, `pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending`.
- Der BC-Basic-Sollstand ist als `bc-basic-target-not-applied` getrennt; `appliedDifference.status=none-evidenced`. Eine Namensgleichheit oder URL gilt nicht als Einrichtungsnachweis.
- `UABC-DEC-PILOT-TARGET-001` bleibt `blocked-pending-wave0-and-reset-evidence`, `selectedOption=null` und `writesAuthorized=false`. Nächster zulässiger BC-Schritt ist ausschließlich `W0-01-read-company-identity`.
- Beide abgelösten Playthru-Ausführungsdateien bleiben historische Repository-Provenienz, wurden aber aus aktiven Deliverable-Quellen, dem Result-Objektkatalog und der Twin-Positivliste entfernt. Aktive Country-/Company-Bestätigungsclaims scheitern fail-closed.
- Die fokussierte Testausführung bestand mit 174 von 174 Tests. Sechs direkte Story-/Jira-/Setup-/Spectra-Validatoren sowie OpenSpec-Schema und OpenSpec strict mit 10 von 10 Items waren grün.
- Zwei vollständige Generatorläufe ergaben für zehn Story-/Jira-/Setup-/Index-/Map-/Provenienz-/Konformitäts-/Referenzgraph-Artefakte identische SHA-256-Digests.
- Der erste Vor-Commit-Aufruf von `npm test` erreichte den Snapshotvertrag und stoppte ausschließlich am vorgesehenen Dirty-Worktree-Gate. Der abschließende commitgebundene Gesamtcheck lief 145 Sekunden und endete vollständig mit Exit 0.

## W0-01-Zugriffsversuch vom 13.07.2026

- Die bereinigte Versuchsevidence trennt den sichtbaren Tabtitel sowie die bereinigten URL-Parameter `Playthru` und `UABC-BASIC-DE` strikt von BC-Feld-Readbacks. Die Nutzerinformation, dass der ausgewählte technische Mandant inhaltlich dem Standard-CRONUS-Demostand entspricht, ist als `user-provided-project-information` klassifiziert und ausdrücklich nicht als eigener Browser-Readback ausgegeben.
- Die Browser-Sicherheitsrichtlinie blockierte vor DOM, Screenshot und BC-Feldlektüre. Interne Company-ID, sichtbarer Gesellschaftsname, Firmendaten, Country/Region, CRONUS-Indizien und Gesellschaftsliste bleiben `nicht-aus-bc-ui-gelesen`; Screenshotpfade und gelesene Werte bleiben leer. Es gab keine Speicherung, keine Authdatenlektüre und keine BC-Schreibwirkung.
- `UABC-39` ist `blocked`, führt die beiden Worklogs `WL-UABC-39-W0-01-BLOCKED-20260713` und `WL-UABC-39-W0-01-RETRY-BLOCKED-20260713` mit zusammen 0,50 Stunden und 60 EUR, bindet die gemeinsame Versuchsevidence und besitzt keinen Abschlusskommentar. Beide Versuche endeten vor DOM, Screenshot und BC-Feldlektüre; Ziel- und Resetentscheidung bleiben offen. Nächster zulässiger Schritt bleibt `W0-01-read-company-identity` in einem manuell zugänglichen Nur-Lese-Termin.
- Die fokussierten Story-, Jira-, Setup-, Simulation-, Playthrough- und Spectra-Validatoren bestanden. Der kombinierte Positiv-/Negativtestblock bestand mit 161 von 161 Tests; darunter URL-/Titelableitung, fehlende Screenshots, unzulässiger Write-Claim, falscher Ticketabschluss, Istsummenabweichung und Konformitätsleckage.
- Dreizehn Story-/Jira-/Setup-/Index-/Map-/Provenienz-/Konformitäts-/Referenzgraph-/Katalogartefakte wurden in zwei vollständigen Generatorläufen bytegleich erzeugt. Die SHA-256-Digests lauten: Index `c2ca21a8faace5fbda0946a89aff25b6d045b9219183505080bc9d9da2598a2d`, Twin-Map `867f9132a18488a1389edb02f30a8171078e777c31123263d9addc3c4d78ab06`, Setup-Projektion `39c32f99eecb7dbd1dead63fea4c637f6e176748dd06ab66afbcd1413a42abe4`, Spectra-Konformität `9ef72fbf9e64abbd33dd0e15a2a1e1923731f79d3b8fcfa1107427445ebc0b4a` und Dokumentkatalog `1c41152a85a45ab251677326201fe4ed93f81e885497b8008021325c6081fedf`.
- Die gezielte Diff-Review blieb ohne Fachbefund. Der commitgebundene Gesamtcheck `npm test` lief nach den fail-closed gefundenen und korrigierten Digest-, Git-Blob-Katalog- und `committedHours`-Abweichungen vollständig 131,5 Sekunden und endete mit Exit 0. Darin bestanden unter anderem 184 von 184 Governance-Tests, 10 von 10 Walkthrough-Artefakttests, 2 von 2 Playwright-Ansichten, Snapshot, Dokumentkatalog, Deutsch, OpenSpec und Referenzen.

## Nutzerfakt und offene Gesellschaftsherkunft

- Der operative Producervertrag führt den Standard-CRONUS-Inhalt als `user-provided-project-information`, verneint mit `customerTargetRealized=false` einen realisierten Kundenstand und lässt Kopie oder Umbenennung mit `copyRenameHypothesis=nutzerhinweis-unbestaetigt` sowie `originMechanismStatus=unbekannt-bis-wave0-readback` ausdrücklich offen.
- Matrix, Pilot-Setup-Baseline, W0-01-Versuchsevidence, feldgenauer Kontrollzentrum-Run-Plan, kanonische Projektstory, Setup-Wave-Projektion, Spectra-Konformität und Kundenflächen führen dieselbe Grenze. `pilotConfigured=false`, `writesApplied=false`, `writesAuthorized=false`, Pakete 0/0/0 und RUN-06 bis RUN-22 NO-GO bleiben unverändert.
- Die fokussierte Positiv-/Negativprüfung bestand mit 165 von 165 Tests. Neue Negativfälle lehnen einen allein aus dem technischen Gesellschaftsnamen realisierten Kundenstand sowie eine ohne DOM-Readback bestätigte Kopier-/Umbenennungsherkunft in Matrix, Baseline, Run-Plan, Projektstory und Twin-Konformität fail-closed ab.
- Zwölf Story-/Jira-/Setup-/Index-/Map-/Provenienz-/Konformitäts-/Referenzgraph-Artefakte wurden in zwei vollständigen Generatorläufen bytegleich erzeugt. OpenSpec-Schema, OpenSpec strict mit 10 von 10 Items, Referenzen sowie 19 von 19 Sprachtests bestanden.
- Es gab keinen BC-, Browser-, Authentifizierungs-, Readback-, Schreib- oder Push-Vorgang. Der commitgebundene Gesamtcheck `npm test` lief 143,8 Sekunden und endete mit Exit 0; darin bestanden unter anderem 191 von 191 Governance-Tests, 10 von 10 Walkthrough-Artefakttests, 2 von 2 Playwright-Ansichten, Snapshot, Dokumentkatalog, Deutsch, OpenSpec und Referenzen. Die gezielte Review blieb ohne Befund.

## CORE-FINANCE-Ausführungsvorbereitung

- Der kanonische Payload und sein deterministisches Manifest beschreiben 19 Konfigurationspakettabellen mit 51 Datensätzen sowie 7 manuelle Tabellen mit 18 Sollwerten. Enthalten sind 11 Kontenrollen, 2 Dimensionen mit 5 Werten, 9 Nummernserien mit 9 Linien, 2 Zahlungsbedingungen und eine Bankbuchungsgruppenbaseline ohne Bankkonto oder reale Bankkennung.
- Die Finanzreferenzen sind differenzfrei geschlossen: Kontenrollen, Buchungsgruppen, 19-Prozent-VAT-Annahme, Dimensionen, Nummernserien, Zahlungsbedingungen, Perioden und Lagerort lösen in der vorgegebenen Importfolge auf. Die Steuerannahme bleibt unbestätigt und vor Anwendung gesperrt.
- Der feldgenaue Run-Plan bindet BC-Seiten, Aktionen, FastTabs, Felder, Import, Paketvalidierung, erwartete Fehler, Korrektur, Retest, Nachkontrolle, Rollback und Evidenceziele. `W0-01`, Zielstrategie, Resetpunkt, Steuerbestätigung und separate Schreibfreigabe bleiben zwingende Vorgates.
- Der CORE-Validator bestand; 1 Positiv- und 15 isolierte Negativtests lehnten Duplikate, unbekannte Schlüssel, Ledger-/gebuchte Tabellen, Abhängigkeits- und Reihenfolgefehler, offene Referenzen, reale Bankdaten, Steuerbestätigung, Write-/Ready-Claims, W0-Umgehung und stale Manifeste fail-closed ab.
- Setup-Wave, Pilotbaseline, Story, Jira, Confluence, Deliverables, Datenbereitschaft, Dokumentkatalog, Referenzgraphen und Twin-Projektion wurden regeneriert. 13 abgeleitete Artefakte waren im Wiederholungslauf bytegleich; die Projektion umfasst 145 positivgelistete Twin-Artefakte.
- `UABC-40` ist als laufende repositoryseitige Vorbereitung mit 2,00 Stunden und 240 EUR erfasst. Zusammen mit den zwei blockierten UABC-39-Versuchen beträgt das aktuelle Ist 2,50 Stunden und 300 EUR; der Plan bleibt 80 Stunden und 9.600 EUR. In Ticketansichten werden keine Geldbeträge ausgegeben.
- Deliverables 003 und 004 stehen auf `prepared-for-controlled-live-run`; sieben weitere Liefergegenstände bleiben geplant. Es gibt keinen `completed`-, `applied`-, `accepted`- oder Customer-ready-Claim.
- Fokussiert bestanden CORE 16/16, Pilotbaseline 33/33, Setup-Wave 21/21, Setup-Export 17/17, Story 71/71, Jira-Realismus 29/29, Spectra 25/25, Dokumentkatalog 32/32, Deutsch 20/20 sowie OpenSpec strict 10/10. Der genau einmalige commitgebundene Gesamtcheck `npm test` lief 129,4 Sekunden und endete mit Exit 0; darin bestanden Snapshot, Dokumentkatalog, Sprache, 209 Governance-Tests, 10 Walkthrough-Artefakttests, 2 Playwright-Ansichten und die Referenzprüfung.
- Es gab keine BC-, Browser-, Authentifizierungs-, Bank-, Steuer-, Mail-, Paket-Apply-, Buchungs- oder Push-Aktion. `writesAuthorized=false`, alle realen Paketstände 0/0/0 und RUN-06 bis RUN-22 NO-GO bleiben unverändert.

## Zweiter W0-01-Nur-Lese-Versuch vom 13.07.2026

- Die vorhandene angemeldete Registerkarte wurde erneut ausschließlich lesend
  adressiert. Die Unternehmensrichtlinie blockierte auch diesen Versuch vor
  DOM, Screenshot und BC-Feldlektüre. Es wurden keine Authdaten gelesen und
  keine BC-Aktion ausgeführt.
- Die Evidence führt nun zwei getrennte Versuche. `UABC-39` bleibt `blocked`,
  besitzt drei Arbeitskommentare ohne Abschlusskommentar und führt zwei
  Worklogs mit zusammen 0,50 Stunden und 60 EUR. Das Gesamt-Ist beträgt damit
  2,50 Stunden und 300 EUR aus drei Task-Worklogs; Plan 80 Stunden und
  9.600 EUR bleibt unverändert.
- Direkte Pilot-, Story-, Jira-, Setup- und Spectra-Validatoren bestanden. Der
  fokussierte Positiv-/Negativblock bestand mit 154 von 154 Tests. Elf
  abgeleitete Story-, Jira-, Index-, Katalog-, Setup-, Konformitäts- und
  Referenzgraphartefakte wurden zweimal bytegleich erzeugt.
- Der Dokumentkataloggenerator und der commitgebundene Katalogvalidator
  bestanden mit 43 Dokumenten, 28 strukturierten Seiten, 3 Spaces und
  19 Migrationseinträgen.
- `writesAuthorized=false`, `pilotConfigured=false`, `writesApplied=false`,
  `bcReadbackAuthority=false`, Pakete 0/0/0 und CORE-FINANCE
  `prepared-for-controlled-live-run` bleiben unverändert. Der einzige nächste
  BC-Schritt ist weiterhin ein manuell zugänglicher, ausschließlich lesender
  W0-01-Feldtermin.
- Der erste Gesamtcheck fand fail-closed ausschließlich eine beschädigte
  Schreibweise von `Feldlektuere` in der geänderten Entscheidungszeile. Nach der isolierten
  UTF-8-Korrektur bestanden das betroffene aktive Ticketvertrag-/Encoding-Gate
  und die Deutschprüfung. Der anschließend gemäß Abnahmenachsteuerung genau
  einmal auf dem korrigierten Commit ausgeführte vollständige `npm test` lief
  130,4 Sekunden und endete mit Exit 0. Darin bestanden unter anderem
  211 Governance-Tests, 10 Walkthrough-Artefakttests, 2 Playwright-Ansichten,
  Snapshot, Dokumentkatalog, Sprache, OpenSpec und Referenzen.
- Die finalen SHA-256-Digests lauten: Index
  `1e28677ff179f45120eada12c449f33d8fa7043d1c4e15529071e392a38b25dc`,
  Twin-Map
  `b551deea8df9797ea26ce6a8b964ca03e9650cbea26d35abd96ada67f4894932`,
  Setup-Projektion
  `f757373fbea1b914e9f8268fe55cb4e0d483b668cafd9cd2abdafe3fdfbd4da7`,
  Spectra-Konformität
  `26fe2a8fd701a07ec6620c0f2a620613c61f5798f6f64ea983206b9adb0b3554`
  und Dokumentkatalog
  `810d90c4cfc06932ab5b0c096448715214006e16cd71d6eaaf56e82639b4e1e9`.
