# BC Basic Einrichtung Lieferfaehigkeit

## ADDED Requirements

### Requirement: UABC-REQ-BCB-012 Eigenes Repository spaeter vorbereiten
Die Kundeninstanz MUST fuer die spaetere Trennung aus dem gemeinsam genutzten `https://github.com/sivla/FiBu.git`-Repository in ein eigenes Repository mit Zielname `Universaarl-BC-Basic` einen versionierten Migrationsvertrag fuehren. Der Vertrag MUST die zu erhaltende Branch-, Commit- und Tree-Identitaet, den Zielbranch `main` sowie Arbeitsbranches nach `codex/...` nennen. Der Projekt-Agent DARF spaeter nur den eigenen Arbeitsbranch pushen oder einen PR erstellen; Merge, Tag und Release bleiben dem Kontrollzentrum vorbehalten. Die Vorbereitung MUST keine Remote-Aenderung, Repository-Anlage, fachlichen Daten-, ID-, Spectra- oder Snapshotfeld-Aenderung enthalten.

#### Scenario: UABC-SCN-BCB-018 Migration ohne Identitaetsverlust vorbereiten
- **GIVEN** die Kundeninstanz liegt aktuell auf einem gemeinsam genutzten Repository und einem kanonischen Branch
- **WHEN** der lokale Migrationsvertrag erstellt oder geprueft wird
- **THEN** nennt er Remote, Branch, vollstaendige HEAD-SHA und Tree-SHA als zu erhaltende Ausgangsidentitaet und weist `Universaarl-BC-Basic`/`main` nur als spaeteres Ziel aus

#### Scenario: UABC-SCN-BCB-019 Veroeffentlichungsgrenzen der Trennung
- **GIVEN** ein spaeterer eigener Arbeitsbranch im Zielrepository
- **WHEN** der Projekt-Agent eine Veroeffentlichung vorbereitet
- **THEN** sind nur Push und PR dieses eigenen `codex/...`-Branches zulaessig; Merge, Tag und Release werden nicht vom Projekt-Agenten ausgefuehrt

### Requirement: UABC-REQ-BCB-001 Ein synthetisches Standardprodukt
Das Projekt MUST genau eine synthetische deutsche Gesellschaft in der Sandbox `playthru` verwenden und MUST `UABC-BC-BASIC-001` als stabile Projektkennung fuehren. **BC Basic Einrichtung** MUST als kleinstes wiederverwendbares Universaarl-Servicepaket und darf nicht als Microsoft-Lizenzname dargestellt werden.

#### Scenario: UABC-SCN-BCB-001 Zielgrenze vor Ausfuehrung bestaetigen
- **GIVEN** ein geplanter mutierender Einrichtungs- oder Testlauf
- **WHEN** Umgebung und Gesellschaft gebunden werden
- **THEN** sind ausschliesslich `playthru` und die menschlich freigegebene `Universaarl GmbH` erlaubt und jeder andere Zielzustand fuehrt vor dem ersten Schreibvorgang zum Abbruch

### Requirement: UABC-REQ-BCB-002 Drei verbindliche Phasen
Das Projekt MUST aus Vorbereitung/Anforderungen und Datenbereitschaft, genau einer Einrichtungs- und Schulungswoche sowie einer einwoechigen Hypercare mit hoechstens 10 Stunden bis zur Monatsabschlussprobe in der Sandbox und zur UStVA-Vorschau bestehen. Jede Phase MUST Eintrittskriterien, Austrittskriterien, Abhaengigkeiten, Verantwortliche und Nachweise besitzen. Phase 1 MUST einen UAT-Katalog mit genau sieben `planned` Pflichtfaellen fuer Navigation und Look-and-Feel, Einkauf, Verkauf, einfachen Bestand, Finance/Abstimmung, Monatsabschlussprobe und UStVA-Vorschau ohne Uebermittlung liefern; Planung MUST von Ausfuehrung und Abnahme getrennt bleiben.

