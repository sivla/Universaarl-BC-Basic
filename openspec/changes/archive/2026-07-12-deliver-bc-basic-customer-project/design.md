# Loesungsdesign: BC Basic Einrichtung

## Faktenbasis

- Die kanonische Baseline weist `playthru` und die sichtbare Gesellschaft `Universaarl GmbH` nur lesend nach; sie erteilt keine Schreibfreigabe.
- Die Projektablage besitzt eine vollstaendig durchgespielte repositorybasierte BC-Basic-Referenzsimulation mit OpenSpec-, Jira-, Confluence-, Playthrough- und Nachweisstrukturen. Eine reale BC-Einrichtung wurde weiterhin nicht behauptet.
- **BC Basic Einrichtung** ist ein internes Standardprodukt. Die tatsaechliche Microsoft-Lizenz- und Tenantentscheidung bleibt menschlich freizugeben und kostenextern.
- Microsoft beschreibt Standardpfade fuer Grundeinrichtung, Finanzwesen, Verkauf/Einkauf, einfaches Lager, Konfigurationspakete, Periodenabschluss und deutsche UStVA-Funktionalitaet. Die konkrete Verfuegbarkeit wird erst im Zielzustand geprueft; aus der Planung wird keine Feature-Verfuegbarkeit abgeleitet.

## Annahmen

- Die synthetische Zielgesellschaft ist nach expliziter Freigabe genau `Universaarl GmbH` in `playthru`; ein stiller Wechsel auf eine zweite Gesellschaft ist unzulaessig.
- Der Umfang soll mit Standardfunktion ohne Premium-spezifische Bereiche wie Produktion oder Service auskommen. Ergibt die Lizenzpruefung etwas anderes, wird der Umfang gestoppt und neu entschieden.
- Die Kundenseite liefert Entscheidungen, Daten und Abnahmen; sie wird nicht als eigener Projektaufwand simuliert. Der Dienstleister arbeitet als One-Man-Show ueber Planung, Beratung, Einrichtung, Test, Schulung und Dokumentation.
- Der entschiedene Tagessatz betraegt 1.300 EUR netto bei 8 Stunden pro Tag; der rechnerische Stundensatz betraegt 162,50 EUR netto. Ein verbindliches Budgetlimit ist offen und wird nicht erfunden.

## Architektur

### Eine Quelle, zwei Sichten

OpenSpec fuehrt Anforderungen und Pruefpunkte. Jira fuehrt Arbeit, Aufwand und abrechenbare Istzeit. Confluence fuehrt erklaerenden Projektkontext, Besprechungen und Entscheidungen. Strukturierte Projektartefakte fuehren Plan, Datenpaket, Schulung und Abrechnung. `exports/project-data/v1/index.yaml` ist ausschliesslich der `proposed`, repository-relative Daten- und Allowlistvertrag mit stabilen IDs, Pfaden und Selektoren. Er ist kein Snapshotmanifest und enthaelt weder eine aktuelle Commit-SHA noch sich selbst als Payload.

Der versionierte Uebergang ist gerichtet: Ein echter Spectra-Release im technischen BCProjectOS-Repository bindet die Kundeninstanz; die versionierte Consumerbindung benennt den Project Twin als ausschliesslich lesenden Consumer; erst danach darf die Kundeninstanz aus einer sauberen Quell-Commit-SHA ein Snapshotmanifest erzeugen. Spectra-Releases tragen das Tagmuster `spectra-v<SemVer>`. Die Twin-Identitaet `https://github.com/sivla/FiBu.git` mit Branch `codex/universaarl-projekt-twin` autorisiert nur das Lesen eines bereits freigegebenen Snapshots. Sie autorisiert weder dessen Erzeugung noch Rueckschreiben oder das Ueberspringen der Spectra-/BCProjectOS-Bindung.

### Zweistufiger Snapshotvertrag

