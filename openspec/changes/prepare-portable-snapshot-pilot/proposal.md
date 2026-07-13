# Proposal: Portablen Brownfield- und Snapshot-Pilot vorbereiten

## Ziel

Die bestehende synthetische Drei-Space-Projektsimulation erhaelt einen deterministischen Brownfield-, Wissensdelta- und portablen Snapshotvertrag. Der Twin darf ausschliesslich validierte Releasebytes lesen; Arbeitsbaum, externe Systeme und ungeprueftes Wissen bleiben ausgeschlossen.

## Umfang

- Inventar und Checkpoint fuer die bestehenden 28 Confluence-Seiten ohne neue Space-Struktur.
- Alle sieben Deltaarten, Tombstones, Wissensreview, Coverage, Widersprueche und Brownfield-Reconciliation.
- Unveraenderliches lokales Releaseverzeichnis, atomarer `current.json`-Zeiger und isolierter Kunden-/Projektkatalog.
- Identischer Bytevertrag fuer Filesystem und HTTPS sowie fail-closed Digests und Sichtgrenzen.
- Eine zweite Kundeninstanz ausschliesslich als synthetische Negativfixture unter `tests/fixtures`.

## Grenzen

Keine Live-Verbindung, keine Produktivbehauptung, keine Twin-Code- oder BCProjectOS-Aenderung. Der Pilot bleibt `PENDING_BCPROJECTOS_RELEASE` und `UNBOUND_LOCAL_PILOT`; Consumer- und Publish-Eignung bleiben false.