#### Scenario: UABC-SCN-BCB-002 Datenbereitschaft schuetzt die Umsetzungswoche
- **GIVEN** Phase 1 ist geplant abgeschlossen
- **WHEN** Phase 2 gestartet werden soll
- **THEN** sind Umfang, Pflichtdaten, Loesungsentscheidungen, Pruefplan, genau sieben geplante UAT-Pflichtfaelle und offene Fachfreigaben dokumentiert oder der Start wird blockiert

#### Scenario: UABC-SCN-BCB-003 Hypercare hat fachliche Abschlusskriterien
- **GIVEN** die Einrichtung, Schulung und vorbereiteten UAT-Faelle wurden fachlich geprueft
- **WHEN** der Abschluss der einwoechigen Hypercare beantragt wird
- **THEN** sind relevante UAT- und Hypercare-Befunde bearbeitet, Monatsabschlussprozess in der Sandbox geprobt, Abstimmungen dokumentiert, UStVA-Vorschau abgeschlossen und Projektdokumentation sowie Schulungsunterlagen akzeptiert

### Requirement: UABC-REQ-BCB-003 Standardumfang ohne Erweiterungen
Der Pflichtumfang MUST Grundeinrichtung mit SKR04, Finanzwesen/Buchhaltung, Einkauf, Verkauf und einfachen Bestand an genau einem Lagerort abdecken. Er MUST Debitoren, Kreditoren, wenige realitaetsnahe Artikel, Einheiten, Preise, einfache Rabatte, Bankkonten als Stammdaten, minimale Dimensionen, Monatsabschlussprobe und UStVA-Vorschau enthalten. AL-Entwicklung, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung oder PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen, Seriennummern, Varianten-/Attributkomplexitaet ohne Pflichtgrund, Produktion, Service, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Steuer-/Rechtsberatung, GoBD-Garantie, Produktivstart, Support nach Hypercare und offene Stabilisierungsphase MUST ausgeschlossen bleiben.

#### Scenario: UABC-SCN-BCB-004 Prozessumfang pruefen
- **GIVEN** ein Fachwunsch oder Testfall
- **WHEN** er dem Projektumfang zugeordnet wird
- **THEN** wird er nur aufgenommen, wenn er mit Standardfunktion in einem ausdruecklich benannten Pflichtszenario des Produkts lieferbar ist

### Requirement: UABC-REQ-BCB-004 Planstunden- und Abrechnungsvertrag
Die geplanten abrechenbaren Jira-Arbeitspakete auf unterster Ebene MUST zusammen 68 Stunden ergeben. Der Tagessatz MUST 1.300 EUR netto bei 8 Stunden pro Arbeitstag betragen; der rechnerische Stundensatz MUST 162,50 EUR netto betragen. Woechentliche Rechnungen MUST ausschliesslich genehmigte abrechenbare Jira-Istzeiten verwenden; Schaetzungen, Elternsummen, doppelt zugeordnete Zeiten, Kundenaufwaende und externe Kosten MUST ausgeschlossen sein. Ein Budgetlimit MUST als `unknown` oder offen gefuehrt werden, solange der reale Repository-Nutzer keines entschieden hat.

Die abgeschlossene synthetische Projektstory MUST die historische 68-Stunden-Kalkulationsbasis von der versionierten Angebots-/Ist-Basis trennen. Angebotsversion 2.0 MUST 80 synthetische Stunden zu 120 EUR und 9.600 EUR netto, die Abweichung, 17 Worklogs, den Abgleich sowie die Wahrheitgrenze ohne reale Rechnung maschinenlesbar nachweisen.

#### Scenario: UABC-SCN-BCB-005 Wochenrechnung berechnen
- **GIVEN** eine abgeschlossene Kalenderwoche mit Jira-Arbeitsprotokollen
- **WHEN** der Rechnungsentwurf erstellt wird
- **THEN** enthaelt er nur genehmigte abrechenbare Dienstleister-Iststunden je Ticket, deren Summe mal 162,50 EUR netto sowie keine erfundene verbleibende Budgetkapazitaet

