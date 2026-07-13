# Design: Portabler Brownfield-Snapshot

## Fuehrende Wahrheit

`project/bc-basic/portable-snapshot-pilot.yaml` ist der einzige neue kanonische Pilotvertrag. Der Generator liest daraus, aus `project/bc-basic/confluence-three-space-v1.yaml` und aus den positiv gebundenen lokalen Seitendateien. Die generierten Releaseartefakte sind Projektionen und keine konkurrierende Wahrheit.

## Deterministische Kette

1. Seiteninhalte werden auf LF, entfernte Zeilenend-Leerzeichen und genau einen finalen Zeilenumbruch normalisiert.
2. Inventar, Delta, Knowledge, Coverage und Reconciliation werden als kanonisches JSON projiziert.
3. Payload und Kundenkatalog erhalten SHA-256-Digests; das Manifest bindet beide Bytes.
4. `current.json` bindet ausschließlich Release-ID, relativen Manifestpfad und Manifestdigest.
5. Existierende Releasebytes duerfen nur bytegleich erneut erzeugt werden; Abweichungen scheitern.

## Grenzen

Der Release-Store liegt innerhalb der Kundeninstanz. Er enthaelt nur Universaarl-Projekte. Ein Aggregator darf mehrere isolierte Kundenfragmente nur nach demselben Schema zusammenfuehren. Commit-SHA ist Provenienz, keine Laufzeitschnittstelle. Filesystem und HTTPS transportieren exakt dieselben Bytes.
