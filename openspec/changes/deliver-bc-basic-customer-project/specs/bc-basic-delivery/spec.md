# BC Basic Einrichtung Lieferfaehigkeit

## ADDED Requirements

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
Der Projekt-Twin MUST alle angezeigten Projektdaten ausschliesslich ueber einen validierten, versionierten Snapshot von `exports/project-data/v1/index.yaml` aus der Blueprint-Projektablage aufloesen. Der Index und die Konsumentenbindung `governance/consumer-bindings.yaml` MUST diesem aktiven Change zugeordnet und bis zur Validierung und Versionierung als `proposed` ausgewiesen sein. Der Index MUST nur stabile IDs, Schemainformation, positivgelistete repository-relative Quellpfade und verbindliche Selektoren fuer gemeinsam genutzte Dateien enthalten. Verweise innerhalb einer Quelle duerfen keinen weiteren Lesezugriff autorisieren. Eine Kandidaten-Repository- oder -Branchangabe ist ohne lokalen Autorisierungsnachweis nicht wirksam und MUST den Konsum fail-closed blockieren. Der Twin MUST keine fachlichen Projektdaten speichern, erzeugen oder veraendern und niemals in die Blueprint-Projektablage zurueckschreiben; fehlende Quellwerte MUST leer bleiben.

#### Scenario: UABC-SCN-BCB-014 Twin liest Blueprint-Quellen
- **GIVEN** ein validierter, versionierter Blueprint-Snapshot, sein Projektindex und eine nachgewiesene Twin-Identitaet
- **WHEN** der Twin Projekt, Arbeit, Besprechungen, Plan, Schulung, Handbuecher, Budget oder Nachweise darstellt
- **THEN** stammt jeder Wert aus einem positivgelisteten Blueprint-Pfad und fehlende Daten bleiben leer statt erfunden oder aus einer zweiten Quelle ergaenzt zu werden

#### Scenario: UABC-SCN-BCB-015 Fehlende Vertragsnachweise blockieren die Bereitstellung
- **GIVEN** BCProjectOS-Release-Tag, zugehoerige Commit-SHA, Digest, Consumer-Autorisierung, saubere Snapshot-Quell-Commit-SHA oder erfolgreiche Validierung fehlen oder widersprechen einander
- **WHEN** der Projektindex als Snapshot bereitgestellt oder vom Project Twin gelesen werden soll
- **THEN** bleiben Snapshot-Bereitstellung und Konsum blockiert, ohne Version, Freigabe, Autorisierung oder Erfolg abzuleiten
