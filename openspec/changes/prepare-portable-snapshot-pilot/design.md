# Design: Portabler Brownfield-Snapshot

## Fuehrende Wahrheit

`project/bc-basic/portable-snapshot-pilot.yaml` ist der kanonische Releasevertrag. Der darin festgehaltene Producer-Commit bindet den Projektindex, den Drei-Space-Vertrag, die Seitentexte und alle im Index positivgelisteten Projektquellen. Der Generator liest diese Bytes ausschliesslich aus diesem Commit. Die generierten Releaseartefakte sind Projektionen und keine konkurrierende Wahrheit.

## Deterministische Kette

1. Seiteninhalte werden auf LF, entfernte Zeilenend-Leerzeichen und genau einen finalen Zeilenumbruch normalisiert.
2. Inventar, Delta, Knowledge, Coverage und Reconciliation werden als kanonisches JSON projiziert.
3. Der Projektindex und alle 158 freigegebenen Quellbytes werden unter `data/` mit unveraenderten relativen Quellpfaden abgelegt.
4. Das Manifest bindet Wissenspayload, Kundenfragment, Projektindex und jede Projektquelle einzeln ueber ID, Quellpfad, Format, Groesse, SHA-256 und identische Filesystem-/HTTPS-Transportpfade. Git-Attribute schalten Textnormalisierung fuer den gesamten Snapshot-Store ab, damit Checkout und Transport dieselben Bytes bewahren.
5. `current.json` bindet Kunden-ID, Projekt-ID, Release-ID, relativen Manifestpfad und Manifestdigest.
6. Existierende Releasebytes duerfen nur bytegleich erneut erzeugt werden; Abweichungen scheitern. `UABC-PORTABLE-PILOT-0003` veraendert deshalb weder `0001` noch `0002`.

## Grenzen

Der Release-Store liegt innerhalb der Kundeninstanz. Er enthaelt nur Universaarl-Projekte. Ein Aggregator darf mehrere isolierte Kundenfragmente nur nach demselben Schema zusammenfuehren. Die Kundeninstanz bindet `spectra-v1.2.0-alpha.12` ueber annotiertes Tagobjekt, peeled Commit, finales Manifest, Source-Commit/-Tree, Produktdigest und die gruene Windows-/macOS-Matrix. Git wird ausschliesslich bei der deterministischen Erzeugung verwendet; Commit-SHA ist Provenienz und niemals Laufzeitschnittstelle des Twin. Filesystem und HTTPS transportieren exakt dieselben Bytes.