Stufe 1 liest den Projektindex, die Consumerbindung und alle positivgelisteten Payloaddateien ausschliesslich als Git-Blobs derselben sauberen, vollstaendigen Quell-Commit-SHA. Der Index und jedes Artefakt werden als Record mit Pfad, Git-Modus, Bytegroesse und lowercase SHA-256-Blobdigest aufgenommen; Artefakt-Records werden ordinal nach UTF-8-Bytes des Pfades sortiert. Der Payload-Bundle-Digest folgt exakt `uabc-snapshot-records-v1`: `pathUtf8 + NUL + gitModeAscii + NUL + sizeBytesDecimalAscii + NUL + sha256HexLowerAscii + LF` fuer Index und Artefakte, ohne `sha256:`-Praefix in den Records.

Stufe 2 erzeugt aus dieser bereits validierten Payloadliste das Manifest nach `governance/schemas/project-snapshot-manifest.schema.json`. Das Manifest enthaelt keinen eigenen Digest und wird nicht Teil seiner Payloadliste. Dadurch ist die Erzeugung nicht selbstreferenziell. Der Generator verweigert unsaubere Arbeitskopien, abweichende HEADs, absolute oder uebergeordnete Pfade, eine unvollstaendige BCProjectOS-Bindung, einen nicht passenden Consumer und jeden Mischzustand. Im aktuellen Stand wird kein Snapshotmanifest erzeugt.

Der Project Twin liest spaeter ausschliesslich den neuesten vollstaendig validierten Commit des festgelegten BC-Basic-Branches. Projektpayload, Index und Integritaetsangaben gehoeren gemeinsam in diesen normalen fachlichen Commit; ein separater Manifest-only-Commit und eine kuenstliche A/B-Folge sind nicht erforderlich. Historische A/B-Commits bleiben unveraendert. Ein ungueltiger Branch-HEAD wird fail-closed abgelehnt; ein Release kann diesen Stand optional durch Commit und Tag einfrieren.

### Commitgebundener Dokumentkatalog

`exports/project-data/v1/document-catalog.json` ist der einzige Producer-Vertrag fuer die Navigation ueber alle 32 als Markdown positivgelisteten Projektdokumente. Der Branch-Index bleibt die einzige Allowlist; der Katalog darf keinen zusaetzlichen Quellpfad freigeben. Die 19 Dateien unter `atlassian/confluence/pages/` verwenden ihre vorhandene Frontmatter-ID und Parenthierarchie. Fuer die 13 weiteren Dokumente gilt eine bereits vorhandene Dokument-, Meeting- oder Index-Artefakt-ID als stabiler Fallback. Phase und Prozess bleiben `null` oder `not_evidenced`, wenn die Projektquelle keine belastbare Zuordnung traegt.

Der Twin loest `codex/universaarl-projekt` genau einmal auf und pinnt die Commit-SHA ausserhalb der Dateien dieses Commits. Index, Katalog und Dokumentblobs werden anschliessend nur ueber diesen Commit gelesen. `contentSha256` ist der SHA-256 der rohen Git-Blobbytes; jeder Pfad muss exakt ein regulaerer `100644`-Blob sein. Katalog und Schema enthalten keine Selbst-SHA. Externe URL, Confluence-Page-ID und Space-Key bleiben `null`, solange keine kanonische Quelle und keine sichere HTTPS-Origin belegt sind. Das historische `snapshot-manifest.json` bleibt unveraenderte Legacy-Evidence und bestimmt weder Kataloggueltigkeit noch Branch-Lesbarkeit.

### Drei Confluence-Wissensraeume ohne zweite Wahrheit

Der vorhandene Dokumentkatalog wird um die interne Space-Identitaet, den Space-Typ, die Reihenfolge und die stabile Story-Seiten-ID erweitert. Er bleibt gemeinsam mit dem Branch-Index die einzige maschinenlesbare Seitenbaumquelle. `atlassian/confluence/space.yaml` verweist nur auf diesen Vertrag; es fuehrt keinen parallelen Seitenbaum. Eine versionierte Redirect-Matrix beschreibt fuer jede der 19 stabilen Seiten die fachliche Umbenennung und Parent-Migration, ohne Pfad oder ID zu aendern.

- `UABC-SPACE-CUSTOMER` enthaelt die konkrete Kundenprojektwahrheit von Support und Unternehmensmodell bis Projektsteuerung, Hypercare und Uebergabe.
- `UABC-SPACE-PRODUCT` beschreibt das kundenunabhaengige BC-Basic-Standardprodukt, seine Voraussetzungen, Standards, Liefergrenzen und Betriebslogik.
- `UABC-SPACE-CONSULTANT` ist die interne, wiederverwendbare Durchfuehrungshilfe fuer Discovery, Einrichtung, Migration, Test, Training, Cutover und Abschluss.

