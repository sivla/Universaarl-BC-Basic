# Walkthrough Package Delta

## ADDED Requirements

### Requirement: UABC-REQ-WT-001 Strukturierter Walkthrough-Vertrag
Ein Walkthrough Package MUST die gemeinsame Metadatenhuelle, Zielgruppe, Wiedergabemodi, Lernziel, Voraussetzungen, nummerierte Schritte, UI-Zustaende, Aktionen, Ergebnisse, Begruendungen, Medien, Captions, Sicherheitsregeln, Provenienz und Checksummen maschinenlesbar enthalten. Blanko und Beispiel MUST als nicht-evidenzgebend gekennzeichnet sein.

#### Scenario: UABC-SCN-WT-001 Paket gegen Vertrag validieren
- **GIVEN** ein Walkthrough-Autorenmanifest
- **WHEN** die lokale Validierung ausgefuehrt wird
- **THEN** sind Pflichtfelder, stabile Referenzen, Schrittfolge, Quellen, Medien und Sicherheitsgrenzen konsistent oder der Build bricht ab

### Requirement: UABC-REQ-WT-002 Deterministische Evidence-Ableitung
Der Pilot MUST aus den vorhandenen Baseline-Manifests, Events und Screenshots mit einem Befehl ein aufgeloestes Manifest, WebVTT, HTML und mindestens eine steuerbare oder animierte Medienausgabe erzeugen, ohne Browserzugriff oder erfundene Schritte.

#### Scenario: UABC-SCN-WT-002 Baseline-Walkthrough reproduzieren
- **GIVEN** die archivierte `playthru`-Baseline mit `run-1` und `run-2`
- **WHEN** der Walkthrough-Build zweimal ausgefuehrt wird
- **THEN** stimmen geordnete Schritte, Provenienz und SHA-256-Checksummen ueberein und alle Ausgaben bleiben auf Run-, Scenario- und Evidence-IDs rueckfuehrbar

### Requirement: UABC-REQ-WT-003 Gemeinsame Wiedergabe und stabiler Export
`beginner`, `consultant` und `evidence-review` MUST aus demselben Manifest dargestellt werden. Ein versionierter read-only Exportindex MUST externen Konsumenten Pfade, Typ, Version, Status und Checksummen liefern, ohne interne Verzeichniskenntnis vorauszusetzen.

#### Scenario: UABC-SCN-WT-003 Darstellung und Export pruefen
- **GIVEN** ein gebautes Walkthrough Package
- **WHEN** HTML, Untertitel, Medien und Exportindex geprueft werden
- **THEN** bieten sie Textalternative, Pause/Seek, Reduced-Motion-Unterstuetzung und stabile relative Consumer-Pfade ohne Secrets oder vollstaendige BC-Ziel-URL
