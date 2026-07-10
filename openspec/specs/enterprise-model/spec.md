# enterprise-model Specification

## Purpose
Beschreibt die freigegebene Universaarl-Unternehmensarchitektur mit getrennten Organisationsschichten, Gesellschaften, Lagerkonzepten und Funktionstrennung.
## Requirements
### Requirement: UABC-REQ-ENT-001 Eindeutige Organisationsschichten
Das Zielbild MUST Entra-Tenant, BC-Umgebung, BC-Unternehmen, physischen Standort, Lagerort, Lagerplatz, Verantwortungszentrum und Dimension als getrennte Konzepte mit eindeutigem Zweck modellieren.

#### Scenario: UABC-SCN-ENT-001 Organisationsschichten reviewen
- **GIVEN** der Blueprint v0.1 liegt zum Architekturreview vor
- **WHEN** ein Reviewer jede Organisationsschicht einem Geschaeftsfall zuordnet
- **THEN** ist jede Schicht definiert und keine Dimension wird als Ersatz fuer Gesellschaft, Lagerort oder Projekt verwendet

### Requirement: UABC-REQ-ENT-002 Gesellschaften und BC-Unternehmen
Jede rechtliche Gesellschaft MUST ein eigenes operatives BC-Unternehmen erhalten; ein zusaetzliches BC-Unternehmen darf ausschliesslich der Konsolidierung dienen und MUST als nicht-rechtliche Reporting-Einheit gekennzeichnet sein.

#### Scenario: UABC-SCN-ENT-002 Legal Entity Mapping pruefen
- **GIVEN** vier rechtliche Universaarl-Gesellschaften und ein Konsolidierungsunternehmen
- **WHEN** Legal Entity, Buchungswaehrung, Lokalisierung und BC-Unternehmen abgeglichen werden
- **THEN** existiert eine eindeutige 1:1-Zuordnung fuer operative Buchungen und keine operative Buchung ist fuer das Konsolidierungsunternehmen geplant

### Requirement: UABC-REQ-ENT-003 Standortgerechte Lagerkonzepte
Lagerprozesse MUST pro Standort nach Volumen, Nachverfolgbarkeit und Aufgabentrennung differenziert werden, statt eine einheitliche maximale Lagerkomplexitaet zu erzwingen.

#### Scenario: UABC-SCN-WHS-001 Lagerkonzepte vergleichen
- **GIVEN** Werk, Distributionslager, Service-Depot und mobiles Technikerlager
- **WHEN** Wareneingang, Einlagerung, Pick, Versand und Umlagerung bewertet werden
- **THEN** hat jeder Lagerort ein begruendetes Basis-, Bin- oder Advanced-Warehouse-Zielbild mit eigenem Nachweisplan

### Requirement: UABC-REQ-ENT-004 Synthetische Organisation mit Funktionstrennung
Das Rollenmodell MUST synthetische Personen, Hauptrolle, Doppelverantwortung, Gesellschaftszugriff und unzulaessige Rollenkombinationen dokumentieren.

#### Scenario: UABC-SCN-SEC-001 Funktionstrennung pruefen
- **GIVEN** die Rollen- und Personenmatrix
- **WHEN** Zahlungsvorschlag, Zahlungsfreigabe, Lieferantenpflege, Einkauf und Buchung verglichen werden
- **THEN** sind kritische Kombinationen getrennt oder als kontrollierte kleine-Gesellschaft-Ausnahme mit kompensierender Kontrolle markiert
