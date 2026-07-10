---
id: UABC-ENVBASELINE
title: Playthru Environment Baseline
parent: UABC-PROJECT
owners: [P-002, P-004]
status: Done
jiraRefs: [UABC-11, UABC-12, UABC-13, UABC-14]
referenceIds: [UABC-REQ-ENV-001, UABC-REQ-ENV-002, UABC-REQ-ENV-003, UABC-REQ-ENV-004, UABC-REQ-ENV-005, UABC-VER-ENV-RUN1-001, UABC-VER-ENV-RUN2-001, UABC-VER-ENV-GOV-SELFTEST-001, UABC-VER-ENV-POLICY-GATE-001]
lastReviewed: 2026-07-10
---

# Playthru Environment Baseline

Diese Seite ist die kuratierte Review-Navigation fuer den abgeschlossenen W1-Piloten. Normativ sind `openspec/specs/environment-baseline/spec.md` und `architecture/enterprise-blueprint.yaml#actualSandboxBaseline`; die Archiv-Historie liegt unter `openspec/changes/archive/2026-07-10-establish-playthru-environment-baseline/`.

Der Pilot liest ausschliesslich sichtbare UI-Zustaende der Sandbox `playthru`. Er wechselt weder Environment noch Gesellschaft und fuehrt keine Anlage, Aenderung, Konfiguration, Buchung, Extension-Aktion oder Feature-Aktivierung aus.

## Reviewgegenstand

- Zwei unabhaengige Laeufe desselben Tests und Vergleich stabiler Fakten.
- Visuell gepruefte, identitaetsmaskierte Screenshots mit Run-/Step-/Evidence-ID.
- Ehrliche `unknown`-Werte, wenn der BC-Client einen Fakt nicht eindeutig zeigt.
- Einsteigerkapitel und Consultant-Runbook ohne Rohlog- oder Releaseplanbehauptungen.

## Review-Ergebnis

- Zwei unabhaengige read-only Laeufe bestaetigen `playthru`, `CRONUS DE`, Sprache/Region `German (Germany)`, BC 28.2 sowie Plattform-/Anwendungsbuild.
- Der normalisierte Vergleich enthaelt keine Abweichung.
- 14 kuratierte Screenshots wurden durch Codex visuell geprueft; dieser Agent-Review ist keine menschliche Freigabe.
- Company Experience bleibt `unknown`; sechs screenshot-belegte Extension-Karten, 15 viewport-schneidende Feature-Zeilen und `DE` werden nicht zu einem Vollstaendigkeits-, Verfuegbarkeits- oder Lokalisierungsnachweis ueberdehnt.
- Arbeitsdatum und Zeitzone sind bestaetigter Benutzer-/Laufkontext, keine Gesellschaftskonfiguration.
- `UAM-DE`, `UAS-DE`, `UAD-DE`, `UAP-DE` und `UAC-CONS` wurden im zugaenglichen Playthru-Pane nicht beobachtet; daraus folgt keine Nichtexistenzaussage.
- Kanonische Ziele sind nur Architektur-Baseline und Verification-Register. Der Capability-Katalog bleibt unveraendert unter W0-Governance.
- `UABC-VER-ENV-POLICY-GATE-001` ist das ausdruecklich autorisierte automatisierte W1-Gate; die W0-Freigabe kann es nicht ersetzen.
- Einsteigeranleitung: `docs/guides/beginner/playthru-environment-baseline.md`.
- Consultant-Runbook: `docs/runbooks/playthru-environment-baseline.md`.

Status `In Review` ist keine menschliche Freigabe. Die kanonische Aktualisierung von `actualSandboxBaseline` ist durch das automatisierte Policy-Gate und semantische Gleichheitspruefung erfolgt; BC-Writes bleiben unautorisiert.