#### Scenario: UABC-SCN-BCB-006 Budgetlimit nicht erfinden
- **GIVEN** ein Rechnungs- oder Fortschrittsbericht wird erstellt
- **WHEN** kein menschlich entschiedenes Budgetlimit vorliegt
- **THEN** werden Planstunden, genehmigte Istzeit und offener Budgetlimit-Status getrennt dargestellt und es wird kein Stopplimit behauptet

### Requirement: UABC-REQ-BCB-005 Vollstaendige Jira-Tickets
Jeder Jira-Sammelvorgang, jedes Phasenticket und jedes Arbeitspaket MUST Aufwand, Phase, Arbeitsstrom, Abhaengigkeiten, Datenanforderungen, klare Akzeptanzkriterien, konkrete Lieferergebnisse, Abrechnungskennzeichen und mindestens eine Referenz auf ein Besprechungstranskript enthalten. Ein Transkript MAY mehrere Tickets sinnvoll belegen.

#### Scenario: UABC-SCN-BCB-007 Ticket auf Ready setzen
- **GIVEN** ein Jira-Ticket im Backlog
- **WHEN** es nach Ready verschoben werden soll
- **THEN** sind Pflichtfelder, mindestens ein Transkript und alle blockierenden Abhaengigkeiten vorhanden

### Requirement: UABC-REQ-BCB-006 Kontrolliertes synthetisches Daten- und Konfigurationspaket
Alle Projekt- und BC-Daten MUST eindeutig synthetisch sein. Das Datenpaket MUST fuer jedes der acht Objekte eine getrennte maschinenlesbare Blankovorlage und eine vollstaendig synthetische Beispieldatei referenzieren. Blankovorlagen MUST ausschliesslich Struktur, Feldbeschreibungen und zulaessige Wertregeln enthalten; Beispiele MUST untereinander referenziell und summenseitig abgestimmt sein. Ein maschinenlesbarer Datenbereitschaftscheck MUST Vollstaendigkeit, Eindeutigkeit, Buchungsgruppenabhaengigkeiten, Summenabstimmung, synthetische Klassifikation, offene Freigaben und eine blockierende Fehlerregel abdecken. Konfigurationspakete MUST als Dienstleisterwerkzeug fuer Einrichtung und Import mit Tabellen, Pflichtfeldern, ausgeschlossenen Feldern, Abhaengigkeiten, Importreihenfolge, Paketbenennung, Versionierung, Validierungsfehlern, manuellen Ausnahmen und Wiederholungs-/Bereinigungsstrategie dokumentiert werden; ihre Bedienung oder Pflege MUST nicht vom Kunden verlangt werden. Reale `.env`, Authentifizierungszustaende, Geheimnisse, Bank-, Steuer- oder Personendaten MUST ausgeschlossen sein.

#### Scenario: UABC-SCN-BCB-008 Datenpaket freigeben
- **GIVEN** Kunden-, Lieferanten-, Artikel-, Dimensions-, Setup- und Eroeffnungsdaten liegen vor
- **WHEN** der Datenpruefpunkt geprueft wird
- **THEN** sind alle acht Blanko-/Beispielpaare parsebar, Referenzen und Summen abgestimmt, alle Beispielwerte synthetisch markiert und ungepruefte, nicht freigegebene oder sensible Werte durch den Datenbereitschaftscheck blockiert

### Requirement: UABC-REQ-BCB-007 Rollenbezogene Schulung und Handbuecher
Das Projekt MUST Schulungen fuer Business-Central-Bedienung, Finanzwesen, Einkauf/Verkauf, Bestand und Administration mit Lernzielen, Agenda, Uebungen, Anwesenheit, Fragen und Kompetenzpruefung dokumentieren. Schulungen MUST hoechstens vier Stunden pro Tag dauern und bevorzugt in ein- bis zweistuendige Einheiten gegliedert sein. Schulung zur Erstellung oder Pflege von Konfigurationspaketen MUST ausgeschlossen sein. Es MUST ein Kundenhandbuch und ein Beratungshandbuch mit Quellen-, Versions-, Szenario- und Nachweisreferenzen liefern.

