# project-governance Delta

## ADDED Requirements

### Requirement: Brownfield-Wissen bleibt reviewpflichtig

Das System MUST Quellen, Checkpoints, sieben Deltaarten, Tombstones, Knowledge-Reviews, Coverage, Widersprueche und Reconciliation getrennt und portabel abbilden.

#### Scenario: Ungeprueftes Wissen wird nicht zur Wahrheit

- **WHEN** ein Wissensaenderungssatz nicht freigegeben ist
- **THEN** MUST `authoritative=false` gelten und der Satz darf keinen aktuellen Projektstatus speisen

### Requirement: Portabler Snapshot bleibt unveraenderlich und isoliert

Das System MUST Releasebytes, Digests, Kundengrenzen und Sichtklassen fail-closed validieren.

#### Scenario: Twin liest einen Release

- **WHEN** ein Consumer einen Snapshot liest
- **THEN** MUST er ausschließlich den validierten Releasepfad aus `current.json` verwenden
- **AND** Arbeitsbaumdaten, fremde Kundenfragmente und nicht freigegebene Sichtklassen bleiben unlesbar

#### Scenario: Neuer Spectra-Release fehlt

- **WHEN** annotierter Tag, peeled Commit, finales Manifest oder Produktdigest fehlen
- **THEN** MUST der Status `PENDING_BCPROJECTOS_RELEASE` und `UNBOUND_LOCAL_PILOT` bleiben
- **AND** `consumerEligible` und `publishEligible` MUST false sein
