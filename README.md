# Universaarl Business Central Blueprint V2

Greenfield-Planungsrepository fuer eine nachweisbasierte Microsoft Dynamics 365 Business Central Implementierung. OpenSpec ist fuehrend; Jira und Confluence werden lokal simuliert.

## Arbeitsregeln

- Null oder ein aktiver Change unter `openspec/changes/`; waehrend der Umsetzung gilt WIP=1, nach Archivierung bis zum naechsten Start WIP=0.
- Freigegebene Wahrheit liegt unter `openspec/specs/` und in den kanonischen strukturierten Artefakten; geplante Arbeit verbleibt in maximal einem aktiven Change.
- Zielsystem fuer spaetere Ausfuehrung ist ausschliesslich die Sandbox `playthru` mit synthetischen Daten.
- Lokales Nicht-BC-Playwright ist fuer Artefakttests zulaessig. BC-Playwright erfordert einen ausdruecklich autorisierten Change und darf ausschliesslich innerhalb `playthru` laufen.
- Jira/Confluence referenzieren stabile fachliche IDs; deren Lebenszyklusaufloesung steht in `governance/reference-lifecycle.yaml`.
- Dauerhafte Architektur, Faehigkeiten und Verifikation liegen strukturiert unter `architecture/`, `capabilities/` und `evidence/`.

## Reproduzierbarer Einstieg

Voraussetzungen: Node.js >= 20.19 sowie `ffmpeg` und `ffprobe` auf `PATH`, beide aus dem gemeinsamen Full-Build `2025-07-23-git-829680f96a-full_build-www.gyan.dev`. Die Medienwerkzeugkette ist ein expliziter Systemvertrag und wird nicht durch `npm ci` installiert.

Der Build wird nicht als npm-Binaerpaket eingebunden: Die Organisation beschafft den exakten Full-Build nach ihrer Lizenz- und Lieferkettenpruefung; `npm run check:media-toolchain` erzwingt danach Build-Paar und benoetigte Encoder vor jeder Medienerzeugung.

```powershell
npm ci
npm run check:media-toolchain
npm run setup:playwright:chromium
npm test
```

OpenSpec ist als exakte Entwicklungsabhaengigkeit gepinnt. Direkte Aufrufe erfolgen mit `npm exec openspec -- <command>`.

## Aktiver Change

Kein aktiver Change. `establish-project-artifact-walkthrough-pilot` wurde nach bestandenem change-spezifischem automatischem Policy-Pruefpunkt archiviert.
