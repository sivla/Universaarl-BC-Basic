# Change-Vorschlag: Playthru-Umgebungsbaseline

## Metadaten

- Change: `establish-playthru-environment-baseline`
- Welle: W1 Grundlagen und Strategie
- Status: `proposed`
- Jira: `UABC-11`, `UABC-12`, `UABC-13`, `UABC-14`
- Confluence: `UABC-ENVBASELINE`
- Zielumgebung: ausschliesslich Sandbox `playthru`

## Problem und Zweck

Vor dem ersten BC-Write muss die tatsaechliche Client-Baseline der autorisierten Sandbox sichtbar und reproduzierbar belegt werden. Releaseplaene oder Architekturannahmen duerfen Version, Lokalisierung, Apps, Experience oder Featurezustand nicht ersetzen.

## Ergebnisse

- Zwei unabhaengige read-only Playwright-Laeufe mit derselben lokal gespeicherten, nicht eingecheckten Authentifizierungsstrategie.
- Normalisierte Manifeste, Ereignisprotokolle, langlebige visuell gepruefte Screenshots sowie gitignorierte rohe Traces/Videos.
- Kuratiertes Einsteigerkapitel und Consultant-Runbook ausschliesslich aus belegten Fakten.
- Vorgeschlagenes, damals noch nicht kanonisch uebernommenes Ergebnis fuer `actualSandboxBaseline`.

## Kanonische Ziele

- `architecture-baseline`: ausschliesslich der Teilbaum `actualSandboxBaseline` in `architecture/enterprise-blueprint.yaml`.
- `verification-register`: die change-spezifischen W1-Nachweise in `evidence/verification-register.yaml`.
- `capability-catalog` ist kein Ziel dieses Changes und bleibt unter `establish-universaarl-enterprise-blueprint` freigegeben.

Der maschinenlesbare Vorschlag liegt als `proposedCanonicalUpdate` in `.openspec.yaml`. Der reale Repository-Nutzer hat fuer diesen Change ausdruecklich ein automatisiertes Policy-Gate autorisiert; nach bestandenen Pflichtnachweisen wurde der Vorschlag semantisch identisch angewendet.

## Umfang

- Umgebungszuordnung `playthru`, aktive Gesellschaft und sichtbare Liste zugaenglicher Gesellschaften ohne Wechsel.
- BC-Version/Build, Sprache, Region/Lokalisierung, Company Experience, installierte Extensions und sichtbarer Feature-Management-Zustand.
- Nicht im BC-Client belegbare Tatsachen werden mit Grund als `unknown` erfasst.

## Nicht-Ziele

- Kein Gesellschafts- oder Umgebungswechsel, kein Admin Center, keine API, Konfiguration, Datenanlage, Aenderung, Loeschung oder Buchung.
- Keine Aenderung von `architecture/enterprise-blueprint.yaml` oder `capabilities/catalog.yaml` waehrend dieses aktiven Changes.
- Keine Aussage zur Featureverfuegbarkeit allein aus Releaseplaenen und keine allgemeine Testautomatisierungsplattform.

## Risiken und Kontrollen

- Der lokal gesetzte `BC_BASE_URL` MUST HTTPS verwenden, den Pfadsegmentnamen `playthru` enthalten und darf keinen `company`-Parameter tragen. Andernfalls Abbruch vor Navigation.
- Auth-Zustand liegt nur unter gitignoriertem `playwright/.auth/`; Zugangsdaten, Tokens, Tenant-/Benutzeridentitaeten werden nie protokolliert.
- Screenshots maskieren Konto-/Identitaetssteuerungen und werden einzeln visuell geprueft. URLs werden auf Host, redigierten Tenantpfad und `playthru` normalisiert.
- Abbruch bei Ziel ausserhalb `playthru`, erforderlichem Gesellschaftswechsel, sichtbarem Schreib-/Bestaetigungsdialog, nicht sicher redigierbarer Identitaet oder zwei vergleichbaren Navigationsfehlern.

## Freigabe

Dieser Pilot stand vor Archivierung als aktiver Change auf `proposed` und in Jira/Confluence auf `In Review`. Das automatisierte Policy-Gate autorisierte ausschliesslich die kanonische Baseline-Synchronisation dieses Changes. Es autorisierte keinen BC-Write, keinen Commit und keinen Push.
