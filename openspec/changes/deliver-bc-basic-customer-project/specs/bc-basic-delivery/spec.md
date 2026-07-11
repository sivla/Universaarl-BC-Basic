# BC Basic Lieferfaehigkeit

## ADDED Requirements

### Requirement: UABC-REQ-BCB-001 Ein synthetisches Standardprojekt
Das Projekt MUST genau eine synthetische Gesellschaft in der Sandbox `playthru` verwenden und MUST `UABC-BC-BASIC-001` als stabile Projektkennung fuehren. **BC Basic** MUST als Universaarl-Servicepaket und darf nicht als Microsoft-Lizenzname dargestellt werden.

#### Scenario: UABC-SCN-BCB-001 Zielgrenze vor Ausfuehrung bestaetigen
- **GIVEN** ein geplanter mutierender Einrichtungs- oder Testlauf
- **WHEN** Umgebung und Gesellschaft gebunden werden
- **THEN** sind ausschliesslich `playthru` und die menschlich freigegebene `Universaarl GmbH` erlaubt und jeder andere Zielzustand fuehrt vor dem ersten Schreibvorgang zum Abbruch

### Requirement: UABC-REQ-BCB-002 Drei verbindliche Phasen
Das Projekt MUST aus Vorbereitung/Anforderungen und Datenbereitschaft, genau einer Einrichtungs- und Schulungswoche sowie begrenzter Stabilisierungsphase bis zur Monatsabschlussprobe in der Sandbox und zur lokalen UStVA-Pruefung bestehen. Jede Phase MUST Eintrittskriterien, Austrittskriterien, Abhaengigkeiten, Verantwortliche und Nachweise besitzen.

#### Scenario: UABC-SCN-BCB-002 Datenbereitschaft schuetzt die Umsetzungswoche
- **GIVEN** Phase 1 ist geplant abgeschlossen
- **WHEN** Phase 2 gestartet werden soll
- **THEN** sind Umfang, Pflichtdaten, Loesungsentscheidungen, Pruefplan und offene Fachfreigaben dokumentiert oder der Start wird blockiert

#### Scenario: UABC-SCN-BCB-003 Stabilisierungsphase hat fachliche Abschlusskriterien
- **GIVEN** der konfigurierte Sandbox-Pilot wurde fachlich geprueft und fuer die begrenzte Stabilisierungsphase freigegeben
- **WHEN** der Abschluss der Stabilisierungsphase beantragt wird
- **THEN** sind kritische Pilotbefunde geschlossen, Monatsabschlussprozess in der Sandbox geprobt, Abstimmungen dokumentiert, lokale UStVA-Pruefung abgeschlossen und die Uebergabedokumente akzeptiert

### Requirement: UABC-REQ-BCB-003 Standardumfang ohne Erweiterungen
Der Pflichtumfang MUST Grundeinrichtung, Finanzwesen/Buchhaltung, Einkauf, Verkauf und einfachen Bestand an einem Lagerort abdecken. AL-Entwicklung, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung oder PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen, Seriennummern, Produktion, Kundendienst, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Steuer-/Rechtsberatung, GoBD-Garantie, Produktivstart und offene Stabilisierungsphase MUST ausgeschlossen bleiben.

#### Scenario: UABC-SCN-BCB-004 Prozessumfang pruefen
- **GIVEN** ein Fachwunsch oder Testfall
- **WHEN** er dem Projektumfang zugeordnet wird
- **THEN** wird er nur aufgenommen, wenn er mit Standardfunktion in einem der fuenf Pflichtbereiche und innerhalb der Budgetgrenze lieferbar ist

### Requirement: UABC-REQ-BCB-004 Budget- und Abrechnungsvertrag
Die geplanten abrechenbaren Jira-Arbeitspakete auf unterster Ebene MUST zusammen 76 Stunden ergeben. Eine Reserve von 4 Stunden MUST nicht vorab abrechenbar sein und darf nur mit dokumentierter Freigabe aktiviert werden. Das Projekt MUST bei 80 Stunden stoppen. Woechentliche Rechnungen MUST ausschliesslich genehmigte abrechenbare Jira-Istzeiten mit 120 EUR netto pro Stunde verwenden; Schaetzungen, Elternsummen, doppelt zugeordnete Zeiten und externe Kosten MUST ausgeschlossen sein.