Jeder Space besitzt genau eine Root-Seite. Parent-Beziehungen bleiben innerhalb desselben Space, `order` ist je Parent eindeutig und jede Seite besitzt genau einen sicheren, positivgelisteten Markdown-Blob. Externe Confluence-URL, Page-ID und Space-Key bleiben weiterhin unbelegt. Ein schlankes Lesemuster stellt Kurzkontext und Status vor Detailinhalt; technische IDs und Pruefausgaben erscheinen erst in den Referenzen. Formatpruefungen blockieren doppelte Haupttitel, ungeschlossene Codebloecke, uebersprungene Ueberschriftsebenen und unlesbare Tabellenstrukturen.

Die 17 bisherigen Arbeitsprotokolle werden in 19 stabile, abrechenbare Tasks migriert; der bisher gemischte Vier-Stunden-Fit-to-Standard-Nachweis wird fachlich auf Einkauf, Verkauf und Lager aufgeteilt. Drei geordnete Phase-Tickets bilden die oberste Ebene und projizieren acht stabile fachliche Epics. Die Hierarchie lautet ausschliesslich `Phase-Ticket -> Epic -> Story oder Bug -> Task` und ein Epic darf in mehreren Phasen erscheinen. Nur Tasks erzeugen fakturierbare Worklogs und Rechnungszeilen; alle Tasks der drei Phasen sind abrechenbar. Epics, Stories und Bugs duerfen realistische Schaetzwerte sowie aus ihren Tasks abgeleitete Ist-/Rest-Rollups zeigen, erzeugen aber keine eigenen fakturierbaren Worklogs. Die 80 Stunden und 9.600 EUR werden dadurch exakt einmal aus den 19 Task-Worklogs berechnet. Die 38 aelteren Projekt-, Blueprint-, Umgebungs- und Walkthrough-Issues bleiben unveraenderte interne Planungs- und Traceability-Artefakte; sie werden nicht als zweites Kundenbacklog oder zusaetzliche Stunden gezaehlt.

Die ausdrueckliche Migrationsentscheidung wird mit Alt-Typ, neuer Task-Elternklammer und stabiler Worklog-ID dokumentiert. Das Kundenboard und die kompakte Liste zeigen nur die drei Phase-Tickets und acht fachliche Epics mit ihren fachlichen Ergebnissen, Fehlern und Tasks. OpenSpec-, Schema-, Generator-, Validator-, Digest-, Commit-, Snapshot- und Twin-Arbeit bleibt ausserhalb des Kundenbacklogs.

Der Export uebernimmt `type` explizit aus der jeweiligen kanonischen Ticketquelle, normalisiert ausschliesslich die belegte technische Schreibweise und dokumentiert Parent-Typ, Sichtbarkeitsrolle und Zaehlbereich. Weder Generator noch Twin duerfen Tickettypen aus Key, Titel, Parent oder Position erraten. Fehlende oder unbekannte Typen, doppelte IDs, falsche Zaehlung und eine nicht erlaubte Parent-Typ-Kombination blockieren die Uebergabe.

Der Dokumentkatalog liefert drei flache Space-Module und die 19 stabilen Seiten als explizite Navigationsknoten. Jeder Knoten traegt Typ, Titel, Reihenfolge, Parent, optionales Dokumentziel und den semantischen Ausgangszustand `expanded` oder `collapsed`. Der Ticketkatalog liefert genau eine Board- und eine Kompaktlisten-View mit expliziten Spalten, Statuszuordnung, Gruppen, sichtbaren Feldern, Filtern und derselben Expand-Semantik. Die 38 historischen Traceability-Issues bleiben ausserhalb der kundenlesbaren Views.

Jeder kanonische Tickettyp besitzt ein deutsches Label, einen sicheren `displayIconKey` und einen `displayColorToken` aus geschlossenen Positivlisten. Beliebige HTML-/SVG-Fragmente und externe Icon-URLs sind unzulaessig. Ein spaeteres Jira-Asset darf erst nach lokaler Speicherung, Positivlistung und Digestbindung verwendet werden; aktuell wird kein solches Asset behauptet.