#### Scenario: UABC-SCN-BCB-009 Schulung abschliessen
- **GIVEN** ein geplanter Schulungstermin
- **WHEN** der Termin als abgeschlossen markiert wird
- **THEN** sind Transkript, Teilnehmer, gezeigte Szenarien, Uebungsergebnisse, offene Fragen und erforderliche Nachschulung dokumentiert

### Requirement: UABC-REQ-BCB-008 Playwright-Ende-zu-Ende-Pruefung mit begrenzten Schreibvorgaengen
Der Szenariokatalog MUST je einen Pflichtfall fuer Einrichtung, Einkauf mit Bestellung/Wareneingang/Eingangsrechnung, Verkauf mit Angebot oder Auftrag/Lieferung/Verkaufsrechnung, Bestand mit Artikelanlage/Zugang/Bestand/einfacher Inventur, Finance mit Buchung/Abstimmung/Basisbericht/Monatsabschlussprobe, UStVA-Vorschau und einen begrenzten Zahlungstest abdecken. Eine Ausfuehrung MUST vorab projektspezifisch fuer exakt `playthru`, genau eine Gesellschaft, synthetische Daten und definierte Schreibvorgaenge autorisiert sein. Jeder Lauf MUST Screenshot-, Schritt-, Datensatz- und Ergebnisreferenzen erzeugen; nicht ausgefuehrte Szenarien duerfen nicht als bestanden gelten.

#### Scenario: UABC-SCN-BCB-010 Mutierenden Lauf sicher starten
- **GIVEN** ein geplanter Playwright-Lauf
- **WHEN** die erste mutierende Aktion bevorsteht
- **THEN** sind Zielbindung, erlaubte Aktionen, synthetische Daten, Ruecksetzplan und menschliche Schreibfreigabe nachgewiesen oder der Lauf bricht ab

### Requirement: UABC-REQ-BCB-009 Monatsabschlussprobe und deutsche UStVA-Vorschau
Der Abschluss der Hypercare MUST den in der Sandbox geprobten Monatsabschlussprozess mit dokumentierten Abstimmungen fuer Debitoren, Kreditoren, Bankersatz, Bestand, Sachkonten, Steuerkonten, Perioden und Basisberichte enthalten. Die deutsche UStVA MUST als Vorschau fachlich gegen freigegebene Kennzeichen geprueft werden. Test- und Produktivuebermittlung, ELSTER-Zugangsdaten und E-Rechnung MUST ausgeschlossen sein. Das Ergebnis MUST als Sandbox-Probe und nicht als echter Monatsabschluss dargestellt werden.

#### Scenario: UABC-SCN-BCB-011 Monatsabschlussprozess in der Sandbox proben
- **GIVEN** alle simulierten Geschaeftsvorfaelle des ersten Probezeitraums sind in der Sandbox gebucht
- **WHEN** die Abschlusscheckliste ausgefuehrt wird
- **THEN** sind Nebenbuecher, Bestand, Bank, Steuer und Sachkonten abgestimmt und jede Differenz ist geloest oder als blockierender Befund dokumentiert

#### Scenario: UABC-SCN-BCB-012 UStVA-Vorschau ohne Uebermittlung pruefen
- **GIVEN** die Monatsabschlussprobe ist abgestimmt und die Steuerberatung hat die Kennzeichen freigegeben
- **WHEN** die UStVA-Vorschau erzeugt oder angezeigt wird
- **THEN** stimmen Periode, Betraege und Kennzeichen mit der Abstimmung ueberein und es erfolgt weder eine Test- noch eine Produktivuebermittlung an eine Behoerde

