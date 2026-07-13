## ADDED Requirements

### Requirement: UABC-REQ-BCB-SETUP-WAVE1-MATRIX

Die Kundeninstanz MUST fuer jedes der drei Konfigurationspakete eine feldnahe, abhaengige und source-gebundene Tabellenmatrix liefern. Unbekannte Tabellen- oder Feld-IDs DUERFEN NICHT erfunden werden. Gebuchte Ledger-/Posten-/Posted-Document-Tabellen und Continia MUESSEN ausgeschlossen sein.

#### Scenario: CORE-FINANCE ohne authentisierte Runtime

- **GIVEN** `Playthru / UABC-BASIC-DE` ist das erlaubte Ziel und das Paketgeruest steht bei `0/0/0`
- **WHEN** keine authentisierte Projektbrowser-Runtime verfuegbar ist
- **THEN** MUSS der Status `prepared-for-controlled-live-run` bleiben
- **AND** es DARF keine Paket-, Setup-, Daten- oder Buchungswirkung behauptet werden.

#### Scenario: falsche Zielbindung

- **WHEN** Environment oder Gesellschaft vom erlaubten Ziel abweichen
- **THEN** MUSS der Lauf vor dem ersten Write stoppen.

#### Scenario: OPENING-DATA in Wave 1

- **WHEN** ein Apply fuer `UABC-03-OPENING-DATA` angefordert wird
- **THEN** MUSS der Lauf fail-closed abbrechen.

### Requirement: UABC-REQ-BCB-SETUP-WAVE1-EXECUTION

Ein spaeterer Live-Lauf MUST Environment, Gesellschaft, Version, Lokalisierung, Rolle, Arbeitsdatum, Resetpunkt und Paketnullstand vor dem ersten Write pruefen. Er MUSS Apply und Readback trennen, Abweichungen dokumentieren und einen gezielten Retest verlangen.

#### Scenario: kontrollierter CORE-FINANCE-Run

- **GIVEN** alle Preflight-Pruefungen sind sichtbar bestanden und `UABC-01-CORE-FINANCE` ist `prepared-for-controlled-live-run`
- **WHEN** das Kontrollzentrum den freigegebenen Plan ausfuehrt
- **THEN** MUST es nur die positivgelisteten CORE-FINANCE-Setupfelder schreiben und anschliessend feldgenau read-back pruefen
- **AND** MUSS es bei einer Abweichung stoppen, die Wirkung dokumentieren und den gezielten Retest verlangen.

### Requirement: UABC-REQ-BCB-SETUP-WAVE1-TWIN-EXPORT

Die Kundeninstanz MUST eine deterministische, positivgelistete und ausschliesslich lesende Projektion fuer den Project Twin aus den kanonischen Setup-Wave-1-Quellen bereitstellen. Die Projektion MUST `writesAuthorized: false`, den offenen Resetpunkt, die gesperrten RUN-06..22-Schritte und die Quellenprovenienz enthalten. Geheimnisse, Authentifizierungsdaten, absolute Pfade und erfundene Ausfuehrungswerte MUST fehlen.

#### Scenario: schreibgeschuetzte Projektion

- **GIVEN** die sechs Setup-Wave-1-Quellen sind versioniert und `UABC-01-CORE-FINANCE`, `UABC-02-TRADE-MASTER` und `UABC-03-OPENING-DATA` stehen bei 0/0/0
- **WHEN** der Exportgenerator ausgefuehrt wird
- **THEN** MUST er dieselben Projektionsbytes und dieselbe positivgelistete Artefaktmenge erzeugen
- **AND** MUST eine manipulierte Schreibfreigabe fail-closed abgelehnt werden.

### Requirement: UABC-REQ-BCB-WAVE0-CRONUS-BASELINE

