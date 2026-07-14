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

## Aktueller Projekt- und Katalogvertrag

Die kanonische Kundeninstanz ist eine vollständig simulierte und synthetisch abgenommene BC-Basic-Einführung mit 50 UABC-Tickets, 19 Task-Worklogs, 80 Stunden und 9.600 EUR. Acht reale Tenant-, Lizenz-, Security-, UAT-, Cutover-, First-Close-, VAT- und Support-Gates bleiben als echte Folgegrenze offen.

Spectra (`productId: spectra`) ist über den echten Release `spectra-v1.0.0` von BCProjectOS gebunden. Der Project Twin liest ausschließlich den filesystem-basierten Kundenkatalog über `exports/project-data/v1/snapshots/current.json`; dieser zeigt auf genau ein unveränderliches Release mit Manifest, Index, Ressourcenkatalog und Payloadbytes. Git, Branch und Commit sind für die Runtime nicht erforderlich. Die Producer-Commit-SHA ist, falls vorhanden, reine Provenienz. Der Katalog ist read-only und kundenisoliert.
