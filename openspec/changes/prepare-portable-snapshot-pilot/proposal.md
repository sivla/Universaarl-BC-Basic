# Proposal: Portablen Brownfield- und Snapshot-Pilot vorbereiten

## Ziel

Die bestehende synthetische Drei-Space-Projektsimulation erhaelt einen deterministischen Brownfield-, Wissensdelta- und portablen Snapshotvertrag. Der Twin darf ausschliesslich validierte Releasebytes lesen; Arbeitsbaum, externe Systeme und ungeprueftes Wissen bleiben ausgeschlossen.

## Umfang

- Inventar und Checkpoint fuer die bestehenden 28 Confluence-Seiten ohne neue Space-Struktur.
- Alle sieben Deltaarten, Tombstones, Wissensreview, Coverage, Widersprueche und Brownfield-Reconciliation.
- Unveraenderliches lokales Releaseverzeichnis, atomarer `current.json`-Zeiger und isolierter Kunden-/Projektkatalog.
- Identischer Bytevertrag fuer Filesystem und HTTPS sowie fail-closed Digests und Sichtgrenzen.
- Eine zweite Kundeninstanz ausschliesslich als synthetische Negativfixture unter `tests/fixtures`.
- Bindung eines neuen, unveraenderlichen Snapshot-Releases an den nachweislich plattformgruenen Spectra-Release `spectra-v1.2.0-alpha.12`.

## Grenzen

Keine Live-Verbindung, keine Produktivbehauptung, keine Twin-Code- oder BCProjectOS-Aenderung aus dieser Kundeninstanz. Der historische ungebundene Release `UABC-PORTABLE-PILOT-0001` bleibt bytegleich erhalten. Ausschliesslich der neue Release `UABC-PORTABLE-PILOT-0002` darf nach vollstaendiger Tag-, Commit-, Manifest-, Digest- und Plattform-Evidence `BOUND_BCPROJECTOS_RELEASE` sowie Consumer- und kontrollierte Publish-Eignung tragen.