### Liefermodell

Die folgenden Zeitfenster sind relative Planannahmen und keine Kundenzusage. Kalenderdaten in Jira dienen nur der technisch erforderlichen, als `scheduleSynthetic: true` markierten Simulation.

| Phase | Relatives Zeitfenster | Planstunden | Ergebnis |
| --- | --- | ---: | --- |
| `UABC-PHASE-01` | circa drei Kalenderwochen ab bestaetigtem Projektauftakt | 18 | Umfang, Anforderungen, Entscheidungen, Daten und Abnahmeplan sind bereit |
| `UABC-PHASE-02` | genau fuenf aufeinanderfolgende Arbeitstage nach Bereitschaftspruefpunkt | 40 | Standardkonfiguration, Daten, Schulung, fachlicher Abnahmetest und Sandbox-Uebergang sind abgeschlossen |
| `UABC-PHASE-03` | eine Kalenderwoche nach Einrichtung | 10 | Hypercare, Monatsabschlussprobe, UStVA-Vorschau und Uebergabe sind abgeschlossen |

Die 68 Planstunden sind eine Kalkulationsbasis. Es gibt keine Reserve, keine harte Budgetgrenze und keine vorab erfundene Budgetobergrenze; abgerechnet wird nur genehmigte, tatsaechlich geleistete Dienstleisterzeit.

Der synthetische Projektstory-Abschluss verwendet davon getrennt die versionierte Angebotsbasis 2.0 mit 80 Stunden zu 120 EUR und 9.600 EUR netto. Historische Kalkulation, synthetisches Angebot und synthetisches Ist werden getrennt ausgewiesen; daraus entsteht keine reale Rechnung oder Kundenfreigabe.

### Spectra-0.10-Reconciliation, Adapter-Provenienz und Referenzgraph-Coverage

`evidence/simulation/project-reconciliation.json` bildet die historische Kalkulation von 68 Stunden zu 162,50 EUR und 11.050 EUR sowie das synthetische Angebot und Ist von jeweils 80 Stunden zu 120 EUR und 9.600 EUR nach dem veroeffentlichten Spectra-0.10-Vertrag ab. Der neue Coverage-Nachweis ist ein technischer Lieferstand ohne zusaetzliche Stunden oder Kosten; Rechnung, Buchung, Zahlung und produktive Leistung bleiben explizit `false` beziehungsweise nicht anwendbar.

Der einzige Branch-Index wird durch `scripts/generate-spectra-0.10-integration.mjs` deterministisch in `exports/project-data/v1/twin-export-map.json` projiziert. `evidence/simulation/adapter-provenance.json` bindet Indexhash, Mappingversion und Projektionsdigest. Source-Hash vor und nach der Projektion muessen identisch sein; Source-Modus ist read-only, Schreiben und Ueberschreiben sind verboten. Die Exportmap ist abgeleitet und keine zweite fachliche Source of Truth.

Der gleiche Generator normalisiert die unveraenderten 252 nativen Storyrelationen und die 328 portablen Kanten in getrennte, abgeleitete Exportdateien. `evidence/simulation/reference-graph-coverage.json` bindet Quellgraph, Mappingregel und portable Projektion ueber SHA-256. Die Coverage-Semantik `explained-native-relations` erklaert alle nativen Relationen, behauptet aber weder eine 1:1-Abbildung noch eine vollstaendige portable Repräsentation.

### Fachlicher Zuschnitt

- **Grundeinrichtung:** Unternehmensdaten, Sprache/Region, Arbeitsdatumkonzept, SKR04, Nummernserien, Buchungsperioden und minimale Berechtigungsrollen.
- **Finanzwesen:** Sachkonten, Buchungsmatrix, Debitoren-/Kreditoren-/Bestandsbuchungsgruppen, MwSt.-Buchungsgruppen, Zahlungsbedingungen, Bankkonten als Stammdaten, Bankersatz-/Journalkonzept, zwei Dimensionen und Basisberichte.
- **Konfigurationspakete:** bevorzugter Einrichtungs- und Importweg fuer Setupdaten, Stammdaten und kontrollierte offene Posten; gebuchte Daten werden nicht historisch voll importiert. Manuelle BC-Schritte bleiben dokumentierte Ausnahmen.
- **Einkauf:** Lieferant, Bestellung, Wareneingang, Eingangsrechnung und begrenzter Zahlungsvorbereitungstest.
- **Verkauf:** Kunde, Angebot oder Auftrag, Lieferung, Verkaufsrechnung und begrenzter Zahlungseingangstest.
- **Einfacher Bestand:** ein Lagerort, keine verpflichtenden Lagerplaetze, Artikelanlage, Einheit, Zugang, Bestand und einfache Inventur.

