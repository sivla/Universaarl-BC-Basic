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
