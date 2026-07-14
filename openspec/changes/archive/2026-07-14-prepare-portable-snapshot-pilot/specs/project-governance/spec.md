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

#### Scenario: Consumeridentitaet ist eindeutig und nur-lesend gebunden

- **WHEN** `UABC-PORTABLE-PILOT-0004` erzeugt oder gelesen wird
- **THEN** MUST der Release `https://github.com/sivla/Universaarl-Project-Twin.git` auf `codex/universaarl-projekt-twin` als einzigen Consumer binden
- **AND** Zugriff und Berechtigungsumfang MUST strikt nur-lesend bleiben
- **AND** eine alte Repository-URL, ein abweichender Branch oder ein Schreibrecht MUST die Validierung blockieren

#### Scenario: Twin liest die vollstaendige Projektansicht ohne Git

- **WHEN** der Twin einen validierten Release ueber Filesystem oder HTTPS oeffnet
- **THEN** MUST das Manifest den commitgebundenen Projektindex und jede darin positivgelistete Projektquelle einzeln ueber ID, Quellpfad, Format, Groesse und SHA-256 binden
- **AND** die Releasebytes MUST unter beiden Transportarten identisch sein
- **AND** der Producer-Commit MUST reine Provenienz bleiben und darf keine Git-Laufzeitabhaengigkeit des Twin erzeugen

#### Scenario: Neuer Spectra-Release fehlt

- **WHEN** annotierter Tag, peeled Commit, finales Manifest oder Produktdigest fehlen
- **THEN** MUST der Status `PENDING_BCPROJECTOS_RELEASE` und `UNBOUND_LOCAL_PILOT` bleiben
- **AND** `consumerEligible` und `publishEligible` MUST false sein

#### Scenario: Plattformgruener Spectra-Release ist vollstaendig gebunden

- **WHEN** das annotierte Tagobjekt, der aufgeloeste Commit, das finale Manifest, der Manifest-Quellcommit, der Quellbaum, der Produktdigest sowie die bestandenen Plattformnachweise fuer Windows und macOS gemeinsam vorliegen
- **THEN** MUST ein neuer unveraenderlicher Snapshot-Release mit `BOUND_BCPROJECTOS_RELEASE` erzeugt werden
- **AND** alle historischen Releases MUST bytegleich erhalten bleiben
- **AND** `current.json`, Kundenfragment und Katalog MUST exakt denselben neuen Release und dessen Manifestdigest binden
- **AND** `consumerEligible` und `publishEligible` duerfen erst dann true sein

#### Scenario: Consumer-Migrationsrelease wird aktiviert

- **WHEN** die getrennte Project-Twin-Repositoryidentitaet in den kanonischen Vertrag uebernommen ist
- **THEN** MUST `current.json` und der Kundenkatalog atomar `UABC-PORTABLE-PILOT-0004` mit dessen Manifestdigest binden
- **AND** die Releases `UABC-PORTABLE-PILOT-0001` bis `UABC-PORTABLE-PILOT-0003` MUST bytegleich bleiben
- **AND** die Projektpayload-Provenienz MUST weiterhin den unveraenderten Projektstand `83a63c0af8775001e4c7f909a46c5b227f3cce3d` nennen