### Requirement: UABC-REQ-BCB-010 Saubere Projektdokumentation
Confluence MUST einen navigierbaren Seitenbaum fuer Projekt, drei Phasen, Besprechungen/Entscheidungen und Lieferartefakte besitzen. Aussagen ueber Ausfuehrung MUST auf Jira-, Szenario- und Nachweis-IDs zurueckfuehrbar sein; synthetische Transkripte MUST sichtbar als Simulation markiert sein.

#### Scenario: UABC-SCN-BCB-013 Projektstatus nachvollziehen
- **GIVEN** ein Sponsor oder Pruefer oeffnet die Projektstartseite
- **WHEN** er Phase, Entscheidung, Ticket oder Nachweis auswaehlt
- **THEN** erreicht er die kanonische Blueprint-Quelle ohne widerspruechliche Kopie oder unmarkierte Simulation

### Requirement: UABC-REQ-BCB-011 Nur lesbarer Twin-Verbrauchervertrag
Der Projekt-Twin MUST alle angezeigten Projektdaten ausschliesslich ueber das strikt schemavalidierte JSON-Manifest `exports/project-data/v1/snapshot-manifest.json` aufloesen. `exports/project-data/v1/index.yaml` MUST davon getrennt der repository-relative Daten- und Allowlistvertrag bleiben; `governance/consumer-bindings.yaml` MUST die interne Planungsquelle bleiben. Das JSON-Manifest MUST nur verifizierte Release-, Consumer-, Commit- und Digestwerte projizieren und darf weder YAML-Verarbeitung beim Consumer erfordern noch unverifizierte Wahrheit duplizieren. Der Twin unter `https://github.com/sivla/FiBu.git` auf `codex/universaarl-projekt-twin` ist ausschliesslich als Leser autorisiert; diese Identitaet MUST weder Snapshotfreigabe noch Rueckschreiben erlauben.

Eine Spectra-Bindung im technischen BCProjectOS-Repository MUST bis zum gemeinsamen Nachweis von `productId: spectra`, kanonischer Repository-URL, Release-Version, annotiertem Tag im Muster `spectra-v<SemVer>`, extern aufgeloestem Tag-Commit, finalem installierbarem Manifest, gueltigem Manifest-Quellcommit, unveraendertem Produktumfang und passendem SHA-256-Payload-Digest `PENDING_BCPROJECTOS_RELEASE` bleiben. Erst der vollstaendige Zustand darf `BOUND_BCPROJECTOS_RELEASE` verwenden. PENDING/BOUND-Mischzustaende MUST fail-closed scheitern.

Die Snapshotquelle MUST der neueste vollstaendig validierte, saubere Commit des festgelegten BC-Basic-Branches sein. Payload, repository-relativer Index und Integritaetsangaben MUESSEN gemeinsam in diesem normalen fachlichen Commit vorliegen; ein separater Manifest-only-Commit ist nicht erforderlich. Historische A/B-Commits duerfen als unveraenderte Evidence bestehen bleiben. Ein ungueltiger Branch-HEAD MUSS fail-closed abgelehnt werden. Ein optionaler Release kann den validierten Commit spaeter durch Commit und Tag einfrieren.

#### Scenario: UABC-SCN-BCB-014 Twin liest Blueprint-Quellen
- **GIVEN** ein validierter, versionierter Blueprint-Snapshot, sein Projektindex und eine nachgewiesene Twin-Identitaet
- **WHEN** der Twin Projekt, Arbeit, Besprechungen, Plan, Schulung, Handbuecher, Budget oder Nachweise darstellt
- **THEN** stammt jeder Wert aus einem positivgelisteten Blueprint-Pfad und fehlende Daten bleiben leer statt erfunden oder aus einer zweiten Quelle ergaenzt zu werden

#### Scenario: UABC-SCN-BCB-015 Fehlende Vertragsnachweise blockieren die Bereitstellung
- **GIVEN** BCProjectOS-Release-Tag, zugehoerige Commit-SHA, Digest, Consumer-Autorisierung, saubere Snapshot-Quell-Commit-SHA oder erfolgreiche Validierung fehlen oder widersprechen einander
- **WHEN** der Projektindex als Snapshot bereitgestellt oder vom Project Twin gelesen werden soll
- **THEN** bleiben Snapshot-Bereitstellung und Konsum blockiert, ohne Version, Freigabe, Autorisierung oder Erfolg abzuleiten

