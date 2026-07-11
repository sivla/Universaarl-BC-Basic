# Loesungsdesign: Playthru-Umgebungsbaseline

## Faktenbasis

- Die zwei Laeufe liefern den Baseline-Kandidaten; das ausdruecklich autorisierte automatisierte Policy-Gate uebernimmt ihn nur bei semantischer Gleichheit und bestandener change-eigener Evidence in `actualSandboxBaseline`.
- Offizielle BC-Dokumentation beschreibt Help and Support als sichtbare Quelle fuer die Clientversion, den Company Switcher als Pane ohne erforderlichen Wechsel und Company Experience als Feld der Company Information.
- Playwright 1.61.1 ist die am 2026-07-10 anhand der offiziellen Release Notes gepruefte stabile Version. Authentifizierungszustand kann sensible Cookies/Header enthalten und bleibt deshalb gitignoriert.

## Annahmen

- Der Nutzer stellt lokal eine vollstaendige HTTPS-Webclient-URL bereit, deren Umgebungspfad `playthru` lautet und die keinen `company`-Parameter setzt.
- Die bestehende Berechtigung erlaubt die benoetigten Seiten read-only. Fehlende Sichtbarkeit ist kein Fehlernachweis fuer das Produkt, sondern wird `unknown` oder `blocked`.

## Architektur

- `playwright.config.mjs`: ein Chromium-Projekt, ein Worker, Trace/Video in `.tmp/playwright-artifacts`, normaler und headed Modus.
- `tests/playwright/environment-baseline.spec.mjs`: genau ein Baseline-Test mit festem Navigationsweg.
- `tests/playwright/helpers/bc-evidence.mjs`: einziger Helper fuer Guard, URL-Redaktion, strukturierte Company-/Extension-Extraktion, Step-Event, Screenshotmaskierung und Manifest.
- `playwright/.auth/playthru.json`: gemeinsamer lokaler Storage State fuer beide Laeufe; gitignoriert und niemals als Evidence kopiert.
- `evidence/playthru-environment-baseline/run-1|run-2`: normalisierte Manifeste, Eventlogs und ausgewaehlte Screenshots. Rohartefakte bleiben unter `.tmp`.

## Navigations- und Nachweisplan

| Schritt | UI-Zustand | Zu erhebender Fakt | Langlebige Evidence |
| --- | --- | --- | --- |
| ENV-00 | Role Center nach validierter URL | playthru, aktive Gesellschaft, Seitentitel | Screenshot und Event |
| ENV-01 | Available Companies Pane, Hintergrund sichtbar | nur Playthru-Gesellschaften ohne Auswahl; andere Umgebungen werden nicht persistiert | Screenshot und Liste |
| ENV-02 | Help and Support | Version und Build; andere technische Angaben redigiert | zugeschnittener/maskierter Screenshot |
| ENV-03 | My Settings Dialog/Pane | aktive Gesellschaft, Sprache, Region sowie Arbeitsdatum und Zeitzone als Benutzer-/Laufkontext | Screenshot des relevanten Bereichs |
| ENV-04 | Company Information read-only | Experience Essentials/Premium; Lokalisierung nur wenn sichtbar | relevanter Ausschnitt, sensible Firmenfelder maskiert |
| ENV-05 | Suche `Erweiterung` -> angebotene App-Verwaltung -> Installierte Erweiterungen | nur Karten, deren Name und Herausgeber den Screenshot-Viewport schneiden; Vollstaendigkeit bleibt unbelegt | Screenshot plus normalisierte `visible-partial`-Liste |
| ENV-06 | Feature Management | nur viewport-schneidende Featurezeilen als `candidate`; keine Vollinventarisierung | Screenshot plus normalisierte `visible-partial`-Liste |

Trace, Event und Manifest tragen dieselbe Run-/Step-ID. Der Trace wird vor dem Manifest abgeschlossen, seine tatsaechliche `testInfo.outputPath`-Datei wird geprueft und nur als gitignoriertes Rohartefakt referenziert. Nach Tell-Me-Navigation wird der sichtbare Zielzustand einschliesslich Pane/Dialog/Overlay zuerst verstanden; es wird nicht reflexartig Escape gesendet.

## Entscheidungen

- Direkte UI-Navigation ueber Tell Me und Clientsteuerungen; kein Admin Center, keine API und keine URL mit `company=`.
- Keine automatisierte Anmeldung. Bei abgelaufenem Auth-State wird ein expliziter headed Bootstrap erlaubt, der nur Storage State speichert; beide Beweislaeufe starten danach unabhaengig.
- Stabile Fakten schliessen Zeitstempel, Run-ID, rohe URLs, Tenantpfade und Benutzeranzeige aus.
- Langlebige Evidence ist nur fuer explizite `run-1`/`run-2` erlaubt. Lokale Checks schreiben ausschliesslich nach `.tmp`.
- Der sichtbare Haken im Mandanten-Pane wird nicht ueber ein unzuverlaessiges ARIA-Attribut modelliert; `activeCompany` wird separat aus **Meine Einstellungen** bestaetigt.

## Alternativen

- Persistentes reales Chrome-Profil: verworfen wegen Identitaets-/Profilrisiko und schlechter Reproduzierbarkeit.
- API-/Admin-Center-Abfrage: ausserhalb des Umfangs und kein UI-Beweis.
- Alternative Navigation bei Fehler: verworfen; nach zwei vergleichbaren Fehlern wird Ursache/Screenshot analysiert und der Fakt bleibt gegebenenfalls blocked.

## Abbruchbedingungen

1. URL-Guard kann `playthru` nicht vor Navigation beweisen.
2. Navigation verlaesst `businesscentral.dynamics.com` oder das Environment-Pfadsegment `playthru`.
3. Ein Company Switch, Save/OK fuer Aenderungen, Feature-Update, Extension-Aktion oder Admin-Center-Navigation waere erforderlich.
4. Screenshot/Log kann Identitaet, Token, Tenantkennung oder personenbezogene Daten nicht sicher ausschliessen.
5. Zwei vergleichbare Navigationsfehler oder ein nicht verstandener Dialog/Overlay-Zustand.

## Offene Punkte

- Menschliche Entscheidung, ob der vorgeschlagene Baseline-Kandidat spaeter kanonisch uebernommen wird.
- Company Experience bleibt mangels eindeutig sichtbarem Feld `unknown`.
- Vollstaendigkeit der Extension-, App- und Feature-Ausstattung sowie der installierten deutschen Lokalisierung bleibt technisch unbewiesen. Gerenderte DOM-Elemente ausserhalb des Screenshot-Viewports gelten nicht als visuell geprueft.

## Beobachtetes Ergebnis

Run 1 und Run 2 bestaetigen `playthru`, `CRONUS DE`, Sprache/Region `German (Germany)`, `DE Business Central 28.2`, Plattform `28.0.52048.0`, Anwendung `28.2.50931.52151` und sichtbaren Laender-/Regionscode `DE`. Der normalisierte Vergleich enthaelt keine Abweichungen. Kein Write und kein Switch wurden ausgefuehrt.
