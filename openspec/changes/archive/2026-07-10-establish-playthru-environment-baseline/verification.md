# Verifikation

## Ausgefuehrte Pruefungen

- URL-Guard bestaetigte in beiden Laeufen Host `businesscentral.dynamics.com`, Environment-Pfad `playthru` und fehlenden `company`-Parameter.
- Ein read-only Playwright-Test wurde zweimal unabhaengig mit demselben gitignorierten Auth-State ausgefuehrt.
- Beide normalisierten Manifeste stimmen ohne Abweichung ueberein (`UABC-VER-ENV-COMPARE-001`).
- Alle 14 kuratierten Screenshots wurden einzeln visuell auf Zustand, Privacy und Aussage geprueft (`visual-review.yaml`).
- Einsteigerkapitel und Consultant-Runbook wurden gegen die bestaetigten Fakten kuratiert.
- Sechs ausfuehrbare Node-Selbsttests beweisen, dass die bestandene W0-Freigabe das aktive W1-Policy-Gate nicht ersetzt, der nicht adressierte Capability-Katalog keinen Fehler ausloest, abweichende kanonische Fakten vor und nach Archivierung abgelehnt werden, ein rohes Archiv mit nicht erfuelltem Policy-Gate nach Archivierung ungueltig bleibt und eine positive Wegwerfsimulation den echten OpenSpec-Merge sowie alle Post-Archive-Pruefungen besteht (`tests/governance/archive-ready.test.mjs`; Ergebnisprotokoll `lifecycle-selftest.yaml`).

## Ergebnisse

- Bestaetigt: `playthru`, aktiver Mandant `CRONUS DE`, zugaengliche Namen `CRONUS DE`, `My Company` und `Universaarl GmbH`, `German (Germany)` fuer Sprache/Region, `DE Business Central 28.2`, Plattform `28.0.52048.0`, Anwendung `28.2.50931.52151`, sichtbarer Laender-/Regionscode `DE` und sichtbarer Feature-Management-Zustand.
- Benutzer-/Laufkontext: Arbeitsdatum `2027-06-01` und Zeitzone `(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna`; beides ist keine Gesellschaftskonfiguration.
- Teilnachweis: sechs strukturierte Karten der Seite **Installierte Erweiterungen**, bei denen Name und Herausgeber den Screenshot-Viewport schneiden. Geladene Karten ausserhalb dieses sichtbaren Ausschnitts sind ausgeschlossen; Vollstaendigkeit der Erweiterungsausstattung ist nicht behauptet.
- Feature Management: 15 viewport-schneidende Zeilen als `candidate`/`visible-partial`; weder vollstaendige Feature-Inventarisierung noch Verfuegbarkeit wird behauptet.
- `UAM-DE`, `UAS-DE`, `UAD-DE`, `UAP-DE` und `UAC-CONS` wurden im zugaenglichen Mandanten-Pane nicht beobachtet. Das ist keine Nichtexistenzaussage.
- `unknown`: Company Experience, weil kein eindeutiges sichtbares Feld vorhanden war. `DE` allein gilt nicht als Vollnachweis der installierten deutschen Lokalisierung.
- Kein Environment-/Company-Switch und kein BC-Write wurden ausgefuehrt; beide Manifeste tragen `companySwitchPerformed: false` und `writesPerformed: false`.

## Nicht ausgefuehrte Nachweise

- Kein menschlicher Fachreview und keine menschliche Freigabe; stattdessen ein ausdruecklich autorisiertes automatisiertes Policy-Gate.
- Keine BC-Konfiguration, kein Write, kein Company-/Environment-Switch, kein Admin Center und keine API.
- Keine Abweichung zwischen `proposedCanonicalUpdate` und kanonischer `actualSandboxBaseline`; Gleichheit wird automatisiert erzwungen.
- Keine vollstaendige Extension-, App- oder Feature-Inventarisierung.

## Review und Freigabe

Status zum Abschlussreview: technisch ausgefuehrt und archive-ready. `UABC-VER-ENV-POLICY-GATE-001` ist automatisiert bestanden und die kanonische Baseline semantisch identisch synchronisiert. Keine menschliche Freigabe und kein BC-Write; Archiv- und Commitstatus ergeben sich ausschliesslich aus dem Repositoryzustand, nicht aus dieser Textaussage.
