# Tasks

- [x] Kanonischen Brownfield-, Delta-, Knowledge-, Coverage- und Reconciliation-Vertrag fuer die bestehenden drei Spaces definieren.
- [x] Portablen ungebundenen Releasevertrag mit Sichtgrenzen, Kundentrennung und FS-/HTTPS-Bytegleichheit definieren.
- [x] Schema, Generator, Validator, Releaseartefakte, Indexeintraege und synthetische Zweitkundenfixture implementieren.
- [x] Positive und geforderte fail-closed Negativtests sowie bestehende Snapshot-, Katalog-, Referenz- und Storygates ausfuehren; commitgebundene Gates bleiben bis zum ausdruecklich ausgeschlossenen Commitversuch fail-closed.
- [x] Doppelgenerierung, Diffcheck, Review und read-only Uebergabe ohne Commit oder Push abschliessen.
- [x] Plattformgruenen Spectra-Release `spectra-v1.2.0-alpha.12` mit Tagobjekt, aufgeloestem Commit, finalem Manifest, Quellbaum, Produktdigest und Plattformlauf-Nachweis versioniert binden.
- [x] Neuen immutable Release `UABC-PORTABLE-PILOT-0002` erzeugen, historischen Release bytegleich erhalten und `current.json` sowie Kundenkatalog atomar auf den neuen Release setzen.
- [x] Positive, negative, Determinismus-, Kundentrennungs-, Deutsch-, Referenz- und Gesamtgates ausfuehren; `REVIEW.md` vor dem lokalen Commit in Arbeitskopie und `HEAD` leer nachweisen.