Die Kundeninstanz MUST den aktiven Zustand strukturiert als `baselineKind=standard-cronus-demo`, `pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending` ausweisen. Vor dem ersten Write MUST Wave 0 interne Company-ID, technischen Namen, Name, Display Name, Standard-CRONUS-Provenienz, Zielentscheidung, Resetpunkt und Abgrenzung zu unveraenderten Referenzgesellschaften belegen. Ein technischer Firmenname, eine URL oder ein sichtbarer Pilotname allein DARF NICHT als eingerichteter Pilot gelten.

#### Scenario: Umbenannte CRONUS-Gesellschaft

- **GIVEN** eine CRONUS-Demo-Gesellschaft traegt den geplanten Pilot-Anzeigenamen
- **WHEN** kein feldgenauer Readback der angewendeten Pilotabweichungen vorliegt
- **THEN** MUST `pilotConfigured` false und `writesApplied` false bleiben
- **AND** MUST der Validator eine Einrichtungsbehauptung fail-closed ablehnen.

#### Scenario: Zielstrategie ohne belastbare Evidence

- **GIVEN** interne Company-ID, vollständige CRONUS-Inventur oder Reset-/Wiederanlaufnachweis fehlen
- **WHEN** zwischen kontrollierter Weiterverwendung und sauberer Neuanlage beziehungsweise Kopie entschieden werden soll
- **THEN** MUST die Auswahl leer und der Status `blocked-pending-wave0-and-reset-evidence` bleiben
- **AND** MUST `W0-01-read-company-identity` der einzige nächste ausführbare BC-Schritt sein
- **AND** MUST jeder CORE-FINANCE-Write gesperrt bleiben.

#### Scenario: Browserzugriff endet vor DOM und Screenshot

- **GIVEN** ein angemeldeter Tab zeigt nur den Business-Central-Titel sowie eine URL mit `Playthru` und `company=UABC-BASIC-DE`
- **WHEN** die Browser-Sicherheitsrichtlinie den Zugriff vor jeder DOM- oder Screenshot-Lektüre blockiert
- **THEN** MUST W0-01 den Status `blocked-before-dom-readback` behalten und DARF NICHT als ausgeführt oder abgeschlossen gelten
- **AND** MUST die Versuchsevidence Zeitpunkt, Rolle, bereinigte URL, fehlende BC-Feldwerte, fehlenden Screenshot und `writesPerformed=false` nennen
- **AND** DARF aus Titel oder URL weder interne Company-ID, CRONUS-Provenienz, Zielstrategie noch Pilotkonfiguration abgeleitet werden
- **AND** MUST das zugeordnete Task-Ticket einen tatsächlichen Worklog und keinen Abschlusskommentar tragen.

#### Scenario: Standard-CRONUS-Inhalt bei unbekannter Gesellschaftsherkunft

- **GIVEN** der Nutzer bestätigt für `UABC-BASIC-DE` den inhaltlichen Standard-CRONUS-Datenstand
- **AND** eine Kopie oder Umbenennung erscheint möglich, wurde aber nicht per DOM- oder Feld-Readback belegt
- **WHEN** der aktuelle Kunden- und Setup-Status materialisiert wird
- **THEN** MUST `customerTargetRealized=false`, `originMechanismStatus=unbekannt-bis-wave0-readback` und `copyRenameHypothesis=nutzerhinweis-unbestaetigt` gelten
- **AND** MUST W0-01 `blocked-before-dom-readback` sowie der fachliche Setup-Status `blockiert-bis-dom-readback-und-zielkonfiguration` bleiben
- **AND** DARF weder die Nutzerinformation noch der technische Gesellschaftsname als realisierter Kundenstand, ausgeführtes Setup oder bestätigte Gesellschaftsherkunft ausgegeben werden.

### Requirement: UABC-REQ-BCB-CRONUS-SPACE-TRUTH

