# Delivery Plan

## Wellen

Ein begrenzter W1-Pilot: Plan -> minimale Automation -> Auth-Bootstrap -> Run 1 -> Run 2 -> Manifestvergleich -> visuelle Pruefung -> kuratierte Dokumentation -> Review.

## Abhaengigkeiten

Strict-validierter Change und lokale Projektsteuerung -> gepinnte Playwright-Version -> lokaler `BC_BASE_URL`-/Auth-Guard -> zwei identische read-only Laeufe -> visueller Evidence-Review -> Publikation. Kein nachgelagerter Schritt darf fehlende UI-Evidence durch Annahmen ersetzen.

## Verantwortungen

- Change/Test/Documentation: Codex als ausfuehrender Consultant.
- Reale Authentifizierung: vorhandene autorisierte lokale Sitzung; keine Zugangsdaten im Repository.
- Approval Policy: ausdruecklich vom realen Repository-Nutzer autorisiertes automatisiertes Policy-Gate; keine Selbstausgabe als menschliche Freigabe.

## Nachweise

- `UABC-VER-ENV-RUN1-001`: Run-1-Manifest, Eventlog, Trace-Referenzen und Screenshots.
- `UABC-VER-ENV-RUN2-001`: unabhaengiger Run 2 mit demselben Test.
- `UABC-VER-ENV-COMPARE-001`: normalisierter Vergleich stabiler Fakten.
- `UABC-VER-ENV-VISUAL-001`: protokollierter visueller Screenshotreview durch Codex; keine menschliche Freigabe.
- `UABC-VER-ENV-POLICY-GATE-001`: automatisiertes change-spezifisches Policy-Gate fuer Canonical-Synchronisation und Archive-Readiness.
- `UABC-VER-ENV-DOCS-001`: Buchkapitel/Runbook referenzieren nur bestaetigte Evidence.

## Gates

1. Pre-Browser: OpenSpec strict, Sicherheitsgrenzen, Testfaelle und Evidence-Plan gruen.
2. Target Gate: lokaler URL-Guard beweist `playthru`; kein `company`-Parameter.
3. Run Gate: keine Writes/Switches, alle Schritte mit Event/Trace/Manifest.
4. Repro Gate: zwei normalisierte Manifeste verglichen.
5. Review Gate: Screenshots visuell geprueft, Publikation kuratiert, Change/Story `In Review`.