#### Scenario: UABC-SCN-BCB-005 Wochenrechnung berechnen
- **GIVEN** eine abgeschlossene Kalenderwoche mit Jira-Arbeitsprotokollen
- **WHEN** der Rechnungsentwurf erstellt wird
- **THEN** enthaelt er nur genehmigte abrechenbare Iststunden je Ticket, deren Summe mal 120 EUR sowie die verbleibende Budgetkapazitaet

#### Scenario: UABC-SCN-BCB-006 Budgetstop erzwingen
- **GIVEN** genehmigte Iststunden plus beantragte weitere Arbeit wuerden 80 Stunden ueberschreiten
- **WHEN** ein Ticket fortgesetzt werden soll
- **THEN** bleibt es blockiert, bis Umfang entfernt oder ein neues ausdruecklich beauftragtes Folgepaket angelegt wurde

### Requirement: UABC-REQ-BCB-005 Vollstaendige Jira-Tickets
Jeder Jira-Sammelvorgang, jedes Phasenticket und jedes Arbeitspaket MUST Aufwand, Phase, Arbeitsstrom, Abhaengigkeiten, Datenanforderungen, klare Akzeptanzkriterien, konkrete Lieferergebnisse, Abrechnungskennzeichen und mindestens eine Referenz auf ein Besprechungstranskript enthalten. Ein Transkript MAY mehrere Tickets sinnvoll belegen.

#### Scenario: UABC-SCN-BCB-007 Ticket auf Ready setzen
- **GIVEN** ein Jira-Ticket im Backlog
- **WHEN** es nach Ready verschoben werden soll
- **THEN** sind Pflichtfelder, mindestens ein Transkript und alle blockierenden Abhaengigkeiten vorhanden

### Requirement: UABC-REQ-BCB-006 Kontrolliertes synthetisches Datenpaket
Alle Projekt- und BC-Daten MUST eindeutig synthetisch sein. Das Datenpaket MUST je Objekt Zweck, Pflichtfelder, Format, Eigentuemer, Qualitaetsregeln, Freigabestatus und mindestens einen plausiblen Beispieldatensatz enthalten. Reale `.env`, Authentifizierungszustaende, Geheimnisse, Bank-, Steuer- oder Personendaten MUST ausgeschlossen sein.

#### Scenario: UABC-SCN-BCB-008 Datenpaket freigeben
- **GIVEN** Kunden-, Lieferanten-, Artikel-, Dimensions- und Eroeffnungsdaten liegen vor
- **WHEN** der Datenpruefpunkt geprueft wird
- **THEN** sind alle Werte als synthetisch markiert, Pflichtfelder und Summen abgestimmt und ungepruefte oder sensible Werte blockiert

### Requirement: UABC-REQ-BCB-007 Rollenbezogene Schulung und Handbuecher
Das Projekt MUST Schulungen fuer Finanzwesen, Einkauf/Verkauf, Lager und Administration mit Lernzielen, Agenda, Uebungen, Anwesenheit, Fragen und Kompetenzpruefung dokumentieren. Es MUST ein Kundenhandbuch und ein Beratungshandbuch mit Quellen-, Versions-, Szenario- und Nachweisreferenzen liefern.

#### Scenario: UABC-SCN-BCB-009 Schulung abschliessen
- **GIVEN** ein geplanter Schulungstermin
- **WHEN** der Termin als abgeschlossen markiert wird
- **THEN** sind Transkript, Teilnehmer, gezeigte Szenarien, Uebungsergebnisse, offene Fragen und erforderliche Nachschulung dokumentiert

### Requirement: UABC-REQ-BCB-008 Playwright-Ende-zu-Ende-Pruefung mit begrenzten Schreibvorgaengen
Der Szenariokatalog MUST Einrichtung, Einkauf bis Zahlungsvorbereitung, Verkauf bis Zahlungseingang, einfachen Bestand, Monatsabschlussprobe und UStVA-Pruefung abdecken. Eine Ausfuehrung MUST vorab projektspezifisch fuer exakt `playthru`, genau eine Gesellschaft, synthetische Daten und definierte Schreibvorgaenge autorisiert sein. Jeder Lauf MUST Screenshot-, Schritt-, Datensatz- und Ergebnisreferenzen erzeugen; nicht ausgefuehrte Szenarien duerfen nicht als bestanden gelten.

