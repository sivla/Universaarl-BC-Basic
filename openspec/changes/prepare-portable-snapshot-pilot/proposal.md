# Proposal: Portablen Brownfield- und Snapshot-Pilot vorbereiten

## Ziel

Die bestehende synthetische Drei-Space-Projektsimulation erhaelt einen deterministischen Brownfield-, Wissensdelta- und portablen Snapshotvertrag. Der Twin darf ausschliesslich validierte Releasebytes lesen; Arbeitsbaum, externe Systeme und ungeprueftes Wissen bleiben ausgeschlossen.

## Umfang

- Inventar und Checkpoint fuer die bestehenden 28 Confluence-Seiten ohne neue Space-Struktur.
- Alle sieben Deltaarten, Tombstones, Wissensreview, Coverage, Widersprueche und Brownfield-Reconciliation.
- Unveraenderliches lokales Releaseverzeichnis, atomarer `current.json`-Zeiger und isolierter Kunden-/Projektkatalog.
- Identischer Bytevertrag fuer Filesystem und HTTPS sowie fail-closed Digests und Sichtgrenzen.
- Commitgebundener Projektindex mit allen 158 positivgelisteten Projektquellen, damit ein Consumer die vollstaendige Projektansicht ohne produktive Git-Abhaengigkeit lesen kann.
- Eine zweite Kundeninstanz ausschliesslich als synthetische Negativfixture unter `tests/fixtures`.
- Bindung eines neuen, unveraenderlichen Snapshot-Releases an den nachweislich plattformgruenen Spectra-Release `spectra-v1.2.0-alpha.12`.
- Explizite, strikt nur-lesende Consumerbindung an `https://github.com/sivla/Universaarl-Project-Twin.git` auf `codex/universaarl-projekt-twin`.

## Grenzen

Keine Live-Verbindung, keine Produktivbehauptung, keine Twin-Code- oder BCProjectOS-Aenderung aus dieser Kundeninstanz. Die historischen Releases `UABC-PORTABLE-PILOT-0001` bis `UABC-PORTABLE-PILOT-0003` bleiben bytegleich erhalten. Ausschliesslich der aktuelle Release `UABC-PORTABLE-PILOT-0004` bindet die vollstaendige Projekt-Quellmenge aus dem festgehaltenen Producer-Commit `83a63c0af8775001e4c7f909a46c5b227f3cce3d` und die neue Consumeridentitaet. Die Spectra-Bindung bleibt auf `spectra-v1.2.0-alpha.12` mit vollstaendiger Tag-, Commit-, Manifest-, Digest- und Plattform-Evidence begrenzt.