#### Scenario: UABC-SCN-BCB-016 Projektuebergreifendes JSON-Manifest validieren
- **GIVEN** ein Consumer besitzt nur das JSON-Snapshotmanifest, das versionierte JSON Schema und lesenden Zugriff auf die referenzierte Quell-Commit-SHA
- **WHEN** er Schema, Consumeridentitaet, sortierte Payloadliste, Einzel- und Bundle-Digests sowie die BCProjectOS-Releaseprojektion prueft
- **THEN** ist kein projektspezifischer YAML-Parser erforderlich und jede Abweichung blockiert den Konsum

#### Scenario: UABC-SCN-BCB-017 Interne Consumerbindung bleibt aus der Twin-Payload
- **GIVEN** der repository-relative Index, das JSON-Manifest oder dessen Payloadliste bietet `governance/consumer-bindings.yaml` als lesbaren Artefaktpfad an
- **WHEN** der Producer- oder Consumervalidator die Allowlist beziehungsweise das Manifest prueft
- **THEN** wird der Vertrag fail-closed abgelehnt; nur der Producer darf die interne Bindung zur Digestbildung verwenden

### Requirement: UABC-REQ-BCB-013 Versionierter Reconciliation-, Provenienz- und Coverage-Vertrag
Die Kundeninstanz MUST den veroeffentlichten Spectra-0.10-Vertrag fuer Baseline, Angebot und Ist verwenden. Der Datensatz MUST Stunden, Satz, Betrag, Waehrung, Versionen, rechnerische Abweichung und einen nachvollziehbaren Grund enthalten. Er MUST Rechnung, Buchung, Zahlung und produktive Leistung ausdruecklich ausschliessen. Der einzige Branch-Index MUST deterministisch auf eine read-only Twin-Exportmap projiziert werden. Die Adapter-Provenienz MUST sicheren relativen Quellpfad, Source-Hash vor und nach der Projektion, Mappingversion, Projektionsdigest, unveraenderte Kunden-Source-of-Truth und vollstaendigen Schreibschutz belegen. Die Referenzgraph-Coverage MUST alle 252 nativen Relationen erklaeren, die 190 portablen Kanten commitgebunden nachweisen und MUST eine 1:1- oder Vollstaendigkeitsbehauptung ausdruecklich ausschliessen.

#### Scenario: UABC-SCN-BCB-020 Reconciliation und Exportprovenienz pruefen
- **GIVEN** die abgeschlossene synthetische Story und der aktuelle Branch-Index
- **WHEN** Generator und Validator ausgefuehrt werden
- **THEN** stimmen 68 Stunden/11.050 EUR Baseline sowie 80 Stunden/9.600 EUR Angebot und Ist, alle indexierten Artefakte erscheinen exakt einmal in der Exportmap, Source und Projektion sind digestgebunden und jede falsche Bindung, Manipulation, Produktivbehauptung, unsichere Pfadangabe oder Schreibberechtigung wird fail-closed abgelehnt

#### Scenario: UABC-SCN-BCB-021 Referenzgraph-Coverage pruefen
- **GIVEN** der unveraenderte native Storygraph und seine portable Twin-Projektion
- **WHEN** der Spectra-0.10-Generator und der Coverage-Validator ausgefuehrt werden
- **THEN** sind alle nativen Relationen genau einer erklaerten Mappingregel zugeordnet, Quell-, Mapping- und Projektionsdatei ueber SHA-256 gebunden und Schreibzugriff sowie unzutreffende 1:1- oder Vollstaendigkeitsbehauptungen ausgeschlossen
## Requirement: Kundenverwendbare Discovery und Fit-to-Standard