#### Scenario: UABC-SCN-BCB-010 Mutierenden Lauf sicher starten
- **GIVEN** ein geplanter Playwright-Lauf
- **WHEN** die erste mutierende Aktion bevorsteht
- **THEN** sind Zielbindung, erlaubte Aktionen, synthetische Daten, Ruecksetzplan und menschliche Schreibfreigabe nachgewiesen oder der Lauf bricht ab

### Requirement: UABC-REQ-BCB-009 Monatsabschlussprobe und deutsche UStVA-Pruefung
Der Abschluss der Stabilisierungsphase MUST den in der Sandbox geprobten Monatsabschlussprozess mit dokumentierten Abstimmungen fuer Debitoren, Kreditoren, Bankersatz, Bestand, Sachkonten, Steuerkonten, Perioden und Basisberichte enthalten. Die deutsche UStVA MUST als Vorschau und, falls verfuegbar, als XML lokal erzeugt und fachlich gegen freigegebene Kennzeichen geprueft werden. Test- und Produktivuebermittlung sowie ELSTER-Zugangsdaten MUST ausgeschlossen sein. Das Ergebnis MUST als Sandbox-Probe und nicht als echter Monatsabschluss dargestellt werden.

#### Scenario: UABC-SCN-BCB-011 Monatsabschlussprozess in der Sandbox proben
- **GIVEN** alle simulierten Geschaeftsvorfaelle des ersten Probezeitraums sind in der Sandbox gebucht
- **WHEN** die Abschlusscheckliste ausgefuehrt wird
- **THEN** sind Nebenbuecher, Bestand, Bank, Steuer und Sachkonten abgestimmt und jede Differenz ist geloest oder als blockierender Befund dokumentiert

#### Scenario: UABC-SCN-BCB-012 UStVA ohne Uebermittlung pruefen
- **GIVEN** die Monatsabschlussprobe ist abgestimmt und die Steuerberatung hat die Kennzeichen freigegeben
- **WHEN** UStVA-Vorschau und optionaler XML-Export erzeugt werden
- **THEN** stimmen Periode, Betraege und Kennzeichen mit der Abstimmung ueberein und es erfolgt weder eine Test- noch eine Produktivuebermittlung an eine Behoerde

### Requirement: UABC-REQ-BCB-010 Saubere Projektdokumentation
Confluence MUST einen navigierbaren Seitenbaum fuer Projekt, drei Phasen, Besprechungen/Entscheidungen und Lieferartefakte besitzen. Aussagen ueber Ausfuehrung MUST auf Jira-, Szenario- und Nachweis-IDs zurueckfuehrbar sein; synthetische Transkripte MUST sichtbar als Simulation markiert sein.

#### Scenario: UABC-SCN-BCB-013 Projektstatus nachvollziehen
- **GIVEN** ein Sponsor oder Pruefer oeffnet die Projektstartseite
- **WHEN** er Phase, Entscheidung, Ticket oder Nachweis auswaehlt
- **THEN** erreicht er die kanonische Blueprint-Quelle ohne widerspruechliche Kopie oder unmarkierte Simulation

### Requirement: UABC-REQ-BCB-011 Nur lesbarer Twin-Verbrauchervertrag
Der Projekt-Twin MUST alle angezeigten Projektdaten ausschliesslich ueber `exports/project-data/v1/index.yaml` aus der Blueprint-Projektablage aufloesen. Der Index MUST nur stabile IDs, Schemainformation, positivgelistete relative Quellpfade und verbindliche Selektoren fuer gemeinsam genutzte Dateien enthalten. Verweise innerhalb einer Quelle duerfen keinen weiteren Lesezugriff autorisieren. Der Twin MUST keine fachlichen Projektdaten speichern, erzeugen oder veraendern; fehlende Quellwerte MUST leer bleiben.

#### Scenario: UABC-SCN-BCB-014 Twin liest Blueprint-Quellen
- **GIVEN** ein versionierter Blueprint-Stand und sein Projektindex
- **WHEN** der Twin Projekt, Arbeit, Besprechungen, Plan, Schulung, Handbuecher, Budget oder Nachweise darstellt
- **THEN** stammt jeder Wert aus einem positivgelisteten Blueprint-Pfad und fehlende Daten bleiben leer statt erfunden oder aus einer zweiten Quelle ergaenzt zu werden