### Nachweis- und Ruecksetzmodell

Jedes spaetere Playwright-Szenario bindet Umgebung, Gesellschaft, Rolle, Arbeitsdatum, synthetische Datensatz-IDs, Jira-Key, Anforderungs-/Szenario-ID und geplante Nachweis-ID. Mutierende Schritte benoetigen eine separate menschliche Schreibfreigabe. Szenarien werden in einer definierten Reihenfolge ausgefuehrt; ein dokumentierter Ruecksetzpunkt verhindert, dass ein Wiederholungslauf bereits gebuchte Belege als neuen Erfolg wertet.

## Entscheidungen

- `UABC-DEC-BCB-001`: Genau eine synthetische Gesellschaft und ein Lagerort.
- `UABC-DEC-BCB-002`: Standard vor Anpassung; keine Erweiterungen oder Integrationen.
- `UABC-DEC-BCB-003`: Drei Phasen mit genau fuenf aufeinanderfolgenden Arbeitstagen fuer die Umsetzung; konkrete Kundentermine sind offen.
- `UABC-DEC-BCB-004`: 68 Planstunden als Kalkulationsbasis; kein verbindliches Budgetlimit ist entschieden.
- `UABC-DEC-BCB-005`: Woechentliche Rechnung nur aus freigegebenen, abrechenbaren Jira-Istzeiten auf unterster Ticketebene zu 162,50 EUR netto pro Stunde; Schaetzungen und Elternsummen sind nicht abrechenbar.
- `UABC-DEC-BCB-006`: UStVA nur als Vorschau ohne Uebermittlung; Steuerfreigabe ist extern.
- `UABC-DEC-BCB-007`: Der Twin ist ausschliesslich ein lesender Konsument eines spaeter validierten, versionierten Snapshotvertrags; der aktuelle Projektindex und die Konsumentenbindung bleiben `proposed`.

## Alternativen

- Mehrere Gesellschaften: verworfen, weil sie das wiederverwendbare Grundpaket unnoetig vergroessern.
- Breite Vorabkonfiguration ohne Datenbereitschaft: verworfen, weil sie Nacharbeit in die Umsetzungswoche verschiebt.
- Rechnung nach Schaetzung: verworfen; nur genehmigte Istzeit ist abrechenbar.
- UStVA-Test- oder Produktivuebermittlung: ausgeschlossen, weil Simulation keine steuerliche Mandatierung ersetzt; ELSTER-Zugangsdaten werden nicht verwendet.
- Schulung zur Erstellung von Konfigurationspaketen: ausgeschlossen, weil die Pakete in P001 ein Dienstleisterwerkzeug und kein Kundenlernziel sind.
- Twin mit eigener Datenbank: ausgeschlossen, weil dies eine zweite Wahrheit erzeugt.

## Offene Punkte

1. Echte Bestaetigung, dass `Universaarl GmbH` die einzig erlaubte Schreibzielgesellschaft ist und zurueckgesetzt werden darf.
2. Menschliche Lizenzentscheidung Essentials/Premium einschliesslich externer Kosten.
3. Steuerberaterfreigabe fuer Konten, MwSt.-Buchungsmatrix, UStVA-Kennzeichen und UStVA-Vorschau.
4. Benannte reale Abnehmer fuer Daten, fachlichen Abnahmetest, UAT, Monatsabschlussprobe, UStVA-Vorschau, Uebergabe und Abschluss der einwoechigen Hypercare.
5. Projektspezifische Autorisierung eines spaeteren mutierenden Playwright-Laufs.
6. Menschliche Entscheidung, ob es ein Budgetlimit gibt; bis dahin bleiben Budgetobergrenzen `unknown`.
