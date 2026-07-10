---
title: Consultant Runbook - Playthru Environment Baseline
status: In Review
lastReviewed: 2026-07-10
change: establish-playthru-environment-baseline
scenarioRefs: [UABC-SCN-ENV-001, UABC-SCN-ENV-002, UABC-SCN-ENV-003, UABC-SCN-ENV-004, UABC-SCN-ENV-005, UABC-SCN-ENV-006, UABC-SCN-ENV-007]
evidenceRefs: [UABC-VER-ENV-RUN1-001, UABC-VER-ENV-RUN2-001, UABC-VER-ENV-COMPARE-001, UABC-VER-ENV-VISUAL-001, UABC-VER-ENV-DOCS-001]
---

# Consultant Runbook: Playthru Environment Baseline

## Zweck und Guardrails

Der Lauf schafft vor spaeteren W1-Writes eine reproduzierbare, ausschliesslich sichtbare Clientbaseline. `BC_BASE_URL` wird nur im lokalen Prozess gesetzt, muss HTTPS und das Pfadsegment `playthru` verwenden und darf keinen `company`-Parameter enthalten. Auth-State, Trace und Video bleiben gitignoriert. Ein Company-/Environment-Wechsel, Admin Center, API oder BC-Write ist unzulaessig.

## Reproduzierbarer Ablauf

1. `npm run pw:baseline` mit lokalem `BC_BASE_URL` und `UABC_RUN_ID=run-1` ausfuehren.
2. Den identischen Test unabhaengig mit `UABC_RUN_ID=run-2` ausfuehren.
3. `npm run pw:baseline:compare` ausfuehren.
4. Alle 14 kuratierten Screenshots einzeln gegen Step, Manifest, Privacy und sichtbaren Vorder-/Hintergrund pruefen.

Der Test nutzt einen Chromium-Worker, genau einen Test und einen Helper. Nach jedem relevanten Zustand wird die aktuelle Client-URL gegen Host und `playthru` geprueft. Die URL wird in langlebiger Evidence auf `/[tenant]/playthru` reduziert.

`@playwright/test` ist exakt auf `1.61.1` gepinnt. Fehlende oder ungueltige `BC_BASE_URL` und eine Evidence-Run-ID ausserhalb `run-1|run-2` brechen mit Exit ungleich null ab. Lokale Checks muessen `UABC_LOCAL_CHECK=1` verwenden und schreiben nur nach `.tmp`.

## UI-Route und erwarteter Zustand

| Step | Route | Erwarteter read-only Zustand |
| --- | --- | --- |
| ENV-00 | gesicherte Basis-URL | Role Center, `playthru`, `CRONUS DE` |
| ENV-01 | `Strg+O` | Pane **Verfuegbare Mandanten**; nur Playthru-Teilbaum wird persistiert |
| ENV-02 | Header **Hilfe** -> **Hilfe & Support** | sichtbare Version und Builds |
| ENV-03 | `Alt+T` | **Meine Einstellungen**; Mandant/Sprache/Region sowie Arbeitsdatum/Zeitzone als Benutzerkontext; Exit mit **Abbrechen** |
| ENV-04 | Header **Einstellungen** -> **Unternehmensdaten** | Seite **Firmendaten**; Country/Region Control `DE`; Exit mit **Zurueck** |
| ENV-05 | `Alt+Q`, Suchwort `Erweiterung` | angebotene App-Verwaltung fuehrt zu **Installierte Erweiterungen** |
| ENV-06 | `Alt+Q`, Suchwort `Funktion` | **Funktionsverwaltung** ohne Edit-/Aktivierungsaktion |

## Verifiziertes Ergebnis

Beide Manifeste stimmen bei allen stabilen Fakten und im Ausfuehrungskontext ueberein. Bestaetigt sind Environment `playthru`, aktiver Mandant `CRONUS DE`, strukturierte zugaengliche Mandantennamen, Sprache/Region `German (Germany)`, Arbeitsdatum, Zeitzone, Version `DE Business Central 28.2`, Plattform `28.0.52048.0`, Anwendung `28.2.50931.52151` und sichtbarer Country/Region Code `DE`. Sechs Extension-Karten werden nur aufgenommen, wenn Name und Herausgeber den Screenshot-Viewport schneiden. 15 Feature-Zeilen schneiden den Viewport. Beide Mengen bleiben `candidate`/`visible-partial`; gerenderte Elemente ausserhalb des Viewports und die vollstaendige Ausstattung sind nicht belegt. Experience bleibt `unknown`.

## Evidence und Reset

- Kuratiert: `evidence/playthru-environment-baseline/run-1`, `run-2`, `comparison.json`, `visual-review.yaml`.
- Roh: tatsaechlicher `testInfo.outputPath('trace.zip')` und Video im testspezifischen Unterverzeichnis von `.tmp/playwright-artifacts/<run-id>`; Manifest wird erst nach erfolgreichem Trace-Abschluss geschrieben; nicht committen.
- Auth: `playwright/.auth/playthru.json`; nicht committen.
- Reset: Es wurden keine BC-Daten geaendert. Fuer eine Wiederholung werden nur lokale Run-Ordner kontrolliert ersetzt; BC-seitig ist kein Cleanup erforderlich.

## Abbruch

Abbruch bei falschem Host/Environment, `company=` in der Basis-URL, erforderlichem Wechsel, Schreib-/Bestaetigungsaktion, nicht sicher redigierbarer Identitaet oder nicht verstandenem Dialog/Panestatus. Nicht sichtbare Werte bleiben `unknown`; sie werden nicht aus Release-Plaenen abgeleitet.

Dieser Runbook-Review ist keine menschliche Freigabe. Die kanonische Aktualisierung von `actualSandboxBaseline` erfolgt ausschliesslich ueber das deklarierte automatisierte Policy-Gate und den semantischen Validator.
