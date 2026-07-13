# Universaarl Business Central Blueprint V2

Planungsrepository fuer eine nachweisbasierte Neuimplementierung von Microsoft Dynamics 365 Business Central. OpenSpec ist fuehrend; Jira und Confluence werden lokal simuliert.

## Arbeitsregeln

- Null oder eine aktive OpenSpec-Aenderung unter `openspec/changes/`; waehrend der Umsetzung gilt WIP=1, nach Archivierung bis zum naechsten Start WIP=0.
- Freigegebene Wahrheit liegt unter `openspec/specs/` und in den kanonischen strukturierten Artefakten; geplante Arbeit verbleibt in maximal einer aktiven OpenSpec-Aenderung.
- Zielsystem fuer spaetere Ausfuehrung ist ausschliesslich die Sandbox `playthru` mit synthetischen Daten.
- Lokales Nicht-BC-Playwright ist fuer Artefakttests zulaessig. BC-Playwright erfordert einen ausdruecklich autorisierten Change und darf ausschliesslich innerhalb `playthru` laufen.
- Jira/Confluence referenzieren stabile fachliche IDs; deren Lebenszyklusaufloesung steht in `governance/reference-lifecycle.yaml`.
- Dauerhafte Architektur, Faehigkeiten und Verifikation liegen strukturiert unter `architecture/`, `capabilities/` und `evidence/`.

## Reproduzierbarer Einstieg

Voraussetzungen: Node.js >= 20.19 sowie `ffmpeg` und `ffprobe` auf `PATH`, beide aus dem gemeinsamen vollstaendigen Programmstand `2025-07-23-git-829680f96a-full_build-www.gyan.dev`. Die Medienwerkzeugkette ist ein expliziter Systemvertrag und wird nicht durch `npm ci` installiert.

Der Programmstand wird nicht als npm-Binaerpaket eingebunden: Die Organisation beschafft den exakten vollstaendigen Programmstand nach ihrer Lizenz- und Lieferkettenpruefung; `npm run check:media-toolchain` erzwingt danach das Werkzeugpaar und die benoetigten Encoder vor jeder Medienerzeugung.

```powershell
npm ci
npm run check:media-toolchain
npm run setup:playwright:chromium
npm test
```

OpenSpec ist als exakte Entwicklungsabhaengigkeit gepinnt. Direkte Aufrufe erfolgen mit `npm exec openspec -- <command>`.

## Aktive OpenSpec-Aenderung

Aktiv ist `prepare-portable-snapshot-pilot`. Der Produktvertrag heisst fachlich Spectra (`productId: spectra`); die technische Repository-Identitaet bleibt BCProjectOS. Die historische 0.10-Konformitaetsevidence bleibt erhalten. Der aktuelle portable Snapshot `UABC-PORTABLE-PILOT-0002` ist zusaetzlich ueber den annotierten Tag `spectra-v1.2.0-alpha.12`, finales Manifest, Commit-/Tree-Nachweis, Produktdigest und bestandene Windows-/macOS-Matrix gebunden. Die native Kundenstory bleibt alleinige Source of Truth. Brownfield-, Wissensdelta- und Snapshotartefakte sind deterministische Projektionen; der historische ungebundene Release `0001` bleibt bytegleich. Der Project Twin darf ausschliesslich `current.json`, Katalog, Manifest und positiv gebundene Releasebytes lesen und niemals zurueckschreiben.
