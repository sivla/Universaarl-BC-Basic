# Tasks

- [x] Kanonischen Brownfield-, Delta-, Knowledge-, Coverage- und Reconciliation-Vertrag fuer die bestehenden drei Spaces definieren.
- [x] Portablen ungebundenen Releasevertrag mit Sichtgrenzen, Kundentrennung und FS-/HTTPS-Bytegleichheit definieren.
- [x] Schema, Generator, Validator, Releaseartefakte, Indexeintraege und synthetische Zweitkundenfixture implementieren.
- [x] Positive und geforderte fail-closed Negativtests sowie bestehende Snapshot-, Katalog-, Referenz- und Storygates ausfuehren; commitgebundene Gates bleiben bis zum ausdruecklich ausgeschlossenen Commitversuch fail-closed.
- [x] Doppelgenerierung, Diffcheck, Review und read-only Uebergabe ohne Commit oder Push abschliessen.
- [x] Plattformgruenen Spectra-Release `spectra-v1.2.0-alpha.12` mit Tagobjekt, aufgeloestem Commit, finalem Manifest, Quellbaum, Produktdigest und Plattformlauf-Nachweis versioniert binden.
- [x] Neuen immutable Release `UABC-PORTABLE-PILOT-0002` erzeugen, historischen Release bytegleich erhalten und `current.json` sowie Kundenkatalog atomar auf den neuen Release setzen.
- [x] Positive, negative, Determinismus-, Kundentrennungs-, Deutsch-, Referenz- und Gesamtgates ausfuehren; `REVIEW.md` vor dem lokalen Commit in Arbeitskopie und `HEAD` leer nachweisen.
- [x] Immutable Release `UABC-PORTABLE-PILOT-0003` mit Projektindex und allen 158 commitgebundenen Projektquellen erzeugen, historische Releases bytegleich pruefen und die vollstaendige Suite commitgebunden nachweisen.
- [x] Kanonische Project-Twin-Consumeridentitaet auf das getrennte Repository aktualisieren und als strikt nur-lesende Releasebindung in Vertrag, Schema und Negativtests verankern.
- [x] Immutable Release `UABC-PORTABLE-PILOT-0004` mit Projektpayload-Provenienz `83a63c0af8775001e4c7f909a46c5b227f3cce3d` erzeugen, `current.json` und Kundenkatalog aktualisieren und die Releases `0001` bis `0003` bytegleich nachweisen.
- [x] Fokus-, Determinismus-, OpenSpec-, Referenz- und Gesamtpruefungen ausfuehren, `REVIEW.md` leeren, einen kohaerenten Commit erstellen und den Arbeitsbranch normal veroeffentlichen.