Das Kundenprojekt MUST `Standard CRONUS` als aktuellen Iststand, den BC-Basic-Parametersatz als Soll und die leere angewendete Differenz getrennt führen. Der Produkt-Space MUST nur Scope und Nicht-Scope beschreiben. Das Consulting-Handbuch MUST nur die wiederverwendbare Methode beschreiben und DARF keinen ausgeführten Country-, Company- oder Paket-Write für `UABC-BASIC-DE` behaupten.

#### Scenario: Historische Ausführung wird current-facing

- **WHEN** eine aktuelle Kunden- oder Consulting-Seite einen früheren Country-/Company-Schritt als aktuellen Pilotfortschritt ausgibt
- **THEN** MUST das Wahrheitsgate fail-closed scheitern
- **AND** MAY der alte Nachweis nur als explizit abgelöste historische Provenienz referenziert werden.
- **AND** MUST die aktive Twin-Positivliste beide historischen Playthru-Ausführungsdateien ausschliessen.

### Requirement: UABC-REQ-BCB-CURRENT-PILOT-STORY

`evidence/simulation/project-story.json` MUST die einzige aktive kanonische Ticketquelle sein. Genau `UABC-1`, `UABC-2` und `UABC-3` MUST Phase-Roots sein; Gesamt- und Typmengen MUST dynamisch aus dem fachlichen Bestand folgen. Nur Tasks MAY billable sein oder Worklogs tragen. Planwerte MAY 80 Stunden und 9.600 EUR betragen; Istwerte MUST aus aktiven Task-Worklogs abgeleitet werden. Twin-Ticketlisten MUST ohne Geldfelder und Geldbetraege bleiben.

#### Scenario: Historische oder feste aktive Wahrheit

- **WHEN** ein aktiver Generator oder Validator 50 Tickets, 19 Tasks, 80 Iststunden, 9.600 EUR Istkosten oder einen UABC-50-Abschluss festsetzt
- **THEN** MUST das Anti-Fixcount-Gate den Einstiegspunkt ablehnen
- **AND** historische Migrations-/Angebotsprovenienz DARF die aktive Story nicht ueberschreiben.

### Requirement: UABC-REQ-BCB-CORE-FINANCE-PAYLOAD

Die Kundeninstanz MUST einen deterministischen CORE-FINANCE-Payload und ein prüfbares Paketmanifest führen. Alle Datensätze MUST konkrete Tabellen, natürliche Schlüssel, Pflichtfelder, Fremdschlüssel, Importreihenfolge, erwartete Operation, Kontrollwerte, Rollback und Evidenceziele besitzen. PRESEED und manuelle Singleton-Schritte MUST von paketfähigen Datensätzen getrennt sein.

#### Scenario: referenziell vollständiger CORE-Payload

- **GIVEN** elf Kontenrollen, Buchungsgruppen, VAT, Dimensionen, Nummernserien, Zahlungsbedingungen, Periodenannahmen, Lagerort und Bank-Buchungsgruppenbaseline sind vorbereitet
- **WHEN** der CORE-Validator den Payload und das Manifest prüft
- **THEN** MUST jede Konten-, Gruppen-, VAT-, Dimensions- und Nummernserienreferenz eindeutig auflösen
- **AND** MUST die Importreihenfolge jede Fremdschlüsselabhängigkeit einhalten
- **AND** MUST VAT 19 Prozent als synthetische, steuerlich bestätigungspflichtige Projektannahme klassifiziert sein.

#### Scenario: verbotene Ausführungs- oder Sicherheitswirkung

- **WHEN** Payload oder Manifest eine Ledger-/Posted-Tabelle, Table 270 `Bank Account`, reale Bankkennung, Secret, ausgeführten Write, Apply, Kundenfreigabe oder umgangenes W0-Gate enthält
- **THEN** MUST die Validierung fail-closed abbrechen
- **AND** MUST `writesAuthorized=false`, `customerTargetRealized=false` und der reale Paketnullstand 0/0/0 unverändert bleiben.
