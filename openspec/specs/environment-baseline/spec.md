# environment-baseline Spezifikation

## Purpose
Definiert die freigegebene, reproduzierbare und strikt read-only ermittelte Ausgangsbaseline der Business-Central-Sandbox `playthru` einschliesslich belegter Fakten, sichtbarer Teilnachweise und ausdruecklicher unbekannter Werte.
## Requirements
### Requirement: UABC-REQ-ENV-001 Sichere Zielgrenze
Der Baseline-Lauf MUST vor und nach jeder Navigation sichtbar oder aus der aktuellen Client-URL bestaetigen, dass er ausschliesslich in `playthru` und in der unveraenderten aktiven Gesellschaft bleibt. Er MUST vor jedem Company- oder Environment-Switch abbrechen.

#### Scenario: UABC-SCN-ENV-001 Playthru und aktive Gesellschaft bestaetigen
- **GIVEN** eine lokal authentifizierte Sitzung und ein validierter `BC_BASE_URL` ohne Company-Parameter
- **WHEN** der BC-Client read-only geoeffnet wird
- **THEN** belegen URL und sichtbarer Clientzustand `playthru` sowie die aktive Gesellschaft, ohne eine andere Umgebung oder Gesellschaft zu oeffnen

#### Scenario: UABC-SCN-ENV-002 Zugaengliche Gesellschaften ohne Wechsel erfassen
- **GIVEN** die bestaetigte Ausgangsgesellschaft in `playthru`
- **WHEN** der Company-Switcher als Pane geoeffnet wird
- **THEN** wird nur die sichtbare Liste erfasst und keine Gesellschaft ausgewaehlt

### Requirement: UABC-REQ-ENV-002 Sichtbare technische und fachliche Baseline
Der Pilot MUST Version/Build, Sprache, Region/Lokalisierung, Experience, Benutzer-Arbeitsdatum, Benutzer-Zeitzone, installierte Extensions und den sichtbaren Feature-Management-Zustand ueber den BC-Webclient erheben oder den Wert mit nachvollziehbarem Grund als `unknown` kennzeichnen. Arbeitsdatum und Zeitzone MUST als Benutzer-/Laufkontext und nicht als Gesellschaftskonfiguration klassifiziert werden.

#### Scenario: UABC-SCN-ENV-003 Version Sprache Region und Experience lesen
- **GIVEN** die bestaetigte `playthru`-Sitzung
- **WHEN** Hilfe und Support, Meine Einstellungen und Unternehmensinformationen schreibgeschuetzt geoeffnet werden
- **THEN** werden nur sichtbare Werte erfasst, Arbeitsdatum und Zeitzone als Ausfuehrungskontext getrennt und nicht sichtbare oder nicht eindeutig interpretierbare Werte als `unknown` dokumentiert

#### Scenario: UABC-SCN-ENV-004 Extensions und Feature Management lesen
- **GIVEN** die unveraenderte aktive Gesellschaft
- **WHEN** Erweiterungsverwaltung und Funktionsverwaltung ueber die UI geoeffnet werden
- **THEN** werden nur Extension-Karten, deren Name und Herausgeber den Screenshot-Viewport schneiden, sowie viewport-schneidende Feature-Zeilen strukturiert als `candidate`/`visible-partial` ohne Installieren, Aktivieren, Datenupdate oder Bestaetigen erfasst
- **AND** gelten ausserhalb des Viewports gerenderte DOM-Elemente nicht als visuell geprueft und es wird keine vollstaendige Extension-, App- oder Feature-Inventarisierung behauptet

Die Zielgesellschaften `UAM-DE`, `UAS-DE`, `UAD-DE`, `UAP-DE` und `UAC-CONS` MUST gegen den sichtbaren Playthru-Mandantenbaum als `observed` oder `not-observed-in-accessible-company-pane` klassifiziert werden. `not-observed` MUST ausdruecklich keine Aussage ueber die Existenz ausserhalb des sichtbaren Pane treffen.

### Requirement: UABC-REQ-ENV-003 Kohaerente visuelle Evidence
Jeder langlebige Screenshot MUST visuell geprueft sein und zusammen mit Trace und strukturiertem Ergebnis dieselbe Step-ID referenzieren. Identitaeten, Tokens und personenbezogene Daten MUST ausgeschlossen oder maskiert werden.

#### Scenario: UABC-SCN-ENV-005 Evidence-Kette pruefen
- **GIVEN** ein ausgefuehrter Baseline-Schritt
- **WHEN** Manifest, Eventlog, Screenshot und rohes Trace-Artefakt verglichen werden
- **THEN** stimmen Run-ID und Step-ID ueberein und der Screenshot zeigt den behaupteten sichtbaren Zustand ohne ungeschuetzte Identitaet

### Requirement: UABC-REQ-ENV-004 Reproduzierbarer Zweitlauf
Der identische Baseline-Test MUST zweimal unabhaengig mit derselben gitignorierten Authentifizierungsstrategie ausgefuehrt werden. Stabile Fakten MUST uebereinstimmen; nur Run-ID, Zeitstempel und erklaerte volatile Darstellung duerfen abweichen.

#### Scenario: UABC-SCN-ENV-006 Normalisierte Manifeste vergleichen
- **GIVEN** zwei abgeschlossene read-only Laeufe
- **WHEN** die normalisierten Fakten verglichen werden
- **THEN** werden Uebereinstimmungen und jede Abweichung explizit ausgewiesen, ohne einen alternativen Navigationsweg zu erzwingen

### Requirement: UABC-REQ-ENV-005 Kuratierte rollenbezogene Publikation
Buchkapitel und Consultant-Runbook MUST nur belegte Fakten, gepruefte Klickschritte, BC-Version, Gesellschaft, Warnungen, Scenario-IDs und Evidence-IDs verwenden. Rohlogs duerfen nicht als Publikationstext uebernommen werden.

#### Scenario: UABC-SCN-ENV-007 Publikation gegen Evidence pruefen
- **GIVEN** die verglichenen Manifeste und visuell geprueften Screenshots
- **WHEN** Kapitel und Runbook zum Review vorgelegt werden
- **THEN** ist jede faktische Aussage auf mindestens eine bestaetigte Evidence-ID zurueckfuehrbar und jeder unbekannte Wert bleibt als `unknown` sichtbar
