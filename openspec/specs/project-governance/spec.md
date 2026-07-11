# project-governance Spezifikation

## Purpose
Regelt OpenSpec als fuehrende Wahrheit, archivierungsfeste Referenzen, lokale Atlassian-Integritaet und Evidence-gestuetzte Erfolgsnachweise.
## Requirements
### Requirement: UABC-REQ-GOV-001 OpenSpec als fuehrende Wahrheit
Freigegebene normative Realitaet MUST unter `openspec/specs` liegen; geplante oder ungepruefte Requirements MUST in maximal einem aktiven Change verbleiben. Dauerhafte strukturierte Architektur- und Capability-Inhalte MUST stabile kanonische Pfade und explizite Lifecycle-Status besitzen.

#### Scenario: UABC-SCN-GOV-001 WIP und Wahrheit pruefen
- **GIVEN** das Repository vor einem Review
- **WHEN** aktive Changes und freigegebene Specs maschinell geprueft werden
- **THEN** existiert null oder maximal ein aktiver Change und ungepruefte Blueprint-Anforderungen sind nicht als freigegebene Spec publiziert

### Requirement: UABC-REQ-GOV-002 Referenzielle Integritaet der Atlassian-Simulation
Jira- und Confluence-Artefakte MUST gueltige IDs, Elternbeziehungen, Personen, Statuswerte und stabile fachliche Referenz-IDs verwenden; bewegliche Change-Pfade sind als dauerhafte Referenzen unzulaessig.

#### Scenario: UABC-SCN-GOV-002 Lokale Referenzen validieren
- **GIVEN** lokale YAML- und Markdown-Artefakte
- **WHEN** `npm test` ausgefuehrt wird
- **THEN** schlagen ungueltige Issue-Elternbeziehungen, unbekannte Personen, Status oder fehlende Referenzen reproduzierbar fehl

### Requirement: UABC-REQ-GOV-004 Archivierungsfeste Referenzaufloesung
Fachliche IDs MUST nach der Reihenfolge freigegebene Specs, aktiver Change und historisches Archiv aufgeloest werden. Nach Archivierung MUST wesentliche aktuelle Architektur und Capability-Wahrheit ausserhalb des historischen `design.md` erhalten bleiben.

#### Scenario: UABC-SCN-GOV-004 Archivierung in Wegwerfkopie pruefen
- **GIVEN** eine validierte Kopie des Repositorys mit einem aktiven Change
- **WHEN** OpenSpec den Change nur in der Kopie archiviert und danach die lokalen Pruefungen laufen
- **THEN** existiert kein aktiver Change, die synchronisierten Specs und stabilen fachlichen Referenzen bleiben aufloesbar und der echte Change bleibt unangetastet

### Requirement: UABC-REQ-GOV-003 Evidence vor Erfolgsbehauptung
Ein fachlicher oder technischer Zustand MUST nur dann als nachgewiesen gelten, wenn Evidence-Typ, Quelle, Zeitpunkt, Umgebung, Unternehmen und Ergebnis dokumentiert sind.

#### Scenario: UABC-SCN-GOV-003 Nicht ausgefuehrte BC-Arbeit kennzeichnen
- **GIVEN** der erste Blueprint-Change ohne BC-Livezugriff
- **WHEN** die Verification gelesen wird
- **THEN** sind lokale Strukturpruefungen als ausgefuehrt und alle BC-/Playwright-Nachweise als ausstehend gekennzeichnet
