# BC-Basic dualer Projektstatus

## ADDED Requirements

### Requirement: Duale Simulation und reale Bereitschaft
Die Kundeninstanz MUST den synthetisch abgeschlossenen Betriebszyklus getrennt von der gelben, offenen realen Onboardingbereitschaft führen. Bei offenen realen Gates darf keine grüne Realampel ausgegeben werden.

#### Scenario: Offene reale Gates
- **GIVEN** acht reale Gates haben den Status `pending`
- **WHEN** der Producerstatus materialisiert wird
- **THEN** `simulationStatus` ist abgeschlossen, `realDeploymentReadiness` ist `gelb/offen` und `summaryGreenRealAmpel` ist `false`

### Requirement: Gebundene Realgates und Folgeaktionen
Jedes reale Gate MUST Ownerrolle, Nachweisart, erwarteten Evidenzpfad, Terminstatus, Abschluss- und Eskalationslogik besitzen. Genau drei nächste Aktionen MUST Abhängigkeit, Zielgate, Owner, Terminstatus und Evidenceziel binden.

#### Scenario: Fehlende reale Entscheidung
- **GIVEN** Owner oder Termin ist noch nicht real benannt
- **WHEN** der Producer den V5-Kandidaten prüft
- **THEN** der Wert bleibt `null` mit `entscheidungsluecke` und das Gate bleibt `pending`

### Requirement: Zweidimensionale Budgetabstimmung
Plan, Ist und Forecast MUST sowohl gegen das Angebot als auch gegen die technische V3-Basis reconciliiert und über bestehende Worklogs begründet werden.

#### Scenario: V4-Fortschreibung
- **GIVEN** das V4-Journal weist 78 Stunden/9.360 EUR Basis und 83 Stunden/9.960 EUR Ist aus
- **WHEN** der Producer die Abweichung berechnet
- **THEN** werden Angebotsabweichung +3 Stunden/+360 EUR und V4-Basisabweichung +5 Stunden/+600 EUR getrennt ausgewiesen

### Requirement: V4 bleibt Last-known-good
Der V5-Release MUST nur als unveränderlicher Kandidat erzeugt werden; `current.json` MUST bis zu einem separaten Consumer-/Kontrollzentrum-Gate auf V4 zeigen.

#### Scenario: Kandidat vor Freigabe
- **GIVEN** Producer-, Twin- oder Kontrollzentrum-Gates sind noch nicht gemeinsam bestanden
- **WHEN** der V5-Katalog erzeugt wird
- **THEN** bleibt V4 current und der V5-Zeiger trägt `candidateOnly=true`