Die Kundeninstanz MUSS fuer die synthetische BC-Basic-Einfuehrung ein zusammenhaengendes Betriebsmodell, moderierbare Workshopmodule, einen E2E-Fit/Gap, konkrete Solution-Design-Entscheidungen und einen abgestimmten Migrationsplan enthalten. Das Ergebnis MUSS zwischen synthetisch entschiedener Projektwahrheit, vor Projektstart zu parametrisierenden Werten, in einer echten BC-Sandbox zu validierendem Verhalten und kunden-/steuer-/rechtsseitig zu bestaetigenden Punkten unterscheiden. Es DARF keine zusaetzlichen Stunden ausserhalb der bestaetigten 80-Stunden-/9.600-EUR-Projektstory erzeugen.

### Scenario: Consultant bereitet Kundenworkshop und Blueprint vor

- **WHEN** ein Consultant die Discovery-Seite, das Workshopprotokoll, das Entscheidungsregister und das Datenpaket liest
- **THEN** kann er Finance, Einkauf, Verkauf/Forderungen, Zahlung/Bank, Lager und Monatsabschluss strukturiert moderieren
- **AND** jede Empfehlung besitzt BC-Standardabbildung, Fit/Gap, Entscheidung, Auswirkung und Owner
- **AND** Migrationsobjekte besitzen Quelle, Volumen, Bereinigung, Mapping, Verantwortliche und Abstimmkriterium
- **AND** die synthetische Gate-Entscheidung ist klar von realen Kunden-, Steuer- und Sandboxnachweisen getrennt

### Scenario: Kunde startet das Standardprodukt ohne Sucharbeit

- **WHEN** Vertrieb, Consultant und Kunde das BC-Basic-Paket starten
- **THEN** gilt eindeutig das Standardangebot mit 80 Stunden und 9.600 EUR netto
- **AND** Sponsor, Projektleitung, sieben Kundenentscheidungen, acht Datenlieferungen und drei Workshops sind mit Owner und Fälligkeit sichtbar
- **AND** genau ein fachliches Gate entscheidet die Bereitschaft für Setup und UAT
- **AND** Lernpfad und Betriebsübergabe trennen die abgeschlossene Referenzsimulation von der im Kundenprojekt nachzuweisenden Befähigung

### Scenario: Operator arbeitet nach UAT sicher ohne Anleitung

- **WHEN** Finance, Handel oder Lager das rollenbezogene Training abschliessen
- **THEN** führt die Rolle ihren positiven Kernfall, einen Fehlerfall und den Retest ohne Anleitung aus
- **AND** erklärt sie ihre täglichen, wöchentlichen und monatlichen Kontrollen sowie ihre Verantwortungsgrenze
- **AND** wählt sie genau einen der vier Ausgänge selbst korrigieren, Key User, Consultant/Support oder sofortiger Buchungsstopp
- **AND** liefert sie für Support das reproduzierbare Diagnosepaket ohne Geheimnisse
- **AND** bleiben reale Benutzer, Berechtigungen, Buchungen und Reset als Kundensandboxnachweis getrennt von der bestandenen Referenzsimulation

### Scenario: Consultant konfiguriert die Standardlösung reproduzierbar

- **WHEN** ein Consultant die BC-Basic-Einrichtung vorbereitet
- **THEN** besitzt jeder notwendige Bereich BC-Seite, Parameter, synthetischen Standardwert, Owner, Abhängigkeit, Wirkung, Prüfschritt und UAT-Bezug
- **AND** besitzt jeder Abschnitt Entry- und Exit-Kriterien in verbindlicher Reihenfolge
- **AND** werden Berechtigungen über erlaubte und verweigerte Aktionen geprüft, ohne Permission-Set-Namen zu erfinden
- **AND** trennt der DE-Check dokumentiertes Standardverhalten, Projektannahme, synthetischen Wert und offene Kunden-/Steuer-/Sandboxbestätigung
- **AND** endet jede Abweichung als Standard übernehmen, kundenspezifisch parametrisieren, Change oder Out-of-Scope
